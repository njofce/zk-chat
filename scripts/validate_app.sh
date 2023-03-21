#!/bin/bash

docker ps | grep docker-entrypoint
[ $? -eq 0 ] || exit 1

exit 0
