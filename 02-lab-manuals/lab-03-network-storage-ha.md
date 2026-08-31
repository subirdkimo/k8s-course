# Lab 3 — 網路、儲存與高可用實作

> 目標：建立 PVC/StorageClass、StatefulSet，實作 LoadBalancer（MetalLB）與 NetworkPolicy。
> 前置：完成 Class 5 的叢集安裝（含 Calico）。

## 1. StorageClass + PVC
```yaml
# storageclass-local.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: {name: standard}
provisioner: rancher.io/local-path   # 或 ceph/rbd
volumeBindingMode: WaitForFirstConsumer
```
```bash
kubectl apply -f storageclass-local.yaml
kubectl get sc
kubectl create -f pvc.yaml          # PVC 宣告 1Gi
kubectl get pvc                     # 確認 Bound
```

## 2. StatefulSet（有狀態應用）
```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata: {name: web}
spec:
  serviceName: "web"
  replicas: 2
  selector: {matchLabels: {app: web}}
  template:
    metadata: {labels: {app: web}}
    spec:
      containers:
        - name: nginx
          image: nginx
          volumeMounts: [{name: www, mountPath: /usr/share/nginx/html}]
  volumeClaimTemplates:
    - metadata: {name: www}
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: "standard"
        resources: {requests: {storage: 1Gi}}
```
```bash
kubectl apply -f statefulset.yaml
kubectl get statefulset,pvc,pods
kubectl get pvc   # 每個 Pod 有獨立的 www-web-0, www-web-1
```

## 3. MetalLB（LoadBalancer）
```bash
kubectl create ns metallb-system
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14/metallb-native.yaml
```
配置 IP 位址池：
```yaml
# lb-ip.yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata: {name: pool, namespace: metallb-system}
spec: {addresses: ["192.168.10.200-192.168.10.220"]}
```
```bash
kubectl apply -f lb-ip.yaml
kubectl expose deployment web --port=80 --type=LoadBalancer
kubectl get svc web   # EXTERNAL-IP 出現 192.168.10.x
```

## 4. NetworkPolicy
```yaml
# np.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: deny-all}
spec:
  podSelector: {}
  policyTypes: [Ingress]
```
```bash
kubectl apply -f np.yaml
kubectl exec -it <pod> -- curl <other-pod-ip>   # 預期被擋/逾時
kubectl delete -f np.yaml
```

## 驗證
- PVC Bound、StatefulSet Pod 各有獨立磁碟。
- LoadBalancer 取得外部 IP 且可存取。
- NetworkPolicy 生效。
