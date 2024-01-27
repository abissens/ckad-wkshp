### Helm chart (WIP)

* Helm is a templating engine and package manager for a set of Kubernetes manifests. 
* At runtime, it replaces placeholders in YAML template files with actual, end-user defined values. 
* The artifact produced by the Helm executable is a so-called chart file bundling the manifests that comprise the API resources of an application. 
* You can upload the chart file to a chart repository so that other teams can be use it to deploy the bundled manifests. 
* The Helm ecosystem offers a wide range of reusable charts for common use cases searchable on [Artifact Hub](https://artifacthub.io/) (e.g., for running Grafana or PostgreSQL).

* The exam does not expect you be a Helm expert; rather, it wants you to be familiar with the workflow of installing existing packages with Helm. 
* Building and publishing your own charts is out-of-scope for the exam. 

Helm usage workflow : 

1. Identifying the chart you’d like to install.
2. Adding the repository containing the chart.
3. Installing the chart from the repository.
4. Verifying the Kubernetes objects that have been installed by the chart.
5. Rendering the list of installed charts.
6. Upgrading a chart if a newer version has been released.
7. Uninstalling a chart if its functionality is not needed anymore.


### Multi object application 

```shell
docker build -t friends-service:0.4.0  ./friends-v4
kubectl delete -f ./deployment/friends-v4-raw/mongo.yml
kubectl delete -f ./deployment/friends-v4-raw/mongo-init-job.yml
kubectl create -f ./deployment/friends-v4-raw/mongo.yml
kubectl create -f ./deployment/friends-v4-raw/mongo-init-job.yml
```




### Install Jenkins with Helm 

```shell
helm version 
# version.BuildInfo{Version:"v3.12.1", GitCommit:"f32a527a060157990e2aa86bf45010dfb3cc8b8d", GitTreeState:"clean", GoVersion:"go1.20.4"}
helm repo list
# Error: no repositories to show
# Note : find jenkins repo in https://artifacthub.io/packages/helm/jenkinsci/jenkins 
helm repo add jfrog https://charts.jfrog.io
helm repo update
helm repo list
# NAME            URL                       
# jfrog           https://charts.jfrog.io

helm search repo jfrog
# Note : this gives available charts 
# NAME                    CHART VERSION   APP VERSION     DESCRIPTION                                       
# jfrog/jfrog-platform            10.16.5         7.71.11         The Helm chart for JFrog Platform (Universal, h...
# jfrog/jfrog-registry-operator   1.0.0           1.0.0           JFrog Registry Operator to manage JFrog applica...
# jfrog/artifactory               107.71.11       7.71.11         Universal Repository Manager supporting all maj...
# ...

openssl rand -hex 32
# 1ec2a3b1f0016b87fd1f83d00bf8e5a9f1971b34ae509087854f6e33c664a5bc
openssl rand -hex 32
# 55bbf66750c854ec6f7bdf87bc1974b2c96d7e9c40861c87d06ced907b0bc644
helm install my-artifactory --values .\deployment\artifactory-values.yml jfrog/artifactory --version=107.71.11 --debug

kubectl get all,pv,pvc -l app.kubernetes.io/managed-by=Helm
kubectl get all,pv,pvc -l heritage=Helm
# NAME                              READY   STATUS              RESTARTS   AGE
# pod/my-artifactory-postgresql-0   0/1     ContainerCreating   0          14s
# 
# NAME                                         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
# service/my-artifactory-postgresql-headless   ClusterIP      None            <none>        5432/TCP                     15s
# service/my-artifactory                       ClusterIP      10.43.152.205   <none>        8082/TCP,8085/TCP,8081/TCP   15s
# service/my-artifactory-postgresql            ClusterIP      10.43.24.77     <none>        5432/TCP                     15s
# service/my-artifactory-artifactory-nginx     LoadBalancer   10.43.151.157   <pending>     80:31221/TCP,443:32711/TCP   15s
# 
# NAME                                               READY   UP-TO-DATE   AVAILABLE   AGE
# deployment.apps/my-artifactory-artifactory-nginx   0/1     1            0           15s
# 
# NAME                                         READY   AGE
# statefulset.apps/my-artifactory              0/1     15s
# statefulset.apps/my-artifactory-postgresql   0/1     15s

kubectl create ingress jenkins-ing --rule="/my-jenkins=my-jenkins:8080"
# 172.23.156.25
helm uninstall my-artifactory


-------------------------
kubectl create namespace gitlab-ns
kubectl config set-context --current --namespace=gitlab-ns
kubectl get all,pv,pvc

helm repo add gitlab https://charts.gitlab.io
helm repo update
helm repo list
helm search repo gitlab
# NAME                            CHART VERSION   APP VERSION     DESCRIPTION
# gitlab/gitlab                   7.8.0           v16.8.0         GitLab is the most comprehensive AI-powered Dev...
# gitlab/gitlab-agent             1.23.0          v16.8.0         GitLab Agent for Kubernetes is a way to integra...
# gitlab/gitlab-omnibus           0.1.37                          GitLab Omnibus all-in-one bundle
# ...

helm install my-gitlab gitlab/gitlab --version=7.8.0 --debug --namespace=gitlab-ns --values .\deployment\gitlab-variables.yml
kubectl get all,pv,pvc
# multiple objects provisioned
 
kubectl get pods
# wait for all pods OK

helm uninstall my-gitlab 
```
