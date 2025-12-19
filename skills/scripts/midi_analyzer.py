#!/usr/bin/env python3
"""
MIDI 音乐分析器 - 专业级旋律风格分析
从"太简单"的文件检查升级为专业 MIDI 分析和特征提取

支持功能：
- 智能人声音轨识别
- 深度旋律特征分析（节奏型、音程、调式）
- 音乐理论分析（五声音阶、调式推断）
- AI 风格学习准备
"""

import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import traceback

# 检查并导入依赖
try:
    import mido
    import music21
    import numpy as np
except ImportError as e:
    print(json.dumps({
        "status": "error",
        "error_type": "missing_dependency",
        "message": f"缺少必需的 Python 库: {str(e)}",
        "solution": "请安装依赖: pip install mido music21 numpy",
        "dependencies": {
            "mido": "MIDI 文件解析",
            "music21": "音乐理论分析",
            "numpy": "数值计算"
        }
    }, ensure_ascii=False, indent=2))
    sys.exit(1)

@dataclass
class VocalTrackCandidate:
    """人声音轨候选"""
    track_index: int
    track_name: str
    note_count: int
    note_range: Tuple[int, int]  # (min_pitch, max_pitch)
    confidence_score: float
    reasons: List[str]

@dataclass
class MelodyFeatures:
    """旋律特征分析结果"""
    # 基本信息
    total_notes: int
    note_range: Tuple[int, int]
    duration_beats: float

    # 节奏特征
    rhythm_complexity: float
    rhythm_patterns: Dict[str, float]  # 节奏型分布
    syncopation_level: float

    # 音程特征
    interval_distribution: Dict[str, float]
    stepwise_ratio: float
    leap_ratio: float

    # 调式特征
    key_signature: str
    mode_analysis: Dict[str, float]
    scale_notes: List[str]

    # 旋律轮廓
    contour_vector: List[int]
    phrase_structure: List[Tuple[int, int]]

