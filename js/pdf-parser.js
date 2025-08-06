/**
 * PDF 解析器 - 顺序解析版本
 * 按照PDF二进制文件的顺序解析所有对象，不依赖正则匹配和查找
 */
class PDFParser {
    constructor() {
        this.arrayBuffer = null;
        // 兼容浏览器和Node.js环境
        let PDFStructureClass;
        if (typeof window !== 'undefined') {
            PDFStructureClass = window.PDFStructure;
        } else if (typeof require !== 'undefined') {
            PDFStructureClass = require('./pdf-struct.js');
        } else {
            PDFStructureClass = PDFStructure;
        }
        this.pdfStructure = new PDFStructureClass();
        this.currentOffset = 0;   // 当前解析位置
    }

    /**
     * 解析 PDF 文件
     * @param {File} file - PDF 文件
     * @returns {Promise<Object>}
     */
    async parsePDF(file) {
        try {
            console.log('PDF 解析开始...');
            
            // 读取文件数据
            console.log('读取文件数据...');
            this.arrayBuffer = await this.readFileAsArrayBuffer(file);
            console.log('文件数据读取完成，大小:', this.arrayBuffer.byteLength);
            
            // 按顺序解析 PDF 结构
            console.log('按顺序解析 PDF 结构...');
            const result = await this.parsePDFSequentially(new Uint8Array(this.arrayBuffer));
            console.log('PDF 结构解析完成');
            
            // 检查解析结果
            if (!result.success) {
                throw new Error(result.error || 'PDF解析失败');
            }
            
            // 获取文件信息
            const fileInfo = this.extractFileInfo(file);
            
            return {
                success: true,
                structure: result.structure,
                fileInfo: fileInfo
            };
        } catch (error) {
            console.error('PDF 解析错误:', error);
            return {
                success: false,
                error: error.message,
                details: error.stack
            };
        }
    }

