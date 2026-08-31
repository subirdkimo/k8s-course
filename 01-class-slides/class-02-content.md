# Class 2 — Kubernetes 核心架構與運作原理

> 時長：約 2 hr 15 min（含 OCP 比較）　|　投影片：`class-02-k8s-core.pptx`　|　Lab：`lab-02-k8s-core.md`

## 1. 為什麼需要 Kubernetes

- 容器（如 Docker/containerd）解決「單一應用怎麼打包與執行」。
- 但**數百個容器**需要：調度、自癒、服務發現、負載平衡、滾動更新、橫向擴展→這就是**容器編排**。
- **Kubernetes (K8s)** 是業界標準的容器編排平台，宣告式、自我修復、可擴展。

### 1.5 容器、虛擬機、裸機 — 三層隔離光譜（觀念）

| 面向 | 裸機 | 虛擬機 (KVM) | 容器 (Docker/containerd) |
|------|------|--------------|--------------------------|
| 隔離單位 | 整台實體機 | 完整 OS（Guest） | 行程層（namespace + cgroup） |
| 共用宿主核心 | — | 否 | **是** |
| 啟動時間 | 分鐘級 | 分鐘級 | 秒級 |
| 資源密度 | 1/機 | 數~數十/機 | 數百~數千/機 |
| 適用 | 專用工作負載 | **K8s 節點**、多 OS 需求 | 微服務、應用的打包與部署 |

**本課程的定位**：**虛擬機跑 K8s 節點（重隔離）＋ 容器跑應用（高密度）**，兩層組合是 PVE 環境下的標準形態。

> **心智模型**：裸機是「一整間公寓」，VM 是「大樓裡的每個單元」，容器是「單元裡的每個房間」。K8s 管的是「房間（容器）怎麼分配、搬運、擴減」，VM 只是「大樓（節點）」的載體。

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

### 2.5 宣告式與「控制回路」（Reconcile Loop）— K8s 的核心觀念

K8s 與傳統「命令式」工具的最大差異：**你描述「目標狀態」，系統負責「把現狀收斂到目標」**。

- **命令式（imperative）**：「把這台機的 nginx 升版、關那台機、開這個 port」—— 每一步都要人下令。
- **宣告式（declarative）**：「我要 3 個 nginx、跑在這些節點、用這張設定」—— 之後**任何偏離**（Pod 掛掉、節點掉線、被人改壞）都由 K8s **自動修正**。

實現方式就是**控制回路（control loop / reconcile loop）**：

```
┌─ 每個 controller 不斷迴圈：
│   1. 讀「期望狀態」（etcd）
│   2. 讀「實際狀態」（列出資源）
│   3. 差異 → 動手修正（建/刪/改 Pod）
│   4. 重複
└─ 節點掛、Pod 掛、人工誤刪 … 下次迴圈都會被「修回來」
```

> **生活類比**：冷氣定溫 24°——你只設定目標溫度，冷氣自己感知房溫（actual）、差距多大就吹多大風（reconcile）。你不用一直按「開啟冷卻」。K8s 的 controller 就是「那個內建溫控迴路」。

**對工程師的意義**：
- **操作**：寫 YAML 描述目標即可（`kubectl apply`），不必手動追狀態。
- **排障**：先想「目標是啥？實際差在哪？」→ 再看哪個 controller 沒收斂、為什麼（RBAC、資源不足、節點 Taint…）。
- **設計**：把「目標」想清楚（副本數、親和性、資源上下限）比「操作順序」重要。

### 2.6 etcd 為何要 3 / 5 台？（quorum 觀念）

etcd 是「整個叢集的唯一事實來源」，它用分散式共识（Raft）保證**任何寫入都被過半數節點認可**。要能「過半數」，就得**有過半數存活**：

