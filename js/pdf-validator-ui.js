/**
 * PDF 验证器 UI 控制器
 * 处理用户交互和界面更新
 */
class PDFValidatorUI {
    constructor() {
        this.pdfParser = new PDFParser();
        this.pdfValidator = new PDFValidator();
        this.currentFile = null;
        this.currentStructure = null;
        this.currentIssues = [];
        
        this.initializeEventListeners();
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 文件输入事件
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // 拖拽事件
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 移除上传区域的点击事件，避免重复触发文件选择
        // uploadArea.addEventListener('click', () => fileInput.click());

        // 标签页切换事件
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    /**
     * 处理文件选择
     * @param {Event} event - 文件选择事件
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            await this.processFile(file);
            // 清理文件输入，避免重复选择
            event.target.value = '';
        }
    }

    /**
     * 处理拖拽悬停
     * @param {Event} event - 拖拽事件
     */
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖拽离开
     * @param {Event} event - 拖拽事件
     */
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.remove('dragover');
    }

    /**
     * 处理文件拖放
     * @param {Event} event - 拖放事件
     */
    async handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                await this.processFile(file);
                // 清空文件输入框，确保重新选择同一个文件时能触发change事件
                document.getElementById('fileInput').value = '';
            } else {
                this.showError('请选择有效的 PDF 文件');
            }
        }
    }

    /**
     * 处理文件
     * @param {File} file - PDF 文件
     */
    async processFile(file) {
        try {
            console.log('开始处理文件:', file.name, file.size, file.type);
            this.showLoading();
            this.currentFile = file;

            // 检查文件类型
            if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
                throw new Error('请选择有效的 PDF 文件');
            }

            // 检查文件大小
            if (file.size > 50 * 1024 * 1024) { // 50MB
                throw new Error('文件大小不能超过 50MB');
            }

            // 解析 PDF
            console.log('开始解析 PDF...');
            const parseResult = await this.pdfParser.parsePDF(file);
            console.log('解析结果:', parseResult);
            
            if (!parseResult.success) {
                throw new Error(parseResult.error || 'PDF 解析失败');
            }

            this.currentStructure = parseResult.structure;
            
            // 验证 PDF
            console.log('开始验证 PDF...');
            this.currentIssues = this.pdfValidator.validateStructure(this.currentStructure, parseResult.fileInfo);
            console.log('验证结果:', this.currentIssues);
            
            // 更新界面
            this.updateFileInfo(parseResult.fileInfo);
            this.updateStructureTree();
            this.updateIssuesList();
            this.updateRawData();
            
            this.showResults();
            console.log('文件处理完成');
            
        } catch (error) {
            console.error('文件处理错误:', error);
            this.showError(`文件处理失败: ${error.message}`);
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
    }

    /**
     * 显示结果
     */
    showResults() {
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError(message) {
        // 创建错误提示元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // 插入到上传区域前面
        const uploadSection = document.querySelector('.upload-section');
        uploadSection.insertBefore(errorDiv, uploadSection.firstChild);
        
        // 3秒后自动移除错误提示
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 3000);
        
        // 恢复界面状态
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        
        // 清理文件输入
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /**
     * 更新文件信息
     * @param {Object} fileInfo - 文件信息
     */
    updateFileInfo(fileInfo) {
        document.getElementById('fileName').textContent = fileInfo.name;
        document.getElementById('fileSize').textContent = fileInfo.size;
        document.getElementById('pdfVersion').textContent = fileInfo.version;
        document.getElementById('objectCount').textContent = fileInfo.pageCount;
        document.getElementById('producer').textContent = fileInfo.producer || 'Unknown';
        
        // 更新加密信息，使用图标和颜色区分
        const encryptedElement = document.getElementById('isEncrypted');
        if (fileInfo.isEncrypted) {
            const encryptionType = fileInfo.encryptionType || 'Standard Encryption';
            encryptedElement.innerHTML = `<i class="fas fa-lock" style="color: #dc3545;"></i> 是 (${encryptionType})`;
            encryptedElement.style.color = '#dc3545';
        } else {
            encryptedElement.innerHTML = '<i class="fas fa-unlock" style="color: #28a745;"></i> 否';
            encryptedElement.style.color = '#28a745';
        }
    }



    /**
     * 更新 PDF 结构树
     */
    updateStructureTree() {
        const treeContainer = document.getElementById('structureTree');
        treeContainer.innerHTML = '';

        if (!this.currentStructure) return;

        // 创建结构树
        const tree = this.createStructureTree(this.currentStructure);
        treeContainer.appendChild(tree);
    }

    /**
     * 创建结构树
     * @param {Object} structure - PDF 结构
     * @returns {HTMLElement}
     */
    createStructureTree(structure) {
        console.log('创建结构树，输入数据:', structure);
        
        const container = document.createElement('div');
        container.className = 'structure-tree';

        // 添加根节点
        const rootNode = this.createTreeNode('PDF Document', 'document', true);
        const rootContent = rootNode.querySelector('.tree-node-content');
        container.appendChild(rootNode);

        // 添加头部节点
        if (structure.header) {
            console.log('添加 Header 节点:', structure.header);
            const headerNode = this.createTreeNode('Header', 'header', false);
            this.addPropertiesToNode(headerNode, structure.header);
            rootContent.appendChild(headerNode);
        }

        // 添加 Trailer 节点
        if (structure.trailer && structure.trailer.info) {
            console.log('添加 Trailer 节点:', structure.trailer);
            const trailerNode = this.createTreeNode('Trailer', 'trailer', false);
            this.addPropertiesToNode(trailerNode, structure.trailer);
            rootContent.appendChild(trailerNode);
        }

        // 添加 XRef Table 节点
        if (structure.xref && structure.xref.entries) {
            console.log('添加 XRef Table 节点:', structure.xref);
            const xrefNode = this.createTreeNode('XRef Table', 'xref', true);
            const xrefContent = xrefNode.querySelector('.tree-node-content');
            
            // 添加 xref 统计信息
            const xrefStatsNode = this.createTreeNode(`Entries: ${structure.xref.size}`, 'xref-stats', false);
            xrefContent.appendChild(xrefStatsNode);
            
            // 添加前几个 xref 条目作为示例
            const sampleEntries = structure.xref.entries.slice(0, 5);
            sampleEntries.forEach((entry, index) => {
                const entryNode = this.createTreeNode(
                    `Entry ${index + 1}: ${entry.type} (offset: ${entry.offset}, gen: ${entry.generation})`,
                    'xref-entry',
                    false
                );
                xrefContent.appendChild(entryNode);
            });
            
            if (structure.xref.entries.length > 5) {
                const moreNode = this.createTreeNode(
                    `... 还有 ${structure.xref.entries.length - 5} 个条目`,
                    'xref-more',
                    false
                );
                xrefContent.appendChild(moreNode);
            }
            
            rootContent.appendChild(xrefNode);
        }

        // 添加 Catalog 节点
        if (structure.catalog) {
            console.log('添加 Catalog 节点:', structure.catalog);
            const catalogNode = this.createTreeNode('Catalog', 'catalog', false);
            this.addPropertiesToNode(catalogNode, structure.catalog);
            rootContent.appendChild(catalogNode);
        }

        // 添加页面节点
        if (structure.pages && structure.pages.length > 0) {
            console.log('添加 Pages 节点，页面数量:', structure.pages.length);
            const pagesNode = this.createTreeNode('Pages', 'pages', true);
            const pagesContent = pagesNode.querySelector('.tree-node-content');
            structure.pages.forEach((page, index) => {
                const pageNode = this.createTreeNode(`Page ${page.pageNumber || index + 1}`, 'page', false);
                if (page.properties) {
                    this.addPropertiesToNode(pageNode, page);
                }
                pagesContent.appendChild(pageNode);
            });
            rootContent.appendChild(pagesNode);
        }

        // 添加对象统计节点
        if (structure.objects) {
            console.log('添加 Objects 节点:', structure.objects);
            const objectsNode = this.createTreeNode('Objects', 'objects', true);
            const objectsContent = objectsNode.querySelector('.tree-node-content');
            
            // 添加统计信息
            const statsNode = this.createTreeNode(
                `统计: 总计 ${structure.objects.totalObjects} 个对象 (使用中: ${structure.objects.inUseObjects}, 空闲: ${structure.objects.freeObjects})`,
                'objects-stats',
                false
            );
            objectsContent.appendChild(statsNode);
            
            // 添加详细对象列表
            if (structure.objects.objects && structure.objects.objects.length > 0) {
                const objectsListNode = this.createTreeNode('对象列表', 'objects-list', true);
                const objectsListContent = objectsListNode.querySelector('.tree-node-content');
                
                // 按类型分组显示对象
                const objectsByType = {};
                structure.objects.objects.forEach(obj => {
                    const type = obj.type || 'Unknown';
                    if (!objectsByType[type]) {
                        objectsByType[type] = [];
                    }
                    objectsByType[type].push(obj);
                });
                
                Object.entries(objectsByType).forEach(([type, objects]) => {
                    const typeNode = this.createTreeNode(`${type} (${objects.length})`, `type-${type.toLowerCase()}`, true);
                    const typeContent = typeNode.querySelector('.tree-node-content');
                    
                    objects.forEach(obj => {
                        const objNode = this.createTreeNode(
                            `对象 ${obj.objectNumber} ${obj.generation} R - ${obj.subtype || '无子类型'} (偏移: ${obj.offset})`,
                            `object-${obj.objectNumber}`,
                            false
                        );
                        
                        // 添加对象属性
                        if (obj.properties && Object.keys(obj.properties).length > 0) {
                            this.addPropertiesToNode(objNode, obj);
                        }
                        
                        typeContent.appendChild(objNode);
                    });
                    
                    objectsListContent.appendChild(typeNode);
                });
                
                objectsContent.appendChild(objectsListNode);
            }
            
            rootContent.appendChild(objectsNode);
        }

        console.log('结构树创建完成');
        return container;
    }

    /**
     * 创建树节点
     * @param {string} title - 节点标题
     * @param {string} type - 节点类型
     * @param {boolean} expandable - 是否可展开
     * @returns {HTMLElement}
     */
    createTreeNode(title, type, expandable) {
        const node = document.createElement('div');
        node.className = 'tree-node';

        const header = document.createElement('div');
        header.className = 'tree-node-header';
        if (expandable) {
            header.classList.add('expandable');
            header.addEventListener('click', () => this.toggleNode(node));
        }

        const icon = document.createElement('i');
        icon.className = expandable ? 'fas fa-chevron-right' : 'fas fa-circle';
        header.appendChild(icon);

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        header.appendChild(titleSpan);

        node.appendChild(header);

        if (expandable) {
            const content = document.createElement('div');
            content.className = 'tree-node-content';
            node.appendChild(content);
        }

        return node;
    }

    /**
     * 切换节点展开状态
     * @param {HTMLElement} node - 节点元素
     */
    toggleNode(node) {
        const header = node.querySelector('.tree-node-header');
        const content = node.querySelector('.tree-node-content');
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            header.classList.remove('expanded');
        } else {
            content.classList.add('expanded');
            header.classList.add('expanded');
        }
    }

    /**
     * 添加属性到节点
     * @param {HTMLElement} node - 节点元素
     * @param {Object} data - 数据对象
     */
    addPropertiesToNode(node, data) {
        const content = node.querySelector('.tree-node-content') || node;
        
        if (data.properties) {
            Object.entries(data.properties).forEach(([key, value]) => {
                // 跳过 "Not present" 和 "Not specified" 的属性，只显示有意义的
                if (value !== 'Not present' && value !== 'Not specified' && value !== null && value !== undefined) {
                    const property = document.createElement('div');
                    property.className = 'tree-node-property';
                    
                    // 为不同类型的值添加不同的样式
                    if (value === 'Present') {
                        property.innerHTML = `<span class="property-name">${key}:</span> <span class="property-value present">${value}</span>`;
                    } else if (value === true) {
                        property.innerHTML = `<span class="property-name">${key}:</span> <span class="property-value boolean">${value}</span>`;
                    } else if (value === false) {
                        property.innerHTML = `<span class="property-name">${key}:</span> <span class="property-value boolean">${value}</span>`;
                    } else {
                        property.innerHTML = `<span class="property-name">${key}:</span> <span class="property-value">${value}</span>`;
                    }
                    
                    content.appendChild(property);
                }
            });
        }

        if (data.error) {
            node.classList.add('error');
        }
    }

    /**
     * 更新问题列表
     */
    updateIssuesList() {
        const issuesContainer = document.getElementById('issuesList');
        issuesContainer.innerHTML = '';

        if (this.currentIssues.length === 0) {
            const noIssues = document.createElement('div');
            noIssues.className = 'issue-item info';
            noIssues.innerHTML = `
                <div class="issue-header">
                    <i class="fas fa-check-circle"></i>
                    <span>验证通过</span>
                </div>
                <div class="issue-description">PDF 文件符合标准规范，未发现任何问题。</div>
            `;
            issuesContainer.appendChild(noIssues);
            return;
        }

        // 按级别排序：错误 > 警告 > 信息
        const sortedIssues = this.currentIssues.sort((a, b) => {
            const levelOrder = { error: 0, warning: 1, info: 2 };
            return levelOrder[a.level] - levelOrder[b.level];
        });

        sortedIssues.forEach(issue => {
            const issueElement = this.createIssueElement(issue);
            issuesContainer.appendChild(issueElement);
        });
    }

    /**
     * 创建问题元素
     * @param {Object} issue - 问题对象
     * @returns {HTMLElement}
     */
    createIssueElement(issue) {
        const issueElement = document.createElement('div');
        issueElement.className = `issue-item ${issue.level}`;

        const iconMap = {
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        issueElement.innerHTML = `
            <div class="issue-header">
                <i class="${iconMap[issue.level]}"></i>
                <span>${issue.title}</span>
            </div>
            <div class="issue-description">${issue.description}</div>
            <div class="issue-location">位置: ${issue.location}</div>
        `;

        return issueElement;
    }

    /**
     * 更新原始数据
     */
    updateRawData() {
        const rawDataContainer = document.getElementById('rawData');
        if (this.currentStructure) {
            rawDataContainer.textContent = JSON.stringify(this.currentStructure, null, 2);
        } else {
            rawDataContainer.textContent = 'No data available';
        }
    }

    /**
     * 切换标签页
     * @param {string} tabName - 标签页名称
     */
    switchTab(tabName) {
        // 更新标签页按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新标签页内容
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PDFValidatorUI();
}); 