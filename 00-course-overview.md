# PVE 環境下 Kubernetes 運作原理與安裝 — 工程師訓練課程

> 版本：v1.2　|　適用環境：Proxmox VE 9.x　|　Kubernetes 1.36/1.37
> 每堂課約 **1 ~ 2.25 小時**（Class 1 含觀念深化 2 hr、Class 2 含 OCP 比較與觀念深化 2 hr 15 min），共 7 堂課（觀念＋理論＋實作）。

---

## 課程目標

讓學員從零開始，具備在 **Proxmox VE (PVE)** 虛擬化平台上：

1. 理解 Kubernetes 的核心架構與運作原理（控制平面、節點、工作負載、網路、儲存）。
2. 具備在 PVE 上建構、安裝、維護一個**高可用 Kubernetes 叢集**的實作能力。
3. 能夠針對現今（2026）最新版本的 PVE 9.x 與 Kubernetes 1.36/1.37 進行正確的架構決策與部署。
4. 具備基本故障排除、備份還原、升級維護的工程能力。

---

## 課程總覽（7 堂課）

| 堂 | 主題 | 時長 | 類型 |
|----|------|------|------|
| 0 | 課程導覽、環境與 Lab 準備 | 1 hr | 實作 |
| 1 | Proxmox VE 虛擬化平台概論（9.x 最新版，含觀念深化） | 2 hr | 觀念＋實作 |
| 2 | Kubernetes 核心架構與運作原理（含 K8s vs OpenShift 比較、觀念深化） | 2.25 hr | 觀念＋理論 |
| 3 | Kubernetes 網路、儲存與高可用元件 | 1.5 hr | 理論＋實作 |
| 4 | PVE 上 K8s 架構規劃與 VM 建置 | 1.25 hr | 實作 |
| 5 | 使用 kubeadm 安裝高可用 Kubernetes（1.36/1.37） | 1.5 hr | 實作 |
| 6 | 上線運維：網路、儲存、備份、監控與升級 | 1.25 hr | 實作 |

> **總時長**：約 **10.5–11 小時**的教學＋實作。
> 每堂課皆含 **Agenda、內容、講師投影片、Lab 手冊、課後作業**。
> **補充**：Class 2 課末新增「**比較：Kubernetes vs Red Hat OpenShift (OCP)**」（含 pros/cons），實際講授約 10 分鐘，可視時間彈性取捨。

---

## 版本資訊（2026 最新，課程基準）

### Proxmox VE（最新 9.x 系列）
- **PVE 9.0**：2025-08-05 發佈，基於 **Debian 13 "Trixie"**，核心 6.14。
- **PVE 9.1**：2025-11-19 發佈。
- **PVE 9.2**：2026-05-21 發佈，核心升級 **7.0**、新增 **Dynamic Load Balancer**、**WireGuard SDN**。
- **PVE 8.x** 已於 **2026-08 停止支援（EOL）**，本課程以 9.x 為準。
- 底層技術棧：QEMU 11.0、LXC 7.0、ZFS 2.4、Ceph Squid→Tentacle。
- 2026 新增 **原生 Arm64 支援**（NVIDIA Grace / Vera 平台）。

### Kubernetes（最新 1.37 / 1.36）
- **v1.37**：2026-08 發佈，Golang 1.26.5 建置。
- **v1.36 "Haru"**：2026-04-22 發佈，70 項增強（18 Stable、25 Beta、25 Alpha）。
- **v1.35**：2025 年下半年，已進維護模式。
- 本課程實作以 **v1.36 / v1.37** 為主要版本，容器執行期採用 **containerd**。

> 附註：因 Kubernetes 每年更新約 3 個 minor version，本課程的「安裝命令」與「功能特性」會以課程基準版本為準；版本策略（支援逾約 14 個月、每個月補丁更新）原理不變。

---

## 授課方式與實作環境

- **講師示範**：投影片講解原理 → 即時 demo。
- **學員 Lab**：每位學員（或每 2 人一組）在 PVE 上建立一組 3-node 高可用 Kubernetes 叢集。
- **建議硬體 Lab**（每組）：
  - 3 台 PVE 主機（或一台主機＋3 個 worker VM 的單節點 PVE 也可，但 HA 受限）。
  - 控制平面：3 台 VM（4 vCPU / 8 GB RAM / 40 GB 磁碟 以上）。
  - Worker：2～3 台 VM（8 vCPU / 16 GB RAM 以上）。
  - 共用儲存：Ceph（生產）或 ZFS/NFS（Lab）。

---

## 課程檔案清單

| 檔案 | 內容 |
|------|------|
| `00-course-overview.md` | 本檔（課程總覽） |
| `01-class-slides/` | 各堂投影片（.pptx） |
| `02-lab-manuals/` | 各堂 Lab 操作手冊（.md） |
| `03-cheatsheets/` | 命令速查表（.md） |
| `04-exercises/` | 課後作業與解答 |

---

## 先修能力

- 具備 Linux 基本操作（命令列、systemd、網路設定）。
- 具備虛擬化基本概念（VM、Hypervisor）尤佳。
- 不需具備 Kubernetes / 容器先前經驗（Part 1 會從頭教）。

---

## 評量方式（建議）

- 每堂課後小測驗（選擇/填充題）。
- 期末專案：完整安裝 3-node HA Kubernetes 叢集，並部署一個具持久儲存與自動擴展的範例應用。
