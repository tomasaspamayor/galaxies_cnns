# Git Resources

Curated, high-trust sources for learning Git. Knowledge for lessons is drawn from
here; wisdom comes from the communities at the bottom.

## Knowledge

- [Book: _Pro Git_ (2nd ed.) by Scott Chacon & Ben Straub — git-scm.com](https://git-scm.com/book/en/v2)
  The canonical free book, maintained by the Git project's site. Use for:
  everything — the three states, branching, merging, stashing, tagging, reset.
  This is the workspace's primary source.
- [Reference: Git command reference — git-scm.com/docs](https://git-scm.com/docs)
  The official man pages, one page per command. Use for: exact flags and
  authoritative behaviour once you know the concept.
- [Cheat sheet: GitHub/education Git cheat sheet (PDF)](https://education.github.com/git-cheat-sheet-education.pdf)
  One-page command summary. Use for: quick recall of command syntax.
- [Interactive: Learn Git Branching — learngitbranching.js.org](https://learngitbranching.js.org/)
  In-browser visual sandbox for branching/merging/rebase. Use for: building
  intuition about how commit graphs behave, with instant feedback.
- [Guide: _Git from the Bottom Up_ by John Wiegley](https://jwiegley.github.io/git-from-the-bottom-up/)
  Explains Git's data model (blobs, trees, commits, refs) from first principles.
  Use for: the "why" behind the mental model, when you want to go deeper.
- [Guide: Atlassian Git tutorials](https://www.atlassian.com/git/tutorials)
  Well-written task-oriented tutorials with diagrams. Use for: a second
  explanation of branching workflows and merging.

## Wisdom (Communities)

- [r/git](https://www.reddit.com/r/git/)
  Active Q&A community for specific Git questions and error messages.
- [Stack Overflow — `git` tag](https://stackoverflow.com/questions/tagged/git)
  Deep archive of real problems; most Git errors already have a high-vote answer.
- [Oh Shit, Git!?! — ohshitgit.com](https://ohshitgit.com/)
  Plain-language recipes for recovering from common mistakes. Use for: "I did X
  and now everything is broken" moments.
- Local: your UAB research group / supervisor.
  Use for: conventions specific to how your lab version-controls data and code.

## Gaps

- No high-trust, beginner-level guide yet on Git for **large data files** in
  science (`.gitignore` patterns for datasets, when to reach for Git LFS vs.
  keeping data out of the repo entirely). Search when the project hits this.
- No source yet on **notebooks** (`*.ipynb`) in Git — diffing/merging Jupyter
  files and strip-output tools. Add when relevant.
