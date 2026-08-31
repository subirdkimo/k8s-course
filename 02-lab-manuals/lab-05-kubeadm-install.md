# Lab 5 — kubeadm 安裝高可用 Kubernetes（詳盡版）

> 目標：在 6 台 VM 上安裝 3 控制平面 + 3 worker 的高可用 Kubernetes（v1.36 / v1.37）。
> 本 Lab 是核心實作，請逐步執行並理解每個指令。
> 前置：完成 Lab 4（6 台 VM 就緒、可互 ping、/etc/hosts 正確）。

## 架構提醒
- 控制平面：k8s-cp1(192.168.10.11)、cp2(.12)、cp3(.13)
- Worker：k8s-w1(.21)、w2(.22)、w3(.23)
- 負載平衡器 VIP：`192.168.10.100`（HAProxy，見步驟 0）
- Pod 網段 10.200.0.0/16；Service 網段 10.96.0.0/12

---

## 步驟 0：負載平衡器（可選，但生產 HA 建議）

在 PVE 或額外 VM 建 HAProxy，把 6443 分散到 3 個控制平面：
```
frontend k8s-api
    bind *:6443
    default_backend k8s-cp
backend k8s-cp
    balance roundrobin
    server cp1 192.168.10.11:6443 check
    server cp2 192.168.10.12:6443 check
    server cp3 192.168.10.13:6443 check
```
把 `k8s-lb` 解析到 `192.168.10.100`（/etc/hosts）。

> 只有單機 Lab 可不做 LB，直接以 cp1 的 `192.168.10.11:6443` 作為 `controlPlaneEndpoint`。

---

## 步驟 1：所有節點 — 基礎系統設定

```bash
# 關閉 swap（K8s 要求）
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# 載入核心模組
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
sudo modprobe overlay
sudo modprobe br_netfilter

# sysctl
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sudo sysctl --system
```

---

## 步驟 2：所有節點 — 安裝 containerd

```bash
sudo apt-get update
sudo apt-get install -y containerd

sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd
sudo systemctl enable containerd
ctr version
```

---

## 步驟 3：所有節點 — 安裝 kubeadm / kubelet / kubectl

```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.36/deb/ /' \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# 確認版本
kubeadm version
kubelet --version
```

---

## 步驟 4：cp1 — 初始化控制平面

建立 `/root/kubeadm-config.yaml`：
```yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: "v1.36.0"
controlPlaneEndpoint: "192.168.10.100:6443"   # 或 k8s-lb:6443；單機可用 192.168.10.11:6443
networking:
  podSubnet: "10.200.0.0/16"
  serviceSubnet: "10.96.0.0/12"
---
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: "192.168.10.11"
```

```bash
sudo kubeadm init --config /root/kubeadm-config.yaml --upload-certs
```

> **儲存輸出**：`kubeadm join` 指令（含 token、CA hash、certificate-key）之後要用。

設定 kubectl：
```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get nodes
```

---

## 步驟 5：安裝 CNI（Calico）

```bash
curl -LO https://raw.githubusercontent.com/projectcalico/calico/master/manifests/calico.yaml
kubectl apply -f calico.yaml
watch kubectl get pods -n kube-system    # 等 calico 與 coredns Running
```

> 若 Pod 網段需對應 CNI，設定 `CALICO_IPV4POOL_CIDR` 與 `IP_AUTODETECTION_METHOD`。Cilium 選配見 Class 5。

---

## 步驟 6：加入其餘控制平面（cp2, cp3）

在 cp2 / cp3 上執行 `kubeadm init` 輸出的 `--control-plane` join 指令：
```bash
sudo kubeadm join 192.168.10.100:6443 \
  --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash> \
  --control-plane --certificate-key <cert-key>
```
> cp2 的 `--apiserver-advertise-address` 可加 `192.168.10.12`，cp3 用 `.13`。

---

## 步驟 7：加入 Worker（w1, w2, w3）

在 worker 上執行（無 `--control-plane`）：
```bash
sudo kubeadm join 192.168.10.100:6443 \
  --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash>
```

---

## 步驟 8：驗證

```bash
kubectl get nodes -o wide          # 6 台皆 Ready
kubectl get pods -A                # 全部 Running/Completed
kubectl get cs                     # scheduler/controller-manager healthy
kubectl cluster-info
```

部署範例：
```bash
kubectl create deployment nginx --image=nginx
kubectl scale deployment nginx --replicas=3
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get svc,pods -o wide
```

---

## 故障排除速查
| 現象 | 處理 |
|------|------|
| `kubeadm init` 卡在 pull 鏡像 | 換 registry mirror 或確認網路 |
| Node NotReady | `kubectl describe node`；多半是 CNI 未裝 |
| coredns 一直 Pending | CNI Pod 網段沒通 |
| 多控制平面 quorum 異常 | 檢查 2379/2380，etcd member 是否齊全 |

## 完成後
- 你是否能讓任意控制平面宕掉，叢集仍正常運作？（HA 驗證）
