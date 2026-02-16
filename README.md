<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Z4nH5OuF_GwsMQ652MwMQ92tGO6P80nn

## Run Locally

**Prerequisites:**  Node.js

1. 安装依赖：`npm install`
2. 在项目根目录创建 `.env.local`，参考 `.env.example` 填入：
   - `DEEPSEEK_API_KEY`：DeepSeek API 密钥（[获取](https://platform.deepseek.com/api_keys)）
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`：Supabase 项目 URL 与 anon key（见下方 Supabase 配置）
3. 运行应用：
   - **完整开发（含 API 代理）**：`npm run dev`（需安装 Vercel CLI）
   - **仅前端**：`npm run dev:vite`

## 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Vercel 项目 **Settings → Environment Variables** 中添加：
   - `DEEPSEEK_API_KEY` = 你的 DeepSeek API Key
   - `VITE_SUPABASE_URL` = Supabase 项目 URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase anon key
4. 点击 **Deploy** 部署

## Supabase 配置（用户登录与云端数据）

1. 在 [Supabase](https://supabase.com) 创建项目，记下 **Settings → API** 中的 Project URL 和 `anon` public key。
2. 在 Supabase 控制台打开 **SQL Editor**，执行 `supabase/migrations/001_initial.sql` 中的 SQL，创建表并启用 RLS。
3. 在 **Authentication → Providers** 中启用 Email，如需可关闭 “Confirm email” 以便本地快速测试。
4. 将 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 填入本地 `.env.local` 与 Vercel 环境变量。

未配置 Supabase 时，应用仍可本地运行，但不会显示登录页，数据仅保存在本地。

## 树木多样性系统

### 特性介绍
正念转化器现在支持**10种不同树种**，每种树对应特定的情绪与成长主题：

#### 免费基础树种 (5种)
1. **坚韧橡树** (`oak`) - 应对压力与成长
2. **柔韧柳树** (`willow`) - 处理悲伤与寻求平静
3. **耐力松树** (`pine`) - 转化愤怒与培养耐力
4. **变化枫树** (`maple`) - 管理焦虑与适应变化
5. **灵巧竹子** (`bamboo`) - 缓解压力与提升弹性

#### 社交解锁树种 (1种)
6. **友谊樱花** (`cherry`) - 通过智慧交换解锁，象征喜悦与感恩

#### 稀有内购树种 (4种)
7. **超脱莲花** (`lotus`) - 深度平静与清晰
8. **和平橄榄** (`olive`) - 内在和平与感恩
9. **精致盆栽** (`bonsai`) - 耐心培养与精致成长
10. **坚韧红杉** (`redwood`) - 韧性培养与长期成长

### 智能树种推荐
AI会根据对话内容自动分析情绪，推荐最匹配的树种：
- 愤怒内容 → 松树
- 悲伤内容 → 柳树
- 焦虑内容 → 枫树
- 压力内容 → 竹子
- 喜悦内容 → 樱花

### 生长差异化
- **免费用户**: 基础生长速度 (1.0x)
- **付费用户**: 2倍加速生长 (0.5x时间)
- **树种差异**: 不同树种有独特的生长系数 (0.7x-2.0x)

### 视觉效果
每种树种在各生长阶段（树苗→成长→成熟→结果）都有独特的：
- 颜色配色方案
- SVG形状设计
- 稀有度特效 (普通/稀有/史诗)
- 果实产量差异 (1-3个果实/次)
