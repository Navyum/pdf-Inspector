#!/bin/bash

echo "🚀 启动 PDF 格式校验工具..."
echo "📁 项目目录: $(pwd)"
echo "🌐 服务器地址: http://localhost:8000"
echo ""

# 检查 Python 版本
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 3 启动服务器..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 启动服务器..."
    python -m http.server 8000
else
    echo "❌ 未找到 Python，请手动启动服务器："
    echo "   python3 -m http.server 8000"
    echo "   或"
    echo "   npx http-server"
    echo "   或"
    echo "   php -S localhost:8000"
fi 