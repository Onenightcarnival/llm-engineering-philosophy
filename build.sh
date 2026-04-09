#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT_DIR="output"
mkdir -p "$OUTPUT_DIR"

# 按章节顺序收集所有 Markdown 文件
chapters=(
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

sources=()
for chapter in "${chapters[@]}"; do
  # 每个章节目录下的 .md 文件按文件名排序（00-概述.md 在前）
  while IFS= read -r f; do
    sources+=("$f")
  done < <(find "$chapter" -name '*.md' -maxdepth 1 | sort)
done

if [ ${#sources[@]} -eq 0 ]; then
  echo "Error: no markdown files found" >&2
  exit 1
fi

echo "Found ${#sources[@]} files across ${#chapters[@]} chapters"

# 共享输入
inputs=(metadata.yaml "${sources[@]}")

echo "Building PDF..."
pandoc "${inputs[@]}" \
  --from markdown \
  --lua-filter=pdf-filter.lua \
  --pdf-engine=typst \
  -V template=book-conf.typst \
  -M toc=false \
  --output "$OUTPUT_DIR/大模型应用的工程哲学.pdf"
echo "  -> $OUTPUT_DIR/大模型应用的工程哲学.pdf"

echo "Done."