class ProfessionalMidiAnalyzer:
    """专业级 MIDI 分析器"""

    def __init__(self):
        # 人声音域范围 (MIDI note numbers)
        self.vocal_range = (48, 84)  # C3 to C6

        # 五声音阶映射
        self.pentatonic_scales = {
            'C': [0, 2, 4, 7, 9],   # C D E G A
            'G': [7, 9, 11, 2, 4], # G A B D E
            'D': [2, 4, 6, 9, 11], # D E F# A B
            'A': [9, 11, 1, 4, 6], # A B C# E F#
            'E': [4, 6, 8, 11, 1], # E F# G# B C#
            'B': [11, 1, 3, 6, 8], # B C# D# F# G#
            'F#': [6, 8, 10, 1, 3], # F# G# A# C# D#
            'Db': [1, 3, 5, 8, 10], # Db Eb F Ab Bb
            'Ab': [8, 10, 0, 3, 5], # Ab Bb C Eb F
            'Eb': [3, 5, 7, 10, 0], # Eb F G Bb C
            'Bb': [10, 0, 2, 5, 7], # Bb C D F G
            'F': [5, 7, 9, 0, 2]    # F G A C D
        }

        # 节奏模式识别
        self.rhythm_patterns = {
            'quarter': 480,      # 四分音符
            'eighth': 240,       # 八分音符
            'dotted_quarter': 720, # 附点四分音符
            'sixteenth': 120,    # 十六分音符
            'triplet': 160       # 三连音
        }

    def analyze_midi_file(self, midi_path: str, lyrics_path: Optional[str] = None) -> Dict[str, Any]:
        """分析 MIDI 文件的主入口"""
        try:
            # 基本文件检查
            if not Path(midi_path).exists():
                raise FileNotFoundError(f"MIDI 文件不存在: {midi_path}")

            # 加载 MIDI 文件
            midi_file = mido.MidiFile(midi_path)

            # 分析歌词信息
            lyrics_info = self._analyze_lyrics(lyrics_path) if lyrics_path else None

            # 识别人声音轨
            vocal_candidates = self._identify_vocal_tracks(midi_file, lyrics_info)

            if not vocal_candidates:
                return self._create_error_result("no_vocal_track", "未找到合适的人声音轨")

            # 选择最佳人声音轨
            best_vocal = max(vocal_candidates, key=lambda x: x.confidence_score)

            # 提取音轨的音符数据
            notes = self._extract_notes_from_track(midi_file, best_vocal.track_index)

            if not notes:
                return self._create_error_result("no_notes", "人声音轨中未找到音符数据")

            # 深度旋律特征分析
            melody_features = self._extract_melody_features(notes, midi_file)

            # 生成创作模式推荐
            mode_recommendation = self.recommend_creation_mode(melody_features, lyrics_info)

            # 构建分析结果
            result = {
                "status": "success",
                "analysis_type": "professional",
                "file_info": {
                    "midi_path": midi_path,
                    "lyrics_path": lyrics_path,
                    "file_size": Path(midi_path).stat().st_size,
                    "track_count": len(midi_file.tracks)
                },
                "vocal_track_analysis": {
                    "selected_track": asdict(best_vocal),
                    "all_candidates": [asdict(c) for c in vocal_candidates],
                    "selection_confidence": best_vocal.confidence_score
                },
                "melody_features": asdict(melody_features),
                "lyrics_analysis": lyrics_info,
                "mode_recommendation": mode_recommendation,  # NEW: 模式推荐信息
                "technical_info": {
                    "ticks_per_beat": midi_file.ticks_per_beat,
                    "total_time": sum(msg.time for track in midi_file.tracks for msg in track),
                    "format_type": midi_file.type
                }
            }

            return result

        except Exception as e:
            return self._create_error_result(
                "analysis_error",
                f"分析过程中发生错误: {str(e)}",
                {"traceback": traceback.format_exc()}
            )

    def _analyze_lyrics(self, lyrics_path: str) -> Optional[Dict[str, Any]]:
        """分析歌词文件"""
        try:
            with open(lyrics_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 统计字数（排除标点符号）
            clean_text = ''.join(char for char in content if char.isalpha())

            # 检测段落结构
            sections = []
            current_section = None

            for line in content.split('\n'):
                line = line.strip()
                if line.startswith('[') and line.endswith(']'):
                    if current_section:
                        sections.append(current_section)
                    current_section = {
                        "name": line[1:-1],
                        "lines": [],
                        "char_count": 0
                    }
                elif line and current_section:
                    current_section["lines"].append(line)
                    current_section["char_count"] += len([c for c in line if c.isalpha()])

            if current_section:
                sections.append(current_section)

            return {
                "total_chars": len(clean_text),
                "total_lines": len([line for line in content.split('\n') if line.strip() and not line.strip().startswith('[')]),
                "sections": sections,
                "has_structure_markers": any(line.startswith('[') for line in content.split('\n'))
            }

        except Exception as e:
            return {"error": f"歌词分析失败: {str(e)}"}

    def _identify_vocal_tracks(self, midi_file: mido.MidiFile, lyrics_info: Optional[Dict]) -> List[VocalTrackCandidate]:
        """智能识别人声音轨"""
        candidates = []

        for track_idx, track in enumerate(midi_file.tracks):
            notes = self._extract_notes_from_track(midi_file, track_idx)

            if not notes:
                continue

            # 计算基本信息
            pitches = [note['pitch'] for note in notes]
            min_pitch, max_pitch = min(pitches), max(pitches)
            note_count = len(notes)

            # 评分系统
            score = 0.0
            reasons = []

            # 1. 音轨名称匹配（30分）
            track_name = getattr(track, 'name', f'Track {track_idx}')
            vocal_keywords = ['vocal', 'voice', 'melody', 'lead', '主旋律', '人声']
            if any(keyword.lower() in track_name.lower() for keyword in vocal_keywords):
                score += 30
                reasons.append(f"音轨名包含人声关键词: {track_name}")

            # 2. 音域匹配（25分）
            vocal_range_overlap = self._calculate_range_overlap(
                (min_pitch, max_pitch), self.vocal_range
            )
            if vocal_range_overlap > 0.7:
                score += 25
                reasons.append(f"音域高度匹配人声范围: {vocal_range_overlap:.1%}")
            elif vocal_range_overlap > 0.5:
                score += 15
                reasons.append(f"音域部分匹配人声范围: {vocal_range_overlap:.1%}")

            # 3. 歌词字数匹配（20分）
            if lyrics_info and 'total_chars' in lyrics_info:
                lyrics_chars = lyrics_info['total_chars']
                if lyrics_chars > 0:
                    ratio = abs(1 - note_count / lyrics_chars)
                    if ratio < 0.1:  # 10%内匹配
                        score += 20
                        reasons.append(f"音符数与歌词字数高度匹配: {note_count}≈{lyrics_chars}")
                    elif ratio < 0.3:  # 30%内匹配
                        score += 10
                        reasons.append(f"音符数与歌词字数基本匹配: {note_count}vs{lyrics_chars}")

            # 4. 音符密度合理性（15分）
            if 20 <= note_count <= 200:  # 合理的旋律长度
                score += 15
                reasons.append(f"音符数量合理: {note_count}")
            elif note_count > 10:
                score += 5
                reasons.append(f"音符数量可接受: {note_count}")

            # 5. 旋律特征（10分）
            interval_variety = self._calculate_interval_variety(notes)
            if interval_variety > 0.3:  # 有合理的音程变化
                score += 10
                reasons.append(f"音程变化丰富: {interval_variety:.2f}")

            candidates.append(VocalTrackCandidate(
                track_index=track_idx,
                track_name=track_name,
                note_count=note_count,
                note_range=(min_pitch, max_pitch),
                confidence_score=score,
                reasons=reasons
            ))

        # 按置信度排序
        return sorted(candidates, key=lambda x: x.confidence_score, reverse=True)

    def _extract_notes_from_track(self, midi_file: mido.MidiFile, track_idx: int) -> List[Dict]:
        """从指定音轨提取音符信息"""
        track = midi_file.tracks[track_idx]
        notes = []
        current_time = 0
        active_notes = {}  # pitch -> start_time

        for msg in track:
            current_time += msg.time

            if msg.type == 'note_on' and msg.velocity > 0:
                active_notes[msg.note] = current_time
            elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                if msg.note in active_notes:
                    start_time = active_notes.pop(msg.note)
                    duration = current_time - start_time

                    notes.append({
                        'pitch': msg.note,
                        'start_time': start_time,
                        'duration': duration,
                        'velocity': getattr(msg, 'velocity', 64)
                    })

        # 按开始时间排序
        return sorted(notes, key=lambda x: x['start_time'])

    def _extract_melody_features(self, notes: List[Dict], midi_file: mido.MidiFile) -> MelodyFeatures:
        """深度旋律特征提取"""
        ticks_per_beat = midi_file.ticks_per_beat

        # 基本信息
        pitches = [note['pitch'] for note in notes]
        durations = [note['duration'] for note in notes]

        # 节奏分析
        rhythm_analysis = self._analyze_rhythm_patterns(durations, ticks_per_beat)

        # 音程分析
        interval_analysis = self._analyze_intervals(pitches)

        # 调式分析
        key_analysis = self._analyze_key_and_mode(pitches)

        # 旋律轮廓
        contour = self._extract_melody_contour(pitches)

        # 乐句结构
        phrases = self._identify_phrases(notes, ticks_per_beat)

        return MelodyFeatures(
            total_notes=len(notes),
            note_range=(min(pitches), max(pitches)),
            duration_beats=sum(durations) / ticks_per_beat,
            rhythm_complexity=rhythm_analysis['complexity'],
            rhythm_patterns=rhythm_analysis['patterns'],
            syncopation_level=rhythm_analysis['syncopation'],
            interval_distribution=interval_analysis['distribution'],
            stepwise_ratio=interval_analysis['stepwise_ratio'],
            leap_ratio=interval_analysis['leap_ratio'],
            key_signature=key_analysis['key'],
            mode_analysis=key_analysis['modes'],
            scale_notes=key_analysis['scale_notes'],
            contour_vector=contour,
            phrase_structure=phrases
        )

    def _analyze_rhythm_patterns(self, durations: List[int], ticks_per_beat: int) -> Dict[str, Any]:
        """分析节奏型模式"""
        if not durations:
            return {'complexity': 0, 'patterns': {}, 'syncopation': 0}

        # 标准化时值到节拍单位
        beat_durations = [d / ticks_per_beat for d in durations]

        # 计算节奏模式分布
        patterns = {
            'whole': 0,      # 全音符
            'half': 0,       # 二分音符
            'quarter': 0,    # 四分音符
            'eighth': 0,     # 八分音符
            'sixteenth': 0,  # 十六分音符
            'dotted': 0,     # 附点节奏
            'triplet': 0     # 三连音
        }

        for duration in beat_durations:
            if abs(duration - 4.0) < 0.1:
                patterns['whole'] += 1
            elif abs(duration - 2.0) < 0.1:
                patterns['half'] += 1
            elif abs(duration - 1.0) < 0.1:
                patterns['quarter'] += 1
            elif abs(duration - 0.5) < 0.1:
                patterns['eighth'] += 1
            elif abs(duration - 0.25) < 0.1:
                patterns['sixteenth'] += 1
            elif abs(duration - 1.5) < 0.1:
                patterns['dotted'] += 1
            elif abs(duration - 0.33) < 0.1:
                patterns['triplet'] += 1

        total = len(durations)
        pattern_ratios = {k: v/total for k, v in patterns.items()} if total > 0 else patterns

        # 计算节奏复杂度
        complexity = len([v for v in pattern_ratios.values() if v > 0.05])  # 超过5%的模式

        # 简单的切分检测
        syncopation = sum(1 for d in beat_durations if 0.3 < d < 0.7 or 1.3 < d < 1.7) / total if total > 0 else 0

        return {
            'complexity': complexity,
            'patterns': pattern_ratios,
            'syncopation': syncopation
        }

    def _analyze_intervals(self, pitches: List[int]) -> Dict[str, Any]:
        """分析音程分布"""
        if len(pitches) < 2:
            return {'distribution': {}, 'stepwise_ratio': 0, 'leap_ratio': 0}

        intervals = [pitches[i+1] - pitches[i] for i in range(len(pitches)-1)]

        # 音程分类
        interval_types = {
            'unison': 0,      # 同度 (0)
            'step': 0,        # 级进 (1-2)
            'small_leap': 0,  # 小跳 (3-4)
            'large_leap': 0,  # 大跳 (5+)
            'octave': 0       # 八度 (12)
        }

        for interval in intervals:
            abs_interval = abs(interval)
            if abs_interval == 0:
                interval_types['unison'] += 1
            elif abs_interval <= 2:
                interval_types['step'] += 1
            elif abs_interval <= 4:
                interval_types['small_leap'] += 1
            elif abs_interval == 12:
                interval_types['octave'] += 1
            else:
                interval_types['large_leap'] += 1

        total = len(intervals)
        distribution = {k: v/total for k, v in interval_types.items()} if total > 0 else interval_types

        return {
            'distribution': distribution,
            'stepwise_ratio': distribution['step'],
            'leap_ratio': distribution['small_leap'] + distribution['large_leap']
        }

    def _analyze_key_and_mode(self, pitches: List[int]) -> Dict[str, Any]:
        """分析调性和调式"""
        if not pitches:
            return {'key': 'Unknown', 'modes': {}, 'scale_notes': []}

        # 统计音高类别
        pitch_classes = [p % 12 for p in pitches]
        pc_counts = {}
        for pc in pitch_classes:
            pc_counts[pc] = pc_counts.get(pc, 0) + 1

        # 尝试匹配五声音阶
        best_key = 'C'
        best_score = 0

        for key, scale in self.pentatonic_scales.items():
            score = sum(pc_counts.get(pc, 0) for pc in scale)
            if score > best_score:
                best_score = score
                best_key = key

        # 生成调式信息
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        scale_notes = [note_names[pc] for pc in self.pentatonic_scales[best_key]]

        # 简化的调式检测
        modes = {
            'pentatonic': best_score / len(pitches) if pitches else 0,
            'major': 0.5,  # 占位符
            'minor': 0.3   # 占位符
        }

        return {
            'key': best_key,
            'modes': modes,
            'scale_notes': scale_notes
        }

    def _extract_melody_contour(self, pitches: List[int]) -> List[int]:
        """提取旋律轮廓"""
        if len(pitches) < 2:
            return []

        contour = []
        for i in range(1, len(pitches)):
            diff = pitches[i] - pitches[i-1]
            if diff > 0:
                contour.append(1)   # 上行
            elif diff < 0:
                contour.append(-1)  # 下行
            else:
                contour.append(0)   # 平行

        return contour

    def _identify_phrases(self, notes: List[Dict], ticks_per_beat: int) -> List[Tuple[int, int]]:
        """识别乐句结构"""
        if not notes:
            return []

        # 简单的乐句分割：基于较长的休止或时间间隔
        phrases = []
        phrase_start = 0

        for i in range(1, len(notes)):
            # 检测乐句间隔（如果两个音符间隔超过一拍）
            gap = notes[i]['start_time'] - (notes[i-1]['start_time'] + notes[i-1]['duration'])
            if gap > ticks_per_beat:  # 超过一拍的间隔
                phrases.append((phrase_start, i-1))
                phrase_start = i

        # 添加最后一个乐句
        phrases.append((phrase_start, len(notes)-1))

        return phrases

    def _calculate_range_overlap(self, range1: Tuple[int, int], range2: Tuple[int, int]) -> float:
        """计算两个音域的重叠度"""
        overlap_start = max(range1[0], range2[0])
        overlap_end = min(range1[1], range2[1])

        if overlap_start >= overlap_end:
            return 0.0

        overlap_size = overlap_end - overlap_start
        range1_size = range1[1] - range1[0]

        return overlap_size / range1_size if range1_size > 0 else 0.0

    def _calculate_interval_variety(self, notes: List[Dict]) -> float:
        """计算音程变化丰富度"""
        if len(notes) < 2:
            return 0.0

        pitches = [note['pitch'] for note in notes]
        intervals = [abs(pitches[i+1] - pitches[i]) for i in range(len(pitches)-1)]
        unique_intervals = len(set(intervals))

        return unique_intervals / len(intervals) if intervals else 0.0

    def calculate_complexity(self, melody_features: MelodyFeatures, lyrics_info: Dict = None) -> float:
        """计算旋律复杂度（0-100分）"""
        try:
            # 节奏复杂度 (0-40分)
            rhythm_score = 0
            if hasattr(melody_features, 'rhythm_patterns'):
                syncopation = melody_features.rhythm_patterns.get('syncopation', 0)
                sixteenth = melody_features.rhythm_patterns.get('sixteenth', 0)
                rhythm_score = min(40, (syncopation + sixteenth) * 0.4)

            # 音程复杂度 (0-30分)
            interval_score = 0
            if hasattr(melody_features, 'interval_distribution'):
                large_leap = melody_features.interval_distribution.get('large_leap', 0)
                interval_score = min(30, large_leap * 0.3)

            # 调式不确定性 (0-30分)
            modal_score = 0
            if hasattr(melody_features, 'mode_analysis'):
                # 如果调式分析有置信度信息
                max_confidence = max(melody_features.mode_analysis.values()) if melody_features.mode_analysis else 0
                modal_uncertainty = 1 - max_confidence
                modal_score = modal_uncertainty * 30

            total_complexity = rhythm_score + interval_score + modal_score
            return min(100, total_complexity)

        except Exception:
            return 30.0  # 默认中等复杂度

    def recommend_creation_mode(self, melody_features: MelodyFeatures, lyrics_info: Dict = None) -> Dict[str, Any]:
        """基于旋律特征推荐创作模式"""
        try:
            # 计算整体复杂度
            complexity = self.calculate_complexity(melody_features, lyrics_info)

            # 段落数量（从歌词信息获取）
            section_count = 0
            if lyrics_info and 'structure' in lyrics_info:
                sections = lyrics_info['structure'].get('sections', [])
                section_count = len(sections)

            # 推荐逻辑
            if complexity >= 60:
                recommended = "expert"
                reason = f"旋律复杂度高 ({complexity:.1f}/100)，建议使用专家模式进行精细控制"
            elif complexity <= 25:
                recommended = "express"
                reason = f"旋律相对简单 ({complexity:.1f}/100)，适合快速模式自动生成"
            elif section_count >= 4:
                recommended = "coach"
                reason = f"歌曲结构复杂 ({section_count}个段落)，建议教练模式逐步创作"
            else:
                recommended = "professional"
                reason = f"旋律复杂度适中 ({complexity:.1f}/100)，推荐专业模式平衡效率与质量"

            # 备选方案
            alternatives = []
            if recommended != "express":
                alternatives.append({"mode": "express", "reason": "需要快速原型或demo时使用"})
            if recommended != "professional":
                alternatives.append({"mode": "professional", "reason": "平衡创作质量与效率的通用选择"})
            if recommended != "coach":
                alternatives.append({"mode": "coach", "reason": "学习创作技巧或深度个性化表达时使用"})
            if recommended != "expert":
                alternatives.append({"mode": "expert", "reason": "需要完全控制创作过程的专业制作"})

            return {
                "recommended": recommended,
                "complexity_score": complexity,
                "reasoning": reason,
                "section_count": section_count,
                "alternatives": alternatives
            }

        except Exception as e:
            # 错误时返回默认推荐
            return {
                "recommended": "professional",
                "complexity_score": 50.0,
                "reasoning": "分析过程中出现问题，推荐使用通用的专业模式",
                "section_count": 0,
                "alternatives": [],
                "error": f"推荐逻辑错误: {str(e)}"
            }

    def _create_error_result(self, error_type: str, message: str, details: Dict = None) -> Dict[str, Any]:
        """创建错误结果"""
        result = {
            "status": "error",
            "error_type": error_type,
            "message": message,
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }

        if details:
            result["details"] = details

        return result

def main():
    """命令行入口"""
    parser = argparse.ArgumentParser(description="专业级 MIDI 音乐分析器")
    parser.add_argument("midi_file", help="MIDI 文件路径")
    parser.add_argument("--lyrics", help="歌词文件路径（可选）")
    parser.add_argument("--output", help="输出 JSON 文件路径（可选）")
    parser.add_argument("--pretty", action="store_true", help="格式化 JSON 输出")

    args = parser.parse_args()

    # 创建分析器
    analyzer = ProfessionalMidiAnalyzer()

    # 执行分析
    result = analyzer.analyze_midi_file(args.midi_file, args.lyrics)

    # 输出结果
    if args.pretty:
        output = json.dumps(result, ensure_ascii=False, indent=2)
    else:
        output = json.dumps(result, ensure_ascii=False)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"分析结果已保存到: {args.output}")
    else:
        print(output)

if __name__ == "__main__":
    main()