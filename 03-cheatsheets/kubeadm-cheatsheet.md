# kubeadm / 上線運維速查表

## kubeadm 安裝關鍵指令
```bash
# containerd 用 systemd cgroup
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd

# 安裝 kubeadm/kubelet/kubectl
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# 初始化
sudo kubeadm init --config kubeadm-config.yaml --upload-certs

# 取得 join 指令
kubeadm token create --print-join-command
# 加入控制平面（+ --control-plane --certificate-key <key>）

# 驗證
kubectl get nodes -o wide
```

## 升級（一次一個 minor）
```bash
sudo apt-mark unhold kubeadm
sudo apt-get update && sudo apt-get install -y kubeadm=<new>
sudo apt-mark hold kubeadm
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v<new>          # 控制平面
# cp2/cp3: sudo kubeadm upgrade node
# worker: kubectl drain → upgrade → kubectl uncordon
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet=<new> kubectl=<new>
sudo apt-mark hold kubelet kubectl
sudo systemctl restart kubelet
```

## etcd 備份
```bash
sudo ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /backup/etcd-$(date +%F).db
```

## 常見參數
| 項目 | 網段 | 說明 |
|------|------|------|
| podSubnet | 10.200.0.0/16 | 需與 CNI 一致 |
| serviceSubnet | 10.96.0.0/12 | apiserver 設定 |
| controlPlaneEndpoint | 192.168.10.100:6443 | LB VIP |

## 除錯三招
1. `kubectl describe <res>` — 看條件與事件。
2. `kubectl get events` — 叢集事件。
3. `kubectl logs` / `journalctl -u kubelet` — 元件日誌。
