/**
 * PDF结构类 - 管理PDF的物理结构和逻辑结构
 * 只负责结构定义、存储和设置，不提供验证、分析
 */
class PDFStructure {
    constructor() {
        // 物理结构信息
        this.physical = {
            header: null,           // PDF头部信息
            trailer: null,          // 尾部信息
            xref: null,             // 交叉引用表
            objects: [],            // 所有对象
            objectMap: new Map(),   // 对象映射表
            startXref: 0,           // 交叉引用表起始位置
            fileSize: 0,            // 文件大小
            version: '',            // PDF版本
            encryption: null        // 加密信息
        };

        // 逻辑结构信息
        this.logical = {
            catalog: null,          // 目录对象
            pages: null,            // 页面树
            pageObjects: [],        // 页面对象列表
            outlines: null,         // 大纲
            metadata: null,         // 元数据
            resources: new Map(),   // 资源映射
            fonts: [],              // 字体列表
            images: [],             // 图像列表
            forms: [],              // 表单列表
            annotations: [],        // 注释列表
            bookmarks: [],          // 书签列表
            destinations: [],       // 目标列表
            actions: [],            // 动作列表
            streams: [],            // 流对象列表
            xObjects: []            // 外部对象列表
        };

        // 关系信息（由分析器填充）
        this.relations = {
            references: [],         // 引用关系
            referencedBy: new Map(), // 被引用关系
            nestedObjects: [],      // 嵌套对象
            hierarchy: {            // 层次结构
                root: null,
                levels: [],
                maxDepth: 0
            },
            circularRefs: []        // 循环引用
        };

        // 统计信息（由分析器填充）
        this.stats = {
            total: 0,               // 总对象数
            types: {},              // 类型统计
            references: {           // 引用统计
                total: 0,
                valid: 0,
                invalid: 0,
                circular: 0
            },
            nested: {               // 嵌套统计
                total: 0,
                maxDepth: 0,
                avgDepth: 0
            },
            streams: {              // 流统计
                total: 0,
                totalSize: 0,
                compressed: 0,
                uncompressed: 0
            }
        };

        // 验证信息（由分析器填充）
        this.validation = {
            isValid: false,         // 是否有效
            errors: [],             // 错误列表
            warnings: [],           // 警告列表
            issues: []              // 问题列表
        };
    }

    /**
     * 设置物理结构信息
     * @param {Object} physicalInfo - 物理结构信息
     */
    setPhysicalStructure(physicalInfo) {
        this.physical = { ...this.physical, ...physicalInfo };
        
        // 更新对象映射表
        if (physicalInfo.objects) {
            this.physical.objectMap.clear();
            physicalInfo.objects.forEach(obj => {
                const key = `${obj.objectNumber} ${obj.generation}`;
                this.physical.objectMap.set(key, obj);
            });
        }
        
        this.stats.total = this.physical.objects.length;
    }

    /**
     * 设置逻辑结构信息
     * @param {Object} logicalInfo - 逻辑结构信息
     */
    setLogicalStructure(logicalInfo) {
        this.logical = { ...this.logical, ...logicalInfo };
    }

    /**
     * 设置关系信息
     * @param {Object} relationInfo - 关系信息
     */
    setRelations(relationInfo) {
        this.relations = { ...this.relations, ...relationInfo };
    }

    /**
     * 设置统计信息
     * @param {Object} statsInfo - 统计信息
     */
    setStats(statsInfo) {
        this.stats = { ...this.stats, ...statsInfo };
    }

    /**
     * 添加对象
     * @param {Object} obj - PDF对象
     */
    addObject(obj) {
        this.physical.objects.push(obj);
        const key = `${obj.objectNumber} ${obj.generation}`;
        this.physical.objectMap.set(key, obj);
        this.stats.total++;
    }

    /**
     * 获取对象
     * @param {number} objectNumber - 对象编号
     * @param {number} generation - 生成号
     * @returns {Object|null} 对象或null
     */
    getObject(objectNumber, generation = 0) {
        const key = `${objectNumber} ${generation}`;
        return this.physical.objectMap.get(key) || null;
    }

    /**
     * 获取对象引用
     * @param {string} ref - 对象引用字符串 (如 "1 0 R")
     * @returns {Object|null} 对象或null
     */
    getObjectByRef(ref) {
        const match = ref.match(/(\d+)\s+(\d+)\s+R/);
        if (match) {
            return this.getObject(parseInt(match[1]), parseInt(match[2]));
        }
        return null;
    }

    /**
     * 查找对象类型
     * @param {string} type - 对象类型
     * @returns {Array} 匹配的对象列表
     */
    findObjectsByType(type) {
        return this.physical.objects.filter(obj => obj.type === type);
    }

    /**
     * 查找对象属性
     * @param {string} property - 属性名
     * @param {*} value - 属性值
     * @returns {Array} 匹配的对象列表
     */
    findObjectsByProperty(property, value) {
        return this.physical.objects.filter(obj => 
            obj.properties && obj.properties[property] === value
        );
    }

