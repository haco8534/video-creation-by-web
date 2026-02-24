"""
【完全理解】APIって結局なに？ — YouTube向け本格解説動画 (前半)
============================================================

台本: projects/api_basics_yt/script.md

Usage:
  manim -qm projects/api_basics_yt/animation.py
"""

from manim import *
import numpy as np
import json
import os
import difflib

config.sound = True

# ============================================================================
# テーマカラー & スタイル
# ============================================================================
BG_COLOR = "#f5f5f5"
TEXT_MAIN = "#1a1a2e"        # メインテキスト（濃紺）
ACCENT_RED = "#d6336c"       # 深めローズ
ACCENT_YELLOW = "#e8590c"    # ディープオレンジ
ACCENT_BLUE = "#1971c2"      # ディープブルー
ACCENT_GREEN = "#099268"     # ディープグリーン
ACCENT_PURPLE = "#7048e8"    # ディープパープル
ACCENT_CYAN = "#0c8599"      # ディープシアン
TEXT_DIM = "#868e96"         # 薄めグレー
CHAR_METAN = "#d6336c"       # めたんの色
CHAR_ZUNDA = "#099268"       # ずんだもんの色

# 音声マップ読み込み
AUDIO_MAP = {}
map_path = "projects/api_basics_yt/media/audio/audio_map.json"
if os.path.exists(map_path):
    try:
        with open(map_path, "r", encoding="utf-8") as f:
            AUDIO_MAP = json.load(f)
    except Exception as e:
        print(f"Failed to load audio map: {e}")

# ============================================================================
# ヘルパー関数
# ============================================================================

def wrap_text(text, max_chars=28):
    """長いテキストを自動改行する"""
    if len(text) <= max_chars:
        return text
    mid = len(text) // 2
    for offset in range(min(mid, 12)):
        for pos in [mid + offset, mid - offset]:
            if 0 < pos < len(text) and text[pos] in '、。！？ ,. ':
                return text[:pos + 1] + '\n' + text[pos + 1:]
    return text[:mid] + '\n' + text[mid:]

def get_subtitle(speaker, text, speaker_color=TEXT_MAIN):
    """字幕VGroupを作成"""
    name = Text(speaker, font="Noto Sans JP", font_size=20,
                color=speaker_color, weight=BOLD)
    wrapped = wrap_text(text)
    line = Text(wrapped, font="Noto Sans JP", font_size=24, color=TEXT_MAIN, line_spacing=1.2)
    content = VGroup(name, line).arrange(DOWN, buff=0.15, center=True)
    
    # 背景
    bg = RoundedRectangle(
        corner_radius=0.1,
        width=content.get_width() + 1.0, height=content.get_height() + 0.5,
        fill_color=WHITE, fill_opacity=0.9, stroke_color="#dee2e6", stroke_width=1
    )
    bg.move_to(content)
    result = VGroup(bg, content)
    result.to_edge(DOWN, buff=0.5)
    return result

def show_subtitle(scene, speaker, text, speaker_color=TEXT_MAIN, duration=3.0, prev_sub=None):
    """字幕表示＋音声同期"""
    if not hasattr(scene, "speech_index"):
        scene.speech_index = 0
    
    scene_name = scene.__class__.__name__
    key = scene_name.split("_")[0] # Scene01_Intro -> Scene01
    audio_data = None
    
    if key in AUDIO_MAP:
        try:
            audio_list = AUDIO_MAP[key]
            # ファジーマッチング
            start_idx = scene.speech_index
            end_idx = min(len(audio_list), start_idx + 5)
            candidates = audio_list[start_idx:end_idx]
            
            best_match = None
            highest_ratio = 0.0
            match_offset = 0
            
            for i, cand in enumerate(candidates):
                ratio = difflib.SequenceMatcher(None, text, cand["text"]).ratio()
                if ratio > highest_ratio:
                    highest_ratio = ratio
                    best_match = cand
                    match_offset = i
            
            if highest_ratio > 0.4: # しきい値
                audio_data = best_match
                scene.speech_index = start_idx + match_offset + 1
        except Exception as e:
            print(f"Audio error: {e}")

    wait_time = duration
    
    if audio_data:
        file_path = audio_data["file"]
        if os.path.exists(file_path):
            scene.add_sound(file_path)
            wait_time = audio_data["duration"]

    sub = get_subtitle(speaker, text, speaker_color)
    anims = [FadeIn(sub, shift=UP * 0.2)]
    if prev_sub is not None:
        anims.append(FadeOut(prev_sub))
    
    scene.play(*anims, run_time=0.3)
    scene.wait(wait_time + 0.1)
    
    return sub

def get_image(name, scale=1.0):
    """画像があればImageMobjectを、なければプレースホルダーまたは図形を返す"""
    # 拡張子なしで渡された場合を考慮
    key_name = name.replace(".png", "").replace(".jpg", "")
    if not name.endswith(".png") and not name.endswith(".jpg"):
        name += ".png"
        
    path = os.path.join("projects", "api_basics_yt", "media", "images", name)
    if os.path.exists(path):
        img = ImageMobject(path).scale(scale)
        return img
    
    # フォールバック図形描画
    if key_name == "vending_machine":
        return draw_vending_machine().scale(scale)
    elif key_name == "waiter" or key_name == "waiter_serving":
        return draw_waiter().scale(scale)
    elif key_name == "chef_knife":
        return draw_knife().scale(scale)
        
    # プレースホルダー (画像未生成時)
    placeholder = VGroup(
        RoundedRectangle(width=2, height=2, color=GREY, fill_opacity=0.3),
        Text(key_name, font_size=20, color=TEXT_DIM)
    )
    return placeholder

def draw_vending_machine():
    body = RoundedRectangle(width=2, height=3.5, corner_radius=0.2, color=RED, fill_opacity=1)
    window = Rectangle(width=1.6, height=1.5, color=WHITE, fill_opacity=0.3).move_to(body.get_top() + DOWN*1)
    drinks = VGroup(*[Circle(radius=0.1, color=c, fill_opacity=1) for c in [BLUE, ORANGE, GREEN, YELLOW]]).arrange_in_grid(2, 2).move_to(window)
    outlet = Rectangle(width=1.2, height=0.4, color=BLACK, fill_opacity=0.8).move_to(body.get_bottom() + UP*0.5)
    return VGroup(body, window, drinks, outlet)

