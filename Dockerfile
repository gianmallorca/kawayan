# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS frontend
WORKDIR /frontend
COPY src/kawayan.Web/package.json src/kawayan.Web/package-lock.json ./
RUN npm ci
COPY src/kawayan.Web/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY kawayan.sln ./
COPY src/kawayan.API/kawayan.API.csproj src/kawayan.API/
RUN dotnet restore src/kawayan.API/kawayan.API.csproj
COPY src/kawayan.API/ src/kawayan.API/
COPY src/kawayan.Web/ src/kawayan.Web/
WORKDIR /src/src/kawayan.API
RUN dotnet publish -c Release -o /app/publish -p:SkipSpaBuild=true
COPY --from=frontend /frontend/dist /app/publish/wwwroot/
RUN mkdir -p /app/publish/wwwroot/uploads

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["/app/docker-entrypoint.sh"]
