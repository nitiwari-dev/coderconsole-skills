#!/bin/sh

set -eu

REPOSITORY="nitiwari-dev/coderconsole-skills"
REF="main"
AGENT=""
SCOPE="user"
SELECTED_SKILL=""
SKILL_SELECTION_SET=false
TEMP_DIR=""

usage() {
  cat <<'EOF'
Install CoderConsole agent skills from the manifest.

Usage:
  install-coderconsole-skill.sh --agent <codex|claude|antigravity|all> --skill <skill-name> [--skill <skill-name> ... | --skill all] [--scope <user|project>] [--ref <git-ref>]

Options:
  --agent       Target agent, or all supported agents.
  --skill       Skill from skills/manifest.conf. Repeat for multiple skills; use --skill all for all skills.
  --scope       user (default) installs across projects; project installs in the current repository.
  --ref         Git branch, tag, or commit to fetch (default: main).
  --help        Show this help.

Examples:
  curl -fsSL https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/main/scripts/install-coderconsole-skill.sh | sh -s -- --agent codex --skill coderconsole-base64
  curl -fsSL https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/main/scripts/install-coderconsole-skill.sh | sh -s -- --agent codex --skill coderconsole-json --skill coderconsole-color --ref v1.0.0
  curl -fsSL https://raw.githubusercontent.com/nitiwari-dev/coderconsole-skills/main/scripts/install-coderconsole-skill.sh | sh -s -- --agent all --skill all --scope project
EOF
}

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --agent)
      [ "$#" -ge 2 ] || fail "--agent requires a value."
      AGENT=$2
      shift 2
      ;;
    --scope)
      [ "$#" -ge 2 ] || fail "--scope requires a value."
      SCOPE=$2
      shift 2
      ;;
    --skill)
      [ "$#" -ge 2 ] || fail "--skill requires a value."
      if [ "$SKILL_SELECTION_SET" = false ]; then
        SELECTED_SKILL=""
        SKILL_SELECTION_SET=true
      fi
      case "$2" in
        all)
          [ -z "$SELECTED_SKILL" ] || fail "Use --skill all by itself; do not combine it with individual skills."
          SELECTED_SKILL=all
          ;;
        *[!A-Za-z0-9._-]*|"")
          fail "Invalid skill name: $2"
          ;;
        *)
          [ "$SELECTED_SKILL" != all ] || fail "Use --skill all by itself; do not combine it with individual skills."
          case ",$SELECTED_SKILL," in
            *,"$2",*) ;;
            *)
              if [ -z "$SELECTED_SKILL" ]; then
                SELECTED_SKILL=$2
              else
                SELECTED_SKILL="$SELECTED_SKILL,$2"
              fi
              ;;
          esac
          ;;
      esac
      shift 2
      ;;
    --ref)
      [ "$#" -ge 2 ] || fail "--ref requires a value."
      REF=$2
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
done

case "$AGENT" in
  codex|claude|antigravity|all) ;;
  *) fail "Choose --agent codex, claude, antigravity, or all." ;;
