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
        back: "返回首页",
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
    },

    // 帮助页面
    help: {
        title: "使用帮助",
        uploadTitle: "如何上传文件",
        uploadDesc: "拖拽PDF文件到上传区域，或点击选择文件按钮上传。支持最大50MB的PDF文件。",
        analysisTitle: "查看分析结果",
        analysisDesc: "上传后系统会自动分析PDF结构，显示文件信息、安全状态和验证结果。",
        exportTitle: "导出结果",
        exportDesc: "点击导出按钮可以下载分析报告，包含详细的PDF结构信息。",
        faqTitle: "常见问题",
        faqItems: [
            "文件过大：请确保PDF文件小于50MB",
            "格式不支持：仅支持标准PDF格式",
            "分析失败：请检查文件是否损坏",
            "浏览器兼容：建议使用Chrome、Firefox、Safari等现代浏览器",
            "网络问题：确保网络连接稳定"
        ],
        tipsTitle: "使用技巧",
        tipsItems: [
            "拖拽上传：直接将PDF文件拖拽到上传区域",
            "批量处理：一次只能处理一个文件，但可以连续处理多个",
            "结果导出：分析完成后可导出详细报告",
            "安全检测：系统会自动检测PDF中的安全风险"
        ]
    },

    // 关于页面
    about: {
        title: "关于我们",
        introTitle: "项目介绍",
        introDesc: "PDF Inspector Pro 是一款专业的PDF格式校验工具，基于PDF 1.7标准开发，提供全面的PDF文件分析和验证功能。",
        featuresTitle: "核心功能",
        featuresItems: [
            "PDF结构解析和可视化",
            "格式标准验证",
            "安全风险评估",
            "问题检测和报告",
            "拖拽上传支持"
        ],
        techTitle: "技术特点",
        techItems: [
            "基于PDF 1.7标准",
            "纯前端实现，保护隐私",
            "实时分析处理",
            "响应式设计"
        ],
        stackTitle: "技术栈",
        stackDesc: "HTML5, CSS3, JavaScript, D3.js, Font Awesome",
        teamTitle: "开发团队",
        teamDesc: "PDF Inspector Pro 由专业的PDF格式验证团队开发，致力于为用户提供高质量的PDF分析工具。",
        contributeTitle: "开源贡献",
        contributeDesc: "我们欢迎社区贡献，如果您发现bug或有改进建议，欢迎联系我们。"
    },

    // 隐私政策页面
    privacy: {
        title: "隐私政策",
        collectionTitle: "信息收集",
        collectionDesc: "PDF Inspector Pro 不会收集或存储您的个人信息。所有文件处理都在您的浏览器本地进行，不会上传到服务器。",
        securityTitle: "数据安全",
        securityDesc: "您的PDF文件仅在本地处理，不会传输到任何外部服务器。我们采用纯前端技术，确保您的文件安全。",
        cookieTitle: "Cookie使用",
        cookieDesc: "本网站可能使用必要的Cookie来改善用户体验，但不会用于跟踪或收集个人信息。",
        linksTitle: "外部链接",
        linksDesc: "本网站可能包含指向外部网站的链接，我们不对这些网站的隐私政策负责。",
        updateTitle: "政策更新",
        updateDesc: "本隐私政策可能会更新，更新后的政策将在此页面发布。",
        protectionTitle: "数据保护",
        protectionDesc: "我们采用行业标准的安全措施保护您的数据，包括加密传输和安全的存储实践。",
        thirdPartyTitle: "第三方服务",
        thirdPartyDesc: "我们不会与第三方分享您的个人信息，除非法律要求或获得您的明确同意。"
    },

    // 服务条款页面
    terms: {
        title: "服务条款",
        serviceTitle: "服务说明",
        serviceDesc: "PDF Inspector Pro 提供免费的PDF格式校验服务，基于PDF 1.7标准进行文件分析和验证。",
        userTitle: "用户责任",
        userItems: [
            "确保上传的文件为合法拥有的PDF文件",
            "遵守相关法律法规",
            "不滥用服务资源"
        ],
        disclaimerTitle: "免责声明",
        disclaimerDesc: "本服务按"现状"提供，不保证结果的准确性。用户应自行承担使用风险。",
        prohibitedTitle: "禁止行为",
        prohibitedItems: [
            "上传恶意文件或病毒",
            "进行恶意攻击或破坏服务",
            "侵犯他人知识产权"
        ],
        updateTitle: "条款更新",
        updateDesc: "本服务条款可能会更新，更新后的条款将在此页面发布。",
        legalTitle: "法律条款",
        legalDesc: "使用本服务即表示您同意遵守所有适用的法律法规，并承担相应的法律责任。",
        disputeTitle: "争议解决",
        disputeDesc: "如发生争议，我们将优先通过友好协商解决。如协商不成，将按照相关法律程序处理。"
    }
};

export default zhCN; 