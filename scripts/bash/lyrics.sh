#!/usr/bin/env bash
# 歌词创作 - 交互式模式选择

# 加载通用函数库
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 获取项目路径
PROJECT_DIR=$(get_current_project)
PROJECT_NAME=$(get_project_name)

# 检查必需文件
SPEC_FILE=$(check_spec_exists)
THEME_FILE=$(check_theme_exists)
STRUCTURE_FILE=$(check_structure_exists)
LYRICS_FILE="$PROJECT_DIR/lyrics.md"

# 模式配置文件
MODE_CONFIG="$PROJECT_DIR/.musicify/lyrics_mode"
ensure_dir "$PROJECT_DIR/.musicify"

# 检查是否已有模式配置
if [ -f "$MODE_CONFIG" ]; then
    MODE=$(cat "$MODE_CONFIG")
else
    MODE=""  # 未配置,需要询问用户
fi

# 解析参数 (可选快捷方式,向后兼容)
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode)
            MODE="$2"
            # 保存用户选择的模式
            echo "$MODE" > "$MODE_CONFIG"
            shift 2
            ;;
        --project)
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# 读取配置文件
spec_content=$(cat "$SPEC_FILE")
theme_content=$(cat "$THEME_FILE")
structure_content=$(cat "$STRUCTURE_FILE")

# 如果没有配置模式,输出询问信息
if [ -z "$MODE" ]; then
    output_json "{
      \"status\": \"need_mode_selection\",
      \"project_name\": \"$PROJECT_NAME\",
      \"spec\": $spec_content,
      \"theme\": \"$(escape_json "$theme_content")\",
      \"structure\": $structure_content,
      \"message\": \"AI 应询问用户选择创作模式\",
      \"mode_options\": [
        \"1. 教练模式 (Coach) - AI 逐段引导你思考,提问式激发,100% 原创\",
        \"2. 快速模式 (Express) - AI 直接生成完整歌词,快速迭代\",
        \"3. 混合模式 (Hybrid) - AI 生成框架和关键句,你填充细节\"
      ],
      \"mode_config_file\": \"$MODE_CONFIG\"
    }"
    exit 0
fi

# 检查是否已有歌词文件
if [ -f "$LYRICS_FILE" ]; then
    existing_lyrics=$(cat "$LYRICS_FILE")
    word_count=$(count_lyrics_words "$LYRICS_FILE")
    
    output_json "{
      \"status\": \"success\",
      \"action\": \"review\",
      \"project_name\": \"$PROJECT_NAME\",
      \"lyrics_file\": \"$LYRICS_FILE\",
      \"mode\": \"$MODE\",
      \"spec\": $spec_content,
      \"theme\": \"$(escape_json "$theme_content")\",
      \"structure\": $structure_content,
      \"existing_lyrics\": \"$(escape_json "$existing_lyrics")\",
      \"word_count\": $word_count,
      \"message\": \"发现已有歌词，AI 可引导用户审查或修改\"
    }"
else
    # 创建歌词模板
    cat > "$LYRICS_FILE" <<EOF
# 歌词

## 歌曲信息
- 创作模式: $MODE
- 创建时间: $(date '+%Y-%m-%d %H:%M:%S')

---

## [Intro]


## [Verse 1]


## [Pre-Chorus]


## [Chorus]


## [Verse 2]


## [Chorus]


## [Bridge]


## [Chorus]


## [Outro]


---
## 创作笔记
EOF

    output_json "{
      \"status\": \"success\",
      \"action\": \"create\",
      \"project_name\": \"$PROJECT_NAME\",
      \"lyrics_file\": \"$LYRICS_FILE\",
      \"mode\": \"$MODE\",
      \"spec\": $spec_content,
      \"theme\": \"$(escape_json "$theme_content")\",
      \"structure\": $structure_content,
      \"message\": \"已创建歌词模板，AI 应根据模式引导创作\",
      \"mode_guide\": {
        \"coach\": \"逐段引导用户思考和创作，提问式激发，检查韵脚和意象\",
        \"express\": \"AI 直接生成完整歌词，基于规格、主题、结构快速输出\",
        \"hybrid\": \"AI 生成框架和关键句，标注 [待填充] 部分让用户填写\"
      }
    }"
fi

