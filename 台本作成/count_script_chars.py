import re
import sys

filepath = sys.argv[1]
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

total_chars = 0
line_count = 0
scene_count = 0

for line in lines:
    stripped = line.strip()
    m = re.match(r'^(ずんだもん|めたん)：(.+)$', stripped)
    if m:
        text = m.group(2)
        total_chars += len(text)
        line_count += 1
    if '<!-- SCENE:' in stripped:
        scene_count += 1

print(f"セリフ行数: {line_count}")
print(f"セリフ総文字数: {total_chars}")
print(f"シーン遷移マーカー数: {scene_count}")
