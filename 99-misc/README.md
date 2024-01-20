### Kubernetes commands

```shell
# get all api versions 
kubectl api-versions
# check API deprecations https://kubernetes.io/docs/reference/using-api/deprecation-guide/

# get all pods events 
kubectl get events

# Inline add container to a pod for debugging 
kubectl run my-friends-pod --image=friends-service:0.3.0  --port=8000 
kubectl describe pod my-friends-pod 
# Containers:
#  my-friends-pod:
#    Container ID:   docker://c23a095066dc651dc79fde9b264750b73d416325bbf841a75bf2ac1faf4abb50

kubectl debug -it  my-friends-pod  --image=busybox
# Defaulting debug container name to debugger-gkqb2.
# If you don't see a command prompt, try pressing enter.
# / # wget -qO- localhost:8000
# {"hostname":"my-friends-pod","apiVersion":"3","quote":{"character":"Phoebe Buffay","quote":"They don't know that we know they know we know."}} 
kubectl describe pod my-friends-pod 
# Ephemeral Containers:
#   debugger-gkqb2:
#     Container ID:   docker://8925ad5280924f23a13d05df8ad1bda1c9a963fe9d888525773dcaf440314397
#     Image:          busybox

```

### Common POD creation issues 

| Status                           | Error                                                        | 
|----------------------------------|--------------------------------------------------------------|
| ImagePullBackOff or ErrImagePull | Image could not be pulled from registry.                     |
| CrashLoopBackOff                 | Application or command run in container crashes.             |
| CreateContainerConfigError       | ConfigMap or Secret referenced by container cannot be found. |
