# 歌词创作 - 交互式模式选择

. "$PSScriptRoot\common.ps1"

$projectDir = Get-CurrentProject
$projectName = Get-ProjectName

$specFile = Test-SpecExists
$themeFile = Test-ThemeExists
$structureFile = Test-StructureExists
$lyricsFile = Join-Path $projectDir "lyrics.md"

# 模式配置文件
$modeConfig = Join-Path $projectDir ".musicify\lyrics_mode"
Ensure-Directory -Path (Join-Path $projectDir ".musicify")

# 检查是否已有模式配置
if (Test-Path $modeConfig) {
    $mode = (Get-Content $modeConfig -Raw).Trim()
} else {
    $mode = ""  # 未配置,需要询问用户
}

# 解析参数 (可选快捷方式,向后兼容)
for ($i = 0; $i -lt $args.Length; $i++) {
    if ($args[$i] -eq "--mode" -and $i+1 -lt $args.Length) {
        $mode = $args[$i+1]
        # 保存用户选择的模式
        Set-Content -Path $modeConfig -Value $mode
    }
}

$specContent = Get-Content $specFile | ConvertFrom-Json
$themeContent = Get-Content $themeFile -Raw
$structureContent = Get-Content $structureFile | ConvertFrom-Json

# 如果没有配置模式,输出询问信息
if ([string]::IsNullOrWhiteSpace($mode)) {
    $result = @{
        status = "need_mode_selection"
        project_name = $projectName
        spec = $specContent
        theme = (ConvertTo-JsonString -InputString $themeContent)
        structure = $structureContent
        message = "AI 应询问用户选择创作模式"
        mode_options = @(
            "1. 教练模式 (Coach) - AI 逐段引导你思考,提问式激发,100% 原创",
            "2. 快速模式 (Express) - AI 直接生成完整歌词,快速迭代",
            "3. 混合模式 (Hybrid) - AI 生成框架和关键句,你填充细节"
        )
        mode_config_file = $modeConfig
    }
    Write-Output ($result | ConvertTo-Json -Depth 10 -Compress)
    exit 0
}

if (Test-Path $lyricsFile) {
    $existingLyrics = Get-Content $lyricsFile -Raw
    $wordCount = Get-LyricsWordCount -FilePath $lyricsFile

    $result = @{
        status = "success"
        action = "review"
        project_name = $projectName
        lyrics_file = $lyricsFile
        mode = $mode
        mode_config = $modeConfig
        spec = $specContent
        theme = (ConvertTo-JsonString -InputString $themeContent)
        structure = $structureContent
        existing_lyrics = (ConvertTo-JsonString -InputString $existingLyrics)
        word_count = $wordCount
        message = "发现已有歌词，AI 可引导用户审查或修改"
    }
    Write-Output ($result | ConvertTo-Json -Depth 10 -Compress)
} else {
    $template = @"
# 歌词

## 歌曲信息
- 创作模式: $mode
- 创建时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

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
"@

    Set-Content -Path $lyricsFile -Value $template

    $modeGuide = @{
        coach = "逐段引导用户思考和创作，提问式激发，检查韵脚和意象"
        express = "AI 直接生成完整歌词，基于规格、主题、结构快速输出"
        hybrid = "AI 生成框架和关键句，标注 [待填充] 部分让用户填写"
    }

    $result = @{
        status = "success"
        action = "create"
        project_name = $projectName
        lyrics_file = $lyricsFile
        mode = $mode
        spec = $specContent
        theme = (ConvertTo-JsonString -InputString $themeContent)
        structure = $structureContent
        message = "已创建歌词模板，AI 应根据模式引导创作"
        mode_guide = $modeGuide
    }
    Write-Output ($result | ConvertTo-Json -Depth 10 -Compress)
}
