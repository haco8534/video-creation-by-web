"""
src/projects/data_basics/animation.py

データ基礎解説動画 用 Manimシーン
正規分布のヒストグラムがアニメーションで描かれる

レンダリング:
  python render_manim.py data_basics HistogramScene
"""
from manim import *
import numpy as np


class HistogramScene(Scene):
    """
    正規分布に従うサンプルデータのヒストグラムをアニメーションで描く。
    平均値・中央値の位置も矢印でハイライトする。
    """
    def construct(self):
        self.camera.background_color = "#f8fafc"

        # ランダムシードを固定して再現性を確保
        np.random.seed(42)
        data = np.random.normal(loc=50, scale=10, size=500)

        # ---- 軸 ----
        axes = Axes(
            x_range=[10, 90, 10],
            y_range=[0, 120, 20],
            x_length=11,
            y_length=5.5,
            axis_config={"color": "#64748b", "stroke_width": 2},
            tips=True,
        ).move_to(ORIGIN + DOWN * 0.3)

        x_label = axes.get_x_axis_label(
            Text("テストの点数", font="Noto Sans JP", font_size=24, color="#64748b"),
            direction=RIGHT + DOWN * 0.5
        )
        y_label = axes.get_y_axis_label(
            Text("人数", font="Noto Sans JP", font_size=24, color="#64748b"),
            direction=UP * 1.1
        )

        title = Text(
            "500人のテストスコアの分布",
            font="Noto Sans JP",
            font_size=34,
            color="#1e293b",
            weight=BOLD,
        ).to_edge(UP, buff=0.25)

        self.play(Write(title), run_time=0.6)
        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label), run_time=0.8)

        # ---- ヒストグラムのバーを手動計算 ----
        bins = np.arange(15, 90, 10)
        counts, edges = np.histogram(data, bins=bins)

        bars = VGroup()
        COLORS = [
            "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6",
            "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
        ]
        for i, (count, left_edge) in enumerate(zip(counts, edges[:-1])):
            bar_width = edges[i + 1] - edges[i]
            bar = Rectangle(
                width=axes.x_axis.unit_size * bar_width * 0.92,
                height=axes.y_axis.unit_size * count,
                fill_color=COLORS[i % len(COLORS)],
                fill_opacity=0.9,
                stroke_color=WHITE,
                stroke_width=1.5,
            )
            bar.move_to(
                axes.c2p(left_edge + bar_width / 2, count / 2)
            )
            bars.add(bar)

        # バーを左から順番に成長させる
        self.play(
            LaggedStart(*[GrowFromEdge(bar, DOWN) for bar in bars], lag_ratio=0.15),
            run_time=2.0,
        )
        self.wait(0.5)

        # ---- 平均値の縦線 ----
        mean_val = float(np.mean(data))
        mean_line = DashedLine(
            start=axes.c2p(mean_val, 0),
            end=axes.c2p(mean_val, 110),
            color="#ef4444",
            stroke_width=3,
            dash_length=0.15,
        )
        mean_label = VGroup(
            Text("平均", font="Noto Sans JP", font_size=22, color="#ef4444", weight=BOLD),
            Text(f"{mean_val:.1f}点", font="Noto Sans JP", font_size=20, color="#ef4444"),
        ).arrange(DOWN, buff=0.05).next_to(axes.c2p(mean_val, 112), UP, buff=0.1)

        self.play(Create(mean_line), FadeIn(mean_label), run_time=0.6)
        self.wait(0.4)

        # ---- 正規分布曲線の重ね書き ----
        std_val = float(np.std(data))

        def normal_pdf(x):
            return (500 * 10 / (std_val * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mean_val) / std_val) ** 2)

        curve = axes.plot(
            normal_pdf,
            x_range=[15, 85],
            color="#f59e0b",
            stroke_width=4,
        )

        self.play(Create(curve), run_time=1.2)

        # ± 1σ 領域をハイライト
        sigma_region = axes.get_area(
            curve,
            x_range=[mean_val - std_val, mean_val + std_val],
            color="#fbbf24",
            opacity=0.25,
        )
        sigma_label = Text(
            "±1σ の範囲に\n約68%が収まる",
            font="Noto Sans JP",
            font_size=20,
            color="#b45309",
        ).next_to(axes.c2p(mean_val + std_val + 2, 70), RIGHT, buff=0.1)

        self.play(FadeIn(sigma_region), Write(sigma_label), run_time=0.8)
        self.wait(2)

        self.wait(5)
