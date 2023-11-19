### kubectl pod manipulations 

```shell
kubectl run friends --image=friends-service:0.1.0  --port=8000 --env="DATA=sample" --labels="app=friends-app,env=dev"
# > pod/friends created
# check rancher os desktop cluster dashboard 

# Alternatively use declarative mode
kubectl apply -f .\deployments\friends-pod.yml

# Listing and getting pods 
kubectl get pods
kubectl get pods friends
# > NAME      READY   STATUS    RESTARTS   AGE
# > friends   1/1     Running   0          26m
# Status are : Pending, Running, Succeeded, Failed and Unknown

# Get pods details 
kubectl describe pods friends

# Get pod logs 
kubectl logs friends
kubectl logs friends -f 

# Execute commands on pod 
kubectl exec friends -- cat /app/index.ts
kubectl exec friends -- env | grep ^DATA=
kubectl exec -it friends -- /bin/bash

# Use temporary pod (execute in shell)
$FRIENDS_IP=kubectl describe pods friends | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="FRIENDS_HOST=$FRIENDS_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $FRIENDS_HOST:8000'

# Delete pod 
kubectl delete pod friends
kubectl delete -f .\deployments\friends-pod.yml
```

![rancher-desktop-pod-status.png](assets%2Francher-desktop-pod-status.png)

### Dry run

```shell
kubectl run friends --image=friends-service:0.1.0  --port=8000 --env="DATA=sample" --labels="app=friends-app,env=dev"  -o yaml --dry-run=client
# Change command and replace pod 
kubectl run friends --image=friends-service:0.1.0  --port=8000 --env="DATA=sample" --labels="app=friends-app,env=dev"  -o yaml > ./02-pods/deployments/friends-pod-updated.yml --dry-run=client -- sh -c 'deno --version; deno run --allow-net index.ts'
kubectl replace --force=true -f 02-pods/deployments/friends-pod-updated.yml
kubectl logs friends
```
