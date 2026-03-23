# 阶段1: 构建前端代码
FROM node:22-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci && npm cache clean --force

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 阶段2: 生产环境（Nginx）
FROM nginx:alpine

# 复制构建产物到nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置（如果存在）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
