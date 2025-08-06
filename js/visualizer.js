/**
 * PDF可视化模块
 * 负责渲染PDF结构树、关系图、问题列表等可视化组件
 */
class PDFVisualizer {
    constructor() {
        this.structureTree = null;
        this.relationshipGraph = null;
        this.charts = {};
        this.currentFilter = 'all';
        this.currentView = 'list';
    }
    
    /**
     * 渲染结构树
     */
    renderStructureTree(pdfStructure, validationResults) {
        const container = document.getElementById('structureTree');
        if (!container || !pdfStructure) return;
        
        container.innerHTML = '';
        
        // 创建根节点
        const rootNode = this.createTreeNode({
            type: 'PDF Document',
            properties: {
                'Version': pdfStructure.physical?.header?.version || 'Unknown',
                'Objects': pdfStructure.physical?.objects?.length || 0,
                'Pages': this.getPageCount(pdfStructure),
                'Encrypted': this.isEncrypted(pdfStructure) ? 'Yes' : 'No'
            },
            status: 'success'
        });
        
        container.appendChild(rootNode);
        
        // 添加主要结构节点
        this.addStructureNodes(container, pdfStructure, validationResults);
        
        // 绑定搜索和过滤功能
        this.bindStructureTreeEvents();
    }
    
    /**
     * 创建树节点
     */
    createTreeNode(data) {
        const node = document.createElement('div');
        const status = data.status || 'success';
        node.className = `tree-node ${status}`;
        node.dataset.type = data.type;
        node.dataset.status = status;
        
        
        const header = document.createElement('div');
        header.className = 'tree-node-header';
        header.innerHTML = `
            <i class="fas fa-chevron-right expand-icon"></i>
            <i class="fas ${this.getNodeIcon(data.type)} node-icon"></i>
            <span class="node-label">${data.label || data.type}</span>
            ${data.objectNumber ? `<span class="node-id">(${data.objectNumber} ${data.generation} R)</span>` : ''}
            <span class="node-status ${status}"></span>
        `;
        
        const content = document.createElement('div');
        content.className = 'tree-node-content';
        
        if (data.properties) {
            Object.entries(data.properties).forEach(([key, value]) => {
                const property = document.createElement('div');
                property.className = 'tree-node-property';
                
                // 为错误属性添加特殊样式
                if (key === 'Error') {
                    property.classList.add('error-property');
                }
                
                property.innerHTML = `
                    <span class="property-name">${key}:</span>
                    <span class="property-value">${this.formatPropertyValue(value)}</span>
                `;
                content.appendChild(property);
            });
        }
        
        node.appendChild(header);
        node.appendChild(content);
        
        // 绑定展开/折叠事件
        header.addEventListener('click', () => {
            this.toggleNode(node);
        });
        
        return node;
    }
    
    /**
     * 强制应用节点样式
     */
    forceApplyNodeStyles(node, status) {
        const nodeLabel = node.querySelector('.node-label');
        const nodeHeader = node.querySelector('.tree-node-header');
        
        if (nodeLabel) {
            // 重置所有可能的样式
            nodeLabel.style.color = '';
            nodeLabel.style.fontWeight = '';
            
            // 根据状态应用样式
            if (status === 'success') {
                nodeLabel.style.color = 'var(--text-primary)';
                nodeLabel.style.fontWeight = 'normal';
            } else if (status === 'error') {
                nodeLabel.style.color = 'var(--error-color)';
                nodeLabel.style.fontWeight = '600';
            } else if (status === 'warning') {
                nodeLabel.style.color = 'var(--warning-color)';
                nodeLabel.style.fontWeight = '600';
            }
        }
        
        if (nodeHeader) {
            // 强制重置边框和背景，确保不继承父节点样式
            nodeHeader.style.borderLeft = '4px solid transparent';
            nodeHeader.style.backgroundColor = 'transparent';
            
            // 根据状态应用样式
            if (status === 'success') {
                nodeHeader.style.borderLeft = '4px solid transparent';
                nodeHeader.style.backgroundColor = 'transparent';
            } else if (status === 'error') {
                nodeHeader.style.borderLeft = '4px solid var(--error-color)';
                nodeHeader.style.backgroundColor = 'rgba(244, 67, 54, 0.05)';
            } else if (status === 'warning') {
                nodeHeader.style.borderLeft = '4px solid var(--warning-color)';
                nodeHeader.style.backgroundColor = 'rgba(255, 152, 0, 0.05)';
            }
        }
    }
    
