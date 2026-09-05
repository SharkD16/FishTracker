# FishTracker API

## Security model

Only `POST /api/users`, `POST /api/auth/login`, `/health/live`, `/health/ready`, and the limited status probe are anonymous. All fish, gear, and account endpoints require a Bearer JWT. The API derives the account ID from the JWT `sub` claim and never accepts a client-supplied ownership ID. A missing owned resource returns `404`, preventing ownership disclosure.

Passwords are stored with ASP.NET Core Identity's PBKDF2 password hasher. JWT signing keys are configuration-only and must be at least 32 characters. Use the placeholders in `FishTracker.Api/.env.example`; never commit a populated `.env` file.

Rate limits: login/registration are limited to 5 requests per source IP per 15 minutes; authenticated API requests are limited to 120 requests per user (or IP before authentication) per minute. Both return `429` when exhausted.

## Local setup

Set the following user secrets before starting the API:

```powershell
dotnet user-secrets set "Jwt:SigningKey" "a-random-secret-at-least-32-characters-long" --project FishTracker.Api
dotnet user-secrets set "Jwt:Issuer" "FishTracker" --project FishTracker.Api
dotnet user-secrets set "Jwt:Audience" "FishTrackerClient" --project FishTracker.Api
dotnet run --project FishTracker.Api
```

Development applies EF migrations automatically. Production deliberately does not. Apply them during deployment with `dotnet ef database update --project FishTracker.Infrastructure --startup-project FishTracker.Api`, after setting the production connection string and JWT environment variables. The migration adds `Users.PasswordHash`; existing pre-authentication accounts have an empty hash and must be reset/recreated because plaintext passwords were never available.

## Verification

```powershell
dotnet test FishTracker.Tests/FishTracker.Tests.csproj --collect:"XPlat Code Coverage"
```

The tests use a unique temporary SQLite database and cover authentication, validation, user isolation, fish deletion, and account cascade deletion.

## Production checklist

Use HTTPS behind a trusted reverse proxy, provide `Cors__AllowedOrigins__0` for the deployed frontend, set a durable database path/managed database, inject secrets through the deployment secret store, run migrations as a release step, and probe `/health/ready`. The app enables HSTS outside development and emits standard anti-sniffing, framing, referrer, and permissions-policy headers.
