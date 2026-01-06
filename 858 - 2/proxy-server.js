const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3002; // Switch to 3002 to avoid EADDRINUSE

const server = http.createServer((req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccessToken');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 解析请求路径
    const targetPath = req.url; 
    
    // NLECloud API 配置 - 使用 HTTPS
    const options = {
        hostname: 'api.nlecloud.com',
        port: 443, // HTTPS 默认端口
        path: targetPath,
        method: req.method,
        headers: {
            ...req.headers,
            host: 'api.nlecloud.com'
        }
    };

    console.log(`[Proxy] Forwarding ${req.method} ${targetPath} to https://api.nlecloud.com`);

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (e) => {
        console.error(`[Proxy Error] ${e.message}`);
        res.writeHead(500);
        res.end('Proxy Error: ' + e.message);
    });

    if (req.method === 'POST' || req.method === 'PUT') {
        req.pipe(proxyReq, { end: true });
    } else {
        proxyReq.end();
    }
});

server.listen(PORT, () => {
    console.log(`Local CORS Proxy (HTTPS Backend) running at http://localhost:${PORT}`);
    console.log(`Target: https://api.nlecloud.com`);
});
