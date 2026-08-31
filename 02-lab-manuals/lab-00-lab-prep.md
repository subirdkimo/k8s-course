# Lab 0 — 環境與 Lab 準備

> 目標：準備 PVE 9.x，建立 VM 範本並複製出 6 台節點 VM，供後續課程使用。

## 前置
- 1 台已安裝 PVE 9.x 的主機（或叢集）。
- 可連線網際網路、具備 cloud image 下載能力。

## 步驟

### 1. 下載 Ubuntu 24.04 cloud image 並建立範本 VM
```bash
# 在 PVE 主機上
cd /var/lib/vz/template/iso
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
qm create 10000 --name ubuntu-template --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk 10000 noble-server-cloudimg-amd64.img local-lvm
qm set 10000 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-10000-disk-0
qm set 10000 --ide2 local-lvm:cloudinit --boot c --bootdisk scsi0
qm set 10000 --serial0 socket --vga serial0
qm template 10000
```

### 2. 由範本克隆出 6 台節點
```bash
for i in 101 102 103; do
  qm clone 10000 $((100+i)) --name k8s-cp$((i-100)) --full
done
for i in 111 112 113; do
  qm clone 10000 $i --name k8s-w$((i-110)) --full
done
```

### 3. cloud-init 設定（以 cp1 為例）
在 PVE Web UI → 該 VM → Cloud-init 分頁，或以指令：
```bash
qm set 101 --cores 4 --memory 8192 --scsi0 local-lvm:40
qm set 101 --ipconfig0 ip=192.168.10.11/24,gw=192.168.10.1
qm set 101 --nameserver 192.168.10.1
qm set 101 --sshkeys ~/.ssh/id_ed25519.pub
qm start 101   # 啟動讓 cloud-init 套用
```
> 依架構表（Class 4）設定 6 台資源與 IP：cp=101/102/103，w=111/112/113。

### 4. 安裝 qemu-guest-agent（進入 VM）
```bash
sudo apt-get update && sudo apt-get install -y qemu-guest-agent
sudo systemctl enable --now qemu-guest-agent
```
> 之後在 PVE UI Summery 頁應可看到該 VM 的 IP。

### 5. 設定 /etc/hosts 與時間同步
```bash
# 每台節點
cat <<EOF | sudo tee -a /etc/hosts
192.168.10.11 k8s-cp1
192.168.10.12 k8s-cp2
192.168.10.13 k8s-cp3
192.168.10.21 k8s-w1
192.168.10.22 k8s-w2
192.168.10.23 k8s-w3
EOF
sudo timedatectl set-timezone Asia/Taipei
sudo systemctl enable --now systemd-timesyncd
```

## 驗證
- `qm list` 顯示 6 台節點 Running。
- 可 SSH 進入各節點。
- PVE UI 顯示各節點 IP。