esac
case "$REF" in
  ""|/*|*..*|*[!A-Za-z0-9._/-]*) fail "Choose a safe branch, tag, or commit ref." ;;
esac
[ "$SKILL_SELECTION_SET" = true ] || fail "Choose at least one --skill, or use --skill all to install the complete collection."
case "$SCOPE" in
  user|project) ;;
  *) fail "Choose --scope user or project." ;;
esac
if [ "$SCOPE" = project ]; then
  [ -d . ] && [ -w . ] || fail "The current directory is not writable."
fi

cleanup() {
  if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT HUP INT TERM

LOCAL_SKILLS_DIR=""
SCRIPT_PATH=$0
if [ -f "$SCRIPT_PATH" ]; then
  case "$SCRIPT_PATH" in
    /*) ;;
    *) SCRIPT_PATH=$(pwd)/$SCRIPT_PATH ;;
  esac
  SCRIPT_DIR=$(CDPATH= cd "$(dirname "$SCRIPT_PATH")" && pwd)
  if [ -f "$SCRIPT_DIR/../skills/manifest.conf" ]; then
    LOCAL_SKILLS_DIR="$SCRIPT_DIR/../skills"
  fi
fi

if [ -n "$LOCAL_SKILLS_DIR" ]; then
  SKILLS_DIR=$LOCAL_SKILLS_DIR
  MANIFEST="$SKILLS_DIR/manifest.conf"
  REMOTE_MODE=false
else
  command -v curl >/dev/null 2>&1 || fail "curl is required to fetch the skill manifest and files."
  TEMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/coderconsole-skills.XXXXXX")
  SKILLS_DIR="$TEMP_DIR/skills"
  mkdir -p "$SKILLS_DIR"
  MANIFEST="$SKILLS_DIR/manifest.conf"
  MANIFEST_URL="https://raw.githubusercontent.com/$REPOSITORY/$REF/skills/manifest.conf"
  curl -fsSL "$MANIFEST_URL" -o "$MANIFEST" || fail "Could not fetch the skills manifest for ref '$REF'. Check that the ref exists and $REPOSITORY is public."
  REMOTE_MODE=true
fi

is_skill_selected() {
  if [ "$SELECTED_SKILL" = all ]; then
    return 0
  fi
  case ",$SELECTED_SKILL," in
    *,"$1",*) return 0 ;;
    *) return 1 ;;
  esac
}

validate_skill_selection() {
  if [ "$SELECTED_SKILL" = all ]; then
    return 0
  fi
  old_ifs=$IFS
  IFS=,
  set -- $SELECTED_SKILL
  IFS=$old_ifs
  for requested_skill in "$@"; do
    requested_found=false
    while IFS='|' read -r listed_skill listed_files; do
      if [ "$listed_skill" = "$requested_skill" ]; then
        requested_found=true
      fi
    done < "$MANIFEST"
    [ "$requested_found" = true ] || fail "Skill '$requested_skill' is not listed in skills/manifest.conf."
  done
}

validate_skill_selection

prepare_skills() {
  while IFS='|' read -r prepared_skill prepared_files; do
    case "$prepared_skill" in
      ""|\#*) continue ;;
    esac
    if [ "$prepared_skill" != _runtime ] && ! is_skill_selected "$prepared_skill"; then
      continue
    fi
    old_ifs=$IFS
    IFS=,
    set -- $prepared_files
    IFS=$old_ifs
    for prepared_path in "$@"; do
      case "$prepared_path" in
        ""|/*|*..*|*[!A-Za-z0-9._/-]*) fail "Unsafe file path in manifest for $prepared_skill." ;;
      esac
      prepared_file="$SKILLS_DIR/$prepared_skill/$prepared_path"
      if [ "$REMOTE_MODE" = true ]; then
        mkdir -p "$(dirname "$prepared_file")"
        file_url="https://raw.githubusercontent.com/$REPOSITORY/$REF/skills/$prepared_skill/$prepared_path"
        curl -fsSL "$file_url" -o "$prepared_file" || fail "Could not download $prepared_skill/$prepared_path."
      else
        [ -f "$prepared_file" ] || fail "Manifest references missing file: $prepared_file"
      fi
    done
  done < "$MANIFEST"
}

prepare_skills
REMOTE_MODE=false

install_skill() {
  skill_id=$1
  file_list=$2
  destination=$3
  skill_source="$SKILLS_DIR/$skill_id"
  mkdir -p "$destination"
  old_ifs=$IFS
  IFS=,
  set -- $file_list
  IFS=$old_ifs
  for relative_path in "$@"; do
    case "$relative_path" in
      ""|/*|*..*|*[!A-Za-z0-9._/-]*) fail "Unsafe file path in manifest for $skill_id." ;;
    esac
    source_file="$skill_source/$relative_path"
    destination_file="$destination/$relative_path"
    mkdir -p "$(dirname "$destination_file")"
    if ! cmp -s "$source_file" "$destination_file"; then
      cp "$source_file" "$destination_file"
    fi
  done
  [ "$skill_id" = _runtime ] || printf 'Installed %s at %s\n' "$skill_id" "$destination"
}

install_for_agent() {
  agent_name=$1
  if [ "$SCOPE" = project ]; then
    case "$agent_name" in
      codex|antigravity) install_root="$(pwd)/.agents/skills" ;;
      claude) install_root="$(pwd)/.claude/skills" ;;
    esac
  else
    case "$agent_name" in
      codex) install_root="${HOME:?HOME is not set}/.agents/skills" ;;
      claude) install_root="${HOME:?HOME is not set}/.claude/skills" ;;
      antigravity) install_root="${HOME:?HOME is not set}/.gemini/config/skills" ;;
    esac
  fi

  while IFS='|' read -r skill_id file_list; do
    case "$skill_id" in
      ""|\#*) continue ;;
    esac
    if [ "$skill_id" = _runtime ] || is_skill_selected "$skill_id"; then
      install_skill "$skill_id" "$file_list" "$install_root/$skill_id"
    fi
  done < "$MANIFEST"
}

case "$AGENT" in
  all)
    install_for_agent codex
    install_for_agent claude
    install_for_agent antigravity
    ;;
  *) install_for_agent "$AGENT" ;;
esac

printf '\nRestart or refresh your coding agent to load the installed skill(s).\n'
