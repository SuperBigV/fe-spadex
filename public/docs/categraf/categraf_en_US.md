## Deploy catgraf

### 1. Download and unzip the installation package

```bash
wget https://download.flashcat.cloud/categraf_ent-v0.3.94-linux-amd64.tar.gz
tar zxvf categraf_ent-v0.3.94-linux-amd64.tar.gz
```

### 2. Modify conf/config.toml, change providers to ["local","http"], modify [http_provider], the configuration reference is as follows

```toml
providers = ["local","http"]

[http_provider]
# Replace ${spadex_ip} with the actual address of spadex
remote_url = "http://${spadex_ip}:17000/v1/spadex-plus/collects"
```

### 3. Start the catgraf collector

```bash
# Install in service mode, equivalent to adding service file+systemctl daemon-reload
sudo ./categraf --install

# View categraf in service mode, equivalent to systemctl status categraf
sudo ./categraf --status
```

### 4. After categraf is started successfully, it will appear on the machine list page. You need to select it and mount the machine to your business group.

<img width='100%' src='/docs/categraf/image01.png' />
