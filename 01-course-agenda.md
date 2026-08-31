# 課程 Agenda 總表（各堂 1 ~ 1.5 小時）

> 每堂包含：Agenda、內容、投影片檔名、Lab 手冊檔名。
> 投影片位於 `01-class-slides/`，Lab 手冊位於 `02-lab-manuals/`。

---

## Class 0：課程導覽、環境與 Lab 準備（1 hr）

**投影片**：`class-00-lab-prep.pptx`　**Lab 手冊**：`lab-00-lab-prep.md`

| 時間 | 單元 |
|------|------|
| 00:00–00:10 | 課程介紹、目標、評量方式 |
| 00:10–00:25 | 環境總覽：PVE 9.x 主控台、網路、儲存 |
| 00:25–00:40 | Lab 準備：匯入 Ubuntu/Debian cloud image、建立 VM 範本（cloud-init） |
| 00:40–00:50 | 雲端範本複製成 6 台節點 VM |
| 00:50–01:00 | Lab 驗證、Q&A |

---

## Class 1：Proxmox VE 虛擬化平台概論（1 hr 15 min）

**投影片**：`class-01-pve-overview.pptx`　**Lab 手冊**：`lab-01-pve-overview.md`

| 時間 | 單元 |
|------|------|
| 00:00–00:10 | PVE 是什麼、架構（Hypervisor + 管理堆疊）、9.x 最新版重點 |
| 00:10–00:25 | 虛擬化技術：QEMU/KVM、LXC 容器、VirtIO、CPU/記憶體/磁碟模型 |
| 00:25–00:40 | PVE 儲存：Local、LVM-Thin、ZFS、Ceph（供 K8s PV 的共用儲存基礎） |
| 00:40–00:50 | PVE 網路：Linux Bridge、VLAN、SDN（動態負載平衡器 9.2 新功能） |
| 00:50–01:05 | 叢集、HA、備份（PBS）、快照 概念 |
| 01:05–01:15 | Lab：建立 VM、快照、備份/還原體驗 |

---

## Class 2：Kubernetes 核心架構與運作原理（1 hr 30 min）

**投影片**：`class-02-k8s-core.pptx`　**Lab 手冊**：`lab-02-k8s-core.md`

| 時間 | 單元 |
|------|------|
| 00:00–00:15 | 容器與容器編排動機、K8s 定位 |
| 00:15–00:35 | 控制平面元件：kube-apiserver、etcd、kube-scheduler、kube-controller-manager |
| 00:35–00:50 | 工作節點元件：kubelet、kube-proxy、container runtime (containerd)、CRI |
| 00:50–01:05 | 核心物件：Pod、Deployment、ReplicaSet、Service、ConfigMap、Secret |
| 01:05–01:20 | 宣告式管理與 API 原理（kubectl ↔ apiserver ↔ etcd） |
| 01:20–01:30 | 課堂小測驗與 Q&A |

---

## Class 3：Kubernetes 網路、儲存與高可用元件（1 hr 30 min）

**投影片**：`class-03-network-storage-ha.pptx`　**Lab 手冊**：`lab-03-network-storage-ha.md`

| 時間 | 單元 |
|------|------|
| 00:00–00:20 | K8s 網路模型：Pod 間通訊、Service、Ingress、CNI（Calico / Cilium / Flannel） |
| 00:20–00:40 | 服務暴露：ClusterIP、NodePort、LoadBalancer（MetalLB） |
| 00:40–01:00 | 儲存抽象：PV / PVC / StorageClass、CSI（ceph-csi、local-path-provisioner）、StatefulSet |
| 01:00–01:20 | 高可用原理：多控制平面、etcd quorum、HAProxy/keepalived、Pod 多副本 |
| 01:20–01:30 | Lab 說明與 Q&A |

---

## Class 4：PVE 上 K8s 架構規劃與 VM 建置（1 hr 15 min）

**投影片**：`class-04-architecture-vm.pptx`　**Lab 手冊**：`lab-04-architecture-vm.md`

| 時間 | 單元 |
|------|------|
| 00:00–00:15 | 生產架構設計：3 控制平面＋N worker、分佈於不同 PVE 節點 |
| 00:15–00:30 | PVE 上 VM 最佳實踐：CPU type、磁碟 bus、VirtIO、qemu-guest-agent、資源規畫 |
| 00:30–00:45 | 網路規畫：管理網段 vs K8s 網段、專用 bridge/VLAN、防火牆 |
| 00:45–01:00 | 儲存規畫：Ceph 供 K8s PV、節點 OS 用 local 儲存 |
| 01:00–01:15 | Lab：依照架構建立 6 台節點 VM（3 cp + 3 worker）、設定 IP/主機名 |

---

## Class 5：使用 kubeadm 安裝高可用 Kubernetes（1 hr 30 min）

**投影片**：`class-05-kubeadm-install.pptx`　**Lab 手冊**：`lab-05-kubeadm-install.md`

| 時間 | 單元 |
|------|------|
| 00:00–00:10 | 安裝方式比較：kubeadm / k3s / RKE2 / 雲端託管 |
| 00:10–00:25 | 節點前置作業：containerd 安裝與設定（containerd 取代 Docker） |
| 00:25–00:40 | 安裝 kubeadm / kubelet / kubectl、設定 sysctl / 模組 |
| 00:40–00:55 | 初始化控制平面（含 etcd、apiserver flags） |
| 00:55–01:10 | 安裝 CNI（Calico/Cilium）、加入其他控制平面與 worker |
| 01:10–01:25 | 驗證叢集、設定 kubectl、部署第一個 Deployment |
| 01:25–01:30 | 常見安裝錯誤排除 |

---

## Class 6：上線運維 — 網路、儲存、備份、監控與升級（1 hr 15 min）

**投影片**：`class-06-operations.pptx`　**Lab 手冊**：`lab-06-operations.md`

| 時間 | 單元 |
|------|------|
| 00:00–00:15 | 儲存整合：安裝 StorageClass（ceph-csi）、部署有狀態應用 |
| 00:15–00:30 | 備份與災難復原：PVE 層（VZDump/PBS）＋ K8s 層（Velero / etcd 備份） |
| 00:30–00:45 | 監控與可觀察性：Metrics Server、Prometheus、Grafana、kubectl top/logs |
| 00:45–01:00 | 安全性：RBAC、NetworkPolicy、PodSecurity、Secret 管理 |
| 01:00–01:15 | 升級策略：kubeadm 升級一個 minor version（1.36→1.37）、滾動升級 |
| 01:15 (延伸) | 期末專案說明 |

---
