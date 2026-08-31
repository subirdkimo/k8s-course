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

---

## 7. 比較：Kubernetes vs Red Hat OpenShift (OCP)

**OpenShift (OCP)** 是 Red Hat 以 Kubernetes 為核心打造的「企業級 K8s 發行版」（OKD 為其社群版）。同一套 K8s API，但加了完整的企業層功能與 Red Hat 支援。

| 面向 | Kubernetes (Vanilla / kubeadm) | Red Hat OpenShift (OCP) |
|------|-------------------------------|--------------------------|
| 本質 | 開源上游容器編排核心 | 專家整理的企業 K8s 發行版（含商業支援） |
| 安裝工具 | kubeadm / K3s / RKE2（自行組裝） | **openshift-install**（一鍵安裝、自動 HA） |
| 容器執行期 | containerd / CRI-O 等 | **CRI-O**（Red Hat 主導） |
| 節點 OS | 任意 Linux（Ubuntu/Debian/CentOS…） | **RHCOS**（受控唯讀 OS，自動更新） |
| 網路 | 需自裝 CNI（Calico/Cilium/Flannel） | 內建 **OVN-Kubernetes**（SDN + NetworkPolicy） |
| 路由/Ingress | 需自裝（Ingress Controller） | 內建 **Router**（HAProxy-based）＋ Route API |
| 認證/授權 | 需自組（OIDC、RBAC） | 內建 **OAuth/OIDC**、RBAC；`oc login` |
| 建置/部署 | 需另行整合 CI/CD（ArgoCD/Jenkins…） | 內建 **build（S2I）＋ Pipeline（Jenkins/Red Hat）** |
| 映像管理 | 依外部 registry | **整合 Quay/Internal Registry**＋影像漏洞掃描 |
| 運維/UI | 需自裝（Dashboard、Prometheus…） | 內建 **Web 主控台**、監控告警、OperatorHub |
| Operator 體系 | Community 自裝（OLM 非預設） | **內建 OLM / OperatorHub**（第 2 天作業自動化） |
| 支援與認證 | 社群＋第三方支援 | **Red Hat 商業支援、SLA、企業認證** |
| 授權成本 | **免費、開源** | **需付費訂閱**（CCSP/EUS 等） |

### Kubernetes（Vanilla）— 優點 / 缺點
**優點（Pros）**
- **完全免費開源**，無授權成本。
- **輕量、高度客製化**：可依需求自由組裝元件（runtime、CNI、StorageClass、Ingress）。
- **版本自主**：想升級就升級，不綁特定廠商。
- **生態最廣**：任何 K8s 工具/學習資源都適用。
- 技術深度：能深入了解每個元件的運作（適合**訓練課程**與進階維運團隊）。

**缺點（Cons）**
- **組裝與維運成本高**：CNI、監控、Ingress、備份、RBAC、OIDC 都要自己部署與維護。
- **軍規/企業功能需自行整合**：安全（NetworkPolicy、策略）、多租戶、法規稽核要自組。
- **無單一供應商支援**：出事要靠社群或自聘專家。
- 版本間升級需自行規劃與驗證。

### OpenShift（OCP）— 優點 / 缺點
**優點（Pros）**
- **企業一體化**：安裝、網路、路由、認證、監控、Operator、建置部署全部內建，快速上手。
- **Red Hat 支援與 SLA**：重大問題有原廠、有認證、合規性佳（金融/政府受歡迎）。
- **進階安全開箱即用**：SCC（Security Context Constraints）、內建影像掃描、多租戶、稽核。
- **自動化第 2 天作業**：OperatorHub 上架、內建 Web 主控台、自動節點 OS 更新。
- CRI-O＋RHCOS 更收斂、攻擊面小。

**缺點（Cons）**
- **付費訂閱**：授權成本高，小團隊/實驗室不划算。
- **較重、資源需求高**：控制平面與開機即有的眾多元件吃較多資源與磁碟。
- **客製受限、較「封閉」**：受 Red Hat 控管，進階/冷門設定靈活性較低。
- **綁定 Red Hat 生態與節奏**：升級/修補跟 Red Hat 排程，學習曲線與社群版略有不同。
> OKD（OpenShift 社群版）可免費用，但**無官方支援**，資源仍較重。

### 選擇建議（本課程脈絡）
- **訓練 / 研究 / 自營 Lab**：**Vanilla Kubernetes（kubeadm）** —— 成本零、可看透原理、正是本課程（Class 5）的做法。
- **企業生產上線、需支援與合規**：**OpenShift** —— 付費換來一體化與 SLA。
- **折衷**：K8s 原理先打穩（本課程），之後若轉 OCP 只是「換層外皮」，底層 K8s 知識完全通用。
