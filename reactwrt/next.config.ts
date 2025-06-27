import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出配置
  // output: 'export',

  // // 基础路径配置（如果部署到子目录）
  // // basePath: '/rustwrt',

  // // 禁用图片优化（静态导出时）
  // images: {
  //   unoptimized: true,
  // },

  // // 禁用服务端渲染功能
  // trailingSlash: true,

  // // 禁用动态路由（静态导出时）
  // skipTrailingSlashRedirect: true,

  // // 禁用中间件（静态导出时）
  // skipMiddlewareUrlNormalize: true,

  // // 构建时优化
  // swcMinify: true,

  // // 实验性功能
  // experimental: {
  //   // 禁用服务端组件（静态导出时）
  //   serverComponentsExternalPackages: [],
  // },

  // // 环境变量配置
  // env: {
  //   CUSTOM_KEY: 'rustwrt-static',
  // },

  // // 重定向配置（静态导出时有限制）
  // async redirects() {
  //   return [];
  // },

  // // 重写配置（静态导出时有限制）
  // async rewrites() {
  //   return [];
  // },
};

export default nextConfig;
