.PHONY: help build run test clean www-install www-build www-start dev

help: ## 显示帮助信息
	@echo "RustWrt - OpenWrt路由器管理系统"
	@echo ""
	@echo "可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## 构建Rust后端
	cargo build --release

run: ## 运行Rust后端
	cargo run

test: ## 运行测试
	cargo test

clean: ## 清理构建文件
	cargo clean
	rm -rf www/build

www-install: ## 安装前端依赖
	cd www && npm install

www-build: ## 构建前端
	cd www && npm run build

www-start: ## 启动前端开发服务器
	cd www && npm start

dev: ## 开发模式（需要两个终端）
	@echo "请在一个终端运行: make run"
	@echo "在另一个终端运行: make www-start"

install: www-install ## 安装所有依赖
	cargo build

build-all: build www-build ## 构建所有组件

docker-build: ## 构建Docker镜像
	docker build -t rustwrt .

docker-run: ## 运行Docker容器
	docker run -p 3000:3000 rustwrt

check: ## 代码检查
	cargo check
	cargo clippy
	cd www && npm run lint

format: ## 格式化代码
	cargo fmt
	cd www && npm run format
