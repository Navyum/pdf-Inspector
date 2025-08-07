/**
 * UI更新器
 * UI Updater for language changes
 */
class UIUpdater {
    constructor() {
        this.elements = new Map();
        this.init();
    }

    /**
     * 初始化UI更新器
     */
    init() {
        // 等待语言管理器加载完成
        if (window.languageManager) {
            this.registerObserver();
            this.updateUI();
        } else {
            // 如果语言管理器还没加载，等待一下
            setTimeout(() => {
                this.init();
            }, 100);
        }
    }

    /**
     * 注册观察者
     */
    registerObserver() {
        if (window.languageManager) {
            console.log('注册UI更新器为观察者');
            window.languageManager.addObserver(this);
            this.updateUI();
        }
    }

    /**
     * 语言变化回调
     */
    onLanguageChange(languageCode, translations) {
        console.log('语言变化回调:', languageCode);
        this.updateUI();
    }

    /**
     * 更新UI文本
     */
    updateUI() {
        if (!window.languageManager) {
            console.log('语言管理器未加载，跳过UI更新');
            return;
        }
        
        console.log('开始更新UI');
        this.updateHeader();
        this.updateUploadArea();
        this.updateProgressArea();
        this.updateFileInfo();
        this.updateStats();
        this.updateTabs();
        this.updateStructureToolbar();
        this.updateGraphToolbar();
        this.updateIssuesToolbar();
        this.updateRawToolbar();
        this.updateFooter();
        this.updateHelpModal();
        this.updateButtons();
        this.updateDataI18nElements();
        console.log('UI更新完成');
    }

