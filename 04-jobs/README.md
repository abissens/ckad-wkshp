### Kubernetes jobs 

```shell
# note : the // in //bin/sh is set to not auto resolve to windows git bash tool
kubectl create job primes --image=busybox:1.36.1 -- //bin/sh -c 'num=2; while [ $num -le 1000 ]; do is_prime="true"; i=2; while [ $((i * i)) -le $num ]; do [ $((num % i)) -eq 0 ] && is_prime="false" && break; i=$((i + 1)); done; [ $is_prime = "true" ] && echo $num &&  sleep 0.05; num=$((num + 1)); done'
kubectl get jobs
kubectl logs job/primes
kubectl get jobs primes -o yaml | grep -C 1 "completions"
kubectl delete job primes
```

### Job with 3 completions

```shell
kubectl apply -f deployment/primes-job-3-completions.yml 
kubectl get jobs -w
# or watch related pods
kubectl get pods --selector=job-name=primes -w
# > NAME           READY   STATUS      RESTARTS   AGE
# > primes-bdm64   0/1     Completed   0          96s
# > primes-tf9pj   0/1     Completed   0          83s
# > primes-gvfdw   0/1     Completed   0          71s
kubectl logs job/primes
kubectl delete job primes
# or delete related pods 
kubectl delete pods --selector=job-name=primes -w
```
### Job that parallel calculates multiple hashes

```shell
kubectl apply -f deployment/parallel-hash-job.yml
# or to force restart 
kubectl replace --force=true -f deployment/parallel-hash-job.yml
# Since each job takes 1 minute to complete - watch pods creates 2 by 2 
kubectl get pods --selector=job-name=random-hash -w 
# Check Final pods status (notice ages)
kubectl get pods --selector=job-name=random-hash

# > NAME                READY   STATUS      RESTARTS   AGE
# > random-hash-pncw8   0/1     Completed   0          3m31s
# > random-hash-ftg8v   0/1     Completed   0          3m31s
# > random-hash-nhn6k   0/1     Completed   0          2m27s
# > random-hash-qz5zq   0/1     Completed   0          2m27s
# > random-hash-zr67c   0/1     Completed   0          82s

kubectl delete job random-hash
```
### Job restart policy

```shell
kubectl apply -f deployment/hash-restart-policy-never.yml 
kubectl get pods --selector=job-name=random-fail-job

# > NAME                    READY   STATUS      RESTARTS   AGE
# > random-fail-job-6lwc7   0/1     Error       0          33s
# > random-fail-job-6fqfg   0/1     Error       0          22s
# > random-fail-job-mrp2d   0/1     Completed   0          2s

kubectl replace --force=true -f deployment/hash-restart-policy-on-failure.yml 
kubectl get pods --selector=job-name=random-fail-job

# > NAME                    READY   STATUS      RESTARTS   
# > random-fail-job-hqqhd   0/1     Completed   0          16s
```

### Cron jobs 

```shell
kubectl create cronjob current-date --schedule="* * * * *" --image=busybox:1.36.1 -- //bin/sh -c 'echo "Current date: $(date)"'
kubectl get pods 
# > NAME                          READY   STATUS      RESTARTS   AGE
# > current-date-28340513-9rfsz   0/1     Completed   0          2m14s
# > current-date-28340514-q4bsh   0/1     Completed   0          74s
# > current-date-28340515-vmj9r   0/1     Completed   0          14s

kubectl get cronjobs
# > NAME           SCHEDULE    SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# > current-date   * * * * *   False     0        52s             71s


kubectl replace --force=true -f deployment/cronjob.yml


kubectl apply -f deployment/google-cronjob.yml
kubectl get pod -l cron-job-name=google-ping
# > NAME                         READY   STATUS      RESTARTS   AGE
# > google-ping-28341641-prtnd   0/1     Completed   0          74s
# > google-ping-28341642-2rlxh   0/1     Completed   0          14s

kubectl get jobs -l cron-job-name=google-ping
# > NAME                   COMPLETIONS   DURATION   AGE
# > google-ping-28341641   1/1           15s        109s
# > google-ping-28341642   1/1           10s        49s

# Forbid concurrency 
kubectl apply -f deployment/cronjob-concurrency.yml
kubectl get job -l concurrent-job
# > NAME                           COMPLETIONS   DURATION   AGE
# > current-date-forbid-28341697   1/1           103s       5m41s
# > current-date-forbid-28341698   1/1           104s       3m58s
# > current-date-forbid-28341700   1/1           103s       2m14s
# > current-date-forbid-28341702   0/1           31s        31s

```
