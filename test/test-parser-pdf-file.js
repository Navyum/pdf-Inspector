const PDFParser = require('../js/pdf-parser.js');

// Mock File 类
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

// Mock FileReader 类
class MockFileReader {
    constructor() {
        this.result = null;
    }

    readAsArrayBuffer(file) {
        this.result = file.content;
        if (this.onload) {
            this.onload();
        }
    }
}

// 全局 FileReader
global.FileReader = MockFileReader;

class PDFFileTest {
    constructor() {
        this.parser = new PDFParser();
        this.testResults = [];
    }

    async runAllTests() {
        console.log('=== PDF 文件测试开始 ===\n');
        
        await this.testComplexPDF();
        await this.testCustomPDFSet();
        
        this.printTestResults();
        console.log('\n=== 测试完成 ===');
    }

    /**
     * 测试复杂PDF
     */
    async testComplexPDF() {
        console.log('====测试 1: 复杂PDF解析====');
        
        try {
            const complexPDF = this.createComplexPDF();
            const mockFile = new MockFile('complex.pdf', complexPDF.byteLength, complexPDF);
            const result = await this.parser.parsePDF(mockFile);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const structure = result.structure;
            const success = structure.physical.header && 
                           structure.physical.objects.length >= 5;
            
            this.testResults.push({
                test: '复杂PDF解析',
                case: '多类型对象PDF',
                success: success,
                expected: { hasValidHeader: true, hasObjects: true, objectCount: 5 },
                actual: { 
                    hasValidHeader: !!structure.physical.header, 
                    hasObjects: structure.physical.objects.length > 0,
                    objectCount: structure.physical.objects.length,
                    version: structure.physical.header?.version || 'unknown'
                }
            });
            
            console.log(`结果: 复杂PDF: %c${success ? '✓' : '✗'}`, `color:${success ? 'green' : 'red'};font-weight:bold`);
            if (success) {
                console.log(`    头部: ${structure.physical.header?.version || 'unknown'}`);
                console.log(`    对象: ${structure.physical.objects.length} 个`);
                console.log(`    类型统计:`, structure.stats);
                
                // 检查特定对象类型
                const catalogObj = structure.physical.objects.find(obj => obj.type === 'Catalog');
                const pagesObj = structure.physical.objects.find(obj => obj.type === 'Pages');
                const pageObj = structure.physical.objects.find(obj => obj.type === 'Page');
                const fontObj = structure.physical.objects.find(obj => obj.type === 'Font');
                
                if (catalogObj && pagesObj && pageObj && fontObj) {
                    console.log(`    包含所有主要对象类型: ✓`);
                } else {
                    console.log(`    包含所有主要对象类型: ✗`);
                    console.log(`    缺少对象类型: ${catalogObj ? '' : 'Catalog'}, ${pagesObj ? '' : 'Pages'}, ${pageObj ? '' : 'Page'}, ${fontObj ? '' : 'Font'}`);
                }
            }
            
        } catch (error) {
            this.testResults.push({
                test: '复杂PDF解析',
                case: '多类型对象PDF',
                success: false,
                error: error.message
            });
            console.log(`  复杂PDF: ✗ (错误: ${error.message})`);
        }
        console.log('');
    }

    /**
     * 测试自定义PDF集
     */
    async testCustomPDFSet() {
        console.log('====测试 2: 自定义PDF测试集====');
        const fs = require('fs');
        const path = require('path');
        const testpdfPath = path.join(__dirname, 'testpdf');
        
        try {
            const files = fs.readdirSync(testpdfPath);
            for (const file of files) {
                if (file.endsWith('.pdf')) {
                    const filePath = path.join(testpdfPath, file);
                    const fileContent = fs.readFileSync(filePath);
                    const mockFile = new MockFile(file, fileContent.length, fileContent);
                    const result = await this.parser.parsePDF(mockFile);
                    if (!result.success) {
                        throw new Error(result.error);
                    }
                    const structure = result.structure;
                    const success = structure.physical.header && structure.physical.objects.length >= 5;
                    this.testResults.push({
                        test: '自定义PDF测试集',
                        case: file,
                        success: success,
                        expected: { hasValidHeader: true, hasObjects: true, objectCount: 5 },
                        actual: { 
                            hasValidHeader: !!structure.physical.header, 
                            hasObjects: structure.physical.objects.length > 0,
                            objectCount: structure.physical.objects.length,
                            version: structure.physical.header?.version || 'unknown'
                        }
                    });
                    console.log(`结果: ${file}: %c${success ? '✓' : '✗'}`, `color:${success ? 'green' : 'red'};font-weight:bold`);
                }
            }
        } catch (error) {
            console.log(`自定义PDF测试集: 跳过 (${error.message})`);
        }
        console.log('');
    }

    /**
     * 创建复杂PDF数据
     */
    createComplexPDF() {
        const pdfContent = `%PDF-1.7
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
/Outlines 3 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Count 1
/Kids [4 0 R]
>>
endobj

3 0 obj
<<
/Type /Outlines
/First 5 0 R
/Last 5 0 R
/Count 1
>>
endobj

4 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 6 0 R
/Resources << /Font << /F1 7 0 R >> >>
>>
endobj

5 0 obj
<<
/Type /Action
/S /URI
/URI (https://example.com)
>>
endobj

6 0 obj
<<
/Length 45
>>
stream
1 0 0 1 50 700 cm
/F1 12 Tf
(Hello, PDF!) Tj
endstream
endobj

7 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
/Encoding /WinAnsiEncoding
>>
endobj

xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000207 00000 n 
0000000278 00000 n 
0000000349 00000 n 
0000000418 00000 n 

trailer
<<
/Size 8
/Root 1 0 R
>>
startxref
500
%%EOF`;

        const encoder = new TextEncoder();
        return encoder.encode(pdfContent);
    }

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
    const test = new PDFFileTest();
    test.runAllTests().catch(console.error);
} 