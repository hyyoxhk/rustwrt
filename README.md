# RustWrt - OpenWrt路由器管理系统

一个基于Rust + Axum + React的现代化OpenWrt路由器管理系统。

## 功能特性

- 🖥️ **系统监控**: 实时监控CPU、内存、磁盘使用情况
- 🌐 **网络管理**: 管理网络接口、查看网络状态
- 📶 **无线网络**: 扫描和管理无线网络
- 🔒 **防火墙**: 配置和管理防火墙规则
- 🖥️ **DHCP管理**: 管理DHCP服务器和租约
- 📊 **仪表板**: 直观的系统概览和统计信息

## 技术栈

### 后端
- **Rust**: 系统编程语言
- **Axum**: 现代化的Web框架
- **Tokio**: 异步运行时
- **SQLx**: 数据库操作
- **Serde**: 序列化/反序列化

### 前端
- **React**: 用户界面框架
- **Ant Design**: UI组件库
- **Axios**: HTTP客户端
- **React Router**: 路由管理

## 项目结构

```
RustWrt/
├── src/                    # Rust后端源码
│   ├── main.rs            # 程序入口
│   ├── api/               # API路由
│   ├── services/          # 业务逻辑
│   ├── models/            # 数据模型
│   ├── config.rs          # 配置管理
│   ├── error.rs           # 错误处理
│   └── utils/             # 工具函数
├── www/              # React前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   └── utils/         # 工具
│   └── public/            # 静态资源
├── config.toml            # 配置文件
└── Cargo.toml             # Rust依赖
```

## 快速开始

### 环境要求

- Rust 1.70+
- Node.js 16+
- OpenWrt系统

### 安装Rust

#### Ubuntu-22.04
```bash
# 使用rustup安装Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 重新加载shell环境
source ~/.bashrc  # 或 source ~/.zshrc

# 验证安装
rustc --version
cargo --version
```

#### 更新Rust
```bash
rustup update
```

### 安装Node.js

#### 使用nvm (推荐)
```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载shell环境
source ~/.bashrc  # 或 source ~/.zshrc

# 安装最新的LTS版本Node.js
nvm install --lts
nvm use --lts

# 验证安装
node --version
npm --version
```

#### 使用包管理器

**Ubuntu/Debian:**
```bash
# 添加NodeSource仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装Node.js
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 安装依赖

1. 安装Rust依赖:
```bash
cargo build
```

2. 安装前端依赖:
```bash
cd www
npm install
```

### 运行项目

1. 启动后端服务:
```bash
cargo run
```

2. 启动前端开发服务器:
```bash
cd www
npm start
```

3. 访问应用:
   - 前端: http://localhost:3001
   - 后端API: http://localhost:3000/api

### 构建生产版本

1. 构建Rust后端:
```bash
cargo build --release
```

2. 构建React前端:
```bash
cd www
npm run build
```

## API接口

### 系统管理
- `GET /api/health` - 健康检查
- `GET /api/system/info` - 获取系统信息

### 网络管理
- `GET /api/network/interfaces` - 获取网络接口
- `GET /api/network/status` - 获取网络状态

### 无线网络
- `GET /api/wireless/networks` - 获取无线网络
- `POST /api/wireless/scan` - 扫描无线网络

### 防火墙
- `GET /api/firewall/rules` - 获取防火墙规则
- `POST /api/firewall/rules` - 添加防火墙规则

### DHCP管理
- `GET /api/dhcp/leases` - 获取DHCP租约
- `GET /api/dhcp/config` - 获取DHCP配置
- `POST /api/dhcp/config` - 更新DHCP配置

## 配置说明

编辑 `config.toml` 文件来配置应用:

```toml
[server]
port = 3000
host = "127.0.0.1"

[database]
url = "sqlite:rustwrt.db"

[openwrt]
uci_path = "/sbin/uci"
ubus_path = "/sbin/ubus"
network_config_path = "/etc/config/network"
wireless_config_path = "/etc/config/wireless"
firewall_config_path = "/etc/config/firewall"
dhcp_config_path = "/etc/config/dhcp"
```

## 部署到OpenWrt

1. 交叉编译Rust应用:
```bash
rustup target add x86_64-unknown-linux-musl
cargo build --release --target x86_64-unknown-linux-musl
```

2. 将编译好的二进制文件复制到OpenWrt设备

3. 配置系统服务:
```bash
# 创建systemd服务文件
sudo nano /etc/systemd/system/rustwrt.service
```

4. 启动服务:
```bash
sudo systemctl enable rustwrt
sudo systemctl start rustwrt
```

## 开发指南

### 添加新功能

1. 在 `src/models.rs` 中定义数据结构
2. 在 `src/services/` 中实现业务逻辑
3. 在 `src/api/` 中添加API路由
4. 在前端 `src/pages/` 中创建页面组件

### 代码规范

- 使用Rust的官方代码规范
- 前端使用ESLint和Prettier
- 提交信息使用约定式提交格式

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发者。 
