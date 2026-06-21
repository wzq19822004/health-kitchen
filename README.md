# 🥦 健康饮食管家

基于家中现有食材，智能管理库存、推荐家常食谱、追踪每日饮食的健康管理工具。

## 功能

- **🥬 食材库存管理** — 精确克数 + 保质期 + 过期提醒 + 分类管理
- **📖 食谱库** — 33 道内置家常菜 + 自定义食谱 + 难度/类别筛选
- **📝 饮食记录** — 每日三餐打卡 + 已做标记 + 历史记录
- **🛒 购物清单** — 自动检测临期食材生成购物清单
- **📊 今日概览** — 库存统计 + 过期提醒 + 热量追踪 + 菜单推荐

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5173

### 构建

```bash
npm run build
npm run preview
```

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- localStorage 持久化
- DeepSeek API (NLP 解析购物文本)

## 数据

所有数据保存在浏览器 localStorage，刷新不丢失。
支持粘贴购物清单自动解析入库（NLP）。
支持拍照小票 OCR 识别（需 DeepSeek API Key）。

## 后续规划

- FastAPI + PostgreSQL 后端（多用户 + 云端同步）
- 微信小程序
- AI 个性化食谱推荐
- 周/月营养分析报告
