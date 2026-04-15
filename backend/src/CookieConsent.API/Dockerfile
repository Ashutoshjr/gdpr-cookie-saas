# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files (layer cache: only restore when .csproj changes)
COPY ["src/CookieConsent.API/CookieConsent.API.csproj",            "src/CookieConsent.API/"]
COPY ["src/CookieConsent.Application/CookieConsent.Application.csproj",  "src/CookieConsent.Application/"]
COPY ["src/CookieConsent.Infrastructure/CookieConsent.Infrastructure.csproj", "src/CookieConsent.Infrastructure/"]
COPY ["src/CookieConsent.Domain/CookieConsent.Domain.csproj",      "src/CookieConsent.Domain/"]

RUN dotnet restore "src/CookieConsent.API/CookieConsent.API.csproj"

# Copy all source code
COPY . .

RUN dotnet build "src/CookieConsent.API/CookieConsent.API.csproj" -c Release -o /app/build

# ── Stage 2: Publish ───────────────────────────────────────────────────────────
FROM build AS publish
RUN dotnet publish "src/CookieConsent.API/CookieConsent.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ── Stage 3: Runtime ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

# Create logs directory
RUN mkdir -p /app/logs

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "CookieConsent.API.dll"]
