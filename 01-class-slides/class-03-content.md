# Class 3 — Kubernetes 網路、儲存與高可用元件

> 時長：1 hr 30 min　|　投影片：`class-03-network-storage-ha.pptx`　|　Lab：`lab-03-network-storage-ha.md`

## 1. Kubernetes 網路模型

K8s 的基本網路要求（**Pod 之間、不需 NAT 直接互通**、且每個 Pod 有自己的 IP）：

- 每支 **Pod 有獨立 IP**（跨節點也可直連）。
- **CNI（Container Network Interface）** 實作 Pod 網路，常見選項：
  - **Calico**：效能高、支援 NetworkPolicy（層三網格），本課程採用。
  - **Cilium**：基於 eBPF，功能最豐富（可觀測性、進階網路策略）。
  - **Flannel**：簡單、易上手，但 NetworkPolicy 支援較弱。

### Pod ↔ Pod（跨節點）
CNI 透過 overlay（如 VXLAN）或 direct routing（Calico BGP）讓不同節點上的 Pod 可以互連。

### Service 網路（ClusterIP）
- kube-proxy 在每個節點寫入 iptables/IPVS 規則。
- Service 的 ClusterIP 代表一組後端 Pod（Endpoints），**自動負載平衡**。

---

## 2. 服務暴露方式

| 方式 | 說明 | 適用 |
|------|------|------|
| **ClusterIP** | 叢集內虛擬 IP，僅叢集內可達 | 內部服務 |
| **NodePort** | 每個節點上的某個連接埠導向 Service | 簡單對外、測試 |
| **LoadBalancer** | 需外部 LB 提供第4層 VIP | 對外正式服務（PVE 上常用 **MetalLB**） |
| **Ingress** | 七層（HTTP/HTTPS）路由，依據 host/path | 對外 Web 服務（Ingress Controller） |

> **PVE 上的 LoadBalancer**：PVE 內建 Dynamic Load Balancer（9.2）或自行部署 **MetalLB** 提供 K8s `LoadBalancer` Service，也可用 HAProxy。

---

## 3. 儲存抽象：PV / PVC / StorageClass / CSI

| 詞彙 | 說明 |
|------|------|
| **PersistentVolume (PV)** | 由管理員或 StorageClass 建立的實際儲存磁碟區。 |
| **PersistentVolumeClaim (PVC)** | 應用宣告「我需要多少容量／何種存取模式」的請求。 |
| **StorageClass** | 描述儲存類型（如 rbd-ceph、local-path），供**動態供應** PV。 |
| **CSI** | Container Storage Interface —— 標準連接 K8s 與各種儲存後端（如 **ceph-csi**、**local-path-provisioner**）。 |

### 存取模式
- **RWO** (ReadWriteOnce)：單一節點讀寫（RBD/Ceph 常見）。
- **ROX / RWX**：唯讀多點 / 多節點可寫（NFS / CephFS）。

### 有狀態應用
- **StatefulSet**：為每個 Pod 提供穩定且唯一的身分（序號、PVC 綁定），適合資料庫、訊息佇列。
- Deployment 適合無狀態；StatefulSet 適合有狀態。

---

## 4. 高可用（HA）原理

### 控制平面 HA
- K8s 成長期是**單一 apiserver**；生產環境需 **≥3 控制平面**，etcd 以奇數成員形成 **quorum**（多數決）。
- 需要有**負載平衡器**（HAProxy/keepalived 或 PVE LB）把 apiserver 流量分散到多個控制平面。

### 工作負載 HA
- 透過 **Deployment >1 副本** 跑在不同的 worker 節點上。
- 節點故障時 controller 會在其他節點重建 Pod（自癒）。
- **PodDisruptionBudget (PDB)** 控制自願中斷時最少可用的 Pod 數。

### 分散放置
- 在 PVE 上，把控制平面與 worker VM 分佈在**不同的 PVE 節點**，才能避免單一 PVE 主機故障拖垮整個 K8s 叢集。

---

## 5. Lab / 展示
- 檢視 Service、Ingress、StorageClass 設定。
- 建立一個有持久儲存的範例（StatefulSet + PVC）。
- 展示 Deployment 縮放與節點故障時的 Pod 重建。

> 詳細見 `lab-03-network-storage-ha.md`。
