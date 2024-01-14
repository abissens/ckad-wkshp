### Configuration

#### Configmap 

```shell
kubectl create -f deployment/configmap-env.yml
kubectl logs cm-env-app | grep 'TV_SHOW\|bestCharacter'
# TV_SHOW=friends
# bestCharacter=Chandler Bing

kubectl create -f deployment/configmap-env-values.yml
kubectl exec cm-env-values-app -- env | grep 'TV_SHOW\|BEST_CHARACTER'
# BEST_CHARACTER=Chandler Bing
# TV_SHOW=friends

kubectl create -f deployment/configmap-volume-data.yml
# kubectl logs cm-vol-app
# File: /etc/config/TV_SHOW
# friends
# ---
# File: /etc/config/bestCharacter
# Chandler Bing
# ---
```

#### Secret

```shell
# manually creating secret (--from-literal, --from-env-file, --from-file=file|dir)
kubectl create secret generic secret-pre-configured --from-literal=userName=Chandler
# secret types = https://kubernetes.io/docs/concepts/configuration/secret/#secret-types
kubectl create -f deployment/secret.yml
kubectl exec secret-app -- env | grep 'USER_NAME\|PWD'
# PWD=Bing
# USER_NAME=Chandler

```
#### Security context 

```shell
kubectl create -f deployment/security-context.yml
kubectl get pods -l type=sc
# NAME                          READY   STATUS                       RESTARTS   AGE
# sc-non-root-fails             0/1     CreateContainerConfigError   0          64s
# sc-non-root-fails-pod-level   0/1     CreateContainerConfigError   0          64s
# sc-non-root-overwrite         1/1     Running                      0          64s
# sc-fs-group                   1/1     Running                      0          64s
# sc-non-root-ok-nginx          1/1     Running                      0          64s

# for sc-fs-group all newly created file are in group 2000 due to fsGroup property
kubectl exec sc-fs-group -- sh -c 'touch /data/test/new_file; ls -l /data/test/new_file'
# -rw-r--r--    1 1000     2000             0 Jan 14 15:43 /data/test/new_file
# more on security context https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
```

#### ResourceQuota by namespace

```shell
kubectl get resourcequota
# No resources found in default namespace.
kubectl create namespace restricted
kubectl config set-context --current --namespace=restricted
kubectl config view --minify | grep namespace:
kubectl create -f deployment/resource-quota.yml
kubectl describe resourcequota restricted-quota
# Name:            restricted-quota
# Namespace:       restricted
# Resource         Used  Hard
# --------         ----  ----
# limits.cpu       0     4
# limits.memory    0     4096M
# pods             0     2
# requests.cpu     0     1
# requests.memory  0     1024M

kubectl run nginx --image=nginx
# Error from server (Forbidden): pods "nginx" is forbidden: 
# failed quota: restricted-quota: must specify limits.cpu for: nginx; limits.memory for: nginx; 
# requests.cpu for: nginx; requests.memory for: nginx

sed "s/pod-with-quota/pod-with-quota-$(date +'%Y%m%d%H%M%S')/g"  deployment/pod-with-quota.yml | kubectl create -f -
# pod/pod-with-quota-20240114170243 created
sed "s/pod-with-quota/pod-with-quota-$(date +'%Y%m%d%H%M%S')/g"  deployment/pod-with-quota.yml | kubectl create -f -
# pod/pod-with-quota-20240114170304 created

kubectl describe resourcequota restricted-quota
# Name:            restricted-quota
# Namespace:       restricted
# Resource         Used   Hard
# --------         ----   ----
# limits.cpu       2      4
# limits.memory    2048M  4096M
# pods             2      2
# requests.cpu     1      1
# requests.memory  1024M  1024M

sed "s/pod-with-quota/pod-with-quota-$(date +'%Y%m%d%H%M%S')/g"  deployment/pod-with-quota.yml | kubectl create -f -
# Error from server (Forbidden): error when creating "STDIN": pods "pod-with-quota-20240114170354" is forbidden: 
# exceeded quota: restricted-quota, requested: pods=1,requests.cpu=500m,requests.memory=512M, 
# used: pods=2,requests.cpu=1,requests.memory=1024M, limited: pods=2,requests.cpu=1,requests.memory=1024M

# delete namespace
kubectl delete namespace restricted
kubectl config set-context --current --namespace=default
kubectl config view --minify | grep namespace:
```

#### Service accounts 

```shell
kubectl get serviceaccounts
# NAME      SECRETS   AGE
# default   0         183d

kubectl create -f deployment/service-account.yml
kubectl create -f deployment/pods-with-sa.yml
kubectl logs sa-app-forbidden 
# Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:default:default" cannot list resource "pods" in API group "" in the namespace "default"
kubectl logs sa-app-ok
# NAME                                READY   STATUS                       RESTARTS       AGE
# friends                             1/1     Running                      4 (23h ago)    56d
# ...
```
