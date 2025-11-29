# Lumière French AI - 法语 AI 学习伴侣

这是一个由 Google Gemini AI 驱动的互动式法语学习应用。它结合了智能对话、个性化课程生成和实时发音纠正功能，为中文母语者提供沉浸式的法语学习体验。

## ✨ 主要功能

*   **AI 智能导师**：具备记忆功能的角色扮演对话，支持中文/法语双语辅助。
*   **动态课程生成**：根据所选主题（如咖啡馆、旅行、购物），实时生成包含词汇、语法和测验的结构化课程。
*   **TTS 发音**：点击任意法语句子或单词即可听到标准发音（由 Gemini 语音模型驱动）。
*   **进度追踪**：自动记录学习连续天数和已掌握的单词数量。

## 🚀 部署到 Vercel (推荐)

本项目已配置为标准 Vite 项目，非常适合部署到 Vercel。

1. **Fork 或 Upload**：将本代码上传到您的 GitHub 仓库。
2. **Import Project**：在 Vercel 控制台中导入该仓库。
    *   Vercel 会自动识别 `Vite` 框架，Build Command 和 Output Directory (dist) 通常会自动填充，无需修改。
3. **设置环境变量 (关键步骤)**：
    *   在部署页面的 "Environment Variables" 部分添加：
    *   **Key**: `VITE_API_KEY`  (注意：必须以 VITE_ 开头)
    *   **Value**: 您的 Google Gemini API Key ([在此获取](https://aistudio.google.com/app/apikey))
4. **Deploy**：点击部署，等待约 1 分钟即可访问。

## 🛠️ 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```
2. 创建 `.env` 文件并填入您的 API Key：
   ```
   VITE_API_KEY=您的Key
   ```
3. 启动服务器：
   ```bash
   npm run dev
   ```

## 📚 技术栈

*   **Framework**: React 18 + Vite
*   **Styling**: Tailwind CSS
*   **AI SDK**: Google GenAI SDK (Gemini 2.5 Flash)