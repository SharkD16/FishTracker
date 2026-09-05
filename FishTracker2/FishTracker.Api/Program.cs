using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FishTracker.Domain;
using FishTracker.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
    ?? throw new InvalidOperationException("JWT configuration is required.");
if (string.IsNullOrWhiteSpace(jwt.SigningKey) || jwt.SigningKey.Length < 32 || string.IsNullOrWhiteSpace(jwt.Issuer) || string.IsNullOrWhiteSpace(jwt.Audience))
    throw new InvalidOperationException("Jwt:SigningKey (at least 32 characters), Jwt:Issuer, and Jwt:Audience must be configured.");
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    o.TokenValidationParameters = new()
    {
        ValidateIssuerSigningKey = true, IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
        ValidateIssuer = true, ValidIssuer = jwt.Issuer, ValidateAudience = true, ValidAudience = jwt.Audience,
        ValidateLifetime = true, ClockSkew = TimeSpan.FromSeconds(30), NameClaimType = ClaimTypes.Name
    };
});
builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy("react-client", p =>
{
    if (allowedOrigins.Length > 0) p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    else p.SetIsOriginAllowed(_ => false);
}));
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    var authLimit = builder.Configuration.GetValue("RateLimiting:AuthPermitLimit", 5);
    var apiLimit = builder.Configuration.GetValue("RateLimiting:ApiPermitLimit", 120);
    o.AddPolicy("auth", c => RateLimitPartition.GetFixedWindowLimiter(c.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new() { PermitLimit = authLimit, Window = TimeSpan.FromMinutes(15), QueueLimit = 0 }));
    o.AddPolicy("api", c => RateLimitPartition.GetFixedWindowLimiter(c.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? c.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new() { PermitLimit = apiLimit, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

var connectionString = builder.Configuration.GetConnectionString("FishTracker") ?? throw new InvalidOperationException("Connection string 'FishTracker' was not found.");
builder.Services.AddDbContext<FishTrackerDbContext>(o => o.UseSqlite(connectionString));
builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("database");
builder.Services.AddOpenApi();
var app = builder.Build();
if (app.Configuration.GetValue("Database:ApplyMigrationsOnStartup", false))
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<FishTrackerDbContext>().Database.MigrateAsync();
}
app.UseExceptionHandler();
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "no-referrer");
    context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    await next();
});
app.UseCors("react-client");
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
if (app.Environment.IsDevelopment()) { app.MapOpenApi(); app.MapScalarApiReference(); }
app.MapHealthChecks("/health/live", new() { Predicate = c => c.Tags.Contains("live") });
app.MapHealthChecks("/health/ready");
app.MapGet("/api/status", async (FishTrackerDbContext db, CancellationToken ct) => await db.Database.CanConnectAsync(ct) ? Results.Ok(new { status = "ok" }) : Results.Problem(statusCode: 503)).RequireRateLimiting("api");

var auth = app.MapGroup("/api").RequireRateLimiting("auth");
auth.MapPost("/users", RegisterAsync);
auth.MapPost("/auth/login", LoginAsync);
var privateApi = app.MapGroup("/api").RequireAuthorization().RequireRateLimiting("api");
privateApi.MapGet("/users/me", GetCurrentUserAsync);
privateApi.MapDelete("/users/me", DeleteCurrentUserAsync);
privateApi.MapGet("/fish", GetFishAsync);
privateApi.MapPost("/fish", CreateFishAsync);
privateApi.MapDelete("/fish/{fishId:int}", DeleteFishAsync);
privateApi.MapGet("/gear", GetGearAsync);
privateApi.MapPost("/gear", CreateGearAsync);
app.Run();

static async Task<IResult> RegisterAsync(RegisterRequest request, FishTrackerDbContext db, IPasswordHasher<User> hasher, CancellationToken ct)
{
    var errors = ValidateRegistration(request, out var username, out var email);
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    if (await db.Users.AnyAsync(u => u.Email == email, ct)) return Results.Conflict(new { message = "An account with that email already exists." });
    var user = new User { Username = username!, Email = email!, PasswordHash = string.Empty };
    user.PasswordHash = hasher.HashPassword(user, request.Password!);
    db.Users.Add(user); await db.SaveChangesAsync(ct);
    return Results.Created("/api/users/me", new UserResponse(user.UserId, user.Username, user.Email));
}

