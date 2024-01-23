### Deployment and replicaset 

![Deployment](assets/deployment.png)

#### Deployment 

```shell
kubectl create -f ./deployment/deployment.yml
kubectl get deployment
# NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
# friends-deployment   4/4     4            4           18s

kubectl get replicasets -o wide -l app=friends-app
# NAME                           DESIRED   CURRENT   READY   AGE     CONTAINERS   IMAGES                  SELECTOR
# friends-deployment-f5bc6f64b   4         4         4       4m10s   friends      friends-service:0.1.0   app=friends-app,pod-template-hash=f5bc6f64b

kubectl describe deployment friends-deployment

kubectl get pods -l app=friends-app
# NAME                                 READY   STATUS    RESTARTS      AGE
# friends-deployment-f5bc6f64b-z2pjg   1/1     Running   0             102s
# friends-deployment-f5bc6f64b-87ngz   1/1     Running   0             102s
# friends-deployment-f5bc6f64b-hp4th   1/1     Running   0             102s
# friends-deployment-f5bc6f64b-dkms7   1/1     Running   0             102s

kubectl delete pod friends-deployment-f5bc6f64b-dkms7
kubectl get deployment friends-deployment
# NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
# friends-deployment   3/4     4            3           6m20s

kubectl get pods -l app=friends-app
# NOTICE the ID change
# NAME                                 READY   STATUS    RESTARTS      AGE
# friends-deployment-f5bc6f64b-z2pjg   1/1     Running   0             6m21s
# friends-deployment-f5bc6f64b-87ngz   1/1     Running   0             6m21s
# friends-deployment-f5bc6f64b-hp4th   1/1     Running   0             6m21s
# friends-deployment-f5bc6f64b-ss7tx   1/1     Running   0             2s

kubectl delete deployment friends-deployment
kubectl get pods -l app=friends-app
# Empty
```

#### Rollout

```shell
docker build -t friends-service:0.2.0 -f ./docker/friends-2/Dockerfile ./docker/friends-2
kubectl create -f ./deployment/deployment.yml
kubectl set image deployment friends-deployment friends=friends-service:0.2.0
# Note : can use kubectl apply, kubectl replace or kubectl edit

kubectl rollout status deployment friends-deployment
# Waiting for deployment "friends-deployment" rollout to finish: 1 old replicas are pending termination...
# Waiting for deployment "friends-deployment" rollout to finish: 1 old replicas are pending termination...
# Waiting for deployment "friends-deployment" rollout to finish: 1 old replicas are pending termination...
# Waiting for deployment "friends-deployment" rollout to finish: 1 old replicas are pending termination...
# deployment "friends-deployment" successfully rolled out
kubectl get pods -l app=friends-app
$POD_IP=kubectl describe pods friends-deployment-757757f8bf-7vxd8 | Select-String -Pattern '^IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' | ForEach-Object { $_.Matches.Groups[1].Value }
kubectl run busybox --image=busybox:1.36.1 --env="POD_IP=$POD_IP" --rm -it --restart=Never -- sh -c 'wget -qO- $POD_IP:8000'
# {"hostname":"friends-deployment-757757f8bf-7vxd8","apiVersion":"2","quote":{"character":"Joey Tribbiani","quote":"Joey doesn't share food!"}}

kubectl rollout history deployment friends-deployment
# deployment.apps/friends-deployment 
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         <none>
# Note : 
# By default, a Deployment persists a maximum of 10 revisions in its history. 
# You can change the limit by assigning a different value to spec.revisionHistoryLimit.

kubectl rollout history deployments friends-deployment --revision=2

# Rollout with change cause
docker build -t friends-service:0.3.0 -f ./docker/friends-3/Dockerfile ./docker/friends-3
kubectl apply -f ./deployment/deployment-v3.yml
kubectl rollout history deployment friends-deployment
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         <none>
# 3         Update to version 0.3.0 of Friends app

# Rollback 
kubectl rollout undo deployment friends-deployment --to-revision=1
kubectl rollout history deployment friends-deployment
# REVISION  CHANGE-CAUSE
# 2         <none>
# 3         Update to version 0.3.0 of Friends app
# 4         <none>

```

#### Scaling Workloads

```shell
# Manual scaling 
kubectl scale deployment friends-deployment --replicas=6
kubectl get pods -l app=friends-app
# NAME                                 READY   STATUS    RESTARTS      AGE
# friends-deployment-f5bc6f64b-kmwlw   1/1     Running   0             114s
# friends-deployment-f5bc6f64b-cwd28   1/1     Running   0             114s
# friends-deployment-f5bc6f64b-4c7zg   1/1     Running   0             112s
# friends-deployment-f5bc6f64b-2r4dg   1/1     Running   0             112s
# friends-deployment-f5bc6f64b-vm5x5   1/1     Running   0             12s
# friends-deployment-f5bc6f64b-bpm6m   1/1     Running   0             12s
```

