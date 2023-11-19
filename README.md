### Links 

Exam handbook : https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2
Kubernetes documentation : https://kubernetes.io/docs/home/
Kubernetes playground : https://labs.play-with-k8s.com/
CKAD exercices repo : https://github.com/dgkanatsios/CKAD-exercises
Kubernetes learning resources repo : https://github.com/kubernauts/Kubernetes-Learning-Resources
Exam guide: https://learning.oreilly.com/library/view/certified-kubernetes-application/9781098152857/


### Usefull commands 

#### Setting context/namespace

```shell
kubectl config get-contexts
kubectl config current-context
kubectl get namespaces --context <context>
kubectl config set-context <context> --namespace=<namespace>
kubectl config use-context <context>
```
