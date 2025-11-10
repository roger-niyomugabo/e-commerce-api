#!/bin/bash
# Entrypoint for the postgreSQL database that creates a test database for the tests
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE fimbo_test_database;
	GRANT ALL PRIVILEGES ON DATABASE fimbo_test_database TO fimbo_user;
	\connect fimbo_test_database;
EOSQL