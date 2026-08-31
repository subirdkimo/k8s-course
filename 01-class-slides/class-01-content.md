# Class 1 — Proxmox VE 虛擬化平台概論（9.x 最新版）

> 時長：約 2 hr　|　投影片：`class-01-pve-overview.pptx`　|　Lab：`lab-01-pve-overview.md`

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

### 1.5 虛擬化三種形態（觀念）

「讓多台電腦在同一台機器上跑」有三种主流做法，隔離程度與輕量程度是一條光譜：

| 形態 | 代表 | 隔離程度 | 啟動/密度 | 適用 |
|------|------|----------|-----------|------|
| **Type-1（裸機）** | PVE、VMware ESXi | 最強（每 Guest 是完整 OS） | 稍慢、密度中等 | 生產虛擬化平台、K8s 節點 VM |
| **Type-2（主機）** | VMware Workstation、VirtualBox | 最弱（先裝一個宿主 OS） | 最慢、最佔資源 | 桌機開發、教學 |
| **容器（OS-level）** | LXC、Docker | 中（共用宿主核心，行程層隔離） | 最快、密度最高 | 應用打包、微服務 |

**為什麼 PVE 選 Type-1**：直接跑在硬體上，少一層宿主 OS → 效能、穩定性、密度最佳，生產環境標準。

**跟 K8s 的關係**：K8s 管的是「容器（最輕一層）的編排」；本課程用 PVE 把 K8s 節點本身裝成 VM —— 即「輕量容器跑在重隔離的 VM 裡」，兩層各司其職。

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

### 2.4 隔離與效能的取捨（觀念）

虛擬化本質上是在 **「隔離」與「效能」** 之間取捨：

- **全虛擬化（VM）**：Guest 以為自己有完整硬體 → 隔離最強、可跑任意 OS，但裝置操作要經 QEMU 模擬/轉譯，效能有折損。
- **半虛擬化（VirtIO）**：Guest 安裝「知道自己是虛擬」的驅動，直接跟 hypervisor 對話 → 折損大幅降低（通常 <5%），**K8s 節點必用**。
- **容器**：完全不模擬硬體、共用宿主核心 → 效能幾乎零折損、密度最高，但犧牲了「不同 OS」與強隔離。

> **心智模型**：隔離越強越安全也越貴（效能/資源）；K8s 生產環境通常取「VM 的強隔離 ＋ VirtIO 的高速」，應用層才用容器換密度。

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

### 3.3 精簡供應、快照與超售（觀念）

三個常被談到但容易混淆的概念：

- **精簡供應（Thin Provisioning）**：先「預留」磁碟空間，實際寫入才佔用 → 節省空間，但預留量超出實體容量時會「寫入失敗」（under-provision 風險）。
- **快照（Snapshot）**：某時間點的磁碟狀態，可快速還原、可比對；**不是備份**（快照存在原磁碟系統內，原系統掛掉快照也喪失）。
- **超售（Overcommit / Oversell）**：把「預留總量」賣得比實體容量多（例如 100 TB 實體賣 150 TB 虛擬），前提是「實際使用量遠低於預留」—— 適合開發/測試，**不適合生產**。

> **心智模型**：精簡供應是「先開帳、後付款」；快照是「時間機器」；超售是「多賣房號」—— 三者都依賴「實際用遠少於預留」這個假設，假設破了就出事。
>
> **對 K8s 的意義**：K8s PV 的 capacity 宣告也是「預留」，不是「保證可用量」；生產建議搭配 Ceph 的硬限制（quota）與定期備份（PBS）分層保護。

---

## 4. 網路

### Linux Bridge（VM 對外網路）
- 每個 PVE 節點以 `vmbrX` bridge 連結實體 NIC 與 VM 的 vNIC。
- VM 透過 vNIC（VirtIO）接到 bridge，取得對外網段 IP。
- K8s 節點 VM 接在 bridge 後，由 K8s CNI（如 Calico）處理 **Pod 層次**的網路。

