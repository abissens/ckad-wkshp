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
