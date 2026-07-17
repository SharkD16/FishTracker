var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.Fish_Api>("api")
    .WithHttpHealthCheck("/health");

builder.AddProject<Projects.Fish_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("/health")
    .WithReference(apiService)
    .WaitFor(apiService);

builder.Build().Run();