    /**
     * 获取节点图标
     */
    getNodeIcon(type) {
        const iconMap = {
            'PDF Document': 'fa-file-pdf',
            'Header': 'fa-file-code',
            'Body': 'fa-file-text',
            'Catalog': 'fa-book',
            'Pages': 'fa-layer-group',
            'Page': 'fa-file-alt',
            'Font': 'fa-font',
            'Stream': 'fa-stream',
            'XObject': 'fa-image',
            'Annot': 'fa-sticky-note',
            'Form': 'fa-edit',
            'Metadata': 'fa-info-circle',
            'Info': 'fa-info',
            'Encrypt': 'fa-lock',
            'XRef': 'fa-list',
            'Trailer': 'fa-file-signature'
        };
        
        return iconMap[type] || 'fa-cube';
    }
    
    /**
     * 切换节点展开/折叠
     */
    toggleNode(node) {
        const header = node.querySelector('.tree-node-header');
        const content = node.querySelector('.tree-node-content');
        const icon = header.querySelector('.expand-icon');
        
        if (content.style.display === 'block') {
            content.style.display = 'none';
            header.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            header.classList.add('expanded');
        }
    }
    
    /**
     * 添加结构节点
     */
    addStructureNodes(container, pdfStructure, validationResults) {
        if (!pdfStructure.physical?.objects) return;
        
        // 按类型分组对象
        const groupedObjects = this.groupObjectsByType(pdfStructure.physical.objects);
        
        // 添加主要结构（Header、Body、XRef、Trailer）
        this.addMainStructure(container, pdfStructure, validationResults, groupedObjects);
    }
    
    /**
     * 添加主要结构
     */
    addMainStructure(container, pdfStructure, validationResults, groupedObjects) {
        // 添加Header
        const headerNode = this.createTreeNode({
            type: 'Header',
            label: 'Header',
            status: pdfStructure.physical?.header ? 'success' : 'warning',
            properties: pdfStructure.physical?.header ? 
                this.getStructureProperties(pdfStructure.physical.header) : 
                { 'Status': 'Not Found' }
        });
        container.appendChild(headerNode);
        
        // 添加Body节点，包含所有对象类型分组
        const bodyNode = this.createTreeNode({
            type: 'Body',
            label: 'Body',
            status: this.getBodyStatus(groupedObjects, validationResults),
            properties: {
                'Total Objects': Object.values(groupedObjects).reduce((sum, objects) => sum + objects.length, 0),
                'Object Types': Object.keys(groupedObjects).length
            }
        });
        container.appendChild(bodyNode);
        
        // 将所有对象类型分组添加到Body节点下
        this.addObjectGroupsToBody(bodyNode, groupedObjects, validationResults);
        
        // 添加XRef
        const xrefNode = this.createTreeNode({
            type: 'XRef',
            label: 'XRef',
            status: pdfStructure.physical?.xref ? 'success' : 'warning',
            properties: pdfStructure.physical?.xref ? 
                this.getStructureProperties(pdfStructure.physical.xref) : 
                { 'Status': 'Not Found' }
        });
        container.appendChild(xrefNode);
        
        // 添加Trailer
        const trailerNode = this.createTreeNode({
            type: 'Trailer',
            label: 'Trailer',
            status: pdfStructure.physical?.trailer ? 'success' : 'warning',
            properties: pdfStructure.physical?.trailer ? 
                this.getStructureProperties(pdfStructure.physical.trailer) : 
                { 'Status': 'Not Found' }
        });
        container.appendChild(trailerNode);
    }
    