def draw_waiter():
    face = Circle(radius=0.3, color=WHITE, fill_opacity=1).move_to(UP*0.5)
    body = Polygon(UP*0.2, RIGHT*0.5+DOWN*0.5, LEFT*0.5+DOWN*0.5, color=BLACK, fill_opacity=1)
    bowtie = VGroup(Triangle(color=RED, fill_opacity=1).rotate(-PI/2), Triangle(color=RED, fill_opacity=1).rotate(PI/2)).scale(0.1).move_to(UP*0.2)
    tray = Line(LEFT*0.6, RIGHT*0.8, color=SILVER).move_to(RIGHT*0.6 + UP*0.3)
    return VGroup(face, body, bowtie, tray).move_to(ORIGIN)

def draw_knife():
    blade = Polygon(ORIGIN, UP*0.5, RIGHT*2+UP*0.5, RIGHT*2.5, RIGHT*2, fill_opacity=1, color=SILVER).set_stroke(width=0)
    handle = RoundedRectangle(width=1, height=0.4, corner_radius=0.1, color=BROWN, fill_opacity=1).move_to(LEFT*0.5 + UP*0.25)
    return VGroup(blade, handle).move_to(ORIGIN)

# ============================================================================
# Scene 01: オープニング
# ============================================================================
class Scene01_Intro(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        # タイトルアニメーション
        t1 = Text("API", font_size=120, color=ACCENT_BLUE, weight=BOLD).move_to(UP*0.5)
        t2 = Text("完全理解", font="Noto Sans JP", font_size=60, color=TEXT_MAIN).next_to(t1, DOWN, buff=0.5)
        
        self.play(DrawBorderThenFill(t1), run_time=1.5)
        self.play(FadeIn(t2, shift=UP), run_time=1)
        self.wait(1)
        
        self.play(Group(t1, t2).animate.to_edge(UP).scale(0.6))
        
        sub1 = show_subtitle(self, "ずんだもん", "ねぇめたん、「API」ってよく聞くけど、美味しいの？", CHAR_ZUNDA)
        sub2 = show_subtitle(self, "めたん", "食べ物じゃないですわ！ でも、知らないとエンジニアとしては致命的ですわよ。", CHAR_METAN, prev_sub=sub1)
        sub3 = show_subtitle(self, "ずんだもん", "え、そんなに大事なのだ？", CHAR_ZUNDA, prev_sub=sub2)
        
        knife = get_image("chef_knife.png", scale=1.0).move_to(ORIGIN)
        chef = Text("👨‍🍳", font_size=100).next_to(knife, RIGHT)
        self.play(FadeIn(knife), FadeIn(chef))
        
        sub4 = show_subtitle(self, "めたん", "例えるなら、包丁を知らずに料理人を目指すようなものですわ。", CHAR_METAN, prev_sub=sub3)
        
        self.play(knife.animate.rotate(PI/4), run_time=0.5)
        self.play(knife.animate.rotate(-PI/4), run_time=0.5)
        
        sub5 = show_subtitle(self, "ずんだもん", "それはヤバいのだ…。今日こそ完全に理解するのだ！", CHAR_ZUNDA, prev_sub=sub4)
        sub6 = show_subtitle(self, "めたん", "よし、今日は15分でAPIを完全マスターしましょう！", CHAR_METAN, prev_sub=sub5)

        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 02: APIの正体
# ============================================================================
class Scene02_WhatIs(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "まず結論から。APIは「Application Programming Interface」の略です。", CHAR_METAN)
        
        txt = Text("Application Programming Interface", font_size=36, color=TEXT_MAIN).to_edge(UP, buff=2)
        self.play(Write(txt))
        
        sub2 = show_subtitle(self, "ずんだもん", "長すぎるのだ。日本語で頼むのだ。", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "日本語にすると「プログラム同士をつなぐ窓口」ですわ。", CHAR_METAN, prev_sub=sub2)
        
        window = data_window = RoundedRectangle(width=5, height=3, color=ACCENT_BLUE, fill_opacity=0.1)
        label = Text("窓口 (Window)", font="Noto Sans JP", font_size=32, color=ACCENT_BLUE).move_to(window)
        self.play(Transform(txt, label), FadeIn(window))
        
        sub4 = show_subtitle(self, "ずんだもん", "窓口？ 銀行のあの窓口みたいな？", CHAR_ZUNDA, prev_sub=sub3)
        sub5 = show_subtitle(self, "めたん", "いい線いってますわ！ 銀行の窓口で「10万円おろしたい」と伝えると、お金が出てきますよね？", CHAR_METAN, prev_sub=sub4)
        
        money = Text("💴", font_size=80).move_to(window)
        self.play(FadeOut(label), FadeIn(money, shift=DOWN))
        
        sub6 = show_subtitle(self, "ずんだもん", "そうなのだ。裏で何やってるかは知らないけど。", CHAR_ZUNDA, prev_sub=sub5)
        sub7 = show_subtitle(self, "めたん", "まさにそれがAPIの本質！ 裏の仕組みを知らなくても、決まった手順で頼めば結果が返ってくる仕組みです。", CHAR_METAN, prev_sub=sub6)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 03: 自販機
# ============================================================================
class Scene03_Vending(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "もう一つ、身近な例を出しましょう。自動販売機です。", CHAR_METAN)
        
        machine = get_image("vending_machine.png", scale=1.5).move_to(ORIGIN)
        button = Circle(radius=0.15, color=WHITE, fill_opacity=0.3).move_to(machine.get_center() + RIGHT*0.4 + DOWN*0.2) # Adjust button position for image
        
        self.play(FadeIn(machine), FadeIn(button))
        
        sub2 = show_subtitle(self, "ずんだもん", "自販機はよく使うのだ！ ずんだシェイクが好きなのだ。", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "自販機では、お金を入れてボタンを押すだけでジュースが出ますよね。", CHAR_METAN, prev_sub=sub2)
        
        juice = Text("🥤", font_size=60).move_to(machine.get_bottom() + UP*0.5)
        self.play(juice.animate.move_to(machine.get_bottom() + DOWN*1.5), run_time=1)
        
        sub4 = show_subtitle(self, "ずんだもん", "当たり前なのだ。", CHAR_ZUNDA, prev_sub=sub3)
        sub5 = show_subtitle(self, "めたん", "でも、中の冷却装置や在庫管理の仕組みは知らなくていい。", CHAR_METAN, prev_sub=sub4)
        
        gears = VGroup(*[Gear(8).scale(0.5).set_color(GREY) for _ in range(3)]).arrange(RIGHT).move_to(machine)
        self.play(machine.animate.set_opacity(0.5), FadeIn(gears))
        self.play(Rotate(gears[0]), Rotate(gears[1], -1), Rotate(gears[2]), run_time=2)
        
        sub6 = show_subtitle(self, "ずんだもん", "確かに、気にしたこともないのだ。", CHAR_ZUNDA, prev_sub=sub5)
        sub7 = show_subtitle(self, "めたん", "この「ボタン」こそがAPIです。複雑な内部処理を隠して、シンプルな操作だけ提供するのがAPIの役割ですわ。", CHAR_METAN, prev_sub=sub6)
        
        arrow = Arrow(LEFT*2, button.get_left(), color=ACCENT_RED)
        text = Text("API (Interface)", font_size=24, color=ACCENT_RED).next_to(arrow, LEFT)
        self.play(Write(text), GrowArrow(arrow))
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 04: レストラン
# ============================================================================
class Scene04_Restaurant(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "もう一つだけ例えを。レストランに行った時を考えてください。", CHAR_METAN)
        
        table = Rectangle(width=3, height=1.5, color=BROWN, fill_opacity=1).move_to(LEFT*2 + DOWN*1)
        kitchen = Rectangle(width=3, height=4, color=GREY, fill_opacity=0.5).move_to(RIGHT*3)
        waiter = Triangle(color=BLACK, fill_opacity=1).scale(0.5).move_to(ORIGIN)
        
        self.play(FadeIn(table), FadeIn(kitchen), FadeIn(waiter))
        
        sub2 = show_subtitle(self, "ずんだもん", "レストラン大好きなのだ！", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "お客さんが直接キッチンに入って冷蔵庫を漁ったりしますか？", CHAR_METAN, prev_sub=sub2)
        
        guest = Circle(color=ACCENT_BLUE, fill_opacity=1).move_to(table.get_top())
        self.play(FadeIn(guest))
        self.play(guest.animate.move_to(kitchen.get_center()), run_time=0.5)
        
        cross = Cross(kitchen).scale(0.8)
        self.play(Create(cross))
        
        sub4 = show_subtitle(self, "ずんだもん", "しないのだ！ 怒られるのだ。", CHAR_ZUNDA, prev_sub=sub3)
        
        self.play(FadeOut(cross), guest.animate.move_to(table.get_top()))
        
        sub5 = show_subtitle(self, "めたん", "ですよね。代わりに「メニュー」から選んで「ウェイター」に注文しますわ。", CHAR_METAN, prev_sub=sub4)
        
        menu = Text("Menu", font_size=20).next_to(guest, UP)
        self.play(FadeIn(menu))
        
        sub6 = show_subtitle(self, "ずんだもん", "あ！ ウェイターがAPIなのだ？", CHAR_ZUNDA, prev_sub=sub5)
        sub7 = show_subtitle(self, "めたん", "大正解！ メニューが「APIドキュメント」、注文が「リクエスト」、料理が「レスポンス」です。", CHAR_METAN, prev_sub=sub6)
        
        # Mapping labels
        l1 = Text("Menu = Document", font_size=24, color=ACCENT_BLUE).to_edge(UP, buff=1)
        l2 = Text("Waiter = API", font_size=24, color=ACCENT_RED).next_to(l1, DOWN)
        l3 = Text("Order = Request", font_size=24, color=ACCENT_GREEN).next_to(l2, DOWN)
        
        self.play(Write(l1), Write(l2), Write(l3))
        
        sub8 = show_subtitle(self, "ずんだもん", "めちゃくちゃわかりやすいのだ！", CHAR_ZUNDA, prev_sub=sub7)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 05: Interface
# ============================================================================
class Scene05_Interface(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "ところで「Interface」って言葉、API以外でも使われていますわ。", CHAR_METAN)
        
        usb = VGroup(
            RoundedRectangle(width=1, height=1.5, color=GREY, fill_opacity=1),
            Rectangle(width=0.4, height=0.6, color=WHITE, fill_opacity=1).move_to(DOWN*0.5)
        )
        self.play(FadeIn(usb))
        
        sub2 = show_subtitle(self, "ずんだもん", "USBもインターフェースって聞いたことあるのだ！", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "その通り！ USBは「パソコンと周辺機器をつなぐ接点」です。", CHAR_METAN, prev_sub=sub2)
        
        txt = Text("接点 (Interface)", font="Noto Sans JP", font_size=40, color=ACCENT_BLUE).next_to(usb, UP)
        self.play(Write(txt))
        
        sub4 = show_subtitle(self, "めたん", "テレビのリモコンも、ATMの画面も、全部「インターフェース」ですわ。", CHAR_METAN, prev_sub=sub3)
        sub5 = show_subtitle(self, "ずんだもん", "つまり「人と機械」や「機械と機械」の間にある接点ってことなのだ？", CHAR_ZUNDA, prev_sub=sub4)
        
        h_m = Text("Human ↔ Machine (UI)", font_size=30).move_to(LEFT*3)
        m_m = Text("Program ↔ Program (API)", font_size=30, color=ACCENT_RED).move_to(RIGHT*3)
        self.play(FadeIn(h_m), FadeIn(m_m))
        
        sub6 = show_subtitle(self, "めたん", "完璧な理解です！ APIはその中でも「プログラム同士の接点」なんです。", CHAR_METAN, prev_sub=sub5)
        self.play(Indicate(m_m, color=ACCENT_RED))
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 06: 身の回り
# ============================================================================
class Scene06_Daily(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "実は皆さん、毎日APIを使っていますわよ。", CHAR_METAN)
        sub2 = show_subtitle(self, "ずんだもん", "え？ プログラミングなんてしてないのだ。", CHAR_ZUNDA, prev_sub=sub1)
        
        phone = RoundedRectangle(width=2, height=3.5, corner_radius=0.2, color=BLACK, fill_opacity=0.1)
        screen = Rectangle(width=1.8, height=3, color=WHITE, fill_opacity=1).move_to(phone)
        app = VGroup(phone, screen)
        
        sun = Dot(color=ORANGE, radius=0.3).move_to(screen.get_center())
        weather = Text("25°C", color=BLACK).next_to(sun, DOWN)
        
        self.play(FadeIn(app))
        self.play(FadeIn(sun), FadeIn(weather))
        
        sub3 = show_subtitle(self, "めたん", "天気アプリを開くと最新の天気が表示されますよね？ あれは気象庁のAPIからデータをもらっています。", CHAR_METAN, prev_sub=sub2)
        
        cloud = Ellipse(width=2, height=1, color=GREY, fill_opacity=0.5).move_to(RIGHT*3 + UP*2)
        arrow = Arrow(cloud.get_left(), app.get_right(), color=ACCENT_BLUE)
        self.play(FadeIn(cloud), GrowArrow(arrow))
        
        sub4 = show_subtitle(self, "ずんだもん", "おお、そうだったのだ！", CHAR_ZUNDA, prev_sub=sub3)
        sub5 = show_subtitle(self, "めたん", "Googleマップの経路検索も、LINEの通知も、裏ではAPIが動いています。", CHAR_METAN, prev_sub=sub4)
        sub6 = show_subtitle(self, "ずんだもん", "スマホアプリのほとんどはAPIなしでは動かないのだ？", CHAR_ZUNDA, prev_sub=sub5)
        sub7 = show_subtitle(self, "めたん", "その通り！ 現代のアプリ開発はAPIなしではありえませんわ。", CHAR_METAN, prev_sub=sub6)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 07: Web API
# ============================================================================
class Scene07_Web(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "ここからは少し技術的な話。「Web API」の仕組みです。", CHAR_METAN)
        
        title = Text("Web API Mechanism", font_size=36, color=ACCENT_PURPLE).to_edge(UP)
        self.play(Write(title))
        
        sub2 = show_subtitle(self, "ずんだもん", "Web APIって、インターネットを使うAPIなのだ？", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "正解です。Web APIでは「HTTPリクエスト」を使ってサーバーにお願いをします。", CHAR_METAN, prev_sub=sub2)
        
        pc = Rectangle(width=1, height=0.8, color=BLACK).move_to(LEFT*3)
        server = StackedRectangle(3).move_to(RIGHT*3) # Custom shape later? usage VGroup
        server = VGroup(
            Rectangle(width=1, height=0.5, color=GREY, fill_opacity=0.5),
            Rectangle(width=1, height=0.5, color=GREY, fill_opacity=0.5),
            Rectangle(width=1, height=0.5, color=GREY, fill_opacity=0.5)
        ).arrange(UP, buff=0).move_to(RIGHT*3)
        
        arrow = Arrow(pc.get_right(), server.get_left(), buff=0.5, color=ACCENT_BLUE)
        label = Text("HTTP Request", font_size=20, color=ACCENT_BLUE).next_to(arrow, UP)
        
        self.play(FadeIn(pc), FadeIn(server), GrowArrow(arrow), FadeIn(label))
        
        sub4 = show_subtitle(self, "ずんだもん", "HTTPって、URLの先頭についてるやつなのだ？", CHAR_ZUNDA, prev_sub=sub3)
        sub5 = show_subtitle(self, "めたん", "そうです！ 例えば「https://api.weather.com/tokyo」というURLにアクセスするイメージです。", CHAR_METAN, prev_sub=sub4)
        
        url = Text("https://api.weather.com/tokyo", font="Consolas", font_size=24, color=TEXT_DIM).next_to(label, UP)
        self.play(Write(url))
        
        sub6 = show_subtitle(self, "ずんだもん", "ホームページを見るのと同じ感じなのだ？", CHAR_ZUNDA, prev_sub=sub5)
        sub7 = show_subtitle(self, "めたん", "かなり近いです！ ブラウザでURLを開くのとAPIを叩くのは、実は同じHTTP通信なんですわ。", CHAR_METAN, prev_sub=sub6)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 08: HTTP Method
# ============================================================================
class Scene08_Methods(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "HTTPリクエストには「メソッド」という種類があります。", CHAR_METAN)
        sub2 = show_subtitle(self, "ずんだもん", "メソッド？ 必殺技みたいなのだ？", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "ふふっ、良い例えですわ。4つの必殺技を紹介しましょう。", CHAR_METAN, prev_sub=sub2)
        
        methods = VGroup(
            Text("GET : 取得", color=ACCENT_GREEN),
            Text("POST : 作成", color=ACCENT_BLUE),
            Text("PUT : 更新", color=ACCENT_YELLOW),
            Text("DELETE : 削除", color=ACCENT_RED)
        ).arrange(DOWN, buff=0.5, aligned_edge=LEFT).move_to(LEFT*1)
        
        crud = VGroup(
            Text("Read", color=GREY),
            Text("Create", color=GREY),
            Text("Update", color=GREY),
            Text("Delete", color=GREY)
        ).arrange(DOWN, buff=0.5, aligned_edge=LEFT).next_to(methods, RIGHT, buff=1)
        
        self.play(FadeIn(methods[0]), FadeIn(crud[0]))
        sub4 = show_subtitle(self, "めたん", "GETは「データをください」。一番よく使います。", CHAR_METAN, prev_sub=sub3)
        
        self.play(FadeIn(methods[1]), FadeIn(crud[1]))
        sub5 = show_subtitle(self, "めたん", "POSTは「新しいデータを登録して」。", CHAR_METAN, prev_sub=sub4)
        
        self.play(FadeIn(methods[2]), FadeIn(crud[2]))
        sub6 = show_subtitle(self, "めたん", "PUTは「既存のデータを更新して」。", CHAR_METAN, prev_sub=sub5)
        
        self.play(FadeIn(methods[3]), FadeIn(crud[3]))
        sub7 = show_subtitle(self, "めたん", "DELETEは「データを削除して」。", CHAR_METAN, prev_sub=sub6)
        
        brace = Brace(crud, direction=RIGHT)
        crud_txt = Text("CRUD", font_size=40, color=TEXT_MAIN).next_to(brace, RIGHT)
        
        sub8 = show_subtitle(self, "ずんだもん", "読む・作る・更新・消す。CRUDってやつなのだ！", CHAR_ZUNDA, prev_sub=sub7)
        self.play(Create(brace), Write(crud_txt))
        
        sub9 = show_subtitle(self, "めたん", "お見事！ この4つを覚えれば、APIの基本操作はバッチリですわ。", CHAR_METAN, prev_sub=sub8)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 09: JSON
# ============================================================================
class Scene09_JSON(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "APIから返ってくるデータは、通常「JSON」という形式です。", CHAR_METAN)
        sub2 = show_subtitle(self, "ずんだもん", "ジェイソン？ ホラー映画の？", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "違いますわ！ JavaScript Object Notationの略です。", CHAR_METAN, prev_sub=sub2)
        sub4 = show_subtitle(self, "ずんだもん", "どんな見た目なのだ？", CHAR_ZUNDA, prev_sub=sub3)
        
        code = """{
  "name": "ずんだもん",
  "age": 5,
  "likes": ["ずんだ餅", "枝豆"],
  "is_human": false
}"""
        json_obj = Text(code, font="Consolas", font_size=28, color=TEXT_MAIN, line_spacing=1.5).move_to(UP*1)
        rect = SurroundingRectangle(json_obj, color=TEXT_DIM, fill_color=WHITE, fill_opacity=0.8)
        
        sub5 = show_subtitle(self, "めたん", "波括弧の中に「キー」と「値」のペアが並びます。", CHAR_METAN, prev_sub=sub4)
        self.play(FadeIn(rect), Write(json_obj))
        
        arrow = Arrow(LEFT*3, json_obj.get_left(), color=ACCENT_RED)
        k_v = Text("Key : Value", color=ACCENT_RED).next_to(arrow, LEFT)
        
        sub6 = show_subtitle(self, "ずんだもん", "おお、なんか読めるのだ！ 「名前：ずんだもん」って書いてあるのだ。", CHAR_ZUNDA, prev_sub=sub5)
        self.play(GrowArrow(arrow), FadeIn(k_v))
        
        sub7 = show_subtitle(self, "めたん", "そう、人間にも読みやすいのがJSONの良いところです。プログラムでも簡単に扱えますわ。", CHAR_METAN, prev_sub=sub6)

        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# Gear クラス (Scene03で必要)
class Gear(VMobject):
    def __init__(self, n_teeth=8, **kwargs):
        super().__init__(**kwargs)
        angle = TAU / n_teeth
        points = []
        for i in range(n_teeth):
            points.extend([
                (np.cos(i * angle), np.sin(i * angle), 0),
                (np.cos(i * angle + angle / 4), np.sin(i * angle + angle / 4), 0),
                (np.cos(i * angle + angle * 3/4), np.sin(i * angle + angle * 3/4), 0),
                (np.cos((i + 1) * angle), np.sin((i + 1) * angle), 0),
            ])
        self.set_points_as_corners(points)
        self.close_path()

# StackedRectangle (Scene07で必要)
class StackedRectangle(VGroup):
    def __init__(self, n=3, **kwargs):
        super().__init__(**kwargs)
        for _ in range(n):
            self.add(Rectangle(width=1, height=0.5, color=GREY, fill_opacity=0.5))
        self.arrange(UP, buff=0)

# ============================================================================
# Scene 10: Status Code
# ============================================================================
class Scene10_Status(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "サーバーは結果と一緒に「ステータスコード」という番号も返します。", CHAR_METAN)
        
        codes = VGroup(
            Text("200 OK", color=ACCENT_GREEN),
            Text("404 Not Found", color=ACCENT_YELLOW),
            Text("500 Internal Error", color=ACCENT_RED)
        ).arrange(DOWN, buff=0.8).move_to(LEFT*2 + UP*0.5)
        
        self.play(Write(codes[0]))
        sub2 = show_subtitle(self, "めたん", "200は「成功」。リクエストがうまくいった合図です。", CHAR_METAN, prev_sub=sub1)
        
        self.play(Write(codes[1]))
        sub3 = show_subtitle(self, "めたん", "404は「見つからない」。指定したデータが存在しない時です。", CHAR_METAN, prev_sub=sub2)
        sub4 = show_subtitle(self, "ずんだもん", "404ってネットでよく見るやつなのだ！", CHAR_ZUNDA, prev_sub=sub3)
        
        img404 = Text("🚫", font_size=80).next_to(codes[1], RIGHT, buff=1)
        self.play(FadeIn(img404))
        
        self.play(Write(codes[2]))
        sub5 = show_subtitle(self, "めたん", "500は「サーバーエラー」。サーバー側の問題という意味です。", CHAR_METAN, prev_sub=sub4)
        
        fire = Text("🔥", font_size=80).next_to(codes[2], RIGHT, buff=1)
        self.play(FadeIn(fire))
        
        sub6 = show_subtitle(self, "ずんだもん", "番号で結果がわかるのは便利なのだ。", CHAR_ZUNDA, prev_sub=sub5)
        
        teapot = Text("418 I'm a teapot", font="Consolas", color=ACCENT_PURPLE).to_edge(DOWN, buff=2)
        pot_icon = Text("🫖", font_size=60).next_to(teapot, UP)
        
        sub7 = show_subtitle(self, "めたん", "余談ですが「418 I'm a teapot」という冗談コードも存在しますわ。", CHAR_METAN, prev_sub=sub6)
        self.play(FadeIn(teapot), FadeIn(pot_icon))
        
        sub8 = show_subtitle(self, "ずんだもん", "エンジニアって遊び心があるのだ！", CHAR_ZUNDA, prev_sub=sub7)

        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 11: API Key
# ============================================================================
class Scene11_ApiKey(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "ところで、APIは誰でも自由に使えるわけではありません。", CHAR_METAN)
        sub2 = show_subtitle(self, "ずんだもん", "え、使えないの？ ケチなのだ！", CHAR_ZUNDA, prev_sub=sub1)
        
        door = Rectangle(width=2, height=3.5, color=BROWN, fill_opacity=1)
        lock = Circle(radius=0.2, color=GOLD, fill_opacity=1).move_to(door.get_right() + LEFT*0.3)
        self.play(FadeIn(door), FadeIn(lock))
        
        sub3 = show_subtitle(self, "めたん", "セキュリティのためですわ。家の鍵と同じです。", CHAR_METAN, prev_sub=sub2)
        sub4 = show_subtitle(self, "めたん", "多くのAPIでは「APIキー」という秘密の文字列を発行してもらいます。", CHAR_METAN, prev_sub=sub3)
        
        key_icon = Text("🗝️", font_size=60).move_to(LEFT*2)
        key_str = Text("API-KEY: abc123xyz...", font="Consolas", font_size=24, color=GOLD).next_to(key_icon, DOWN)
        
        self.play(FadeIn(key_icon), Write(key_str))
        self.play(key_icon.animate.move_to(lock.get_center()), run_time=1)
        self.play(door.animate.rotate(PI/2, axis=UP, about_point=door.get_left()), run_time=1)
        
        sub5 = show_subtitle(self, "ずんだもん", "パスワードみたいなものなのだ？", CHAR_ZUNDA, prev_sub=sub4)
        sub6 = show_subtitle(self, "めたん", "近いですわ。リクエストにAPIキーを含めることで「認証された利用者です」と証明するんです。", CHAR_METAN, prev_sub=sub5)
        
        id_card = RoundedRectangle(width=2, height=1.2, color=ACCENT_BLUE, fill_opacity=0.2).move_to(RIGHT*2 + UP*1)
        face = Circle(radius=0.3, color=WHITE).move_to(id_card.get_left() + RIGHT*0.5)
        lines = VGroup(Line(ORIGIN, RIGHT), Line(ORIGIN, RIGHT)).arrange(DOWN).next_to(face, RIGHT).scale(0.5)
        self.play(FadeIn(id_card), FadeIn(face), FadeIn(lines))
        
        sub7 = show_subtitle(self, "ずんだもん", "なるほど、身分証明書みたいなものなのだ。", CHAR_ZUNDA, prev_sub=sub6)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 12: Rate Limit
# ============================================================================
class Scene12_RateLimit(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "もう一つ大事な概念、「レートリミット」を紹介しますわ。", CHAR_METAN)
        
        traffic_light = VGroup(
            RoundedRectangle(width=1, height=3, color=BLACK, fill_opacity=1),
            Circle(radius=0.3, color=RED, fill_opacity=1).shift(UP*0.8),
            Circle(radius=0.3, color=YELLOW, fill_opacity=0.3),
            Circle(radius=0.3, color=GREEN, fill_opacity=0.3).shift(DOWN*0.8)
        ).move_to(UP*1)
        
        self.play(FadeIn(traffic_light))
        
        sub2 = show_subtitle(self, "ずんだもん", "レートリミット？ 速度制限？", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "その通り！ APIには「1分間に60回まで」のような利用制限があります。", CHAR_METAN, prev_sub=sub2)
        
        sign = Text("Limit: 60 req/min", color=RED).next_to(traffic_light, RIGHT, buff=1)
        self.play(Write(sign))
        
        sub4 = show_subtitle(self, "ずんだもん", "なんで制限するのだ？", CHAR_ZUNDA, prev_sub=sub3)
        sub5 = show_subtitle(self, "めたん", "一人が何億回もリクエストしたら、サーバーがパンクしてしまいますわ。", CHAR_METAN, prev_sub=sub4)
        
        server = StackedRectangle().move_to(LEFT*2)
        # DDoS sim
        dots = VGroup(*[Dot(color=RED) for _ in range(20)]).arrange_in_grid(4, 5).move_to(RIGHT*3)
        
        self.play(FadeIn(server), FadeIn(dots))
        self.play(dots.animate.move_to(server.get_center()), run_time=1)
        self.play(server.animate.set_color(RED), Flash(server, color=RED))
        
        sub6 = show_subtitle(self, "ずんだもん", "DDoS攻撃みたいになっちゃうのだ！", CHAR_ZUNDA, prev_sub=sub5)
        sub7 = show_subtitle(self, "めたん", "そうです。みんなが公平に使えるようにする交通整理の仕組みですわ。", CHAR_METAN, prev_sub=sub6)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 13: REST API
# ============================================================================
class Scene13_REST(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "ここでプルスウルトラ！ 「REST API」について触れましょう。", CHAR_METAN)
        
        p_plus = Text("Plus Ultra!", font_size=60, color=GOLD, weight=BOLD).to_edge(UP, buff=1)
        self.play(Write(p_plus), run_time=1)
        
        sub2 = show_subtitle(self, "ずんだもん", "REST？ お休みのことなのだ？", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "Representational State Transferの略ですわ。Web APIの設計ルールのことです。", CHAR_METAN, prev_sub=sub2)
        
        rest_txt = Text("REST API", font_size=48, color=ACCENT_BLUE).next_to(p_plus, DOWN, buff=1)
        self.play(Write(rest_txt))
        
        sub4 = show_subtitle(self, "めたん", "RESTの原則は「URLでリソースを特定する」「HTTPメソッドで操作を表現する」ことです。", CHAR_METAN, prev_sub=sub3)
        sub5 = show_subtitle(self, "ずんだもん", "さっき習ったGETとかPOSTの使い分けのことなのだ？", CHAR_ZUNDA, prev_sub=sub4)
        sub6 = show_subtitle(self, "めたん", "そうです！ そしてもう一つ「ステートレス」という特徴があります。", CHAR_METAN, prev_sub=sub5)
        
        stateless = Text("Stateless (無状態)", color=TEXT_DIM).next_to(rest_txt, DOWN, buff=1)
        self.play(FadeIn(stateless))
        
        sub7 = show_subtitle(self, "ずんだもん", "ステートレスって何なのだ？", CHAR_ZUNDA, prev_sub=sub6)
        sub8 = show_subtitle(self, "めたん", "「前回の会話を覚えていない」ということです。毎回、必要な情報を全部送ります。", CHAR_METAN, prev_sub=sub7)
        
        fish = Text("🐟", font_size=40).move_to(LEFT*2) # Goldfish memory
        self.play(FadeIn(fish))
        
        sub9 = show_subtitle(self, "ずんだもん", "ちょっと不便そうだけど、シンプルでわかりやすいのだ！", CHAR_ZUNDA, prev_sub=sub8)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 14: Examples
# ============================================================================
class Scene14_Examples(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "では実際に使われているAPIを見てみましょう。", CHAR_METAN)
        
        logos = VGroup(
            Text("X (Twitter) API", color=BLACK),
            Text("YouTube Data API", color=RED),
            Text("OpenAI API", color=ACCENT_GREEN)
        ).arrange(DOWN, buff=1.0).move_to(UP*0.5)
        
        self.play(Write(logos[0]))
        sub2 = show_subtitle(self, "めたん", "Twitter APIを使えば、ツイートの投稿や取得がプログラムでできます。", CHAR_METAN, prev_sub=sub1)
        sub3 = show_subtitle(self, "ずんだもん", "ボットとかはそうやって作るのだ？", CHAR_ZUNDA, prev_sub=sub2)
        
        self.play(Write(logos[1]))
        sub4 = show_subtitle(self, "めたん", "そうです！ YouTube Data APIでは動画の情報を取得できますわ。", CHAR_METAN, prev_sub=sub3)
        
        self.play(Write(logos[2]))
        sub5 = show_subtitle(self, "めたん", "そしてOpenAI APIを使えば、ChatGPTの機能を自分のアプリに組み込めます。", CHAR_METAN, prev_sub=sub4)
        
        brain = Text("🧠", font_size=80).next_to(logos[2], RIGHT)
        self.play(FadeIn(brain))
        
        sub6 = show_subtitle(self, "ずんだもん", "すごいのだ！ AIの力を借りられるのだ！", CHAR_ZUNDA, prev_sub=sub5)
        sub7 = show_subtitle(self, "めたん", "全てが「APIという窓口」を通じて提供されているんですわ。", CHAR_METAN, prev_sub=sub6)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 15: GraphQL
# ============================================================================
class Scene15_GraphQL(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "余談ですがRESTの次世代として注目されている「GraphQL」も紹介しますわ。", CHAR_METAN)
        
        gql_logo = Text("GraphQL", font_size=60, color=ACCENT_RED).move_to(UP*2)
        self.play(Write(gql_logo))
        
        sub2 = show_subtitle(self, "ずんだもん", "グラフキューエル？ かっこいい名前なのだ！", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "RESTでは、決まったURLから決まったデータが返ってきます。", CHAR_METAN, prev_sub=sub2)
        
        # REST comparison
        rest_box = Rectangle(width=2, height=2, color=BLUE, fill_opacity=0.3).move_to(LEFT*3)
        rest_items = VGroup(
            Circle(radius=0.2, color=RED, fill_opacity=1),
            Square(side_length=0.4, color=GREEN, fill_opacity=1),
            Triangle(color=YELLOW, fill_opacity=1).scale(0.3)
        ).arrange(RIGHT).move_to(rest_box)
        rest_label = Text("REST (All)", font_size=20).next_to(rest_box, DOWN)
        
        self.play(FadeIn(rest_box), FadeIn(rest_items), FadeIn(rest_label))
        
        sub4 = show_subtitle(self, "めたん", "でもGraphQLでは「欲しいデータだけ」を指定して取得できるんです。", CHAR_METAN, prev_sub=sub3)
        
        gql_box = Rectangle(width=2, height=2, color=ACCENT_RED, fill_opacity=0.3).move_to(RIGHT*3)
        gql_item = Circle(radius=0.2, color=RED, fill_opacity=1).move_to(gql_box) # Only Circle
        gql_label = Text("GraphQL (Pick)", font_size=20).next_to(gql_box, DOWN)
        
        self.play(FadeIn(gql_box), FadeIn(gql_item), FadeIn(gql_label))
        
        sub5 = show_subtitle(self, "ずんだもん", "レストランで言うと「サラダの中のトマトだけください」みたいな？", CHAR_ZUNDA, prev_sub=sub4)
        sub6 = show_subtitle(self, "めたん", "面白い例えですわね！ まさにそんな感じです。まずはRESTを理解してから挑戦しましょう。", CHAR_METAN, prev_sub=sub5)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 16: Try it
# ============================================================================
class Scene16_Try(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "実際にAPIを試してみたくなりましたか？", CHAR_METAN)
        sub2 = show_subtitle(self, "ずんだもん", "試したいのだ！ でもどうやるのだ？", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "一番簡単なのは「Postman」というツールです。画面からURLを入力するだけでAPIを試せます。", CHAR_METAN, prev_sub=sub2)
        
        pm_logo = Text("Postman", font_size=60, color=ORANGE).move_to(UP*1)
        self.play(FadeIn(pm_logo))
        
        screen = RoundedRectangle(width=4, height=2.5, color=GREY, fill_opacity=0.1).next_to(pm_logo, DOWN)
        btn = RoundedRectangle(width=1, height=0.5, color=BLUE, fill_opacity=1).move_to(screen.get_right() + LEFT*1)
        btn_txt = Text("Send", font_size=16, color=WHITE).move_to(btn)
        
        self.play(Create(screen), FadeIn(btn), FadeIn(btn_txt))
        self.play(btn.animate.scale(0.9), run_time=0.2)
        self.play(btn.animate.scale(1.1), run_time=0.2)
        
        sub4 = show_subtitle(self, "ずんだもん", "プログラミングしなくてもいいの？", CHAR_ZUNDA, prev_sub=sub3)
        sub5 = show_subtitle(self, "めたん", "はい！ まずはPostmanでAPIの動きを体感するのがおすすめですわ。", CHAR_METAN, prev_sub=sub4)
        sub6 = show_subtitle(self, "めたん", "コマンドラインが好きなら「curl」コマンドも使えます。", CHAR_METAN, prev_sub=sub5)
        
        curl = Text("> curl https://api...", font="Consolas", color=BLACK).to_edge(DOWN, buff=2)
        self.play(Write(curl))
        
        sub7 = show_subtitle(self, "ずんだもん", "よし、今日帰ったら早速試すのだ！", CHAR_ZUNDA, prev_sub=sub6)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 17: Mistakes
# ============================================================================
class Scene17_Fail(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "最後に、初心者がやりがちな失敗を紹介しますわ。", CHAR_METAN)
        
        skull = Text("💀", font_size=80).move_to(UP*1)
        self.play(FadeIn(skull))
        
        sub2 = show_subtitle(self, "ずんだもん", "失敗？ 怖いのだ…。", CHAR_ZUNDA, prev_sub=sub1)
        sub3 = show_subtitle(self, "めたん", "一番多いのは「APIキーをGitHubに公開してしまう」ことです。", CHAR_METAN, prev_sub=sub2)
        
        code = Text("git push", font="Consolas", color=BLACK).move_to(LEFT*2)
        key = Text("API_KEY=...", font="Consolas", color=RED).next_to(code, RIGHT)
        self.play(Write(code), Write(key))
        
        sub4 = show_subtitle(self, "ずんだもん", "ええ！ それはまずいのだ！", CHAR_ZUNDA, prev_sub=sub3)
        sub5 = show_subtitle(self, "めたん", "悪意のある人に使われて、高額請求が来ることもありますわ。", CHAR_METAN, prev_sub=sub4)
        
        bill = Text("💸 Invoice: $10,000", font_size=36, color=RED).to_edge(UP, buff=2)
        self.play(Transform(skull, bill))
        
        sub6 = show_subtitle(self, "めたん", "もう一つは「レートリミットを無視して大量にリクエストする」こと。", CHAR_METAN, prev_sub=sub5)
        sub7 = show_subtitle(self, "ずんだもん", "アカウント停止されちゃうのだ…。 নিয়ম", CHAR_ZUNDA, prev_sub=sub6) 
        # Note: Typo in script "アカウント停止されちゃうのだ…。" -> Fixed on creation? No, using script text.
        # Actually user script is "アカウント停止されちゃうのだ…。"
        
        ban = Text("🚫 Account Banned", font_size=40, color=RED).move_to(DOWN*1)
        self.play(FadeIn(ban))
        
        sub8 = show_subtitle(self, "めたん", "APIの利用規約は必ず読みましょうね。", CHAR_METAN, prev_sub=sub7)
        
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

# ============================================================================
# Scene 18: Summary
# ============================================================================
class Scene18_End(Scene):
    def construct(self):
        self.camera.background_color = BG_COLOR
        
        sub1 = show_subtitle(self, "めたん", "さあ、今日のまとめをしましょう。", CHAR_METAN)
        
        check = Text("✅ API Master Checklist", font_size=36, color=ACCENT_BLUE, weight=BOLD).to_edge(UP, buff=0.5)
        self.play(Write(check))
        
        # Summary points appearing one by one
        points = [
            "API = 窓口 (自販機/ウェイター)",
            "Web API = HTTP + JSON",
            "認証 (Key) & 制限 (Limit)",
            "REST & GraphQL"
        ]
        
        grp = VGroup()
        for i, p in enumerate(points):
            t = Text(f"• {p}", font="Noto Sans JP", font_size=24, color=TEXT_MAIN).to_edge(LEFT, buff=2).shift(UP*(1.5 - i*0.8))
            grp.add(t)
        
        sub2 = show_subtitle(self, "ずんだもん", "APIは「プログラム同士をつなぐ窓口」なのだ！", CHAR_ZUNDA, prev_sub=sub1)
        self.play(FadeIn(grp[0], shift=RIGHT))
        sub3 = show_subtitle(self, "めたん", "自販機のボタン、レストランのウェイター。身近な例で理解できましたわね。", CHAR_METAN, prev_sub=sub2)
        
        sub4 = show_subtitle(self, "ずんだもん", "Web APIではHTTPリクエストを送って、JSONでデータをもらうのだ！", CHAR_ZUNDA, prev_sub=sub3)
        self.play(FadeIn(grp[1], shift=RIGHT))
        
        sub5 = show_subtitle(self, "めたん", "ステータスコードで結果を確認し、APIキーで認証する。", CHAR_METAN, prev_sub=sub4)
        self.play(FadeIn(grp[2], shift=RIGHT))
        
        sub6 = show_subtitle(self, "ずんだもん", "RESTっていう設計ルールがあって、GraphQLっていう新しいやつもあるのだ！", CHAR_ZUNDA, prev_sub=sub5)
        self.play(FadeIn(grp[3], shift=RIGHT))
        
        sub7 = show_subtitle(self, "めたん", "素晴らしい理解力ですわ！ あなたはもうAPIの基本を完全にマスターしました。", CHAR_METAN, prev_sub=sub6)
        
        medal = Text("🏅", font_size=100).move_to(RIGHT*3)
        self.play(SpinInFromNothing(medal))
        
        sub8 = show_subtitle(self, "ずんだもん", "やったのだ！ 今日からAPIマスターなのだ！", CHAR_ZUNDA, prev_sub=sub7)
        sub9 = show_subtitle(self, "めたん", "次のステップは実際にAPIを叩いてみることです。チャンネル登録もよろしくお願いしますわ！", CHAR_METAN, prev_sub=sub8)
        
        self.wait(2)
        self.play(*[FadeOut(m) for m in self.mobjects], run_time=1)

