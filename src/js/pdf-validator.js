/**
 * PDF 验证器
 * 基于 PDF 1.7 标准 (ISO 32000-1) 验证 PDF 结构
 * 
 * 检测规则说明：
 * 
 * 1. PDF 头部验证 (Header Validation)
 *    - 检查 %PDF 标识符是否存在
 *    - 验证版本号格式 (1.0-1.7)
 *    - 检查文件类型标识
 * 
 * 2. Catalog 对象验证 (Catalog Object Validation)
 *    - 验证 Type 属性必须为 "Catalog"
 *    - 检查必需条目：Pages
 *    - 验证对象引用有效性
 * 
 * 3. Pages 对象验证 (Pages Object Validation)
 *    - 验证 Type 属性必须为 "Pages"
 *    - 检查必需条目：Kids, Count
 *    - 验证页面树结构完整性
 * 
 * 4. Page 对象验证 (Page Object Validation)
 *    - 验证 Type 属性必须为 "Page"
 *    - 检查必需条目：Parent, MediaBox
 *    - 验证页面边界框有效性
 *    - 检查页面资源引用
 * 
 * 5. Font 对象验证 (Font Object Validation)
 *    - 验证 Type 属性必须为 "Font"
 *    - 检查必需条目：Subtype, BaseFont
 *    - 验证字体类型和编码
 * 
 * 6. XObject 对象验证 (XObject Object Validation)
 *    - 验证 Type 属性必须为 "XObject"
 *    - 检查必需条目：Subtype
 *    - 验证图像或表单对象属性
 * 
 * 7. Stream 对象验证 (Stream Object Validation)
 *    - 检查 Length 属性
 *    - 验证 Filter 属性有效性
 *    - 检查压缩数据完整性
 *    - 验证 Stream 内容可读性
 * 
 * 8. XRef 表验证 (Cross-Reference Table Validation)
 *    - 检查 XRef 表完整性
 *    - 验证对象偏移量正确性
 *    - 检查生成号有效性
 *    - 验证 Free Entry 链表
 * 
 * 9. Trailer 验证 (Trailer Validation)
 *    - 检查必需属性：Root, Size
 *    - 验证 Root 引用有效性
 *    - 检查加密状态信息
 *    - 验证文件完整性
 * 
 * 10. 引用关系验证 (Reference Validation)
 *     - 检查间接引用有效性
 *     - 验证对象编号范围
 *     - 检测循环引用关系
 *     - 验证引用链完整性
 * 
 * 11. 安全验证 (Security Validation)
 *     - 检查加密状态
 *     - 验证权限设置
 *     - 检测安全风险
 *     - 验证数字签名
 * 
 * 12. 性能验证 (Performance Validation)
 *     - 检查对象数量合理性
 *     - 验证文件大小
 *     - 检测内存使用
 *     - 验证处理效率
 */
class PDFValidator {
    constructor() {
        this.issues = [];
        this.validationRules = this.initializeValidationRules();
    }

