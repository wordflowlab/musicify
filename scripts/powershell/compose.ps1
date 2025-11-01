# 作曲辅助 - 生成和弦进行、旋律提示和五线谱

. "$PSScriptRoot\common.ps1"

$projectDir = Get-CurrentProject
$projectName = Get-ProjectName

$specFile = Test-SpecExists
$lyricsFile = Join-Path $projectDir "lyrics.md"

if (-not (Test-Path $lyricsFile)) {
    $error = @{
        status = "error"
        message = "未找到 lyrics.md。请先创作歌词。"
    }
    Write-Output ($error | ConvertTo-Json -Compress)
    exit 1
}

$specContent = Get-Content $specFile | ConvertFrom-Json
$lyricsContent = Get-Content $lyricsFile -Raw

# 读取可选文件
$structureFile = Join-Path $projectDir "structure.json"
if (Test-Path $structureFile) {
    $structureContent = Get-Content $structureFile | ConvertFrom-Json
} else {
    $structureContent = @{}
}

$moodFile = Join-Path $projectDir "mood.json"
if (Test-Path $moodFile) {
    $moodContent = Get-Content $moodFile | ConvertFrom-Json
} else {
    $moodContent = @{}
}

$themeFile = Join-Path $projectDir "theme.md"
$themeContent = ""
if (Test-Path $themeFile) {
    $themeContent = ConvertTo-JsonString -InputString (Get-Content $themeFile -Raw)
}

$result = @{
    status = "success"
    project_name = $projectName
    spec = $specContent
    structure = $structureContent
    mood = $moodContent
    theme = $themeContent
    lyrics_content = (ConvertTo-JsonString -InputString $lyricsContent)
    message = "AI 应根据歌曲信息生成完整的作曲辅助内容"
    output_files = @{
        composition_yaml = (Join-Path $projectDir "composition.yaml")
        notation_abc = (Join-Path $projectDir "notation.abc")
    }
    required_content = @(
        "chord_progression (和弦进行)",
        "melody_hints (旋律提示)",
        "abc_notation (五线谱)",
        "instrumentation (乐器配置)",
        "reference_songs (参考歌曲)"
    )
}

Write-Output ($result | ConvertTo-Json -Depth 10 -Compress)
