# Redis Documentation Project

## Project Rules
- Follow the existing MkDocs configuration and repository conventions.
- Never redesign the theme, navigation system, scripts, or CSS unless explicitly requested.
- Write all learning content in Indonesian.
- Target readers who are new to Redis.
- Use official Redis documentation as the primary technical reference.
- Inspect only files relevant to the current task.

## Teaching Standard
Every chapter must include:
1. Learning objectives.
2. Prerequisites.
3. Simple concept explanation and analogy.
4. Step-by-step examples.
5. Complete, runnable code when a complete example is appropriate.
6. Explanation of commands, parameters, and important code blocks.
7. Expected output and how to interpret it.
8. Common errors and troubleshooting.
9. Practice exercises.
10. Chapter summary.

Explain WHY a command or code block is needed, not just WHAT it does.

## Code Standards
- State required software, versions when relevant, and setup steps.
- Label the execution environment: terminal, redis-cli, Python, YAML, or shell.
- Keep examples small and runnable.
- Explain important lines directly below each code block.
- Never invent command output; distinguish expected output from verified output.
- Use placeholders for secrets. Never include real credentials.
- Identify destructive commands and data-loss risks.
- Verify Redis commands against the supported target version.

## Markdown Standards
- Follow the existing repository's heading, admonition, diagram, and link conventions.
- Keep headings, filenames, and navigation consistent.
- Avoid duplicated explanations across chapters.
- Use relative links consistent with the existing MkDocs configuration.
- Include diagrams only when they improve understanding.

## Token Efficiency
- Work on one chapter or one small task per session.
- Read CLAUDE.md and only the files needed for the task.
- Do not reread the entire repository.
- Do not regenerate completed chapters without explicit reason.
- Prefer targeted edits over rewriting whole files.
- Summarize changed files, validation, and remaining issues.
- Ask before changing shared configuration or unrelated content.

## Validation
- Run the existing MkDocs build command when appropriate.
- Check broken internal links, navigation, code examples, and formatting.
- Do not claim code was tested unless it was actually executed.
- Fix only issues related to the current task.

## Chapter Template Rules

- Before creating or substantially editing a Redis chapter, read the Redis chapter template at `docs/redis/_template-bab.md`.
- Use the template as the default structure for every new chapter.
- Replace all placeholders with actual educational content.
- Keep the beginner-friendly explanations, code explanations, expected outputs, exercises, summaries, and references.
- Do not copy template instructions or placeholders into published learning content.
- Read the template once per task when possible; do not reread it for every file in the same task.
- If the template path changes, inspect the repository and update this rule accordingly.

## Section Index Rules

- Every section (a folder under `docs/`, such as `pengenalan/`) must have an `index.md` as its opening page.
- Create the `index.md` together with the first chapter of a section, and list it first under that section in `nav` (`- <folder>/index.md`), before the chapters.
- Do not create an `index.md` or an empty folder for a section that has no chapters yet, unless the user explicitly asks to show the section structure in `nav` ahead of time. In that case the index carries an `!!! info "Belum ditulis"` notice, lists the planned chapters as plain text (no links), and is the only page of the section in `nav` (`- <Section name>: <folder>/index.md`). When the first chapter is written, turn the section into a group, link the chapters, and remove the notice.
- Write the index in Indonesian with: one `#` heading with the section name; a short summary; section learning objectives; section prerequisites; a table of chapters in reading order, each linked with a relative link and a one-line description; optional chapters marked "(opsional)"; and what comes next.
- Link only to chapters that exist. Refer to unwritten chapters or sections as plain text.
- Do not repeat chapter content in the index; keep it a map, not a lesson.
- Update the index whenever a chapter is added, renamed, or removed in that section.
- Do not copy the 10-item chapter standard into an index; it applies to chapters only.
