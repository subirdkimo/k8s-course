# Class 2 — Kubernetes 核心架構與運作原理

> 時長：1 hr 30 min　|　投影片：`class-02-k8s-core.pptx`　|　Lab：`lab-02-k8s-core.md`

## 1. 為什麼需要 Kubernetes

- 容器（如 Docker/containerd）解決「單一應用怎麼打包與執行」。
- 但**數百個容器**需要：調度、自癒、服務發現、負載平衡、滾動更新、橫向擴展→這就是**容器編排**。
- **Kubernetes (K8s)** 是業界標準的容器編排平台，宣告式、自我修復、可擴展。

---

## 2. 控制平面（Control Plane / Master）

控制平面負責「決定並維持叢集應有的狀態」。

| 元件 | 角色 |
|------|------|
| **kube-apiserver** | 所有 API 請求的唯一入口；驗證、授權、准入控制；狀態透過 etcd 保存。 |
| **etcd** | 分散式金鑰值儲存，保存**整個叢集狀態**；需奇數副本以維持 quorum。 |
| **kube-scheduler** | 依資源需求、標籤、親和性為新 Pod 選擇最合適的節點。 |
| **kube-controller-manager** | 執行各種控制器迴圈（ReplicaSet、Node、Deployment…），持續把現況收斂到期望狀態。 |

> 高可用叢集會部署 **≥3 個控制平面**（見 Class 3/5）。

---

## 3. 工作節點（Worker Node）元件

| 元件 | 角色 |
|------|------|
| **kubelet** | 節點上的主要代理；向 apiserver 註冊節點，並負責啟動/停止 Pod 中的容器。 |
| **kube-proxy** | 實作 Service 的網路規則（IPtables/IPVS），把流量導向後端 Pod。 |
| **container runtime** | 真的跑容器的元件；K8s 從 1.24 起**預設用 containerd**（CRI：Container Runtime Interface）。 |

> **containerd**：輕量、純 CLI 的容器執行期，由 CNCF 維護，已是 K8s 標準 runtime（取代 Docker 作為 runtime 的時代）。

---

## 4. 核心物件（API 資源）

### Pod
- K8s 的最小部署單位：一個或多個共享網路/儲存的容器。
- 通常由控制器（Deployment）管理，不直接建立。

### Deployment / ReplicaSet
- **Deployment** 宣告「我要跑幾個副本、用哪個鏡像」，管理滾動更新與滾回。
- **ReplicaSet** 確保指定數量的 Pod 一直存在（由 Deployment 間接管理）。

### Service
- 為一組 Pod 提供**穩定虛擬 IP**與 DNS，做服務發現與負載平衡。
- 型別：`ClusterIP`、`NodePort`、`LoadBalancer`、`ExternalName`。

### ConfigMap / Secret
- 把設定（明文）與機密（base64）從鏡像中分離，可在不重build鏡像下變更。

### 其他常見資源
- `Namespace`（邏輯隔離）、`Ingress`（七層路由）、`StatefulSet`（有狀態）、`Job/CronJob`、`PV/PVC/StorageClass`、`NetworkPolicy`。

---

## 5. 宣告式管理與 API 原理

```
kubectl apply -f deploy.yaml
   │
   ▼
kube-apiserver（驗證/授權/准入）
   │  寫入
   ▼
etcd（期望狀態儲存）
   │
   ▼
各 controller（Deployment→ReplicaSet→...）
   │  對照實際狀態，差異化處理
   ▼
kube-scheduler 指派節點 → kubelet 透過 CRI 呼叫 containerd 啟動容器
```

- **Key takeaway**：K8s 是「**宣告式**」——你描述「想要的狀態」，controller 負責收斂。這與傳統「命令式」明顯不同。
- `kubectl` 只是一個客戶端，透過 HTTPS 呼叫 kube-apiserver（REST API），任何語言/工具都能操作。

---

## 6. 課堂重點複習
1. 控制平面 vs 工作節點的職責分工。
2. Pod 是最小單位，Deployment 管副本，Service 提供穩定存取。
3. 所有狀態都存在 etcd；apiserver 是唯一入口。
4. containerd 是現行標準 runtime。
