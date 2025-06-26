# 多语言支持 (i18n)

本项目使用 `react-i18next` 实现了完整的多语言支持，支持中文和英文两种语言。

## 功能特性

- 🌍 支持中文 (zh-CN) 和英文 (en-US)
- 🔄 实时语言切换
- 💾 语言偏好自动保存到本地存储
- 🎯 自动检测浏览器语言
- 📱 响应式语言切换器

## 文件结构

```
src/
├── i18n.js                    # i18n 配置文件
├── locales/                   # 语言文件目录
│   ├── zh-CN.json            # 中文语言文件
│   └── en-US.json            # 英文语言文件
├── components/
│   └── LanguageSwitcher.js   # 语言切换组件
└── hooks/
    └── useI18n.js            # 自定义 i18n hook
```

## 使用方法

### 1. 在组件中使用翻译

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.dashboard')}</h1>
      <p>{t('dashboard.title')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 2. 使用自定义 Hook

```jsx
import React from 'react';
import { useI18n } from '../hooks/useI18n';

function MyComponent() {
  const { t, changeLanguage, getCurrentLanguage } = useI18n();

  const handleLanguageChange = () => {
    changeLanguage('en-US');
  };

  return (
    <div>
      <p>当前语言: {getCurrentLanguage()}</p>
      <button onClick={handleLanguageChange}>
        {t('common.language')}
      </button>
    </div>
  );
}
```

### 3. 添加语言切换器

```jsx
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  return (
    <div>
      <header>
        <LanguageSwitcher />
      </header>
      {/* 其他内容 */}
    </div>
  );
}
```

## 语言文件结构

语言文件采用嵌套的 JSON 结构，按功能模块组织：

```json
{
  "common": {
    "dashboard": "仪表板",
    "network": "网络",
    "save": "保存",
    "cancel": "取消"
  },
  "dashboard": {
    "title": "系统概览",
    "cpuUsage": "CPU使用率",
    "memoryUsage": "内存使用率"
  },
  "network": {
    "title": "网络设置",
    "wan": "广域网",
    "lan": "局域网"
  }
}
```

## 添加新语言

1. 在 `src/locales/` 目录下创建新的语言文件，例如 `ja-JP.json`
2. 在 `src/i18n.js` 中导入新语言文件并添加到 resources 对象
3. 在 `src/hooks/useI18n.js` 中的 `getAvailableLanguages` 函数中添加新语言选项

```jsx
// src/i18n.js
import jaJP from './locales/ja-JP.json';

const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'ja-JP': { translation: jaJP }  // 添加新语言
};
```

## 翻译键命名规范

- 使用点号分隔的层级结构
- 按功能模块分组 (common, dashboard, network, etc.)
- 使用描述性的键名
- 保持键名的一致性

示例：
- `common.save` - 通用保存按钮
- `dashboard.cpuUsage` - 仪表板CPU使用率
- `network.wanSettings` - 网络WAN设置

## 动态内容翻译

对于包含变量的翻译，使用插值语法：

```jsx
// 语言文件
{
  "welcome": "欢迎, {{name}}!",
  "items": "共 {{count}} 个项目"
}

// 组件中使用
const { t } = useTranslation();
t('welcome', { name: 'John' });  // "欢迎, John!"
t('items', { count: 5 });        // "共 5 个项目"
```

## 复数形式

对于需要复数形式的文本：

```jsx
// 语言文件
{
  "item": "{{count}} 个项目",
  "item_0": "没有项目",
  "item_1": "1 个项目",
  "item_other": "{{count}} 个项目"
}

// 组件中使用
t('item', { count: 0 });  // "没有项目"
t('item', { count: 1 });  // "1 个项目"
t('item', { count: 5 });  // "5 个项目"
```

## 最佳实践

1. **保持键名一致性**: 在整个应用中使用相同的翻译键
2. **模块化组织**: 按功能模块组织翻译键
3. **避免硬编码**: 不要在代码中硬编码文本
4. **测试翻译**: 确保所有语言都有对应的翻译
5. **上下文清晰**: 使用描述性的键名，便于理解上下文

## 故障排除

### 翻译不显示
- 检查翻译键是否正确
- 确认语言文件已正确导入
- 验证 i18n 配置是否正确

### 语言切换不生效
- 检查 `changeLanguage` 函数调用
- 确认语言代码格式正确
- 验证语言文件是否存在

### 开发模式调试
在开发模式下，i18n 会输出调试信息到控制台，帮助识别缺失的翻译键。 