    /**
     * 获取页面信息
     * @returns {Object} 页面信息
     */
    getPageInfo() {
        const pages = this.findObjectsByType('Page');
        return {
            total: pages.length,
            pages: pages.map(page => ({
                number: page.objectNumber,
                mediaBox: page.properties.MediaBox,
                cropBox: page.properties.CropBox,
                rotation: page.properties.Rotate || 0,
                contents: page.properties.Contents,
                resources: page.properties.Resources
            }))
        };
    }

    /**
     * 获取字体信息
     * @returns {Array} 字体信息列表
     */
    getFontInfo() {
        const fonts = this.findObjectsByType('Font');
        return fonts.map(font => ({
            number: font.objectNumber,
            name: font.properties.BaseFont || font.properties.Name,
            type: font.properties.Subtype,
            encoding: font.properties.Encoding,
            toUnicode: font.properties.ToUnicode
        }));
    }

    /**
     * 获取图像信息
     * @returns {Array} 图像信息列表
     */
    getImageInfo() {
        const images = this.findObjectsByType('XObject').filter(obj => 
            obj.properties.Subtype === 'Image'
        );
        return images.map(img => ({
            number: img.objectNumber,
            width: img.properties.Width,
            height: img.properties.Height,
            bitsPerComponent: img.properties.BitsPerComponent,
            colorSpace: img.properties.ColorSpace,
            filter: img.properties.Filter
        }));
    }

    /**
     * 获取流信息
     * @returns {Array} 流信息列表
     */
    getStreamInfo() {
        const streams = this.physical.objects.filter(obj => obj.properties.isStream);
        return streams.map(stream => ({
            number: stream.objectNumber,
            length: stream.properties.Length,
            filter: stream.properties.Filter,
            type: stream.type
        }));
    }

    /**
     * 获取核心对象信息
     * @returns {Object} 核心对象信息
     */
    getCoreObjectsInfo() {
        return {
            catalog: this.findObjectsByProperty('Type', 'Catalog')[0] || null,
            pages: this.findObjectsByProperty('Type', 'Pages')[0] || null,
            pageObjects: this.findObjectsByType('Page'),
            fontObjects: this.findObjectsByType('Font'),
            streamObjects: this.physical.objects.filter(obj => obj.properties.isStream),
            xObjectObjects: this.findObjectsByProperty('Type', 'XObject'),
            annotationObjects: this.findObjectsByType('Annot'),
            actionObjects: this.findObjectsByType('Action'),
            destObjects: this.findObjectsByType('Dest'),
            metadataObjects: this.findObjectsByProperty('Type', 'Metadata')
        };
    }

    /**
     * 获取对象类型统计
     * @returns {Object} 类型统计信息
     */
    getTypeStats() {
        const typeStats = {};
        this.physical.objects.forEach(obj => {
            const type = obj.type;
            typeStats[type] = (typeStats[type] || 0) + 1;
        });
        return typeStats;
    }

    /**
     * 获取流统计信息
     * @returns {Object} 流统计信息
     */
    getStreamStats() {
        const streams = this.physical.objects.filter(obj => obj.properties.isStream);
        let totalStreamSize = 0;
        let compressedStreams = 0;
        
        streams.forEach(stream => {
            if (stream.properties.Length) {
                totalStreamSize += stream.properties.Length;
            }
            if (stream.properties.Filter) {
                compressedStreams++;
            }
        });
        
        return {
            total: streams.length,
            totalSize: totalStreamSize,
            compressed: compressedStreams,
            uncompressed: streams.length - compressedStreams
        };
    }

    /**
     * 获取图像信息
     * @returns {Array} 图像信息列表
     */
    getImageInfo() {
        const images = this.findObjectsByType('XObject').filter(obj => 
            obj.properties.Subtype === 'Image'
        );
        return images.map(img => ({
            number: img.objectNumber,
            width: img.properties.Width,
            height: img.properties.Height,
            bitsPerComponent: img.properties.BitsPerComponent,
            colorSpace: img.properties.ColorSpace,
            filter: img.properties.Filter
        }));
    }

    /**
     * 获取文件基本信息
     * @returns {Object} 文件基本信息
     */
    getFileInfo() {
        return {
            version: this.physical.version,
            fileSize: this.physical.fileSize,
            totalObjects: this.stats.total,
            header: this.physical.header,
            trailer: this.physical.trailer,
            startXref: this.physical.startXref
        };
    }

    /**
     * 获取内容统计信息
     * @returns {Object} 内容统计信息
     */
    getContentStats() {
        return {
            pages: this.getPageInfo().total,
            fonts: this.getFontInfo().length,
            images: this.getImageInfo().length,
            streams: this.getStreamInfo().length,
            annotations: this.findObjectsByType('Annot').length,
            actions: this.findObjectsByType('Action').length,
            destinations: this.findObjectsByType('Dest').length
        };
    }

