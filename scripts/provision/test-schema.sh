#!/usr/bin/env bash

startTime=$(date +%s)

currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir=$(dirname "${currentDir}")
. "${currentDir}/../common.sh"
. "${currentDir}/db.sh"

info "DATABASE=${DATABASE_NAME}"
info "SCHEMA=${DATABASE_SCHEMA}_test"
info "USER=${DATABASE_USERNAME}"
info "PASSWORD=${DATABASE_PASSWORD}"
info "HOSTNAME=${DATABASE_HOST}"
info "PORT=${DATABASE_PORT}"

DATABASE=$DATABASE_NAME
SCHEMA="${DATABASE_SCHEMA}_test"
USER=$DATABASE_USERNAME
PASSWORD=$DATABASE_PASSWORD

HOSTNAME=$DATABASE_HOST
PORT=$DATABASE_PORT
ROOT_USERNAME="root"
ROOT_PASSWORD="root"
ROOT_DATABASE="postgres"


info "SET DATABASE ${DATABASE}"

# Do not reuse createDatabaseSchema here — that path can drop `public` and
# wipe the primary schema when DATABASE_SCHEMA=public.
createDatabaseUser $USER $PASSWORD $DATABASE $HOSTNAME $PORT $ROOT_USERNAME $ROOT_PASSWORD $ROOT_DATABASE
createAdditionalSchema $USER $DATABASE $SCHEMA