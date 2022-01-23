#!/bin/bash

docker image rm njofce/rln-chat-server -f
docker image rm njofce/rln-chat-client -f

sudo chmod -R +rwx mongo-db/

docker build -f Dockerfile_api -t njofce/rln-chat-server .
docker build -f Dockerfile_client -t njofce/rln-chat-client .

docker-compose -f docker-compose-prod.yaml up -d
