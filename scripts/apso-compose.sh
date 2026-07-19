#!/usr/bin/env bash
startTime=$(date +%s)

currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir=$(dirname "${currentDir}")
. "${currentDir}/common.sh"

set -o allexport
source "${rootDir}/.env" set
+o allexport

info "Composing your Apso environment"
info "[See ReadMe for information on how to customize this process]"

requireCompose

info "DATABASE_PORT=${DATABASE_PORT}:5432"
run COMPOSE_FILE="${currentDir}/compose/docker-compose.yml" DATABASE_PORT="${DATABASE_PORT}:5432" \
    ${COMPOSE_CMD} \
    up \
    --detach \
    --remove-orphans \
    --build