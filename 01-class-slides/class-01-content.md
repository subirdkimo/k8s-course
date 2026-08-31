# Class 1 — Proxmox VE 虛擬化平台概論（9.x 最新版）

> 時長：1 hr 15 min　|　投影片：`class-01-pve-overview.pptx`　|　Lab：`lab-01-pve-overview.md`

## 1. PVE 是什麼與架構

**Proxmox VE (PVE)** 是一套 **開放原始碼 (AGPLv3) 的 Type-1 伺服器虛擬化平台**，將虛擬機（KVM/QEMU）與容器（LXC）管理整合在單一 Web 介面與 API 中，並內建儲存（Ceph/ZFS）與高可用（HA）能力。

### 核心組成
- **Hypervisor**：Linux 核心 + `KVM/QEMU`（虛擬機）+ `LXC`（系統容器）。
- **管理堆疊**：`pve-manager`、`pve-cluster`（corosync）、`pve-ha-manager`、`pve-firewall`。
- **Web UI**：`https://<pve-ip>:8006`（HTML5 管理介面）。
- **API**：完整 RESTful API，可用於自動化（與 Terraform、Ansible 整合）。

### PVE 9.x 最新版重點（2026）
| 版本 | 發佈 | 重點 |
|------|------|------|
| 9.0 | 2025-08 | 基於 Debian 13 Trixie、核心 6.14、QEMU、Ceph Squid |
| 9.1 | 2025-11 | 多項改進與修正 |
| 9.2 | 2026-05 | **核心 7.0**、**Dynamic Load Balancer**、**WireGuard SDN** |
| 9.x | 2026 | **原生 Arm64 支援**（NVIDIA Grace/Vera） |

> **重要**：PVE 8.x 已於 **2026-08 停止支援（EOL）**，本課程一律以 9.x 為準。

---

## 2. 虛擬化技術原理

### QEMU/KVM（虛擬機）
- **KVM**（Kernel-based Virtual Machine）：Linux 核心內建的 Type-1 hypervisor。
- **QEMU**：使用者空間的裝置模擬層，提供 CPU/記憶體/磁碟/網路裝置模型。
- 兩者合作為「全虛擬化」，Guest 不需改核心即可執行，效能接近原生。

### LXC（系統容器）
- 行程層級隔離，共用宿主核心，啟動快、密度高。
- 適合不需完整 OS 隔離的服務；K8s 節點通常用 VM 而非 LXC。

### CPU / 記憶體 / 磁碟模型（K8s 重要）
- **CPU type**：`host`（效能最高，暴露全部指令集）vs `x86-64-v2-AES`（可攜、可 live migration）。同質硬體→`host`；異質/需遷移→`x86-64-v2-AES`。裸機 K8s 節點建議 `host`。
- **VirtIO（半虛擬化）**：虛擬 NIC/磁碟的高效能驅動，Linux Guest 內建，K8s 節點必用。
- **qemu-guest-agent**：讓宿主持有 Guest 的 IP、執行客製的乾淨關機、快照協調。

---

## 3. 儲存（K8s PV 的基礎）

PVE 支援多種儲存後端，K8s 叢集最常搭配：

| 儲存 | 特性 | K8s 應用 |
|------|------|----------|
| **Local** | 單節點目錄 | OS、模板 |
| **LVM-Thin** | 磁碟快照、精簡供應 | VM 磁碟 |
| **ZFS** | 快照、世代、資料保護 | VM 磁碟、共用資原始 |
| **Ceph** (RBD) | **分散式共用儲存、HA、可擴充** | **K8s PersistentVolume（透過 ceph-csi）** |
| **NFS** | 網路共用 | ReadWriteMany 應用 |

> **對 K8s 的意義**：RWO（單節點讀寫）通常用 RBD/Ceph；如需 RWX（多節點）可考慮 NFS 或 CephFS。K8s 節點的虛擬磁碟建議放 Ceph，才能做 VM live migration 與 HA。

---

## 4. 網路

### Linux Bridge（VM 對外網路）
- 每個 PVE 節點以 `vmbrX` bridge 連結實體 NIC 與 VM 的 vNIC。
- VM 透過 vNIC（VirtIO）接到 bridge，取得對外網段 IP。
- K8s 節點 VM 接在 bridge 後，由 K8s CNI（如 Calico）處理 **Pod 層次**的網路。

### VLAN / SDN
- **VLAN**：單一實體線路切分成多個隔離網段。
- **SDN（Software Defined Networking）**：PVE 9.2 新增 **Dynamic Load Balancer** 與 **WireGuard** 支援，可集中管理跨節點的虛擬網路。

---

## 5. 叢集、HA、備份、快照（運維基礎）

- **叢集 (Cluster)**：多台 PVE 以 `corosync + pve-cluster` 組成，共用 Web/API 與 HA 資源池。
- **HA**：PVE 監控 VM 健康，節點故障時在另一節點重新啟動 VM（需共用儲存，如 Ceph）。
- **備份**：`vzdump` 產生 VM/容器備份；**Proxmox Backup Server (PBS)** 提供去重、加密、增量備份。
- **快照 (Snapshot)**：VM 某時間點的狀態，可還原；K8s 節點升級/實驗前打快照很方便。

---

## 6. Lab（建 VM、快照、備份）
1. 匯入 cloud image 建 VM 範本。
2. 由範本複製出節點 VM，設定 IP。
3. 對 VM 建立快照並還原。
4. 建立一次 `vzdump` 備份並查看備份檔。

> 詳細步驟見 `lab-01-pve-overview.md`。