    /**
     * 获取Body状态
     */
    getBodyStatus(groupedObjects, validationResults) {
        if (!validationResults?.validation) return 'success';
        
        const validation = validationResults.validation;
        
        // 检查所有对象是否有错误
        for (const [type, objects] of Object.entries(groupedObjects)) {
            const groupStatus = this.getGroupStatus(objects, validationResults);
            if (groupStatus === 'error') return 'error';
            if (groupStatus === 'warning') return 'warning';
        }
        
        return 'success';
    }
    
    /**
     * 将对象分组添加到Body节点下
     */
    addObjectGroupsToBody(bodyNode, groupedObjects, validationResults) {
        const bodyContent = bodyNode.querySelector('.tree-node-content');
        
        Object.entries(groupedObjects).forEach(([type, objects]) => {
            if (objects.length > 0) {
                const groupNode = this.createTreeNode({
                    type: type,
                    label: `${type} (${objects.length})`,
                    status: this.getGroupStatus(objects, validationResults)
                });
                
                bodyContent.appendChild(groupNode);
                
                // 添加所有子节点
                objects.forEach(obj => {
                    const objectStatus = this.getObjectStatus(obj, validationResults);
                    
                    // 调试XObject状态
                    if (obj.type === 'XObject') {
                        console.log(`创建XObject ${obj.objectNumber} 子节点，计算状态: ${objectStatus}`);
                    }
                    
                    const childNode = this.createTreeNode({
                        type: obj.type,
                        label: `${obj.type} ${obj.objectNumber}`,
                        objectNumber: obj.objectNumber,
                        generation: obj.generation,
                        status: objectStatus,
                        properties: this.getObjectProperties(obj, validationResults)
                    });
                    
                    groupNode.querySelector('.tree-node-content').appendChild(childNode);
                    
                    // 调试XObject的DOM结构
                    if (obj.type === 'XObject') {
                        console.log(`XObject ${obj.objectNumber} DOM结构:`, {
                            className: childNode.className,
                            dataset: childNode.dataset,
                            nodeLabel: childNode.querySelector('.node-label')?.textContent,
                            nodeLabelClass: childNode.querySelector('.node-label')?.className
                        });
                        
                        // 强制应用正确的样式
                        this.forceApplyNodeStyles(childNode, objectStatus);
                        
                        // 延迟再次应用样式，确保覆盖任何可能的继承
                        setTimeout(() => {
                            this.forceApplyNodeStyles(childNode, objectStatus);
                        }, 0);
                    }
                });
            }
        });
    }
    
    /**
     * 按类型分组对象
     */
    groupObjectsByType(objects) {
        const grouped = {};
        
        objects.forEach(obj => {
            const type = obj.type || 'Unknown';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(obj);
        });
        
        return grouped;
    }
    
    /**
     * 获取对象状态
     */
    getObjectStatus(obj, validationResults) {
        if (!validationResults?.validation) return 'success';
        
        const validation = validationResults.validation;
        const objectNumber = obj.objectNumber;
        
        // 调试信息：显示验证结果的结构
        if (objectNumber === 25) { // 只对第一个对象显示调试信息
            console.log('验证结果结构:', {
                errors: validation.errors,
                warnings: validation.warnings
            });
        }
        
        // 检查错误
        if (validation.errors && Array.isArray(validation.errors)) {
            for (const error of validation.errors) {
                if (this.errorMatchesObject(error, objectNumber)) {
                    console.log(`对象 ${objectNumber} 标记为错误:`, error);
                    return 'error';
                }
            }
        }
        
        // 检查警告
        if (validation.warnings && Array.isArray(validation.warnings)) {
            for (const warning of validation.warnings) {
                if (this.errorMatchesObject(warning, objectNumber)) {
                    console.log(`对象 ${objectNumber} 标记为警告:`, warning);
                    return 'warning';
                }
            }
        }
        
        return 'success';
    }
    
