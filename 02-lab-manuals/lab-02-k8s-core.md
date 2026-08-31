# Lab 2 — Kubernetes 核心概念動手做

> 目標：實際體驗宣告式管理、Deployment、Service 等核心物件。
> 前置：已有一個可用的 K8s 叢集（見 Lab 5）或使用 `kind`/minikube 單機。

## 1. kubectl 基本
```bash
kubectl version
kubectl get nodes
kubectl cluster-info
```

## 2. 宣告式建立 Deployment
```yaml
# deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels: {app: web}
spec:
  replicas: 3
  selector: {matchLabels: {app: web}}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports: [{containerPort: 80}]
```
```bash
kubectl apply -f deploy.yaml
kubectl get deploy,rs,pods -o wide
kubectl describe deployment web
```

## 3. Service 暴露
```bash
kubectl expose deployment web --port=80 --type=NodePort
kubectl get svc
curl $(kubectl get nodes -o jsonpath='{.items[0].status.addresses[0].address}'):<nodeport>
```

## 4. 縮放與自癒
```bash
kubectl scale deployment web --replicas=5
kubectl delete pod web-<hash> ; kubectl get pods   # 觀察自動重建
kubectl rollout status deployment/web
```

## 5. ConfigMap / Secret
```yaml
# cm.yaml
apiVersion: v1
kind: ConfigMap
metadata: {name: app-config}
data: {APP_COLOR: blue}
```
```bash
kubectl apply -f cm.yaml
kubectl get cm app-config -o yaml
```

## 驗證
- 3→5 副本成功，Pod 被刪會自動重建。
- Service 可透過 NodePort 存取。
