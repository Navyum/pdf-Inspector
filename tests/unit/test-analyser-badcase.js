const PDFParser = require('../../src/js/pdf-parser.js');
const PDFStructure = require('../../src/js/pdf-struct.js');
const PDFAnalyser = require('../../src/js/pdf-analyser.js');
const fs = require('fs');
const path = require('path');

class PDFAnalyserBadcaseTest {
    constructor() {
        this.parser = new PDFParser();
        this.testResults = [];
    }

    async runTest() {
        console.log('=== PDFAnalyser Badcase 测试 ===\n');
        
        try {
            await this.testBadcasePDF();
            this.printTestResults();
        } catch (error) {
            console.error('测试执行错误:', error);
        }
        
        console.log('\n=== 测试完成 ===');
    }

    /**
     * 测试 badcase.pdf
     */
    async testBadcasePDF() {
        console.log('====测试 Badcase PDF 分析====');
        
        try {
            // 读取 badcase.pdf 文件
            const pdfPath = path.join(__dirname, '..', 'pdf', 'badcase.pdf');
            if (!fs.existsSync(pdfPath)) {
                throw new Error(`文件不存在: ${pdfPath}`);
            }

            const pdfBuffer = fs.readFileSync(pdfPath);
            
            // 直接使用Buffer，模拟FileReader
            const mockFile = {
                name: 'badcase.pdf',
                size: pdfBuffer.length,
                content: pdfBuffer
            };

            // 直接调用解析方法，跳过FileReader
            console.log('解析PDF文件...');
            const pdfStructure = await this.parser.parsePDFSequentially(pdfBuffer);
            
            const result = {
                success: true,
                structure: pdfStructure,
                fileInfo: {
                    name: 'badcase3.pdf',
                    size: pdfBuffer.length
                }
            };
            
            if (!result.success) {
                throw new Error(`PDF解析失败: ${result.error}`);
            }

            const structure = result.structure;
            console.log('PDF解析成功，开始分析...');

            // 创建分析器
            const analyser = new PDFAnalyser(structure);
            
            // 执行分析（包含验证）
            console.log('执行PDF分析...');
            const analysis = await analyser.analyze();
            
            // 验证已经包含在analysis中，不需要重复调用
            const validation = analysis.validation;
            
            // 获取详细报告
            console.log('生成详细报告...');
            const detailedReport = analyser.getDetailedReport();
            
            // 生成文本报告
            console.log('生成文本报告...');
            const textReport = analyser.generateTextReport();
            
            // 测试结果评估
            const success = this.evaluateAnalysisResults(analysis, validation, structure);
            
            this.testResults.push({
                test: 'Badcase PDF 分析',
                case: '完整分析流程',
                success: success,
                expected: { 
                    hasAnalysis: true, 
                    hasValidation: true, 
                    hasReport: true,
                    hasObjects: true
                },
                actual: { 
                    hasAnalysis: !!analysis,
                    hasValidation: !!validation,
                    hasReport: !!detailedReport,
                    hasObjects: structure.physical.objects.length > 0,
                    objectCount: structure.physical.objects.length,
                    analysisStats: analysis?.stats || {},
                    validationErrors: validation?.errors?.length || 0,
                    validationWarnings: validation?.warnings?.length || 0
                }
            });

            console.log(`结果: Badcase PDF分析: %c${success ? '✓' : '✗'}`, `color:${success ? 'green' : 'red'};font-weight:bold`);
            
            console.log(`    对象数量: ${structure.physical.objects.length}`);
            console.log(`    分析统计:`, analysis.stats);
            console.log(`    验证错误: ${validation.errors.length}`);
            console.log(`    验证警告: ${validation.warnings.length}`);
            
            // 显示一些关键信息
            if (structure.physical.objects.length > 0) {
                const objectTypes = structure.physical.objects.map(obj => obj.type);
                const typeCounts = {};
                objectTypes.forEach(type => {
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
                console.log(`    对象类型分布:`, typeCounts);
            }
            
            // 显示全部错误（如果有）
            if (validation.errors.length > 0) {
                console.log(`    所有错误:`);
                validation.errors.forEach((error, index) => {
                    console.log(`      ${index + 1}. ${error}`);
                });
            }
            
            // 显示全部警告（如果有）
            if (validation.warnings.length > 0) {
                console.log(`    所有警告:`);
                validation.warnings.forEach((warning, index) => {
                    console.log(`      ${index + 1}. ${warning}`);
                });
            }

        } catch (error) {
            console.error('Badcase PDF 测试失败:', error);
            this.testResults.push({
                test: 'Badcase PDF 分析',
                case: '完整分析流程',
                success: false,
                error: error.message
            });
        }
    }

    /**
     * 评估分析结果
     */
    evaluateAnalysisResults(analysis, validation, structure) {
        // 基本检查
        if (!analysis || !validation || !structure) {
            return false;
        }

        // 检查结构完整性
        if (!structure.physical || !structure.physical.objects) {
            return false;
        }

        // 检查分析结果
        if (!analysis.stats || typeof analysis.stats !== 'object') {
            return false;
        }

        // 检查验证结果
        if (!Array.isArray(validation.errors) || !Array.isArray(validation.warnings)) {
            return false;
        }

        // 检查是否有对象被解析
        if (structure.physical.objects.length === 0) {
            return false;
        }

        // 对于badcase PDF，我们期望发现一些问题
        // 但分析器应该能够处理这些问题而不崩溃
        return true;
    }

    /**
     * 打印测试结果
     */
    printTestResults() {
        console.log('\n=== 测试结果汇总 ===');
        
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.success).length;
        const failed = total - passed;
        const successRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;

        console.log(`总测试数: ${total}`);
        console.log(`通过: ${passed}`);
        console.log(`失败: ${failed}`);
        console.log(`成功率: ${successRate}%`);

        if (failed > 0) {
            console.log('\n失败的测试:');
            this.testResults.filter(r => !r.success).forEach(result => {
                console.log(`  ${result.test} - ${result.case}: ${result.error || '未知错误'}`);
            });
        }

        console.log('\n详细结果:');
        this.testResults.forEach((result, index) => {
            const status = result.success ? '✓' : '✗';
            const color = result.success ? 'green' : 'red';
            console.log(`  ${index + 1}. ${result.test} - ${result.case}: %c${status}`, `color:${color};font-weight:bold`);
            
            if (result.actual) {
                console.log(`     对象数量: ${result.actual.objectCount || 0}`);
                console.log(`    验证错误: ${result.actual.validationErrors || 0}`);
                console.log(`    验证警告: ${result.actual.validationWarnings || 0}`);
            }
        });
    }
}

// 运行测试
const test = new PDFAnalyserBadcaseTest();
test.runTest().catch(console.error); 