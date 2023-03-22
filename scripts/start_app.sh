#!/bin/bash
set -e

cd ~/zk-chat-client-server
docker compose -f docker-compose-aws.yaml up -d

exit 0
