# ─── 构建阶段 ─────────────────────────────────────
FROM node:20-alpine AS builder

ARG NPM_REGISTRY=https://registry.npmmirror.com
ARG BUILD_HTTP_PROXY
ARG BUILD_HTTPS_PROXY

WORKDIR /app

# 配置镜像源（仅在传入了非默认 registry 时切换）
RUN if [ -n "$NPM_REGISTRY" ] && [ "$NPM_REGISTRY" != "https://registry.npmjs.org/" ]; then \
      npm config set registry "$NPM_REGISTRY"; \
    fi

# 构建时代理（仅在传入了值时设置）
RUN if [ -n "$BUILD_HTTP_PROXY" ]; then \
      npm config set proxy "$BUILD_HTTP_PROXY"; \
    fi
RUN if [ -n "$BUILD_HTTPS_PROXY" ]; then \
      npm config set https-proxy "$BUILD_HTTPS_PROXY"; \
    fi

# 安装依赖（利用 Docker 层缓存）
COPY package.json package-lock.json ./
RUN npm ci

# 拷贝源码并构建
COPY tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js eslint.config.mjs ./
COPY index.html ./
COPY public/ public/
COPY src/ src/
COPY scripts/ scripts/

RUN npm run build

# ─── 运行阶段 ─────────────────────────────────────
FROM nginx:stable-alpine

# 从构建阶段复制产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
