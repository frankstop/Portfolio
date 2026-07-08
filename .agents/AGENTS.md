# Agent Rules: Portfolio Project

## Git Safety
- **Selective Staging ONLY**: When staging modifications to commit or push, do NOT use indiscriminate commands like `git add .`, `git add -A`, or blanket file staging.
- **Verify Unstaged Changes**: Always check `git status` first. If files are modified that are unrelated to the current task (e.g. from previous background work or other files awaiting user feedback), leave them alone and stage only the specific target files relevant to the active user request.
- **Explicit Approval for Background Tasks**: Never push optimizations or secondary files that the user requested to keep local for inspection, unless they have explicitly approved doing so.
