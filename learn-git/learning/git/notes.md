# Git — Extended Notes

Details, examples, and nuance that don't fit the five-minute summary. Organised by
the concepts in [`summary.md`](./summary.md).

## 1. The three trees in detail

Git's own vocabulary (from Pro Git §1.3):

- **Working tree** — a single checkout of one version of the project: the
  files pulled out of the database and placed on disk for you to use.
- **Staging area** — a file (inside the git directory) recording *what will go
  into the next commit*. Its technical name is the **index**; "staging area" is
  the friendly synonym.
- **Git directory** — where Git stores metadata and the object database. It is
  the part that is copied when you `clone`.

The workflow is: edit in the working tree → selectively `git add` into the index →
`git commit` the index into the git directory.

### Why the index exists at all

You could imagine committing straight from the working tree (`git commit -a`
roughly does this for tracked files). The index exists so you can craft a commit
**precisely**: stage file A and the first hunk of file B, leave the rest for a
later, more coherent commit. This is what makes a clean, reviewable history
possible.

### The "same file staged and modified" phenomenon

`git add` snapshots the file's content *at the moment you run it*. If you then edit
the file again before committing, the working tree and the index disagree — and
`git status -s` shows `MM`. This is not an error; it is the system working as
designed. To include the newer edits, run `git add` again.

## 2. Reading `git status -s`

Two columns, always: **left = index (staged) vs. HEAD**; **right = working tree vs.
index**. Common codes: ` M` (modified, unstaged), `M ` (staged), `MM` (staged then
edited again), `A ` (newly staged), `D`/` D` (deleted staged/unstaged), `R ` (rename),
`??` (untracked). A leading letter with no space means the change is recorded in the
index; a space means "nothing here".

The long-form `git status` also prints hints like *"use git restore --staged
&lt;file&gt; to unstage"* — Git literally tells you the undo command. Reading the
hint is a legitimate, encouraged way to learn.

## 3. Commits, parents, and the object model (light touch)

A commit records:
- a pointer to a **tree** object (the exact directory snapshot),
- the author and committer identity and timestamps,
- the commit **message**,
- pointers to its **parent(s)**: zero for the initial commit, one normally, several
  for a merge commit.

Git identifies every object by a **SHA-1 hash** of its contents (you'll also see
the newer SHA-256 discussed; SHA-1 remains the default in practice). Because the
hash is derived from content, any change is detectable: "Git has integrity."
Everything is content-addressed, which is why renames are inferred rather than
tracked.

## 4. Branching — the killer feature

A branch is a movable pointer to a commit. `git init` creates one default branch
(`master`, or `main` on modern hosts). `HEAD` is a special pointer to the branch
you're on; committing moves that branch forward.

- Create: `git branch testing` (creates, does not switch).
- Create + switch: `git switch -c testing` (or `git checkout -b testing`).
- Switch: `git switch testing`; return: `git switch -`.
- List: `git branch`; with `-v` shows last commit per branch; `-a` includes remotes.

Visualise: `git log --oneline --decorate --graph --all`.

**Why it's cheap:** a branch is a 41-byte file (40-char hash + newline). Older VCSs
copied the entire source tree to branch; Git does not, which is why Git encourages
branching often — even several times a day.

**Detached HEAD:** if you `checkout` a raw commit or tag, `HEAD` points at the
commit instead of a branch. Commits made there belong to no branch and can be lost
unless you create a branch. To work from a tag, do `git switch -c <branch> <tag>`.

## 5. Merging and conflicts

Two cases:

- **Fast-forward** — the target branch is a direct ancestor, so Git just slides the
  pointer forward. No merge commit.
- **Three-way merge** — histories have diverged. Git uses the two tips plus their
  common ancestor, creates a new snapshot, and makes a **merge commit** with two
  parents. `--no-ff` forces a merge commit even when a fast-forward is possible,
  preserving the fact that a feature branch existed.

**Conflicts** happen when both sides changed the same lines. Git writes markers:

```
<<<<<<< HEAD:index.html
your side
=======
their side
>>>>>>> iss53:index.html
```

Resolve by editing the file to the desired result, removing the markers, then
`git add <file>` (staging marks it resolved) and `git commit`. `git mergetool`
launches a graphical resolver.

**Best practice for beginners:** merge `main` *into* your feature branch regularly
to keep conflicts small and frequent rather than large and rare.

