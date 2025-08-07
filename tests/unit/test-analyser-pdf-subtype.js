const PDFStructure = require('../../src/js/pdf-struct.js');
const PDFParser = require('../../src/js/pdf-parser.js');
const PDFAnalyser = require('../../src/js/pdf-analyser.js');

class SubtypeMapTest {
    constructor() {
        this.testResults = [];
    }

    async runTest() {
        console.log('=== SUB_TYPE_MAP 测试 ===\n');
        
        try {
            await this.testSubtypeMapAccess();
            await this.testAnnotSubtypes();
            await this.testFontSubtypes();
            await this.testXObjectSubtypes();
            await this.testValidationWithSubtypes();
            
            this.printTestResults();
        } catch (error) {
            console.error('测试执行错误:', error);
        }
        
        console.log('\n=== 测试完成 ===');
    }

    /**
     * 测试SUB_TYPE_MAP访问
     */
    async testSubtypeMapAccess() {
        console.log('====测试 SUB_TYPE_MAP 访问====');
        
        const success = PDFStructure.SUB_TYPE_MAP && 
                       PDFStructure.SUB_TYPE_MAP.Font &&
                       PDFStructure.SUB_TYPE_MAP.XObject &&
                       PDFStructure.SUB_TYPE_MAP.Annot;
        
        this.testResults.push({
            test: 'SUB_TYPE_MAP访问',
            case: '基本访问',
            success: success,
            expected: { hasFont: true, hasXObject: true, hasAnnot: true },
            actual: { 
                hasFont: !!PDFStructure.SUB_TYPE_MAP?.Font,
                hasXObject: !!PDFStructure.SUB_TYPE_MAP?.XObject,
                hasAnnot: !!PDFStructure.SUB_TYPE_MAP?.Annot
            }
        });
        
        console.log(`结果: SUB_TYPE_MAP访问: %c${success ? '✓' : '✗'}`, `color:${success ? 'green' : 'red'};font-weight:bold`);
        if (success) {
            console.log(`    Font子类型: ${Object.keys(PDFStructure.SUB_TYPE_MAP.Font).length}个`);
            console.log(`    XObject子类型: ${Object.keys(PDFStructure.SUB_TYPE_MAP.XObject).length}个`);
            console.log(`    Annot子类型: ${Object.keys(PDFStructure.SUB_TYPE_MAP.Annot).length}个`);
        }
        console.log('');
    }

    /**
     * 测试Annot Subtypes
     */
    async testAnnotSubtypes() {
        console.log('====测试 Annot Subtypes====');
        
        const annotSubtypes = PDFStructure.SUB_TYPE_MAP.Annot;
        const expectedSubtypes = [
            'Text', 'Link', 'FreeText', 'Line', 'Square', 'Circle', 
            'Polygon', 'PolyLine', 'Highlight', 'Underline', 'Squiggly', 
            'StrikeOut', 'Stamp', 'Caret', 'Ink', 'Popup', 'FileAttachment',
            'Sound', 'Movie', 'Screen', 'Widget', 'PrinterMark', 'TrapNet',
            'Watermark', '3D', 'Redact'
        ];
        
        const foundSubtypes = Object.keys(annotSubtypes);
        const missingSubtypes = expectedSubtypes.filter(subtype => !foundSubtypes.includes(subtype));
        const extraSubtypes = foundSubtypes.filter(subtype => !expectedSubtypes.includes(subtype));
        
        const success = missingSubtypes.length === 0 && extraSubtypes.length === 0;
        
        this.testResults.push({
            test: 'Annot Subtypes',
            case: '完整性检查',
            success: success,
            expected: { count: expectedSubtypes.length, subtypes: expectedSubtypes },
            actual: { 
                count: foundSubtypes.length, 
                subtypes: foundSubtypes,
                missing: missingSubtypes,
                extra: extraSubtypes
            }
        });
        
        console.log(`结果: Annot Subtypes: %c${success ? '✓' : '✗'}`, `color:${success ? 'green' : 'red'};font-weight:bold`);
        console.log(`    期望: ${expectedSubtypes.length}个, 实际: ${foundSubtypes.length}个`);
        
        if (missingSubtypes.length > 0) {
            console.log(`    缺少: ${missingSubtypes.join(', ')}`);
        }
        if (extraSubtypes.length > 0) {
            console.log(`    多余: ${extraSubtypes.join(', ')}`);
        }
        
        // 测试特定Subtype的必需属性
        const inkSubtype = annotSubtypes.Ink;
        const inkSuccess = inkSubtype && 
                          inkSubtype.required.includes('InkList') &&
                          inkSubtype.description === '墨迹注释';
        
        this.testResults.push({
            test: 'Annot Subtypes',
            case: 'Ink必需属性',
            success: inkSuccess,
            expected: { hasInkList: true, description: '墨迹注释' },
            actual: { 
                hasInkList: inkSubtype?.required.includes('InkList'),
                description: inkSubtype?.description
            }
        });
        
        console.log(`    Ink必需属性: %c${inkSuccess ? '✓' : '✗'}`, `color:${inkSuccess ? 'green' : 'red'};font-weight:bold`);
        console.log('');
    }