static async Task<IResult> LoginAsync(LoginRequest request, FishTrackerDbContext db, IPasswordHasher<User> hasher, IOptions<JwtOptions> options, CancellationToken ct)
{
    var email = request.Email?.Trim().ToLowerInvariant();
    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password)) return Results.ValidationProblem(new Dictionary<string, string[]> { ["credentials"] = ["Email and password are required."] });
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email, ct);
    if (user is null || string.IsNullOrEmpty(user.PasswordHash) || hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed) return Results.Unauthorized();
    var jwt = options.Value; var expires = DateTimeOffset.UtcNow.AddMinutes(jwt.ExpirationMinutes);
    var token = new JwtSecurityToken(jwt.Issuer, jwt.Audience, [new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), new Claim(ClaimTypes.Name, user.Username)], DateTime.UtcNow, expires.UtcDateTime, new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)), SecurityAlgorithms.HmacSha256));
    return Results.Ok(new LoginResponse(new JwtSecurityTokenHandler().WriteToken(token), expires));
}

static async Task<IResult> GetCurrentUserAsync(ClaimsPrincipal principal, FishTrackerDbContext db, CancellationToken ct)
{
    var id = GetUserId(principal); if (id is null) return Results.Unauthorized();
    var user = await db.Users.AsNoTracking().SingleOrDefaultAsync(u => u.UserId == id, ct);
    return user is null ? Results.Unauthorized() : Results.Ok(new UserResponse(user.UserId, user.Username, user.Email));
}

static async Task<IResult> DeleteCurrentUserAsync(ClaimsPrincipal principal, FishTrackerDbContext db, ILoggerFactory loggers, CancellationToken ct)
{
    var id = GetUserId(principal); if (id is null) return Results.Unauthorized();
    var user = await db.Users.SingleOrDefaultAsync(u => u.UserId == id, ct); if (user is null) return Results.Unauthorized();
    await using var tx = await db.Database.BeginTransactionAsync(ct);
    db.Users.Remove(user); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
    loggers.CreateLogger("AccountDeletion").LogInformation("Deleted account {UserId} and its owned records.", id);
    return Results.NoContent();
}

static async Task<IResult> GetFishAsync(ClaimsPrincipal principal, FishTrackerDbContext db, CancellationToken ct)
{
    var id = GetUserId(principal); if (id is null) return Results.Unauthorized();
    if (!await UserExistsAsync(id.Value, db, ct)) return Results.Unauthorized();
    return Results.Ok(await db.Fish.AsNoTracking().Where(f => f.UserId == id).OrderByDescending(f => f.FishId).Select(f => new FishResponse(f.FishId, f.Weight, f.Length, f.Species)).ToListAsync(ct));
}

static async Task<IResult> CreateFishAsync(CreateFishRequest request, ClaimsPrincipal principal, FishTrackerDbContext db, CancellationToken ct)
{
    var id = GetUserId(principal); if (id is null) return Results.Unauthorized();
    if (!await UserExistsAsync(id.Value, db, ct)) return Results.Unauthorized();
    var errors = new Dictionary<string, string[]>();
    if (request.Weight is <= 0 or > 5000) errors[nameof(request.Weight)] = ["Weight must be greater than zero and no more than 5000."];
    if (request.Length is <= 0 or > 1000) errors[nameof(request.Length)] = ["Length must be greater than zero and no more than 1000."];
    if (!Enum.IsDefined(request.Species)) errors[nameof(request.Species)] = ["A valid fish species is required."];
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var fish = new Fish { UserId = id.Value, Weight = request.Weight, Length = request.Length, Species = request.Species }; db.Fish.Add(fish); await db.SaveChangesAsync(ct);
    return Results.Created($"/api/fish/{fish.FishId}", new FishResponse(fish.FishId, fish.Weight, fish.Length, fish.Species));
}

static async Task<IResult> DeleteFishAsync(int fishId, ClaimsPrincipal principal, FishTrackerDbContext db, CancellationToken ct)
{
    var id = GetUserId(principal); if (id is null) return Results.Unauthorized();
    if (!await UserExistsAsync(id.Value, db, ct)) return Results.Unauthorized();
    if (fishId <= 0) return Results.NotFound();
    return await db.Fish.Where(f => f.FishId == fishId && f.UserId == id).ExecuteDeleteAsync(ct) == 0 ? Results.NotFound() : Results.NoContent();
}