    /**
     * 检查必需对象是否存在
     * @returns {Object} 必需对象检查结果
     */
    checkRequiredObjects() {
        const catalog = this.findObjectsByProperty('Type', 'Catalog');
        const pages = this.findObjectsByProperty('Type', 'Pages');
        const pageObjects = this.findObjectsByType('Page');
        
        return {
            hasCatalog: catalog.length > 0,
            hasPages: pages.length > 0,
            hasPageObjects: pageObjects.length > 0,
            catalogCount: catalog.length,
            pagesCount: pages.length,
            pageCount: pageObjects.length
        };
    }

    /**
     * PDF对象类型映射表
     */
    static TYPE_MAP = {
        Catalog: {
            type: 'Catalog',
            description: '文档根对象，包含页面树、大纲等核心信息引用',
            properties: {
                Pages: 'required',
                Outlines: 'optional',
                Names: 'optional',
                Dests: 'optional',
                ViewerPreferences: 'optional',
                PageLayout: 'optional',
                PageMode: 'optional',
                OpenAction: 'optional',
                AA: 'optional',
                URI: 'optional',
                AcroForm: 'optional',
                Metadata: 'optional',
                StructTreeRoot: 'optional',
                MarkInfo: 'optional',
                Lang: 'optional',
                SpiderInfo: 'optional',
                OutputIntents: 'optional',
                PieceInfo: 'optional',
                OCProperties: 'optional',
                Perms: 'optional',
                Legal: 'optional',
                Requirements: 'optional',
                Collection: 'optional',
                NeedsRendering: 'optional'
            },
            atLeast: ['Pages']
        },
        Pages: {
            type: 'Pages',
            description: '页面树容器，管理所有页面',
            properties: {
                Type: 'required',
                Kids: 'required',
                Count: 'required',
                Parent: 'optional',
                Resources: 'optional',
                MediaBox: 'optional',
                CropBox: 'optional',
                BleedBox: 'optional',
                TrimBox: 'optional',
                ArtBox: 'optional',
                BoxColorInfo: 'optional',
                Contents: 'optional',
                Rotate: 'optional',
                Group: 'optional',
                Thumb: 'optional',
                B: 'optional',
                Dur: 'optional',
                Trans: 'optional',
                Annots: 'optional',
                AA: 'optional',
                Metadata: 'optional',
                PieceInfo: 'optional',
                LastModified: 'optional',
                StructParents: 'optional',
                ID: 'optional',
                PZ: 'optional',
                SeparationInfo: 'optional',
                Tabs: 'optional',
                TemplateInstantiated: 'optional',
                PressProps: 'optional',
                UserUnit: 'optional',
                VP: 'optional'
            },
            atLeast: ['Type', 'Kids', 'Count']
        },
        Page: {
            type: 'Page',
            description: '单个页面对象，包含页面尺寸、内容流、资源等',
            properties: {
                Type: 'required',
                Parent: 'required',
                Resources: 'optional',
                MediaBox: 'optional',
                CropBox: 'optional',
                BleedBox: 'optional',
                TrimBox: 'optional',
                ArtBox: 'optional',
                BoxColorInfo: 'optional',
                Contents: 'optional',
                Rotate: 'optional',
                Group: 'optional',
                Thumb: 'optional',
                B: 'optional',
                Dur: 'optional',
                Trans: 'optional',
                Annots: 'optional',
                AA: 'optional',
                Metadata: 'optional',
                PieceInfo: 'optional',
                LastModified: 'optional',
                StructParents: 'optional',
                ID: 'optional',
                PZ: 'optional',
                SeparationInfo: 'optional',
                Tabs: 'optional',
                TemplateInstantiated: 'optional',
                PressProps: 'optional',
                UserUnit: 'optional',
                VP: 'optional'
            },
            atLeast: ['Type', 'Parent']
        },
        Font: {
            type: 'Font',
            description: '字体定义对象，包含字体类型、名称和编码方式',
            properties: {
                Type: 'required',
                Subtype: 'required',
                BaseFont: 'required',
                FirstChar: 'optional',
                LastChar: 'optional',
                Widths: 'optional',
                FontDescriptor: 'optional',
                Encoding: 'optional',
                ToUnicode: 'optional'
            },
            atLeast: ['Type', 'Subtype', 'BaseFont']
        },
        Stream: {
            type: 'Stream',
            description: '二进制数据流对象，用于存储页面内容、图像、字体数据等',
            properties: {
                Length: 'required',
                Filter: 'optional',
                DecodeParms: 'optional',
                F: 'optional',
                FFilter: 'optional',
                FDecodeParms: 'optional',
                DL: 'optional'
            },
            atLeast: ['Length']
        },
        XObject: {
            type: 'XObject',
            description: '外部资源对象，包含图像或表单等外部引入资源',
            properties: {
                Type: 'required',
                Subtype: 'required',
                Width: 'required',
                Height: 'required',
                ColorSpace: 'required',
                BitsPerComponent: 'required',
                Filter: 'optional',
                DecodeParms: 'optional',
                ImageMask: 'optional',
                Mask: 'optional',
                Matte: 'optional',
                Interpolate: 'optional',
                Alternates: 'optional',
                SMask: 'optional',
                SMaskInData: 'optional',
                Name: 'optional',
                StructParent: 'optional',
                ID: 'optional',
                OPI: 'optional',
                Metadata: 'optional',
                OC: 'optional'
            },
            atLeast: ['Type', 'Subtype', 'Width', 'Height', 'ColorSpace', 'BitsPerComponent']
        },
        Outlines: {
            type: 'Outlines',
            description: '文档大纲容器，管理书签结构',
            properties: {
                Type: 'required',
                First: 'optional',
                Last: 'optional',
                Count: 'optional'
            },
            atLeast: ['Type']
        },
        Metadata: {
            type: 'Metadata',
            description: '文档元数据对象，存储标题、作者、创建日期等信息',
            properties: {
                Type: 'required',
                Subtype: 'required',
                Length: 'required'
            },
            atLeast: ['Type', 'Subtype', 'Length']
        },
        Action: {
            type: 'Action',
            description: '定义交互动作（如跳转、打开链接等）',
            properties: {
                Type: 'required',
                S: 'required',
                Next: 'optional',
                H: 'optional',
                T: 'optional',
                F: 'optional',
                D: 'optional',
                Win: 'optional',
                Mac: 'optional',
                Unix: 'optional',
                URI: 'optional',
                IsMap: 'optional',
                SubmitForm: 'optional',
                ResetForm: 'optional',
                ImportData: 'optional',
                JavaScript: 'optional',
                SetOCGState: 'optional',
                Rendition: 'optional',
                Trans: 'optional',
                GoTo3DView: 'optional'
            },
            atLeast: ['Type', 'S']
        },
        Annot: {
            type: 'Annot',
            description: '定义页面注释（如文本框、高亮、链接等）',
            properties: {
                Type: 'required',
                Subtype: 'required',
                Rect: 'required',
                Contents: 'optional',
                P: 'optional',
                NM: 'optional',
                M: 'optional',
                F: 'optional',
                AP: 'optional',
                AS: 'optional',
                Border: 'optional',
                C: 'optional',
                StructParent: 'optional',
                OC: 'optional'
            },
            atLeast: ['Type', 'Subtype', 'Rect']
        },
        Dest: {
            type: 'Dest',
            description: '定义跳转目的地（页面位置）',
            properties: {
                D: 'required'
            },
            atLeast: ['D']
        },
        PageLabel: {
            type: 'PageLabel',
            description: '定义页面编号格式（如罗马数字、章节前缀）',
            properties: {
                Type: 'required',
                Nums: 'required'
            },
            atLeast: ['Type', 'Nums']
        },
        StructTreeRoot: {
            type: 'StructTreeRoot',
            description: '结构化文档的根节点，定义文档逻辑结构',
            properties: {
                Type: 'required',
                K: 'optional',
                RoleMap: 'optional',
                ClassMap: 'optional',
                ParentTree: 'optional',
                ParentTreeNextKey: 'optional',
                IDTree: 'optional',
                IDTreeNextKey: 'optional'
            },
            atLeast: ['Type']
        },
        StructElem: {
            type: 'StructElem',
            description: '结构化文档中的元素（如标题、段落）',
            properties: {
                Type: 'required',
                S: 'required',
                P: 'optional',
                K: 'optional',
                A: 'optional',
                C: 'optional',
                R: 'optional',
                T: 'optional',
                Lang: 'optional',
                Alt: 'optional',
                E: 'optional',
                ActualText: 'optional',
                Code: 'optional',
                ID: 'optional',
                PG: 'optional',
                BBox: 'optional',
                Attr: 'optional'
            },
            atLeast: ['Type', 'S']
        },
        OCG: {
            type: 'OCG',
            description: '可选内容组（层），用于控制内容的显示/隐藏',
            properties: {
                Type: 'required',
                Name: 'required',
                Intent: 'optional',
                Usage: 'optional',
                F: 'optional',
                VE: 'optional',
                AS: 'optional',
                OCGs: 'optional'
            },
            atLeast: ['Type', 'Name']
        },
        ColorSpace: {
            type: 'ColorSpace',
            description: '定义颜色空间（如RGB、CMYK、专色）',
            properties: {
                Type: 'required'
            },
            atLeast: ['Type']
        },
        Pattern: {
            type: 'Pattern',
            description: '定义填充图案（如渐变色、重复图案）',
            properties: {
                Type: 'required',
                PatternType: 'required'
            },
            atLeast: ['Type', 'PatternType']
        },
        Shading: {
            type: 'Shading',
            description: '定义渐变效果（如线性渐变、径向渐变）',
            properties: {
                Type: 'required',
                ShadingType: 'required',
                ColorSpace: 'required',
                Background: 'optional',
                BBox: 'optional',
                AntiAlias: 'optional'
            },
            atLeast: ['Type', 'ShadingType', 'ColorSpace']
        },
        ExtGState: {
            type: 'ExtGState',
            description: '定义图形状态参数（如透明度、混合模式）',
            properties: {
                Type: 'required',
                LW: 'optional',
                LC: 'optional',
                LJ: 'optional',
                ML: 'optional',
                D: 'optional',
                RI: 'optional',
                OP: 'optional',
                op: 'optional',
                OPM: 'optional',
                Font: 'optional',
                BG: 'optional',
                BG2: 'optional',
                UCR: 'optional',
                UCR2: 'optional',
                TR: 'optional',
                TR2: 'optional',
                HT: 'optional',
                FL: 'optional',
                SM: 'optional',
                SA: 'optional',
                BM: 'optional',
                SMask: 'optional',
                CA: 'optional',
                ca: 'optional',
                AIS: 'optional',
                TK: 'optional'
            },
            atLeast: ['Type']
        },
        XRef: {
            type: 'XRef',
            description: '交叉引用表对象，用于快速定位PDF对象',
            properties: {
                Type: 'required',
                Size: 'required',
                Index: 'optional',
                W: 'optional',
                Root: 'optional',
                Info: 'optional',
                ID: 'optional',
                Encrypt: 'optional',
                Filter: 'optional',
                DecodeParms: 'optional',
                Length: 'optional'
            },
            atLeast: ['Type', 'Size']
        },
        ObjStm: {
            type: 'ObjStm',
            description: '对象流对象，用于压缩存储多个PDF对象',
            properties: {
                Type: 'required',
                N: 'required',
                First: 'required',
                Length: 'required',
                Filter: 'optional',
                DecodeParms: 'optional'
            },
            atLeast: ['Type', 'N', 'First', 'Length']
        },
        FontDescriptor: {
            type: 'FontDescriptor',
            description: '字体描述符对象，包含字体名称、家族、样式等信息',
            properties: {
                Type: 'required',
                FontName: 'required',
                FontFamily: 'optional',
                FontStretch: 'optional',
                FontWeight: 'optional',
                Flags: 'required',
                FontBBox: 'required',
                ItalicAngle: 'required',
                Ascent: 'optional',
                Descent: 'optional',
                Leading: 'optional',
                CapHeight: 'optional',
                XHeight: 'optional',
                StemV: 'optional',
                StemH: 'optional',
                AvgWidth: 'optional',
                MaxWidth: 'optional',
                MissingWidth: 'optional',
                CharSet: 'optional',
                FontFile: 'optional',
                FontFile2: 'optional',
                FontFile3: 'optional'
            },
            atLeast: ['Type', 'FontName', 'Flags', 'FontBBox', 'ItalicAngle']
        },
        Encoding: {
            type: 'Encoding',
            description: '编码对象，定义字符到字节的映射',
            properties: {
                Type: 'required',
                BaseEncoding: 'optional',
                Differences: 'optional'
            },
            atLeast: ['Type']
        },
        CMap: {
            type: 'CMap',
            description: '字符映射表对象，定义字符到字形ID的映射',
            properties: {
                Type: 'required',
                WMode: 'optional',
                UseCMap: 'optional'
            },
            atLeast: ['Type']
        },
        Function: {
            type: 'Function',
            description: '函数对象，定义PDF函数（如PostScript函数）',
            properties: {
                FunctionType: 'required',
                Domain: 'required',
                Range: 'optional'
            },
            atLeast: ['FunctionType', 'Domain']
        },
        Halftone: {
            type: 'Halftone',
            description: '半色调对象，定义PDF半色调',
            properties: {
                Type: 'required',
                HalftoneType: 'required'
            },
            atLeast: ['Type', 'HalftoneType']
        },
        Mask: {
            type: 'Mask',
            description: '遮罩对象，定义PDF遮罩',
            properties: {
                Type: 'required'
            },
            atLeast: ['Type']
        },
        Group: {
            type: 'Group',
            description: '组对象，定义PDF组',
            properties: {
                Type: 'required',
                S: 'required',
                CS: 'optional',
                I: 'optional',
                K: 'optional'
            },
            atLeast: ['Type', 'S']
        },
        Transparency: {
            type: 'Transparency',
            description: '透明度对象，定义PDF透明度',
            properties: {
                Type: 'required'
            },
            atLeast: ['Type']
        },
        Sig: {
            type: 'Sig',
            description: '数字签名对象',
            properties: {
                Type: 'required',
                Filter: 'required',
                SubFilter: 'optional',
                Name: 'optional',
                Reason: 'optional',
                Location: 'optional',
                ContactInfo: 'optional',
                M: 'optional',
                Prop_Build: 'optional',
                Prop_AuthTime: 'optional',
                Prop_AuthType: 'optional',
                Contents: 'required',
                ByteRange: 'required',
                Reference: 'optional'
            },
            atLeast: ['Type', 'Filter', 'Contents', 'ByteRange']
        },
        Filespec: {
            type: 'Filespec',
            description: '文件规范对象',
            properties: {
                Type: 'required',
                F: 'required',
                EF: 'optional',
                UF: 'optional',
                Desc: 'optional',
                CI: 'optional',
                AF: 'optional',
                RF: 'optional',
                FEmbeddedFile: 'optional',
                FRelation: 'optional',
                FS: 'optional',
                V: 'optional',
                DV: 'optional',
                AA: 'optional'
            },
            atLeast: ['Type', 'F']
        },
        EmbeddedFile: {
            type: 'EmbeddedFile',
            description: '嵌入文件流对象',
            properties: {
                Type: 'required',
                Subtype: 'optional',
                Params: 'optional'
            },
            atLeast: ['Type']
        },
        Collection: {
            type: 'Collection',
            description: '集合对象（PDF包）',
            properties: {
                Type: 'required',
                Schema: 'optional',
                D: 'optional',
                View: 'optional',
                Sort: 'optional'
            },
            atLeast: ['Type']
        },
        Sound: {
            type: 'Sound',
            description: '声音对象',
            properties: {
                Type: 'required',
                S: 'required',
                R: 'required',
                C: 'required',
                B: 'required',
                E: 'required',
                CO: 'required',
                CP: 'required'
            },
            atLeast: ['Type', 'S', 'R', 'C', 'B', 'E', 'CO', 'CP']
        },
        Movie: {
            type: 'Movie',
            description: '电影对象',
            properties: {
                Type: 'required',
                F: 'required',
                Aspect: 'optional',
                Rotate: 'optional',
                Poster: 'optional'
            },
            atLeast: ['Type', 'F']
        },
        '3D': {
            type: 'ThreeD',
            description: '3D对象',
            properties: {
                Type: 'required',
                Subtype: 'required',
                DefaultView: 'optional',
                Views: 'optional',
                Resources: 'optional',
                OnInstantiate: 'optional',
                Extensions: 'optional'
            },
            atLeast: ['Type', 'Subtype']
        },
        RichMedia: {
            type: 'RichMedia',
            description: '富媒体对象',
            properties: {
                Type: 'required',
                Subtype: 'required',
                Assets: 'required',
                Config: 'required',
                Views: 'required',
                Activation: 'optional'
            },
            atLeast: ['Type', 'Subtype', 'Assets', 'Config', 'Views']
        },
        Widget: {
            type: 'Widget',
            description: '表单控件对象',
            properties: {
                Type: 'required',
                Subtype: 'required',
                Rect: 'required',
                FT: 'required',
                Parent: 'required',
                Kids: 'optional',
                T: 'optional',
                TU: 'optional',
                TM: 'optional',
                Ff: 'optional',
                V: 'optional',
                DV: 'optional',
                AA: 'optional',
                A: 'optional',
                DA: 'optional',
                Q: 'optional',
                DS: 'optional',
                RV: 'optional',
                AP: 'optional',
                AS: 'optional',
                Border: 'optional',
                C: 'optional',
                StructParent: 'optional',
                OC: 'optional'
            },
            atLeast: ['Type', 'Subtype', 'Rect', 'FT', 'Parent']
        },
        TrapNet: {
            type: 'TrapNet',
            description: '陷阱信息对象',
            properties: {
                Type: 'required',
                LastModified: 'required',
                Version: 'required',
                Annots: 'required'
            },
            atLeast: ['Type', 'LastModified', 'Version', 'Annots']
        }
    };

