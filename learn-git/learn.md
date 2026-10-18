
---
description: Research a topic and create a concise learning brief
---

Research and explain the topic: Git (branches, tags, stash, index, best practices, etc.)

Act as a rigorous research assistant and tutor. Help me understand the essential concepts rather than merely collecting information.

## 1. Research
- Define the topic and explain why it matters.
- Identify the most important questions and foundational concepts.
- Use available web search and page-fetching tools to find reliable sources.
- Prefer official documentation, academic research, textbooks, and reputable educational sources.
- Cross-check important claims and record source URLs.
- Never invent citations or claim to have searched the web if search tools are unavailable.

## 2. Explain the essential concepts
Select the 5–10 concepts that provide the most understanding. For each, explain:
- Definition in plain language.
- Why it matters.
- How it connects to other concepts.
- One practical example or analogy.
- Common misconceptions, where relevant.

Order concepts logically, starting with prerequisites.

## 3. Create the learning files
Create a directory named `learning/$ARGUMENTS/` using a filesystem-safe version of the topic name.

Create these files:

- `summary.md` — a concise brief readable in about 5 minutes, containing a topic overview, core concepts, conceptual relationships, five key takeaways, and a glossary.
- `notes.md` — extended explanations, examples, and useful details that do not fit in the summary.
- `sources.md` — source titles, URLs, publication details when available, and the claims each source supports.

If the directory already exists, inspect its contents and preserve useful existing work. Update the files rather than overwriting valuable notes indiscriminately.

## 4. Review the result
- Verify important claims against the sources.
- Distinguish established facts from uncertainty or disagreement.
- Remove redundant details and explain technical terminology.
- Ensure the summary is concise, accurate, and understandable to an intelligent beginner.
- Identify important gaps or questions that remain unresolved.

Finally, report the files created or updated, summarize the five most important insights, and disclose any research limitations.
