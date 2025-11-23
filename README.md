# 🌞 阳光小屋 - 儿童心理疗愈 App

一个专门为抑郁症儿童设计的心理健康疗愈应用。

## ✨ 主要功能

- 📊 **情绪记录** - 每日记录心情状态
- 🫁 **呼吸练习** - 引导式呼吸放松技巧
- 🧘 **冥想时光** - 多种冥想主题选择
- 📝 **情绪日记** - 记录和表达内心感受
- 🎯 **快乐活动** - 建议积极的活动
- 🏆 **积分奖励** - 激励系统增加参与度
- 📅 **连续打卡** - 培养健康习惯

## 🚀 快速开始

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 开发模式
\`\`\`bash
npm run dev
\`\`\`

### 构建项目
\`\`\`bash
npm run build
\`\`\`

### 生成 APK

1. 构建 Web 版本
\`\`\`bash
npm run build
\`\`\`

2. 同步到 Android
\`\`\`bash
npx cap sync
\`\`\`

3. 打开 Android Studio
\`\`\`bash
npx cap open android
\`\`\`

4. 在 Android Studio 中: Build → Build Bundle(s) / APK(s) → Build APK(s)

## 📋 系统要求

- Node.js 16+
- Android Studio (用于生成 APK)
- Java JDK 11+

## 🛠️ 技术栈

- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Capacitor 5

## 📱 支持平台

- Web 浏览器
- Android (APK)
- iOS (需要 Mac 和 Xcode)

## 📄 许可证

MIT License

## 👨‍💻 作者

Your Name

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests!
\`\`\`

---

## 🚀 完整构建步骤

### 步骤 1: 创建项目文件夹
\`\`\`bash
mkdir HealingKidsApp
cd HealingKidsApp
\`\`\`

### 步骤 2: 创建所有文件
按照上面的内容创建每个文件（复制粘贴内容）

### 步骤 3: 安装依赖
\`\`\`bash
npm install
\`\`\`

### 步骤 4: 测试 Web 版本
\`\`\`bash
npm run dev
\`\`\`
访问 http://localhost:3000

### 步骤 5: 构建并生成 APK
\`\`\`bash
# 构建
npm run build

# 添加 Android 平台
npx cap add android

# 同步文件
npx cap sync

# 打开 Android Studio
npx cap open android
\`\`\`

### 步骤 6: 在 Android Studio 生成 APK
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- 等待构建完成
- APK 位置: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📤 上传到 GitHub

### 初始化 Git
\`\`\`bash
git init
git add .
git commit -m "Initial commit: 阳光小屋儿童心理疗愈App"
\`\`\`

### 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名: `HealingKidsApp`
3. 描述: `儿童心理疗愈健康应用`
4. 选择 Public 或 Private
5. 点击 "Create repository"

### 推送到 GitHub
\`\`\`bash
git remote add origin https://github.com/你的用户名/HealingKidsApp.git
git branch -M main
git push -u origin main
\`\`\`

---

## 🎯 下一步

1. ✅ 复制所有文件内容到对应位置
2. ✅ 运行 `npm install`
3. ✅ 测试 `npm run dev`
4. ✅ 构建 APK
5. ✅ 上传到 GitHub

完成！🎉