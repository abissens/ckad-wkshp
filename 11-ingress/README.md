### Ingress 


```shell

kubectl create -f ./deployment/ingress.yml
kubectl describe ingress  friends-ing-basic

kubectl describe node node-pc | grep InternalIP:
# InternalIP:  172.23.156.25
curl -L  172.23.156.25/friends-basic
# {"hostname":"friends-ing-pod","apiVersion":"3","quote":{"character":"Joey Tribbiani","quote":"How you doin'?"}}

kubectl create -f ./deployment/ingress-host.yml
# edit  C:\Windows\System32\drivers\etc\hosts
# add line : 172.23.156.25 friends.show
# IRL use DNS server 

curl -L  friends.show/friends-basic
# Notice the version number change
# {"apiVersion":"1","quote":{"character":"Joey Tribbiani","quote":"How you doin'?"}}

kubectl logs friends-ing-host-pod
# Listening on http://localhost:8000/
# [2024-01-21T18:06:24.968Z] GET http://friends.show/friends-basic

# don't work with Traefik ingress controller 
# kubectl create -f ./deployment/ingress-url-rewrite.yml

kubectl delete -f ./deployment/ingress.yml
kubectl delete -f ./deployment/ingress-host.yml
kubectl create -f ./deployment/ingress-multi-path.yml

# curl -L  friends.show/friends-basic
# {"hostname":"friends-ing-pod","apiVersion":"3","quote":{"character":"Joey Tribbiani","quote":"Joey doesn't share food!"}}

# curl -L  friends.show/legacy/friends-basic
# {"apiVersion":"1","quote":{"character":"Rachel Green","quote":"It's not that common, it doesn't happen to every guy, and it IS a big deal!"}}

```
