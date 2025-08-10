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
        
        // 绑定事件
        this.bindEvents();
        
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
     * 绑定事件
     */
    bindEvents() {
        // 文件上传事件
        document.getElementById('selectFileBtn').addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // 拖拽上传
        const uploadArea = document.getElementById('uploadArea');
        
        // 整个上传区域点击事件
        uploadArea.addEventListener('click', (e) => {
            // 如果点击的不是按钮，则触发文件选择
            if (!e.target.closest('#selectFileBtn')) {
                document.getElementById('fileInput').click();
            }
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileDrop(e.dataTransfer.files);
        });
        
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 确保获取到按钮元素，而不是其子元素
                const button = e.target.closest('.tab-btn');
                if (button && button.dataset.tab) {
                    this.switchTab(button.dataset.tab);
                }
            });
        });
        
        // 帮助按钮
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showHelpModal();
        });
        
        // 模态框关闭
        document.getElementById('closeHelpModal').addEventListener('click', () => {
            this.hideHelpModal();
        });
        
        document.getElementById('closeObjectModal').addEventListener('click', () => {
            this.hideObjectModal();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 移除快捷键处理
        });
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
            this.showError('请选择有效的PDF文件');
            return;
        }
        
        this.showProgress();
        this.updateProgress(1, 1, `处理文件: ${file.name}`);
        
        try {
            await this.processFile(file);
            this.showResults();
        } catch (error) {
            console.error('处理文件时出错:', error);
            this.showError('处理文件时出错: ' + error.message);
        } finally {
            this.hideProgress();
            // 清空文件输入框，确保重新选择同一个文件时能触发change事件
            document.getElementById('fileInput').value = '';
        }
    }
    
    /**
     * 处理文件拖拽
     */
    async handleFileDrop(files) {
        if (files.length === 0) {
            this.showError('请拖拽PDF文件');
            return;
        }
        
        // 只处理第一个PDF文件
        const file = files[0];
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            this.showError('请拖拽有效的PDF文件');
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
     * 切换标签页
     */
    switchTab(tabName) {
        // 检查标签页是否存在
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const tabPane = document.getElementById(`${tabName}-tab`);
        
        if (!tabButton || !tabPane) {
            console.warn(`标签页 "${tabName}" 不存在`);
            return;
        }
        
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        tabButton.classList.add('active');
        
        // 更新标签页内容
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        tabPane.classList.add('active');
        
        // 触发特定标签页的渲染
        if (tabName === 'graph') {
            this.visualizer.renderRelationshipGraph(this.pdfStructure);
        }
    }
    
    /**
     * 显示进度
     */
    showProgress() {
        const uploadSection = document.getElementById('uploadSection');
        const featuresSection = document.getElementById('featuresSection');
        const progressSection = document.getElementById('progressSection');
        const resultsSection = document.getElementById('resultsSection');
        
        // 添加上传区域隐藏动画
        uploadSection.classList.add('hiding');
        
        // 隐藏特性区域
        if (featuresSection) {
            featuresSection.style.display = 'none';
        }
        
        // 显示进度区域
        progressSection.style.display = 'block';
        resultsSection.style.display = 'none';
        
        // 移除动画类
        setTimeout(() => {
            uploadSection.style.display = 'none';
            uploadSection.classList.remove('hiding');
        }, 500);
    }
    
    /**
     * 隐藏进度
     */
    hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
    }
    
    /**
     * 更新进度
     */
    updateProgress(current, total, text) {
        const percentage = (current / total) * 100;
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = text;
        document.getElementById('processedCount').textContent = current;
        document.getElementById('totalCount').textContent = total;
    }
    
    /**
     * 显示结果
     */
    showResults() {
        const uploadSection = document.getElementById('uploadSection');
        const progressSection = document.getElementById('progressSection');
        const resultsSection = document.getElementById('resultsSection');
        
        // 添加上传区域隐藏动画
        uploadSection.classList.add('hiding');
        
        // 隐藏进度区域
        progressSection.style.display = 'none';
        
        // 显示结果区域并添加动画
        resultsSection.style.display = 'grid';
        resultsSection.classList.add('showing');
        
        // 移除动画类
        setTimeout(() => {
            uploadSection.style.display = 'none';
            uploadSection.classList.remove('hiding');
            resultsSection.classList.remove('showing');
        }, 500);
    }
    
    /**
     * 显示错误
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.querySelector('.main-content').insertBefore(errorDiv, document.querySelector('.main-content').firstChild);
        
        // 自动移除错误消息
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    /**
     * 显示帮助模态框
     */
    showHelpModal() {
        document.getElementById('helpModal').classList.add('show');
    }
    
    /**
     * 隐藏帮助模态框
     */
    hideHelpModal() {
        document.getElementById('helpModal').classList.remove('show');
    }
    
    /**
     * 显示对象详情模态框
     */
    showObjectModal(object) {
        const titleText = window.languageManager ? 
            window.languageManager.get('modal.objectDetail') : '对象详情';
        document.getElementById('objectDetailTitle').textContent = `${titleText} ${object.objectNumber} ${object.generation} R`;
        document.getElementById('objectDetailContent').innerHTML = this.formatObjectDetails(object);
        document.getElementById('objectDetailModal').classList.add('show');
    }
    
    /**
     * 隐藏对象详情模态框
     */
    hideObjectModal() {
        document.getElementById('objectDetailModal').classList.remove('show');
    }
    
    /**
     * 格式化对象详情
     */
    formatObjectDetails(object) {
        let html = `
            <div class="object-detail-section">
                <h4>基本信息</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">对象编号:</span>
                        <span class="value">${object.objectNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">生成号:</span>
                        <span class="value">${object.generation}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">类型:</span>
                        <span class="value">${object.type || 'Unknown'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">偏移量:</span>
                        <span class="value">${object.offset || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
        
        if (object.properties) {
            html += `
                <div class="object-detail-section">
                    <h4>属性</h4>
                    <div class="properties-list">
            `;
            
            Object.entries(object.properties).forEach(([key, value]) => {
                if (key !== 'streamData') { // 跳过stream数据，避免显示过多内容
                    html += `
                        <div class="property-item">
                            <span class="property-name">${key}:</span>
                            <span class="property-value">${this.formatPropertyValue(value)}</span>
                        </div>
                    `;
                }
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        if (object.rawContent) {
            html += `
                <div class="object-detail-section">
                    <h4>原始内容</h4>
                    <pre class="raw-content">${this.escapeHtml(object.rawContent.substring(0, 1000))}${object.rawContent.length > 1000 ? '...' : ''}</pre>
                </div>
            `;
        }
        
        return html;
    }
    
    /**
     * 格式化属性值
     */
    formatPropertyValue(value) {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }
    
    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
            this.showError('没有可导出的结果');
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