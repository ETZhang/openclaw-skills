#!/usr/bin/env node

/**
 * 小T 语音助手后端服务器
 * 接收 HTTP 请求，调用 OpenClaw CLI，返回响应
 * 这样语音界面就不会与 Web UI 的 WebSocket 连接冲突
 */

const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 18790; // 使用不同的端口，避免与 OpenClaw 网关冲突

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Xiaot Voice Assistant Backend' });
});

// 代理到 OpenClaw
app.post('/agent', async (req, res) => {
    const { message, agent = 'main' } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[${new Date().toISOString()}] 收到消息: ${message}`);

    // 使用 OpenClaw CLI 命令，添加环境变量禁用颜色输出
    const command = `NO_COLOR=1 openclaw agent --agent ${agent} --message "${message.replace(/"/g, '\\"')}" 2>/dev/null`;

    exec(command, { maxBuffer: 1024 * 1024 * 10, env: { ...process.env, NO_COLOR: '1' } }, (error, stdout, stderr) => {
        if (error) {
            console.error('OpenClaw 错误:', error.message);
            return res.status(500).json({
                error: 'OpenClaw 调用失败',
                message: error.message,
                response: null
            });
        }

        // 清理响应：移除 ANSI 颜色码
        let response = stdout.trim();

        // 移除 ANSI 颜色码
        response = response.replace(/\x1b\[[0-9;]*m/g, '');

        // 如果响应为空，可能是输出在 stderr 中
        if (!response && stderr) {
            response = stderr.replace(/\x1b\[[0-9;]*m/g, '').trim();
        }

        // 尝试提取实际的回复内容（跳过诊断信息）
        const lines = response.split('\n');
        const cleanedLines = [];

        for (const line of lines) {
            // 跳过包含诊断信息的行
            if (line.includes('[plugins]') ||
                line.includes('[DEP0040]') ||
                line.includes('Doctor warnings') ||
                line.includes('State dir migration') ||
                line.trim().match(/^[│├─]/) ||
                line.includes('DeprecationWarning')) {
                continue;
            }
            cleanedLines.push(line);
        }

        response = cleanedLines.join('\n').trim();

        console.log(`[${new Date().toISOString()}] OpenClaw 响应: ${response.substring(0, 100)}...`);

        res.json({
            response: response,
            fromMock: false
        });
    });
});

// 启动服务器
app.listen(PORT, '127.0.0.1', () => {
    console.log(`\n✅ 小T语音助手后端服务器启动成功！`);
    console.log(`📍 监听地址: http://127.0.0.1:${PORT}`);
    console.log(`🔗 端点: POST http://127.0.0.1:${PORT}/agent`);
    console.log(`\n💡 使用方法:`);
    console.log(`   curl -X POST http://127.0.0.1:${PORT}/agent \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"message":"你好"}'\n`);
});