    /**
     * 读取文件为 ArrayBuffer
     * @param {File} file - 文件对象
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * 按顺序解析 PDF 结构
     * @param {Uint8Array} bytes - PDF 字节数据
     * @returns {Promise<Object>}
     */
    async parsePDFSequentially(bytes) {
        try {
            console.log('开始按顺序解析 PDF 结构...');
            
            // 确保bytes是Uint8Array
            if (!(bytes instanceof Uint8Array)) {
                throw new Error('parsePDFSequentially期望接收Uint8Array参数');
            }
            
            // 新文件解析前彻底清理pdfStructure
            if (this.pdfStructure && typeof this.pdfStructure.clear === 'function') {
                this.pdfStructure.clear();
                console.log('已清理上次的PDF结构数据');
            }
            
            // 设置arrayBuffer用于文件大小计算
            this.arrayBuffer = bytes.buffer;
            
            // 1. 解析 PDF 头部
            const header = this.ParseHeader(bytes);
            console.log('PDF 头部解析完成:', header);
            
            // 2. 解析 Body (对象部分)
            console.log('开始解析 Body (对象部分)...');
            
            // 从位置0开始，让ParseNextObject自动查找第一个对象
            this.currentOffset = 0;
            const objects = [];
            while (this.currentOffset < bytes.length) {
                const object = this.ParseNextObject(bytes);
                if (object) {
                    objects.push(object);
                    this.pdfStructure.addObject(object);
                } else {
                    // 检查是否遇到了PDF结构元素
                    const remainingBytes = bytes.slice(this.currentOffset);
                    const remainingString = new TextDecoder('latin1').decode(remainingBytes);
                    
                    if (remainingString.match(/xref\s*\n/)) {
                        console.log('遇到 Cross-reference table，开始解析...');
                        break;
                    }
                    
                    // 跳过无法解析的内容
                    this.currentOffset++;
                }
            }
            
            console.log(`Body 解析完成，共找到 ${objects.length} 个对象`);
            
            // 3. 解析 Cross-reference table
            const xrefInfo = this.ParseCrossReferenceTable(bytes);
            console.log('Cross-reference table 解析完成:', xrefInfo);
            
            // 4. 解析 Trailer
            console.log('解析 Trailer...');
            const trailerInfo = this.ParseTrailer(bytes);
            console.log('Trailer 解析完成:', trailerInfo);
            
            // === 新增：trailer引用对象的二次类型修正 ===
            if (trailerInfo && trailerInfo.properties) {
                const refKeys = [
                    { key: 'Root', type: 'Catalog' },
                    { key: 'Info', type: 'Info' },
                    { key: 'Encrypt', type: 'Encrypt' }
                ];
                refKeys.forEach(({ key, type }) => {
                    const ref = trailerInfo.properties[key];
                    if (typeof ref === 'string' && ref.includes('Indirect Reference')) {
                        const match = ref.match(/Indirect Reference \((\d+) (\d+) R\)/);
                        if (match) {
                            const objNum = parseInt(match[1]);
                            const genNum = parseInt(match[2]);
                            const obj = objects.find(o => o.objectNumber === objNum && o.generation === genNum);
                            if (obj && (obj.type === 'Unknown' || !obj.type)) {
                                obj.type = type;
                                if (!obj.properties) obj.properties = {};
                                obj.properties.Type = type;
                                obj.properties.description = PDFStructure.TYPE_MAP[type]?.description || '';
                            }
                        }
                    }
                });
            }
            
            // 5. 设置完整的物理结构信息
            this.pdfStructure.setPhysicalStructure({
                header: header,
                body: {
                    objects: objects,
                    objectCount: objects.length
                },
                xref: xrefInfo,
                trailer: trailerInfo,
                version: header.version,
                fileSize: this.arrayBuffer.byteLength
            });
            
            console.log(`PDF 结构解析完成，共找到 ${this.pdfStructure.stats.total} 个对象`);
            
            return {
                success: true,
                structure: this.pdfStructure,
                fileInfo: {
                    size: this.arrayBuffer.byteLength,
                    version: header.version
                }
            };
            
        } catch (error) {
            console.error('PDF解析失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 解析 Cross-reference table
     * @param {Uint8Array} bytes - PDF 字节数据
     * @returns {Object}
     */
    ParseCrossReferenceTable(bytes) {
        try {
            console.log('解析 Cross-reference table...');
            
            // 查找 xref 标记
            const fileString = new TextDecoder('latin1').decode(bytes);
            const xrefMatch = fileString.match(/xref\s*\n([\s\S]*?)(?=trailer|startxref)/);
            
            if (!xrefMatch) {
                console.warn('未找到 Cross-reference table');
                return {
                    isValid: false,
                    entries: [],
                    message: '未找到 Cross-reference table',
                    startPosition: null
                };
            }
            
            // === 新增：记录xref起始位置 ===
            const xrefStartPosition = xrefMatch.index;
            console.log(`XRef起始位置: ${xrefStartPosition}`);
            
            const xrefContent = xrefMatch[1];
            const fullXrefContent = 'xref\n' + xrefContent;
            
            console.log('=== Cross-reference table 原始内容 ===');
            console.log(fullXrefContent);
            console.log('=== Cross-reference table 原始内容结束 ===');
            console.log('');
            
            // 处理不同的行结束符组合
            // 首先统一处理所有可能的行结束符
            const normalizedContent = xrefContent
                .replace(/\r\n/g, '\n')  // CR LF -> LF
                .replace(/\r/g, '\n');   // CR -> LF
            
            const lines = normalizedContent.split('\n').filter(line => line.trim());
            
            const entries = [];
            let currentSubsection = null;
            let subsectionEntryCount = 0;
            
            for (const line of lines) {
                const cleanLine = line.trim();
                
                // 检查是否是子节头 (例如: "0 3")
                const subsectionMatch = cleanLine.match(/^(\d+)\s+(\d+)$/);
                if (subsectionMatch) {
                    currentSubsection = {
                        firstObject: parseInt(subsectionMatch[1]),
                        objectCount: parseInt(subsectionMatch[2])
                    };
                    subsectionEntryCount = 0;
                    continue;
                }
                
                // 解析条目 (例如: "0000000000 65535 f " 或 "0000000017 00000 n ")
                const entryMatch = cleanLine.match(/^(\d{10})\s+(\d{5})\s+([nf])\s*$/);
                if (entryMatch && currentSubsection) {
                    const firstField = parseInt(entryMatch[1]);
                    const generation = parseInt(entryMatch[2]);
                    const entryType = entryMatch[3];
                    const inUse = entryType === 'n';
                    
                    // 计算对象编号
                    const objectNumber = currentSubsection.firstObject + subsectionEntryCount;
                    
                    let offset = null;
                    let nextFreeObject = null;
                    
                    if (inUse) {
                        // in-use entry: 第一个字段是10位字节偏移量
                        offset = firstField;
                    } else {
                        // free entry: 第一个字段是下一个free对象的对象编号
                        nextFreeObject = firstField;
                    }
                    
                    entries.push({
                        objectNumber: objectNumber,
                        generation: generation,
                        inUse: inUse,
                        offset: offset,
                        nextFreeObject: nextFreeObject
                    });
                    
                    subsectionEntryCount++;
                }
            }
            
            const xrefInfo = {
                isValid: true,
                entries: entries,
                startPosition: xrefStartPosition,
                rawContent: fullXrefContent
            };
            
            console.log(`Cross-reference table 解析完成，共找到 ${entries.length} 个条目`);
            return xrefInfo;
            
        } catch (error) {
            console.error('解析 Cross-reference table 失败:', error);
            return {
                isValid: false,
                entries: [],
                error: error.message,
                startPosition: null
            };
        }
    }

    /**
     * 解析 Trailer
     * @param {Uint8Array} bytes - PDF 字节数据
     * @returns {Object}
     */
    ParseTrailer(bytes) {
        try {
            console.log('解析 Trailer...');
            
            // 查找 trailer 标记
            const fileString = new TextDecoder('latin1').decode(bytes);
            const trailerMatch = fileString.match(/trailer\s*\n([\s\S]*?)(?=startxref|%%EOF)/);
            
            if (!trailerMatch) {
                console.warn('未找到 Trailer');
                return {
                    isValid: false,
                    properties: {},
                    message: '未找到 Trailer',
                    startPosition: null
                };
            }
            
            // === 新增：记录trailer起始位置 ===
            const trailerStartPosition = trailerMatch.index;
            console.log(`Trailer起始位置: ${trailerStartPosition}`);
            
            const trailerContent = trailerMatch[1];
            const fullTrailerContent = 'trailer\n' + trailerContent;
            
            console.log('=== Trailer 原始内容 ===');
            console.log(fullTrailerContent);
            console.log('=== Trailer 原始内容结束 ===');
            console.log('');
            
            // 解析 trailer 字典
            const dictMatch = trailerContent.match(/<<([\s\S]*?)>>/);
            if (!dictMatch) {
                console.warn('Trailer 中未找到有效的字典');
                return {
                    isValid: false,
                    properties: {},
                    message: 'Trailer 中未找到有效的字典',
                    startPosition: trailerStartPosition
                };
            }
            
            const dictContent = dictMatch[1];
            const properties = this.parseDictEntries(dictContent);
            
            // 查找 startxref 和 %%EOF
            const startxrefMatch = fileString.match(/startxref\s*\n(\d+)/);
            const eofMatch = fileString.match(/%%EOF/);
            
            const trailerInfo = {
                isValid: true,
                properties: properties,
                startxref: startxrefMatch ? parseInt(startxrefMatch[1]) : null,
                hasEOF: !!eofMatch,
                rawContent: fullTrailerContent,
                startPosition: trailerStartPosition
            };
            
            console.log('Trailer 解析完成:', trailerInfo);
            return trailerInfo;
            
        } catch (error) {
            console.error('解析 Trailer 失败:', error);
            return {
                isValid: false,
                properties: {},
                error: error.message,
                startPosition: null
            };
        }
    }

    /**
     * 解析 PDF 头部
     * @param {Uint8Array} bytes - PDF 字节数据
     * @returns {Object}
     */
    ParseHeader(bytes) {
        try {
            console.log('解析 PDF 头部...');
            
            // 查找 PDF 签名
            const headerString = new TextDecoder().decode(bytes.slice(0, 1024));
            const versionMatch = headerString.match(/%PDF-(\d+\.\d+)/);
            
            // 提取完整的头部内容（到第一个换行符）
            const headerEndMatch = headerString.match(/(%PDF-\d+\.\d+)[\r\n]/);
            const rawHeaderContent = headerEndMatch ? headerEndMatch[1] + '\n' : headerString.split('\n')[0] + '\n';
            
            console.log('=== PDF Header 原始内容 ===');
            console.log(rawHeaderContent);
            console.log('=== PDF Header 原始内容结束 ===');
            console.log('');
            
            if (versionMatch) {
                const version = versionMatch[1];
                console.log('找到 PDF 版本:', version);
                return {
                    version: version,
                    type: 'PDF',
                    isValid: true,
                    rawContent: rawHeaderContent
                };
            } else {
                console.warn('未找到有效的 PDF 签名');
                return {
                    version: null,
                    type: 'Unknown',
                    isValid: false,
                    rawContent: rawHeaderContent
                };
            }
        } catch (error) {
            console.error('解析 PDF 头部失败:', error);
            return {
                version: null,
                type: 'Error',
                isValid: false,
                rawContent: ''
            };
        }
    }

    /**
     * 解析下一个对象
     * @param {Uint8Array} bytes - PDF 字节数据
     * @returns {Object|null}
     */
    ParseNextObject(bytes) {
        try {
            const STEP_SIZE = 1000; // 固定步长
            
            let searchStart = this.currentOffset;
            let searchEnd = Math.min(searchStart + STEP_SIZE, bytes.length);
            let searchString = '';
            
            let count = 0;
            // 循环检测，直到找到完整的对象
            while (searchEnd <= bytes.length) {
                count++;
                // 获取当前搜索范围的字节
                const searchBytes = bytes.slice(searchStart, searchEnd);
                searchString = new TextDecoder('latin1').decode(searchBytes);
                
                // 查找对象开始标记: "number generation obj"
                const objMatch = searchString.match(/(\d+)\s+(\d+)\s+obj\s*\n?/);
                if (!objMatch) {
                    // 没有找到对象开始标记，检查是否遇到了PDF结构元素
                    const xrefMatch = searchString.match(/xref\s*\n/);
                    const trailerMatch = searchString.match(/trailer\s*\n/);
                    const startxrefMatch = searchString.match(/startxref\s*\n/);
                    const eofMatch = searchString.match(/%%EOF/);
                    
                    if (xrefMatch || trailerMatch || startxrefMatch || eofMatch) {
                        // 遇到了PDF结构元素，跳过这些区域
                        console.log(`遇到PDF结构元素，跳过位置: ${this.currentOffset}`);
                        if (eofMatch) {
                            // 遇到文件结束标记，停止解析
                            this.currentOffset = bytes.length;
                            return null;
                        } else {
                            // 跳过当前区域，继续查找
                            this.currentOffset = searchEnd;
                            return null;
                        }
                    }
                    
                    // 没有找到对象开始标记，扩大搜索范围
                    searchEnd = Math.min(searchEnd + STEP_SIZE, bytes.length);
                    continue;
                }
                
                const objectNumber = parseInt(objMatch[1]);
                const generation = parseInt(objMatch[2]);
                const objStart = searchStart + objMatch.index;
                const objContentStart = objStart + objMatch[0].length;
                
                if (count == 1) {
                    console.log(`解析对象 ${objectNumber} ${generation} R，位置: ${objStart}`);
                }   
                
                // 在对象开始标记之后查找endobj标记
                const remainingString = searchString.substring(objMatch.index);
                const endObjMatch = remainingString.match(/endobj\s*\n?/);
                
                if (!endObjMatch) {
                    // 没有找到endobj标记，检查是否有下一个对象开始标记
                    const nextObjMatch = remainingString.match(/(\d+)\s+(\d+)\s+obj\s*\n?/);
                    if (nextObjMatch && nextObjMatch.index > 0) {
                        // 找到了下一个对象，说明当前对象不完整，扩大搜索范围
                        searchEnd = Math.min(searchEnd + STEP_SIZE, bytes.length);
                        continue;
                    }
                    
                    // 没有找到endobj标记也没有下一个对象，扩大搜索范围
                    searchEnd = Math.min(searchEnd + STEP_SIZE, bytes.length);
                    continue;
                }
                
                // 找到了完整的对象边界：从obj到endobj
                const endObjIndex = objMatch.index + endObjMatch.index;
                const objContentEnd = searchStart + endObjIndex;
                const objContent = searchString.substring(objMatch.index, endObjIndex + 6).trim();
                
                // 解析对象内容（包括内部的stream处理）
                const objectInfo = this.parseObjectContent(objContent);
                
                // === 新增：设置原始内容用于Stream检测 ===
                this.currentRawContent = objContent;
                
                const objectType = this.determineObjectType(objectInfo);
                
                // 根据对象类型进行专门解析
                const enhancedProperties = this.parseObjectByType(objectInfo, objectType);
                
                // 更新当前偏移量到对象结束位置
                this.currentOffset = objContentEnd + 6; // "endobj" 长度为6
                
                const object = {
                    objectNumber: objectNumber,
                    generation: generation,
                    offset: objStart,
                    content: objContent,
                    properties: enhancedProperties,
                    type: objectType
                };
                
                // 添加详细日志
                console.log(`=== 对象 ${objectNumber} ${generation} R 详细信息 ===`);
                console.log(`起始位置: ${objStart}`);
                console.log(`结束位置: ${objContentEnd + 6}`);
                console.log(`对象长度: ${objContentEnd + 6 - objStart} 字节`);
                console.log(`对象类型: ${objectType}`);
                console.log(`完整内容:`);
                console.log(objContent);
                console.log('');
                console.log('结构化属性:')
                console.log(enhancedProperties);
                console.log(`=== 对象 ${objectNumber} ${generation} R 解析完成 ===`);
                console.log('');
                
                return object;
            }
            
            // 没有找到对象，向前移动一个字节
            this.currentOffset++;
            return null;
            
        } catch (error) {
            console.error('解析对象失败:', error);
            this.currentOffset++;
            return null;
        }
    }

    /**
     * 解析对象内容
     * @param {string} content - 对象内容字符串
     * @returns {Object}
     */
    parseObjectContent(content) {
        try {
            const properties = {};
            
            // 检查是否是流对象
            const streamMatch = content.match(/stream\s*\n(.*?)\nendstream/s);
            if (streamMatch) {
                properties.isStream = true;
                properties.streamLength = streamMatch[1].length;
                properties.streamData = streamMatch[1];
            }
            
            // 解析字典部分 - 使用字符扫描方式处理嵌套字典
            const dictContent = this.extractDictContent(content);
            if (dictContent) {
                const entries = this.parseDictEntries(dictContent);
                Object.assign(properties, entries);
            }
            

            
            return properties;
        } catch (error) {
            console.error('解析对象内容失败:', error);
            return {};
        }
    }

    /**
     * 提取字典内容，正确处理嵌套字典
     * @param {string} content - 对象内容字符串
     * @returns {string|null}
     */
    extractDictContent(content) {
        const startIndex = content.indexOf('<<');
        if (startIndex === -1) return null;
        
        const endIndex = content.lastIndexOf('>>');
        if (endIndex === -1) return null;
        
        // 直接返回从 << 到 >> 之间的内容，不包含 << 和 >>
        return content.substring(startIndex + 2, endIndex);
    }

    /**
     * 解析字典条目
     * @param {string} dictContent - 字典内容字符串
     * @returns {Object}
     */
    parseDictEntries(dictContent) {
        const entries = {};
        let i = 0, len = dictContent.length;
        let key = null, value = '';
        while (i < len) {
            // 跳过空白
            while (i < len && /\s/.test(dictContent[i])) i++;
            if (i >= len) break;
            if (dictContent[i] === '/') {
                // 保存上一个key-value
                if (key !== null) {
                    entries[key] = this.parseValueByType(value.trim(), this.guessType(value.trim()));
                }
                // 解析key
                i++;
                let keyStart = i;
                while (i < len && /[A-Za-z0-9\-#]/.test(dictContent[i])) i++;
                key = dictContent.substring(keyStart, i);
                value = '';
                // 跳过空白
                while (i < len && /\s/.test(dictContent[i])) i++;
                // 解析value
                if (i < len) {
                    if (dictContent[i] === '/') {
                        // 对于Name对象，需要读取完整的名称（包括转义字符）
                        let valStart = i;
                        i++; // 跳过 /
                        while (i < len && /[A-Za-z0-9\-#]/.test(dictContent[i])) i++;
                        value = '/' + dictContent.substring(valStart + 1, i);
                    } else if (dictContent[i] === '(') {
                        // string类型
                        let brace = 1, valStart = i, inEscape = false;
                        i++;
                        while (i < len && brace > 0) {
                            if (dictContent[i] === '\\' && !inEscape) {
                                inEscape = true; 
                                i++; 
                                continue;
                            }
                            if (dictContent[i] === '(' && !inEscape) brace++;
                            if (dictContent[i] === ')' && !inEscape) brace--;
                            inEscape = false;
                            i++;
                        }
                        value = dictContent.substring(valStart, i);
                    } else if (dictContent[i] === '<') {
                        // 检查是否是嵌套字典 <<>>
                        if (i + 1 < len && dictContent[i + 1] === '<') {
                            // 嵌套字典类型
                            let brace = 1, valStart = i;
                            i += 2; // 跳过 <<
                            while (i < len && brace > 0) {
                                if (dictContent[i] === '<' && i + 1 < len && dictContent[i + 1] === '<') {
                                    brace++;
                                    i += 2;
                                } else if (dictContent[i] === '>' && i + 1 < len && dictContent[i + 1] === '>') {
                                    brace--;
                                    i += 2;
                                } else {
                                    i++;
                                }
                            }
                            value = dictContent.substring(valStart, i);
                        } else {
                            // hex类型 - 查找对应的 >
                            let valStart = i;
                            i++;
                            while (i < len && dictContent[i] !== '>') i++;
                            if (i < len) {
                                value = dictContent.substring(valStart, i + 1);
                                i++; // 移动到 > 之后
                            } else {
                                value = dictContent.substring(valStart, i);
                            }
                        }
                    } else if (dictContent[i] === '[') {
                        // array类型
                        let valStart = i, bracket = 1;
                        i++;
                        while (i < len && bracket > 0) {
                            if (dictContent[i] === '[') bracket++;
                            if (dictContent[i] === ']') bracket--;
                            i++;
                        }
                        value = dictContent.substring(valStart, i);
                    } else {
                        // 普通值或间接引用
                        let valStart = i;
                        // 对于间接引用，需要读取到下一个 / 或字典结束
                        while (i < len && dictContent[i] !== '/') {
                            // 检查是否是间接引用的结束（数字 + 空格 + 数字 + 空格 + R）
                            if (i + 4 < len && 
                                /\d/.test(dictContent[i]) && 
                                /\s/.test(dictContent[i + 1]) && 
                                /\d/.test(dictContent[i + 2]) && 
                                /\s/.test(dictContent[i + 3]) && 
                                dictContent[i + 4] === 'R') {
                                // 找到完整的间接引用，包含 R
                                i += 5;
                                break;
                            }
                            // 检查是否是字典结束 >>
                            if (i + 1 < len && dictContent[i] === '>' && dictContent[i + 1] === '>') {
                                break;
                            }
                            i++;
                        }
                        value = dictContent.substring(valStart, i);
                    }
                }
            } else {
                i++;
            }
        }
        // 最后一个key-value
        if (key !== null) {
            entries[key] = this.parseValueByType(value.trim(), this.guessType(value.trim()));
        }
        return entries;
    }

    guessType(value) {
        const trimmedValue = value.trim();
        
        // 空字符串或纯空白
        if (!trimmedValue) return 'unknown';
        
        // 按优先级检查各种类型
        if (trimmedValue.startsWith('/')) return 'name';
        if (trimmedValue.startsWith('(')) return 'string';
        if (trimmedValue.startsWith('<<')) return 'dictionary';
        if (trimmedValue.startsWith('<')) return 'hex';
        if (trimmedValue.startsWith('[')) return 'array';
        if (trimmedValue === 'true' || trimmedValue === 'false') return 'boolean';
        
        // 数字检查：支持整数、浮点数、科学计数法
        // PDF规范支持：整数、浮点数、科学计数法（如 1.23e-4）
        if (/^-?\d+\.?\d*(?:[eE][+-]?\d+)?$/.test(trimmedValue)) return 'number';
        
        // 间接引用检查：格式为 "数字 数字 R"
        if (/^\d+\s+\d+\s+R$/.test(trimmedValue)) return 'reference';
        
        return 'unknown';
    }
    
    /**
     * 根据类型解析值
     * @param {string} value - 原始值字符串
     * @param {string} type - 值类型
     * @returns {any}
     */
    parseValueByType(value, type) {
        switch (type) {
            case 'name':
                return this.parseNameValue(value);
            case 'number':
                return value.includes('.') ? parseFloat(value) : parseInt(value);
            case 'boolean':
                return value === 'true';
            case 'string':
                return this.parseStringValue(value);
            case 'hex':
                return this.parseByteStringValue(value);
            case 'array':
                return this.parseArrayValue(value);
            case 'dictionary':
                return this.parseDictionaryValue(value);
            case 'reference':
                return this.parseReferenceValue(value);
            case 'unknown':
                return this.parseUnknownValue(value);
            default:
                return value;
        }
    }
    
    /**
     * 解析名称值
     * @param {string} value - 名称值
     * @returns {string}
     */
    parseNameValue(value) {
        // 去掉名称前面的 / 前缀
        if (value.startsWith('/')) {
            value = value.substring(1);
        }
        
        // 处理名称中的转义字符
        if (value.includes('#')) {
            // 将 #20 转换为空格等
            value = value.replace(/#20/g, ' ');
            value = value.replace(/#28/g, '(');
            value = value.replace(/#29/g, ')');
            value = value.replace(/#3C/g, '<');
            value = value.replace(/#3E/g, '>');
            value = value.replace(/#5B/g, '[');
            value = value.replace(/#5D/g, ']');
            value = value.replace(/#7B/g, '{');
            value = value.replace(/#7D/g, '}');
            value = value.replace(/#2F/g, '/');
            value = value.replace(/#25/g, '%');
        }
        return value;
    }
    
    /**
     * 解析字符串值
     * @param {string} value - 字符串值
     * @returns {string}
     */
    parseStringValue(value) {
        // 去掉括号
        if (value.startsWith('(') && value.endsWith(')')) {
            value = value.substring(1, value.length - 1);
        }
        // 处理转义字符
        return value
            .replace(/\\\\/g, '\\')  // 双反斜杠 -> 单反斜杠
            .replace(/\\\(/g, '(')   // 转义左括号
            .replace(/\\\)/g, ')')   // 转义右括号
            .replace(/\\n/g, '\n')   // 换行符
            .replace(/\\t/g, '\t')   // 制表符
            .replace(/\\r/g, '\r');  // 回车符
    }
    
    /**
     * 解析byte-string值（包括16进制字符串和其他格式）
     * @param {string} value - byte-string值
     * @returns {string}
     */
    parseByteStringValue(value) {
        // 保留尖括号，不进行去除
        // 但需要正确处理转义字符
        return value.replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
    }
    
    /**
     * 解析数组值
     * @param {string} value - 数组值
     * @returns {Array}
     */
    parseArrayValue(value) {
        // 去掉方括号
        if (value.startsWith('[') && value.endsWith(']')) {
            value = value.substring(1, value.length - 1);
        }
        
        // 使用parseArrayContent方法来解析数组内容
        return this.parseArrayContent(value);
    }
    
    /**
     * 解析字典值
     * @param {string} value - 字典值
     * @returns {Object}
     */
    parseDictionaryValue(value) {
        // 去掉尖括号
        if (value.startsWith('<<') && value.endsWith('>>')) {
            value = value.substring(2, value.length - 2);
        }
        
        // 递归解析嵌套字典
        return this.parseDictEntries(value);
    }
    
    /**
     * 解析间接引用值
     * @param {string} value - 间接引用值
     * @returns {string}
     */
    parseReferenceValue(value) {
        return `Indirect Reference (${value})`;
    }
    
    /**
     * 解析未知值
     * @param {string} value - 未知值
     * @returns {any}
     */
    parseUnknownValue(value) {
        // 尝试推断类型
        if (value.match(/^\d+\s+\d+\s+R$/)) {
            return `Indirect Reference (${value})`;
        } else if (value.match(/^\d+$/)) {
            return parseInt(value);
        } else if (value.match(/^\d+\.\d+$/)) {
            return parseFloat(value);
        } else {
            return value;
        }
    }

    /**
     * 解析数组内容
     * @param {string} arrayContent - 数组内容字符串
     * @returns {Array}
     */
    parseArrayContent(arrayContent) {
        try {
            const items = [];
            let i = 0;
            const len = arrayContent.length;
            
            while (i < len) {
                // 跳过空白
                while (i < len && /\s/.test(arrayContent[i])) i++;
                if (i >= len) break;
                
                let value = '';
                let valStart = i;
                
                if (arrayContent[i] === '<' && i + 1 < len && arrayContent[i + 1] === '<') {
                    // 嵌套字典
                    let brace = 1;
                    i += 2;
                    while (i < len && brace > 0) {
                        if (arrayContent[i] === '<' && i + 1 < len && arrayContent[i + 1] === '<') {
                            brace++;
                            i += 2;
                        } else if (arrayContent[i] === '>' && i + 1 < len && arrayContent[i + 1] === '>') {
                            brace--;
                            i += 2;
                        } else {
                            i++;
                        }
                    }
                    value = arrayContent.substring(valStart, i);
                    items.push(this.parseDictionaryValue(value));
                } else if (arrayContent[i] === '<') {
                    // byte-string - 查找对应的 >
                    let valStart = i;
                    i++;
                    while (i < len && arrayContent[i] !== '>') i++;
                    if (i < len) {
                        value = arrayContent.substring(valStart, i + 1);
                        i++; // 移动到 > 之后
                        items.push(this.parseByteStringValue(value));
                    } else {
                        value = arrayContent.substring(valStart, i);
                        items.push(this.parseByteStringValue(value));
                    }
                } else if (arrayContent[i] === '(') {
                    // 字符串
                    let brace = 1;
                    i++;
                    while (i < len && brace > 0) {
                        if (arrayContent[i] === '\\') {
                            i += 2; // 跳过转义字符
                        } else if (arrayContent[i] === '(') {
                            brace++;
                            i++;
                        } else if (arrayContent[i] === ')') {
                            brace--;
                            i++;
                        } else {
                            i++;
                        }
                    }
                    value = arrayContent.substring(valStart, i);
                    items.push(this.parseStringValue(value));
                } else if (arrayContent[i] === '[') {
                    // 嵌套数组 - 直接解析，避免递归调用
                    let bracket = 1;
                    i++;
                    while (i < len && bracket > 0) {
                        if (arrayContent[i] === '[') {
                            bracket++;
                            i++;
                        } else if (arrayContent[i] === ']') {
                            bracket--;
                            i++;
                        } else {
                            i++;
                        }
                    }
                    value = arrayContent.substring(valStart, i);
                    // 去掉方括号并递归解析
                    const nestedContent = value.substring(1, value.length - 1);
                    items.push(this.parseArrayContent(nestedContent));
                } else {
                    // 检查是否是间接引用模式
                    const refResult = this.tryParseIndirectReference(arrayContent, i);
                    if (refResult) {
                        items.push(refResult.value);
                        i = refResult.nextIndex;
                    } else {
                        // 普通值
                        while (i < len && !/\s/.test(arrayContent[i])) {
                            i++;
                        }
                        value = arrayContent.substring(valStart, i).trim();
                        
                        // 使用 guessType 方法来正确识别类型
                        const type = this.guessType(value);
                        items.push(this.parseValueByType(value, type));
                    }
                }
            }
            
            return items;
        } catch (error) {
            console.error('解析数组内容失败:', error);
            return [];
        }
    }

    /**
     * 尝试解析间接引用
     * @param {string} content - 内容字符串
     * @param {number} startIndex - 开始索引
     * @returns {Object|null} - 返回 {value, nextIndex} 或 null
     */
    tryParseIndirectReference(content, startIndex) {
        const len = content.length;
        let i = startIndex;
        
        // 跳过空白
        while (i < len && /\s/.test(content[i])) i++;
        if (i >= len) return null;
        
        // 检查是否是数字
        if (!/\d/.test(content[i])) return null;
        
        // 读取第一个数字
        let num1 = '';
        while (i < len && /\d/.test(content[i])) {
            num1 += content[i];
            i++;
        }
        
        // 跳过空白
        while (i < len && /\s/.test(content[i])) i++;
        if (i >= len) return null;
        
        // 检查是否是数字
        if (!/\d/.test(content[i])) return null;
        
        // 读取第二个数字
        let num2 = '';
        while (i < len && /\d/.test(content[i])) {
            num2 += content[i];
            i++;
        }
        
        // 跳过空白
        while (i < len && /\s/.test(content[i])) i++;
        if (i >= len) return null;
        
        // 检查是否是 'R'
        if (content[i] !== 'R') return null;
        i++;
        
        // 构造间接引用值
        const refValue = `${num1} ${num2} R`;
        return {
            value: this.parseReferenceValue(refValue),
            nextIndex: i
        };
    }

    // TYPE_MAP已移动到PDFStructure类中

    determineObjectType(properties) {
        if (!properties || !properties.Type) {
            // === 新增：检测Stream对象 ===
            // 检查原始内容是否包含stream和endstream
            if (this.currentRawContent) {
                const hasStream = this.currentRawContent.includes('stream') && this.currentRawContent.includes('endstream');
                if (hasStream) {
                    return 'Stream';
                }
            }
            return 'Unknown';
        }
        const type = properties.Type;
        return PDFStructure.TYPE_MAP[type]?.type || 'Unknown';
    }

    parseObjectByType(properties, objectType) {
        const result = { ...properties };
        const typeInfo = PDFStructure.TYPE_MAP[objectType];
        if (typeInfo) {
            result.description = typeInfo.description;
            // 根据类型添加特定属性
            switch (objectType) {
                case 'Catalog':
                    if (properties.Pages) result.hasPagesTree = true;
                    if (properties.Outlines) result.hasOutlines = true;
                    break;
                case 'Pages':
                    result.pageCount = properties.Count || 0;
                    result.hasKids = Array.isArray(properties.Kids) && properties.Kids.length > 0;
                    break;
                case 'Page':
                    if (properties.MediaBox) {
                        result.pageSize = {
                            width: properties.MediaBox[2] - properties.MediaBox[0],
                            height: properties.MediaBox[3] - properties.MediaBox[1]
                        };
                    }
                    if (properties.Contents) result.hasContent = true;
                    if (properties.Resources) result.hasResources = true;
                    break;
                case 'Font':
                    result.fontType = properties.Subtype || 'Unknown';
                    result.fontName = properties.BaseFont || 'Unknown';
                    result.encoding = properties.Encoding || 'Unknown';
                    break;
                case 'Stream':
                    result.streamLength = properties.Length || 0;
                    result.hasStreamData = true;
                    // === 新增：解析Filter属性 ===
                    if (properties.Filter) {
                        result.filter = properties.Filter;
                        // 如果是数组，表示多个过滤器
                        if (Array.isArray(properties.Filter)) {
                            result.filters = properties.Filter;
                            result.filterCount = properties.Filter.length;
                        } else {
                            result.filters = [properties.Filter];
                            result.filterCount = 1;
                        }
                    }
                    // 解析DecodeParms（解码参数）
                    if (properties.DecodeParms) {
                        result.decodeParams = properties.DecodeParms;
                    }
                    
                    // === 新增：打印完整stream内容 ===
                    if (properties.streamData) {
                        const streamData = properties.streamData;
                        
                        console.log(`=== Stream内容 (长度: ${streamData.length}) ===`);
                        console.log(streamData);
                        console.log('=== Stream内容结束 ===');
                        
                        // 将stream内容添加到结果中
                        result.streamData = streamData;
                        result.streamFullLength = streamData.length;
                    }
                    break;
                case 'XObject':
                    result.xObjectType = properties.Subtype || 'Unknown';
                    if (properties.Subtype === 'Image') {
                        result.imageInfo = {
                            width: properties.Width,
                            height: properties.Height,
                            colorSpace: properties.ColorSpace,
                            bitsPerComponent: properties.BitsPerComponent
                        };
                    }
                    break;
                case 'Outlines':
                    result.outlineCount = properties.Count || 0;
                    result.hasFirstOutline = !!properties.First;
                    result.hasLastOutline = !!properties.Last;
                    break;
                case 'Metadata':
                    result.metadataType = properties.Subtype || 'Unknown';
                    result.metadataLength = properties.Length || 0;
                    break;
                case 'Action':
                    result.actionType = properties.S || 'Unknown';
                    if (properties.S === 'URI') {
                        result.targetURI = properties.URI;
                    }
                    break;
                case 'Annot':
                    result.annotationType = properties.Subtype || 'Unknown';
                    if (properties.Rect) {
                        result.annotationBounds = {
                            x1: properties.Rect[0],
                            y1: properties.Rect[1],
                            x2: properties.Rect[2],
                            y2: properties.Rect[3]
                        };
                    }
                    break;
                case 'Dest':
                    if (properties.D) {
                        result.destination = properties.D;
                    }
                    break;
                case 'PageLabel':
                    if (properties.Nums) {
                        result.labelRules = properties.Nums;
                    }
                    break;
                case 'StructTreeRoot':
                    if (properties.K) {
                        result.structureElements = properties.K;
                    }
                    if (properties.RoleMap) {
                        result.roleMapping = properties.RoleMap;
                    }
                    break;
                case 'StructElem':
                    result.structureType = properties.S || 'Unknown';
                    if (properties.P) {
                        result.parentStructure = properties.P;
                    }
                    break;
                case 'OCG':
                    result.layerName = properties.Name || 'Unknown';
                    if (properties.Usage) {
                        result.visibilitySettings = properties.Usage;
                    }
                    break;
                case 'ColorSpace':
                    result.colorSpaceType = properties.Subtype || 'Unknown';
                    break;
                case 'Pattern':
                    result.patternType = properties.Subtype || 'Unknown';
                    break;
                case 'Shading':
                    result.shadingType = properties.Subtype || 'Unknown';
                    if (properties.Coords) {
                        result.gradientCoords = properties.Coords;
                    }
                    break;
                case 'ExtGState':
                    if (properties.CA !== undefined) {
                        result.transparency = properties.CA;
                    }
                    if (properties.BM) {
                        result.blendMode = properties.BM;
                    }
                    break;
                case 'XRef':
                    result.xrefSize = properties.Size || 0;
                    result.xrefIndex = properties.Index || [];
                    if (properties.Root) {
                        result.rootReference = properties.Root;
                    }
                    if (properties.Info) {
                        result.infoReference = properties.Info;
                    }
                    break;
                case 'ObjStm':
                    result.objStmCount = properties.N || 0;
                    result.objStmFirst = properties.First || 0;
                    result.objStmLength = properties.Length || 0;
                    break;
                case 'FontDescriptor':
                    result.fontName = properties.FontName || 'Unknown';
                    result.fontFamily = properties.FontFamily || 'Unknown';
                    result.fontStyle = properties.FontStyle || 'Unknown';
                    break;
            }
        } else {
            result.description = '未知对象类型';
        }
        return result;
    }

    /**
     * 提取文件信息
     * @param {File} file - 文件对象
     * @returns {Object}
     */
    extractFileInfo(file) {
        return {
            name: file.name,
            size: this.formatFileSize(file.size),
            type: file.type,
            lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : 'Unknown'
        };
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 获取原始 PDF 数据
     * @returns {string}
     */
    getRawData() {
        if (!this.pdfStructure) return 'No data available';
        
        return JSON.stringify(this.pdfStructure.export(), null, 2);
    }
}

// 兼容浏览器和Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
module.exports = PDFParser;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.PDFParser = PDFParser;
}