# Lab 1 — PVE 基本操作與備份

> 目標：熟悉 PVE 的 VM、快照、備份操作（K8s 節點管理基礎）。

## 1. 建立 VM
同 Lab 0 範本流程，或手動建立一台測試 VM，安裝 qemu-guest-agent。

## 2. 快照
在 Web UI 選擇 VM → Snapshots → Take snapshot；或指令：
```bash
qm snapshot 101 snap1
qm listsnapshot 101
qm delsnapshot 101 snap1
```

## 3. 備份
```bash
vzdump 101 --mode stop --compress zstd --storage local
ls -lh /var/lib/vz/dump/
```
還原演練：
```bash
qmrestore /var/lib/vz/dump/vzdump-qemu-101-*.vma.zst 101
```

## 4. 網路
檢視並新增一台 VM 的第二張 VirtIO NIC 接到專用 bridge `vmbr1`。

## 驗證
- 快照建立/還原成功。
- 備份檔存在且可還原。
- VM 可透過第二 NIC 連到指定網段。
