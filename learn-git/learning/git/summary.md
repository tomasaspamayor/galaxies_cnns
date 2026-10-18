# Git — Learning Brief (summary)

_A concise brief, readable in about five minutes. Full explanations live in
[`notes.md`](./notes.md); sources in [`sources.md`](./sources.md)._

## Overview

Git is a **distributed version control system**: a tool that records the history
of a project as a chain of snapshots and lets you move between, branch off, and
combine those snapshots. It was created by Linus Torvalds in 2005 for the Linux
kernel and is now the default version-control system for essentially all software
and much scientific work. It matters because it gives you a *complete, local,
tamper-evident history* of your project: you can experiment freely, recover from
mistakes, and reproduce any past state.

Two design choices explain most of Git's behaviour:

1. **Snapshots, not differences.** Git stores a full snapshot of your project at
   each commit, not a list of file-based changes. Unchanged files are shared, so
   it stays efficient — but conceptually every commit *is* the whole project.
2. **Nearly everything is local.** The entire history lives on your disk; commits,
   logs, and diffs need no server. You only touch the network to sync with a remote.

## The five core concepts (in dependency order)

### 1. The three trees: working tree, staging area (index), repository
Git keeps three places a change can live. The **working tree** is the files you
edit; the **staging area** (technical name: the **index**) is a holding pen for
the next commit; the **git directory** (`.git`) is the permanent snapshot
database. _Why it matters:_ every command makes sense once you know which of the
three it moves data between. _Example:_ `git add` copies a file's current content
from the working tree into the index. _Misconception:_ `git add` does **not** add a
file to "the project" — it stages a specific version, and editing again afterwards
creates changes that are once more unstaged.

### 2. File states: modified, staged, committed
A file is **modified** (changed, not recorded), **staged** (marked for the next
commit), or **committed** (stored in history). _Why it matters:_ these states are
the vocabulary of `git status`. _Connection:_ states map one-to-one onto the three
trees of concept 1.

### 3. Commit
A **commit** is a permanent snapshot plus metadata: author, date, message, and a
pointer to its parent commit(s). _Why it matters:_ commits are the unit of history
— branches, tags, and merges all operate on commits. _Example:_ the chain of
parents is what makes a **branch** a movable label on a line of commits.

### 4. Branch
A **branch** is nothing more than a lightweight, movable pointer to one commit.
Creating one writes a 41-byte file; it is instantaneous, unlike older systems that
copy the whole project. `HEAD` is a pointer to the branch you're currently on.
_Why it matters:_ cheap branching is Git's headline feature — it lets you isolate
work (an experiment, a fix) from your main line. _Example:_ `git switch -c
temp-model` diverges your work; `git merge` brings it back.

### 5. Merge
A **merge** combines two lines of history. If one is a direct descendant of the
other, Git just **fast-forwards** the pointer. Otherwise Git performs a three-way
merge (using the two tips and their common ancestor) and creates a **merge
commit** with two parents. If both sides changed the same lines, you get a
**merge conflict** and resolve it by hand. _Why it matters:_ merging is how
branched work re-converges.

### 6. Stash
`git stash` shelves your uncommitted changes on a stack and gives you a clean
working tree, so you can switch context without committing half-done work. Apply
it later with `stash pop` (restore + drop) or `stash apply` (restore + keep).
_Why it matters:_ it resolves the everyday conflict between "I'm mid-change" and
"Git wants a clean tree to switch branches."

### 7. Tag
A **tag** is a permanent, human-readable label on a specific commit — typically a
release (`v1.0`). **Annotated** tags store tagger, date, and a message (and can be
GPG-signed); **lightweight** tags are just a pointer. _Why it matters:_ tags mark
the commits that matter, immovably, unlike branches which move. _Gotcha:_ tags are
**not** pushed by default — use `git push origin <tag>` or `--tags`.

### 8. Undo
Git distinguishes undoing **uncommitted** work (`git restore` / `git restore
--staged`) from undoing **commit history** (`git commit --amend`, `git reset
--soft`, `git revert`). _Why it matters:_ choosing the wrong one is how people lose
work. _Rule:_ committed work is almost always recoverable; uncommitted work
discarded with `restore`/`reset --hard` usually is not.

## How the concepts connect

```
working tree ──add──► index (staging) ──commit──► repository (history)
     ▲                      ▲                          │
     └────restore───────────┘                          │
                                                       ▼
                    branch / HEAD ── select ──► a commit in history
                    tag            ── label ──► a commit (immovable)
                    stash          ── shelve ─► a hidden stack entry
```

States (modified/staged/committed) are just *where* a change is among the three
trees. Branches, tags, and stash are all just named references into — or out of —
the commit history.

## Five key takeaways

1. **Git is three trees, not one folder.** Knowing which tree a change is in makes
   every command predictable. (Lesson 0001)
2. **A branch is a movable pointer; a tag is a fixed label.** Both point at
   commits, but branches advance as you commit and tags never move.
3. **Branching is cheap and expected.** Isolate experiments on branches; the cost
   of a branch is essentially zero.
4. **Stash is the "clean the tree without committing" tool** — for parking
   half-finished work when you must switch context.
5. **Undo depends on what you're undoing.** Restore/un-stage for uncommitted work;
   amend/reset/revert for history — and only rewrite history you haven't pushed.

## Glossary

- **Working tree** — the checked-out files you edit.
- **Index / staging area** — the holding pen for the next commit.
- **Git directory (`.git`)** — the permanent object database and metadata.
- **Commit** — a snapshot plus author, message, and parent pointer(s).
- **Branch** — a movable pointer to a commit.
- **HEAD** — a pointer to the branch you are currently on (or a raw commit, if
  "detached").
- **Merge** — combining two lines of history into one.
- **Fast-forward** — a merge that just advances a pointer because no divergence
  exists.
- **Merge conflict** — when both sides change the same lines; resolved by hand.
- **Stash** — a stack of shelved, uncommitted changes.
- **Tag** — a fixed label on a commit; annotated tags carry metadata.
- **Remote / origin** — a named copy of the repository elsewhere (e.g. GitHub).
- **Untracked file** — a file Git has never been told to track.
