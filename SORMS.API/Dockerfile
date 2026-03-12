# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["SORMS.API.csproj", "./"]
RUN dotnet restore "SORMS.API.csproj"

COPY . .
RUN dotnet publish "SORMS.API.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render injects PORT env var — use shell form so $PORT is expanded at runtime
CMD ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet SORMS.API.dll
