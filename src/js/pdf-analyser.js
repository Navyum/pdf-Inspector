/**
 * PDF分析器 - 专门负责PDF结构分析
 */
class PDFAnalyser {
    constructor(pdfStructure) {
        this.structure = pdfStructure;
    }

    /**
     * 创建标准化的消息结构体
     * @param {string} code - 错误码
     * @param {string} msg - 错误消息
     * @param {string} detail - 错误详情
     * @returns {Object} 消息结构体
     */
    createMessage(code, msg, detail = '') {
        return {
            code: code,
            msg: msg,
            detail: detail
        };
    }

    /**
     * 执行完整分析
     * @returns {Object} 分析结果
     */
    async analyze() {
        try {
            console.log('开始PDF结构分析...');
            
            // 1. 分析引用关系
            const refStats = this.analyzeReferences();
            
            // 2. 构建层次结构
            const hierarchy = this.buildHierarchy();
            
            // 3. 生成统计信息
            const stats = this.generateStats();
            
            // 4. 分析核心对象
            this.analyseCoreObjects();
            
            // 5. 验证结构
            const validation = this.validate();
            
            console.log('PDF结构分析完成');
            
            return {
                references: refStats,
                hierarchy: hierarchy,
                stats: stats,
                validation: validation
            };
        } catch (error) {
            console.error('PDF分析失败:', error);
            throw error;
        }
    }

    /**
     * 分析引用关系
     * @returns {Object} 引用统计
     */
    analyzeReferences() {
        console.log("")
        console.log('分析引用关系...');
        
        const references = [];
        const referencedBy = new Map();
        
        this.structure.physical.objects.forEach(obj => {
            const objRef = `${obj.objectNumber} ${obj.generation}`;
            this.findReferencesInObject(obj, references, referencedBy, objRef);
        });
        
        this.structure.relations.references = references;
        this.structure.relations.referencedBy = referencedBy;
        
        const circularInfo = this.detectCircularReferences(references);
        
        const stats = {
            total: references.length,
            valid: references.filter(ref => ref.valid).length,
            invalid: references.filter(ref => !ref.valid).length,
            circular: circularInfo.count,
            circularPaths: circularInfo.paths
        };
        
        this.structure.stats.references = stats;
        
        console.log(`找到 ${references.length} 个引用关系`);
        console.log("")
        return stats;
    }

