using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Xunit;

namespace FishTracker.Tests;

public sealed class ApiSecurityTests : IClassFixture<FishTrackerFactory>
{
    private readonly FishTrackerFactory _factory;
    public ApiSecurityTests(FishTrackerFactory factory) => _factory = factory;

    [Fact]
    public async Task Protected_endpoints_reject_missing_or_malformed_credentials()
    {
        using var client = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/fish")).StatusCode);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not-a-token");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/gear")).StatusCode);
    }

    [Fact]
    public async Task Registration_hashes_password_and_login_returns_a_token()
    {
        using var client = _factory.CreateClient();
        var user = await RegisterAndLogin(client, "angler1", "angler1@example.test");
        Assert.False(string.IsNullOrWhiteSpace(user.Token));
        var me = await client.GetAsync("/api/users/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.DoesNotContain("Password", await me.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Users_are_isolated_and_cannot_delete_another_users_fish()
    {
        using var first = _factory.CreateClient();
        using var second = _factory.CreateClient();
        await RegisterAndLogin(first, "angler2", "angler2@example.test");
        var fish = await CreateFish(first);
        await RegisterAndLogin(second, "angler3", "angler3@example.test");
        Assert.Equal(HttpStatusCode.NotFound, (await second.DeleteAsync($"/api/fish/{fish.FishId}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await first.GetAsync("/api/fish")).StatusCode);
        Assert.Contains(fish.FishId.ToString(), await (await first.GetAsync("/api/fish")).Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task User_can_delete_own_fish()
    {
        using var client = _factory.CreateClient();
        await RegisterAndLogin(client, "angler4", "angler4@example.test");
        var fish = await CreateFish(client);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/fish/{fish.FishId}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/fish/{fish.FishId}")).StatusCode);
    }

    [Fact]
    public async Task Deleting_current_account_cascades_owned_data_and_invalidates_access()
    {
        using var client = _factory.CreateClient();
        var account = await RegisterAndLogin(client, "angler5", "angler5@example.test");
        await CreateFish(client);
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/users/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/fish")).StatusCode);
        using var loginClient = _factory.CreateClient();
        var login = await loginClient.PostAsJsonAsync("/api/auth/login", new { email = account.Email, password = "SecurePassword123!" });
        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
    }

    [Fact]
    public async Task Validation_and_invalid_credentials_fail_without_sensitive_detail()
    {
        using var client = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/users", new { username = "x", email = "not-email", password = "short" })).StatusCode);
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email = "unknown@example.test", password = "SecurePassword123!" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.DoesNotContain("unknown@example.test", await response.Content.ReadAsStringAsync());
    }

    private static async Task<(string Token, string Email)> RegisterAndLogin(HttpClient client, string username, string email)
    {
        var registration = await client.PostAsJsonAsync("/api/users", new { username, email, password = "SecurePassword123!" });
        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);
        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "SecurePassword123!" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var token = (await login.Content.ReadFromJsonAsync<LoginResult>())!.AccessToken;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return (token, email);
    }

    private static async Task<FishResult> CreateFish(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/fish", new { weight = 2.5m, length = 18m, species = "Trout" });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<FishResult>())!;
    }

    private sealed record LoginResult(string AccessToken);
    private sealed record FishResult(int FishId);
}

public sealed class FishTrackerFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"fishtracker-{Guid.NewGuid():N}.db");
    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureLogging(logging => logging.ClearProviders());
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:FishTracker", $"Data Source={_databasePath}");
        builder.UseSetting("Jwt:SigningKey", "test-signing-key-with-at-least-32-characters-12345");
        builder.UseSetting("Jwt:Issuer", "FishTracker.Tests");
        builder.UseSetting("Jwt:Audience", "FishTracker.Tests");
        builder.UseSetting("Database:ApplyMigrationsOnStartup", "true");
        builder.UseSetting("RateLimiting:AuthPermitLimit", "100");
    }
    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            try { if (File.Exists(_databasePath)) File.Delete(_databasePath); }
            catch (IOException) { /* the OS will clean the isolated temporary test database */ }
        }
    }
}
