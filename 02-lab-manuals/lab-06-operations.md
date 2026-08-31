# Lab 6 — 運維實作：StorageClass、備份、監控、升級

> 目標：整合儲存、建立監控、執行 etcd/K8s 備份、演練升級。
> 前置：完成 Lab 5（叢集已可在 6 台節點運作）。

## 1. Metrics Server（供 kubectl top 與 HPA）
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl top nodes
kubectl top pods
```

## 2. StorageClass + 有狀態應用
使用 ceph-csi（若 PVE 有 Ceph）或 local-path，內容見 Lab 3。範例建立一個 Postgres StatefulSet 並確認 PVC Bound。

## 3. 監控（kube-prometheus-stack）

```bash
kubectl create ns monitoring

# 安裝 kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring
kubectl -n monitoring get pods
kubectl -n monitoring get svc   # 觀察 grafana LoadBalancer/NodePort
```

## 4. etcd 備份演練
在 cp1：
```bash
sudo ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /backup/etcd-$(date +%F).db
sudo ETCDCTL_API=3 etcdctl --write-out=table snapshot status /backup/etcd-*.db
```
> 將此備份排入 cron；另可評估 Velero 做應用層備份。

## 5. 升級演練（1.36 → 1.37，控制平面）
```bash
# cp1
sudo apt-mark unhold kubeadm
sudo apt-get update && sudo apt-get install -y kubeadm=1.37.x
sudo apt-mark hold kubeadm
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.37.0
# 再更新 kubelet/kubectl 後 restart
sudo systemctl restart kubelet
kubectl get nodes
```
> 依序對 cp2/cp3 執行 `kubeadm upgrade node`，最後 worker 以 drain+upgrade+uncordon 滾動升級。

## 6. PVE 層備份
```bash
vzdump 101 --mode snapshot --compress zstd --storage backup
```

## 驗證
- `kubectl top` 正常。
- Grafana 面板可連與登入。
- etcd 備份檔存在且可 status。
- 升級後 node 皆 Ready。
