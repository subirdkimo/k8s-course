# Class 4 — PVE 上 K8s 架構規劃與 VM 建置

> 時長：1 hr 15 min　|　投影片：`class-04-architecture-vm.pptx`　|　Lab：`lab-04-architecture-vm.md`

## 1. 生產架構設計

### 節點配置（6 台 VM）
| 角色 | 主機名 | vCPU | RAM | 磁碟 | 放置 |
|------|--------|------|-----|------|------|
| 控制平面 | k8s-cp1 | 4 | 8 GB | 40 GB (Ceph) | PVE Node 1 |
| 控制平面 | k8s-cp2 | 4 | 8 GB | 40 GB | PVE Node 2 |
| 控制平面 | k8s-cp3 | 4 | 8 GB | 40 GB | PVE Node 3 |
| Worker | k8s-w1 | 8 | 16 GB | 60 GB | PVE Node 1 |
| Worker | k8s-w2 | 8 | 16 GB | 60 GB | PVE Node 2 |
| Worker | k8s-w3 | 8 | 16 GB | 60 GB | PVE Node 3 |

> 原則：**控制平面分散到不同 PVE 節點**，避免單點故障；等離線/共用儲存（Ceph）支撐。

### 命名與 IP 規畫
- 管理網段：`192.168.10.0/24`；K8s Pod 網段：`10.200.0.0/16`；Service 網段：`10.96.0.0/12`。
- `/etc/hosts` 或 DNS 需能解析所有節點主機名。

---

## 2. PVE 上 VM 最佳實踐（K8s 節點）

- **CPU type = `host`**（同質硬體下效能最高，K8s 節點通常不需 live migration）。
- **磁碟 bus = SCSI + VirtIO SCSI**，新增 `Discard`（啟用 trim），效能較佳。
- **Network model = VirtIO（virtio-net）**。
- 安裝 **qemu-guest-agent**（供 PVE 動態顯示 IP、乾淨關機）。
- **記憶體**：建議給足並關閉 KSM 混淆（保留 值最佳化）。
- **不需要** GPU passthrough（一般 K8s 工作負載）。

---

## 3. 網路規畫
- **管理/叢集網段**：`vmbr0`，走 LAN。
- 若流量大，加裝第二實體 NIC 建立**專用 bridge `vmbr1`** 供 K8s/儲存流量，與管理流量隔離。
- 防火牆：在 PVE 層與 K8s NetworkPolicy 層雙重管控。

---

## 4. 儲存規畫
- **節點 OS 磁碟**：放在節點 local 儲存（LVM/ZFS）。
- **K8s PV 使用的磁碟**：放在 **Ceph（RBD）**，使 worker 節點 VM 具 HA 與遷移能力。
- ceph-csi 於 Class 6 整合到 K8s。

---

## 5. Lab：建立 6 台節點 VM

1. 匯入 Ubuntu 24.04 cloud image → 建範本 + cloud-init。
2. 由範本 clone 出 6 台（`qm clone`），依架構設定資源。
3. cloud-init 設定 IP、hostname、SSH key。
4. 安裝 qemu-guest-agent，驗證 PVE 能顯示 IP。
5. 設定 `/etc/hosts` 與時區、時間同步。

> 詳細指令見 `lab-04-architecture-vm.md`。
