# 仙侠文字RPG

一个基于React的仙侠题材文字角色扮演游戏，玩家将扮演一名从凡人踏上修仙之路的主角，通过选择不同的选项来推进剧情，体验修仙小说的奇幻与成长。

## 功能特点

- 沉浸式剧情体验
- 多样化选择影响游戏走向
- 角色属性系统（修为、灵力、因果值）
- 存档和读档功能

## 技术栈

- **前端框架**: React
- **路由管理**: React Router
- **后端服务**: Firebase (Firestore)
- **音效管理**: Howler.js

## 安装说明

1. 克隆仓库到本地:
   ```
   git clone <仓库URL>
   ```

2. 进入项目目录:
   ```
   cd xianxia-rpg
   ```

3. 安装依赖:
   ```
   npm install
   ```

4. 配置Firebase:
   - 在Firebase控制台创建一个新项目
   - 启用Firestore数据库
   - 复制Firebase配置信息到`src/firebase/config.js`文件

5. 启动开发服务器:
   ```
   npm start
   ```

## 项目结构

```
xianxia-rpg/
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── components/          # React组件
│   ├── data/                # 游戏数据
│   │   └── story.json       # 剧情数据
│   ├── firebase/            # Firebase配置
│   │   └── config.js        # Firebase初始化
│   ├── store/               # 状态管理
│   ├── App.js               # 主应用组件
│   └── index.js             # 入口文件
├── package.json             # 项目依赖
└── README.md                # 项目说明
```

## 游戏玩法

1. 阅读剧情文本
2. 选择不同的选项推进故事
3. 管理角色属性（修为、灵力、因果值）
4. 根据选择体验不同的结局

## 开发进度

- [x] 项目初始化
- [x] 基础剧情展示
- [ ] 选项选择功能
- [ ] 状态管理系统
- [ ] 存档与读档功能
- [ ] 音效集成
- [ ] 高级功能（战斗系统、门派选择等）

## 贡献指南

欢迎贡献代码或提出建议！请通过 Issue 或 Pull Request 参与项目开发。

## 许可证

本项目采用 MIT 许可证。