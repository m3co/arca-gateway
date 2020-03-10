#!/bin/bash

docker network create arca-gateway
docker build -t arca-gateway-go-test -f ./arca-go-test/arca-go.Dockerfile .

docker run -it --name arca-gateway-go-test --rm --net arca-gateway -p 22345:22345 arca-gateway-go-test