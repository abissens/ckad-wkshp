### Docker manipulations

```shell
# Building docker image
docker build -t friends-service:0.1.0  ./deployment/friends-1/

# Listing built and local docker images
docker images
# locally save and load images 
docker save -o friends-service1.tar friends-service:0.1.0
docker load --input friends-service1.tar
# Tag an image
docker tag friends-service:0.1.0 friends/friends-service:latest
docker images 
# > REPOSITORY                  TAG      IMAGE ID       CREATED         SIZE
# > friends-service             0.1.0    f110d5c7c5f5   15 hours ago    207MB
# > friends/friends-service     latest   f110d5c7c5f5   15 hours ago    207MB

# push an image 
docker login registry.example.com
docker tag friends-service:0.1.0 registry.example.com/friends-service:latest
docker push registry.example.com/friends-service:latest
# remove an image 
docker rmi friends/friends-service:latest
# pull an image from distant registry 
docker pull alpine:3.18.2 # or docker pull docker.io/library/alpine:3.18.2
# > 3.18.2: Pulling from library/alpine
# > docker.io/library/alpine:3.18.2

# Running container 
docker run -d -p 8000:8000 friends-service:0.1.0 
# > 4f817e1b16d559b0db10a1e...
docker ps | grep friends 
# 4f817e1b16d5   friends-service:0.1.0        "/tini -- docker-ent???"   22 seconds ago   Up 21 seconds   0.0.0.0:8000->8000/tcp, :::8000->8000/tcp   dreamy_kalam
# Exec in bash shell
curl -L localhost:8000
# {"apiVersion":"1","quote":{"character":"Joey Tribbiani","quote":"You can't just give up! Is that what a dinosaur would do?"}}

# Get container logs
docker logs 4f817e1b16d559b0db10a1e
# Listening on http://localhost:8000/
# [2024-01-21T13:48:57.608Z] GET http://localhost:8000/

# Exec command into container 
docker exec 4f817e1b16d559b0db10a1e cat /app/index.ts
# Connect to container shell
docker exec -it 4f817e1b16d559b0db10a1e bash

docker kill 4f817e1b16d559b0db10a1e

```

### Image management

```shell
docker build -t friends-oak:0.1.0  ./deployment/friends-oak/
docker run -d -p 8000:8000 friends-oak:0.1.0

docker logs -f $(docker ps --filter "ancestor=friends-oak:0.1.0" -q)  
# Exec in bash shell
curl -L localhost:8000
curl -L localhost:8000/health
# in log shell :
# Download https://deno.land/x/oak@v12.6.2/mod.ts
# Downfload https://deno.land/x/oak@v12.6.2/application.ts
# Download https://deno.land/x/oak@v12.6.2/context.ts
# Download https://deno.land/x/oak@v12.6.2/helpers.ts
# ...
# GET http://localhost:8000/ - 1ms
# GET http://localhost:8000/health - 1ms

# Build multi-stage caching image 
docker build -t friends-oak-prod:0.1.0 -f ./deployment/friends-oak/Dockerfile-prod  ./deployment/friends-oak/
# dependencies are downloaded and cached from builder 
# Note :  when built again and if dependencies unchanged we get cached layers : 
docker build -t friends-oak-prod:0.1.0 -f ./deployment/friends-oak/Dockerfile-prod  ./deployment/friends-oak/
#  => [stage-1 1/4] FROM docker.io/denoland/deno:alpine-1.39.4@sha256:a4779f730b919c967f8f54e96e7688be017179acc4d825917b4d89e1ec3d1022                                                 0.0s
#  => CACHED [stage-1 2/4] WORKDIR /app                                                                                                                                                0.0s
#  => CACHED [builder 2/6] WORKDIR /app                                                                                                                                                0.0s
#  => CACHED [builder 3/6] COPY /src/deps.ts .                                                                                                                                         0.0s 
#  => CACHED [builder 4/6] RUN deno cache deps.ts                                                                                                                                      0.0s
#  => CACHED [builder 5/6] COPY /src .                                                                                                                                                 0.0s 
#  => CACHED [builder 6/6] RUN deno cache index.ts    
docker images | grep friends 
# friends-oak-prod                                    0.1.0                  023c3fe4183f   57 seconds ago   152MB
# friends-oak                                         0.1.0                  76b7f4293a8c   47 minutes ago   207MB
# friends-service                                     0.1.0                  08efe10d7bf3   2 hours ago      207MB

docker kill $(docker ps --filter "ancestor=friends-oak:0.1.0" -q)  
docker run -d -p 8000:8000 friends-oak-prod:0.1.0
docker logs -f $(docker ps --filter "ancestor=friends-oak-prod:0.1.0" -q)
# no download lines
docker kill $(docker ps --filter "ancestor=friends-oak-prod:0.1.0" -q)  
```

### Mounting volume 

```shell
docker build -t friends-oak-dev:0.1.0 -f ./deployment/friends-oak/Dockerfile-dev  ./deployment/friends-oak/
# NOTE : check ENTRYPOINT in Dockerfile-dev
docker run -p 8000:8000 -v ${pwd}/deployment/friends-oak/src:/app friends-oak-dev:0.1.0
# change source files and watch app behaviour changes 
```