```shell
# Auto scaling 
kubectl delete -f ./deployment/deployment.yml
kubectl get pods -l app=friends-app
# Empty 

# Horizontal Pod Autoscaler = hpa
kubectl create -f ./deployment/deployment-autoscaler.yml
kubectl get pods -l app=friends-app
# NAME                                  READY   STATUS    RESTARTS   AGE
# friends-deployment-797f4d9fb4-qv6s9   1/1     Running   0          45s
# friends-deployment-797f4d9fb4-hslqd   1/1     Running   0          29s
# friends-deployment-797f4d9fb4-kpdt4   1/1     Running   0          29s
kubectl get hpa friends-deployment-scaler
# NAME                        REFERENCE                       TARGETS                     MINPODS   MAXPODS   REPLICAS   AGE
# friends-deployment-scaler   Deployment/friends-deployment   2%/60%, 18625877333m/70Mi   3         5         3          98s

kubectl describe hpa friends-deployment-scaler

# Get pods IPs
kubectl get pods -l app=friends-app -o json | ConvertFrom-Json | Select-Object -ExpandProperty items | ForEach-Object { Write-Host "Pod: $($_.metadata.name), IP: $($_.status.podIP)" }
# Pod: friends-deployment-797f4d9fb4-qv6s9, IP: 10.42.0.254
# Pod: friends-deployment-797f4d9fb4-hslqd, IP: 10.42.0.3
# Pod: friends-deployment-797f4d9fb4-kpdt4, IP: 10.42.0.2

kubectl create -f ./deployment/load-monitor.yml
# in one cmd
kubectl logs -f monitor-pods

# in other cmds
kubectl exec -it load-test-pod -- sh -c 'ab -n 100000 -c 100 http://10.42.0.254:8000/'
kubectl exec -it load-test-pod -- sh -c 'ab -n 100000 -c 100 http://10.42.0.3:8000/'
kubectl exec -it load-test-pod -- sh -c 'ab -n 100000 -c 100 http://10.42.0.2:8000/'

```

![Autoscaler monitoring](assets/autoscaler.png)


#### Deployment Strategies 
##### RollingUpdate (default): Ramped Deployment Strategy

Zero downtime
Old and new versions of the application run in parallel

```shell
kubectl delete -f ./deployment/deployment-autoscaler.yml
kubectl create -f ./deployment/deployment-rolling-update.yml

# into another terminal
while ($true) { [Console]::Clear(); kubectl get pods -l app=friends-app -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,READY:.status.containerStatuses[0].ready,CREATION:.metadata.creationTimestamp,IMAGE:.spec.containers[0].image; Start-Sleep -Seconds 5 }
# NAME                                          LABELS                                              STATUS    READY   AGE
# friends-deployment-rolling-6457dd594b-sst5q   map[app:friends-app pod-template-hash:6457dd594b]   Running   true    2024-01-15T20:20:59Z
# friends-deployment-rolling-6457dd594b-zfmvk   map[app:friends-app pod-template-hash:6457dd594b]   Running   true    2024-01-15T20:20:59Z
# friends-deployment-rolling-6457dd594b-x5f6r   map[app:friends-app pod-template-hash:6457dd594b]   Running   true    2024-01-15T20:20:59Z
# friends-deployment-rolling-6457dd594b-7lsnw   map[app:friends-app pod-template-hash:6457dd594b]   Running   true    2024-01-15T20:20:59Z

kubectl edit deployment friends-deployment-rolling
# change container image and save
```

##### Recreate : Fixed Deployment Strategy
The fixed deployment strategy will terminate replicas with the old application version at once 
before creating another ReplicaSet that controls replicas running the new application version.

```shell
apiVersion: apps/v1
kind: Deployment
metadata:
  name: friends-deployment-rolling
spec:
  replicas: 4
  strategy:
    type: Recreate 
  selector:
...
```

##### App architecture based Deployment Strategies
Not built-in
Use of many Deployment objects at the same time
Covered in Service chapter : 
* Blue-Green Deployment Strategy
* Canary Deployment Strategy

##### Statefulset 

* A StatefulSet in Kubernetes is used to manage stateful applications. 
* Unlike Deployments, StatefulSets provide guarantees about the ordering and uniqueness of pods.
* Each pod in a StatefulSet gets a unique and stable hostname, and they are created in order, one at a time.
* They have stable storage identity
* Service is mandatory (at least headless = no exposition) 