    /**
     * Subtype映射表，定义各种对象类型的Subtype及其必需属性
     * 根据PDF 32000-1:2008标准定义
     */
    static SUB_TYPE_MAP = {
        // Font Subtypes
        Font: {
            Type1: {
                description: 'Type 1字体',
                required: ['Type', 'Subtype', 'BaseFont'],
                optional: ['FirstChar', 'LastChar', 'Widths', 'FontDescriptor', 'Encoding', 'ToUnicode']
            },
            TrueType: {
                description: 'TrueType字体',
                required: ['Type', 'Subtype', 'BaseFont'],
                optional: ['FirstChar', 'LastChar', 'Widths', 'FontDescriptor', 'Encoding', 'ToUnicode']
            },
            Type3: {
                description: 'Type 3字体（用户定义）',
                required: ['Type', 'Subtype', 'FontBBox', 'FontMatrix', 'CharProcs', 'Encoding'],
                optional: ['FirstChar', 'LastChar', 'Widths', 'FontDescriptor', 'ToUnicode']
            },
            MMType1: {
                description: 'Multiple Master Type 1字体',
                required: ['Type', 'Subtype', 'BaseFont'],
                optional: ['FirstChar', 'LastChar', 'Widths', 'FontDescriptor', 'Encoding', 'ToUnicode']
            },
            Type0: {
                description: 'Type 0字体（复合字体）',
                required: ['Type', 'Subtype', 'BaseFont', 'DescendantFonts', 'Encoding'],
                optional: ['FirstChar', 'LastChar', 'Widths', 'FontDescriptor', 'ToUnicode']
            },
            CIDFontType0: {
                description: 'CID字体类型0（基于Type 1的CID字体）',
                required: ['Type', 'Subtype', 'BaseFont', 'CIDSystemInfo', 'FontDescriptor'],
                optional: ['DW', 'W', 'DW2', 'W2', 'Registry', 'Ordering', 'Supplement', 'CIDToGIDMap']
            },
            CIDFontType2: {
                description: 'CID字体类型2（基于TrueType的CID字体）',
                required: ['Type', 'Subtype', 'BaseFont', 'CIDSystemInfo', 'FontDescriptor'],
                optional: ['DW', 'W', 'DW2', 'W2', 'Registry', 'Ordering', 'Supplement', 'CIDToGIDMap']
            }
        },

        // XObject Subtypes
        XObject: {
            Image: {
                description: '图像对象',
                required: ['Type', 'Subtype', 'Width', 'Height', 'ColorSpace', 'BitsPerComponent'],
                optional: ['Filter', 'DecodeParms', 'ImageMask', 'Mask', 'Matte', 'Interpolate', 'Alternates', 'SMask', 'SMaskInData', 'Name', 'StructParent', 'ID', 'OPI', 'Metadata', 'OC']
            },
            Form: {
                description: '表单对象',
                required: ['Type', 'Subtype', 'BBox'],
                optional: ['Matrix', 'Group', 'Ref', 'Metadata', 'PieceInfo', 'LastModified', 'StructParent', 'StructParents', 'OPI', 'OC', 'Name', 'Resources']
            },
            PS: {
                description: 'PostScript对象',
                required: ['Type', 'Subtype', 'Length'],
                optional: ['Filter', 'DecodeParms']
            }
        },

        // Metadata Subtypes
        Metadata: {
            XML: {
                description: 'XML元数据',
                required: ['Type', 'Subtype', 'Length'],
                optional: ['Filter', 'DecodeParms']
            }
        },

        // 3D Subtypes
        ThreeD: {
            U3D: {
                description: 'Universal 3D格式',
                required: ['Type', 'Subtype', 'VA'],
                optional: ['DefaultView', 'Views', 'Resources', 'OnInstantiate', 'Extensions']
            },
            PRC: {
                description: 'Product Representation Compact格式',
                required: ['Type', 'Subtype', 'VA'],
                optional: ['DefaultView', 'Views', 'Resources', 'OnInstantiate', 'Extensions']
            }
        },

        // RichMedia Subtypes
        RichMedia: {
            Flash: {
                description: 'Adobe Flash内容',
                required: ['Type', 'Subtype', 'Assets', 'Config', 'Views'],
                optional: ['Activation']
            },
            Video: {
                description: '视频内容',
                required: ['Type', 'Subtype', 'Assets', 'Config', 'Views'],
                optional: ['Activation']
            },
            Sound: {
                description: '音频内容',
                required: ['Type', 'Subtype', 'Assets', 'Config', 'Views'],
                optional: ['Activation']
            }
        },

        // Widget Subtypes
        Widget: {
            Button: {
                description: '按钮控件',
                required: ['Type', 'Subtype', 'Rect', 'FT', 'Parent'],
                optional: ['Kids', 'T', 'TU', 'TM', 'Ff', 'V', 'DV', 'AA', 'A', 'DA', 'Q', 'DS', 'RV', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC']
            },
            Text: {
                description: '文本输入控件',
                required: ['Type', 'Subtype', 'Rect', 'FT', 'Parent'],
                optional: ['Kids', 'T', 'TU', 'TM', 'Ff', 'V', 'DV', 'AA', 'A', 'DA', 'Q', 'DS', 'RV', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'MaxLen']
            },
            Choice: {
                description: '选择控件（下拉框、列表框）',
                required: ['Type', 'Subtype', 'Rect', 'FT', 'Parent'],
                optional: ['Kids', 'T', 'TU', 'TM', 'Ff', 'V', 'DV', 'AA', 'A', 'DA', 'Q', 'DS', 'RV', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'Opt']
            },
            Signature: {
                description: '数字签名控件',
                required: ['Type', 'Subtype', 'Rect', 'FT', 'Parent'],
                optional: ['Kids', 'T', 'TU', 'TM', 'Ff', 'V', 'DV', 'AA', 'A', 'DA', 'Q', 'DS', 'RV', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC']
            }
        },

        // Annot Subtypes
        Annot: {
            Text: {
                description: '文本注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'Open', 'Name', 'State', 'StateModel', 'T', 'InReplyTo', 'IRT', 'RT', 'RD', 'Subj', 'Popup', 'CA', 'RC', 'Q', 'TCh', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Link: {
                description: '链接注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'A', 'Dest', 'H', 'PA', 'QuadPoints', 'BS', 'BE', 'C', 'F', 'Border', 'IC', 'IF', 'L', 'LL', 'LLE', 'LLC', 'LLO', 'Cap', 'IT', 'BE', 'RD', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC']
            },
            FreeText: {
                description: '自由文本注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'DA', 'Q', 'RC', 'RD', 'CL', 'IT', 'BE', 'RD', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Line: {
                description: '线条注释',
                required: ['Type', 'Subtype', 'Rect', 'L'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'L', 'LL', 'LLE', 'LLC', 'LLO', 'Cap', 'IT', 'BE', 'RD', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Square: {
                description: '矩形注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'BE', 'RD', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Circle: {
                description: '圆形注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'BE', 'RD', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Polygon: {
                description: '多边形注释',
                required: ['Type', 'Subtype', 'Rect', 'Vertices'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'Vertices', 'LE', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            PolyLine: {
                description: '折线注释',
                required: ['Type', 'Subtype', 'Rect', 'Vertices'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'Vertices', 'LE', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Highlight: {
                description: '高亮注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'QuadPoints', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Underline: {
                description: '下划线注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'QuadPoints', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Squiggly: {
                description: '波浪线注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'QuadPoints', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            StrikeOut: {
                description: '删除线注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'QuadPoints', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Stamp: {
                description: '图章注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'Name', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Caret: {
                description: '插入符注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'RD', 'Sy', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Ink: {
                description: '墨迹注释',
                required: ['Type', 'Subtype', 'Rect', 'InkList'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'InkList', 'BS', 'BE', 'RD', 'BS', 'IC', 'IF', 'F', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Popup: {
                description: '弹出注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'Parent', 'Open', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            FileAttachment: {
                description: '文件附件注释',
                required: ['Type', 'Subtype', 'Rect', 'FS'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'FS', 'Name', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Sound: {
                description: '声音注释',
                required: ['Type', 'Subtype', 'Rect', 'Sound'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'Sound', 'Name', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Movie: {
                description: '电影注释',
                required: ['Type', 'Subtype', 'Rect', 'T'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'T', 'A', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Screen: {
                description: '屏幕注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Widget: {
                description: '控件注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            PrinterMark: {
                description: '打印标记注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            TrapNet: {
                description: '陷阱网络注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Watermark: {
                description: '水印注释',
                required: ['Type', 'Subtype', 'Rect'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            '3D': {
                description: '3D注释',
                required: ['Type', 'Subtype', 'Rect', '3DD'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', '3DD', '3DV', '3DA', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            },
            Redact: {
                description: '编辑注释',
                required: ['Type', 'Subtype', 'Rect', 'QuadPoints'],
                optional: ['Contents', 'P', 'NM', 'M', 'F', 'AP', 'AS', 'Border', 'C', 'StructParent', 'OC', 'QuadPoints', 'IC', 'RO', 'OverlayText', 'Repeat', 'DA', 'Q', 'T', 'TUser', 'TDate', 'TState', 'TStateModel', 'TIcon', 'TIconName', 'TIconType', 'TIconColor', 'TIconOpacity', 'TIconSize', 'TIconOffset', 'TIconRotation', 'TIconScale', 'TIconSkew', 'TIconShear', 'TIconMatrix', 'TIconBBox', 'TIconClip', 'TIconMask', 'TIconSMask', 'TIconOPI', 'TIconMetadata', 'TIconOC', 'TIconName2', 'TIconType2', 'TIconColor2', 'TIconOpacity2', 'TIconSize2', 'TIconOffset2', 'TIconRotation2', 'TIconScale2', 'TIconSkew2', 'TIconShear2', 'TIconMatrix2', 'TIconBBox2', 'TIconClip2', 'TIconMask2', 'TIconSMask2', 'TIconOPI2', 'TIconMetadata2', 'TIconOC2']
            }
        }
    };

    /**
     * 从TYPE_MAP生成对象类型必需属性配置
     */
    static get OBJECT_REQUIREMENTS() {
        const requirements = {};
        Object.entries(PDFStructure.TYPE_MAP).forEach(([typeName, typeInfo]) => {
            requirements[typeName] = {
                required: typeInfo.atLeast || [],
                optional: Object.keys(typeInfo.properties).filter(prop => 
                    typeInfo.properties[prop] === 'optional'
                )
            };
        });
        return requirements;
    }



    /**
     * 导出结构信息
     * @returns {Object} 结构信息
     */
    export() {
        return {
            physical: this.physical,
            logical: this.logical,
            relations: this.relations,
            stats: this.stats,
            validation: this.validation
        };
    }



    /**
     * 清理资源
     */
    clear() {
        this.physical.objects = [];
        this.physical.objectMap.clear();
        this.logical.resources.clear();
        this.relations.referencedBy.clear();
        this.validation.errors = [];
        this.validation.warnings = [];
        this.validation.issues = [];
    }
}

// 兼容浏览器和Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = PDFStructure;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.PDFStructure = PDFStructure;
}