    /**
     * 测试Font Subtypes
     */
    async testFontSubtypes() {
        console.log('====测试 Font Subtypes====');
        
        const fontSubtypes = PDFStructure.SUB_TYPE_MAP.Font;
        const expectedSubtypes = ['Type1', 'TrueType', 'Type3', 'MMType1'];
        
        const foundSubtypes = Object.keys(fontSubtypes);
        const success = expectedSubtypes.every(subtype => foundSubtypes.includes(subtype));
        
        this.testResults.push({
            test: 'Font Subtypes',
            case: '完整性检查',
            success: success,
            expected: { subtypes: expectedSubtypes },
            actual: { subtypes: foundSubtypes }
        });
        
        console.log(`结果: Font Subtypes: %c${success ? '✓' : '✗'}`, `color:${success ? 'green' : 'red'};font-weight:bold`);
        console.log(`    子类型: ${foundSubtypes.join(', ')}`);
        
        // 测试Type3字体的特殊必需属性
        const type3Subtype = fontSubtypes.Type3;
        const type3Success = type3Subtype && 
                            type3Subtype.required.includes('FontBBox') &&
                            type3Subtype.required.includes('FontMatrix') &&
                            type3Subtype.required.includes('CharProcs');
        
        this.testResults.push({
            test: 'Font Subtypes',
            case: 'Type3特殊属性',
            success: type3Success,
            expected: { hasFontBBox: true, hasFontMatrix: true, hasCharProcs: true },
            actual: { 
                hasFontBBox: type3Subtype?.required.includes('FontBBox'),
                hasFontMatrix: type3Subtype?.required.includes('FontMatrix'),
                hasCharProcs: type3Subtype?.required.includes('CharProcs')
            }
        });
        
        console.log(`    Type3特殊属性: %c${type3Success ? '✓' : '✗'}`, `color:${type3Success ? 'green' : 'red'};font-weight:bold`);
        console.log('');
    }

    /**
     * 测试XObject Subtypes
     */
    async testXObjectSubtypes() {
        console.log('====测试 XObject Subtypes====');
        
        const xObjectSubtypes = PDFStructure.SUB_TYPE_MAP.XObject;
        const expectedSubtypes = ['Image', 'Form', 'PS'];
        
        const foundSubtypes = Object.keys(xObjectSubtypes);
        const success = expectedSubtypes.every(subtype => foundSubtypes.includes(subtype));
        
        this.testResults.push({
            test: 'XObject Subtypes',
            case: '完整性检查',
            success: success,
            expected: { subtypes: expectedSubtypes },
            actual: { subtypes: foundSubtypes }
        });
        
        console.log(`结果: XObject Subtypes: %c${success ? '✓' : '✗'}`, `color:${success ? 'green' : 'red'};font-weight:bold`);
        console.log(`    子类型: ${foundSubtypes.join(', ')}`);
        
        // 测试Image的必需属性
        const imageSubtype = xObjectSubtypes.Image;
        const imageSuccess = imageSubtype && 
                            imageSubtype.required.includes('Width') &&
                            imageSubtype.required.includes('Height') &&
                            imageSubtype.required.includes('ColorSpace') &&
                            imageSubtype.required.includes('BitsPerComponent');
        
        this.testResults.push({
            test: 'XObject Subtypes',
            case: 'Image必需属性',
            success: imageSuccess,
            expected: { hasWidth: true, hasHeight: true, hasColorSpace: true, hasBitsPerComponent: true },
            actual: { 
                hasWidth: imageSubtype?.required.includes('Width'),
                hasHeight: imageSubtype?.required.includes('Height'),
                hasColorSpace: imageSubtype?.required.includes('ColorSpace'),
                hasBitsPerComponent: imageSubtype?.required.includes('BitsPerComponent')
            }
        });
        
        console.log(`    Image必需属性: %c${imageSuccess ? '✓' : '✗'}`, `color:${imageSuccess ? 'green' : 'red'};font-weight:bold`);
        console.log('');
    }

