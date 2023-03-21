#!/bin/bash

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 490752553772.dkr.ecr.eu-central-1.amazonaws.com

docker build -f Dockerfile_api -t zk-chat-api .
docker tag zk-chat-api:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/zk-chat-api:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/zk-chat-api:latest

docker build -f Dockerfile_client -t zk-chat-client .
docker tag zk-chat-client:latest 490752553772.dkr.ecr.eu-central-1.amazonaws.com/zk-chat-client:latest
docker push 490752553772.dkr.ecr.eu-central-1.amazonaws.com/zk-chat-client:latest

exit 0
