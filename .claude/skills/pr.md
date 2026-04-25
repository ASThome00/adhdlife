Create a pull request for the current branch.

1. Run these in parallel using Bash:
   - `git status` to see uncommitted changes
   - `git log main..HEAD --oneline` to list commits on this branch
   - `git diff main...HEAD` to see all changes

2. Analyze every commit included in the branch (not just the latest). Understand what changed and why.

3. Draft a PR title (≤70 chars, present tense, e.g. "Add quick-add modal with category picker").

4. Create the PR with `gh pr create` using a HEREDOC for the body:

```
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<1–3 bullet points describing what changed and why>

## Changes
<specific list of files / components changed>

## Testing
<steps to verify the feature works — golden path + edge cases>

## Screenshots
<note "UI changes — see description" or omit if backend-only>
EOF
)"
```

5. Return the PR URL so the user can open it.

Rules:
- Never push to main directly — warn the user if they are on main.
- If the branch has no remote tracking branch, push it first with `git push -u origin HEAD`.
- Do not amend commits or force-push.
- If `gh` is not authenticated, tell the user to run `gh auth login` and stop.
- Do NOT include any AI attribution anywhere — no "Generated with Claude Code", no "Co-Authored-By: Claude", no "Co-Authored-By: Anthropic", no mention of AI, Claude, or Anthropic in the PR title, body, commit messages, or any git metadata. Write everything as if a human authored it.