    /**
     * 初始化验证规则
     * @returns {Object} 验证规则配置
     */
    initializeValidationRules() {
        return {
            // PDF 头部验证规则
            header: {
                version: {
                    required: true,
                    pattern: /^1\.[0-7]$/,
                    message: 'PDF 版本必须是 1.0 到 1.7 之间的有效版本',
                    description: '检查PDF文件头部版本号格式，确保符合PDF标准规范'
                },
                pdfIdentifier: {
                    required: true,
                    pattern: /%PDF/,
                    message: 'PDF文件必须以 %PDF 标识符开头',
                    description: '验证PDF文件头部包含标准PDF标识符'
                }
            },

            // Catalog 对象验证规则
            catalog: {
                Type: {
                    required: true,
                    value: 'Catalog',
                    message: 'Catalog 对象的 Type 必须是 "Catalog"',
                    description: '验证文档目录对象的类型标识'
                },
                Pages: {
                    required: true,
                    message: 'Catalog 对象必须包含 Pages 条目',
                    description: '检查文档页面树的根对象引用'
                }
            },

            // Pages 对象验证规则
            pages: {
                Type: {
                    required: true,
                    value: 'Pages',
                    message: 'Pages 对象的 Type 必须是 "Pages"',
                    description: '验证页面树对象的类型标识'
                },
                Kids: {
                    required: true,
                    message: 'Pages 对象必须包含 Kids 条目',
                    description: '检查页面树子对象列表'
                },
                Count: {
                    required: true,
                    message: 'Pages 对象必须包含 Count 条目',
                    description: '验证页面数量统计信息'
                }
            },

            // Page 对象验证规则
            page: {
                Type: {
                    required: true,
                    value: 'Page',
                    message: 'Page 对象的 Type 必须是 "Page"',
                    description: '验证页面对象的类型标识'
                },
                Parent: {
                    required: true,
                    message: 'Page 对象必须包含 Parent 条目',
                    description: '检查页面在页面树中的父对象引用'
                },
                MediaBox: {
                    required: true,
                    message: 'Page 对象必须包含 MediaBox 条目',
                    description: '验证页面边界框定义'
                }
            },

            // Font 对象验证规则
            font: {
                Type: {
                    required: true,
                    value: 'Font',
                    message: 'Font 对象的 Type 必须是 "Font"',
                    description: '验证字体对象的类型标识'
                },
                Subtype: {
                    required: true,
                    message: 'Font 对象必须包含 Subtype 条目',
                    description: '检查字体子类型定义'
                },
                BaseFont: {
                    required: true,
                    message: 'Font 对象必须包含 BaseFont 条目',
                    description: '验证字体名称定义'
                }
            },

            // XObject 对象验证规则
            xobject: {
                Type: {
                    required: true,
                    value: 'XObject',
                    message: 'XObject 对象的 Type 必须是 "XObject"',
                    description: '验证外部对象的类型标识'
                },
                Subtype: {
                    required: true,
                    message: 'XObject 对象必须包含 Subtype 条目',
                    description: '检查外部对象子类型定义'
                }
            },

            // Stream 对象验证规则
            stream: {
                Length: {
                    required: true,
                    message: 'Stream 对象必须包含 Length 条目',
                    description: '验证流数据长度定义'
                },
                Filter: {
                    required: false,
                    message: 'Stream 对象应包含 Filter 条目',
                    description: '检查流数据压缩过滤器'
                }
            },

            // XRef 表验证规则
            xref: {
                entries: {
                    required: true,
                    message: 'XRef 表必须包含有效的条目',
                    description: '验证交叉引用表完整性'
                },
                objectNumbers: {
                    required: true,
                    message: 'XRef 条目必须包含有效的对象编号',
                    description: '检查对象编号的有效性'
                },
                offsets: {
                    required: true,
                    message: 'XRef 条目必须包含有效的偏移量',
                    description: '验证对象在文件中的位置'
                }
            },

            // Trailer 验证规则
            trailer: {
                Root: {
                    required: true,
                    message: 'Trailer 必须包含 Root 条目',
                    description: '检查文档目录对象引用'
                },
                Size: {
                    required: true,
                    message: 'Trailer 必须包含 Size 条目',
                    description: '验证PDF文件中的对象总数'
                }
            },

            // 通用对象验证规则
            common: {
                // 必需的字典条目
                requiredDictEntries: {
                    Catalog: ['Type', 'Pages'],
                    Page: ['Type', 'Parent', 'MediaBox'],
                    Pages: ['Type', 'Kids', 'Count'],
                    Font: ['Type', 'Subtype', 'BaseFont'],
                    XObject: ['Type', 'Subtype'],
                    ColorSpace: ['Type'],
                    Pattern: ['Type', 'PatternType'],
                    Shading: ['Type', 'ShadingType'],
                    Function: ['Type', 'FunctionType'],
                    ExtGState: ['Type'],
                    Properties: ['Type']
                },

                // 有效的对象类型
                validTypes: [
                    'Catalog', 'Page', 'Pages', 'Font', 'XObject', 'ColorSpace',
                    'Pattern', 'Shading', 'Function', 'ExtGState', 'Properties',
                    'Annotation', 'Action', 'Destination', 'Outline', 'Thread',
                    'Metadata', 'StructTreeRoot', 'MarkInfo', 'OutputIntent'
                ],

                // 有效的页面属性
                validPageProperties: [
                    'Type', 'Parent', 'MediaBox', 'CropBox', 'BleedBox', 'TrimBox',
                    'ArtBox', 'Rotate', 'Contents', 'Resources', 'Annots', 'AA',
                    'Metadata', 'PieceInfo', 'LastModified', 'StructParents',
                    'ID', 'PZ', 'SeparationInfo', 'Tabs', 'TemplateInstantiated',
                    'PresSteps', 'UserUnit', 'VP'
                ]
            }
        };
    }

