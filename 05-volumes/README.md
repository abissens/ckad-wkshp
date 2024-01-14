### Kubernetes volumes

#### Volume types 

| Type                  | Description                                                                                                                                                                    |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| emptyDir              | Empty directory in Pod with read/write access. Only persisted for the lifespan of a Pod. A good choice for cache implementations or data exchange between containers of a Pod. |
| hostPath              | File or directory from the host node’s filesystem.                                                                                                                             |
| configMap, secret     | Provides a way to inject configuration data.                                                                                                                                   |
| nfs                   | An existing NFS (Network File System) share. Preserves data after Pod restart.                                                                                                 |
| persistentVolumeClaim | Claims a Persistent Volume.                                                                                                                                                    |
| vendor volumes        | Some cloud provided services. Out of CKAD Scope                                                                                                                                |

#### Ephemeral Volume

```shell
kubectl create -f deployment/volume-ephemeral.yml
kubectl get pod ephemeral-app
kubectl exec ephemeral-app -- cat /var/log/nginx/access.log
# empty result

$POD_IP=kubectl describe pods ephemeral-app | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'

kubectl exec ephemeral-app -- cat /var/log/nginx/access.log
# 10.42.0.40 - - [13/Jan/2024:17:19:11 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"

kubectl delete pod ephemeral-app
kubectl create -f deployment/volume-ephemeral.yml
kubectl exec ephemeral-app -- cat /var/log/nginx/access.log
# empty result : ephemeral volume is not persisted
```

#### Ephemeral Volume with sidecar 

```shell
kubectl create -f deployment/volume-ephemeral-multi-c.yml
$POD_IP=kubectl describe pods ephemeral-app-multi-c | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80/unknown'


kubectl exec -c nginx ephemeral-app-multi-c -- sh -c 'cat /var/log/nginx/access.log'
kubectl logs -f -c sidecar ephemeral-app-multi-c 
#     2 200
#     1 404
#     2 200
#     1 404
#     ...
# Notes :
# -c to select the container
# -f to follow the logs
```

#### Static PV and PVC

```shell
kubectl create -f deployment/volume-static-pv.yml
$POD_IP=kubectl describe pods static-pv-app | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80/unknown'

kubectl exec static-pv-app -- cat /var/log/nginx/access.log
# 10.42.0.98 - - [13/Jan/2024:18:15:40 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.99 - - [13/Jan/2024:18:15:43 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.100 - - [13/Jan/2024:18:15:48 +0000] "GET /unknown HTTP/1.1" 404 153 "-" "Wget" "-"

kubectl delete pod static-pv-app
kubectl apply -f deployment/volume-static-pv.yml
kubectl exec static-pv-app -- cat /var/log/nginx/access.log
# 10.42.0.98 - - [13/Jan/2024:18:15:40 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.99 - - [13/Jan/2024:18:15:43 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.100 - - [13/Jan/2024:18:15:48 +0000] "GET /unknown HTTP/1.1" 404 153 "-" "Wget" "-"

$POD_IP=kubectl describe pods static-pv-app | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:80'
kubectl exec static-pv-app -- cat /var/log/nginx/access.log
# 10.42.0.98 - - [13/Jan/2024:18:15:40 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.99 - - [13/Jan/2024:18:15:43 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.100 - - [13/Jan/2024:18:15:48 +0000] "GET /unknown HTTP/1.1" 404 153 "-" "Wget" "-"
# 10.42.0.103 - - [13/Jan/2024:18:17:45 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"

kubectl get pv db-static-pv -o wide
# NAME           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS   REASON   AGE     VOLUMEMODE
# db-static-pv   50Mi       RWO            Retain           Bound    default/db-static-pvc                           8m29s   Filesystem

kubectl describe pvc db-static-pvc
# Name:          db-static-pvc
# Namespace:     default
# StorageClass:
# Status:        Bound
# Volume:        db-static-pv
# Labels:        <none>
# Annotations:   pv.kubernetes.io/bind-completed: yes
#                pv.kubernetes.io/bound-by-controller: yes
# Finalizers:    [kubernetes.io/pvc-protection]
# Capacity:      50Mi
# Access Modes:  RWO
# VolumeMode:    Filesystem
# Used By:       static-pv-app
# Events:        <none>

# Data can be found in WSL here : \\wsl.localhost\rancher-desktop\tmp\db-static 

# Access modes 
kubectl get pv db-static-pv -o jsonpath='{.spec.accessModes}'
# ["ReadWriteOnce"]

# Possible modes :
# ReadWriteOnce/RWO : Read/write access by a single node
# ReadOnlyMany/ROX : Read-only access by many nodes
# ReadWriteMany/RWX : Read/write access by many nodes
# ReadWriteOncePod/RWOP : Read/write access mounted by a single Pod

kubectl delete -f deployment/volume-static-pv.yml
kubectl create -f deployment/volume-static-pv.yml
kubectl exec static-pv-app -- cat /var/log/nginx/access.log
# Data are preserved because of persistentVolumeReclaimPolicy: Retain
# 10.42.0.98 - - [13/Jan/2024:18:15:40 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.99 - - [13/Jan/2024:18:15:43 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.100 - - [13/Jan/2024:18:15:48 +0000] "GET /unknown HTTP/1.1" 404 153 "-" "Wget" "-"
# 10.42.0.103 - - [13/Jan/2024:18:17:45 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"

# change persistentVolumeReclaimPolicy: Delete
kubectl delete -f deployment/volume-static-pv.yml
kubectl create -f deployment/volume-static-pv.yml
kubectl exec static-pv-app -- cat /var/log/nginx/access.log
# Data are still preserved because of persistentVolumeReclaimPolicy: Retain
# 10.42.0.98 - - [13/Jan/2024:18:15:40 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.99 - - [13/Jan/2024:18:15:43 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"
# 10.42.0.100 - - [13/Jan/2024:18:15:48 +0000] "GET /unknown HTTP/1.1" 404 153 "-" "Wget" "-"
# 10.42.0.103 - - [13/Jan/2024:18:17:45 +0000] "GET / HTTP/1.1" 200 615 "-" "Wget" "-"

# But pv reclaim policy changed to Delete
kubectl get pv db-static-pv -o wide

# NAME           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS   REASON   AGE   VOLUMEMODE
# db-static-pv   50Mi       RWO            Delete           Bound    default/db-static-pvc                           65s   Filesystem

# Delete pod and pvc 
kubectl delete  pod static-pv-app
kubectl delete pvc db-static-pvc
kubectl get pv db-static-pv -o wide
# Error from server (NotFound): persistentvolumes "db-static-pv" not found
kubectl create -f deployment/volume-static-pv.yml
kubectl exec static-pv-app -- cat /var/log/nginx/access.log # logs are empty now 
```

#### Dynamic PV and Storage class

The storage class is used to provision a PersistentVolume dynamically based on its criteria

```shell
# get cluster declared storage classes
kubectl get storageclass
# NAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
# local-path (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  182d

kubectl create -f deployment/volume-sc-pv.yml
kubectl get pv -o wide
# NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                STORAGECLASS   REASON   AGE    VOLUMEMODE
# db-static-pv                               50Mi       RWO            Delete           Bound    default/db-static-pvc                                        64m    Filesystem
# pvc-196f373c-9237-4ee4-904e-7780a99c4ec0   25Mi       RWO            Delete           Bound    default/sc-pvc                       local-path              24s    Filesystem

# files in wsl can be found here : \\wsl.localhost\rancher-desktop-data\var\lib\rancher\k3s\storage\pvc-196f373c-9237-4ee4-904e-7780a99c4ec0_default_sc-pvc
```
