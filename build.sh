#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT_DIR="output"
mkdir -p "$OUTPUT_DIR"

# ---------- 章节目录 ----------

zh_chapters=(
  "chapters/00-序章"
  "chapters/01-认识论"
  "chapters/02-不确定性与决策"
  "chapters/03-人机协作的软件过程"
  "chapters/04-声明式提示与类型契约"
  "chapters/05-架构与编排"
  "chapters/06-测试评估与可观测性"
  "chapters/07-反模式与陷阱"
  "chapters/08-终章"
)

en_chapters=(
  "en/chapters/00-preface"
  "en/chapters/01-epistemology"
  "en/chapters/02-uncertainty-and-decisions"
  "en/chapters/03-human-ai-collaboration"
  "en/chapters/04-declarative-prompts-and-type-contracts"
  "en/chapters/05-architecture-and-orchestration"
  "en/chapters/06-testing-evaluation-and-observability"
  "en/chapters/07-anti-patterns-and-pitfalls"
  "en/chapters/08-epilogue"
)

# ---------- 构建函数 ----------

build_pdf() {
  local lang=$1
  local metadata=$2
  local output_name=$3
  local filter=$4
  shift 4
  local chapters=("$@")

  # 收集源文件
  local sources=()
  for chapter in "${chapters[@]}"; do
    while IFS= read -r f; do
      sources+=("$f")
    done < <(find "$chapter" -name '*.md' -maxdepth 1 | sort)
  done

  if [ ${#sources[@]} -eq 0 ]; then
    echo "Warning: no markdown files found for $lang, skipping" >&2
    return
  fi

  echo "Building $lang PDF (${#sources[@]} files)..."
  pandoc "$metadata" "${sources[@]}" \
    --from markdown \
    --lua-filter="$filter" \
    --pdf-engine=typst \
    -V template=book-conf.typst \
    -M toc=false \
    --output "$OUTPUT_DIR/$output_name"
  echo "  -> $OUTPUT_DIR/$output_name"
}

# ---------- 构建 ----------

build_pdf "zh" "metadata.yaml" "大模型应用的工程哲学.pdf" "pdf-filter.lua" "${zh_chapters[@]}"
build_pdf "en" "metadata-en.yaml" "engineering-philosophy-of-llm-applications.pdf" "pdf-filter-en.lua" "${en_chapters[@]}"

echo "Done."
