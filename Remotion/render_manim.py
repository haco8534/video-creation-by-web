"""
render_manim.py — Manim → public/animations/ レンダリング補助スクリプト

Usage:
  python render_manim.py <project_id> <SceneName>

例:
  python render_manim.py component_showcase SineWaveDemo

  → src/projects/component_showcase/animation.py の SineWaveDemo シーンをレンダリングし
    public/animations/component_showcase/SineWaveDemo.mp4 へコピーする。
"""

import subprocess
import sys
import os
import shutil

def main():
    if len(sys.argv) < 3:
        print("Usage: python render_manim.py <project_id> <SceneName>")
        sys.exit(1)

    project_id = sys.argv[1]
    scene_name = sys.argv[2]
    quality = sys.argv[3] if len(sys.argv) > 3 else "m"  # l/m/h/p/k

    script_path = os.path.join("src", "projects", project_id, "animation.py")
    if not os.path.exists(script_path):
        print(f"❌ Error: {script_path} が見つかりません。")
        sys.exit(1)

    out_dir = os.path.join("public", "animations", project_id)
    os.makedirs(out_dir, exist_ok=True)

    print(f"🎬 Rendering: {scene_name} from {script_path} ...")
    print(f"   Quality: -{quality}  →  {out_dir}/{scene_name}.mp4")

    # Manim コマンド実行
    cmd = [
        "manim",
        f"-q{quality}",
        script_path,
        scene_name,
        "--output_file", scene_name,
    ]

    result = subprocess.run(cmd, capture_output=False, text=True)

    if result.returncode != 0:
        print(f"\n❌ Manim rendering failed. (exit code {result.returncode})")
        sys.exit(1)

    # Manimのデフォルト出力先を探してコピー
    # Manimは media/videos/<script_stem>/<resolution>/<scene>.mp4 に出力する
    script_stem = os.path.splitext(os.path.basename(script_path))[0]

    quality_dir_map = {
        "l": "480p15",
        "m": "720p30",
        "h": "1080p60",
        "p": "1440p60",
        "k": "2160p60",
    }
    res_dir = quality_dir_map.get(quality, "720p30")

    # 探索パス
    candidates = [
        os.path.join("media", "videos", script_stem, res_dir, f"{scene_name}.mp4"),
        os.path.join("media", "videos", f"{script_stem}", res_dir, f"{scene_name}.mp4"),
    ]

    src_mp4 = None
    for c in candidates:
        if os.path.exists(c):
            src_mp4 = c
            break

    if src_mp4 is None:
        # フォールバック: 再帰的に探す
        for root, dirs, files in os.walk("media"):
            for f in files:
                if f == f"{scene_name}.mp4":
                    src_mp4 = os.path.join(root, f)
                    break
            if src_mp4:
                break

    if src_mp4 is None:
        print(f"\n❌ レンダリング後の MP4 が見つかりませんでした。")
        print(f"   media/ 以下を手動で確認してください。")
        sys.exit(1)

    dest_mp4 = os.path.join(out_dir, f"{scene_name}.mp4")
    shutil.copy2(src_mp4, dest_mp4)

    print(f"\n✅ Done!")
    print(f"   出力先: {dest_mp4}")
    print(f"\n--- Remotion での使い方 ---")
    print(f"import {{ staticFile }} from 'remotion';")
    print(f"// ...")
    print(f'<AnimationEmbed')
    print(f"  src={{staticFile('animations/{project_id}/{scene_name}.mp4')}}")
    print(f"  startFrame={{<このシーンが始まる絶対フレーム数>}}")
    print(f"  width={{900}}")
    print(f"  height={{500}}")
    print(f"/>")

if __name__ == "__main__":
    main()
