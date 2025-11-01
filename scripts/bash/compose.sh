#!/usr/bin/env bash
# 作曲辅助 - 生成和弦进行、旋律提示和五线谱

# 加载通用函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 获取项目路径
PROJECT_DIR=$(get_current_project)
PROJECT_NAME=$(get_project_name)

# 检查必需文件
SPEC_FILE=$(check_spec_exists)
LYRICS_FILE="$PROJECT_DIR/lyrics.md"

if [ ! -f "$LYRICS_FILE" ]; then
    output_json "{
      \"status\": \"error\",
      \"message\": \"未找到 lyrics.md。请先创作歌词。\"
    }"
    exit 1
fi

# 读取文件
spec_content=$(cat "$SPEC_FILE")
lyrics_content=$(cat "$LYRICS_FILE")

# 读取可选文件
structure_content="{}"
STRUCTURE_FILE="$PROJECT_DIR/structure.json"
if [ -f "$STRUCTURE_FILE" ]; then
    structure_content=$(cat "$STRUCTURE_FILE")
fi

mood_content="{}"
MOOD_FILE="$PROJECT_DIR/mood.json"
if [ -f "$MOOD_FILE" ]; then
    mood_content=$(cat "$MOOD_FILE")
fi

theme_content=""
THEME_FILE="$PROJECT_DIR/theme.md"
if [ -f "$THEME_FILE" ]; then
    theme_content=$(read_file_as_json "$THEME_FILE")
fi

output_json "{
  \"status\": \"success\",
  \"project_name\": \"$PROJECT_NAME\",
  \"spec\": $spec_content,
  \"structure\": $structure_content,
  \"mood\": $mood_content,
  \"theme\": \"$theme_content\",
  \"lyrics_content\": \"$(escape_json "$lyrics_content")\",
  \"message\": \"AI 应根据歌曲信息生成完整的作曲辅助内容\",
  \"output_files\": {
    \"composition_yaml\": \"$PROJECT_DIR/composition.yaml\",
    \"notation_abc\": \"$PROJECT_DIR/notation.abc\"
  },
  \"required_content\": [
    \"chord_progression (和弦进行)\",
    \"melody_hints (旋律提示)\",
    \"abc_notation (五线谱)\",
    \"instrumentation (乐器配置)\",
    \"reference_songs (参考歌曲)\"
  ]
}"
