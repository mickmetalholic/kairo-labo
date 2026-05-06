---
name: commit-staged
description: 基于 Git 暂存区生成规范化提交并执行 commit。用户提到 staged commit、只提交暂存区、按规范写提交信息时使用。
disable-model-invocation: true
---

# commit-staged

仅提交 Git 暂存区（staged）内容的标准技能。  
目标：在不污染提交的前提下，按统一规范生成并执行一次可追溯的 commit。

## 适用场景

- 用户明确要求“基于暂存区提交”。
- 需要避免把未暂存（unstaged）改动一起提交。
- 需要遵循仓库既有提交风格（如 Conventional Commits）。

## 核心原则

- 只提交暂存区：使用 `git diff --cached` 作为唯一提交内容来源。
- 不做隐式暂存：除非用户明确要求，不执行 `git add .`。
- 消息先拟定后提交：先根据 staged diff 生成提交信息，再执行 commit。
- 安全优先：禁止破坏性 git 命令（如 `reset --hard`、强推）。

## 执行步骤（严格顺序）

1. 检查仓库状态：
   - `git status --short`
   - 若暂存区为空，停止并提示用户“当前没有可提交的 staged 变更”。
2. 仅查看 staged 内容：
   - `git diff --cached --stat`
   - `git diff --cached`
3. 读取最近提交风格：
   - `git log -5 --oneline`
4. 生成提交信息（基于 staged 变更）：
   - 标题格式：`<type>(<scope>): <subject>`
   - `type` 优先：`feat`、`fix`、`refactor`、`docs`、`test`、`chore`
   - `subject` 使用现在时、简洁、突出“为什么”
5. 执行提交（仅提交 staged）：
   - **优先使用跨 shell 方案**：将提交信息写入临时文件，再执行 `git commit -F <temp-file>`，提交后删除临时文件。
   - 若必须内联消息：
     - Bash/Zsh：可使用 HEREDOC；
     - PowerShell：使用 here-string（`@'...'@`）；
     - 禁止在 PowerShell 中直接套用 Bash HEREDOC 语法。
6. 提交后验证：
   - `git status --short`
   - 输出新 commit 摘要：`git log -1 --oneline`
   - 若存在 hooks（如 `lint-staged`）自动改写文件，确认最终 commit 仍仅包含预期 staged 范围。

## 提交信息规范

- 标题不超过 72 字符，使用小写 `type`。
- 可选正文建议 1-3 行，解释动机、影响面、兼容性。
- 不写与 staged 无关的内容，不夸大变更范围。

示例：

```text
feat(cli): add staged-only commit workflow

Ensure commit operations only use staged diff to avoid accidental file inclusion.
```

## 失败处理

- `pre-commit` 失败：先修复问题，再重新执行一次新的 commit（不 amend，除非用户明确要求）。
- 检测到疑似敏感文件（如 `.env`、密钥）：停止并请求用户确认是否继续。
- 工作区包含大量未暂存改动：提醒“本次仅提交 staged，不会包含 unstaged”。

## 输出要求（给用户）

- 变更概览（基于 `git diff --cached --stat`）。
- 最终提交信息（标题 + 可选正文）。
- 提交结果（新 commit 哈希短码 + `git status` 关键结论）。

## 说明

该技能采用“暂存区即提交边界”的模式，是为了降低误提交流水线外改动的风险，确保提交语义和内容高度一致。
