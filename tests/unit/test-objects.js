const fs = require('fs');
const PDFParser = require('../js/pdf-parser.js');

async function testObjects() {
    try {
        const bytes = fs.readFileSync('testpdf/badcase3.pdf');
        const parser = new PDFParser();
        const structure = parser.parsePDFSequentially(bytes);
        
        // 只查看对象47
        const objNum = 47;
        const obj = structure.getObject(objNum, 0);
        if (obj) {
            console.log(`\n=== 对象 ${objNum} ===`);
            console.log('类型:', obj.type);
            console.log('属性:', JSON.stringify(obj.properties, null, 2));
            console.log('原始内容:', obj.rawContent);
            
            // 检查是否有Filter属性
            if (obj.properties?.Filter) {
                console.log('Filter属性:', obj.properties.Filter);
            }
            
            // 检查属性名是否为空
            if (obj.properties) {
                const emptyKeys = Object.keys(obj.properties).filter(key => key.length === 0);
                if (emptyKeys.length > 0) {
                    console.log('发现空属性名:', emptyKeys);
                }
                
                // 检查所有属性名
                console.log('所有属性名:', Object.keys(obj.properties));
            }
        } else {
            console.log(`\n对象 ${objNum} 不存在`);
        }
        
    } catch (error) {
        console.error('错误:', error.message);
    }
}

testObjects(); 