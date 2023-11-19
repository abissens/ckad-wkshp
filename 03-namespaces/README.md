### manipulating namespaces 

```shell
kubectl get namespaces
# create new namespace
kubectl create namespace friends-ns
kubectl apply -f ./deployments/friends-ns.yml

# run pod in a namespace 
kubectl run friends --image=friends-service:0.1.0  --port=8000 --env="DATA=sample" --labels="app=friends-app,env=dev" -n friends-ns
kubectl apply -f ./deployments/friends-pod-in-namespace.yml
kubectl get pods -n friends-ns

# check current namespace 
kubectl config view --minify | grep namespace:

# set current namespace 
kubectl config set-context --current --namespace=friends-ns

# delete namespace 
kubectl delete namespace friends-ns
```
