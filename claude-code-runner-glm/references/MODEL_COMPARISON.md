# Claude Code Models Comparison

## 可用模型

| 模型 | 速度 | 能力 | 最佳场景 |
|------|------|------|----------|
| **sonnet** | 快 | 中等 | 通用代码生成、日常任务 |
| **opus** | 慢 | 强 | 复杂推理、调试、系统设计 |
| **haiku** | 最快 | 基础 | 简单任务、快速原型 |

## 详细对比

### Sonnet（默认）

**特点：**
- 平衡速度和能力
- 适合大多数编程任务
- 响应快速

**使用场景：**
```bash
# 代码生成
./run.sh "Create a REST API with Flask"

# 简单分析
./run.sh "Explain this function"

# 日常任务
./run.sh "Add comments to this code"
```

### Opus

**特点：**
- 最强的推理能力
- 适合复杂任务
- 响应时间较长（30-90秒）

**使用场景：**
```bash
# 复杂调试
./run.sh "Debug this complex error" --model opus

# 系统设计
./run.sh "Design a microservices architecture" --model opus

# 代码重构
./run.sh "Refactor this legacy codebase" --model opus
```

### Haiku

**特点：**
- 极速响应
- 适合简单任务
- 成本最低

**使用场景：**
```bash
# 简单脚本
./run.sh "Write a simple Python hello world" --model haiku

# 快速修复
./run.sh "Fix typo in this file" --model haiku

# 基础查询
./run.sh "What does this line do?" --model haiku
```

## 选择建议

### 按任务复杂度

| 任务类型 | 推荐模型 |
|----------|----------|
| 简单脚本 | haiku |
| 常规代码生成 | sonnet |
| 复杂调试 | opus |
| 系统设计 | opus |
| 代码审查 | sonnet |
| 快速原型 | haiku |

### 按响应时间

| 你需要... | 使用模型 |
|-----------|----------|
| 快速响应 | haiku |
| 平衡 | sonnet |
| 高质量 | opus |

## 成本考虑

- **haiku**: 最便宜，适合简单任务
- **sonnet**: 中等成本，日常使用
- **opus**: 最贵，复杂任务使用

## 实践建议

1. **从简单开始**：先用haiku或sonnet
2. **升级到opus**：当任务复杂时
3. **测试不同模型**：找到最适合你的场景

## 命令示例

```bash
# 默认 (sonnet)
./run.sh "Create a function"

# 快速 (haiku)
./run.sh "Simple hello world" --model haiku

# 强推理 (opus)
./run.sh "Complex debugging" --model opus
```
