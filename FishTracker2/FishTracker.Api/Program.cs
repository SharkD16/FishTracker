using FishTracker.Domain;
using FishTracker.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var connectionString = builder.Configuration.GetConnectionString("FishTracker")
    ?? throw new InvalidOperationException("Connection string 'FishTracker' was not found.");

builder.Services.AddDbContext<FishTrackerDbContext>(options =>
    options.UseSqlite(connectionString));

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FishTrackerDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//defines the http response to a http request for the status of the database, meaning if the database is available and can be reached
app.MapGet("/api/status", async (FishTrackerDbContext dbContext, CancellationToken cancellationToken) =>
{
    var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken); //await wont continue the code block until this line is complete

    return Results.Ok(new
    {
        status = "ok",
        database = "SQLite",
        canConnect
    });
});

//http response to http request of the list of users. returns the users sorted via username, 
app.MapGet("/api/users", async (FishTrackerDbContext dbContext, CancellationToken cancellationToken) =>
{
    var users = await dbContext.Users
        .AsNoTracking() //tells efcore that you are only reading the data
        .OrderBy(user => user.Username)
        .Select(user => new UserResponse(user.UserId, user.Username, user.Email)) //turns each user into a UserResponse object that contains only userid, username, email
        .ToListAsync(cancellationToken); //executes query asynchronously and returns as a list

    return Results.Ok(users);
});

//creates a new user in the database after checking for any username or email errors
app.MapPost("/api/users", async (
    CreateUserRequest request, //contains data to make request to make a user entry
    FishTrackerDbContext dbContext,
    CancellationToken cancellationToken) =>
{
    var errors = new Dictionary<string, string[]>(); //stores validation errors outlined below
    var username = request.Username?.Trim(); // ?. means run trim if not null, else return null 
    var email = request.Email?.Trim().ToLowerInvariant();

    if (string.IsNullOrWhiteSpace(username))
    {
        errors[nameof(request.Username)] = ["Username is required."];
    }

    if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
    {
        errors[nameof(request.Email)] = ["A valid email address is required."];
    }

    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var emailInUse = await dbContext.Users
        .AnyAsync(user => user.Email == email, cancellationToken);

    if (emailInUse)
    {
        return Results.Conflict(new { message = "That email address is already in use." });
    }

    var user = new User
    {
        Username = username!,
        Email = email!
    };

    dbContext.Users.Add(user);
    await dbContext.SaveChangesAsync(cancellationToken);

    return Results.Created($"/api/users/{user.UserId}", new UserResponse(user.UserId, user.Username, user.Email));
});

//returns list of caught fish from newest to oldest
app.MapGet("/api/fish", async (FishTrackerDbContext dbContext, CancellationToken cancellationToken) =>
{
    var fish = await dbContext.Fish
        .AsNoTracking()
        .OrderByDescending(catchRecord => catchRecord.FishId)
        .Select(catchRecord => new FishResponse(
            catchRecord.FishId,
            catchRecord.UserId,
            catchRecord.User.Username,
            catchRecord.Weight,
            catchRecord.Length,
            catchRecord.Species))
        .ToListAsync(cancellationToken);

    return Results.Ok(fish);
});

//handles adding new fish to database
app.MapPost("/api/fish", async (
    CreateFishRequest request, //contains data for the request to make a fish entry
    FishTrackerDbContext dbContext,
    CancellationToken cancellationToken) =>
{
    var errors = new Dictionary<string, string[]>();

    if (request.UserId <= 0)
    {
        errors[nameof(request.UserId)] = ["A valid user ID is required."];
    }

    if (request.Weight <= 0)
    {
        errors[nameof(request.Weight)] = ["Weight must be greater than zero."];
    }

    if (request.Length <= 0)
    {
        errors[nameof(request.Length)] = ["Length must be greater than zero."];
    }

    if (!Enum.IsDefined(request.Species))
    {
        errors[nameof(request.Species)] = ["A valid fish species is required."];
    }

    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var user = await dbContext.Users
        .SingleOrDefaultAsync(existingUser => existingUser.UserId == request.UserId, cancellationToken); //retrieves exactly one item from the database, but if there is no matching, returns the default value null

    if (user is null)
    {
        return Results.NotFound(new { message = $"User {request.UserId} was not found." });
    }

    var fish = new Fish
    {
        UserId = user.UserId,
        Weight = request.Weight,
        Length = request.Length,
        Species = request.Species
    };

    dbContext.Fish.Add(fish);
    await dbContext.SaveChangesAsync(cancellationToken);

    return Results.Created($"/api/fish/{fish.FishId}", new FishResponse(
        fish.FishId,
        user.UserId,
        user.Username,
        fish.Weight,
        fish.Length,
        fish.Species));
});


app.MapGet("/api/gear", async (FishTrackerDbContext dbContext, CancellationToken cancellationToken) =>
{
    var gear = await dbContext.Gear
    .AsNoTracking()
    .OrderByDescending(gearRecord => gearRecord.GearId)
    .Select(gearRecord => new GearResponse (
        gearRecord.GearId,
        gearRecord.UserId,
        gearRecord.User.Username,
        gearRecord.FishingRod,
        gearRecord.Lure))
    .ToListAsync(cancellationToken);
    
    return Results.Ok(gear);
});



app.MapDefaultEndpoints(); //makes default endpoints for aspire

app.Run();

record CreateFishRequest(int UserId, decimal Weight, decimal Length, Species Species);

record FishResponse(int FishId, int UserId, string Username, decimal Weight, decimal Length, Species Species);

record CreateUserRequest(string? Username, string? Email);

record UserResponse(int UserId, string Username, string Email);

record CreateGearRequest(int UserId, string FishingRod, string Lure);

record GearResponse(int GearId, int UserId, string Username, string FishingRod, string Lure);

