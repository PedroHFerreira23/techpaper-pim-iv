FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY api/TechPaperAPI.csproj api/
RUN dotnet restore api/TechPaperAPI.csproj
COPY api/ api/
COPY database/ database/
RUN dotnet publish api/TechPaperAPI.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet TechPaperAPI.dll"]