    /**
     * 检查错误信息是否匹配指定对象
     */
    errorMatchesObject(errorMessage, objectNumber) {
        // 使用更精确的匹配模式，确保匹配的是完整的对象编号
        // 匹配格式：对象 数字 或 对象数字
        const objectPattern = new RegExp(`对象\\s*${objectNumber}\\b`, 'i');
        const matches = objectPattern.test(errorMessage);
        
        // 调试信息
        if (matches) {
            console.log(`匹配到对象 ${objectNumber} 的错误:`, errorMessage);
        }
        
        return matches;
    }
    
    /**
     * 获取组状态
     */
    getGroupStatus(objects, validationResults) {
        if (!validationResults?.validation) return 'success';
        
        const validation = validationResults.validation;
        
        // 检查组中是否有任何对象有错误
        const hasError = objects.some(obj => {
            if (validation.errors) {
                return validation.errors.some(error => 
                    this.errorMatchesObject(error, obj.objectNumber)
                );
            }
            return false;
        });
        
        // 检查组中是否有任何对象有警告
        const hasWarning = objects.some(obj => {
            if (validation.warnings) {
                return validation.warnings.some(warning => 
                    this.errorMatchesObject(warning, obj.objectNumber)
                );
            }
            return false;
        });
        
        if (hasError) return 'error';
        if (hasWarning) return 'warning';
        
        return 'success';
    }
    
    /**
     * 获取对象属性
     */
    getObjectProperties(obj, validationResults) {
        const properties = {};
        
        if (obj.properties) {
            Object.entries(obj.properties).forEach(([key, value]) => {
                if (key !== 'streamData' && key !== 'rawContent') {
                    properties[key] = this.formatPropertyValue(value);
                }
            });
        }
        
        if (obj.offset) {
            properties['Offset'] = obj.offset;
        }
        
        // 添加错误信息
        const errorInfo = this.getObjectErrorInfo(obj, validationResults);
        if (errorInfo) {
            properties['Error'] = errorInfo;
        }
        
        return properties;
    }
    
    /**
     * 获取对象的错误信息
     */
    getObjectErrorInfo(obj, validationResults) {
        if (!validationResults?.validation) return null;
        
        const validation = validationResults.validation;
        const objectNumber = obj.objectNumber;
        const errors = [];
        
        // 检查错误
        if (validation.errors && Array.isArray(validation.errors)) {
            for (const error of validation.errors) {
                if (this.errorMatchesObject(error, objectNumber)) {
                    errors.push(error);
                }
            }
        }
        
        // 检查警告
        if (validation.warnings && Array.isArray(validation.warnings)) {
            for (const warning of validation.warnings) {
                if (this.errorMatchesObject(warning, objectNumber)) {
                    errors.push(`警告: ${warning}`);
                }
            }
        }
        
        return errors.length > 0 ? errors.join('; ') : null;
    }
    
    /**
     * 获取结构属性
     */
    getStructureProperties(data) {
        const properties = {};
        
        // 处理Header数据
        if (data.version) {
            properties['Version'] = data.version;
        }
        if (data.rawContent) {
            properties['Raw Content'] = data.rawContent.substring(0, 100) + (data.rawContent.length > 100 ? '...' : '');
        }
        
        // 处理XRef数据
        if (data.entries) {
            properties['Entries Count'] = data.entries.length;
        }
        if (data.startPosition !== undefined) {
            properties['Start Position'] = data.startPosition;
        }
        if (data.isValid !== undefined) {
            properties['Valid'] = data.isValid ? 'Yes' : 'No';
        }
        if (data.rawContent) {
            properties['Raw Content'] = data.rawContent.substring(0, 100) + (data.rawContent.length > 100 ? '...' : '');
        }
        
        // 处理Trailer数据
        if (data.properties) {
            Object.entries(data.properties).forEach(([key, value]) => {
                properties[key] = this.formatPropertyValue(value);
            });
        }
        
        return properties;
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
     * 绑定结构树事件
     */
    bindStructureTreeEvents() {
        // 搜索功能
        const searchInput = document.getElementById('structureSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterStructureTree(e.target.value);
            });
        }
        
