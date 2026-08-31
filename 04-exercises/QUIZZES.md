# 課堂小測驗（Quiz）

## Class 2：[核心架構]
1. 下列哪個元件儲存整個叢集狀態？(A) kubelet (B) etcd (C) kube-proxy (D) containerd
   → **B**
2. Pod 的最小管理單位由哪個控制器確保數量？(A) Deployment (B) Service (C) ConfigMap (D) Ingress
   → **A（Deployment 內含 ReplicaSet）**
3. K8s 自哪個版本後預設以 containerd 取代 Docker runtime？(A) 1.20 (B) 1.24 (C) 1.16 (D) 1.32
   → **B**
4. `kubectl` 透過何種協議呼叫 kube-apiserver？→ **HTTPS/REST API**

## Class 3：[網路/儲存/HA]
1. 下列何者為 CNI 實作之一？(A) containerd (B) Calico (C) etcd (D) HAProxy → **B**
2. 提供叢集內穩定虛擬 IP 的資源是？(A) Deployment (B) Service (C) PV (D) RBAC → **B**
3. 有狀態應用（如資料庫）較適合用？(A) Deployment (B) StatefulSet → **B**
4. etcd 高可用需幾個奇數成員以維持 quorum？→ **至少 3（多數決）**

## Class 5：[安裝]
1. 安裝 K8s 的官方工具是？→ **kubeadm**
2. 安裝哪個元件後 Pod 網段才連通？→ **CNI（Calico/Cilium/Flannel）**
3. 加入 worker 用的是哪個指令？→ **kubeadm join**
4. K8s 是否允許使用 swap？→ **否（需關閉）**

## Class 6：[運維]
1. 供 `kubectl top` 與 HPA 的元件是？→ **Metrics Server**
2. 控制平面最核心的備份是哪個？→ **etcd snapshot**
3. 升級時 apiserver 之間最多允許差幾個 minor？→ **1 個**
4. LoadBalancer 型別在 PVE 上常用何元件提供？→ **MetalLB（或 PVE Dynamic LB/HAProxy）**
