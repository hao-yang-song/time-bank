// 简化的AI聊天服务器 - 只提供AI聊天API，无需数据库和其他依赖
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 22334;

// 加载环境变量
let envVars = {};
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        // 跳过空行和注释行
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
            const key = line.substring(0, equalIndex).trim();
            const value = line.substring(equalIndex + 1).trim();
            envVars[key] = value;
        }
    });
    console.log('✅ 环境变量加载成功');
    console.log('📋 加载的变量:', Object.keys(envVars).join(', '));
} catch (e) {
    console.log('⚠️ 无法加载.env文件，使用默认配置');
}

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// 模拟AI回复函数
function getMockResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('help') || lowerMsg.includes('帮助')) {
        return "I'm here to help! What do you need assistance with? 我可以帮你了解任务系统、工时查询、金币获取等信息。";
    } else if (lowerMsg.includes('task') || lowerMsg.includes('任务') || lowerMsg.includes('job')) {
        return "You can find available tasks in the Task Hub section. Click on '任务大厅 [HUB]' in the sidebar. 在那里你可以浏览和接取可用的志愿任务。";
    } else if (lowerMsg.includes('hours') || lowerMsg.includes('time') || lowerMsg.includes('时长') || lowerMsg.includes('时间')) {
        return "You can check your total hours in the '我的数据 [DATA]' section. 你的志愿时长会在完成任务后自动累计。";
    } else if (lowerMsg.includes('coins') || lowerMsg.includes('points') || lowerMsg.includes('金币') || lowerMsg.includes('心币')) {
        return "Your coins are displayed in the top navigation bar. They can be earned by completing tasks. 每完成一个任务，你都会获得相应的心币奖励。";
    } else if (lowerMsg.includes('profile') || lowerMsg.includes('account') || lowerMsg.includes('账户') || lowerMsg.includes('个人')) {
        return "Your user ID is displayed at the bottom of the sidebar. 你可以在侧边栏底部查看你的账户信息。";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('你好')) {
        return "Hello! I'm your AI assistant for the TimeBank system. How can I help you today? 你好！我是时间银行系统的AI助手，有什么可以帮你的吗？";
    }
    
    return "I'm sorry, I don't have enough information to answer that. Can you provide more details?";
}

// 调用DeepSeek API
async function callDeepSeekAPI(message) {
    const apiKey = envVars.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
        console.log('⚠️ DeepSeek API Key未配置，使用模拟回复');
        return getMockResponse(message);
    }

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant for the TimeBank volunteer system. Answer questions about tasks, hours, coins, and user accounts in a friendly manner.' },
                    { role: 'user', content: message }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek API error:', error);
        return getMockResponse(message);
    }
}

// 创建服务器
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // AI聊天API
    if (pathname === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                if (!message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: '消息不能为空' }));
                    return;
                }

                console.log(`📝 收到消息: ${message}`);

                // 根据配置选择AI提供商
                const aiProvider = envVars.AI_PROVIDER || 'mock';
                let aiResponse;

                if (aiProvider === 'deepseek') {
                    aiResponse = await callDeepSeekAPI(message);
                } else {
                    aiResponse = getMockResponse(message);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, response: aiResponse }));
                console.log(`🤖 AI回复: ${aiResponse.substring(0, 50)}...`);

            } catch (error) {
                console.error('API error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: '服务器错误: ' + error.message }));
            }
        });
        return;
    }

    // 静态文件服务
    let filePath = pathname === '/' ? '/login.html' : pathname;
    filePath = path.join(__dirname, 'public', filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`✅ AI聊天服务器启动成功！`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`🤖 AI提供商: ${envVars.AI_PROVIDER || 'mock'}`);
    console.log(`🔑 DeepSeek API Key: ${envVars.DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
});