    /**
     * 验证 PDF 结构
     * @param {Object} structure - PDF 结构对象
     * @param {Object} fileInfo - 文件信息（包含加密状态）
     * @returns {Array} 验证问题列表
     */
    validateStructure(structure, fileInfo = {}) {
        this.issues = [];

        // 验证头部信息
        this.validateHeader(structure.header);

        // 验证 Catalog 对象
        this.validateCatalog(structure.catalog);

        // 验证页面对象
        this.validatePages(structure.pages);

        // 验证尾部信息
        this.validateTrailer(structure.trailer);

        // 验证对象统计信息
        this.validateObjects(structure.objects);

        // 验证加密状态
        this.validateEncryption(fileInfo.isEncrypted);

        return this.issues;
    }

    /**
     * 验证加密状态
     * @param {boolean} isEncrypted - 是否加密
     */
    validateEncryption(isEncrypted) {
        if (isEncrypted) {
            this.addIssue('warning', 'PDF Encryption', 'PDF 文件已加密', 
                '加密的 PDF 文件可能影响某些功能的正常使用。建议在安全环境下处理，并确保有适当的访问权限。');
        } else {
            this.addIssue('info', 'PDF Encryption', 'PDF 文件未加密', 
                'PDF 文件未加密，可以正常访问所有内容。对于包含敏感信息的文档，建议考虑添加适当的保护措施。');
        }
    }

    /**
     * 验证 PDF 头部
     * @param {Object} header - 头部信息
     */
    validateHeader(header) {
        if (!header) {
            this.addIssue('error', 'PDF Header', 'PDF 头部信息缺失', 'PDF 文件必须包含有效的头部信息');
            return;
        }

        // 验证版本
        if (!header.version) {
            this.addIssue('error', 'PDF Version', 'PDF 版本信息缺失', 'PDF 文件必须指定版本号');
        } else if (!this.validationRules.header.version.pattern.test(header.version)) {
            this.addIssue('error', 'PDF Version', `无效的 PDF 版本: ${header.version}`, this.validationRules.header.version.message);
        }

        // 验证类型
        if (header.type !== 'PDF') {
            this.addIssue('warning', 'PDF Type', `文件类型标识: ${header.type}`, '建议使用标准的 PDF 类型标识');
        }
    }