```shell
# need service account with rights 
kubectl create -f ../08-configuration/deployment/service-account.yml

# Start with a deployment replicaset
kubectl create -f ./deployment/alive-pod-replicaset.yml
$POD_NAME=kubectl get pods -l  app=alive-pod  -o jsonpath='{.items[0].metadata.name}'
kubectl exec $POD_NAME -- cat /data/message.txt
# Hi, I am a little POD, my name is alive-pod-deployment-59dbd6759f-l5fw5, i am running on node hbensassi2-pc, my namespace is default and I my age is 594 seconds.
# Hi, I am a little POD, my name is alive-pod-deployment-59dbd6759f-zgpnn, i am running on node hbensassi2-pc, my namespace is default and I my age is 595 seconds.
# Hi, I am a little POD, my name is alive-pod-deployment-59dbd6759f-75dms, i am running on node hbensassi2-pc, my namespace is default and I my age is 597 seconds.

kubectl get pv,pvc 
# NAME                                                        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                   STORAGECLASS   REASON   AGE
# persistentvolume/pvc-e11370ea-a67c-41a3-b5a4-9e355da91478   25Mi       RWO            Delete           Bound    default/alive-pod-deployment-data-pvc   local-path              99s
# 
# NAME                                                  STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
# persistentvolumeclaim/alive-pod-deployment-data-pvc   Bound    pvc-e11370ea-a67c-41a3-b5a4-9e355da91478   25Mi       RWO            local-path     102s



kubectl delete -f ./deployment/alive-pod-replicaset.yml

# Create a statefulset 
kubectl create -f ./deployment/alive-pod-statefulset.yml

kubectl get pods 
# Notice they run in order and have identifiable names
# NAME                      READY   STATUS    RESTARTS   AGE
# alive-pod-statefulset-0   1/1     Running   0          14s
# alive-pod-statefulset-1   1/1     Running   0          8s
# alive-pod-statefulset-2   0/1     Pending   0          3s
kubectl get pv,pvc
# NAME                                                        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                  STORAGECLASS   REASON   AGE
# persistentvolume/pvc-d238f6fe-910f-4b81-b05b-740545590f73   25Mi       RWO            Delete           Bound    default/data-alive-pod-statefulset-0   local-path              99s        
# persistentvolume/pvc-ae5308a2-ceec-4157-990d-4234058d522e   25Mi       RWO            Delete           Bound    default/data-alive-pod-statefulset-1   local-path              93s        
# persistentvolume/pvc-0df8d795-0053-47db-b037-96ebb3d59a60   25Mi       RWO            Delete           Bound    default/data-alive-pod-statefulset-2   local-path              88s        
# 
# NAME                                                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
# persistentvolumeclaim/data-alive-pod-statefulset-0   Bound    pvc-d238f6fe-910f-4b81-b05b-740545590f73   25Mi       RWO            local-path     102s
# persistentvolumeclaim/data-alive-pod-statefulset-1   Bound    pvc-ae5308a2-ceec-4157-990d-4234058d522e   25Mi       RWO            local-path     96s
# persistentvolumeclaim/data-alive-pod-statefulset-2   Bound    pvc-0df8d795-0053-47db-b037-96ebb3d59a60   25Mi       RWO            local-path     91s

kubectl exec alive-pod-statefulset-0 -- cat /data/message.txt
# Hi, I am a little POD, my name is alive-pod-statefulset-0, I am running on node hbensassi2-pc, my namespace is default and my age is 1895 seconds.
kubectl exec alive-pod-statefulset-1 -- cat /data/message.txt
# Hi, I am a little POD, my name is alive-pod-statefulset-1, I am running on node hbensassi2-pc, my namespace is default and my age is 1899 seconds.
kubectl exec alive-pod-statefulset-2 -- cat /data/message.txt
# Hi, I am a little POD, my name is alive-pod-statefulset-2, I am running on node hbensassi2-pc, my namespace is default and my age is 1900 seconds.

kubectl delete pod alive-pod-statefulset-1
kubectl get pods 
# NAME                      READY   STATUS    RESTARTS   AGE
# alive-pod-statefulset-0   1/1     Running   0          5m57s
# alive-pod-statefulset-2   1/1     Running   0          5m46s
# alive-pod-statefulset-1   1/1     Running   0          21s

# wait 1 minutes
kubectl exec alive-pod-statefulset-1 -- cat /data/message.txt
# Hi, I am a little POD, my name is alive-pod-statefulset-1, I am running on node hbensassi2-pc, my namespace is default and my age is 268 seconds.
# Hi, I am a little POD, my name is alive-pod-statefulset-1, I am running on node hbensassi2-pc, my namespace is default and my age is 328 seconds.
# Hi, I am a little POD, my name is alive-pod-statefulset-1, I am running on node hbensassi2-pc, my namespace is default and my age is 43 seconds.


kubectl delete -f ./deployment/alive-pod-statefulset.yml
kubectl delete pv,pvc --all
kubectl get all,pv,pvc

```

##### Daemonset

* Ensure a pod on each cluster node 

```shell
kubectl create -f ./deployment/alive-pod-daemonset.yml
kubectl get pods 
$POD_NAME=kubectl get pods -l  app=alive-pod  -o jsonpath='{.items[0].metadata.name}'
kubectl exec $POD_NAME -- cat /data/message.txt
# Hi, I am a little POD, my name is alive-pod-daemonset-4ghxq, I am running on node hbensassi2-pc, my namespace is default and my age is 11 seconds.

kubectl delete -f ./deployment/alive-pod-daemonset.yml
```