        // 过滤按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setStructureFilter(e.target.dataset.filter);
            });
        });
        

    }
    
    /**
     * 过滤结构树
     */
    filterStructureTree(searchTerm) {
        const nodes = document.querySelectorAll('.tree-node');
        
        nodes.forEach(node => {
            const label = node.querySelector('.node-label')?.textContent || '';
            const matches = label.toLowerCase().includes(searchTerm.toLowerCase());
            node.style.display = matches ? 'block' : 'none';
        });
    }
    
    /**
     * 设置结构过滤
     */
    setStructureFilter(filter) {
        this.currentFilter = filter;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        const nodes = document.querySelectorAll('.tree-node');
        nodes.forEach(node => {
            const status = node.dataset.status;
            const shouldShow = filter === 'all' || status === filter;
            node.style.display = shouldShow ? 'block' : 'none';
        });
    }
    

    
    /**
     * 渲染关系图
     */
    renderRelationshipGraph(pdfStructure) {
        const container = document.getElementById('relationshipGraph');
        if (!container || !pdfStructure) return;
        
        container.innerHTML = '';
        
        // 检查Vis.js是否可用
        if (typeof vis === 'undefined') {
            container.innerHTML = '<div class="no-data">Vis.js库加载失败，无法显示关系图</div>';
            return;
        }
        
        // 生成关系数据
        const graphData = this.generateVisRelationshipData(pdfStructure);
        
        if (graphData.nodes.length === 0) {
            container.innerHTML = '<div class="no-data">没有找到对象关系</div>';
            return;
        }
        
        // 创建Vis.js网络图
        this.createVisNetworkGraph(container, graphData);
    }
    
    /**
     * 生成Vis.js关系数据
     */
    generateVisRelationshipData(pdfStructure) {
        const nodes = [];
        const edges = [];
        const nodeMap = new Map();
        
        if (!pdfStructure.physical?.objects) return { nodes, edges };
        
        // 找到ROOT/CATALOG对象
        let rootObject = null;
        pdfStructure.physical.objects.forEach(obj => {
            if (obj.type === 'Catalog' || obj.type === 'Root') {
                rootObject = obj;
            }
        });
        
        // 如果没有找到Catalog，使用第一个对象作为根
        if (!rootObject && pdfStructure.physical.objects.length > 0) {
            rootObject = pdfStructure.physical.objects[0];
        }
        
        // 添加节点，ROOT对象放在第一位
        const sortedObjects = [...pdfStructure.physical.objects];
        if (rootObject) {
            // 将ROOT对象移到第一位
            const rootIndex = sortedObjects.indexOf(rootObject);
            if (rootIndex > 0) {
                sortedObjects.splice(rootIndex, 1);
                sortedObjects.unshift(rootObject);
            }
        }
        
        sortedObjects.forEach(obj => {
            const nodeId = `${obj.objectNumber}_${obj.generation}`;
            nodeMap.set(nodeId, nodes.length);
            
            const isRoot = obj === rootObject;
            const nodeType = obj.type || 'Unknown';
            
            nodes.push({
                id: nodeId,
                label: `${obj.objectNumber} ${obj.generation} R`,
                title: `${nodeType}: ${obj.objectNumber} ${obj.generation} R`,
                group: nodeType,
                isRoot: isRoot,
                objectNumber: obj.objectNumber,
                generation: obj.generation,
                type: nodeType,
                level: isRoot ? 0 : 1
            });
        });
        
        // 添加连接
        pdfStructure.physical.objects.forEach(obj => {
            if (obj.properties) {
                this.findVisReferences(obj, nodeMap, edges);
            }
        });
        
        return { nodes, edges };
    }
    
    /**
     * 查找Vis.js引用
     */
    findVisReferences(obj, nodeMap, edges) {
        const objId = `${obj.objectNumber}_${obj.generation}`;
        
        Object.entries(obj.properties).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('Indirect Reference')) {
                const match = value.match(/Indirect Reference \((\d+) (\d+) R\)/);
                if (match) {
                    const targetId = `${match[1]}_${match[2]}`;
                    if (nodeMap.has(targetId)) {
                        edges.push({
                            from: objId,
                            to: targetId,
                            label: key,
                            title: key,
                            arrows: 'to',
                            smooth: {
                                type: 'curvedCW',
                                roundness: 0.2
                            }
                        });
                    }
                }
            }
        });
    }
    
    /**
     * 查找引用
     */
    findReferences(obj, nodeMap, links) {
        const objId = `${obj.objectNumber}_${obj.generation}`;
        
        Object.entries(obj.properties).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('Indirect Reference')) {
                const match = value.match(/Indirect Reference \((\d+) (\d+) R\)/);
                if (match) {
                    const targetId = `${match[1]}_${match[2]}`;
                    if (nodeMap.has(targetId)) {
                        links.push({
                            source: objId,
                            target: targetId,
                            type: key,
                            label: key
                        });
                    }
                }
            }
        });
    }
    
    /**
     * 创建Vis.js网络图
     */
    createVisNetworkGraph(container, graphData) {
        // 检查Vis.js是否可用
        if (typeof vis === 'undefined') {
            console.error('Vis.js未加载');
            return;
        }
        
        // 创建网络图数据
        const data = {
            nodes: new vis.DataSet(graphData.nodes),
            edges: new vis.DataSet(graphData.edges)
        };
        
        // 配置选项
        const options = {
            nodes: {
                shape: 'dot',
                size: 8,
                font: {
                    size: 10,
                    face: 'Arial'
                },
                borderWidth: 1,
                shadow: true,
                color: {
                    border: '#2B7CE9',
                    background: '#97C2FC',
                    highlight: {
                        border: '#2B7CE9',
                        background: '#D2E5FF'
                    },
                    hover: {
                        border: '#2B7CE9',
                        background: '#D2E5FF'
                    }
                }
            },
            edges: {
                width: 1,
                color: {
                    color: '#848484',
                    highlight: '#848484',
                    hover: '#848484'
                },
                smooth: {
                    type: 'curvedCW',
                    roundness: 0.2
                }
            },
            groups: {
                'Catalog': {
                    color: { background: '#4CAF50', border: '#2E7D32' },
                    font: { color: '#ffffff' }
                },
                'Pages': {
                    color: { background: '#2196F3', border: '#1565C0' },
                    font: { color: '#ffffff' }
                },
                'Page': {
                    color: { background: '#FF9800', border: '#E65100' },
                    font: { color: '#ffffff' }
                },
                'Font': {
                    color: { background: '#9C27B0', border: '#6A1B9A' },
                    font: { color: '#ffffff' }
                },
                'Stream': {
                    color: { background: '#F44336', border: '#C62828' },
                    font: { color: '#ffffff' }
                },
                'XObject': {
                    color: { background: '#00BCD4', border: '#00838F' },
                    font: { color: '#ffffff' }
                },
                'Annot': {
                    color: { background: '#795548', border: '#4E342E' },
                    font: { color: '#ffffff' }
                },
                'Form': {
                    color: { background: '#607D8B', border: '#37474F' },
                    font: { color: '#ffffff' }
                },
                'Metadata': {
                    color: { background: '#E91E63', border: '#AD1457' },
                    font: { color: '#ffffff' }
                },
                'Info': {
                    color: { background: '#3F51B5', border: '#1A237E' },
                    font: { color: '#ffffff' }
                },
                'Encrypt': {
                    color: { background: '#FF5722', border: '#BF360C' },
                    font: { color: '#ffffff' }
                },
                'Unknown': {
                    color: { background: '#9E9E9E', border: '#424242' },
                    font: { color: '#ffffff' }
                }
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.01,
                    springLength: 100,
                    springConstant: 0.08,
                    damping: 0.4,
                    avoidOverlap: 0.5
                },
                stabilization: {
                    enabled: true,
                    iterations: 1000,
                    updateInterval: 100,
                    fit: true
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true,
                dragView: true
            },
            layout: {
                improvedLayout: true,
                hierarchical: {
                    enabled: false,
                    direction: 'UD',
                    sortMethod: 'directed'
                }
            }
        };
        
        // 创建网络图
        const network = new vis.Network(container, data, options);
        
        // 保存引用
        this.relationshipGraph = { network, data };
        
        // 添加事件监听
        network.on('click', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = data.nodes.get(nodeId);
                this.showNodeDetails(node);
            }
        });
        
        network.on('stabilizationProgress', (params) => {
            // 可以在这里显示稳定化进度
            console.log('Stabilization progress:', params.iterations, '/', params.total);
        });
        
        network.on('stabilizationIterationsDone', () => {
            console.log('Network stabilized');
        });
        
        // 自动适应视图
        network.fit();
    }
    
    /**
     * 显示节点详情
     */
    showNodeDetails(node) {
        const modal = document.getElementById('objectDetailModal');
        const title = document.getElementById('objectDetailTitle');
        const content = document.getElementById('objectDetailContent');
        const closeBtn = document.getElementById('closeObjectModal');
        
        if (!modal || !title || !content) return;
        
        title.textContent = `对象详情: ${node.label}`;
        
        content.innerHTML = `
            <div class="object-detail-info">
                <div class="detail-row">
                    <span class="detail-label">对象编号:</span>
                    <span class="detail-value">${node.objectNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">生成号:</span>
                    <span class="detail-value">${node.generation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">类型:</span>
                    <span class="detail-value">${node.type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">层级:</span>
                    <span class="detail-value">${node.level}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">是否根节点:</span>
                    <span class="detail-value">${node.isRoot ? '是' : '否'}</span>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // 绑定关闭按钮事件
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        // 点击模态框外部关闭
        modal.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
    

    

    

    
    /**
     * 渲染问题列表
     */
    renderIssuesList(validationResults) {
        const container = document.getElementById('issuesList');
        if (!container || !validationResults?.validation) return;
        
        container.innerHTML = '';
        
        const validation = validationResults.validation;
        
        // 处理错误
        if (validation.errors && validation.errors.length > 0) {
            validation.errors.forEach((error, index) => {
                const issueElement = this.createIssueElement({
                    title: `错误 ${index + 1}`,
                    description: error,
                    severity: 'error',
                    location: null
                });
                container.appendChild(issueElement);
            });
        }
        
        // 处理警告
        if (validation.warnings && validation.warnings.length > 0) {
            validation.warnings.forEach((warning, index) => {
                const issueElement = this.createIssueElement({
                    title: `警告 ${index + 1}`,
                    description: warning,
                    severity: 'warning',
                    location: null
                });
                container.appendChild(issueElement);
            });
        }
        
        // 如果没有问题，显示成功消息
        if ((!validation.errors || validation.errors.length === 0) && 
            (!validation.warnings || validation.warnings.length === 0)) {
            const successElement = this.createIssueElement({
                title: '验证通过',
                description: 'PDF文件验证通过，未发现任何问题。',
                severity: 'success',
                location: null
            });
            container.appendChild(successElement);
        }
        

    }
    
    /**
     * 创建问题元素
     */
    createIssueElement(issue) {
        const element = document.createElement('div');
        element.className = `issue-item ${issue.severity}`;
        
        element.innerHTML = `
            <div class="issue-header">
                <i class="fas ${this.getIssueIcon(issue.severity)}"></i>
                <span class="issue-title">${issue.title}</span>
                <span class="issue-severity">${issue.severity.toUpperCase()}</span>
            </div>
            <div class="issue-description">${issue.description}</div>
            ${issue.location ? `<div class="issue-location">位置: ${this.formatLocation(issue.location)}</div>` : ''}
        `;
        
        return element;
    }
    
    /**
     * 获取问题图标
     */
    getIssueIcon(severity) {
        const iconMap = {
            'critical': 'fa-exclamation-circle',
            'error': 'fa-times-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle',
            'success': 'fa-check-circle'
        };
        
        return iconMap[severity] || 'fa-info-circle';
    }
    
    /**
     * 格式化位置信息
     */
    formatLocation(location) {
        if (location.objectNumber !== undefined) {
            return `对象 ${location.objectNumber} ${location.generation || 0} R`;
        }
        return location.toString();
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
        if (!pdfStructure.physical?.objects) return '0 KB';
        
        const totalSize = pdfStructure.physical.objects.reduce((sum, obj) => {
            return sum + (obj.rawContent?.length || 0);
        }, 0);
        
        const averageSize = totalSize / pdfStructure.physical.objects.length;
        return this.formatBytes(averageSize);
    }
    
    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 渲染原始数据
     */
    renderRawData(pdfStructure) {
        const container = document.getElementById('rawData');
        if (!container) return;
        
        const rawData = {
            header: pdfStructure.physical?.header,
            objects: pdfStructure.physical?.objects?.map(obj => ({
                objectNumber: obj.objectNumber,
                generation: obj.generation,
                type: obj.type,
                offset: obj.offset,
                properties: obj.properties
            })),
            xref: pdfStructure.physical?.xref,
            trailer: pdfStructure.physical?.trailer
        };
        
        container.textContent = JSON.stringify(rawData, null, 2);
    }
    
    /**
     * 导出关系图
     */
    exportGraph() {
        if (!this.relationshipGraph?.network) {
            this.showToast('没有可导出的关系图');
            return;
        }
        
        try {
            // 获取网络图的Canvas
            const canvas = this.relationshipGraph.network.canvas.frame.canvas;
            if (!canvas) {
                this.showToast('无法获取关系图数据');
                return;
            }
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'pdf-relationship-graph.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            this.showToast('关系图导出成功');
        } catch (error) {
            console.error('导出关系图失败:', error);
            this.showToast('导出失败，请重试');
        }
    }
    
    /**
     * 导出问题报告
     */
    exportIssuesReport(validationResults) {
        if (!validationResults?.issues) return;
        
        const report = {
            summary: validationResults.summary,
            issues: validationResults.issues.map(issue => ({
                severity: issue.severity,
                title: issue.title,
                description: issue.description,
                location: issue.location
            })),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pdf-issues-report.json';
        link.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * 复制原始数据
     */
    copyRawData() {
        const container = document.getElementById('rawData');
        if (!container) return;
        
        const text = container.textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('原始数据已复制到剪贴板');
        }).catch(() => {
            this.showToast('复制失败');
        });
    }
    
    /**
     * 下载原始数据
     */
    downloadRawData() {
        const container = document.getElementById('rawData');
        if (!container) return;
        
        const text = container.textContent;
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pdf-raw-data.json';
        link.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * 格式化原始数据
     */
    formatRawData() {
        const container = document.getElementById('rawData');
        if (!container) return;
        
        try {
            const data = JSON.parse(container.textContent);
            container.textContent = JSON.stringify(data, null, 2);
            this.showToast('原始数据已格式化');
        } catch (error) {
            this.showToast('格式化失败：无效的JSON数据');
        }
    }
    
    /**
     * 显示提示消息
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 销毁图表
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        // 停止力导向图模拟
        if (this.relationshipGraph?.simulation) {
            this.relationshipGraph.simulation.stop();
        }
        
        // 清空引用
        this.charts = {};
        this.relationshipGraph = null;
    }
}

// 兼容浏览器和Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = PDFVisualizer;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.PDFVisualizer = PDFVisualizer;
}