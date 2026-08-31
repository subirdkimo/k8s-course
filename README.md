# K8s 工程師訓練課程（PVE 9.x × Kubernetes 1.36/1.37）

在 Proxmox VE 平台上訓練工程師「理解 K8s 運作原理 + 完整安裝高可用叢集 + 上線運維」的實作課程。

## 課程內容

| 目錄 | 說明 |
|------|------|
| `01-class-slides/` | 7 堂課投影片（`.pptx`）＋各堂教案（`*-content.md`）＋可重建投影片的 build 腳本 |
| `02-lab-manuals/` | 7 份 Lab 操作手冊（`lab-00` ~ `lab-06`） |
| `03-cheatsheets/` | kubectl / kubeadm 指令速查表 |
| `04-exercises/` | 期末專案＋測驗 |

- `00-course-overview.md` — 課程總覽、版本、硬體需求
- `01-course-agenda.md` — 各堂每分鐘 Agenda 總表

## 七堂課

| 堂 | 主題 | 時長 |
|----|------|------|
| 0 | 課程導覽、環境與 Lab 準備 | 1 hr |
| 1 | PVE 9.x 虛擬化平台概論 | 1 hr 15 |
| 2 | K8s 核心架構與運作原理 | 1 hr 30 |
| 3 | K8s 網路、儲存與高可用元件 | 1 hr 30 |
| 4 | PVE 上 K8s 架構規劃與 VM 建置 | 1 hr 15 |
| 5 | kubeadm 安裝高可用 Kubernetes | 1 hr 30 |
| 6 | 上線運維：儲存/備份/監控/安全/升級 | 1 hr 15 |

## 下載投影片

各堂投影片位於 `01-class-slides/class-*.pptx`，可直接下載開啟（如用網頁版 GitHub，點檔名 → `Download`；或用 raw 連結）。

## 版本基準

- Proxmox VE **9.x**（9.2，Debian 13 Trixie，kernel 7.0）
- Kubernetes **1.36 / 1.37**，container runtime 為 **containerd**
