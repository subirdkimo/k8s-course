# Class 6 — 上線運維：網路、儲存、備份、監控與升級

> 時長：1 hr 15 min　|　投影片：`class-06-operations.pptx`　|　Lab：`lab-06-operations.md`

## 1. 儲存整合（StorageClass + ceph-csi）

PVE 上的 Ceph 提供 K8s 的動態供應：

```bash
# 使用 ceph-csi（RBD）建立 StorageClass
kubectl create -f csi-rbd-secret.yaml            # 含 ceph 驗證資訊
kubectl create -f storageclass-rbd.yaml

# 部署有狀態應用（掛載 PVC）
kubectl create -f statefulset-postgres.yaml
kubectl get pvc   # 確認 Bound
```

- **RWO**：RBD 首選；**RWX**：CephFS 或 NFS。
- 亦可使用 **local-path-provisioner**（節點本機磁碟）做快速 Lab 儲存。

---

## 2. 備份與災難復原

### PVE 層（整機備份）
- `vzdump` 或 **Proxmox Backup Server (PBS)**：備份每個 K8s 節點 VM。
- 可搭配快照，還原整台 VM。

### K8s 層（應用與狀態）
- **etcd 備份**：控制平面的 etcd 定期備份（最核心）。
  ```bash
  sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
    --cacert=/etc/kubernetes/pki/etcd/ca.crt \
    --cert=/etc/kubernetes/pki/etcd/server.crt \
    --key=/etc/kubernetes/pki/etcd/server.key \
    snapshot save /backup/etcd-snapshot-$(date +%F).db
  ```
- **Velero**：備份整個 K8s 資源（含 PVC）到物件儲存/本機，支援還原。

---

## 3. 監控與可觀察性

- **Metrics Server**：提供 `kubectl top` 所需的 pod/node 指標，也是 HPA 基礎。
  ```bash
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  kubectl top nodes ; kubectl top pods
  ```
- **Prometheus + Grafana**：完整指標收集與儀表板（kube-prometheus-stack）。
- **Loki / ELK**：日誌收集。
- **kubectl logs / describe / events**：日常除錯。

---

## 4. 安全性

- **RBAC**：Roles/ClusterRoles + RoleBindings 最小權限。
- **NetworkPolicy**：以 Calico/Cilium 控制「誰能連誰」。
- **Pod Security**：Pod Security Standards (`restricted` / `baseline` / `privileged`)。
- **Secret 管理**：避免純 base64；可搭配 Sealed Secrets / External Secrets Operator。
- 保持 **版本最新補丁**、限制金鑰權限、啟用審計日誌。

---

## 5. 升級策略（kubeadm 升級 1.36 → 1.37）

1. **備份** etcd 與重要資源。
2. 升級 `kubeadm`（解除 hold → 更新套件 → 再 hold）。
   ```bash
   sudo apt-mark unhold kubeadm
   sudo apt-get update && sudo apt-get install -y kubeadm=1.37.x
   sudo apt-mark hold kubeadm
   ```
3. **先升級控制平面**：`sudo kubeadm upgrade plan` → `sudo kubeadm upgrade apply v1.37.0`（逐台 cp）。
4. 升級 kubelet/kubectl，`systemctl restart kubelet`。
5. **再升級 worker**：`kubeadm upgrade node`、`kubectl drain` + 升級 + `uncordon`，逐台滾動。
6. 每次只升一個 minor，遵守**版本偏差策略**（apiserver 之間最多差 1 個 minor）。

> 依 Kubernetes 官方策略：cluster 每 3 個月一個 minor，1.19+ 約 1 年 patch 支援。

---

## 6. 期末專案（延伸）
> 完整目標見 `04-exercises/FINAL-PROJECT.md`。

---

## 課後速查
- 所有常用指令見 `03-cheatsheets/kubectl-cheatsheet.md` 與 `kubeadm-cheatsheet.md`。
