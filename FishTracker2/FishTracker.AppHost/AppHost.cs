var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.Fish_Api>("api")
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("/health/ready");

var reactClient = builder.AddViteApp("react-client", "../FishTracker.Client")
    .WithExternalHttpEndpoints()
    .WithReference(apiService)
    .WithEnvironment("VITE_API_BASE_URL", apiService.GetEndpoint("https"))
    .WaitFor(apiService);

apiService.WithEnvironment("Cors__AllowedOrigins__0", reactClient.GetEndpoint("http"));

builder.Build().Run();
