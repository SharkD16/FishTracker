FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore FishTracker.Api/Fish.Api.csproj --configfile NuGet.Config
RUN dotnet publish FishTracker.Api/Fish.Api.csproj -c Release -o /out --no-restore
FROM runtime AS final
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "Fish.Api.dll"]
