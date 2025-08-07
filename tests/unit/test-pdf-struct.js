const PDFStructure = require('../js/pdf-struct.js');

class PDFStructureTest {
    constructor() {
        this.structure = new PDFStructure();
    }

    async runTest() {
        console.log('=== 测试 PDFStructure 类 ===\n');

        // 测试1: 基本功能
        await this.testBasicFunctions();
        
        // 测试2: 对象管理
        await this.testObjectManagement();
        
        console.log('\n=== 测试完成 ===');
    }

    async testBasicFunctions() {
        console.log('1. 测试基本功能...');
        
        // 设置物理结构
        const physicalInfo = {
            version: '1.7',
            fileSize: 1024000,
            startXref: 1020000,
            header: { version: '1.7', offset: 0 },
            trailer: { Size: 100, Root: '1 0 R' }
        };
        
        this.structure.setPhysicalStructure(physicalInfo);
        
        // 设置逻辑结构
        const logicalInfo = {
            catalog: { objectNumber: 1, type: 'Catalog' },
            pages: { objectNumber: 2, type: 'Pages' }
        };
        
        this.structure.setLogicalStructure(logicalInfo);
        
        console.log('✓ 基本结构设置完成');
        console.log(`  版本: ${this.structure.physical.version}`);
        console.log(`  文件大小: ${this.structure.physical.fileSize}`);
        console.log(`  Catalog: ${this.structure.logical.catalog?.objectNumber}`);
    }

    async testObjectManagement() {
        console.log('\n2. 测试对象管理...');
        
        // 添加测试对象
        const testObjects = [
            {
                objectNumber: 1,
                generation: 0,
                type: 'Catalog',
                properties: {
                    Type: 'Catalog',
                    Pages: 'Indirect Reference (2 0 R)',
                    Outlines: 'Indirect Reference (3 0 R)'
                }
            },
            {
                objectNumber: 2,
                generation: 0,
                type: 'Pages',
                properties: {
                    Type: 'Pages',
                    Count: 2,
                    Kids: [
                        'Indirect Reference (4 0 R)',
                        'Indirect Reference (5 0 R)'
                    ]
                }
            },
            {
                objectNumber: 3,
                generation: 0,
                type: 'Outlines',
                properties: {
                    Type: 'Outlines',
                    Count: 1,
                    First: 'Indirect Reference (6 0 R)'
                }
            },
            {
                objectNumber: 4,
                generation: 0,
                type: 'Page',
                properties: {
                    Type: 'Page',
                    Parent: 'Indirect Reference (2 0 R)',
                    MediaBox: [0, 0, 612, 792],
                    Contents: 'Indirect Reference (7 0 R)',
                    Resources: {
                        Font: {
                            F1: 'Indirect Reference (8 0 R)'
                        }
                    }
                }
            },
            {
                objectNumber: 5,
                generation: 0,
                type: 'Page',
                properties: {
                    Type: 'Page',
                    Parent: 'Indirect Reference (2 0 R)',
                    MediaBox: [0, 0, 612, 792],
                    Contents: 'Indirect Reference (9 0 R)',
                    Resources: {
                        Font: {
                            F1: 'Indirect Reference (8 0 R)'
                        }
                    }
                }
            },
            {
                objectNumber: 6,
                generation: 0,
                type: 'OutlineItem',
                properties: {
                    Title: '(Chapter 1)',
                    Parent: 'Indirect Reference (3 0 R)',
                    Dest: 'Indirect Reference (4 0 R)'
                }
            },
            {
                objectNumber: 7,
                generation: 0,
                type: 'Stream',
                properties: {
                    Type: 'Stream',
                    Length: 45,
                    isStream: true,
                    Filter: 'FlateDecode'
                }
            },
            {
                objectNumber: 8,
                generation: 0,
                type: 'Font',
                properties: {
                    Type: 'Font',
                    Subtype: 'Type1',
                    BaseFont: 'Helvetica',
                    Encoding: 'WinAnsiEncoding'
                }
            },
            {
                objectNumber: 9,
                generation: 0,
                type: 'Stream',
                properties: {
                    Type: 'Stream',
                    Length: 52,
                    isStream: true
                }
            }
        ];
        
        testObjects.forEach(obj => {
            this.structure.addObject(obj);
        });
        
        console.log(`✓ 添加了 ${testObjects.length} 个对象`);
        
        // 测试对象查找
        const catalog = this.structure.getObject(1, 0);
        console.log(`✓ 查找Catalog对象: ${catalog ? '成功' : '失败'}`);
        
        const pageObjects = this.structure.findObjectsByType('Page');
        console.log(`✓ 查找Page对象: ${pageObjects.length} 个`);
        
        const fontObjects = this.structure.findObjectsByProperty('Subtype', 'Type1');
        console.log(`✓ 查找Type1字体: ${fontObjects.length} 个`);
    }

}

// 运行测试
const test = new PDFStructureTest();
test.runTest().catch(console.error); 