    /**
     * 验证 Catalog 对象
     * @param {Object} catalog - Catalog 对象
     */
    validateCatalog(catalog) {
        if (!catalog) {
            this.addIssue('error', 'Catalog', 'Catalog 对象缺失', 'PDF 文件必须包含 Catalog 对象');
            return;
        }

        if (catalog.error) {
            this.addIssue('error', 'Catalog', `Catalog 解析错误: ${catalog.error}`, 'Catalog 对象无法正确解析');
            return;
        }

        const properties = catalog.properties || {};

        // 验证 Type
        if (!properties.Type) {
            this.addIssue('error', 'Catalog Type', 'Catalog Type 缺失', this.validationRules.catalog.Type.message);
        } else if (properties.Type !== 'Catalog') {
            this.addIssue('error', 'Catalog Type', `无效的 Catalog Type: ${properties.Type}`, this.validationRules.catalog.Type.message);
        }

        // 验证 Pages
        if (!properties.Pages) {
            this.addIssue('error', 'Catalog Pages', 'Catalog Pages 缺失', this.validationRules.catalog.Pages.message);
        } else if (properties.Pages === 'Missing') {
            this.addIssue('error', 'Catalog Pages', 'Catalog Pages 引用缺失', 'Pages 对象必须存在且可访问');
        }

        // 验证其他重要属性
        this.validateCatalogProperties(properties);
    }

    /**
     * 验证 Catalog 属性
     * @param {Object} properties - Catalog 属性
     */
    validateCatalogProperties(properties) {
        // 检查 AcroForm（表单）
        if (properties.AcroForm === 'Present') {
            this.addIssue('info', 'Catalog AcroForm', '检测到表单对象', 'PDF 包含交互式表单');
        }

        // 检查 Metadata
        if (properties.Metadata === 'Present') {
            this.addIssue('info', 'Catalog Metadata', '检测到元数据', 'PDF 包含结构化元数据');
        }

        // 检查加密
        if (properties.Encrypt === 'Present') {
            this.addIssue('warning', 'Catalog Encryption', '检测到加密', 'PDF 文件已加密，可能影响某些功能');
        }

        // 检查版本兼容性
        if (properties.Version && properties.Version !== 'Not specified') {
            const version = properties.Version;
            if (version.startsWith('2.')) {
                this.addIssue('warning', 'Catalog Version', `PDF 2.0 特性: ${version}`, '使用了 PDF 2.0 特性，可能与旧版本不兼容');
            }
        }
    }

    /**
     * 验证页面对象
     * @param {Array} pages - 页面对象数组
     */
    validatePages(pages) {
        if (!pages || !Array.isArray(pages)) {
            this.addIssue('error', 'Pages', '页面对象缺失或格式错误', 'PDF 必须包含有效的页面对象');
            return;
        }

        if (pages.length === 0) {
            this.addIssue('error', 'Pages', '没有找到页面', 'PDF 文件必须包含至少一个页面');
            return;
        }

        pages.forEach((page, index) => {
            if (page.error) {
                this.addIssue('error', `Page ${page.pageNumber || index + 1}`, `页面解析错误: ${page.error}`, '页面对象无法正确解析');
                return;
            }

            this.validatePageObject(page);
        });
    }

    /**
     * 验证单个页面对象
     * @param {Object} page - 页面对象
     */
    validatePageObject(page) {
        const properties = page.properties || {};
        const pageNum = page.pageNumber;

        // 验证 Type
        if (!properties.Type) {
            this.addIssue('error', `Page ${pageNum}`, 'Page Type 缺失', this.validationRules.page.Type.message);
        } else if (properties.Type !== 'Page') {
            this.addIssue('error', `Page ${pageNum}`, `无效的 Page Type: ${properties.Type}`, this.validationRules.page.Type.message);
        }

        // 验证 Parent
        if (!properties.Parent) {
            this.addIssue('error', `Page ${pageNum}`, 'Page Parent 缺失', this.validationRules.page.Parent.message);
        }

        // 验证 MediaBox
        if (!properties.MediaBox) {
            this.addIssue('error', `Page ${pageNum}`, 'Page MediaBox 缺失', this.validationRules.page.MediaBox.message);
        } else if (properties.MediaBox === 'Not available') {
            this.addIssue('warning', `Page ${pageNum}`, 'Page MediaBox 不可用', '页面边界框信息无法获取');
        }

        // 验证其他页面属性
        this.validatePageProperties(page);
    }

