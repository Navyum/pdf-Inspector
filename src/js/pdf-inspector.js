/**
 * PDF Inspector Pro - 核心类
 * 整合PDF解析、验证、可视化和用户界面功能
 */

class PDFInspector {
    constructor() {
        // 等待所有依赖加载完成
        this.parser = null;
        this.analyser = null;
        this.visualizer = null;
        this.uiController = null;
        
        this.currentFile = null;
        this.pdfStructure = null;
        this.validationResults = null;
        this.appState = {
            currentFile: null,
            pdfStructure: null,
            validationResults: null,
            visualizationMode: 'tree',
            selectedNode: null,
            filters: {
                showErrors: true,
                showWarnings: true,
                showInfo: false,
                showSuccess: true
            }
        };
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    init() {
        console.log('PDF Inspector Pro 初始化...');
        
        // 初始化依赖
        this.initDependencies();
        
        // 初始化UI控制器
        this.uiController.init(this);
        
        // 加载设置
        this.loadSettings();
        
        console.log('PDF Inspector Pro 初始化完成');
    }
    
    /**
     * 初始化依赖
     */
    initDependencies() {
        // 检查并初始化依赖
        if (typeof window !== 'undefined') {
            this.parser = new window.PDFParser();
            this.visualizer = new window.PDFVisualizer();
            this.uiController = new window.UIController();
        } else {
            // Node.js环境
            this.parser = new PDFParser();
            this.visualizer = new PDFVisualizer();
            this.uiController = new UIController();
        }
    }
    

    
    /**
     * 处理文件选择
     */
    async handleFileSelect(files) {
        if (files.length === 0) return;
        
        // 新文件前彻底清理pdfStructure
        if (this.pdfStructure && typeof this.pdfStructure.clear === 'function') {
            this.pdfStructure.clear();
        } else {
            this.pdfStructure = null;
        }
        
        // 只处理第一个文件
        const file = files[0];
        if (file.type !== 'application/pdf') {
            this.uiController.showError('请选择有效的PDF文件');
            return;
        }
        
        this.uiController.showProgress();
        this.uiController.updateProgress(1, 1, `处理文件: ${file.name}`);
        
        try {
            await this.processFile(file);
            this.uiController.showResults();
        } catch (error) {
            console.error('处理文件时出错:', error);
            this.uiController.showError('处理文件时出错: ' + error.message);
        } finally {
            // 清空文件输入框，确保重新选择同一个文件时能触发change事件
            document.getElementById('fileInput').value = '';
        }
    }
    
    /**
     * 处理文件拖拽
     */
    async handleFileDrop(files) {
        if (files.length === 0) {
            this.uiController.showError('请拖拽PDF文件');
            return;
        }
        
        // 只处理第一个PDF文件
        const file = files[0];
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            this.uiController.showError('请拖拽有效的PDF文件');
            return;
        }
        
        await this.handleFileSelect([file]);
    }
    
    /**
     * 处理单个文件
     */
    async processFile(file) {
        // 新文件前彻底清理pdfStructure
        if (this.pdfStructure && typeof this.pdfStructure.clear === 'function') {
            this.pdfStructure.clear();
        } else {
            this.pdfStructure = null;
        }
        console.log(`开始处理文件: ${file.name}`);
        
        try {
            // 读取文件
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            
            // 解析PDF
            const result = await this.parser.parsePDF(file);
            if (!result.success) {
                throw new Error(result.error || 'PDF解析失败');
            }
            this.pdfStructure = result.structure;
            
            // 创建分析器
            this.analyser = new window.PDFAnalyser(this.pdfStructure);
            
            // 执行验证
            this.validationResults = await this.analyser.analyze();
            
            // 更新文件信息
            this.updateFileInfo(file);
            
            // 更新验证结果
            this.updateValidationResults();
            
            // 渲染可视化
            this.renderVisualizations();
            
            console.log(`文件处理完成: ${file.name}`);
            
        } catch (error) {
            console.error(`处理文件失败: ${file.name}`, error);
            throw error;
        }
    }
    
    /**
     * 读取文件为ArrayBuffer
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * 更新文件信息
     */
    updateFileInfo(file) {
        // 更新基本文件信息
        this.uiController.updateFileInfo(file);
        
        // 更新PDF结构信息
        if (this.pdfStructure) {
            this.uiController.updatePDFInfo(this.pdfStructure, this.validationResults);
        }
    }
    
    /**
     * 获取页面数量
     */
    getPageCount() {
        if (!this.pdfStructure?.physical?.objects) return 0;
        
        let pageCount = 0;
        this.pdfStructure.physical.objects.forEach(obj => {
            if (obj.type === 'Page') {
                pageCount++;
            }
        });
        
        return pageCount;
    }
    
    /**
     * 检查文件是否加密
     */
    isFileEncrypted() {
        return this.pdfStructure?.physical?.trailer?.properties?.Encrypt !== undefined;
    }
    
    /**
     * 更新验证结果
     */
    updateValidationResults() {
        if (!this.validationResults) return;
        
        // 验证结果现在通过UI控制器更新到信息面板中
        // 不再需要单独的验证图表
    }
    
    /**
     * 渲染可视化
     */
    renderVisualizations() {
        // 渲染结构树
        this.visualizer.renderStructureTree(this.pdfStructure, this.validationResults);
        
        // 渲染关系图
        this.visualizer.renderRelationshipGraph(this.pdfStructure);
        
        // 渲染问题列表
        this.visualizer.renderIssuesList(this.validationResults);
        
        // 渲染原始数据
        this.visualizer.renderRawData(this.pdfStructure);
    }
    

    

    

    

    

    
    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        // 移除快捷键处理
    }
    
    /**
     * 导出结果
     */
    exportResults() {
        if (!this.validationResults) {
            this.uiController.showError('没有可导出的结果');
            return;
        }
        
        const report = {
            fileInfo: {
                name: document.getElementById('fileName').textContent,
                size: document.getElementById('fileSize').textContent,
                version: document.getElementById('pdfVersion').textContent,
                objectCount: document.getElementById('objectCount').textContent,
                pageCount: document.getElementById('pageCount').textContent,
                isEncrypted: document.getElementById('isEncrypted').textContent
            },
            validationResults: this.validationResults,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pdf-inspector-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 加载设置
     */
    loadSettings() {
        // 移除设置加载逻辑
    }
    
    /**
     * 保存设置
     */
    saveSettings() {
        // 移除设置保存逻辑
    }
}

// 兼容浏览器和Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = PDFInspector;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.PDFInspector = PDFInspector;
    
    // 全局实例
    let pdfInspector;

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 延迟初始化，确保所有脚本加载完成
        setTimeout(() => {
            pdfInspector = new PDFInspector();
        }, 100);
    });
} 