# 古诗学习平台 (Next.js + MySQL)

## 概述
- 学生编号登录，进入学习主页面并启动正计时
- 五大模块：诗词展示、任务提示、提示词输入、当前生成图、历史图片库
- 生成两张 4:3 图片并落地 `public/generated-images/学生编号/编号_序号.png`
- 学生选优提交后记录提交时间与总用时，并退出到登录页
- 教师管理端：配置诗词与任务提示，导出筛选时间范围内的提交记录为 CSV

## 技术栈
- Next.js App Router + Tailwind CSS
- MySQL 8 + Prisma
- 图片生成：本地开发使用占位图下载模拟；可扩展对接豆包 Seedream 4.0

## 本地开发
1. 安装依赖：`npm install`
2. 环境变量：复制 `.env.example` 到 `.env` 并配置 `DATABASE_URL`
3. 初始化数据库：
   - 使用 `scripts/mysql.sql` 在 MySQL 中创建库与表并导入示例数据
   - 或使用 Prisma：`npx prisma migrate dev --name init`
4. 启动开发：`npm run dev`

## 路径约定
- 生成图片：`public/generated-images/{student_no}/{student_no}_{index}.png`

## 教师管理端
- 入口：`/admin/login` 简易 Cookie 保护（生产建议改为正式鉴权）
- 配置页：`/admin/config`
- 导出页：`/admin/export` 选择起止时间导出 CSV

## 注意
- 生成接口默认下载两张占位图模拟，便于联调；如需接入豆包，请在 `src/lib/imageGenerator.ts` 中替换下载逻辑为真实 API 调用并将图片写入上述路径。
- 计时在前端以登录时间为基准，页面刷新后自动恢复并在提交时计算总秒数传回后端。
"# hssc_web" 
# hs_web2
