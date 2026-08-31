# Lab 4 — 建立 6 台 K8s 節點 VM（含架構應用）

> 目標：依 Class 4 架構，建立 3 控制平面 + 3 worker，共 6 台節點 VM。
> 前置：完成 Lab 0（已有範本 10000 與 6 台克隆初稿）。

## 1. 設定差異化資源（依架構表）

### 控制平面（101/102/103）
```bash
qm set 101 --name k8s-cp1 --cores 4 --memory 8192 --scsi0 local-lvm:40 \
   --ipconfig0 ip=192.168.10.11/24,gw=192.168.10.1 --nameserver 192.168.10.1
qm set 102 --name k8s-cp2 --cores 4 --memory 8192 --scsi0 local-lvm:40 \
   --ipconfig0 ip=192.168.10.12/24,gw=192.168.10.1 --nameserver 192.168.10.1
qm set 103 --name k8s-cp3 --cores 4 --memory 8192 --scsi0 local-lvm:40 \
   --ipconfig0 ip=192.168.10.13/24,gw=192.168.10.1 --nameserver 192.168.10.1
```

### Worker（111/112/113）
```bash
qm set 111 --name k8s-w1 --cores 8 --memory 16384 --scsi0 local-lvm:60 \
   --ipconfig0 ip=192.168.10.21/24,gw=192.168.10.1 --nameserver 192.168.10.1
qm set 112 --name k8s-w2 --cores 8 --memory 16384 --scsi0 local-lvm:60 \
   --ipconfig0 ip=192.168.10.22/24,gw=192.168.10.1 --nameserver 192.168.10.1
qm set 113 --name k8s-w3 --cores 8 --memory 16384 --scsi0 local-lvm:60 \
   --ipconfig0 ip=192.168.10.23/24,gw=192.168.10.1 --nameserver 192.168.10.1
```

### 最佳化 CPU（同質硬體用 host）
```bash
qm set 101 --cpu host
# 對其餘節點同樣執行
```

### 設定 SSH key 並啟動
```bash
for id in 101 102 103 111 112 113; do
  qm set $id --sshkeys ~/.ssh/id_ed25519.pub
  qm start $id
done
sleep 60  # 等待 cloud-init 完成
qm list
```

## 2. 安裝 qemu-guest-agent（全部節點）
```bash
# 從 PVE 主機對每台執行
ssh ubuntu@192.168.10.11 \
  'sudo apt-get update && sudo apt-get install -y qemu-guest-agent && sudo systemctl enable --now qemu-guest-agent'
# 重複其餘 5 台
```

## 3. /etc/hosts 與 sysctl 基礎（每台）
見 Lab 0 步驟 5。確認全部節點可互 ping。

## 4. 驗證
```bash
# 從任一節點
ping -c1 k8s-cp2 ; ping -c1 k8s-w1
ssh k8s-cp2   # 無密碼可達（若有設 key）
```
