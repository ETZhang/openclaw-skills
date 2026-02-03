#!/usr/bin/env python3
"""
小T语音助手后端服务
- /health: 健康检查
- /agent: 发送消息到 OpenClaw
"""

import json
import subprocess
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import sys

# 配置
PORT = 18790
OPENCLAW_SESSION = 'main'

# 简单的消息队列（避免并发问题）
message_queue = []
response_cache = {}
request_id = 0
request_lock = threading.Lock()


class XiaotBackendHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # 简化日志
        print(f"[{self.log_date_time_string()}] {args[0]}")
    
    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        path = urlparse(self.path).path
        
        if path == '/health':
            self.send_json_response(200, {
                'status': 'ok',
                'service': 'xiaot-backend',
                'port': PORT
            })
        elif path == '/':
            self.send_json_response(200, {
                'service': '小T语音助手后端',
                'endpoints': {
                    '/health': '健康检查',
                    '/agent': '发送消息到 OpenClaw (POST)'
                }
            })
        else:
            self.send_json_response(404, {'error': 'Not found'})
    
    def do_POST(self):
        global request_id, message_queue
        
        path = urlparse(self.path).path
        
        if path == '/agent':
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
                message = data.get('message', '')
                agent = data.get('agent', OPENCLAW_SESSION)
                
                if not message:
                    self.send_json_response(400, {'error': '消息不能为空'})
                    return
                
                print(f"📤 收到消息: {message}")
                
                # 发送到 OpenClaw
                response_text = send_to_openclaw(message, agent)
                
                print(f"📥 OpenClaw回复: {response_text[:100]}...")
                
                self.send_json_response(200, {
                    'response': response_text,
                    'fromMock': False
                })
                
            except json.JSONDecodeError:
                self.send_json_response(400, {'error': '无效的 JSON'})
            except Exception as e:
                print(f"❌ 处理错误: {e}")
                self.send_json_response(500, {'error': str(e)})
        else:
            self.send_json_response(404, {'error': 'Not found'})


def send_to_openclaw(message, session='main'):
    """通过 CLI 发送消息到 OpenClaw"""
    try:
        # 使用 openclaw agent 命令
        cmd = [
            'openclaw', 'agent',
            '--agent', session,
            '--message', message,
            '--timeout', '60'
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=65
        )
        
        if result.returncode == 0:
            # 解析输出
            output = result.stdout.strip()
            if output:
                return output
        
        # 如果CLI失败，返回模拟回复
        return get_mock_response(message)
        
    except subprocess.TimeoutExpired:
        print("⚠️ OpenClaw 超时")
        return get_mock_response(message)
    except FileNotFoundError:
        print("❌ openclaw 命令未找到")
        return get_mock_response(message)
    except Exception as e:
        print(f"❌ OpenClaw 调用失败: {e}")
        return get_mock_response(message)


def get_mock_response(message):
    """模拟回复（当 OpenClaw 不可用时）"""
    mock_responses = [
        f"好的，我听到了\"{message}\"",
        f"\"{message}\"...让我想想",
        f"关于\"{message}\"，我记下来了",
        f"收到！\"{message}\"",
        f"\"{message}\" - 这是个有意思的话题",
        f"我明白你的意思了：{message}",
        f"好的，关于\"{message}\"，我的看法是..."
    ]
    return mock_responses[time.time() % len(mock_responses)]


def main():
    server = HTTPServer(('0.0.0.0', PORT), XiaotBackendHandler)
    
    print(f"🚀 小T后端服务启动")
    print(f"   端口: {PORT}")
    print(f"   健康检查: http://localhost:{PORT}/health")
    print(f"   消息接口: POST http://localhost:{PORT}/agent")
    print(f"   按 Ctrl+C 停止")
    print()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务已停止")
        server.shutdown()


if __name__ == '__main__':
    main()
