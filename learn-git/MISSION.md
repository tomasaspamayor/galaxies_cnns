# Mission: Git for my research project

## Why
I am doing data analysis on a galaxies/CNN project and I want my code, scripts,
and results to be tracked and reproducible instead of scattered across `final_v2/`
folders and manual backups. Git should become the invisible plumbing under my
research: every experiment recorded, every mistake recoverable, and my history
clean enough that future-me (and collaborators) can understand what happened.

## Success looks like
- I can make a small change to my analysis code and record it with a clear commit
  message, without needing to look up the command.
- I can try a risky idea on a branch and throw it away (or keep it) without ever
  endangering my working, committed analysis.
- I can answer "what changed, and when?" about any file in my project using
  `git status`, `git diff`, and `git log`.
- I can recover from a mistake (bad commit, staged the wrong file, work I want to
  shelve temporarily) without panic and without losing data.
- I can mark meaningful milestones of my work with tags.

## Constraints
- Beginner: I can `clone`, `add`, `commit`, `push` but not much beyond that.
- Windows + PowerShell environment, editing mostly in VS Code / Python.
- Learning happens in short sessions; lessons must be quick and self-contained.

## Out of scope (for now)
- Contributing to open-source projects (fork/rebase/PR etiquette).
- Team workflows, code review, and CI integration.
- Advanced history rewriting (`rebase -i`, filter-repo) — may revisit later.
- Git internals below the level of blobs/trees/commits/refs.
