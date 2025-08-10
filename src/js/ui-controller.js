/**
 * UI控制器
 * 管理用户界面交互和状态
 */
class UIController {
    constructor() {
        this.pdfInspector = null;
        this.currentTab = 'structure';
        this.modals = new Map();
        this.toasts = [];
    }
    
    /**
     * 初始化UI控制器
     */
    init(pdfInspector) {
        this.pdfInspector = pdfInspector;
        this.initModals();
        this.initToolbars();
        this.initKeyboardShortcuts();
        this.initToastStyles();
    }
    
    /**
     * 初始化模态框
     */
    initModals() {
        // 帮助模态框
        this.modals.set('help', {
            element: document.getElementById('helpModal'),
            show: () => this.showModal('help'),
            hide: () => this.hideModal('help')
        });
        
        this.modals.set('object', {
            element: document.getElementById('objectDetailModal'),
            show: () => this.showModal('object'),
            hide: () => this.hideModal('object')
        });
        
        // 绑定模态框事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }
    
    /**
     * 初始化工具栏
     */
    initToolbars() {
        // 关系图工具栏
        this.initGraphToolbar();
        
        // 问题列表工具栏
        this.initIssuesToolbar();
        
        // 原始数据工具栏
        this.initRawDataToolbar();
        
        // 底部工具栏
        this.initFooterToolbar();
    }
    
    /**
     * 初始化关系图工具栏
     */
    initGraphToolbar() {
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const exportGraphBtn = document.getElementById('exportGraphBtn');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomGraph(1.2);
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomGraph(0.8);
            });
        }
        
        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', () => {
                this.resetGraphZoom();
            });
        }
        
        if (exportGraphBtn) {
            exportGraphBtn.addEventListener('click', () => {
                this.pdfInspector.visualizer.exportGraph();
                this.showToast('关系图已导出');
            });
        }
    }
    
    /**
     * 初始化问题列表工具栏
     */
    initIssuesToolbar() {
        const filterIssuesBtn = document.getElementById('filterIssuesBtn');
        const exportIssuesBtn = document.getElementById('exportIssuesBtn');
        
        if (filterIssuesBtn) {
            filterIssuesBtn.addEventListener('click', () => {
                this.showIssuesFilter();
            });
        }
        
        if (exportIssuesBtn) {
            exportIssuesBtn.addEventListener('click', () => {
                this.pdfInspector.visualizer.exportIssuesReport(this.pdfInspector.validationResults);
                this.showToast('问题报告已导出');
            });
        }
    }
    
    /**
     * 初始化原始数据工具栏
     */
    initRawDataToolbar() {
        const copyRawBtn = document.getElementById('copyRawBtn');
        const downloadRawBtn = document.getElementById('downloadRawBtn');
        const formatRawBtn = document.getElementById('formatRawBtn');
        
        if (copyRawBtn) {
            copyRawBtn.addEventListener('click', () => {
                this.pdfInspector.visualizer.copyRawData();
            });
        }
        
        if (downloadRawBtn) {
            downloadRawBtn.addEventListener('click', () => {
                this.pdfInspector.visualizer.downloadRawData();
                this.showToast('原始数据已下载');
            });
        }
        
        if (formatRawBtn) {
            formatRawBtn.addEventListener('click', () => {
                this.pdfInspector.visualizer.formatRawData();
            });
        }
    }
    
    /**
     * 初始化底部工具栏
     */
    initFooterToolbar() {
        const clearBtn = document.getElementById('clearBtn');
        const exportBtn = document.getElementById('exportBtn');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearResults();
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.pdfInspector.exportResults();
                this.showToast('完整报告已导出');
            });
        }
    }
    
    /**
     * 显示问题筛选选项
     */
    showIssuesFilter() {
        // 移除现有的筛选面板
        document.querySelectorAll('.filter-panel').forEach(el => el.remove());
        
        // 创建筛选面板
        const filterPanel = document.createElement('div');
        filterPanel.className = 'filter-panel';
        filterPanel.innerHTML = `
            <div class="filter-header">
                <span class="filter-title">筛选问题</span>
                <button class="filter-close" onclick="this.closest('.filter-panel').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="filter-options">
                <div class="filter-option" data-value="all">
                    <div class="filter-option-icon">
                        <i class="fas fa-list"></i>
                    </div>
                    <span class="filter-option-text">全部问题</span>
                    <div class="filter-option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <div class="filter-option" data-value="error">
                    <div class="filter-option-icon error">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <span class="filter-option-text">错误</span>
                    <div class="filter-option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <div class="filter-option" data-value="warning">
                    <div class="filter-option-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <span class="filter-option-text">警告</span>
                    <div class="filter-option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <div class="filter-option" data-value="info">
                    <div class="filter-option-icon info">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <span class="filter-option-text">信息</span>
                    <div class="filter-option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            </div>
        `;
        
        // 设置面板样式和位置
        filterPanel.style.position = 'absolute';
        filterPanel.style.top = '60px';
        filterPanel.style.left = '10px';
        filterPanel.style.zIndex = '1000';
        
        // 设置默认选中"全部问题"
        filterPanel.querySelector('.filter-option[data-value="all"]').classList.add('selected');
        
        // 绑定筛选事件
        filterPanel.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const value = e.currentTarget.dataset.value;
                this.filterIssues(value);
                
                // 更新选中状态
                filterPanel.querySelectorAll('.filter-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
                
                // 延迟关闭面板
                setTimeout(() => filterPanel.remove(), 300);
            });
        });
        
        // 点击外部区域关闭面板
        const closePanel = (e) => {
            if (!filterPanel.contains(e.target)) {
                filterPanel.remove();
                document.removeEventListener('click', closePanel);
            }
        };
        
        // 延迟添加事件监听
        setTimeout(() => {
            document.addEventListener('click', closePanel);
        }, 100);
        
        // 添加到容器
        const issuesContainer = document.querySelector('.issues-container');
        issuesContainer.appendChild(filterPanel);
    }
    

    
    /**
     * 筛选问题
     */
    filterIssues(filterType) {
        const issuesList = document.getElementById('issuesList');
        const issues = issuesList.querySelectorAll('.issue-item');
        
        issues.forEach(issue => {
            const severity = issue.classList.contains('error') ? 'error' :
                           issue.classList.contains('warning') ? 'warning' :
                           issue.classList.contains('info') ? 'info' : 'success';
            
            if (filterType === 'all' || severity === filterType) {
                issue.style.display = 'block';
            } else {
                issue.style.display = 'none';
            }
        });
        
        this.showToast(`已筛选${filterType === 'all' ? '全部' : filterType}问题`);
    }
    

    
    /**
     * 初始化键盘快捷键
     */
    initKeyboardShortcuts() {
        // 移除快捷键处理
    }
    
    /**
     * 初始化Toast样式
     */
    initToastStyles() {
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--primary-color);
                    color: white;
                    padding: 12px 20px;
                    border-radius: var(--border-radius-md);
                    box-shadow: var(--shadow-md);
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                    word-wrap: break-word;
                }
                
                .toast.show {
                    transform: translateX(0);
                }
                
                .toast.success {
                    background: var(--success-color);
                }
                
                .toast.warning {
                    background: var(--warning-color);
                }
                
                .toast.error {
                    background: var(--error-color);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 切换标签页
     */
    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // 更新标签页内容
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const activePane = document.getElementById(`${tabName}-tab`);
        if (activePane) {
            activePane.classList.add('active');
        }
        
        this.currentTab = tabName;
        
        // 触发特定标签页的渲染
        if (tabName === 'graph' && this.pdfInspector.pdfStructure) {
            this.pdfInspector.visualizer.renderRelationshipGraph(this.pdfInspector.pdfStructure);
        }
    }
    
    /**
     * 聚焦搜索框
     */
    focusSearch() {
        const searchInput = document.getElementById('structureSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    /**
     * 缩放关系图
     */
    zoomGraph(factor) {
        const container = document.getElementById('relationshipGraph');
        if (!container) return;
        
        const svg = container.querySelector('svg');
        if (!svg) return;
        
        const currentTransform = svg.style.transform || 'scale(1)';
        const currentScale = parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || 1);
        const newScale = Math.max(0.1, Math.min(3, currentScale * factor));
        
        svg.style.transform = `scale(${newScale})`;
    }
    
    /**
     * 重置关系图缩放
     */
    resetGraphZoom() {
        const container = document.getElementById('relationshipGraph');
        if (!container) return;
        
        const svg = container.querySelector('svg');
        if (svg) {
            svg.style.transform = 'scale(1)';
        }
    }
    
    /**
     * 显示模态框
     */
    showModal(modalName) {
        const modal = this.modals.get(modalName);
        if (modal && modal.element) {
            modal.element.classList.add('show');
        }
    }
    
    /**
     * 隐藏模态框
     */
    hideModal(modalName) {
        const modal = this.modals.get(modalName);
        if (modal && modal.element) {
            modal.element.classList.remove('show');
        }
    }
    
    /**
     * 隐藏所有模态框
     */
    hideAllModals() {
        this.modals.forEach(modal => {
            if (modal.element) {
                modal.element.classList.remove('show');
            }
        });
    }
    
    /**
     * 显示Toast消息
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 移除旧的toast
        this.toasts.forEach(oldToast => {
            if (oldToast.parentElement) {
                oldToast.parentElement.removeChild(oldToast);
            }
        });
        
        this.toasts = [toast];
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
                this.toasts = this.toasts.filter(t => t !== toast);
            }, 300);
        }, 3000);
    }
    
    /**
     * 清空结果
     */
    clearResults() {
        const uploadSection = document.getElementById('uploadSection');
        const featuresSection = document.getElementById('featuresSection');
        const resultsSection = document.getElementById('resultsSection');
        
        // 添加结果区域隐藏动画
        resultsSection.classList.add('hiding');
        
        // 重置文件信息
        document.getElementById('fileName').textContent = '-';
        document.getElementById('fileSize').textContent = '-';
        document.getElementById('pdfVersion').textContent = '-';
        document.getElementById('objectCount').textContent = '-';
        document.getElementById('pageCount').textContent = '-';
        document.getElementById('isEncrypted').textContent = '-';
        
        // 清空各个标签页内容
        document.getElementById('structureTree').innerHTML = '';
        document.getElementById('relationshipGraph').innerHTML = '';
        document.getElementById('issuesList').innerHTML = '';
        document.getElementById('rawData').textContent = '';
        
        // 清空文件输入框，确保重新选择同一个文件时能触发change事件
        document.getElementById('fileInput').value = '';
        
        // 清理资源
        if (this.pdfInspector.visualizer) {
            this.pdfInspector.visualizer.destroy();
        }
        
        // 重置状态
        this.pdfInspector.currentFile = null;
        this.pdfInspector.pdfStructure = null;
        this.pdfInspector.validationResults = null;
        
        // 显示上传区域和特性区域并移除动画类
        setTimeout(() => {
            uploadSection.style.display = 'block';
            if (featuresSection) {
                featuresSection.style.display = 'block';
            }
            resultsSection.style.display = 'none';
            resultsSection.classList.remove('hiding');
        }, 500);
        
        this.showToast('结果已清空', 'success');
    }
    
    /**
     * 更新文件信息
     */
    updateFileInfo(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        // 不设置状态栏的currentFile文本
        // document.getElementById('currentFile').textContent = file.name;
    }
    
    /**
     * 更新PDF结构信息
     */
    updatePDFInfo(pdfStructure, validationResults) {
        // 基本信息
        if (pdfStructure.physical?.header?.version) {
            document.getElementById('pdfVersion').textContent = pdfStructure.physical.header.version;
        }
        
        if (pdfStructure.physical?.objects) {
            document.getElementById('objectCount').textContent = pdfStructure.physical.objects.length;
        }
        
        // 页面数量
        const pageCount = this.getPageCount(pdfStructure);
        document.getElementById('pageCount').textContent = pageCount;
        
        // 加密状态
        const encryptedElement = document.getElementById('isEncrypted');
        if (encryptedElement) {
            const isEncrypted = this.isEncrypted(pdfStructure);
            const encryptedText = isEncrypted ? 
                (window.languageManager ? window.languageManager.get('common.yes') : '是') :
                (window.languageManager ? window.languageManager.get('common.no') : '否');
            encryptedElement.textContent = encryptedText;
            encryptedElement.className = isEncrypted ? 'encrypted' : 'not-encrypted';
        }
        
        // 安全信息
        const hasJavaScript = this.hasJavaScript(pdfStructure);
        const hasExternalLinks = this.hasExternalLinks(pdfStructure);
        const hasEmbeddedFiles = this.hasEmbeddedFiles(pdfStructure);
        
        const jsElement = document.getElementById('hasJavaScript');
        const linksElement = document.getElementById('hasExternalLinks');
        const filesElement = document.getElementById('hasEmbeddedFiles');
        
        if (jsElement) {
            const jsText = hasJavaScript ? 
                (window.languageManager ? window.languageManager.get('common.yes') : '是') :
                (window.languageManager ? window.languageManager.get('common.no') : '否');
            jsElement.textContent = jsText;
        }
        
        if (linksElement) {
            const linksText = hasExternalLinks ? 
                (window.languageManager ? window.languageManager.get('common.yes') : '是') :
                (window.languageManager ? window.languageManager.get('common.no') : '否');
            linksElement.textContent = linksText;
        }
        
        if (filesElement) {
            const filesText = hasEmbeddedFiles ? 
                (window.languageManager ? window.languageManager.get('common.yes') : '是') :
                (window.languageManager ? window.languageManager.get('common.no') : '否');
            filesElement.textContent = filesText;
        }
        
        // 验证结果
        this.updateValidationInfo(validationResults);
        
        // 统计信息
        this.updateStatistics(pdfStructure);
    }
    
    /**
     * 更新验证结果信息
     */
    updateValidationInfo(validationResults) {
        if (!validationResults?.validation) {
            // 如果没有验证结果，显示默认值
            const validationPanel = document.querySelector('.info-panel.validation-info');
            if (validationPanel) {
                validationPanel.classList.remove('passed', 'failed');
            }
            
            const panelIcon = validationPanel?.querySelector('.panel-header i');
            if (panelIcon) {
                panelIcon.className = 'fas fa-clipboard-check';
            }
            
            document.getElementById('validationStatus').textContent = window.languageManager ? window.languageManager.get('validation.notVerified') : '未验证';
            document.getElementById('validationStatus').className = 'info';
            document.getElementById('errorCount').textContent = '0';
            document.getElementById('errorCount').className = 'no-errors';
            document.getElementById('warningCount').textContent = '0';
            document.getElementById('warningCount').className = 'no-warnings';
            return;
        }
        
        const validation = validationResults.validation;
        const errorCount = validation.errors ? validation.errors.length : 0;
        const warningCount = validation.warnings ? validation.warnings.length : 0;
        const isPassed = errorCount === 0;
        
        // 更新验证结果面板的整体样式
        const validationPanel = document.querySelector('.info-panel.validation-info');
        if (validationPanel) {
            validationPanel.classList.remove('passed', 'failed');
            validationPanel.classList.add(isPassed ? 'passed' : 'failed');
        }
        
        // 更新面板图标
        const panelIcon = validationPanel?.querySelector('.panel-header i');
        if (panelIcon) {
            panelIcon.className = isPassed ? 'fas fa-check-circle' : 'fas fa-times-circle';
        }
        
        // 更新验证状态
        const statusElement = document.getElementById('validationStatus');
        if (statusElement) {
            const statusText = isPassed ? 
                (window.languageManager ? window.languageManager.get('validation.passed') : '通过') :
                (window.languageManager ? window.languageManager.get('validation.failed') : '失败');
            statusElement.textContent = statusText;
            statusElement.className = isPassed ? 'validation-passed' : 'validation-failed';
        }
        
        // 更新错误数量
        const errorElement = document.getElementById('errorCount');
        if (errorElement) {
            errorElement.textContent = errorCount;
            errorElement.className = errorCount > 0 ? 'error-count' : 'no-errors';
        }
        
        // 更新警告数量
        const warningElement = document.getElementById('warningCount');
        if (warningElement) {
            warningElement.textContent = warningCount;
            warningElement.className = warningCount > 0 ? 'warning-count' : 'no-warnings';
        }
    }
    
    /**
     * 更新统计信息
     */
    updateStatistics(pdfStructure) {
        console.log('=== 开始更新统计信息 ===');
        console.log('PDF结构:', pdfStructure);
        
        // 平均对象大小
        console.log('📊 计算平均对象大小...');
        const avgObjectSize = this.calculateAverageObjectSize(pdfStructure);
        const avgSizeElement = document.getElementById('avgObjectSize');
        if (avgSizeElement) {
            avgSizeElement.textContent = avgObjectSize;
            console.log(`✅ 平均对象大小已更新到DOM: ${avgObjectSize}`);
        } else {
            console.log('❌ 未找到avgObjectSize元素');
        }
        
        // 对象类型数量
        console.log('📊 计算对象类型数量...');
        const objectTypes = this.getObjectTypesCount(pdfStructure);
        const typesElement = document.getElementById('objectTypes');
        if (typesElement) {
            typesElement.textContent = objectTypes;
            console.log(`✅ 对象类型数量已更新到DOM: ${objectTypes}`);
        } else {
            console.log('❌ 未找到objectTypes元素');
        }
        
        // 压缩比例
        console.log('📊 计算压缩比例...');
        const compressionRatio = this.calculateCompressionRatio(pdfStructure);
        const ratioElement = document.getElementById('compressionRatio');
        if (ratioElement) {
            ratioElement.textContent = compressionRatio;
            console.log(`✅ 压缩比例已更新到DOM: ${compressionRatio}`);
        } else {
            console.log('❌ 未找到compressionRatio元素');
        }
        
        console.log('=== 统计信息更新完成 ===');
    }
    
    /**
     * 获取页面数量
     */
    getPageCount(pdfStructure) {
        if (!pdfStructure.physical?.objects) return 0;
        return pdfStructure.physical.objects.filter(obj => obj.type === 'Page').length;
    }
    
    /**
     * 检查是否加密
     */
    isEncrypted(pdfStructure) {
        return pdfStructure.physical?.trailer?.properties?.Encrypt !== undefined;
    }
    
    /**
     * 检查是否有JavaScript
     */
    hasJavaScript(pdfStructure) {
        if (!pdfStructure.physical?.objects) return false;
        return pdfStructure.physical.objects.some(obj => 
            obj.properties?.S && obj.properties.S === 'JavaScript'
        );
    }
    
    /**
     * 检查是否有外部链接
     */
    hasExternalLinks(pdfStructure) {
        if (!pdfStructure.physical?.objects) return false;
        return pdfStructure.physical.objects.some(obj => 
            obj.properties?.URI || obj.properties?.URL
        );
    }
    
    /**
     * 检查是否有嵌入文件
     */
    hasEmbeddedFiles(pdfStructure) {
        if (!pdfStructure.physical?.objects) return false;
        return pdfStructure.physical.objects.some(obj => 
            obj.properties?.F || obj.properties?.EmbeddedFile
        );
    }
    
    /**
     * 计算平均对象大小
     */
    calculateAverageObjectSize(pdfStructure) {
        console.log('=== 计算平均对象大小 ===');
        console.log('PDF结构:', pdfStructure);
        
        if (!pdfStructure.physical?.objects) {
            console.log('❌ 没有找到PDF对象数据');
            return '0 KB';
        }
        
        console.log(`📊 总对象数量: ${pdfStructure.physical.objects.length}`);
        
        const totalSize = pdfStructure.physical.objects.reduce((sum, obj, index) => {
            const contentLength = obj.content?.length || 0;
            return sum + contentLength;
        }, 0);
        
        console.log(`📏 总内容大小: ${totalSize} 字节`);
        
        const averageSize = totalSize / pdfStructure.physical.objects.length;
        console.log(`📊 平均对象大小: ${averageSize} 字节`);
        
        const formattedSize = this.formatBytes(averageSize);
        console.log(`✅ 格式化后的平均对象大小: ${formattedSize}`);
        
        return formattedSize;
    }
    
    /**
     * 获取对象类型数量
     */
    getObjectTypesCount(pdfStructure) {
        if (!pdfStructure.physical?.objects) return 0;
        
        const types = new Set();
        pdfStructure.physical.objects.forEach(obj => {
            if (obj.type) {
                types.add(obj.type);
            }
        });
        
        return types.size;
    }
    
    /**
     * 计算压缩率
     */
    calculateCompressionRatio(pdfStructure) {
        console.log('=== 计算压缩率 ===');
        console.log('PDF结构:', pdfStructure);
        
        if (!pdfStructure.physical?.objects) {
            console.log('❌ 没有找到PDF对象数据');
            return '0%';
        }
        
        console.log(`📊 总对象数量: ${pdfStructure.physical.objects.length}`);
        
        let rawTotalSize = 0;
        let compressTotalSize = 0;
        let processedStreams = 0;
        
        pdfStructure.physical.objects.forEach((obj, index) => {
            console.log(`对象 ${index + 1} (${obj.type || 'Unknown'}):`);
            console.log(`  - 对象属性:`, obj.properties);
            
            // 1. 判断属性properties中是否含有filter，没有则跳过
            if (!obj.properties?.Filter) {
                console.log(`  ⏭️ 跳过：没有Filter属性`);
                return;
            }
            
            console.log(`  ✅ 找到Filter属性: ${obj.properties.Filter}`);
            
            // 2. 有则按照filter的压缩方法，对streamData进行解压,计算出size
            const decompressedSize = this.decompressStreamData(obj);
            if (decompressedSize === null) {
                console.log(`  ❌ 解压失败，跳过此对象`);
                return;
            }
            
            // 3. rawTotalSize = rawTotalSize + size
            rawTotalSize += decompressedSize;
            
            // 4. compressTotalSize = compressTotalSize + Length
            const compressedSize = obj.properties.Length || obj.streamData?.length || obj.content?.length || obj.stream?.length || 0;
            compressTotalSize += compressedSize;
            
            processedStreams++;
            
            console.log(`  📊 解压后大小: ${decompressedSize} 字节`);
            console.log(`  📊 压缩后大小: ${compressedSize} 字节`);
        });
        
        console.log(`📊 压缩统计:`);
        console.log(`  - 处理的流数量: ${processedStreams}`);
        console.log(`  - 总解压大小: ${rawTotalSize} 字节`);
        console.log(`  - 总压缩大小: ${compressTotalSize} 字节`);
        
        if (rawTotalSize === 0) {
            console.log('❌ 没有找到可解压的流数据');
            return '0%';
        }
        
        // 5. 压缩率 = (1 - 压缩后大小/原始大小) × 100%
        const compressionRate = (1 - (compressTotalSize / rawTotalSize)) * 100;
        console.log(`📊 压缩率计算: (1 - ${compressTotalSize} / ${rawTotalSize}) × 100 = ${compressionRate.toFixed(1)}%`);
        
        const result = `${compressionRate.toFixed(1)}%`;
        console.log(`✅ 最终压缩率: ${result}`);
        
        return result;
    }
    
    /**
     * 解压流数据（全部采用经验估算）
     * @param {Object} obj - PDF对象
     * @returns {number|null} 解压后的大小，失败返回null
     */
    decompressStreamData(obj) {
        try {
            const filter = obj.properties.Filter;
            const length = obj.properties.Length;
            
            if (!length) {
                console.log(`    ❌ 没有找到Length属性`);
                return null;
            }
            
            console.log(`    🔍 解压Filter: ${filter}, Length: ${length}`);
            
            // 压缩比映射表
            const compressionRatios = {
                'FlateDecode': 3,
                '/FlateDecode': 3,
                'LZWDecode': 2.5,
                '/LZWDecode': 2.5,
                'DCTDecode': 10,
                '/DCTDecode': 10,
                'JPXDecode': 8,
                '/JPXDecode': 8,
                'CCITTFaxDecode': 4,
                '/CCITTFaxDecode': 4,
                'JBIG2Decode': 6,
                '/JBIG2Decode': 6,
                'RunLengthDecode': 2,
                '/RunLengthDecode': 2,
                'ASCIIHexDecode': 0.5,
                '/ASCIIHexDecode': 0.5,
                'ASCII85Decode': 0.8,
                '/ASCII85Decode': 0.8,
                'Crypt': 1,
                '/Crypt': 1
            };
            
            const ratio = compressionRatios[filter];
            if (ratio !== undefined) {
                console.log(`    📊 ${filter}估算解压大小 (1:${ratio})`);
                return length * ratio;
            } else {
                // 其他未知压缩方法，使用默认估算
                console.log(`    📊 未知压缩方法 ${filter}，使用默认估算 (1:2)`);
                return length * 2;
            }
        } catch (error) {
            console.log(`    ❌ 解压过程出错:`, error);
            return null;
        }
    }
    
    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        console.log(`🔢 格式化字节数: ${bytes} 字节`);
        
        if (bytes === 0) {
            console.log('✅ 返回: 0 B');
            return '0 B';
        }
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        console.log(`✅ 格式化结果: ${result} (i=${i}, 单位=${sizes[i]})`);
        
        return result;
    }
    
    /**
     * 更新处理状态
     */
    updateProcessingStatus(status) {
        // 不设置状态文本，保持状态栏为空
        // document.getElementById('processingStatus').textContent = status;
    }
    
    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 显示错误消息
     */
    showError(message) {
        this.showToast(message, 'error');
    }
    
    /**
     * 显示成功消息
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }
    
    /**
     * 显示警告消息
     */
    showWarning(message) {
        this.showToast(message, 'warning');
    }
    
    /**
     * 更新进度条
     */
    updateProgress(current, total, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const processedCount = document.getElementById('processedCount');
        const totalCount = document.getElementById('totalCount');
        
        if (progressFill) {
            const percentage = (current / total) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
        
        if (processedCount) {
            processedCount.textContent = current;
        }
        
        if (totalCount) {
            totalCount.textContent = total;
        }
    }
    
    /**
     * 显示进度区域
     */
    showProgress() {
        const uploadSection = document.getElementById('uploadSection');
        const progressSection = document.getElementById('progressSection');
        const resultsSection = document.getElementById('resultsSection');
        
        // 添加上传区域隐藏动画
        uploadSection.classList.add('hiding');
        
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
     * 隐藏进度区域
     */
    hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
    }
    
    /**
     * 显示结果区域
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
     * 绑定对象详情点击事件
     */
    bindObjectDetailEvents() {
        document.querySelectorAll('.tree-node').forEach(node => {
            node.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const objectNumber = node.dataset.objectNumber;
                const generation = node.dataset.generation;
                
                if (objectNumber && this.pdfInspector.pdfStructure) {
                    const obj = this.pdfInspector.pdfStructure.getObject(parseInt(objectNumber), parseInt(generation));
                    if (obj) {
                        this.pdfInspector.showObjectModal(obj);
                    }
                }
            });
        });
    }
    
    /**
     * 更新设置
     */
    updateSettings() {
        // 移除设置更新逻辑
    }
    
    /**
     * 销毁UI控制器
     */
    destroy() {
        // 清理事件监听器
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
        
        // 清理模态框
        this.modals.clear();
        
        // 清理toast
        this.toasts.forEach(toast => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        });
        this.toasts = [];
    }
}

// 兼容浏览器和Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = UIController;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.UIController = UIController;
} 