    /**
     * 测试带Subtype的验证
     */
    async testValidationWithSubtypes() {
        console.log('====测试 Subtype验证====');
        
        const structure = new PDFStructure();
        const analyser = new PDFAnalyser(structure);
        
        // 测试有效的Ink注释
        const validInkAnnot = {
            objectNumber: 1,
            type: 'Annot',
            properties: {
                Type: 'Annot',
                Subtype: 'Ink',
                Rect: [100, 100, 200, 200],
                InkList: [[[100, 100], [150, 150], [200, 200]]]
            }
        };
        
        const validResult = analyser.validateObject(validInkAnnot);
        const validSuccess = validResult.isValid && 
                           validResult.subtype === 'Ink' &&
                           validResult.subtypeDescription === '墨迹注释';
        
        this.testResults.push({
            test: 'Subtype验证',
            case: '有效Ink注释',
            success: validSuccess,
            expected: { isValid: true, subtype: 'Ink', description: '墨迹注释' },
            actual: { 
                isValid: validResult.isValid,
                subtype: validResult.subtype,
                description: validResult.subtypeDescription
            }
        });
        
        console.log(`结果: 有效Ink注释: %c${validSuccess ? '✓' : '✗'}`, `color:${validSuccess ? 'green' : 'red'};font-weight:bold`);
        
        // 测试无效的Ink注释（缺少InkList）
        const invalidInkAnnot = {
            objectNumber: 2,
            type: 'Annot',
            properties: {
                Type: 'Annot',
                Subtype: 'Ink',
                Rect: [100, 100, 200, 200]
                // 缺少InkList
            }
        };
        
        const invalidResult = analyser.validateObject(invalidInkAnnot);
        const invalidSuccess = !invalidResult.isValid && 
                             invalidResult.missingRequired.includes('InkList');
        
        this.testResults.push({
            test: 'Subtype验证',
            case: '无效Ink注释',
            success: invalidSuccess,
            expected: { isValid: false, missingInkList: true },
            actual: { 
                isValid: invalidResult.isValid,
                missingInkList: invalidResult.missingRequired.includes('InkList')
            }
        });
        
        console.log(`    无效Ink注释: %c${invalidSuccess ? '✓' : '✗'}`, `color:${invalidSuccess ? 'green' : 'red'};font-weight:bold`);
        
        // 测试未知Subtype
        const unknownSubtypeAnnot = {
            objectNumber: 3,
            type: 'Annot',
            properties: {
                Type: 'Annot',
                Subtype: 'UnknownType',
                Rect: [100, 100, 200, 200]
            }
        };
        
        const unknownResult = analyser.validateObject(unknownSubtypeAnnot);
        const unknownSuccess = unknownResult.unknownSubtype && 
                             unknownResult.errors.includes('未知Subtype: Annot/UnknownType');
        
        this.testResults.push({
            test: 'Subtype验证',
            case: '未知Subtype',
            success: unknownSuccess,
            expected: { unknownSubtype: true, errorMessage: '未知Subtype: Annot/UnknownType' },
            actual: { 
                unknownSubtype: unknownResult.unknownSubtype,
                errorMessage: unknownResult.errors[0]
            }
        });
        
        console.log(`    未知Subtype: %c${unknownSuccess ? '✓' : '✗'}`, `color:${unknownSuccess ? 'green' : 'red'};font-weight:bold`);
        console.log('');
    }

    /**
     * 打印测试结果
     */
    printTestResults() {
        console.log('====测试结果汇总====');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests}`);
        console.log(`失败: ${failedTests}`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n失败的测试:');
            this.testResults.filter(result => !result.success).forEach((result, index) => {
                console.log(`${index + 1}. ${result.test} - ${result.case}`);
                console.log(`   期望: ${JSON.stringify(result.expected)}`);
                console.log(`   实际: ${JSON.stringify(result.actual)}`);
            });
        }
    }
}

// 运行测试
const test = new SubtypeMapTest();
test.runTest().catch(console.error); 