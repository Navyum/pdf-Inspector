/**
 * 中文语言包
 * Chinese (Simplified) Language Pack
 */
const zhCN = {
    // 应用标题和描述
    app: {
        title: "PDF Inspector Pro",
        subtitle: "专业PDF格式校验工具",
        description: "基于PDF 1.7标准的专业PDF格式校验工具，提供可视化结构分析、问题检测、安全风险评估等功能。"
    },

    // 导航栏
    header: {
        currentFile: "未选择文件",
        processingStatus: "就绪",
        clear: "清空",
        export: "导出",
        help: "帮助"
    },

    // 上传区域
    upload: {
        title: "拖拽PDF文件到此处或点击选择",
        subtitle: "支持单个文件上传",
        selectFile: "选择文件",
        dragDrop: "拖拽PDF文件到此处或点击选择",
        supportedSize: "支持的文件大小：最大50MB",
        processing: "正在处理PDF文件",
        parsing: "解析中...",
        processedCount: "已处理",
        totalCount: "总计"
    },

    // 文件信息
    fileInfo: {
        title: "文件信息",
        fileName: "文件名",
        fileSize: "文件大小",
        pdfVersion: "PDF版本",
        pageCount: "页面数量",
        encryptionStatus: "加密状态",
        encrypted: "已加密",
        notEncrypted: "未加密",
        basicInfo: "基本信息",
        structureInfo: "结构信息",
        securityInfo: "安全信息",
        validationInfo: "验证结果",
        objectCount: "对象数量",
        validationStatus: "验证状态",
        errorCount: "错误数量",
        warningCount: "警告数量",
        hasJavaScript: "JavaScript",
        hasExternalLinks: "外部链接",
        hasEmbeddedFiles: "嵌入文件"
    },

    // 统计信息
    stats: {
        avgObjectSize: "平均对象大小",
        objectTypes: "对象类型数",
        compressionRatio: "压缩率",
        files: "文件"
    },

    // 进度信息
    progress: {
        processing: "正在处理PDF文件",
        parsing: "解析中...",
        processedCount: "已处理",
        totalCount: "总计"
    },

    // 筛选按钮
    filters: {
        all: "全部",
        error: "错误",
        warning: "警告",
        success: "正常"
    },

    // 工具栏按钮
    toolbar: {
        zoomIn: "放大",
        zoomOut: "缩小",
        resetZoom: "重置缩放",
        exportImage: "导出图片",
        filter: "筛选",
        exportReport: "导出报告",
        copy: "复制",
        format: "格式化",
        download: "下载"
    },

    // 验证结果
    validation: {
        title: "验证结果",
        passed: "通过",
        failed: "失败",
        notVerified: "未验证",
        warning: "警告",
        error: "错误",
        critical: "严重",
        info: "信息",
        success: "成功",
        noErrors: "无错误",
        noWarnings: "无警告",
        totalIssues: "总问题数",
        validationPassed: "验证通过",
        validationFailed: "验证失败"
    },

    // 标签页
    tabs: {
        structure: "结构树",
        graph: "关系图",
        issues: "问题列表",
        analysis: "分析报告",
        raw: "原始数据"
    },

    // 结构树
    structure: {
        search: "搜索对象...",
        filter: "筛选",
        view: "视图",
        expandAll: "展开全部",
        collapseAll: "折叠全部",
        showErrors: "显示错误",
        showWarnings: "显示警告",
        showInfo: "显示信息"
    },

    // 关系图
    graph: {
        noRelationships: "没有找到对象关系",
        title: "对象关系图",
        zoomIn: "放大",
        zoomOut: "缩小",
        reset: "重置",
        fitToScreen: "适应屏幕",
        showLabels: "显示标签",
        hideLabels: "隐藏标签"
    },

    // 问题列表
    issues: {
        title: "问题列表",
        level: "级别",
        location: "位置",
        description: "描述",
        noIssues: "未发现问题",
        filterByLevel: "按级别筛选",
        all: "全部",
        error: "错误",
        warning: "警告",
        info: "信息"
    },

    // 分析报告
    analysis: {
        title: "分析报告",
        overview: "概览",
        statistics: "统计信息",
        security: "安全分析",
        performance: "性能分析",
        objects: "对象统计",
        streams: "流对象",
        references: "引用关系"
    },

    // 原始数据
    raw: {
        title: "原始数据",
        copy: "复制",
        format: "格式化",
        download: "下载",
        rawData: "原始数据"
    },

    // 帮助内容
    help: {
        title: "帮助中心",
        upload: {
            title: "文件上传",
            description: "支持拖拽上传和点击选择PDF文件"
        },
        features: {
            title: "功能说明",
            structure: "结构树：显示PDF文档的完整对象结构",
            graph: "关系图：可视化对象之间的引用关系",
            issues: "问题列表：显示验证发现的问题和警告",
            analysis: "分析报告：详细的PDF分析和统计信息",
            raw: "原始数据：查看PDF的原始解析数据"
        },
        about: {
            title: "关于工具",
            description: "PDF Inspector Pro 是一个强大的PDF文档分析工具，可以帮助您深入了解PDF文件的结构、验证文件完整性、发现潜在问题。"
        },
        rules: {
            title: "PDF检测规则",
            description: "本工具基于PDF 1.7标准(ISO 32000-1)进行验证，包含以下12个主要检测类别："
        }
    },

    // 验证规则
    validationRules: {
        header: "PDF头部验证",
        catalog: "Catalog对象验证",
        pages: "Pages对象验证",
        page: "Page对象验证",
        font: "Font对象验证",
        xobject: "XObject对象验证",
        stream: "Stream对象验证",
        xref: "XRef表验证",
        trailer: "Trailer验证",
        reference: "引用关系验证",
        security: "安全验证",
        performance: "性能验证"
    },

    // 页脚
    footer: {
        features: "功能特性",
        support: "技术支持",
        contact: "联系我们",
        copyright: "© 2024 PDF Inspector Pro. 保留所有权利。",
        description: "专业的PDF格式校验工具，基于PDF 1.7标准验证PDF文件结构",
        pdfStructureAnalysis: "PDF结构解析",
        formatValidation: "格式标准验证",
        issueDetection: "问题检测",
        securityAssessment: "安全风险评估",
        helpDocs: "帮助文档",
        aboutUs: "关于我们",
        privacyPolicy: "隐私政策",
        termsOfService: "使用条款",
        emailSupport: "邮件支持"
    },

    // 模态框
    modal: {
        objectDetail: "对象详情",
        close: "关闭"
    },

    // 通用
    common: {
        loading: "加载中...",
        error: "错误",
        success: "成功",
        warning: "警告",
        info: "信息",
        close: "关闭",
        cancel: "取消",
        confirm: "确认",
        save: "保存",
        edit: "编辑",
        delete: "删除",
        refresh: "刷新",
        search: "搜索",
        filter: "筛选",
        sort: "排序",
        export: "导出",
        import: "导入",
        download: "下载",
        upload: "上传",
        yes: "是",
        no: "否",
        ok: "确定",
        back: "返回",
        next: "下一步",
        previous: "上一步",
        finish: "完成"
    },

    // 错误信息
    errors: {
        d3LoadFailed: "D3.js库加载失败，无法显示关系图",
        fileLoadFailed: "文件加载失败",
        parsingFailed: "解析失败",
        validationFailed: "验证失败"
    }
};

export default zhCN; 