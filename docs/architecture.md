# 仙侠文字RPG 架构设计

## 项目结构

```
xianxia-rpg/
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── components/          # React组件（计划中）
│   ├── data/                # 游戏数据
│   │   └── story.json       # 剧情数据
│   ├── firebase/            # Firebase配置
│   │   └── config.js        # Firebase初始化
│   ├── store/               # 状态管理（计划中）
│   ├── App.js               # 主应用组件
│   └── index.js             # 入口文件
├── package.json             # 项目依赖
└── README.md                # 项目说明
```

## 文件功能说明

### 核心文件

1. **src/App.js**
   - 应用程序的主入口
   - 负责组织和渲染主要组件
   - 处理初始数据加载
   - 当前实现：加载并显示第一个剧情章节

2. **src/data/story.json**
   - 存储游戏剧情数据
   - 使用树状结构管理剧情分支
   - 每个章节包含ID、标题、文本和选项
   - 选项包含文本、下一章节ID和状态效果

3. **src/firebase/config.js**
   - Firebase服务的配置文件
   - 初始化Firebase应用
   - 导出Firestore数据库实例
   - 用于后续实现存档/读档功能

### 即将实现的组件

1. **src/components/StoryDisplay.js** (计划中)
   - 用于展示剧情文本和标题
   - 负责剧情内容的格式化和样式

2. **src/components/Options.js** (计划中)
   - 渲染选项按钮
   - 处理选项选择事件
   - 通知父组件所选的选项

3. **src/store/playerState.js** (计划中)
   - 使用React Context API管理玩家状态
   - 存储修为、灵力、因果值等属性
   - 提供更新状态的方法
   - 负责状态与选项效果的交互

## 数据流设计

1. **剧情数据流**
   - App.js加载story.json
   - 将当前章节传递给StoryDisplay组件
   - 将当前章节的选项传递给Options组件
   - 选项选择后，更新当前章节ID，重新获取章节数据

2. **玩家状态流**
   - PlayerProvider包装整个应用
   - 通过usePlayerState钩子在组件中访问状态
   - 选项选择时，根据选项效果更新状态
   - 状态变化通知相关组件更新

3. **存档/读档流**
   - 保存按钮触发保存函数
   - 将玩家状态和当前章节ID保存到Firestore
   - 加载按钮触发加载函数
   - 从Firestore获取最新存档，更新状态和章节

## 扩展计划

1. **组件化改进**
   - 进一步拆分App.js，提高代码可维护性
   - 创建GameContainer组件管理剧情和玩家状态

2. **样式优化**
   - 实现响应式设计，适配移动设备
   - 添加过渡动画，提升用户体验

3. **功能扩展**
   - 实现音效系统
   - 添加战斗机制
   - 实现门派系统
   - 扩展剧情分支