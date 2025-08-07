/**
 * PDF 对象类型测试
 * 基于PDF规范中的所有常见对象类型进行测试
 */

class MockFile {
    constructor(name, size, content) {
        this.name = name;
        this.size = size;
        this.content = content;
    }
    
    async arrayBuffer() {
        return this.content;
    }
}

class MockFileReader {
    constructor() {
        this.result = null;
    }
    
    readAsArrayBuffer(file) {
        this.result = file.content;
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 0);
    }
}

// 模拟 FileReader
global.FileReader = MockFileReader;

// 导入 PDF 解析器
const PDFParser = require('../../src/js/pdf-parser.js');

/**
 * PDF 对象类型测试类
 */
class PDFTypeTest {
    constructor() {
        this.parser = new PDFParser();
        this.testResults = [];
    }
    
    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('=== PDF 对象类型测试开始 ===\n');
        
        await this.testBooleanObjects();
        await this.testNumericObjects();
        await this.testStringObjects();
        await this.testLiteralStringObjects();
        await this.testHexadecimalStringObjects();
        await this.testNameObjects();
        await this.testArrayObjects();
        await this.testDictionaryObjects();
        await this.testBoundaryCases();
        await this.testBasicStructureTypes();
        await this.testContentTypes();
        await this.testInteractiveTypes();
        await this.testAdvancedTypes();
        
