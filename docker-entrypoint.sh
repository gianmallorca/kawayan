#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "[kawayan] DATABASE_URL is set"
elif [ -n "$ConnectionStrings__DefaultConnection" ]; then
  echo "[kawayan] ConnectionStrings__DefaultConnection is set"
elif [ -n "$PGHOST" ]; then
  echo "[kawayan] PGHOST is set"
else
  echo "[kawayan] ERROR: no database env vars on this service."
  echo "[kawayan] Add DATABASE_URL on the kawayan service (not Postgres), then redeploy."
fi

exec dotnet kawayan.API.dll