| etcd 節點數 | 容許掉線 | 說明 |
|------------|----------|------|
| 1 | 0 | 掉了就**全叢集不可寫**（讀也失效） |
| 3 | 1 | 剩 2 仍過半（2/3）→ 繼續運作 |
| 5 | 2 | 剩 3 仍過半（3/5）→ 繼續運作 |
| 4（不建議） | 1 | 多一台却没多容錯（2/4 與 2/2 一樣過半，白費）|

> **心智模型**：開會過半數才作數 —— 4 人會議掉 2 就作不了決定，跟 3 人會議掉 1 的結果一樣，但 4 人更貴。**所以 HA etcd 一律奇數（3 或 5）**。
>
> **實務**：kubeadm HA 叢集（Class 5）就是 3 控制平面各掛 1 個 etcd（或獨立 etcd 叢集 3/5 台）；etcd 磁碟寫入延遲直接影響 API 回應，建議 SSD + fast-fsync。

---

## 3. 工作節點（Worker Node）元件

| 元件 | 角色 |
|------|------|
| **kubelet** | 節點上的主要代理；向 apiserver 註冊節點，並負責啟動/停止 Pod 中的容器。 |
| **kube-proxy** | 實作 Service 的網路規則（IPtables/IPVS），把流量導向後端 Pod。 |
| **container runtime** | 真的跑容器的元件；K8s 從 1.24 起**預設用 containerd**（CRI：Container Runtime Interface）。 |

> **containerd**：輕量、純 CLI 的容器執行期，由 CNCF 維護，已是 K8s 標準 runtime（取代 Docker 作為 runtime 的時代）。

### 3.5 Pod 網路心智模型（兩層 IP）

K8s 網路有**兩層 IP**，很容易混淆，先記這個心智圖：

```
┌────────┐   ┌────────┐   ┌────────┐
│ Node1  │   │ Node2  │   │ Node3  │        ← Node IP（物理/VM IP，PVE/bridge 管）
│ ┌────┐ │   │ ┌────┐ │   │ ┌────┐ │
│ │PodA│ │   │ │PodB│ │   │ │PodC│ │        ← Pod IP（CNI 管，跨節點可路由）
│ └────┘ │   │ └────┘ │   │ └────┘ │
└────────┘   └────────┘   └────────┘
```

三個觀念重點：

1. **每個 Pod 有自己的 IP**（不是共用節點 IP），且**跨節點可路由** —— 這跟「容器用 host 網路」完全不同。
2. **K8s 不管 Pod 間怎麼通**：它只**告訴每個節點「本節點 Pod 的 IP 範圍（Pod CIDR）」**與「節點之間如何路由」（CNI 負責实现）。這就是**CNI 插件**（Calico/Flannel/Cilium）存在的意義 —— 不同 CNI 用不同方式（overlay/BGP/ebpf）實現「Pod 跨節點可路由」。
3. **Pod IP 是短暫的**：Pod 被調度/重排，IP 就變；**Service（4.5）提供穩定入口**，讓應用不必追蹤每個 Pod IP。

> 跟 PVE 的分界：PVE/bridge 管「節點（VM）之間與對外」，CNI 管「Pod 之間」。兩層各自獨立、互不干預。

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


### 4.5 Service 的「為什麼必要」與工作原理（觀念）

**問題**：Pod 是短暫的（重排、縮放、升級），Pod IP 時常改變 —— 客戶端不可能追蹤。
**解法**：Service 提供一個**永遠不變的「門面」**（VIP + DNS 名），後面掛多少個 Pod、換成哪些，客戶端完全不知道。

```
        客戶端
          │  用固定名：http://my-svc
          ▼
   ┌─────────────────┐   selector 自動挑出符合的 Pod
   │   Service（VIP） │ ──────────────┬────────────┬──────────┐
   └─────────────────┘                │            │          │
                                     ▼            ▼          ▼
                                     PodA        PodB       PodC
                                  (會增刪、會換 IP)
```

