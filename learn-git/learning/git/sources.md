# Git — Sources

Every source is listed with its title, URL, publication details where known, and
the specific claims it supports. All URLs were retrieved and read on 2026-10-19.

## Primary — official documentation

**[Pro Git, 2nd Edition](https://git-scm.com/book/en/v2)** — Scott Chacon and Ben
Straub. Published by Apress; available free (CC BY-SA 3.0) on the official Git
website. The reference text for this brief.

Claims drawn from it, chapter by chapter:

- **§1.3 What is Git?** <https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F>
  Supports: Git stores *snapshots, not differences*; nearly every operation is
  local; everything is checksummed with a SHA-1 hash and described as having
  "integrity"; Git generally only adds data; the **three states** (modified /
  staged / committed) and **three sections** (working tree / staging area or
  "index" / git directory); the basic workflow (edit → stage → commit).

- **§2.2 Recording Changes to the Repository**
  <https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository>
  Supports: tracked vs. untracked files; the file **lifecycle**; `git status`
  behaviour; `git add` stages the file *as it is when you run it* (the "modified
  and staged at once" phenomenon); short status output and its two-column codes;
  `.gitignore` rules; `git diff` (working tree ⇄ index) vs. `git diff --staged`
  (index ⇄ last commit); `git commit -a`.

- **§2.3 Viewing the Commit History**
  <https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History>
  Supports: `git log` reverse-chronological default; `-p`, `--stat`, `--pretty`,
  `--oneline`, `--graph`; limiting output (`--since`, `--author`, `-S`); the
  author-vs-committer distinction.

- **§2.4 Undoing Things** <https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things>
  Supports: `git commit --amend` (and that it *replaces* the previous commit);
  un-staging with `git reset HEAD <file>` or `git restore --staged <file>`;
  un-modifying with `git checkout -- <file>` or `git restore <file>`; the repeated
  warning that `git restore`/`checkout --` are **destructive** to uncommitted work;
  that committed work is generally recoverable.

- **§2.6 Tagging** <https://git-scm.com/book/en/v2/Git-Basics-Tagging>
  Supports: lightweight vs. annotated tags; `git tag -a -m`; tagging older commits
  by hash; `git show` on a tag; tags are **not** pushed by default (`git push
  origin <tag>` / `--tags` / `--follow-tags`); deleting local and remote tags;
  detached HEAD when checking out a tag.

- **§3.1 Branches in a Nutshell**
  <https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell>
  Supports: a branch is a *lightweight movable pointer to a commit*; commit object
  contents (tree, parent(s), author, message); `HEAD` as a pointer to the current
  branch; branching is cheap (a 41-byte file) vs. older VCSs copying the tree;
  `git checkout -b` / `git switch -c`; detached-HEAD caveats.

- **§3.2 Basic Branching and Merging**
  <https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging>
  Supports: the branch/hotfix workflow; **fast-forward** merges; **three-way
  merge** and the resulting **merge commit** with two parents; conflict markers
  (`<<<<<<<`, `=======`, `>>>>>>>`); resolving conflicts and `git add`-to-mark-
  resolved; `git mergetool`.

- **§7.3 Stashing and Cleaning**
  <https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning>
  Supports: `git stash` saves the dirty working state (modified tracked + staged)
  onto a **stack**; `git stash push` (replaces deprecated `save`); `apply` vs.
  `pop`; `--index`; `list`/`drop`; `-u`/`--all`; `--keep-index`; `--patch`;
  `git stash branch <name>`; `git clean` and the importance of `-n` dry runs.

## Secondary — official reference & educational

- **[Git command reference (man pages)](https://git-scm.com/docs)** — official
  per-command documentation from the Git project. Used to confirm exact flags.
- **[GitHub Git Cheat Sheet (PDF)](https://education.github.com/git-cheat-sheet-education.pdf)**
  — one-page command summary published by GitHub Education. Used for quick-recall
  phrasing in the workspace cheat sheet.
- **[Learn Git Branching](https://learngitbranching.js.org/)** — interactive visual
  sandbox by Peter Cottle. Supports: intuition for commit graphs, branching, and
  merging with immediate feedback. Recommended as practice for Lesson 0002.
- **[_Git from the Bottom Up_](https://jwiegley.github.io/git-from-the-bottom-up/)**
  — John Wiegley. Explains the object model (blobs, trees, commits, refs) from first
  principles. Supports the "light touch" internals section in `notes.md`.
- **[Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)** — task-
  oriented tutorials with diagrams. Used as a cross-check on branching workflows.
- **[Oh Shit, Git!?!](https://ohshitgit.com/)** — practical recovery recipes.
  Supports the "common mistakes and recovery" framing.

## Cross-checking and uncertainty

- The snapshot model, three-states model, branch-as-pointer, and stash/tag
  behaviour are consistent across Pro Git and the official man pages — treated as
  **established facts**.
- **SHA hashing:** Pro Git §1.3 describes SHA-1 (40 hex characters). Newer Git
  supports SHA-256 repositories, and SHA-1 collision resistance is a known concern;
  the default in practice is still SHA-1. Recorded as a **nuance**, not a
  contradiction.
- **Default branch name:** the book uses `master` but explicitly notes hosts moved
  to `main` in 2020. Both are correct; name is irrelevant to behaviour.
- **`git checkout` vs `switch`/`restore`:** Git 2.23 (2019) split `checkout` into
  `switch` and `restore`; both spellings remain valid and `checkout` is still
  ubiquitous, so the brief teaches both.

## Research limitations

- No laboratory or empirical study was used; this is documentation-grounded, not
  experimentally verified. Claims rest on the authority of the official project
  documentation.
- No source was found for the two flagged gaps (large scientific data files /
  Git LFS guidance, and Jupyter-notebook diffing). See [`RESOURCES.md`](../../RESOURCES.md)
  → Gaps.
