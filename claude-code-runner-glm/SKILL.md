---
name: claude-code-runner-glm
description: Run Claude Code CLI with GLM-4.7 model for AI code generation. Use when you need to generate code, debug, analyze files, or get AI programming assistance. Requires: Claude Code CLI + GLM-4.7 API configuration. Supports Chinese prompts and follows OpenClaw coding standards.
---

# Claude Code Runner (GLM-4.7)

Execute Claude Code CLI with GLM-4.7 model for AI-powered code generation, debugging, and assistance.

## Quick Usage

```bash
# Generate code
./run.sh "Create a Python function to calculate fibonacci"

# Analyze code
./run.sh "Review this code" --file /path/to/file.py

# Debug error
./run.sh "Fix this error: IndexError" --model opus

# Continue conversation
./run.sh "Continue from where we left off" --continue
```

## GLM-4.7 Configuration

### Environment Variables (Required)

Set these in your shell profile (`~/.zshrc`):

```bash
# GLM-4.7 via Anthropic API compatibility
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="your-token-here"
```

**⚠️ SECURITY WARNING**: Never commit your API token to Git!

Use `.gitignore` to exclude sensitive files:

```gitignore
# .gitignore
*.token
*.key
.env
config.local.*
```

### Security Best Practices

1. **Environment Variables**: Store tokens in environment, not in code
2. **Local Config**: Use `~/.claude/settings.local.json` for overrides
3. **Git Ignore**: Exclude all files containing secrets
4. **Regular Rotation**: Rotate tokens periodically

## Installation

1. **Install Claude Code**
   ```bash
   brew install claude-code
   ```

2. **Configure GLM-4.7**
   ```bash
   # Add to ~/.zshrc
   export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
   export ANTHROPIC_AUTH_TOKEN="your-token"
   ```

3. **Make scripts executable**
   ```bash
   chmod +x scripts/*.sh
   ```

## Usage Patterns

### Code Generation

```bash
./run.sh "Write a simple HTML game about a kid eating cakes"

# With file context
./run.sh "Add scoring system" --file game.html

# JSON output (for parsing)
./run.sh "Count all functions" --json
```

### Code Review

```bash
./run.sh "Review this code for performance" --file mycode.py --model opus
```

### Debugging

```bash
./run.sh "Fix this error: ValueError: invalid literal for int()" --model opus
```

### Project Understanding

```bash
./run.sh "What does this project do? List main files" --model sonnet
```

## Command Options

| Option | Description |
|--------|-------------|
| `--model <name>` | Model: sonnet (fast), opus (reasoning), haiku (quick) |
| `--json` | JSON output for parsing |
| `--file <path>` | Include file in context |
| `--continue, -c` | Continue previous conversation |
| `--system <prompt>` | Custom system prompt |

## Models Available

| Model | Best For | Speed |
|-------|----------|-------|
| sonnet | General purpose, code gen | Fast |
| opus | Complex reasoning, debugging | Slower |
| haiku | Quick simple tasks | Fastest |

## Files

```
claude-code-runner-glm/
├── SKILL.md                    # This file
├── scripts/
│   ├── run.sh                  # Main runner
│   ├── install.sh              # Installation check
│   ├── examples.sh             # Example commands
│   └── prompt-templates/       # Prompt templates
│       ├── code-generation.md
│       ├── code-review.md
│       ├── debugging.md
│       └── project-analysis.md
├── references/
│   ├── PROMPT_GUIDE.md         # Prompt engineering guide
│   └── MODEL_COMPARISON.md     # Model selection guide
└── .gitignore                  # Template (exclude secrets)
```

## Prompt Engineering Guide

### Good Prompt Structure

```markdown
[Role/Skill]
你是专业的Three.js游戏开发工程师。

[Task]
创建一个3D网页游戏 - 可爱小孩吃蛋糕

[Requirements]
1. 使用 Three.js r128
2. 经典JavaScript (非ES模块)
3. 单HTML文件，直接双击打开

[Output Format]
直接输出HTML代码，不要markdown格式，不要代码块标记。

[Constraints]
- 函数不超过50行
- 变量命名清晰
- 中文注释
```

### Tips for Better Results

1. **Be Specific**: "Create a 3D game about a kid eating cakes" vs "make a game"
2. **Define Output Format**: "Output only HTML, no markdown"
3. **Set Constraints**: "Functions under 50 lines, Chinese comments"
4. **Provide Context**: Include relevant files with `--file`
5. **Iterate**: Start simple, then refine

## Examples

**Generate a REST API:**
```bash
./run.sh "Create a Flask REST API with /users endpoint" --print
```

**Debug Error:**
```bash
./run.sh "Fix: IndexError: list index out of range" --model opus --file bug.py
```

**Refactor Code:**
```bash
./run.sh "Refactor this function to be more efficient" --file mycode.py --print
```

**Multi-turn Conversation:**
```bash
./run.sh "Start building an app" --continue
./run.sh "Add user authentication" --continue
./run.sh "Add database models" --continue
```

## Integration with OpenClaw

This skill can be called from OpenClaw:

```
User: "用CC写个Python脚本"
→ OpenClaw calls: claude-code-runner-glm/scripts/run.sh "Write a Python script..."
```

## Troubleshooting

**Token Error:**
```bash
# Check if environment variables are set
echo $ANTHROPIC_AUTH_TOKEN

# Reload shell profile
source ~/.zshrc
```

**Permission Denied:**
```bash
chmod +x scripts/*.sh
```

**Model Not Available:**
Use `--model sonnet` for basic tasks, `--model opus` for complex reasoning.

## Notes

- Requires Claude Code CLI installed
- API usage may incur costs
- Best for: code generation, debugging, refactoring, explanation
- For general conversation, use OpenClaw directly
