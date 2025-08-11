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
                        //console.log(`创建XObject ${obj.objectNumber} 子节点，计算状态: ${objectStatus}`);
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
        // 处理结构化消息格式
        if (typeof errorMessage === 'object' && errorMessage.msg) {
            const msg = errorMessage.msg;
            const detail = errorMessage.detail || '';
            
            // 检查消息和详情中是否包含对象编号
            const objectPattern = new RegExp(`对象\\s*${objectNumber}\\b`, 'i');
            const matchesMsg = objectPattern.test(msg);
            const matchesDetail = objectPattern.test(detail);
            
            if (matchesMsg || matchesDetail) {
                console.log(`匹配到对象 ${objectNumber} 的错误:`, errorMessage);
                return true;
            }
            return false;
        }
        
        // 处理字符串消息格式（向后兼容）
        if (typeof errorMessage === 'string') {
            const objectPattern = new RegExp(`对象\\s*${objectNumber}\\b`, 'i');
            const matches = objectPattern.test(errorMessage);
            
            if (matches) {
                console.log(`匹配到对象 ${objectNumber} 的错误:`, errorMessage);
            }
            
            return matches;
        }
        
        return false;
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
                    // 使用结构化消息的msg字段
                    if (typeof error === 'object' && error.msg) {
                        errors.push(error.msg);
                    } else if (typeof error === 'string') {
                        errors.push(error);
                    } else {
                        errors.push('未知错误');
                    }
                }
            }
        }
        
        // 检查警告
        if (validation.warnings && Array.isArray(validation.warnings)) {
            for (const warning of validation.warnings) {
                if (this.errorMatchesObject(warning, objectNumber)) {
                    // 使用结构化消息的msg字段
                    if (typeof warning === 'object' && warning.msg) {
                        errors.push(`警告: ${warning.msg}`);
                    } else if (typeof warning === 'string') {
                        errors.push(`警告: ${warning}`);
                    } else {
                        errors.push('警告: 未知警告');
                    }
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
        
        // 检查D3.js是否可用
        if (typeof d3 === 'undefined') {
            container.innerHTML = window.languageManager ? 
                `<div class="no-data">${window.languageManager.get('errors.d3LoadFailed')}</div>` :
                '<div class="no-data">D3.js库加载失败，无法显示关系图</div>';
            return;
        }
        
        // 获取容器尺寸
        const containerRect = container.getBoundingClientRect();
        const width = Math.max(containerRect.width || 1200, 1200);
        const height = Math.max(containerRect.height || 800, 800);
        
        // 创建SVG容器，使用更大的viewBox
        const svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('overflow', 'visible');
        
        // 生成关系数据
        const graphData = this.generateRelationshipData(pdfStructure);
        
        if (graphData.nodes.length === 0) {
            container.innerHTML = window.languageManager ? 
                `<div class="no-data">${window.languageManager.get('graph.noRelationships')}</div>` :
                '<div class="no-data">没有找到对象关系</div>';
            return;
        }
        
        // 创建力导向图
        this.createForceDirectedGraph(svg, graphData, width, height);
    }
    
    /**
     * 生成关系数据
     */
    generateRelationshipData(pdfStructure) {
        const nodes = [];
        const links = [];
        const nodeMap = new Map();
        
        if (!pdfStructure.physical?.objects) return { nodes, links };
        
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
            nodes.push({
                id: nodeId,
                label: `${obj.objectNumber} ${obj.generation} R`,
                type: obj.type || 'Unknown',
                objectNumber: obj.objectNumber,
                generation: obj.generation,
                group: obj.type || 'Unknown',
                isRoot: isRoot,
                level: isRoot ? 0 : 1 // 根节点为0级，其他为1级
            });
        });
        
        // 添加连接
        pdfStructure.physical.objects.forEach(obj => {
            if (obj.properties) {
                this.findReferences(obj, nodeMap, links);
            }
        });
        
        return { nodes, links };
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
     * 创建力导向图
     */
    createForceDirectedGraph(svg, graphData, width, height) {
        // 再次检查D3.js是否可用
        if (typeof d3 === 'undefined') {
            console.error('D3.js未加载');
            return;
        }
        
        // 找到根节点
        const rootNode = graphData.nodes.find(node => node.isRoot);
        
        // 根据节点数量调整参数
        const nodeCount = graphData.nodes.length;
        const linkCount = graphData.links.length;
        
        // 动态调整参数
        const chargeStrength = Math.max(-300, -150 - nodeCount * 2);
        const linkDistance = Math.max(80, 60 + nodeCount / 10);
        const collisionRadius = nodeCount > 100 ? 8 : 15;
        const rootCollisionRadius = nodeCount > 100 ? 20 : 25;
        
        // 创建缩放行为
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                svg.selectAll('g').attr('transform', event.transform);
            });
        
        // 应用缩放行为到SVG
        svg.call(zoom);
        
        // 创建主图形组
        const g = svg.append('g');
        
        // 创建力导向布局
        const simulation = d3.forceSimulation(graphData.nodes)
            .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(linkDistance))
            .force('charge', d3.forceManyBody().strength(chargeStrength))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => d.isRoot ? rootCollisionRadius : collisionRadius))
            .force('x', d3.forceX().x(d => d.isRoot ? width / 2 : null).strength(0.1))
            .force('y', d3.forceY().y(d => d.isRoot ? height / 2 : null).strength(0.1));
        
        // 创建连接线
        const link = g.append('g')
            .selectAll('line')
            .data(graphData.links)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-width', 0.5);
        
        // 创建节点
        const node = g.append('g')
            .selectAll('circle')
            .data(graphData.nodes)
            .enter().append('circle')
            .attr('r', d => d.isRoot ? 12 : 4)
            .attr('fill', d => this.getNodeColor(d.type))
            .attr('stroke', d => d.isRoot ? '#FF5722' : 'none')
            .attr('stroke-width', d => d.isRoot ? 2 : 0)
            .call(d3.drag()
                .on('start', (event, d) => this.dragstarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragended(event, d)));
        
        // 添加节点标签，只显示重要节点的标签
        const label = g.append('g')
            .selectAll('text')
            .data(graphData.nodes.filter(d => d.isRoot || d.type === 'Catalog' || d.type === 'Pages' || d.type === 'Page'))
            .enter().append('text')
            .text(d => d.label)
            .attr('font-size', d => d.isRoot ? '12px' : '8px')
            .attr('font-weight', d => d.isRoot ? 'bold' : 'normal')
            .attr('dx', d => d.isRoot ? 15 : 8)
            .attr('dy', 3)
            .attr('fill', d => d.isRoot ? '#FF5722' : '#333')
            .style('pointer-events', 'none');
        
        // 更新位置
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
            
            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
        
        // 保存引用
        this.relationshipGraph = { simulation, node, link, label, zoom };
        
        // 自动调整视图以适应所有节点
        setTimeout(() => {
            this.fitGraphToView(svg, graphData.nodes, width, height);
        }, 1000);
    }
    
    /**
     * 调整视图以适应所有节点
     */
    fitGraphToView(svg, nodes, width, height) {
        if (!nodes || nodes.length === 0) return;
        
        // 计算节点的边界
        const xExtent = d3.extent(nodes, d => d.x);
        const yExtent = d3.extent(nodes, d => d.y);
        
        const graphWidth = xExtent[1] - xExtent[0];
        const graphHeight = yExtent[1] - yExtent[0];
        
        // 计算缩放比例
        const scaleX = (width * 0.8) / graphWidth;
        const scaleY = (height * 0.8) / graphHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        // 计算平移
        const translateX = (width - graphWidth * scale) / 2 - xExtent[0] * scale;
        const translateY = (height - graphHeight * scale) / 2 - yExtent[0] * scale;
        
        // 应用变换
        const transform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);
        
        svg.transition()
            .duration(750)
            .call(this.relationshipGraph.zoom.transform, transform);
    }
    
    /**
     * 获取节点颜色
     */
    getNodeColor(type) {
        const colorMap = {
            'Catalog': '#4CAF50',
            'Pages': '#2196F3',
            'Page': '#FF9800',
            'Font': '#9C27B0',
            'Stream': '#F44336',
            'XObject': '#00BCD4',
            'Annot': '#795548',
            'Form': '#607D8B',
            'Metadata': '#E91E63',
            'Info': '#3F51B5',
            'Encrypt': '#FF5722'
        };
        
        return colorMap[type] || '#999';
    }
    
    /**
     * 拖拽事件
     */
    dragstarted(event, d) {
        if (!event.active && this.relationshipGraph?.simulation) {
            this.relationshipGraph.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }
    
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    dragended(event, d) {
        if (!event.active && this.relationshipGraph?.simulation) {
            this.relationshipGraph.simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
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
                const issueData = this.parseIssueMessage(error);
                const issueElement = this.createIssueElement({
                    title: issueData.title || `错误 ${index + 1}`,
                    description: issueData.description,
                    severity: 'error',
                    location: issueData.location,
                    code: issueData.code,
                    detail: issueData.detail
                });
                container.appendChild(issueElement);
            });
        }
        
        // 处理警告
        if (validation.warnings && validation.warnings.length > 0) {
            validation.warnings.forEach((warning, index) => {
                const issueData = this.parseIssueMessage(warning);
                const issueElement = this.createIssueElement({
                    title: issueData.title || `警告 ${index + 1}`,
                    description: issueData.description,
                    severity: 'warning',
                    location: issueData.location,
                    code: issueData.code,
                    detail: issueData.detail
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
                location: null,
                code: 'VALIDATION_SUCCESS',
                detail: '所有验证项目均通过检查'
            });
            container.appendChild(successElement);
        }
    }
    
    /**
     * 解析问题消息
     */
    parseIssueMessage(message) {
        // 如果是结构化消息（包含code、msg、detail）
        if (typeof message === 'object' && message.code && message.msg) {
            return {
                code: message.code,
                title: message.code,
                description: message.msg,
                detail: message.detail || '',
                location: this.extractLocationFromMessage(message.msg, message.detail)
            };
        }
        
        // 如果是字符串消息，尝试解析
        if (typeof message === 'string') {
            return {
                code: 'UNKNOWN_ERROR',
                title: '未知错误',
                description: message,
                detail: '',
                location: this.extractLocationFromString(message)
            };
        }
        
        // 默认返回
        return {
            code: 'UNKNOWN_ERROR',
            title: '未知错误',
            description: '无法解析的错误消息',
            detail: '',
            location: null
        };
    }
    
    /**
     * 从消息中提取位置信息
     */
    extractLocationFromMessage(msg, detail) {
        // 尝试从消息中提取对象编号
        const objectMatch = msg.match(/对象\s*(\d+)/);
        if (objectMatch) {
            return {
                objectNumber: parseInt(objectMatch[1]),
                type: 'object'
            };
        }
        
        // 尝试从详情中提取位置信息
        if (detail) {
            const detailObjectMatch = detail.match(/对象\s*(\d+)/);
            if (detailObjectMatch) {
                return {
                    objectNumber: parseInt(detailObjectMatch[1]),
                    type: 'object'
                };
            }
        }
        
        return null;
    }
    
    /**
     * 从字符串中提取位置信息
     */
    extractLocationFromString(message) {
        const objectMatch = message.match(/对象\s*(\d+)/);
        if (objectMatch) {
            return {
                objectNumber: parseInt(objectMatch[1]),
                type: 'object'
            };
        }
        
        return null;
    }
    
    /**
     * 创建问题元素
     */
    createIssueElement(issue) {
        const element = document.createElement('div');
        element.className = `issue-item ${issue.severity}`;
        
        // 构建HTML内容
        let html = `
            <div class="issue-header">
                <i class="fas ${this.getIssueIcon(issue.severity)}"></i>
                <span class="issue-title">${issue.title}</span>
                <span class="issue-severity">${issue.severity.toUpperCase()}</span>
            </div>
        `;
        
        // 合并 description、detail、location 信息
        let combinedDescription = issue.description;
        
        // 添加详细信息
        if (issue.detail) {
            combinedDescription += `\n\n详情: ${issue.detail}`;
        }
        
        // 添加位置信息
        if (issue.location) {
            combinedDescription += `\n\n位置: ${this.formatLocation(issue.location)}`;
        }
        
        // 显示合并后的描述
        html += `<div class="issue-description">${combinedDescription.replace(/\n\n/g, '<br><br>')}</div>`;
        
        element.innerHTML = html;
        
        return element;
    }
    
    /**
     * 获取问题图标
     */
    getIssueIcon(severity) {
        const iconMap = {
            'critical': 'fa-ad-circle',
            'error': 'fa-times-circle',
            'warning': 'fa-ad-triangle',
            'info': 'fa-info-circle',
            'success': 'fa-check-circle'
        };
        
        return iconMap[severity] || 'fa-info-circle';
    }
    
    /**
     * 格式化位置信息
     */
    formatLocation(location) {
        if (!location) {
            return '';
        }
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
        const container = document.getElementById('relationshipGraph');
        if (!container) return;
        
        const svg = container.querySelector('svg');
        if (!svg) return;
        
        // 创建SVG的副本
        const clonedSvg = svg.cloneNode(true);
        
        // 设置尺寸
        clonedSvg.setAttribute('width', '800');
        clonedSvg.setAttribute('height', '600');
        
        // 转换为字符串
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        
        // 下载文件
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pdf-relationship-graph.svg';
        link.click();
        URL.revokeObjectURL(url);
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