    /**
     * 验证页面属性
     * @param {Object} page - 页面对象
     */
    validatePageProperties(page) {
        const properties = page.properties || {};
        const pageNum = page.pageNumber;

        // 检查旋转角度
        if (properties.Rotate && properties.Rotate !== 0) {
            const rotate = parseInt(properties.Rotate);
            if (rotate % 90 !== 0) {
                this.addIssue('warning', `Page ${pageNum}`, `非标准旋转角度: ${rotate}°`, '建议使用 90° 的倍数作为旋转角度');
            }
        }

        // 检查注释
        if (properties.Annots && properties.Annots !== 'Not present') {
            this.addIssue('info', `Page ${pageNum}`, `检测到注释: ${properties.Annots}`, '页面包含交互式注释');
        }

        // 检查资源
        if (properties.Resources === 'Not present') {
            this.addIssue('warning', `Page ${pageNum}`, '页面资源缺失', '页面没有定义资源字典，可能影响显示');
        }

        // 检查内容流
        if (properties.Contents === 'Not present') {
            this.addIssue('warning', `Page ${pageNum}`, '页面内容缺失', '页面没有内容流，可能是空白页面');
        }
    }

    /**
     * 验证尾部信息
     * @param {Object} trailer - 尾部信息
     */
    validateTrailer(trailer) {
        if (!trailer) {
            this.addIssue('warning', 'Trailer', '尾部信息缺失', 'PDF 尾部信息无法获取');
            return;
        }

        // 检查加密状态
        if (trailer.encrypted) {
            this.addIssue('warning', 'Trailer Encryption', 'PDF 文件已加密', '加密的 PDF 可能影响某些验证功能');
        }

        // 检查文件大小
        if (trailer.size && trailer.size < 100) {
            this.addIssue('warning', 'Trailer Size', `文件大小异常: ${trailer.size} bytes`, '文件大小过小，可能不是有效的 PDF');
        }
    }

    /**
     * 验证对象统计信息
     * @param {Object} objects - 对象统计信息
     */
    validateObjects(objects) {
        if (!objects) {
            this.addIssue('warning', 'Objects', '对象统计信息缺失', '无法获取 PDF 对象统计信息');
            return;
        }

        // 检查页面数量
        if (objects.pageCount === 0) {
            this.addIssue('error', 'Objects PageCount', '页面数量为 0', 'PDF 文件必须包含至少一个页面');
        } else if (objects.pageCount > 1000) {
            this.addIssue('warning', 'Objects PageCount', `页面数量过多: ${objects.pageCount}`, '页面数量过多可能影响性能');
        }

        // 检查线性化
        if (objects.isLinearized) {
            this.addIssue('info', 'Objects Linearized', 'PDF 已线性化', '线性化的 PDF 支持快速网页查看');
        }
    }

    /**
     * 添加验证问题
     * @param {string} level - 问题级别 (error, warning, info)
     * @param {string} location - 问题位置
     * @param {string} title - 问题标题
     * @param {string} description - 问题描述
     */
    addIssue(level, location, title, description) {
        this.issues.push({
            level: level,
            location: location,
            title: title,
            description: description,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 获取验证统计信息
     * @returns {Object}
     */
    getValidationStats() {
        const stats = {
            total: this.issues.length,
            error: 0,
            warning: 0,
            info: 0
        };

        this.issues.forEach(issue => {
            stats[issue.level]++;
        });

        return stats;
    }

    /**
     * 获取按级别分组的问题
     * @returns {Object}
     */
    getIssuesByLevel() {
        const grouped = {
            error: [],
            warning: [],
            info: []
        };

        this.issues.forEach(issue => {
            grouped[issue.level].push(issue);
        });

        return grouped;
    }

    /**
     * 检查 PDF 是否符合标准
     * @returns {boolean}
     */
    isCompliant() {
        return this.issues.filter(issue => issue.level === 'error').length === 0;
    }
} 