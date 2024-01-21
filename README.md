### Links 

Exam handbook : https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2
Kubernetes documentation : https://kubernetes.io/docs/home/
CKAD exercices repo : https://github.com/dgkanatsios/CKAD-exercises
Kubernetes learning resources repo : https://github.com/kubernauts/Kubernetes-Learning-Resources
Exam guide: https://learning.oreilly.com/library/view/certified-kubernetes-application/9781098152857/
Exam tips : https://dev.to/devdpk/ckad-tips-2023-3n13

### Usefull commands 

#### Setting context/namespace

```shell
kubectl config get-contexts
kubectl config current-context
kubectl get namespaces --context <context>
kubectl config set-context <context> --namespace=<namespace>
kubectl config use-context <context>
```
