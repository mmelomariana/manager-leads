FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln .
COPY ./Api/*.csproj ./Api/
COPY ./Application/*.csproj ./Application/
COPY ./Domain/*.csproj ./Domain/
COPY ./Infrastructure/*.csproj ./Infrastructure/
COPY ./Tests.Unit/*.csproj ./Tests.Unit/

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . .

# Build and publish
WORKDIR /src/Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Create directory for SQLite database
RUN mkdir -p /app/Data

EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]