import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r"d:\myfolder\動画生成\台本作成\マルチタスク\script.md", encoding="utf-8") as f:
    text = f.read()

lines = text.split("\n")

total_chars = 0
line_count = 0
long_lines = []
short_streak = 0
short_streak_issues = []

for i, line in enumerate(lines, 1):
    stripped = line.strip()
    if stripped.startswith("ずんだもん：") or stripped.startswith("めたん："):
        colon_pos = stripped.index("：")
        speaker = stripped[:colon_pos]
        dialogue = stripped[colon_pos+1:]
        char_count = len(dialogue)
        total_chars += char_count
        line_count += 1
        
        if char_count > 60:
            long_lines.append((i, char_count, stripped))
        
        if char_count < 15:
            short_streak += 1
            if short_streak >= 3:
                short_streak_issues.append((i, char_count, stripped))
        else:
            short_streak = 0

print(f"セリフ総文字数: {total_chars}")
print(f"セリフ行数: {line_count}")
print(f"推定尺: 約{total_chars / 330:.1f}分")
print()

if long_lines:
    print(f"[NG] 60文字超えのセリフ: {len(long_lines)}件")
    for ln, cnt, text_l in long_lines:
        print(f"  行{ln}: {cnt}文字 -> {text_l}")
else:
    print("[OK] 60文字超えのセリフ: なし")

print()
if short_streak_issues:
    print(f"[NG] 15文字未満が3つ以上連続: {len(short_streak_issues)}件")
    for ln, cnt, text_s in short_streak_issues:
        print(f"  行{ln}: {cnt}文字 -> {text_s}")
else:
    print("[OK] 15文字未満が3つ以上連続: なし")

scenes = re.findall(r'<!-- SCENE:', text)
print(f"\nシーン遷移マーカー数: {len(scenes)}")

blocks = re.split(r'## 【Block', text)
print(f"\nブロック数: {len(blocks) - 1}")

for idx, block in enumerate(blocks[1:], 1):
    block_scenes = len(re.findall(r'<!-- SCENE:', block))
    block_lines_list = []
    for bline in block.split("\n"):
        stripped = bline.strip()
        if stripped.startswith("ずんだもん：") or stripped.startswith("めたん："):
            colon_pos = stripped.index("：")
            dialogue = stripped[colon_pos+1:]
            block_lines_list.append(len(dialogue))
    block_chars = sum(block_lines_list)
    print(f"  Block {idx}: {block_scenes}シーン, {len(block_lines_list)}セリフ, {block_chars}文字")
