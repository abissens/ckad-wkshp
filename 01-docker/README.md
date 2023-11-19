### Docker manipulations

```shell
cd ./app
# Building docker image
docker build -t friends-service:0.1.0 .
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
# > c120829934dfcdb4e492722...

# Get container logs
docker logs c120829934dfcdb4e492722

# Exec command into container 
docker exec c120829934dfcdb4e492722 cat /app/index.ts
# Connect to container shell
docker exec -it c120829934dfcdb4e492722 bash



```
