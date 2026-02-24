"""
src/projects/component_showcase/animation.py

Remotion × Manim 統合の検証用シーン
シンプルな正弦波グラフのアニメーション

レンダリング方法:
  python render_manim.py component_showcase SineWaveDemo
"""
from manim import *
import numpy as np


class SineWaveDemo(Scene):
    """
    正弦波のグラフが左から右へ描かれるアニメーション。
    Remotionのメインコンテンツ内に埋め込んで動作を検証する。
    """
    def construct(self):
        self.camera.background_color = "#f8fafc"

        # 軸
        axes = Axes(
            x_range=[-0.5, 4 * PI + 0.5, PI],
            y_range=[-1.5, 1.5, 0.5],
            x_length=11,
            y_length=5,
            axis_config={"color": "#475569", "stroke_width": 2},
            tips=True,
        ).move_to(ORIGIN)

        x_label = axes.get_x_axis_label(
            MathTex("x", color="#475569"),
            direction=RIGHT + DOWN * 0.3
        )
        y_label = axes.get_y_axis_label(
            MathTex("y", color="#475569"),
            direction=UP
        )

        # タイトル
        title = Text(
            "f(x) = sin(x)",
            font="Consolas",
            font_size=36,
            color="#1e293b",
        ).to_edge(UP, buff=0.3)

        self.play(Write(title), run_time=0.5)
        self.play(Create(axes), FadeIn(x_label), FadeIn(y_label), run_time=1)

        # 正弦波グラフ（青）
        sine_curve = axes.plot(
            lambda x: np.sin(x),
            x_range=[0, 4 * PI],
            color="#3b82f6",
            stroke_width=4,
        )

        # 正弦波を左から右へ描く
        self.play(
            Create(sine_curve),
            run_time=2.5,
            rate_func=linear,
        )

        # 特徴点をハイライト
        peak_dot = Dot(axes.c2p(PI / 2, 1), color="#ef4444", radius=0.12)
        trough_dot = Dot(axes.c2p(3 * PI / 2, -1), color="#8b5cf6", radius=0.12)
        zero_dot = Dot(axes.c2p(PI, 0), color="#10b981", radius=0.12)

        peak_label = Text("Max: +1", font_size=30, color="#ef4444").next_to(peak_dot, UP * 1.5)
        trough_label = Text("Min: -1", font_size=30, color="#8b5cf6").next_to(trough_dot, DOWN * 1.5)

        self.play(
            FadeIn(peak_dot), Write(peak_label),
            FadeIn(trough_dot), Write(trough_label),
            FadeIn(zero_dot),
            run_time=1.0
        )

        # 周期を示す両矢印
        period_arrow = DoubleArrow(
            axes.c2p(0, -1.3),
            axes.c2p(2 * PI, -1.3),
            color="#f59e0b",
            stroke_width=3,
            tip_length=0.15,
        )
        period_label = MathTex(r"T = 2\pi", font_size=32, color="#f59e0b").next_to(period_arrow, DOWN, buff=0.1)

        self.play(Create(period_arrow), Write(period_label), run_time=0.8)
        self.wait(1.5)

        # 終了フェードアウト
        self.play(*[FadeOut(mob) for mob in self.mobjects], run_time=0.8)
