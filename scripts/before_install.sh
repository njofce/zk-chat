#!/bin/bash
set -e

docker image prune --filter "until=72h" -f

exit 0