static async Task<IResult> GetGearAsync(ClaimsPrincipal principal, FishTrackerDbContext db, CancellationToken ct)
{
    var id = GetUserId(principal); if (id is null) return Results.Unauthorized();
    if (!await UserExistsAsync(id.Value, db, ct)) return Results.Unauthorized();
    return Results.Ok(await db.Gear.AsNoTracking().Where(g => g.UserId == id).OrderByDescending(g => g.GearId).Select(g => new GearResponse(g.GearId, g.FishingRod, g.Lure)).ToListAsync(ct));
}

static async Task<IResult> CreateGearAsync(CreateGearRequest request, ClaimsPrincipal principal, FishTrackerDbContext db, CancellationToken ct)
{
    var id = GetUserId(principal); if (id is null) return Results.Unauthorized(); var rod = request.FishingRod?.Trim(); var lure = request.Lure?.Trim(); var errors = new Dictionary<string, string[]>();
    if (!await UserExistsAsync(id.Value, db, ct)) return Results.Unauthorized();
    if (string.IsNullOrWhiteSpace(rod) || rod.Length > 150) errors[nameof(request.FishingRod)] = ["Fishing rod is required and must be 150 characters or fewer."];
    if (string.IsNullOrWhiteSpace(lure) || lure.Length > 150) errors[nameof(request.Lure)] = ["Lure is required and must be 150 characters or fewer."];
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var gear = new Gear { UserId = id.Value, FishingRod = rod!, Lure = lure! }; db.Gear.Add(gear); await db.SaveChangesAsync(ct);
    return Results.Created($"/api/gear/{gear.GearId}", new GearResponse(gear.GearId, gear.FishingRod, gear.Lure));
}

static Dictionary<string, string[]> ValidateRegistration(RegisterRequest request, out string? username, out string? email)
{
    username = request.Username?.Trim(); email = request.Email?.Trim().ToLowerInvariant(); var errors = new Dictionary<string, string[]>();
    if (string.IsNullOrWhiteSpace(username) || username.Length is < 3 or > 100) errors[nameof(request.Username)] = ["Username must be between 3 and 100 characters."];
    if (string.IsNullOrWhiteSpace(email) || email.Length > 256 || !System.Net.Mail.MailAddress.TryCreate(email, out _)) errors[nameof(request.Email)] = ["A valid email address is required."];
    if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length is < 12 or > 128) errors[nameof(request.Password)] = ["Password must be between 12 and 128 characters."];
    return errors;
}

static int? GetUserId(ClaimsPrincipal p) => int.TryParse(p.FindFirstValue(ClaimTypes.NameIdentifier), out var id) && id > 0 ? id : null;
static Task<bool> UserExistsAsync(int userId, FishTrackerDbContext db, CancellationToken ct) => db.Users.AnyAsync(user => user.UserId == userId, ct);
public partial class Program;
public sealed class JwtOptions { public required string SigningKey { get; init; } public required string Issuer { get; init; } public required string Audience { get; init; } public int ExpirationMinutes { get; init; } = 60; }
public sealed record RegisterRequest(string? Username, string? Email, string? Password);
public sealed record LoginRequest(string? Email, string? Password);
public sealed record LoginResponse(string AccessToken, DateTimeOffset ExpiresAt);
public sealed record CreateFishRequest(decimal Weight, decimal Length, Species Species);
public sealed record FishResponse(int FishId, decimal Weight, decimal Length, Species Species);
public sealed record UserResponse(int UserId, string Username, string Email);
public sealed record CreateGearRequest(string? FishingRod, string? Lure);
public sealed record GearResponse(int GearId, string FishingRod, string Lure);

public sealed class DatabaseHealthCheck(FishTrackerDbContext db) : Microsoft.Extensions.Diagnostics.HealthChecks.IHealthCheck
{
    public async Task<Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult> CheckHealthAsync(Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckContext context, CancellationToken cancellationToken = default) =>
        await db.Database.CanConnectAsync(cancellationToken)
            ? Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy()
            : Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("Database connection failed.");
}