    /**
     * 更新所有带有data-i18n属性的元素
     */
    updateDataI18nElements() {
        // 更新所有带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                const translation = window.languageManager.get(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            }
        });

        // 更新所有带有data-i18n-placeholder属性的元素
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                const translation = window.languageManager.get(key);
                if (translation && translation !== key) {
                    element.placeholder = translation;
                }
            }
        });

        // 更新所有带有data-i18n-title属性的元素
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                const translation = window.languageManager.get(key);
                if (translation && translation !== key) {
                    element.title = translation;
                }
            }
        });
    }

    /**
     * 更新头部导航
     */
    updateHeader() {
        // 应用标题
        const titleElement = document.querySelector('.logo h1');
        if (titleElement) {
            const newTitle = window.languageManager.get('app.title');
            console.log('更新标题:', newTitle);
            titleElement.textContent = newTitle;
        }

        // 按钮文本
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            const span = clearBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('header.clear');
            }
        }

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            const span = exportBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('header.export');
            }
        }

        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            const span = helpBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('header.help');
            }
        }
    }

    /**
     * 更新上传区域
     */
    updateUploadArea() {
        const uploadTitle = document.querySelector('#uploadArea h3');
        if (uploadTitle) {
            uploadTitle.textContent = window.languageManager.get('upload.title');
        }

        const uploadSubtitle = document.querySelector('#uploadArea p');
        if (uploadSubtitle) {
            uploadSubtitle.textContent = window.languageManager.get('upload.subtitle');
        }

        const selectFileBtn = document.getElementById('selectFileBtn');
        if (selectFileBtn) {
            const span = selectFileBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('upload.selectFile');
            }
        }
    }

    /**
     * 更新进度区域
     */
    updateProgressArea() {
        const progressTitle = document.querySelector('#progressSection h3');
        if (progressTitle) {
            const icon = progressTitle.querySelector('i');
            const text = window.languageManager.get('progress.processing');
            progressTitle.innerHTML = '';
            if (icon) progressTitle.appendChild(icon);
            progressTitle.appendChild(document.createTextNode(' ' + text));
        }

        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = window.languageManager.get('progress.parsing');
        }

        const processedCount = document.getElementById('processedCount');
        const totalCount = document.getElementById('totalCount');
        if (processedCount && totalCount) {
            const filesText = window.languageManager.get('stats.files');
            // 这里需要根据实际逻辑更新数字
        }
    }

    /**
     * 更新文件信息
     */
    updateFileInfo() {
        // 更新文件信息标题
        const resultsTitle = document.getElementById('results-title');
        if (resultsTitle) {
            resultsTitle.textContent = window.languageManager.get('fileInfo.title');
        }

        // 更新面板标题
        const panelHeaders = document.querySelectorAll('.panel-header h3');
        const panelKeys = [
            'fileInfo.basicInfo',
            'fileInfo.structureInfo',
            'fileInfo.securityInfo',
            'fileInfo.validationInfo'
        ];

        panelHeaders.forEach((header, index) => {
            if (index < panelKeys.length) {
                header.textContent = window.languageManager.get(panelKeys[index]);
            }
        });

        // 更新信息标签
        const infoLabels = document.querySelectorAll('.info-label span');
        const labelKeys = [
            'fileInfo.fileName',
            'fileInfo.fileSize',
            'fileInfo.pdfVersion',
            'fileInfo.objectCount',
            'fileInfo.pageCount',
            'fileInfo.encryptionStatus',
            'fileInfo.hasJavaScript',
            'fileInfo.hasExternalLinks',
            'fileInfo.hasEmbeddedFiles',
            'fileInfo.validationStatus',
            'fileInfo.errorCount',
            'fileInfo.warningCount'
        ];

        infoLabels.forEach((label, index) => {
            if (index < labelKeys.length) {
                label.textContent = window.languageManager.get(labelKeys[index]);
            }
        });
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const statLabels = document.querySelectorAll('.stat-label');
        const statKeys = [
            'stats.avgObjectSize',
            'stats.objectTypes',
            'stats.compressionRatio'
        ];

        statLabels.forEach((label, index) => {
            if (index < statKeys.length) {
                label.textContent = window.languageManager.get(statKeys[index]);
            }
        });
    }

    /**
     * 更新标签页
     */
    updateTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabKeys = [
            'tabs.structure',
            'tabs.graph',
            'tabs.issues',
            'tabs.raw'
        ];

        tabButtons.forEach((btn, index) => {
            if (index < tabKeys.length) {
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = window.languageManager.get(tabKeys[index]);
                }
            }
        });
    }

    /**
     * 更新结构工具栏
     */
    updateStructureToolbar() {
        // 搜索框占位符
        const searchInput = document.getElementById('structureSearch');
        if (searchInput) {
            searchInput.placeholder = window.languageManager.get('structure.search');
        }

        // 筛选按钮
        const filterButtons = document.querySelectorAll('.filter-btn');
        const filterKeys = [
            'filters.all',
            'filters.error',
            'filters.warning',
            'filters.success'
        ];

        filterButtons.forEach((btn, index) => {
            if (index < filterKeys.length) {
                btn.textContent = window.languageManager.get(filterKeys[index]);
            }
        });
    }

    /**
     * 更新关系图工具栏
     */
    updateGraphToolbar() {
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const exportGraphBtn = document.getElementById('exportGraphBtn');

        if (zoomInBtn) {
            zoomInBtn.title = window.languageManager.get('toolbar.zoomIn');
        }
        if (zoomOutBtn) {
            zoomOutBtn.title = window.languageManager.get('toolbar.zoomOut');
        }
        if (resetZoomBtn) {
            resetZoomBtn.title = window.languageManager.get('toolbar.resetZoom');
        }
        if (exportGraphBtn) {
            const span = exportGraphBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('toolbar.exportImage');
            }
        }
    }

    /**
     * 更新问题列表工具栏
     */
    updateIssuesToolbar() {
        const filterIssuesBtn = document.getElementById('filterIssuesBtn');
        const exportIssuesBtn = document.getElementById('exportIssuesBtn');

        if (filterIssuesBtn) {
            const span = filterIssuesBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('toolbar.filter');
            }
        }
        if (exportIssuesBtn) {
            const span = exportIssuesBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('toolbar.exportReport');
            }
        }
    }

    /**
     * 更新原始数据工具栏
     */
    updateRawToolbar() {
        const copyRawBtn = document.getElementById('copyRawBtn');
        const formatRawBtn = document.getElementById('formatRawBtn');
        const downloadRawBtn = document.getElementById('downloadRawBtn');

        if (copyRawBtn) {
            const span = copyRawBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('toolbar.copy');
            }
        }
        if (formatRawBtn) {
            const span = formatRawBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('toolbar.format');
            }
        }
        if (downloadRawBtn) {
            const span = downloadRawBtn.querySelector('span');
            if (span) {
                span.textContent = window.languageManager.get('toolbar.download');
            }
        }
    }

    /**
     * 更新页脚
     */
    updateFooter() {
        // 页脚描述
        const footerDescription = document.querySelector('.footer-section p');
        if (footerDescription) {
            footerDescription.textContent = window.languageManager.get('footer.description');
        }

        // 页脚标题
        const footerTitles = document.querySelectorAll('.footer-section h4');
        const titleKeys = [
            'footer.features',
            'footer.support',
            'footer.contact'
        ];

        footerTitles.forEach((title, index) => {
            if (index < titleKeys.length) {
                title.textContent = window.languageManager.get(titleKeys[index]);
            }
        });

        // 功能特性列表
        const featureItems = document.querySelectorAll('.footer-section:first-child ul li');
        const featureKeys = [
            'footer.pdfStructureAnalysis',
            'footer.formatValidation',
            'footer.issueDetection',
            'footer.securityAssessment'
        ];

        featureItems.forEach((item, index) => {
            if (index < featureKeys.length) {
                item.textContent = window.languageManager.get(featureKeys[index]);
            }
        });

        // 技术支持列表
        const supportItems = document.querySelectorAll('.footer-section:nth-child(2) ul li a');
        const supportKeys = [
            'footer.helpDocs',
            'footer.aboutUs',
            'footer.privacyPolicy',
            'footer.termsOfService'
        ];

        supportItems.forEach((item, index) => {
            if (index < supportKeys.length) {
                item.textContent = window.languageManager.get(supportKeys[index]);
            }
        });

        // 联系我们列表
        const contactItems = document.querySelectorAll('.footer-section:last-child ul li a');
        const contactKeys = [
            'footer.githubProject',
            'footer.emailSupport'
        ];

        contactItems.forEach((item, index) => {
            if (index < contactKeys.length) {
                item.textContent = window.languageManager.get(contactKeys[index]);
            }
        });

        // 版权信息
        const copyrightElement = document.querySelector('.footer-bottom p');
        if (copyrightElement) {
            copyrightElement.textContent = window.languageManager.get('footer.copyright');
        }
    }

    /**
     * 更新帮助模态框
     */
    updateHelpModal() {
        // 帮助模态框使用固定的中文，因为内容比较复杂
        // 如果需要多语言支持，需要在语言包中添加相应的键
        console.log('跳过帮助模态框更新，使用固定文本');
    }

    /**
     * 更新帮助内容
     */
    updateHelpContent() {
        // 帮助内容使用固定的中文，因为内容比较复杂
        // 如果需要多语言支持，需要在语言包中添加相应的键
        console.log('跳过帮助内容更新，使用固定文本');
    }

    /**
     * 更新按钮
     */
    updateButtons() {
        // 更新各种按钮的文本
        const buttons = [
            { id: 'copyRawBtn', key: 'raw.copy' },
            { id: 'formatRawBtn', key: 'raw.format' },
            { id: 'downloadRawBtn', key: 'raw.download' }
        ];

        buttons.forEach(({ id, key }) => {
            const btn = document.getElementById(id);
            if (btn) {
                const span = btn.querySelector('span');
                if (span) {
                    const text = window.languageManager.get(key);
                    if (text && text !== key) {
                        span.textContent = text;
                    }
                }
            }
        });
    }

    /**
     * 更新特定元素
     */
    updateElement(elementId, translationKey) {
        const element = document.getElementById(elementId);
        if (element && window.languageManager) {
            element.textContent = window.languageManager.get(translationKey);
        }
    }

    /**
     * 更新元素属性
     */
    updateElementAttribute(elementId, attribute, translationKey) {
        const element = document.getElementById(elementId);
        if (element && window.languageManager) {
            element.setAttribute(attribute, window.languageManager.get(translationKey));
        }
    }

    /**
     * 更新占位符文本
     */
    updatePlaceholders() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput && window.languageManager) {
            searchInput.placeholder = window.languageManager.get('structure.search');
        }
    }

    /**
     * 更新工具提示
     */
    updateTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            const key = element.getAttribute('data-tooltip-key');
            if (key && window.languageManager) {
                element.title = window.languageManager.get(key);
            }
        });
    }
}

// 创建全局UI更新器实例
const uiUpdater = new UIUpdater(); 