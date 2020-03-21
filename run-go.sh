#!/bin/bash

docker network create arca-gateway
docker build -t arca-gateway-go-test -f ./arca-go-test/arca-go.Dockerfile .

docker run -d --name arca-gateway-go-test --rm -p 22347:22347 -p 22346:22346 -p 22345:22345 --net arca-gateway arca-gateway-go-test