    /**
     * 在对象中查找引用
     * @param {Object} obj - 对象
     * @param {Array} references - 引用数组
     * @param {Map} referencedBy - 被引用映射
     * @param {string} sourceRef - 源对象引用
     */
    findReferencesInObject(obj, references, referencedBy, sourceRef) {
        const findRefs = (value, path = '') => {
            if (typeof value === 'string' && value.includes('Indirect Reference')) {
                const refMatch = value.match(/Indirect Reference \((\d+) (\d+) R\)/);
                if (refMatch) {
                    const targetRef = `${refMatch[1]} ${refMatch[2]}`;
                    const targetObj = this.structure.getObject(parseInt(refMatch[1]), parseInt(refMatch[2]));
                    
                    // 确定引用类型
                    let refType = 'general';
                    if (path === 'Pages') {
                        refType = 'hierarchy_root';
                    } else if (path === 'Kids' || path.startsWith('K[')) {
                        refType = 'hierarchy_child';
                    } else if (path === 'Parent' || path === 'P') {
                        refType = 'hierarchy_parent';
                    } else if (path === 'Contents') {
                        refType = 'content';
                    } else if (path === 'Resources') {
                        refType = 'resource';
                    } else if (path.includes('Font')) {
                        refType = 'font';
                    } else if (path.includes('XObject')) {
                        refType = 'xobject';
                    } else if (path.includes('ExtGState')) {
                        refType = 'graphics_state';
                    } else if (path.includes('Annots')) {
                        refType = 'annotation';
                    } else if (path.includes('MediaBox') || path.includes('CropBox')) {
                        refType = 'page_box';
                    } else if (path === 'K' || path.startsWith('K[')) {
                        // 结构化文档的子元素
                        refType = 'hierarchy_child';
                    } else if (path === 'ParentTree' || path.startsWith('ParentTree[')) {
                        // 结构化文档的父元素
                        refType = 'hierarchy_parent';
                    } else if (path === 'structureElements' || path.startsWith('structureElements[')) {
                        // 结构化文档的子元素
                        refType = 'hierarchy_child';
                    } else if (path === 'parentStructure' || path.startsWith('parentStructure')) {
                        // 结构化文档的父元素
                        refType = 'hierarchy_parent';
                    } else if (path === 'First' || path === 'Last') {
                        // 大纲的兄弟元素
                        refType = 'hierarchy_sibling';
                    } else if (path === 'Next' || path === 'Prev') {
                        // 链式引用
                        refType = 'hierarchy_sibling';
                    } else if (path === 'Fields' || path.startsWith('Fields[')) {
                        // 表单字段
                        refType = 'hierarchy_child';
                    } else if (path === 'A' || path === 'Dest') {
                        // 动作和目标
                        refType = 'action';
                    } else if (path === 'OCGs' || path.startsWith('OCGs[')) {
                        // 可选内容组
                        refType = 'hierarchy_child';
                    } else if (path === 'D' || path === 'F') {
                        // 目标和文件
                        refType = 'action';
                    }
                    
                    if (targetObj) {
                        const refInfo = {
                            source: sourceRef,
                            target: targetRef,
                            path: path,
                            refType: refType,
                            sourceType: obj.type,
                            targetType: targetObj.type,
                            valid: true
                        };
                        references.push(refInfo);
                        
                        if (!referencedBy.has(targetRef)) {
                            referencedBy.set(targetRef, []);
                        }
                        referencedBy.get(targetRef).push({
                            source: sourceRef,
                            path: path,
                            refType: refType,
                            sourceType: obj.type
                        });
                    } else {
                        references.push({
                            source: sourceRef,
                            target: targetRef,
                            path: path,
                            refType: refType,
                            sourceType: obj.type,
                            valid: false
                        });
                    }
                }
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    findRefs(item, `${path}[${index}]`);
                });
            } else if (typeof value === 'object' && value !== null) {
                Object.keys(value).forEach(key => {
                    findRefs(value[key], path ? `${path}.${key}` : key);
                });
            }
        };
        
        findRefs(obj.properties);
    }

    /**
     * 检测循环引用
     * @param {Array} references - 引用数组
     * @returns {Object} 循环引用信息
     */
    detectCircularReferences(references) {
        const graph = new Map();
        const circularPaths = [];
        
        // 构建有向图，只考虑非层次关系的引用
        references.forEach(ref => {
            // 跳过层次关系的引用（Parent/Kids），这些是正常的父子关系
            if (ref.refType === 'hierarchy_parent' || ref.refType === 'hierarchy_child' || ref.refType === 'hierarchy_root' || 
                ref.refType === 'hierarchy_sibling' || ref.refType === 'action') {
                return;
            }
            
            if (!graph.has(ref.source)) {
                graph.set(ref.source, []);
            }
            graph.get(ref.source).push({
                target: ref.target,
                refType: ref.refType,
                path: ref.path
            });
        });
        
        const visited = new Set();
        const recursionStack = new Set();
        
        const findCycle = (node, currentPath = [], currentRefs = []) => {
            if (recursionStack.has(node)) {
                // 找到循环，记录路径
                const cycleStart = currentPath.indexOf(node);
                const cyclePath = currentPath.slice(cycleStart);
                cyclePath.push(node);
                const cycleRefs = currentRefs.slice(cycleStart);
                
                circularPaths.push({
                    cycle: cyclePath,
                    cycleRefs: cycleRefs,
                    source: node,
                    path: [...currentPath],
                    refs: [...currentRefs]
                });
                return true;
            }
            if (visited.has(node)) {
                return false;
            }
            
            visited.add(node);
            recursionStack.add(node);
            currentPath.push(node);
            
            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                currentRefs.push({
                    from: node,
                    to: neighbor.target,
                    type: neighbor.refType,
                    path: neighbor.path
                });
                
                if (findCycle(neighbor.target, currentPath, currentRefs)) {
                    currentRefs.pop();
                    recursionStack.delete(node);
                    currentPath.pop();
                    return true;
                }
                
                currentRefs.pop();
            }
            
            recursionStack.delete(node);
            currentPath.pop();
            return false;
        };
        
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                findCycle(node);
            }
        }
        
        return {
            count: circularPaths.length,
            paths: circularPaths
        };
    }

    /**
     * 构建对象层次结构
     * @returns {Object} 层次结构
     */
    buildHierarchy() {
        console.log("")
        console.log('分析对象层次结构...');
        
        const hierarchy = {
            root: null,
            levels: [],
            maxDepth: 0
        };
        
        const catalog = this.structure.findObjectsByProperty('Type', 'Catalog')[0];
        if (catalog) {
            hierarchy.root = `${catalog.objectNumber} ${catalog.generation}`;
            this.buildHierarchyLevel(catalog, hierarchy, 0, new Set());
        }
        
        this.structure.relations.hierarchy = hierarchy;
        console.log(`对象层次结构最大深度: ${hierarchy.maxDepth}`);
        console.log("")
        return hierarchy;
    }

    /**
     * 构建层次结构级别
     * @param {Object} obj - 对象
     * @param {Object} hierarchy - 层次结构
     * @param {number} depth - 深度
     * @param {Set} visited - 已访问集合
     */
    buildHierarchyLevel(obj, hierarchy, depth, visited) {
        hierarchy.maxDepth = Math.max(hierarchy.maxDepth, depth);
        
        if (!hierarchy.levels[depth]) {
            hierarchy.levels[depth] = [];
        }
        
        const objRef = `${obj.objectNumber} ${obj.generation}`;
        if (visited.has(objRef)) {
            return; // 防止循环引用
        }
        visited.add(objRef);
        
        hierarchy.levels[depth].push({
            ref: objRef,
            type: obj.type,
            children: []
        });
        
        // 查找子对象
        const children = this.findChildObjects(obj);
        children.forEach(child => {
            const childObj = this.structure.getObjectByRef(child.ref);
            if (childObj) {
                this.buildHierarchyLevel(childObj, hierarchy, depth + 1, visited);
            }
        });
    }

    /**
     * 查找子对象
     * @param {Object} obj - 对象
     * @returns {Array} 子对象列表
     */
    findChildObjects(obj) {
        const children = [];
        
        const findChildren = (value, path = '') => {
            if (typeof value === 'string' && value.includes('Indirect Reference')) {
                const refMatch = value.match(/Indirect Reference \((\d+) (\d+) R\)/);
                if (refMatch) {
                    const targetRef = `${refMatch[1]} ${refMatch[2]}`;
                    const targetObj = this.structure.getObject(parseInt(refMatch[1]), parseInt(refMatch[2]));
                    
                    if (targetObj && this.isChildRelationship(obj, targetObj, path)) {
                        children.push({
                            ref: targetRef,
                            type: targetObj.type,
                            path: path
                        });
                    }
                }
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    findChildren(item, `${path}[${index}]`);
                });
            } else if (typeof value === 'object' && value !== null) {
                Object.keys(value).forEach(key => {
                    findChildren(value[key], path ? `${path}.${key}` : key);
                });
            }
        };
        
        findChildren(obj.properties);
        return children;
    }

    /**
     * 判断是否为父子关系
     * @param {Object} parent - 父对象
     * @param {Object} child - 子对象
     * @param {string} path - 属性路径
     * @returns {boolean}
     */
    isChildRelationship(parent, child, path) {
        const parentType = parent.type;
        const childType = child.type;
        
        // 基本层次关系检查
        if (parentType === 'Catalog' && childType === 'Pages' && path === 'Pages') {
            return true;
        }
        
        if (parentType === 'Pages' && childType === 'Page' && path === 'Kids') {
            return true;
        }
        
        if (parentType === 'Page' && (childType === 'Font' || childType === 'XObject') && path.includes('Resources')) {
            return true;
        }
        
        // === 新增：结构化文档关系 ===
        if (parentType === 'StructTreeRoot' && childType === 'StructElem' && path === 'K') {
            return true;
        }
        
        if (parentType === 'StructElem' && childType === 'StructElem' && path === 'K') {
            return true;
        }
        
        // === 新增：大纲关系 ===
        if (parentType === 'Outlines' && childType === 'Outlines' && (path === 'First' || path === 'Last')) {
            return true;
        }
        
        if (parentType === 'Outlines' && childType === 'Action' && path === 'A') {
            return true;
        }
        
        if (parentType === 'Outlines' && childType === 'Dest' && path === 'Dest') {
            return true;
        }
        
        // === 新增：表单关系 ===
        if (parentType === 'Form' && childType === 'Field' && path === 'Fields') {
            return true;
        }
        
        if (parentType === 'Field' && childType === 'Field' && path === 'Kids') {
            return true;
        }
        
        if (parentType === 'Field' && childType === 'Action' && path === 'A') {
            return true;
        }
        
        // === 新增：页面注释关系 ===
        if (parentType === 'Page' && childType === 'Annot' && path === 'Annots') {
            return true;
        }
        
        if (parentType === 'Annot' && childType === 'Action' && path === 'A') {
            return true;
        }
        
        if (parentType === 'Annot' && childType === 'Dest' && path === 'Dest') {
            return true;
        }
        
        // === 新增：内容流关系 ===
        if (parentType === 'Page' && childType === 'Stream' && path === 'Contents') {
            return true;
        }
        
        if (parentType === 'Pages' && childType === 'Stream' && path === 'Contents') {
            return true;
        }
        
        // === 新增：资源关系 ===
        if (parentType === 'Page' && childType === 'Font' && path.includes('Resources.Fonts')) {
            return true;
        }
        
        if (parentType === 'Page' && childType === 'XObject' && path.includes('Resources.XObject')) {
            return true;
        }
        
        if (parentType === 'Page' && childType === 'ColorSpace' && path.includes('Resources.ColorSpace')) {
            return true;
        }
        
        if (parentType === 'Page' && childType === 'Pattern' && path.includes('Resources.Pattern')) {
            return true;
        }
        
        if (parentType === 'Page' && childType === 'Shading' && path.includes('Resources.Shading')) {
            return true;
        }
        
        if (parentType === 'Page' && childType === 'ExtGState' && path.includes('Resources.ExtGState')) {
            return true;
        }
        
        // === 新增：可选内容关系 ===
        if (parentType === 'OCG' && childType === 'OCG' && path === 'OCGs') {
            return true;
        }
        
        if (parentType === 'OCG' && childType === 'Action' && path === 'A') {
            return true;
        }
        
        // === 新增：动作链关系 ===
        if (parentType === 'Action' && childType === 'Action' && path === 'Next') {
            return true;
        }
        
        // === 新增：目标关系 ===
        if (parentType === 'Action' && childType === 'Dest' && path === 'D') {
            return true;
        }
        
        // 通用子关系映射
        const childRelationships = {
            'Catalog': ['Pages', 'Outlines', 'Metadata', 'StructTreeRoot', 'AcroForm'],
            'Pages': ['Page'],
            'Page': ['Font', 'XObject', 'Stream', 'Annot', 'ColorSpace', 'Pattern', 'Shading', 'ExtGState'],
            'Form': ['Field', 'Font', 'XObject'],
            'Field': ['Field', 'Action'],
            'StructTreeRoot': ['StructElem'],
            'StructElem': ['StructElem'],
            'Outlines': ['Outlines', 'Action', 'Dest'],
            'Annot': ['Action', 'Dest'],
            'OCG': ['OCG', 'Action'],
            'Action': ['Action', 'Dest'],
            'Page': ['Stream', 'Font', 'XObject', 'Annot', 'ColorSpace', 'Pattern', 'Shading', 'ExtGState']
        };
        
        return childRelationships[parentType]?.includes(childType) || false;
    }

    /**
     * 分析核心对象
     */
    analyseCoreObjects() {
        console.log("")
        console.log('分析核心对象...');
        
        // 使用PDFStructure的基础功能获取核心对象信息
        const coreObjects = this.structure.getCoreObjectsInfo();
        
        // 设置到逻辑结构中
        this.structure.logical.catalog = coreObjects.catalog;
        this.structure.logical.pages = coreObjects.pages;
        this.structure.logical.pageObjects = coreObjects.pageObjects;
        this.structure.logical.fonts = coreObjects.fontObjects;
        this.structure.logical.streams = coreObjects.streamObjects;
        this.structure.logical.xObjects = coreObjects.xObjectObjects;
        this.structure.logical.annotations = coreObjects.annotationObjects;
        this.structure.logical.actions = coreObjects.actionObjects;
        this.structure.logical.destinations = coreObjects.destObjects;
        this.structure.logical.metadata = coreObjects.metadataObjects[0] || null;
        
        // 输出日志
        if (coreObjects.catalog) {
            console.log('找到 Catalog 对象:', coreObjects.catalog.objectNumber);
        }
        if (coreObjects.pages) {
            console.log('找到 Pages 对象:', coreObjects.pages.objectNumber);
        }
        console.log(`找到 ${coreObjects.pageObjects.length} 个 Page 对象`);
        console.log(`找到 ${coreObjects.fontObjects.length} 个 Font 对象`);
        console.log(`找到 ${coreObjects.streamObjects.length} 个 Stream 对象`);
        console.log(`找到 ${coreObjects.xObjectObjects.length} 个 XObject 对象`);
        console.log(`找到 ${coreObjects.annotationObjects.length} 个 Annot 对象`);
        console.log(`找到 ${coreObjects.actionObjects.length} 个 Action 对象`);
        console.log(`找到 ${coreObjects.destObjects.length} 个 Dest 对象`);
        if (coreObjects.metadataObjects.length > 0) {
            console.log(`找到 ${coreObjects.metadataObjects.length} 个 Metadata 对象`);
        }
        console.log("")
    }

    /**
     * 生成统计信息
     * @returns {Object} 统计信息
     */
    generateStats() {
        console.log("")
        console.log('生成对象统计信息...');
        
        // 使用PDFStructure的基础功能获取统计信息
        const typeStats = this.structure.getTypeStats();
        const streamStats = this.structure.getStreamStats();
        
        // 嵌套统计
        const nestedStats = {
            total: 0,
            maxDepth: this.structure.relations.hierarchy ? this.structure.relations.hierarchy.maxDepth : 0,
            avgDepth: 0
        };
        
        // 设置统计信息
        this.structure.stats.types = typeStats;
        this.structure.stats.streams = streamStats;
        this.structure.stats.nested = nestedStats;
        
        console.log('对象统计信息:', this.structure.stats);
        console.log("")
        return this.structure.stats;
    }

    /**
     * 验证PDF文件结构（header、body、xref、trailer）
     * @returns {Object} 结构验证结果
     */
    validatePDFStructure() {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            header: { isValid: false, errors: [] },
            body: { isValid: false, errors: [] },
            xref: { isValid: false, errors: [] },
            trailer: { isValid: false, errors: [] }
        };

        // 1. 检查Header
        console.log('检查PDF Header...');
        if (this.structure.physical.header) {
            const header = this.structure.physical.header;
            
            // 检查版本格式
            if (header.version && /^\d+\.\d+$/.test(header.version)) {
                result.header.isValid = true;
            } else {
                result.header.errors.push(this.createMessage('HEADER_VERSION_INVALID', 'Header版本格式不正确', `当前版本: ${header.version || 'undefined'}`));
                result.header.isValid = false;
            }
            
            // 检查是否包含%PDF标识
            if (header.rawContent && header.rawContent.includes('%PDF')) {
                result.header.isValid = result.header.isValid && true;
            } else {
                result.header.errors.push(this.createMessage('HEADER_PDF_MISSING', 'Header缺少%PDF标识', 'PDF文件必须以%PDF标识开头'));
                result.header.isValid = false;
            }
        } else {
            result.header.errors.push(this.createMessage('HEADER_MISSING', '缺少PDF Header', 'PDF文件结构不完整，缺少头部信息'));
            result.header.isValid = false;
        }

        // 2. 检查Body
        console.log('检查PDF Body...');
        if (this.structure.physical.objects && this.structure.physical.objects.length > 0) {
            result.body.isValid = true;
            
            // 检查对象编号的有效性（应该是非负整数）
            const invalidObjectNumbers = this.structure.physical.objects.filter(obj => 
                typeof obj.objectNumber !== 'number' || 
                obj.objectNumber < 0 || 
                !Number.isInteger(obj.objectNumber)
            );
            
            if (invalidObjectNumbers.length > 0) {
                result.body.errors.push(this.createMessage('BODY_INVALID_OBJECT_NUMBERS', 'Body中存在无效的对象编号', `无效编号: ${invalidObjectNumbers.map(obj => obj.objectNumber).join(', ')}`));
                result.body.isValid = false;
            }
            
            // 检查是否有重复的对象编号
            const objectNumbers = this.structure.physical.objects.map(obj => obj.objectNumber);
            const duplicateNumbers = objectNumbers.filter((num, index) => objectNumbers.indexOf(num) !== index);
            const uniqueDuplicates = [...new Set(duplicateNumbers)];
            
            if (uniqueDuplicates.length > 0) {
                result.body.errors.push(this.createMessage('BODY_DUPLICATE_OBJECT_NUMBERS', 'Body中存在重复的对象编号', `重复编号: ${uniqueDuplicates.join(', ')}`));
                result.body.isValid = false;
            }
        } else {
            result.body.errors.push(this.createMessage('BODY_NO_OBJECTS', 'Body中没有找到对象', 'PDF文件必须包含至少一个对象'));
            result.body.isValid = false;
        }

        // 3. 检查XRef
        console.log('检查PDF XRef...');
        if (this.structure.physical.xref) {
            const xref = this.structure.physical.xref;
            
            if (xref.isValid) {
                result.xref.isValid = true;
                
                // 检查xref条目的有效性
                if (xref.entries && xref.entries.length > 0) {
                    // 检查是否有无效的条目格式
                    const invalidEntries = xref.entries.filter(entry => 
                        typeof entry.objectNumber !== 'number' || 
                        entry.objectNumber < 0 ||
                        typeof entry.generation !== 'number' ||
                        entry.generation < 0 ||
                        entry.generation > 65535
                    );
                    
                    if (invalidEntries.length > 0) {
                        result.xref.errors.push(this.createMessage('XREF_INVALID_ENTRIES', `XRef中存在${invalidEntries.length}个无效条目格式`, 'XRef条目必须包含有效的对象编号、生成号和偏移量'));
                        result.xref.isValid = false;
                    }
                    
                    // 检查是否有重复的对象编号
                    const objectNumbers = xref.entries.map(entry => entry.objectNumber);
                    const duplicateNumbers = objectNumbers.filter((num, index) => objectNumbers.indexOf(num) !== index);
                    const uniqueDuplicates = [...new Set(duplicateNumbers)];
                    
                    if (uniqueDuplicates.length > 0) {
                        result.xref.errors.push(this.createMessage('XREF_DUPLICATE_OBJECT_NUMBERS', 'XRef中存在重复的对象编号', `重复编号: ${uniqueDuplicates.join(', ')}`));
                        result.xref.isValid = false;
                    }
                }
            } else {
                result.xref.errors.push(this.createMessage('XREF_INVALID_FORMAT', 'XRef格式不正确', 'XRef表必须包含有效的条目格式'));
                result.xref.isValid = false;
            }
        } else {
            result.xref.errors.push(this.createMessage('XREF_MISSING', '缺少XRef表', 'PDF文件必须包含交叉引用表'));
            result.xref.isValid = false;
        }

        // 4. 检查Trailer
        console.log('检查PDF Trailer...');
        if (this.structure.physical.trailer) {
            const trailer = this.structure.physical.trailer;
            
            if (trailer.isValid) {
                result.trailer.isValid = true;
                
                // 检查必需属性
                const requiredProps = ['Root', 'Size'];
                requiredProps.forEach(prop => {
                    if (!trailer.properties || !trailer.properties[prop]) {
                        result.trailer.errors.push(this.createMessage('TRAILER_MISSING_REQUIRED_PROP', `Trailer缺少必需属性: ${prop}`, `Trailer必须包含${prop}属性`));
                        result.trailer.isValid = false;
                    }
                });
                
                // 检查Root引用是否有效
                if (trailer.properties?.Root) {
                    const rootRef = trailer.properties.Root;
                    if (typeof rootRef === 'string' && rootRef.includes('Indirect Reference')) {
                        const refMatch = rootRef.match(/Indirect Reference \((\d+) (\d+) R\)/);
                        if (refMatch) {
                            const rootObj = this.structure.getObject(parseInt(refMatch[1]), parseInt(refMatch[2]));
                            if (!rootObj) {
                                result.trailer.errors.push(this.createMessage('TRAILER_ROOT_REF_INVALID', 'Trailer中的Root引用指向不存在的对象', `Root引用: ${rootRef}`));
                                result.trailer.isValid = false;
                            }
                        }
                    }
                }
                
                // === 新增：验证Size值 ===
                if (trailer.properties?.Size) {
                    const size = trailer.properties.Size;
                    if (typeof size === 'number') {
                        // 计算最大对象编号
                        const maxObjectNumber = Math.max(...this.structure.physical.objects.map(obj => obj.objectNumber));
                        const expectedSize = maxObjectNumber + 1;
                        
                        if (size !== expectedSize) {
                            result.trailer.errors.push(this.createMessage('TRAILER_SIZE_INCORRECT', `Trailer中的Size值(${size})不正确，应该是最大对象编号+1(${expectedSize})`, `当前Size: ${size}, 期望Size: ${expectedSize}`));
                            result.trailer.isValid = false;
                        }
                    } else {
                        result.trailer.errors.push(this.createMessage('TRAILER_SIZE_TYPE_INVALID', 'Trailer中的Size值类型不正确（应为数字）', `当前类型: ${typeof size}`));
                        result.trailer.isValid = false;
                    }
                }
                
                // === 新增：验证startxref值 ===
                if (trailer.startxref !== undefined && trailer.startxref !== null) {
                    let startxref = trailer.startxref;
                    
                    // 检查startxref是否是16进制格式
                    if (typeof startxref === 'string' && startxref.match(/^[0-9A-Fa-f]+$/)) {
                        // 先尝试按十进制解析
                        const decimalValue = parseInt(startxref, 10);
                        const hexValue = parseInt(startxref, 16);
                        
                        // 如果十进制值合理（小于文件大小），使用十进制
                        // 如果十进制值不合理但16进制值合理，使用16进制
                        if (decimalValue < this.structure.physical.fileSize) {
                            startxref = decimalValue;
                            console.log(`startxref按十进制解析: ${trailer.startxref} -> ${startxref}`);
                        } else if (hexValue < this.structure.physical.fileSize) {
                            startxref = hexValue;
                            console.log(`startxref按16进制解析: ${trailer.startxref} -> ${startxref}`);
                        } else {
                            result.trailer.errors.push(this.createMessage('TRAILER_STARTXREF_OUT_OF_RANGE', `Trailer中的startxref值(${trailer.startxref})超出文件大小(${this.structure.physical.fileSize})`, `startxref: ${trailer.startxref}, 文件大小: ${this.structure.physical.fileSize}`));
                            result.trailer.isValid = false;
                            return result;
                        }
                    } else if (typeof startxref === 'number') {
                        // 已经是数字格式
                        startxref = startxref;
                    } else {
                        result.trailer.errors.push(this.createMessage('TRAILER_STARTXREF_FORMAT_INVALID', 'Trailer中的startxref值格式不正确', `当前值: ${trailer.startxref}`));
                        result.trailer.isValid = false;
                        return result;
                    }
                    
                    if (startxref >= 0) {
                        // 检查startxref是否指向xref的起始位置
                        if (this.structure.physical.xref && this.structure.physical.xref.startPosition !== null) {
                            const xrefStartPos = this.structure.physical.xref.startPosition;
                                                    if (startxref !== xrefStartPos) {
                            result.trailer.errors.push(this.createMessage('TRAILER_STARTXREF_MISMATCH', `Trailer中的startxref值(${trailer.startxref})不正确，应该指向xref的起始位置(${xrefStartPos})`, `当前startxref: ${startxref}, 期望startxref: ${xrefStartPos}`));
                            result.trailer.isValid = false;
                        }
                    } else {
                        result.trailer.errors.push(this.createMessage('TRAILER_STARTXREF_NO_XREF_POS', '无法获取xref的起始位置，无法验证startxref值', 'XRef表位置信息缺失'));
                        result.trailer.isValid = false;
                    }
                } else {
                    result.trailer.errors.push(this.createMessage('TRAILER_STARTXREF_NEGATIVE', 'Trailer中的startxref值无效（必须是非负整数）', `当前值: ${startxref}`));
                    result.trailer.isValid = false;
                }
            } else {
                result.trailer.errors.push(this.createMessage('TRAILER_STARTXREF_MISSING', 'Trailer中缺少startxref值', 'Trailer必须包含startxref属性'));
                result.trailer.isValid = false;
            }
                
                // 检查Info引用（如果存在）
                if (trailer.properties?.Info) {
                    const infoRef = trailer.properties.Info;
                    if (typeof infoRef === 'string' && infoRef.includes('Indirect Reference')) {
                        const refMatch = infoRef.match(/Indirect Reference \((\d+) (\d+) R\)/);
                        if (refMatch) {
                            const infoObj = this.structure.getObject(parseInt(refMatch[1]), parseInt(refMatch[2]));
                            if (!infoObj) {
                                result.trailer.errors.push(this.createMessage('TRAILER_INFO_REF_INVALID', 'Trailer中的Info引用指向不存在的对象', `Info引用: ${infoRef}`));
                                result.trailer.isValid = false;
                            }
                        }
                    }
                }
                
                // 检查ID属性（如果存在）
                if (trailer.properties?.ID) {
                    const id = trailer.properties.ID;
                    
                    // ID应该是PDF数组格式，包含两个字符串元素
                    if (Array.isArray(id) && id.length === 2) {
                        // 检查每个元素是否为字符串
                        const isValidElement = (element) => {
                            return typeof element === 'string' && element.length > 0;
                        };
                        
                        if (!isValidElement(id[0]) || !isValidElement(id[1])) {
                            result.trailer.errors.push(this.createMessage('TRAILER_ID_FORMAT_INVALID', 'Trailer中的ID属性格式不正确（应为两个字符串的数组）', `当前ID: ${JSON.stringify(id)}`));
                            result.trailer.isValid = false;
                        }
                    } else {
                        result.trailer.errors.push(this.createMessage('TRAILER_ID_TYPE_INVALID', 'Trailer中的ID属性格式不正确（应为PDF数组格式）', `当前类型: ${typeof id}, 值: ${JSON.stringify(id)}`));
                        result.trailer.isValid = false;
                    }
                }
                
                // 检查Encrypt属性（如果存在）
                if (trailer.properties?.Encrypt) {
                    const encryptRef = trailer.properties.Encrypt;
                    if (typeof encryptRef === 'string' && encryptRef.includes('Indirect Reference')) {
                        const refMatch = encryptRef.match(/Indirect Reference \((\d+) (\d+) R\)/);
                        if (refMatch) {
                            const encryptObj = this.structure.getObject(parseInt(refMatch[1]), parseInt(refMatch[2]));
                            if (!encryptObj) {
                                result.trailer.errors.push(this.createMessage('TRAILER_ENCRYPT_REF_INVALID', 'Trailer中的Encrypt引用指向不存在的对象', `Encrypt引用: ${encryptRef}`));
                                result.trailer.isValid = false;
                            }
                        }
                    }
                    
                    // === 新增：当Encrypt存在时，ID必须存在 ===
                    if (!trailer.properties?.ID) {
                        result.trailer.errors.push(this.createMessage('TRAILER_ENCRYPT_NO_ID', '当Trailer中存在Encrypt属性时，ID属性也必须存在', '加密PDF必须包含ID属性'));
                        result.trailer.isValid = false;
                    }
                }
            } else {
                result.trailer.errors.push(this.createMessage('TRAILER_FORMAT_INVALID', 'Trailer格式不正确', 'Trailer必须包含有效的PDF字典格式'));
                result.trailer.isValid = false;
            }
        } else {
            result.trailer.errors.push(this.createMessage('TRAILER_MISSING', '缺少Trailer', 'PDF文件必须包含Trailer部分'));
            result.trailer.isValid = false;
        }

        // 汇总结果
        result.isValid = result.header.isValid && result.body.isValid && result.xref.isValid && result.trailer.isValid;
        
        // 收集所有错误和警告
        [result.header, result.body, result.xref, result.trailer].forEach(section => {
            section.errors.forEach(error => {
                if (typeof error === 'string') {
                    result.errors.push(this.createMessage('STRUCTURE_ERROR', error, `${section.constructor.name} 结构错误`));
                } else {
                    result.errors.push(error);
                }
            });
        });

        console.log(`PDF结构验证完成: ${result.isValid ? '有效' : '无效'}`);
        console.log("====")
        if (!result.isValid) {
            console.log('结构错误:');
            result.errors.forEach(error => console.log(`  - ${error}`));
        }

        return result;
    }

    /**
     * 验证单个对象的必需属性
     * @param {Object} obj - PDF对象
     * @returns {Object} 验证结果
     */
    validateObject(obj) {
        const result = {
            objectNumber: obj.objectNumber,
            type: obj.type,
            subtype: obj.properties?.Subtype || null,
            isValid: true,
            missingRequired: [],
            unknownType: false,
            unknownSubtype: false,
            errors: []
        };

        // 获取PDFStructure类
        let PDFStructureClass;
        if (typeof window !== 'undefined') {
            PDFStructureClass = window.PDFStructure;
        } else if (typeof require !== 'undefined') {
            PDFStructureClass = require('./pdf-struct.js');
        } else {
            PDFStructureClass = PDFStructure;
        }
        
        // 获取对象类型的必需属性配置
        const requirements = PDFStructureClass.OBJECT_REQUIREMENTS[obj.type];
        
        if (!requirements) {
            result.unknownType = true;
            // 对于unknown类型，只做语法检查，不强制要求Type属性
            // 只检查基本的PDF对象语法结构
            if (obj.properties && typeof obj.properties === 'object') {
                // 语法检查：确保属性是有效的PDF对象结构
                for (const [key, value] of Object.entries(obj.properties)) {
                    if (typeof key !== 'string' || key.length === 0) {
                        result.errors.push(this.createMessage('OBJECT_INVALID_PROPERTY_NAME', `无效的属性名: ${key}`, `对象 ${obj.objectNumber} 包含无效属性名`));
                        result.isValid = false;
                    }
                }
            }
            return result;
        }

        // 检查是否有Subtype，如果有则进行Subtype特定验证
        if (obj.properties?.Subtype && PDFStructureClass.SUB_TYPE_MAP[obj.type]) {
            const subtypeInfo = PDFStructureClass.SUB_TYPE_MAP[obj.type][obj.properties.Subtype];
            
            if (subtypeInfo) {
                // 使用Subtype特定的必需属性
                result.subtype = obj.properties.Subtype;
                result.subtypeDescription = subtypeInfo.description;
                
                subtypeInfo.required.forEach(prop => {
                    if (!obj.properties || !obj.properties.hasOwnProperty(prop)) {
                        result.missingRequired.push(prop);
                        result.isValid = false;
                    }
                });
            } else {
                // Subtype未知
                result.unknownSubtype = true;
                result.errors.push(this.createMessage('OBJECT_UNKNOWN_SUBTYPE', `未知Subtype: ${obj.type}/${obj.properties.Subtype}`, `对象 ${obj.objectNumber} 包含未知的Subtype`));
            }
        } else {
            // 没有Subtype或该类型没有Subtype定义，使用通用验证
            requirements.required.forEach(prop => {
                if (!obj.properties || !obj.properties.hasOwnProperty(prop)) {
                    result.missingRequired.push(prop);
                    result.isValid = false;
                }
            });
        }

        if (result.missingRequired.length > 0) {
            result.errors.push(this.createMessage('OBJECT_MISSING_REQUIRED_PROPS', `缺少必需属性: ${result.missingRequired.join(', ')}`, `对象 ${obj.objectNumber} 缺少必需属性`));
        }

        return result;
    }

    /**
     * 验证所有对象的必需属性
     */
    validateAllObjects() {
        const results = {
            total: this.structure.physical.objects.length,
            valid: 0,
            invalid: 0,
            unknownTypes: 0,
            unknownSubtypes: 0,
            objectResults: [],
            typeStats: {},
            subtypeStats: {},
            errors: []
        };

        this.structure.physical.objects.forEach(obj => {
            const validation = this.validateObject(obj);
            results.objectResults.push(validation);
            
            if (validation.isValid) {
                results.valid++;
            } else {
                results.invalid++;
            }
            
            if (validation.unknownType) {
                results.unknownTypes++;
            }

            if (validation.unknownSubtype) {
                results.unknownSubtypes++;
            }

            // 统计类型
            if (!results.typeStats[obj.type]) {
                results.typeStats[obj.type] = { total: 0, valid: 0, invalid: 0 };
            }
            results.typeStats[obj.type].total++;
            if (validation.isValid) {
                results.typeStats[obj.type].valid++;
            } else {
                results.typeStats[obj.type].invalid++;
            }

            // 统计Subtype
            if (validation.subtype) {
                const subtypeKey = `${obj.type}/${validation.subtype}`;
                if (!results.subtypeStats[subtypeKey]) {
                    results.subtypeStats[subtypeKey] = { total: 0, valid: 0, invalid: 0 };
                }
                results.subtypeStats[subtypeKey].total++;
                if (validation.isValid) {
                    results.subtypeStats[subtypeKey].valid++;
                } else {
                    results.subtypeStats[subtypeKey].invalid++;
                }
            }

            // 收集错误
            validation.errors.forEach(error => {
                if (typeof error === 'string') {
                    results.errors.push(this.createMessage('OBJECT_VALIDATION_ERROR', `对象 ${obj.objectNumber}: ${error}`, `对象 ${obj.objectNumber} 验证失败`));
                } else {
                    results.errors.push(error);
                }
            });
        });

        return results;
    }

    /**
     * 验证Cross-reference table
     * @returns {Object} xref验证结果
     */
    validateXRef() {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            totalEntries: 0,
            validEntries: 0,
            invalidEntries: 0,
            missingObjects: [],
            offsetMismatches: [],
            generationMismatches: [],
            duplicateEntries: [],
            freeEntryChainErrors: [],
            details: []
        };
        
        // 检查是否有xref信息
        if (!this.structure.physical.xref || !this.structure.physical.xref.entries) {
            result.errors.push(this.createMessage('XREF_MISSING_OR_INVALID', 'Cross-reference table不存在或无效', 'PDF文件必须包含有效的交叉引用表'));
            result.isValid = false;
            return result;
        }
        
        const xrefEntries = this.structure.physical.xref.entries;
        result.totalEntries = xrefEntries.length;
    
        console.log(`验证 ${xrefEntries.length} 个xref条目`);
        
        // 检查重复条目
        const objectNumberMap = new Map();
        const duplicates = [];
        
        xrefEntries.forEach((entry, index) => {
            if (objectNumberMap.has(entry.objectNumber)) {
                const existingEntry = objectNumberMap.get(entry.objectNumber);
                duplicates.push({
                    objectNumber: entry.objectNumber,
                    firstEntry: existingEntry,
                    duplicateEntry: entry,
                    firstIndex: existingEntry.index,
                    duplicateIndex: index
                });
            } else {
                objectNumberMap.set(entry.objectNumber, { ...entry, index });
            }
        });
        
        if (duplicates.length > 0) {
            result.duplicateEntries = duplicates;
            result.errors.push(this.createMessage('XREF_DUPLICATE_ENTRIES', `${duplicates.length}个对象编号有重复条目`, `重复的对象编号: ${duplicates.map(d => d.objectNumber).join(', ')}`));
            result.isValid = false;
        }
        
        // 验证free entry链表
        const freeEntries = xrefEntries.filter(entry => !entry.inUse);
        const freeEntryChainErrors = this.validateFreeEntryChain(freeEntries, xrefEntries);
        
        if (freeEntryChainErrors.length > 0) {
            result.freeEntryChainErrors = freeEntryChainErrors;
            result.errors.push(this.createMessage('XREF_FREE_ENTRY_CHAIN_ERRORS', `${freeEntryChainErrors.length}个free entry链表错误`, 'Free entry链表结构不正确'));
            result.isValid = false;
        }
        
        xrefEntries.forEach(entry => {
            const detail = {
                objectNumber: entry.objectNumber,
                offset: entry.offset,
                generation: entry.generation,
                inUse: entry.inUse,
                isValid: true,
                issues: []
            };
            
            // 1. 检查对象是否存在
            const obj = this.structure.getObject(entry.objectNumber, entry.generation);
            
            // 特殊处理对象0：如果生成号是65535，表示已被删除且不再重用
            if (entry.objectNumber === 0 && entry.generation === 65535) {
                if (obj) {
                    detail.isValid = false;
                    detail.issues.push('对象0已被删除(生成号65535)但实际存在');
                    result.missingObjects.push(entry.objectNumber);
                    result.invalidEntries++;
                } else {
                    result.validEntries++;
                    // 对象0不存在是正确的，因为生成号65535表示已被删除
                }
            } else if (!obj) {
                detail.isValid = false;
                detail.issues.push('对象不存在');
                result.missingObjects.push(entry.objectNumber);
                result.invalidEntries++;
            } else {
                result.validEntries++;
                
                // 2. 检查offset是否正确
                // 注意：我们的解析器是按顺序解析的，计算出的offset可能与xref中的不同
                // 这里我们只检查offset是否在合理范围内，而不是直接比较
                if (entry.offset !== null && obj.offset !== null) {
                    const offsetDiff = Math.abs(entry.offset - obj.offset);
                    // 如果offset差异过大（超过1000字节），可能是解析问题
                    if (offsetDiff > 1000) {
                        detail.isValid = false;
                        detail.issues.push(`offset差异过大: xref=${entry.offset}, actual=${obj.offset}, 差异=${offsetDiff}`);
                        result.offsetMismatches.push({
                            objectNumber: entry.objectNumber,
                            xrefOffset: entry.offset,
                            actualOffset: obj.offset,
                            difference: offsetDiff
                        });
                    }
                }
                
                // 3. 检查generation是否匹配
                if (obj.generation !== entry.generation) {
                    detail.isValid = false;
                    detail.issues.push(`generation不匹配: xref=${entry.generation}, actual=${obj.generation}`);
                    result.generationMismatches.push({
                        objectNumber: entry.objectNumber,
                        xrefGeneration: entry.generation,
                        actualGeneration: obj.generation
                    });
                }
                
                // 4. 检查inUse标志是否合理
                if (entry.inUse && !obj) {
                    detail.isValid = false;
                    detail.issues.push('标记为使用中但对象不存在');
                }
                
                if (!entry.inUse && obj) {
                    detail.warnings.push('标记为未使用但对象存在');
                }
            }
            
            result.details.push(detail);
            
            if (!detail.isValid) {
                result.isValid = false;
            }
        });
        
        // 生成汇总信息
        if (result.missingObjects.length > 0) {
            result.errors.push(this.createMessage('XREF_MISSING_OBJECTS', `${result.missingObjects.length}个对象在xref中存在但实际不存在`, `缺失的对象编号: ${result.missingObjects.join(', ')}`));
        }
        
        if (result.offsetMismatches.length > 0) {
            result.errors.push(this.createMessage('XREF_OFFSET_MISMATCHES', `${result.offsetMismatches.length}个对象的offset不匹配`, `Offset不匹配的对象: ${result.offsetMismatches.map(m => m.objectNumber).join(', ')}`));
        }
        
        if (result.generationMismatches.length > 0) {
            result.errors.push(this.createMessage('XREF_GENERATION_MISMATCHES', `${result.generationMismatches.length}个对象的generation不匹配`, `Generation不匹配的对象: ${result.generationMismatches.map(m => m.objectNumber).join(', ')}`));
        }
        
        // 检查是否有对象在xref中缺失
        const xrefObjectNumbers = new Set(xrefEntries.map(entry => entry.objectNumber));
        const actualObjectNumbers = new Set(this.structure.physical.objects.map(obj => obj.objectNumber));
        
        const missingInXref = [];
        actualObjectNumbers.forEach(objNum => {
            if (!xrefObjectNumbers.has(objNum)) {
                missingInXref.push(objNum);
            }
        });
        
        if (missingInXref.length > 0) {
            result.warnings.push(this.createMessage('XREF_MISSING_IN_XREF', `${missingInXref.length}个对象在xref中缺失: ${missingInXref.join(', ')}`, '某些对象在XRef表中缺失'));
        }
        
        console.log(`XRef验证完成: ${result.validEntries}/${result.totalEntries} 个条目有效`);
        console.log(`  有效条目: ${result.validEntries}`);
        console.log(`  无效条目: ${result.invalidEntries}`);
        console.log(`  缺失对象: ${result.missingObjects.length}`);
        console.log(`  Offset差异过大: ${result.offsetMismatches.length}`);
        console.log(`  Generation不匹配: ${result.generationMismatches.length}`);
        console.log(`  重复条目: ${result.duplicateEntries.length}`);
        console.log(`  Free entry链表错误: ${result.freeEntryChainErrors.length}`);
        
        // 打印验证失败的详细信息
        if (result.invalidEntries > 0) {
            console.log('\n==== XRef验证失败的条目详情 ====');
            
            // 打印缺失对象的详细信息
            if (result.missingObjects.length > 0) {
                console.log('\n--- 缺失对象 ---');
                result.missingObjects.forEach(objNum => {
                    const xrefEntry = xrefEntries.find(entry => entry.objectNumber === objNum);
                    if (xrefEntry) {
                        if (objNum === 0 && xrefEntry.generation === 65535) {
                            console.log(`  对象 ${objNum}: xref中offset=${xrefEntry.offset}, generation=${xrefEntry.generation}, inUse=${xrefEntry.inUse} - 已被删除且不再重用`);
                        } else {
                            console.log(`  对象 ${objNum}: xref中offset=${xrefEntry.offset}, generation=${xrefEntry.generation}, inUse=${xrefEntry.inUse} - 但对象不存在`);
                        }
                    }
                });
            }
            
            // 打印offset差异过大的详细信息
            if (result.offsetMismatches.length > 0) {
                console.log('\n--- Offset差异过大 ---');
                result.offsetMismatches.forEach(mismatch => {
                    const obj = this.structure.getObject(mismatch.objectNumber, 0);
                    console.log(`  对象 ${mismatch.objectNumber}: xref中offset=${mismatch.xrefOffset}, 实际offset=${mismatch.actualOffset}, 差异=${mismatch.difference}`);
                });
            }
            
            // 打印generation不匹配的详细信息
            if (result.generationMismatches.length > 0) {
                console.log('\n--- Generation不匹配 ---');
                result.generationMismatches.forEach(mismatch => {
                    console.log(`  对象 ${mismatch.objectNumber}: xref中generation=${mismatch.xrefGeneration}, 实际generation=${mismatch.actualGeneration}`);
                });
            }
            
            // 打印重复条目的详细信息
            if (result.duplicateEntries.length > 0) {
                console.log('\n--- 重复条目 ---');
                result.duplicateEntries.forEach(duplicate => {
                    console.log(`  对象 ${duplicate.objectNumber}:`);
                    console.log(`    第一次出现: 位置${duplicate.firstIndex}, offset=${duplicate.firstEntry.offset}, generation=${duplicate.firstEntry.generation}, inUse=${duplicate.firstEntry.inUse}`);
                    console.log(`    重复出现: 位置${duplicate.duplicateIndex}, offset=${duplicate.duplicateEntry.offset}, generation=${duplicate.duplicateEntry.generation}, inUse=${duplicate.duplicateEntry.inUse}`);
                });
            }
            
            // 打印free entry链表错误的详细信息
            if (result.freeEntryChainErrors.length > 0) {
                console.log('\n--- Free Entry链表错误 ---');
                result.freeEntryChainErrors.forEach(error => {
                    console.log(`  ${error}`);
                });
            }
            
            // 打印所有验证失败的条目详情
            console.log('\n--- 所有验证失败的条目 ---');
            result.details.filter(detail => !detail.isValid).forEach(detail => {
                console.log(`  对象 ${detail.objectNumber}:`);
                console.log(`    xref信息: offset=${detail.offset}, generation=${detail.generation}, inUse=${detail.inUse}`);
                if (detail.issues && detail.issues.length > 0) {
                    detail.issues.forEach(issue => {
                        console.log(`    问题: ${issue}`);
                    });
                }
                if (detail.warnings && detail.warnings.length > 0) {
                    detail.warnings.forEach(warning => {
                        console.log(`    警告: ${warning}`);
                    });
                }
            });
            
            console.log('==== XRef验证失败详情结束 ====\n');
        }
        
        return result;
    }

    /**
     * 验证free entry链表
     * @param {Array} freeEntries - free entry数组
     * @param {Array} allEntries - 所有xref条目
     * @returns {Array} 错误列表
     */
    validateFreeEntryChain(freeEntries, allEntries) {
        const errors = [];
        
        // 检查对象0是否为空闲状态且生成号为65535
        const object0Entry = allEntries.find(entry => entry.objectNumber === 0);
        if (!object0Entry) {
            errors.push(this.createMessage('FREE_ENTRY_OBJECT0_MISSING', '对象0在xref中不存在', '对象0必须存在于XRef表中作为free entry链表的头节点'));
            return errors;
        }
        
        if (object0Entry.inUse) {
            errors.push(this.createMessage('FREE_ENTRY_OBJECT0_IN_USE', '对象0应该是空闲状态', '对象0必须标记为未使用状态'));
        }
        
        if (object0Entry.generation !== 65535) {
            errors.push(this.createMessage('FREE_ENTRY_OBJECT0_GENERATION', '对象0的生成号应该是65535', `当前生成号: ${object0Entry.generation}`));
        }
        
        // 对象0的生成号65535表示已被删除且不再重用，这是正常的
        // 不需要检查对象0是否实际存在，因为删除的对象不应该存在
        
        // 验证free entry链表
        const visited = new Set();
        let currentObject = 0;
        let chainLength = 0;
        const maxChainLength = allEntries.length; // 防止无限循环
        
        while (currentObject !== null && chainLength < maxChainLength) {
            if (visited.has(currentObject)) {
                if (currentObject !== 0) {
                    errors.push(this.createMessage('FREE_ENTRY_CIRCULAR_CHAIN', `free entry链表形成循环，在对象${currentObject}处循环`, `循环路径: ${Array.from(visited).join(' -> ')} -> ${currentObject}`));
                }
                break;
            }
            
            visited.add(currentObject);
            const currentEntry = allEntries.find(entry => entry.objectNumber === currentObject);
            
            if (!currentEntry) {
                errors.push(this.createMessage('FREE_ENTRY_OBJECT_MISSING', `对象${currentObject}在xref中不存在`, `对象${currentObject}在free entry链表中但不在XRef表中`));
                break;
            }
            
            if (currentEntry.inUse) {
                errors.push(this.createMessage('FREE_ENTRY_OBJECT_IN_USE', `对象${currentObject}应该是空闲状态，但标记为使用中`, `对象${currentObject}的状态不正确`));
                break;
            }
            
            // 检查生成号规则
            if (currentObject === 0) {
                if (currentEntry.generation !== 65535) {
                    errors.push(this.createMessage('FREE_ENTRY_OBJECT0_GENERATION_IN_CHAIN', '对象0的生成号应该是65535', `当前生成号: ${currentEntry.generation}`));
                }
            } else {
                if (currentEntry.generation < 0 || currentEntry.generation > 65535) {
                    errors.push(this.createMessage('FREE_ENTRY_GENERATION_OUT_OF_RANGE', `对象${currentObject}的生成号${currentEntry.generation}超出有效范围(0-65535)`, `对象${currentObject}的生成号无效`));
                }
            }
            
            // 移动到下一个free对象
            currentObject = currentEntry.nextFreeObject;
            chainLength++;
        }
        
        if (chainLength >= maxChainLength) {
            errors.push(this.createMessage('FREE_ENTRY_INFINITE_LOOP', 'free entry链表可能形成无限循环', `链表长度: ${chainLength}, 最大允许长度: ${maxChainLength}`));
        }
        
        // 检查所有free entry是否都在链表中或链接回对象0
        freeEntries.forEach(entry => {
            if (entry.objectNumber === 0) return; // 对象0是头节点
            
            if (!visited.has(entry.objectNumber)) {
                // 检查是否链接回对象0且生成号为65535
                if (entry.nextFreeObject !== 0 || entry.generation !== 65535) {
                    errors.push(this.createMessage('FREE_ENTRY_NOT_IN_CHAIN', `对象${entry.objectNumber}不在free entry链表中，且未正确链接回对象0`, `对象${entry.objectNumber}的nextFreeObject: ${entry.nextFreeObject}, generation: ${entry.generation}`));
                }
            }
        });
        
        return errors;
    }

    /**
     * 验证PDF结构
     * @returns {Object} 验证结果
     */
    validate() {
        console.log("")
        console.log('验证PDF结构...');
        
        this.structure.validation.errors = [];
        this.structure.validation.warnings = [];
        this.structure.validation.issues = [];
        
        // 1. 首先检查PDF结构是否正确（header、body、xref、trailer）
        console.log('检查PDF文件结构...');
        const structureValidation = this.validatePDFStructure();
        
        // 添加结构验证错误
        structureValidation.errors.forEach(error => {
            this.structure.validation.errors.push(error);
        });
        
        // 如果结构验证失败，记录警告
        if (!structureValidation.isValid) {
            this.structure.validation.warnings.push(this.createMessage('STRUCTURE_VALIDATION_FAILED', 'PDF文件结构存在问题', 'PDF文件的基本结构验证失败'));
        }
        
        // 2. 验证所有对象的必需属性
        console.log("")
        console.log('验证所有对象的必需属性...');
        const objectValidation = this.validateAllObjects();
        
        // 添加对象验证错误
        objectValidation.errors.forEach(error => {
            this.structure.validation.errors.push(error);
        });
        
        if (objectValidation.unknownTypes > 0) {
            this.structure.validation.warnings.push(this.createMessage('UNKNOWN_OBJECT_TYPES', `${objectValidation.unknownTypes}个对象类型未知`, '某些对象包含未知的类型信息'));
        }
        
        // 2. 使用PDFStructure的基础功能检查必需对象
        const requiredCheck = this.structure.checkRequiredObjects();
        
        if (!requiredCheck.hasCatalog) {
            this.structure.validation.errors.push(this.createMessage('MISSING_CATALOG', '缺少Catalog对象', 'PDF文件必须包含Catalog对象作为文档根'));
        }
        
        if (!requiredCheck.hasPages) {
            this.structure.validation.errors.push(this.createMessage('MISSING_PAGES', '缺少Pages对象', 'PDF文件必须包含Pages对象来管理页面'));
        }
        
        // 3. 检查无效引用
        console.log("")
        console.log("检查无效引用...")
        const invalidRefs = this.structure.relations.references.filter(ref => !ref.valid);
        if (invalidRefs.length > 0) {
            this.structure.validation.warnings.push(this.createMessage('INVALID_REFERENCES', `发现${invalidRefs.length}个无效引用`, `无效引用数量: ${invalidRefs.length}`));
        }

        // 4. 检查循环引用
        console.log("")
        console.log("检查循环引用...")
        if (this.structure.stats.references.circular > 0) {
            this.structure.validation.warnings.push(this.createMessage('CIRCULAR_REFERENCES', `发现${this.structure.stats.references.circular}个循环引用`, 'PDF文件中存在循环引用关系'));
            
            // 打印循环引用详情
            console.log('\n==== 循环引用详情 ====');
            this.structure.stats.references.circularPaths.forEach((circularPath, index) => {
                console.log(`循环引用 ${index + 1}:`);
                console.log(`  循环路径: ${circularPath.cycle.join(' -> ')}`);
                console.log(`  起始对象: ${circularPath.source}`);
                console.log(`  完整路径: ${circularPath.path.join(' -> ')}`);
                console.log(`  引用类型详情:`);
                circularPath.cycleRefs.forEach((ref, refIndex) => {
                    console.log(`    ${refIndex + 1}. ${ref.from} -> ${ref.to} (${ref.type}: ${ref.path})`);
                });
                console.log('');
            });
        }
        
        // 5. 检查页面对象
        console.log("")
        console.log("检查页面对象...")
        if (!requiredCheck.hasPageObjects) {
            this.structure.validation.warnings.push(this.createMessage('NO_PAGE_OBJECTS', '没有找到页面对象', 'PDF文件可能不包含页面内容'));
        }
        
        // 6. 检查字体对象
        console.log("")
        console.log("检查字体对象...")
        const contentStats = this.structure.getContentStats();
        if (contentStats.fonts === 0) {
            this.structure.validation.warnings.push(this.createMessage('NO_FONT_OBJECTS', '没有找到字体对象', 'PDF文件可能不包含文本内容'));
        }
        
        // 7. 设置验证结果
        this.structure.validation.isValid = this.structure.validation.errors.length === 0;
        
        // 8. 验证Cross-reference table
        console.log("")
        console.log('验证Cross-reference table...');
        const xrefValidation = this.validateXRef();
        this.structure.validation.xrefValidation = xrefValidation;
        
        // 添加xref验证错误和警告
        xrefValidation.errors.forEach(error => {
            if (typeof error === 'string') {
                this.structure.validation.errors.push(this.createMessage('XREF_ERROR', `XRef: ${error}`, 'XRef表验证错误'));
            } else {
                this.structure.validation.errors.push(error);
            }
        });
        
        if (xrefValidation.warnings.length > 0) {
            xrefValidation.warnings.forEach(warning => {
                if (typeof warning === 'string') {
                    this.structure.validation.warnings.push(this.createMessage('XREF_WARNING', `XRef: ${warning}`, 'XRef表验证警告'));
                } else {
                    this.structure.validation.warnings.push(warning);
                }
            });
        }
        
        // 9. 添加详细的对象验证信息
        this.structure.validation.objectValidation = objectValidation;
        
        console.log(`验证完成: ${this.structure.validation.isValid ? '有效' : '无效'}`);
        console.log(`  总对象数: ${objectValidation.total}`);
        console.log(`  有效对象: ${objectValidation.valid}`);
        console.log(`  错误对象: ${objectValidation.invalid}`);
        console.log(`  未知类型: ${objectValidation.unknownTypes}`);
        console.log("")
        return this.structure.validation;
    }

    /**
     * 获取页面信息
     * @returns {Object} 页面信息
     */
    getPageInfo() {
        return this.structure.getPageInfo();
    }

    /**
     * 获取字体信息
     * @returns {Array} 字体信息列表
     */
    getFontInfo() {
        return this.structure.getFontInfo();
    }

    /**
     * 获取图像信息
     * @returns {Array} 图像信息列表
     */
    getImageInfo() {
        return this.structure.getImageInfo();
    }

    /**
     * 导出分析结果
     * @returns {Object} 完整的分析结果
     */
    exportAnalysis() {
        // 使用PDFStructure的基础功能获取信息
        const coreObjects = this.structure.getCoreObjectsInfo();
        const streamInfo = this.structure.getStreamInfo();
        
        return {
            summary: this.getSummary(),
            references: this.structure.relations.references,
            hierarchy: this.structure.relations.hierarchy,
            stats: this.structure.stats,
            validation: this.structure.validation,
            pages: this.getPageInfo(),
            fonts: this.getFontInfo(),
            images: this.getImageInfo(),
            streams: streamInfo,
            coreObjects: {
                catalog: coreObjects.catalog,
                pages: coreObjects.pages,
                pageObjects: coreObjects.pageObjects,
                fonts: coreObjects.fontObjects,
                streams: coreObjects.streamObjects,
                xObjects: coreObjects.xObjectObjects,
                annotations: coreObjects.annotationObjects,
                actions: coreObjects.actionObjects,
                destinations: coreObjects.destObjects,
                metadata: coreObjects.metadataObjects[0] || null
            }
        };
    }

    /**
     * 获取分析摘要
     * @returns {Object} 分析摘要
     */
    getSummary() {
        // 使用PDFStructure的基础功能获取信息
        const fileInfo = this.structure.getFileInfo();
        const contentStats = this.structure.getContentStats();
        
        return {
            version: fileInfo.version,
            totalObjects: fileInfo.totalObjects,
            pages: contentStats.pages,
            fonts: contentStats.fonts,
            images: contentStats.images,
            streams: contentStats.streams,
            references: this.structure.stats.references.total,
            isValid: this.structure.validation.isValid,
            errors: this.structure.validation.errors.length,
            warnings: this.structure.validation.warnings.length,
            maxDepth: this.structure.relations.hierarchy.maxDepth,
            circularRefs: this.structure.stats.references.circular
        };
    }

    /**
     * 获取详细报告
     * @returns {Object} 详细分析报告
     */
    getDetailedReport() {
        // 使用PDFStructure的基础功能获取信息
        const fileInfo = this.structure.getFileInfo();
        const contentStats = this.structure.getContentStats();
        const typeStats = this.structure.getTypeStats();
        
        return {
            fileInfo: {
                version: fileInfo.version,
                fileSize: fileInfo.fileSize,
                totalObjects: fileInfo.totalObjects
            },
            structure: {
                hierarchy: this.structure.relations.hierarchy,
                references: this.structure.stats.references,
                nested: this.structure.stats.nested
            },
            content: {
                pages: this.getPageInfo(),
                fonts: this.getFontInfo(),
                images: this.getImageInfo(),
                streams: contentStats.streams
            },
            validation: {
                isValid: this.structure.validation.isValid,
                errors: this.structure.validation.errors,
                warnings: this.structure.validation.warnings,
                issues: this.structure.validation.issues,
                objectValidation: this.structure.validation.objectValidation || null
            },
            analysis: {
                objectTypes: typeStats,
                referenceMap: this.structure.relations.referencedBy,
                circularReferences: this.structure.relations.circularRefs
            }
        };
    }

    /**
     * 生成JSON格式的分析报告
     * @returns {string} JSON格式的报告
     */
    generateJSONReport() {
        return JSON.stringify(this.exportAnalysis(), null, 2);
    }

    /**
     * 生成文本格式的分析报告
     * @returns {string} 文本格式的报告
     */
    generateTextReport() {
        const summary = this.getSummary();
        let report = '=== PDF 分析报告 ===\n\n';
        
        // 文件信息
        report += '文件信息:\n';
        report += `  版本: ${summary.version}\n`;
        report += `  总对象数: ${summary.totalObjects}\n`;
        report += `  页面数: ${summary.pages}\n`;
        report += `  字体数: ${summary.fonts}\n`;
        report += `  图像数: ${summary.images}\n`;
        report += `  流数: ${summary.streams}\n\n`;
        
        // 引用信息
        report += '引用信息:\n';
        report += `  总引用数: ${summary.references}\n`;
        report += `  循环引用数: ${summary.circularRefs}\n`;
        report += `  最大深度: ${summary.maxDepth}\n\n`;
        
        // 验证信息
        report += '验证信息:\n';
        report += `  是否有效: ${summary.isValid ? '是' : '否'}\n`;
        report += `  错误数: ${summary.errors}\n`;
        report += `  警告数: ${summary.warnings}\n\n`;
        
        // 对象验证详情
        if (this.structure.validation.objectValidation) {
            const objValidation = this.structure.validation.objectValidation;
            report += '对象验证详情:\n';
            report += `  总对象数: ${objValidation.total}\n`;
            report += `  有效对象: ${objValidation.valid}\n`;
            report += `  无效对象: ${objValidation.invalid}\n`;
            report += `  未知类型: ${objValidation.unknownTypes}\n\n`;
            
            // 类型统计
            if (Object.keys(objValidation.typeStats).length > 0) {
                report += '对象类型统计:\n';
                Object.entries(objValidation.typeStats).forEach(([type, stats]) => {
                    report += `  ${type}: ${stats.total}个 (有效:${stats.valid}, 无效:${stats.invalid})\n`;
                });
                report += '\n';
            }
        }
        
        // 错误详情
        if (this.structure.validation.errors.length > 0) {
            report += '错误详情:\n';
            this.structure.validation.errors.forEach(error => {
                report += `  - ${error}\n`;
            });
            report += '\n';
        }
        
        // 警告详情
        if (this.structure.validation.warnings.length > 0) {
            report += '警告详情:\n';
            this.structure.validation.warnings.forEach(warning => {
                report += `  - ${warning}\n`;
            });
            report += '\n';
        }
        
        return report;
    }
}

// 兼容浏览器和Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = PDFAnalyser;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.PDFAnalyser = PDFAnalyser;
}