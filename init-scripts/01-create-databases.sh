#!/bin/bash
set -e

if [ -z "$POSTGRES_AUTH_DB" ] || [ -z "$POSTGRES_DEVICE_DB" ]; then
    echo "Error: Database environment variables are not set!"
    exit 1
fi

echo "Creating databases..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "${POSTGRES_AUTH_DB}";
    GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_AUTH_DB}" TO "$POSTGRES_USER";

    CREATE DATABASE "${POSTGRES_DEVICE_DB}";
    GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DEVICE_DB}" TO "$POSTGRES_USER";
EOSQL