## 6. Stashing in detail

`git stash` (a.k.a. `git stash push`) saves the dirty state of the working tree —
modified tracked files and staged changes — onto a **stack**, and resets the tree
to `HEAD`. Useful variants:

- `git stash -u` — also stash untracked files; `-a` (or `--all`) also stashes
  ignored files.
- `git stash --keep-index` — stash but leave staged content in the index.
- `git stash -p` — interactively choose hunks to stash.
- `git stash list` — show the stack (`stash@{0}` is newest).
- `git stash apply [stash@{n}]` — re-apply, keep on stack; add `--index` to restore
  staged-ness too.
- `git stash pop` — apply newest and drop it.
- `git stash drop stash@{n}` — remove a stash.
- `git stash branch <name>` — create a branch from where the stash was made and
  apply it there; a clean way to recover a stash that no longer applies.
- `git stash clear` — discard the whole stack (**destructive**).

`git clean` is *related but different*: it deletes untracked files outright. Always
preview with `git clean -n` (dry run) before `git clean -f`; `-d` includes
directories, `-x` also removes ignored files. If you might want the files back,
`git stash -a` first instead.

## 7. Tags in detail

- **Annotated** (`git tag -a v1.4 -m "…"`): a full object with tagger, date,
  message; can be signed. Recommended for releases.
- **Lightweight** (`git tag v1.4-lw`): just a pointer to a commit.
- Tag an older commit: `git tag -a v1.2 <hash>`.
- Inspect: `git show v1.4`; list with pattern: `git tag -l "v1.8.5*"`.
- Delete local: `git tag -d <tag>`; remote: `git push origin --delete <tag>`.
- **Sharing:** `git push` does **not** include tags by default. Push them with
  `git push origin <tag>` or all at once with `git push origin --tags`
  (`--follow-tags` pushes only annotated ones).

Tags are how you mark "the state of the analysis I submitted", "the dataset
snapshot for the paper", etc. — immovable anchors that branches can't provide.

## 8. Undo decision guide

| Situation | Command |
|---|---|
| Forgot to stage a file in the last commit | `git add <file>` then `git commit --amend` |
| Bad commit message, not yet pushed | `git commit --amend` |
| Un-stage a file, keep edits | `git restore --staged <file>` |
| Discard edits in a file (**destructive**) | `git restore <file>` |
| Undo last commit, keep changes staged | `git reset --soft HEAD~1` |
| Undo last commit, keep changes unstaged | `git reset --mixed HEAD~1` (default) |
| Undo last commit, **discard** changes | `git reset --hard HEAD~1` (**destructive**) |
| Undo a **pushed** commit safely | `git revert <commit>` (makes a new commit) |

Golden rules: (1) don't rewrite (`amend`/`reset`) history that others have pulled;
(2) `git reflog` is your safety net — it lists every place `HEAD` has been, letting
you recover "lost" commits; (3) commit early so you rarely need to uncommitted-undo.

## Common misconceptions, collected

- "`git add` adds a file to the project." No — it stages a *version*.
- "Branching copies the project." No — a branch is a tiny pointer.
- "Tags are pushed with a normal push." No — you must push them explicitly.
- "`git pull` is always safe." It merges; a divergence can conflict. `git fetch`
  first if you want to look before you merge.
- "Undo always means discard." Most undos (`revert`, `--soft`) preserve the work.
- "Git tracks renames/moves." It infers them from content; there's no rename
  metadata.
- "Committed work can't be recovered after a mistake." It almost always can
  (reflog, `revert`). Uncommitted work is the fragile part.

## Best practices for a research project

- **Commit often, in small logical units**, each with a message explaining *why*
  (what the experiment/analysis change was), not just *what* changed.
- **Branch for experiments**: `git switch -c try-different-optimiser`; merge the
  winners, delete the losers. Never risk your working main branch.
- **Keep data out of Git** unless small and essential; large/binary datasets belong
  in `.gitignore` (or Git LFS) so the repository stays fast and cloneable.
- **Write `.gitignore` early** (`.venv/`, `__pycache__/`, `*.ipynb_checkpoints/`,
  large data folders, model checkpoints).
- **Tag milestones** you may need to return to (`v0.1`, `submitted`).
- **Never commit secrets** (API keys, tokens) — add config files with secrets to
  `.gitignore`.
- **Pull/fetch before you start** so your branch is current.
