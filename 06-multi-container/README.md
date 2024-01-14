### Multi container pods 

#### Init container

```shell
kubectl create -f deployment/init-container.yml
kubectl get pod init-c-app 
# Notice the init status
# NAME         READY   STATUS     RESTARTS   AGE
# init-c-app   0/1     Init:0/1   0          2s

$POD_IP=kubectl describe pods init-c-app | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
```

#### Sidecar container

Container that adds third party functionality to main one
Check volumes chapter

#### The Adapter container
Container that adapts main one output (responses, results, logs, etc.)

```shell
kubectl create -f deployment/adapter.yml
kubectl get pod adapter-app 

$POD_IP=kubectl describe pods adapter-app | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80/unknown'

kubectl exec adapter-app -c nginx -- cat /var/log/nginx/access.log
kubectl exec adapter-app -c nginx -- cat /var/log/nginx/formatted-access.log
kubectl exec adapter-app -c adapter -- cat /var/log/nginx/access.log
kubectl exec adapter-app -c adapter -- cat /var/log/nginx/formatted-access.log
```

#### The Ambassador container

```shell
kubectl create -f deployment/ambassador.yml

$POD_IP=kubectl describe pods ambassador-app | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
# Note : all containers share same IP
# get data from main container
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:8000'
# {"character":"Phoebe Buffay","quote":"I wish I could, but I don't want to."}

# get data from ambassador container (80 port) returns 401 without authentication 
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
# wget: server returned error: HTTP/1.1 401 Unauthorized

kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- http://chandler:bing@$POD_IP:80'
# {"character":"Joey Tribbiani","quote":"Joey doesn't share food!"}
```
