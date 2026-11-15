#!/bin/bash
set -e

echo "Restoring dump into ${POSTGRES_DEVICE_DB} from external seed folder..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DEVICE_DB" -f /opt/seed/device_profiles_seed.sql
