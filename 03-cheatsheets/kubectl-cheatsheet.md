# kubectl 指令速查表

## 資源檢視
| 指令 | 用途 |
|------|------|
| `kubectl get nodes -o wide` | 節點狀態 |
| `kubectl get pods -A` | 所有 namespace 的 Pod |
| `kubectl get deploy,svc,rs -n <ns>` | 檢視多種資源 |
| `kubectl describe <res> <name>` | 詳細資訊與事件 |
| `kubectl get events --sort-by=.lastTimestamp` | 事件 |
| `kubectl top nodes` / `kubectl top pods` | 資源用量（需 Metrics Server）|

## 建立 / 更新 / 刪除
| 指令 | 用途 |
|------|------|
| `kubectl apply -f file.yaml` | 宣告式建立/更新 |
| `kubectl create deployment nginx --image=nginx` | 命令式建立 Deployment |
| `kubectl run pod --image=nginx` | 建立暫時 Pod |
| `kubectl delete -f file.yaml` | 刪除 |
| `kubectl delete pod --all -n <ns>` | 清空 |

## 工作負載操作
| 指令 | 用途 |
|------|------|
| `kubectl scale deploy nginx --replicas=5` | 縮放 |
| `kubectl rollout status deployment/nginx` | 滾動更新狀態 |
| `kubectl rollout undo deployment/nginx` | 滾回 |
| `kubectl set image deploy/nginx nginx=nginx:1.28` | 更新鏡像 |
| `kubectl rollout history deployment/nginx` | 更新歷史 |

## Pod 除錯
| 指令 | 用途 |
|------|------|
| `kubectl logs <pod> -f` | 日誌 |
| `kubectl logs <pod> -c <容器>` | 特定容器日誌 |
| `kubectl exec -it <pod> -- bash` | 進入容器 |
| `kubectl port-forward svc/<name> 8080:80` | 本機轉發 |

## Label / Annotation / Selector
| 指令 | 用途 |
|------|------|
| `kubectl label pod <p> app=v1` | 加標籤 |
| `kubectl get pods -l app=v1` | 依標籤篩選 |

## 上下文/設定
| 指令 | 用途 |
|------|------|
| `kubectl config get-contexts` | 列出 context |
| `kubectl config use-context <ctx>` | 切換 |
| `kubectl cluster-info` | 叢集資訊 |
| `kubectl auth can-i list pods` | 權限檢查 |

## Storage / NGINX 部署範例
```yaml
apiVersion: apps/v1
kind: Deployment
metadata: {name: web, labels: {app: web}}
spec:
  replicas: 3
  selector: {matchLabels: {app: web}}
  template:
    metadata: {labels: {app: web}}
    spec:
      containers:
        - name: web
          image: nginx
          ports: [{containerPort: 80}]
```
