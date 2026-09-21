#!/usr/bin/env bash
set -euo pipefail

# Symlinks every promoted skill into the local harness skill directories, so a
# `git pull` in this repo is enough to update what is installed.
#
# `meta/` is left out on purpose: those skills only make sense inside this
# repository, and they already load from the committed `.claude/skills/`
# symlinks when an agent runs here.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
PROMOTED=(engineering productivity)
DESTS=("$HOME/.claude/skills" "$HOME/.agents/skills")

srcs=()
for bucket in "${PROMOTED[@]}"; do
  [ -d "$REPO/skills/$bucket" ] || continue
  while IFS= read -r -d '' skill_md; do
    srcs+=("$(dirname "$skill_md")")
  done < <(find "$REPO/skills/$bucket" -name SKILL.md -print0)
done

if [ ${#srcs[@]} -eq 0 ]; then
  echo "no promoted skills found under $REPO/skills" >&2
  exit 1
fi

for dest in "${DESTS[@]}"; do
  # A whole-directory symlink pointing back here would make the per-skill links
  # land inside the repo's own tree. Refuse instead of polluting the checkout.
  if [ -L "$dest" ]; then
    resolved="$(readlink -f "$dest")"
    case "$resolved" in
      "$REPO" | "$REPO"/*)
        echo "error: $dest is a symlink into this repo ($resolved)." >&2
        echo "Remove it and re-run; this script will recreate it as a real directory." >&2
        exit 1
        ;;
    esac
  fi

  mkdir -p "$dest"
  for src in "${srcs[@]}"; do
    target="$dest/$(basename "$src")"
    [ -e "$target" ] && [ ! -L "$target" ] && rm -rf "$target"
    ln -sfn "$src" "$target"
    echo "linked $(basename "$src") -> $target"
  done
done

echo
echo "Restart running agents: harnesses read SKILL.md at startup."
