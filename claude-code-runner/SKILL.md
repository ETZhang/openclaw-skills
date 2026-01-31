---
name: claude-code-runner
description: Run Claude Code CLI for AI code generation and assistance. Use when user wants to generate code, analyze files, or get AI help with programming tasks. Requires: Claude Code CLI installed at /opt/homebrew/bin/claude.
---

# Claude Code Runner

Execute Claude Code CLI for AI-powered code generation, analysis, and assistance.

## Quick Usage

```bash
# Generate code
./scripts/run.sh "Create a Python function to calculate fibonacci"

# Analyze code
./scripts/run.sh "Review this code and suggest improvements" --file /path/to/file.py

# JSON output for parsing
./scripts/run.sh "List all Python files in current directory" --json
```

## Installation

Claude Code should already be installed at `/opt/homebrew/bin/claude`.

If not, install via:
```bash
brew install claude-code
```

## Features

- **Code Generation**: Create functions, classes, scripts
- **Code Review**: Analyze and improve existing code
- **Problem Solving**: Debug issues, explain errors
- **Multiple Models**: Use different Claude models
- **JSON Output**: Machine-readable results
- **Context Awareness**: Can read and modify files

## Usage Patterns

### Basic Generation
```bash
./run.sh "Write a hello world in Python"
```

### File Analysis
```bash
./run.sh "Explain this function" --file mycode.py
```

### With Custom Model
```bash
./run.sh "Create a web scraper" --model sonnet
```

### JSON Output
```bash
./run.sh "Count lines in all .py files" --json
```

### Multi-turn Conversation
```bash
# Use --continue to keep conversation going
./run.sh "Start building an app" --continue
```

## Command Options

| Option | Description |
|--------|-------------|
| `--print, -p` | Non-interactive mode (required) |
| `--model <name>` | Use specific model (sonnet, opus, etc.) |
| `--output-format json` | JSON output for parsing |
| `--add-dir <path>` | Allow access to directory |
| `--system-prompt <prompt>` | Custom system prompt |
| `--continue, -c` | Continue previous conversation |

## Examples

**Generate a REST API:**
```bash
./run.sh "Create a Flask REST API with /users endpoint" --print
```

**Debug Error:**
```bash
./run.sh "Fix this Python error: IndexError: list index out of range" --print --model opus
```

**Refactor Code:**
```bash
./run.sh "Refactor this function to be more efficient" --file mycode.py --print
```

**Analyze Project:**
```bash
./run.sh "What does this project do? List main files" --print --model sonnet
```

## Models Available

| Model | Best For |
|-------|----------|
| sonnet | Fast, general purpose |
| opus | Complex reasoning, detailed |
| haiku | Quick simple tasks |

## Files

```
claude-code-runner/
├── SKILL.md              # This file
├── scripts/
│   ├── run.sh            # Main runner
│   ├── install.sh        # Check dependencies
│   └── examples.sh       # Example commands
└── references/
    └── MODELS.md         # Model details
```

## Notes

- Requires Claude Code CLI installed
- API usage may incur costs (check Claude Code settings)
- Best for: code generation, debugging, refactoring
- For general conversation, use OpenClaw directly
