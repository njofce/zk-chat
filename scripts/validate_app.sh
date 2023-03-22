#!/bin/bash

containers_running=$(docker ps --format "{{.Status}}" | grep -ci up)
[ $containers_running -eq 4 ] || exit 1

exposed_ports=$(netstat -lnt4 | egrep -cw '3000|8080|8081')
[ $exposed_ports -eq 3 ] || exit 1

exit 0
