# PDF Inspector Pro - 专业PDF格式校验工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/pdf-inspector-pro)
[![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

一个基于 Web 的专业 PDF 格式校验工具，用于验证 PDF 文件是否符合 PDF 1.7 标准 (ISO 32000-1)。该项目提供了完整的 PDF 结构解析、验证和分析功能，帮助开发者、文档管理员和PDF用户确保PDF文件的完整性和合规性。

## 🚀 功能特性

### ✅ 核心功能
- **PDF 文件上传**：支持拖拽上传和点击选择
- **PDF 结构解析**：可视化展示 PDF 内部对象结构
- **格式标准验证**：基于 PDF 1.7 标准检查 PDF 结构
- **问题检测**：识别并报告 PDF 中的格式问题
- **Stream 内容分析**：解析和显示 PDF Stream 对象内容
- **循环引用检测**：识别 PDF 对象间的循环引用关系

### 📊 验证项目
- **PDF 头部验证**：版本号、文件类型标识
- **Catalog 对象验证**：必需条目、对象类型
- **页面对象验证**：页面属性、边界框、资源
- **尾部信息验证**：加密状态、文件完整性
- **对象统计验证**：页面数量、线性化状态
- **XRef 表验证**：交叉引用表完整性检查
- **Trailer 验证**：文件尾部信息验证
- **Stream 对象验证**：过滤器、长度、内容检查

### 🎨 用户界面
- **现代化设计**：响应式布局，支持移动设备
- **可视化结构树**：可展开的 PDF 对象层次结构
- **问题分类显示**：错误、警告、信息三级分类
- **原始数据查看**：JSON 格式的完整解析结果
- **Stream 内容预览**：显示压缩数据的完整内容

## 🏗️ 技术架构

### 前端技术栈
- **HTML5**：语义化标记
- **CSS3**：现代化样式，渐变背景，动画效果
- **JavaScript ES6+**：模块化设计，异步处理
- **Node.js**：命令行工具和测试环境

### 核心模块
```
pdf-validator/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   ├── pdf-parser.js       # PDF 解析器
│   ├── pdf-struct.js       # PDF 结构定义
│   ├── pdf-analyser.js     # PDF 分析器
│   └── pdf-validator-ui.js # UI 控制器
├── testpdf/                # 测试 PDF 文件
├── test-*.js              # 测试脚本
└── README.md              # 项目文档
```

## 📖 使用方法

### 1. 启动项目
```bash
# 方法1：使用 Python 内置服务器
python -m http.server 8000

# 方法2：使用 Node.js http-server
npx http-server

# 方法3：使用 PHP 内置服务器
php -S localhost:8000
```

### 2. 访问应用
打开浏览器访问：`http://localhost:8000`

### 3. 上传 PDF
- 拖拽 PDF 文件到上传区域
- 或点击"选择文件"按钮选择 PDF

### 4. 查看结果
- **文件信息**：文件名、大小、版本、页面数
- **验证结果**：通过、警告、错误统计
- **PDF 结构**：可展开的对象层次树
- **问题列表**：详细的问题描述和位置
- **原始数据**：JSON 格式的完整解析结果

### 5. 命令行使用
```bash
# 测试特定 PDF 文件
node test-analyser-badcase.js

# 测试 Stream 对象解析
node test-stream.js

# 测试 PDF 子类型验证
node test-pdf-subtype.js
```

## 🔍 验证标准

### PDF 1.7 标准 (ISO 32000-1)
本项目基于 [PDF 1.7 标准](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf) 进行验证，包括：

#### 必需对象
- **Catalog**：文档目录对象
- **Pages**：页面树根对象
- **Page**：页面对象
- **MediaBox**：页面边界框

#### 验证规则
- **版本兼容性**：检查 PDF 版本号
- **对象完整性**：验证必需对象存在
- **属性有效性**：检查对象属性值
- **结构正确性**：验证对象层次关系
- **XRef 完整性**：验证交叉引用表
- **Trailer 正确性**：验证文件尾部信息
- **Stream 有效性**：验证 Stream 对象内容

## 📋 问题级别

### 🔴 错误 (Error)
- PDF 版本无效
- 必需对象缺失
- 对象类型错误
- 结构严重问题
- XRef 表错误
- Trailer 信息错误

### 🟡 警告 (Warning)
- 非标准属性值
- 性能相关问题
- 兼容性警告
- 建议性改进
- 循环引用检测

### 🔵 信息 (Info)
- 检测到的特性
- 功能说明
- 状态信息
- 提示性内容
- Stream 内容信息

## 🧪 测试功能

### 测试文件
- `testpdf/badcase.pdf`：包含各种问题的测试文件
- `testpdf/badcase2.pdf`：另一个测试用例
- `testpdf/badcase3.pdf`：Stream 对象测试

### 测试脚本
- `test-analyser-badcase.js`：主要分析测试
- `test-stream.js`：Stream 对象测试
- `test-pdf-subtype.js`：子类型验证测试

## 🔧 开发说明

### 项目结构
```
pdf-validator/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   ├── pdf-parser.js       # PDF 解析器
│   ├── pdf-struct.js       # PDF 结构定义
│   ├── pdf-analyser.js     # PDF 分析器
│   └── pdf-validator-ui.js # UI 控制器
├── testpdf/                # 测试 PDF 文件
├── test-*.js              # 测试脚本
└── README.md              # 项目文档
```

### 核心类说明

#### PDFParser
- 负责解析 PDF 文件结构
- 支持 Stream 对象内容解析
- 提取 PDF 对象和属性信息
- 处理各种 PDF 数据类型

#### PDFStructure
- 定义 PDF 对象类型映射
- 管理 PDF 物理和逻辑结构
- 提供对象类型和子类型信息

#### PDFAnalyser
- 基于 PDF 1.7 标准验证结构
- 检查对象完整性和有效性
- 生成验证问题报告
- 检测循环引用关系

#### PDFValidatorUI
- 处理用户交互
- 管理界面状态
- 更新显示内容

### 扩展开发

#### 添加新的验证规则
1. 在 `PDFAnalyser` 中添加验证方法
2. 在相应的验证方法中实现检查逻辑
3. 使用 `addIssue()` 方法报告问题

#### 自定义界面样式
1. 修改 `css/style.css` 文件
2. 添加新的 CSS 类
3. 在 JavaScript 中应用样式

#### 添加新的对象类型
1. 在 `PDFStructure.TYPE_MAP` 中添加类型定义
2. 在解析器中添加相应的解析逻辑
3. 在分析器中添加验证规则

## 🚀 高级功能

### Stream 对象分析
- 自动检测 Stream 对象
- 解析过滤器类型（如 FlateDecode）
- 显示完整的 Stream 内容
- 支持多种压缩格式

### 循环引用检测
- 识别对象间的引用关系
- 区分父子关系和循环引用
- 提供详细的引用路径信息
- 支持复杂的嵌套结构

### XRef 表验证
- 验证交叉引用表完整性
- 检查对象偏移量正确性
- 验证生成号匹配
- 检测重复条目

## 🌐 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## ⚡ 性能优化

- **分页解析**：限制解析页面数量以提高性能
- **异步处理**：非阻塞的文件解析和验证
- **内存管理**：及时释放大型文件资源
- **缓存机制**：避免重复解析相同文件
- **Stream 优化**：智能处理大型 Stream 对象

## 📚 参考资源

- [PDF 1.7 标准文档](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf)
- [PDF.js 官方文档](https://mozilla.github.io/pdf.js/)
- [pdfcpu 项目](https://github.com/pdfcpu/pdfcpu)
- [PDF 格式规范](https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf)

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 贡献指南
1. Fork 本项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 基本 PDF 解析和验证功能
- Stream 对象分析
- 循环引用检测
- XRef 表验证

---

**注意**：这是一个纯前端项目，所有处理都在浏览器中完成，不会上传文件到服务器。对于大型 PDF 文件，建议在本地环境中使用以获得更好的性能。 