#!/usr/bin/env bash

startTime=$(date +%s)

currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir=$(dirname "${currentDir}")
. "${currentDir}/common.sh"

info "Composing your Apso environment"
info "[See ReadMe for information on how to customize this process]"

requireCompose

run COMPOSE_FILE="${currentDir}/compose/docker-compose.yml" ${COMPOSE_CMD} down