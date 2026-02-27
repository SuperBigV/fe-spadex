## 部署 categraf

### 1. 下載並解壓縮的安裝包

```bash
wget https://download.flashcat.cloud/categraf_ent-v0.3.94-linux-amd64.tar.gz
tar zxvf categraf_ent-v0.3.94-linux-amd64.tar.gz
```

### 2. 修改 conf/config.toml , 將 providers 改為 [“local”,“http”] ，修改 [http_provider], 設定參考如下

```toml
providers = ["local","http"]

[http_provider]
# 將 ${spadex_ip} 替換為 spadex 的實際位址
remote_url = "http://${spadex_ip}:17000/v1/spadex-plus/collects"
```

### 3. 啟動 categraf 採集器

```bash
# 以 service 方式安裝, 相當於新增 service 檔案+systemctl daemon-reload
sudo ./categraf --install

# 以 service 方式查看 categraf，相當於 systemctl status categraf
sudo ./categraf --status
```

### 4. categraf 啟動成功之後，會出現在機器清單頁面，需要選取之後，將機器掛載到自己所在的業務群組

<img width='100%' src='/docs/categraf/image01.png' />
```