        this.printTestResults();
        console.log('\n=== 测试完成 ===');
    }
    
    /**
     * 测试Boolean对象
     */
    async testBooleanObjects() {
        console.log('====测试 1: Boolean对象====');
        
        const testCases = [
            {
                name: 'True值',
                content: '/Visible true',
                expected: {
                    Visible: true,
                    description: '布尔值true'
                }
            },
            {
                name: 'False值',
                content: '/Hidden false',
                expected: {
                    Hidden: false,
                    description: '布尔值false'
                }
            },
            {
                name: '混合Boolean值',
                content: '/Print true /Screen false /Edit true',
                expected: {
                    Print: true,
                    Screen: false,
                    Edit: true,
                    description: '多个布尔值的混合使用'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('Boolean对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试Numeric对象
     */
    async testNumericObjects() {
        console.log('====测试 2: Numeric对象====');
        
        const testCases = [
            {
                name: '整数',
                content: '/Count 5',
                expected: {
                    Count: 5,
                    description: '整数值'
                }
            },
            {
                name: '浮点数',
                content: '/Version 1.4',
                expected: {
                    Version: 1.4,
                    description: '浮点数值'
                }
            },
            {
                name: '负数',
                content: '/X -100 /Y -200.5',
                expected: {
                    X: -100,
                    Y: -200.5,
                    description: '负数值'
                }
            },
            {
                name: '零值',
                content: '/Offset 0 /Scale 0.0',
                expected: {
                    Offset: 0,
                    Scale: 0.0,
                    description: '零值'
                }
            },
            {
                name: '大数值',
                content: '/Length 30000 /Size 1048576',
                expected: {
                    Length: 30000,
                    Size: 1048576,
                    description: '大数值'
                }
            },
            {
                name: '科学计数法',
                content: '/Scale 1.23e-4 /Factor 1.23E+4',
                expected: {
                    Scale: 1.23e-4,
                    Factor: 1.23E+4,
                    description: '科学计数法数值'
                }
            },
            {
                name: '负零值',
                content: '/Offset -0 /Scale -0.0',
                expected: {
                    Offset: -0,
                    Scale: -0.0,
                    description: '负零值'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('Numeric对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试String对象
     */
    async testStringObjects() {
        console.log('====测试 3: String对象====');
        
        const testCases = [
            {
                name: '简单字符串',
                content: '/Title (Hello World)',
                expected: {
                    Title: 'Hello World',
                    description: '简单字符串值'
                }
            },
            {
                name: '包含空格字符串',
                content: '/Author (John Doe)',
                expected: {
                    Author: 'John Doe',
                    description: '包含空格的字符串'
                }
            },
            {
                name: '空字符串',
                content: '/Subject ()',
                expected: {
                    Subject: '',
                    description: '空字符串'
                }
            },
            {
                name: '特殊字符字符串',
                content: '/Keywords (PDF, Document, Test)',
                expected: {
                    Keywords: 'PDF, Document, Test',
                    description: '包含特殊字符的字符串'
                }
            },
            {
                name: '转义字符字符串',
                content: '/Text (Hello\\nWorld\\tTab)',
                expected: {
                    Text: 'Hello\nWorld\tTab',
                    description: '包含转义字符的字符串'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('String对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试Literal String对象
     */
    async testLiteralStringObjects() {
        console.log('====测试 4: Literal String对象====');
        
        const testCases = [
            {
                name: '转义字符字符串',
                content: '/Text (Hello\\nWorld\\tTab\\rReturn)',
                expected: {
                    Text: 'Hello\nWorld\tTab\rReturn',
                    description: '包含转义字符的字符串'
                }
            },
            {
                name: '括号转义字符串',
                content: '/Path (C:\\Users\\Name\\File.pdf)',
                expected: {
                    Path: 'C:\\Users\\Name\\File.pdf',
                    description: '包含反斜杠转义的字符串'
                }
            },
            {
                name: '复杂转义字符串',
                content: '/Content (Line1\\nLine2\\tIndented\\rReturn)',
                expected: {
                    Content: 'Line1\nLine2\tIndented\rReturn',
                    description: '包含多种转义字符的字符串'
                }
            },
            {
                name: 'badcase对象2字典',
                content: '/CreationDate(D:20230807203004+08\'00\')/Creator<FEFF0077006B00680074006D006C0074006F00700064006600200030002E00310032002E0035>/Keywords(771d626ee28efb0d1Xd-2d65E1NZxJG6UfOWTO2kmvI~)/ModDate(D:20241118164202+08\'00\')/Producer(Qt 4.8.7; modified using iText 5.5.13 2000-2018 iText Group NV \\(AGPL-version\\))/Title<FEFF>',
                expected: {
                    CreationDate: "D:20230807203004+08'00'",
                    Creator: '<FEFF0077006B00680074006D006C0074006F00700064006600200030002E00310032002E0035>',
                    Keywords: '771d626ee28efb0d1Xd-2d65E1NZxJG6UfOWTO2kmvI~',
                    ModDate: "D:20241118164202+08'00'",
                    Producer: 'Qt 4.8.7; modified using iText 5.5.13 2000-2018 iText Group NV (AGPL-version)',
                    Title: '<FEFF>'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('Literal String对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试Hexadecimal String对象
     */
    async testHexadecimalStringObjects() {
        console.log('====测试 5: Hexadecimal String对象====');
        
        const testCases = [
            {
                name: '简单十六进制字符串',
                content: '/Title <FEFF>',
                expected: {
                    Title: '<FEFF>',
                    description: '简单的十六进制字符串'
                }
            },
            {
                name: 'Unicode十六进制字符串',
                content: '/Creator <FEFF00480065006C006C006F>',
                expected: {
                    Creator: '<FEFF00480065006C006C006F>',
                    description: 'Unicode编码的十六进制字符串'
                }
            },
            {
                name: '长十六进制字符串',
                content: '/Content <48656C6C6F20576F726C64>',
                expected: {
                    Content: '<48656C6C6F20576F726C64>',
                    description: '较长的十六进制字符串'
                }
            },
            {
                name: '混合十六进制字符串',
                content: '/Title <FEFF00480065006C006C006F> /Content <48656C6C6F20576F726C64>',
                expected: {
                    Title: '<FEFF00480065006C006C006F>',
                    Content: '<48656C6C6F20576F726C64>',
                    description: '多个十六进制字符串的混合'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('Hexadecimal String对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试Name对象
     */
    async testNameObjects() {
        console.log('====测试 6: Name对象====');
        
        const testCases = [
            {
                name: '简单名称',
                content: '/Type /Catalog',
                expected: {
                    Type: 'Catalog',
                    description: '简单的名称对象'
                }
            },
            {
                name: '字体名称',
                content: '/BaseFont /Helvetica',
                expected: {
                    BaseFont: 'Helvetica',
                    description: '字体名称对象'
                }
            },
            {
                name: '多个名称',
                content: '/Subtype /Type1 /Encoding /WinAnsiEncoding',
                expected: {
                    Subtype: 'Type1',
                    Encoding: 'WinAnsiEncoding',
                    description: '多个名称对象'
                }
            },
            {
                name: '特殊字符名称',
                content: '/Filter /FlateDecode /ColorSpace /DeviceRGB',
                expected: {
                    Filter: 'FlateDecode',
                    ColorSpace: 'DeviceRGB',
                    description: '包含特殊字符的名称对象'
                }
            },
            {
                name: '转义字符名称',
                content: '/Name /#20Space /Bracket /#28Open#29',
                expected: {
                    Name: ' Space',
                    Bracket: '(Open)',
                    description: '包含转义字符的名称对象'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('Name对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试Array对象
     */
    async testArrayObjects() {
        console.log('====测试 7: Array对象====');
        
        const testCases = [
            {
                name: '简单数组',
                content: '/Kids [4 0 R 5 0 R]',
                expected: {
                    Kids: ['Indirect Reference (4 0 R)', 'Indirect Reference (5 0 R)'],
                    description: '简单的间接引用数组'
                }
            },
            {
                name: '数字数组',
                content: '/MediaBox [0 0 612 792]',
                expected: {
                    MediaBox: [0, 0, 612, 792],
                    description: '数字数组'
                }
            },
            {
                name: '混合数组',
                content: '/ProcSet [/PDF /Text]',
                expected: {
                    ProcSet: ['PDF', 'Text'],
                    description: '名称数组'
                }
            },
            {
                name: '嵌套数组',
                content: '/Data [[1 2] [3 4]]',
                expected: {
                    Data: [[1, 2], [3, 4]],
                    description: '嵌套数组'
                }
            },
            {
                name: '深度嵌套数组',
                content: '/DeepArray [[[1 2] [3 4]] [[5 6] [7 8]]]',
                expected: {
                    DeepArray: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]],
                    description: '三层嵌套数组'
                }
            },
            {
                name: '混合内容数组',
                content: '/Mixed [1 0 R /Name 3 0 R 4 5]',
                expected: {
                    Mixed: ['Indirect Reference (1 0 R)', 'Name', 'Indirect Reference (3 0 R)', 4, 5],
                    description: '包含多种类型的混合数组'
                }
            },
            {
                name: '字符串数组',
                content: '/Texts [(Hello) (World) (Test)]',
                expected: {
                    Texts: ['Hello', 'World', 'Test'],
                    description: '字符串数组'
                }
            },
            {
                name: '科学计数法数组',
                content: '/Scales [1.23e-4 1.23E+4 5.67e-2]',
                expected: {
                    Scales: [1.23e-4, 1.23E+4, 5.67e-2],
                    description: '科学计数法数组'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('Array对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试Dictionary对象
     */
    async testDictionaryObjects() {
        console.log('====测试 8: Dictionary对象====');
        
        const testCases = [
            {
                name: '简单字典',
                content: '/Resources << /Font << /F1 7 0 R >> >>',
                expected: {
                    Resources: { Font: { F1: 'Indirect Reference (7 0 R)' } },
                    description: '简单的嵌套字典'
                }
            },
            {
                name: '复杂嵌套字典',
                content: '/Nested << /Level1 << /Level2 << /Level3 /Value3 >> >> >>',
                expected: {
                    Nested: { Level1: { Level2: { Level3: 'Value3' } } },
                    description: '多层嵌套字典'
                }
            },
            {
                name: '混合字典',
                content: '/Mixed << /String (Hello) /Number 42 /Boolean true /Array [1 2 3] >>',
                expected: {
                    Mixed: { String: 'Hello', Number: 42, Boolean: true, Array: [1, 2, 3] },
                    description: '包含多种类型的字典'
                }
            },
            {
                name: '页面资源字典',
                content: '/Resources << /Font << /F1 18 0 R >> /ProcSet [/PDF /Text] /XObject << /I1 19 0 R >> >>',
                expected: {
                    Resources: { 
                        Font: { F1: 'Indirect Reference (18 0 R)' }, 
                        ProcSet: ['PDF', 'Text'], 
                        XObject: { I1: 'Indirect Reference (19 0 R)' } 
                    },
                    description: '页面资源字典'
                }
            },
            {
                name: '表单字段字典',
                content: '/Fields [10 0 R 11 0 R] /DR << /Font << /F1 12 0 R /F2 13 0 R >> /XObject << /I1 14 0 R >> >>',
                expected: {
                    Fields: ['Indirect Reference (10 0 R)', 'Indirect Reference (11 0 R)'],
                    DR: { Font: { F1: 'Indirect Reference (12 0 R)', F2: 'Indirect Reference (13 0 R)' }, XObject: { I1: 'Indirect Reference (14 0 R)' } },
                    description: '表单字段和资源字典'
                }
            },
            {
                name: '科学计数法字典',
                content: '/Scales << /X 1.23e-4 /Y 1.23E+4 /Z 5.67e-2 >>',
                expected: {
                    Scales: { X: 1.23e-4, Y: 1.23E+4, Z: 5.67e-2 },
                    description: '包含科学计数法的字典'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('Dictionary对象', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试边界情况
     */
    async testBoundaryCases() {
        console.log('====测试 9: 边界情况====');
        
        const testCases = [
            {
                name: '空字符串',
                content: '/Empty ()',
                expected: {
                    Empty: '',
                    description: '空字符串值'
                }
            },
            {
                name: '空白字符串',
                content: '/Space (   )',
                expected: {
                    Space: '   ',
                    description: '包含空白的字符串'
                }
            },
            {
                name: '特殊数学值',
                content: '/Values [null undefined NaN Infinity -Infinity]',
                expected: {
                    Values: ['null', 'undefined', 'NaN', 'Infinity', '-Infinity'],
                    description: '特殊数学值（作为字符串处理）'
                }
            },
            {
                name: '无效数字格式',
                content: '/Invalid [12.34.56 12-34 12+34]',
                expected: {
                    Invalid: ['12.34.56', '12-34', '12+34'],
                    description: '无效数字格式（作为字符串处理）'
                }
            },
            {
                name: '字母数字混合',
                content: '/Mixed [abc123 123abc]',
                expected: {
                    Mixed: ['abc123', '123abc'],
                    description: '字母数字混合（作为字符串处理）'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('边界情况', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试基础结构类型
     */
    async testBasicStructureTypes() {
        console.log('====测试 9: 基础结构类型====');
        
        const testCases = [
            {
                name: 'Catalog 对象',
                content: '/Type /Catalog /Pages 2 0 R /Outlines 3 0 R',
                expected: {
                    type: 'Catalog',
                    hasPagesTree: true,
                    hasOutlines: true,
                    description: '文档根对象，包含页面树、大纲等核心信息引用'
                }
            },
            {
                name: 'Pages 对象',
                content: '/Type /Pages /Count 2 /Kids [4 0 R 5 0 R]',
                expected: {
                    type: 'Pages',
                    pageCount: 2,
                    hasKids: true,
                    description: '页面树容器，管理所有页面'
                }
            },
            {
                name: 'Page 对象',
                content: '/Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 7 0 R >> >>',
                expected: {
                    type: 'Page',
                    Contents: 'Indirect Reference (6 0 R)',
                    MediaBox: [0, 0, 612, 792],
                    description: '单个页面对象，包含页面尺寸、内容流、资源等'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('基础结构类型', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试内容类型
     */
    async testContentTypes() {
        console.log('====测试 10: 内容类型====');
        
        const testCases = [
            {
                name: 'Font 对象 (Type1)',
                content: '/Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding',
                expected: {
                    type: 'Font',
                    fontType: 'Type1',
                    fontName: 'Helvetica',
                    encoding: 'WinAnsiEncoding',
                    description: '字体定义对象，包含字体类型、名称和编码方式'
                }
            },
            {
                name: 'Font 对象 (TrueType)',
                content: '/Type /Font /Subtype /TrueType /BaseFont /Arial /Encoding /Unicode',
                expected: {
                    type: 'Font',
                    fontType: 'TrueType',
                    fontName: 'Arial',
                    encoding: 'Unicode',
                    description: '字体定义对象，包含字体类型、名称和编码方式'
                }
            },
            {
                name: 'Stream 对象',
                content: '/Type /Stream /Length 45',
                expected: {
                    Type: 'Stream',
                    Length: 45,
                    description: '二进制数据流对象，用于存储页面内容、图像、字体数据等'
                }
            },
            {
                name: 'XObject Image 对象',
                content: '/Type /XObject /Subtype /Image /Width 100 /Height 100 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length 30000',
                expected: {
                    type: 'XObject',
                    Subtype: 'Image',
                    Width: 100,
                    Height: 100,
                    ColorSpace: 'DeviceRGB',
                    BitsPerComponent: 8,
                    description: '外部资源对象，包含图像或表单等外部引入资源'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('内容类型', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试交互类型
     */
    async testInteractiveTypes() {
        console.log('====测试 11: 交互类型====');
        
        const testCases = [
            {
                name: 'Action URI 对象',
                content: '/Type /Action /S /URI /URI (https://example.com)',
                expected: {
                    type: 'Action',
                    S: 'URI',
                    description: '定义交互动作（如跳转、打开链接等）'
                }
            },
            {
                name: 'Annot Link 对象',
                content: '/Type /Annot /Subtype /Link /Rect [100 600 200 620] /A 12 0 R',
                expected: {
                    type: 'Annot',
                    Subtype: 'Link',
                    Rect: [100, 600, 200, 620],
                    A: 'Indirect Reference (12 0 R)',
                    description: '定义页面注释（如文本框、高亮、链接等）'
                }
            },
            {
                name: 'Dest 对象',
                content: '/Type /Dest /D [4 0 R /FitH 700]',
                expected: {
                    type: 'Dest',
                    D: ['Indirect Reference (4 0 R)', 'FitH', 700],
                    description: '定义跳转目的地（页面位置）'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('交互类型', testCase);
        }
        console.log('');
    }
    
    /**
     * 测试高级类型
     */
    async testAdvancedTypes() {
        console.log('====测试 12: 高级类型====');
        
        const testCases = [
            {
                name: 'Outlines 对象',
                content: '/Type /Outlines /First 9 0 R /Last 10 0 R /Count 2',
                expected: {
                    Type: 'Outlines',
                    First: 'Indirect Reference (9 0 R)',
                    Last: 'Indirect Reference (10 0 R)',
                    Count: 2,
                    description: '文档大纲容器，管理书签结构'
                }
            },
            {
                name: 'Metadata 对象',
                content: '/Type /Metadata /Subtype /XML /Length 500',
                expected: {
                    Type: 'Metadata',
                    Subtype: 'XML',
                    Length: 500,
                    description: '文档元数据对象，存储标题、作者、创建日期等信息'
                }
            },
            {
                name: 'PageLabel 对象',
                content: '/Type /PageLabel /Nums [0 << /S /r >> 5 << /S /D /P (Chapter 1-) >>]',
                expected: {
                    type: 'PageLabel',
                    Nums: [0, { S: 'r' }, 5, { S: 'D', P: 'Chapter 1-' }],
                    description: '定义页面编号格式（如罗马数字、章节前缀）'
                }
            },
            {
                name: 'StructTreeRoot 对象',
                content: '/Type /StructTreeRoot /K [17 0 R 18 0 R] /RoleMap << /H1 /Head1 /P /Paragraph >>',
                expected: {
                    Type: 'StructTreeRoot',
                    K: ['Indirect Reference (17 0 R)', 'Indirect Reference (18 0 R)'],
                    RoleMap: { H1: 'Head1', P: 'Paragraph' },
                    description: '结构化文档的根节点，定义文档逻辑结构'
                }
            },
            {
                name: 'OCG 对象',
                content: '/Type /OCG /Usage << /Print << /PrintState /On >> >>',
                expected: {
                    Type: 'OCG',
                    Usage: { Print: { PrintState: 'On' } },
                    description: '可选内容组（层），用于控制内容的显示/隐藏'
                }
            },
            {
                name: '复杂嵌套字典',
                content: '/Type /Complex /Nested << /Level1 << /Level2 << /Level3 /Value3 >> >> >> /Array [1 2 [3 4] 5]',
                expected: {
                    Type: 'Complex',
                    Nested: { Level1: { Level2: { Level3: 'Value3' } } },
                    Array: [1, 2, [3, 4], 5],
                    description: '包含多层嵌套字典和数组的复杂对象'
                }
            },
            {
                name: '混合间接引用数组',
                content: '/Type /Mixed /Kids [1 0 R 2 0 R /Name 3 0 R] /Refs [4 0 R 5 0 R 6 0 R]',
                expected: {
                    Type: 'Mixed',
                    Kids: ['Indirect Reference (1 0 R)', 'Indirect Reference (2 0 R)', 'Name', 'Indirect Reference (3 0 R)'],
                    Refs: ['Indirect Reference (4 0 R)', 'Indirect Reference (5 0 R)', 'Indirect Reference (6 0 R)'],
                    description: '包含间接引用和普通值的混合数组'
                }
            },
            {
                name: '深度嵌套数组',
                content: '/Type /DeepArray /Data [[[1 2] [3 4]] [[5 6] [7 8]]] /Simple [9 10]',
                expected: {
                    Type: 'DeepArray',
                    Data: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]],
                    Simple: [9, 10],
                    description: '包含三层嵌套数组的复杂结构'
                }
            },
            {
                name: '复杂字符串转义',
                content: '/Type /Escape /Text (Hello\\nWorld\\tTab\\rReturn) /Path (C:\\Users\\Name\\File.pdf)',
                expected: {
                    Type: 'Escape',
                    Text: 'Hello\nWorld\tTab\rReturn',
                    Path: 'C:\\Users\\Name\\File.pdf',
                    description: '包含各种转义字符的字符串'
                }
            },
            {
                name: '十六进制字符串嵌套',
                content: '/Type /HexNested /Title <FEFF00480065006C006C006F> /Content <48656C6C6F20576F726C64>',
                expected: {
                    Type: 'HexNested',
                    Title: '<FEFF00480065006C006C006F>',
                    Content: '<48656C6C6F20576F726C64>',
                    description: '包含多个十六进制字符串的对象'
                }
            },
            {
                name: '复杂表单字段',
                content: '/Type /Form /Fields [10 0 R 11 0 R] /DR << /Font << /F1 12 0 R /F2 13 0 R >> /XObject << /I1 14 0 R >> >>',
                expected: {
                    Type: 'Form',
                    Fields: ['Indirect Reference (10 0 R)', 'Indirect Reference (11 0 R)'],
                    DR: { Font: { F1: 'Indirect Reference (12 0 R)', F2: 'Indirect Reference (13 0 R)' }, XObject: { I1: 'Indirect Reference (14 0 R)' } },
                    description: '包含字段数组和嵌套资源字典的表单对象'
                }
            },
            {
                name: '页面树结构',
                content: '/Type /Pages /Kids [15 0 R 16 0 R 17 0 R] /Count 3 /MediaBox [0 0 595 842] /Resources << /Font << /F1 18 0 R >> /ProcSet [/PDF /Text] >>',
                expected: {
                    Type: 'Pages',
                    Kids: ['Indirect Reference (15 0 R)', 'Indirect Reference (16 0 R)', 'Indirect Reference (17 0 R)'],
                    Count: 3,
                    MediaBox: [0, 0, 595, 842],
                    Resources: { Font: { F1: 'Indirect Reference (18 0 R)' }, ProcSet: ['PDF', 'Text'] },
                    description: '包含页面数组和资源字典的页面树对象'
                }
            }
        ];
        
        for (let testCase of testCases) {
            await this.runTypeTest('高级类型', testCase);
        }
        console.log('');
    }
    

    
    
    /**
     * 运行单个类型测试
     */
    async runTypeTest(category, testCase) {
        try {
            // 创建一个模拟的对象内容字符串
            const mockObjectContent = `1 0 obj\n<<${testCase.content}>>\nendobj`;
            
            // 使用解析器的公共方法解析对象内容
            const objectInfo = this.parser.parseObjectContent(mockObjectContent);
            const objectType = this.parser.determineObjectType(objectInfo);
            const enhancedProperties = this.parser.parseObjectByType(objectInfo, objectType);
            
            // 检查关键属性
            let success = true;
            for (let key in testCase.expected) {
                if (key === 'type') {
                    if (objectType !== testCase.expected[key]) {
                        success = false;
                        break;
                    }
                } else if (key === 'description') {
                    // 描述字段是增强属性，跳过检查
                    continue;
                } else if (Array.isArray(testCase.expected[key])) {
                    // 数组比较
                    if (!Array.isArray(enhancedProperties[key]) || 
                        JSON.stringify(enhancedProperties[key]) !== JSON.stringify(testCase.expected[key])) {
                        success = false;
                        break;
                    }
                } else if (typeof testCase.expected[key] === 'object' && testCase.expected[key] !== null) {
                    // 对象比较
                    if (typeof enhancedProperties[key] !== 'object' || enhancedProperties[key] === null ||
                        JSON.stringify(enhancedProperties[key]) !== JSON.stringify(testCase.expected[key])) {
                        success = false;
                        break;
                    }
                } else if (enhancedProperties[key] !== testCase.expected[key]) {
                    success = false;
                    break;
                }
            }
            
            this.testResults.push({
                test: category,
                case: testCase.name,
                success: success,
                expected: testCase.expected,
                actual: { type: objectType, ...enhancedProperties }
            });
            
            console.log(`结果: ${testCase.name}: %c${success ? '✓' : '✗'}\n`, `color:${success ? 'green' : 'red'};font-weight:bold`);
            if (!success) {
                if (testCase.expected.type !== undefined) {
                    console.log(`    期望类型: ${testCase.expected.type}, 实际类型: ${objectType}`);
                } else {
                    console.log(`    期望值与实际值不匹配`);
                }
                // 添加详细的对比信息
                console.log(`    详细对比:`);
                console.log(`    实际结果:`, JSON.stringify(enhancedProperties, null, 2));
                console.log(`    期望结果:`, JSON.stringify(testCase.expected, null, 2));
                
                // 逐个字段对比
                for (let key in testCase.expected) {
                    const actual = enhancedProperties[key];
                    const expected = testCase.expected[key];
                    const match = JSON.stringify(actual) === JSON.stringify(expected);
                    console.log(`      ${key}: 实际=${JSON.stringify(actual)}, 期望=${JSON.stringify(expected)}, 匹配=${match ? '✓' : '✗'}`);
                }
            }
            
        } catch (error) {
            this.testResults.push({
                test: category,
                case: testCase.name,
                success: false,
                error: error.message
            });
            console.log(`  ${testCase.name}: ✗ (错误: ${error.message})`);
        }
    }
    
    /**
     * 创建复杂PDF
     */

    
    /**
     * 打印测试结果
     */
    printTestResults() {
        console.log('=== 测试结果汇总 ===');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.success).length;
        const successRate = (passedTests / totalTests * 100).toFixed(1);
        
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests}`);
        console.log(`失败: ${totalTests - passedTests}`);
        console.log(`成功率: ${successRate}%\n`);
        
        if (totalTests - passedTests > 0) {
            console.log('失败的测试:');
            this.testResults
                .filter(result => !result.success)
                .forEach(result => {
                    console.log(`  ${result.test} - ${result.case}: ${result.error || '期望值与实际值不匹配'}`);
                });
        }
    }
}

// 运行测试
if (require.main === module) {
    const test = new PDFTypeTest();
    test.runAllTests().catch(console.error);
}

module.exports = { PDFTypeTest }; 