- **怎麼挑**：Service 用 **label selector**（例如 `app: nginx`）動態匹配 —— 新 Pod 起來自動進來、掛掉自動移出，不用人手改。這跟 Deployment 用同樣的 label 機制，**label 是 K8s 物件的「地址+身分」**。
- **怎麼轉（kube-proxy）**：每個節點上都寫入網路規則：
  - **iptables**：簡單、規模小（~1k 規則以内）夠用。
  - **IPVS**（Linux 内核 L4 負平衡）：規模大、延遲低，生產推薦。
- **DNS**：叢集內用 CoreDNS，`my-svc` → `my-svc.default.svc.cluster.local` → Service VIP。

> **心智模型**：Service 是「公司總機電話」—— 總機號碼不變，後面接哪位分機會換，打進來的人不用管。

### 4.6 排程心智模型（label / taint / 親和）

「Pod 該放哪台節點」由 scheduler 決定，三個核心觀念（講解層）：

| 機制 | 心智類比 | 用途 |
|------|----------|------|
| **NodeSelector / Affinity** | 「只放 3 樓的辦公室」 | 把 Pod 綁到特定節點標籤（如 GPU 節點、同可用區） |
| **Taint / Toleration** | 「這棟樓有毒，非抗毒者勿進」 | 把 Pod **趕離**特定節點（如 GPU 節點只給特定負載） |
| **Spread（podAntiAffinity）** | 「同一組同事別都坐一張桌」 | 副本分散到不同節點/機櫃，防單點 |

> **一句話**：**Affinity 是「想要放這」，Taint 是「別讓我放這」，Spread 是「別都擠一起」**。Class 3 HA 章節會實際用在控制平面與有狀態元件。


### ConfigMap / Secret
- 把設定（明文）與機密（base64）從鏡像中分離，可在不重build鏡像下變更。

### 其他常見資源
- `Namespace`（邏輯隔離）、`Ingress`（七層路由）、`StatefulSet`（有狀態）、`Job/CronJob`、`PV/PVC/StorageClass`、`NetworkPolicy`。

---

## 5. `kubectl apply` 的完整 API 流程（把 2.5 的觀念放到實際）

`2.5` 講了「宣告式 + 控制回路」是什麼、為什麼；這一節把「從你敲 `apply` 到 Pod 起來」的完整資料流串一次：

```
 你：kubectl apply -f deploy.yaml
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │  Control Plane                                       │
 │  ┌─────────┐    ┌─────────┐                          │
 │  │apiserver│───▶│  etcd   │   ← 期望狀態落地          │
 │  └─────────┘    └─────────┘                          │
 │        │                                              │
 │        ▼                                              │
 │  ┌────────────────────┐                              │
 │  │Deployment ctrl      │  ← reconcile loop：          │
 │  └────────────────────┘     讀 etcd → 看實際 → 修正 │
 │  ┌────────────────────┐                              │
 │  │   Scheduler        │  ← 為新 Pod 挑節點             │
 │  └────────────────────┘                              │
 └─────────────────────────────────────────────────────┘
        │
        ▼
 ┌─────────────────────────────────────────────────────┐
 │  Worker Node                                         │
 │  ┌────────┐    ┌──────────────┐                     │
 │  │kubelet │───▶│ containerd   │  ← CRI：真正的 runtime │
 │  └────────┘    └──────────────┘                     │
 │  ┌────────────┐                                     │
 │  │ kube-proxy │  ← 寫入 iptables/IPVS 規則             │
 │  └────────────┘                                     │
 └─────────────────────────────────────────────────────┘
```

**Key takeaway**：
- **apiserver 是唯一寫入入口**（所有 controller、kubectl、Web UI 都走它）。
- **etcd 是單一事實來源**（2.6 的 quorum 觀念在这里用得上）。
- **每個 controller 都是 2.5 的 reconcile loop 的一個實例** —— Deployment、ReplicaSet、Node、Endpoint … 都長得一樣，只是「比對什麼」不同。
- `kubectl` 只是其中一個客戶端（REST over HTTPS）；任何語言/工具都能直打 apiserver。

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
