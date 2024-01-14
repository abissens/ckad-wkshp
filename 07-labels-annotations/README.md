### Labels and annotations 

Labels are an essential tool for querying, filtering, and sorting Kubernetes objects

Annotations only represent descriptive metadata for Kubernetes objects but can’t be used for queries

#### Labels 

Kubernetes limits the length of a label to a maximum of 63 characters and a range of allowed alphanumeric and separator characters.

```shell

kubectl create -f deployment/labels.yml
# creates pod with 2 labels 
kubectl describe pod labels-app | grep -C 2 Labels:
# Labels:       app=friends-app-with-labels
#               env=dev
# Annotations:  <none>

kubectl get pods --show-labels
# NAME                                READY   STATUS    RESTARTS       AGE    LABELS
# labels-app                          1/1     Running   0              82s    app=friends-app-with-labels,env=dev

# Add label 
kubectl label pod labels-app region=eu
# Overwrite label 
kubectl label pod labels-app region=tn --overwrite
# Remove label 
kubectl label pod labels-app region-
```

#### Labels selectors

```shell
kubectl delete -f deployment/labels.yml
kubectl create -f deployment/multi-objects-labels.yml

kubectl get pods -l env=prod --show-labels
# NAME       READY   STATUS    RESTARTS   AGE   LABELS
# ml-app-3   1/1     Running   0          25s   app=friends-app-with-labels,env=prod,status=ready

kubectl get pods -l 'env in (dev, qa)' --show-labels
# NAME       READY   STATUS    RESTARTS      AGE     LABELS
# ml-app-1   1/1     Running   0             3m55s   app=friends-app-with-labels,env=dev
# ml-app-2   1/1     Running   0             3m55s   app=friends-app-with-labels,env=qa

kubectl get pods -l 'env in (dev, qa, prod)',status=ready --show-labels
# NAME       READY   STATUS    RESTARTS   AGE     LABELS
# ml-app-3   1/1     Running   0          5m14s   app=friends-app-with-labels,env=prod,status=ready

kubectl get pods -l 'env in (dev, qa, prod)' -l status=ready --show-labels
# NAME       READY   STATUS    RESTARTS   AGE     LABELS
# ml-app-3   1/1     Running   0          5m14s   app=friends-app-with-labels,env=prod,status=ready

kubectl get pvc --selector env=dev --show-labels
# NAME        STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE     LABELS
# ml-sc-pvc   Pending                                      local-path     2m38s   app=friends-app-with-labels,env=dev,type=config
```

Note 1:
Labels are used in Services, Deployments, Network policies etc. as object selectors

Note 2: 
Recommended labels https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

#### Annotations 

Annotations are not used for selection 
Use quotes when special characters are in annotation values
Reserved kubernetes annotations : https://kubernetes.io/docs/reference/labels-annotations-taints/

```shell

kubectl create -f deployment/annotations.yml
kubectl describe pod annotations-app | grep -C 2 Annotations:
# Start Time:   Sun, 14 Jan 2024 15:16:54 +0100
# Labels:       <none>
# Annotations:  author: XXXX0000
#               commit: 4888cc1
#               version: feature/v1

# add annotation 
kubectl annotate pod annotations-app email='xxxx@yyy.io'
# update annotation 
kubectl annotate pod annotations-app email='zzzz@yyy.io' --overwrite
# remove annotation 
kubectl annotate pod annotations-app email-
```