### VLAN / SDN
- **VLAN**：單一實體線路切分成多個隔離網段。
- **SDN（Software Defined Networking）**：PVE 9.2 新增 **Dynamic Load Balancer** 與 **WireGuard** 支援，可集中管理跨節點的虛擬網路。

### 4.3 封包流向心智模型

一台 VM 的資料包到網外（如另一台 VM 或外部系統）的路徑：

```
VM 內的應用
   │  封包（MAC / IP）
   ▼
vNIC（VirtIO NIC）
   │
   ▼
Linux Bridge vmbrX（交換作用：按 MAC 學習表轉發）
   │
   ▼
實體 NIC → 實體交換機 → 目的地
```

三個觀念重點：

1. **Bridge 是「交換機」**：封包不經過 PVE 内核的 IP 層（不像 NAT），VM 之間在**同一網段**交換 MAC 即可，效能接近原生。
2. **VM 是「真機」**：它在 bridge 上就跟外部實體主機平起平坐，可被 ping、可被路由 —— 因此 K8s 節點 VM 可直接使用實體交換機的功能（VLAN、ACL、QoS）。
3. **NAT（網關模式）的差異**：若 VM 只可「對外出、不能被找」，那是 NAT；生產 K8s 用 Bridge 是因為 K8s 需要節點間**雙向**且可預測的 IP 通訊。

> **跟 K8s 的分界**：PVE/bridge 負責「VM（=K8s 節點）之間與對外的網路」；**Pod 之間**的網路才由 K8s CNI（Class 3）管 —— 兩層網路不要混淆。

---

## 5. 叢集、HA、備份、快照（運維基礎）

- **叢集 (Cluster)**：多台 PVE 以 `corosync + pve-cluster` 組成，共用 Web/API 與 HA 資源池。
- **HA**：PVE 監控 VM 健康，節點故障時在另一節點重新啟動 VM（需共用儲存，如 Ceph）。
- **備份**：`vzdump` 產生 VM/容器備份；**Proxmox Backup Server (PBS)** 提供去重、加密、增量備份。
- **快照 (Snapshot)**：VM 某時間點的狀態，可還原；K8s 節點升級/實驗前打快照很方便。

### 5.3 高可用觀念（quorum 與「重啟 vs 遷移」）

- **Quorum（法定人數）**：叢集要「多數節點存活」才認帳（3 節集容許 1 掉線、5 容許 2）。這就是 HA 要**奇數節點**的原因 —— 偶數（如 4）在 2 掉時「兩票對兩票」無法決定誰是正統，整個叢集癱瘓。
  - **Split-brain（腦裂）**：若網路割裂讓兩組節點各以為自己是多數，會各自操作同一份資料 → Ceph 等共用儲存靠 quorum 與副本仲裁避免雙寫。
- **PVE HA 是「故障重啟（relocate）」不是「無縫接管」**：節點掛掉，VM 在另一節點**重新開機**（有秒到分鐘級中斷），不是像 VMware FT 那樣的熱遷移零中斷。
- **備份 vs 快照 vs HA 的分層**：
  - **HA**：處理「單節點故障」的可用度（應用層還有 K8s 的自癒，Class 2）。
  - **備份 (PBS/vzdump)**：處理「誤刪、勒索、整叢集壞」的災難復原（PITR）。
  - 两者**互補、不互相取代**。

> **心智模型**：quorum 是「開會要過半數才作數」；HA 是「一台倒了另一台頂上（但會重開）」；備份是「保險箱」。三層加起來才是完整的營運韌性。
>
> **對 K8s 的意義**：基礎設施層（PVE HA + 備份）撐住節點 VM，K8s 層（Class 2/3）再撐住 Pod —— 兩層各自容錯，才是真正的高可用。

---

## 6. Lab（建 VM、快照、備份）
1. 匯入 cloud image 建 VM 範本。
2. 由範本複製出節點 VM，設定 IP。
3. 對 VM 建立快照並還原。
4. 建立一次 `vzdump` 備份並查看備份檔。

> 詳細步驟見 `lab-01-pve-overview.md`。
