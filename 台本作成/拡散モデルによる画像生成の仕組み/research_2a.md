# リサーチチェックポイント：主流・肯定的情報

## 収集ファクト一覧

| # | ファクト | 信頼度 | 出典 |
|---|---------|--------|------|
| 1 | 拡散モデルはデータにノイズを段階的に加える「拡散過程（Forward Process）」と、ノイズを段階的に除去して元の画像を復元する「逆拡散過程（Reverse Process）」の2つのプロセスで構成される | 🟢高 | Ho et al., "Denoising Diffusion Probabilistic Models" (2020), NeurIPS |
| 2 | DDPM（Denoising Diffusion Probabilistic Models）は2020年にJonathan Ho, Ajay Jain, Pieter Abbeelによって発表され、拡散モデルを実用的な画像生成手法として確立した | 🟢高 | Ho et al. (2020), NeurIPS |
| 3 | DDPMはGANと比較して学習が安定しており、モード崩壊（mode collapse）が起きにくく、生成サンプルの多様性が高い | 🟢高 | 複数の比較研究・サーベイ論文 |
| 4 | Stable Diffusionは潜在拡散モデル（Latent Diffusion Model, LDM）を採用し、VAEで画像を潜在空間に圧縮（512×512×3 → 64×64×4）してからノイズ除去を行うことで、計算コストを大幅に削減 | 🟢高 | Rombach et al., "High-Resolution Image Synthesis with Latent Diffusion Models" (2022), CVPR |
| 5 | U-Netがノイズ除去のバックボーンとして機能し、エンコーダ（ダウンサンプリング）→ボトルネック→デコーダ（アップサンプリング）のU字構造とスキップコネクションにより、多スケール特徴抽出を実現 | 🟢高 | Ronneberger et al. U-Net原論文 + Stable Diffusion実装 |
| 6 | テキスト条件付けはCLIP（Contrastive Language-Image Pre-training）テキストエンコーダによってプロンプトをベクトル化し、U-Net内部のCross-Attentionメカニズムを通じて画像生成を制御する | 🟢高 | Radford et al., CLIP論文 + Stable Diffusion実装 |
| 7 | Classifier-Free Guidance（CFG）により、条件付き予測と無条件予測を組み合わせてプロンプトへの忠実度を調整できる。ガイダンススケールを上げるとプロンプトに忠実に、下げると多様性が増す | 🟢高 | Ho & Salimans, "Classifier-Free Diffusion Guidance" (2022) |
| 8 | DDIMサンプリングにより、DDPMの1000ステップから50ステップ程度まで生成ステップ数を削減でき、約20倍の高速化を達成（品質を維持） | 🟢高 | Song et al., "Denoising Diffusion Implicit Models" (2021), ICLR |
| 9 | Stable Diffusion, DALL-E 2, Midjourneyなど主要な画像生成AIサービスはすべて拡散モデルを基盤技術として採用している | 🟢高 | 各社公式発表・技術論文 |
| 10 | DALL-E 2はCLIP画像埋め込みで条件付けされた拡散モデルを使用し、Diffusion Prior（Transformerベース）でテキスト→画像埋め込み変換を行う | 🟢高 | Ramesh et al., "Hierarchical Text-Conditional Image Generation with CLIP Latents" (2022) |
| 11 | 拡散モデルの目的関数は「各ステップで加えられたノイズεを予測する」というシンプルな形に帰着でき、学習の安定性と実装の容易さに寄与 | 🟢高 | Ho et al. (2020) |
| 12 | VAEによる潜在空間圧縮は非可逆圧縮であり、画像→潜在表現→画像の変換で微小なぼけや色の変化が生じるが、計算効率の大幅な向上とのトレードオフ | 🟡中 | 技術解説記事・実装ドキュメント |

## まとめ・所感

拡散モデルの主流技術は「Forward（ノイズ追加）→ Reverse（ノイズ除去）」という明快な2段階構造で説明できる。台本では以下の流れが効果的：

1. **まず原理を直感的に**：「きれいな画像にだんだんノイズを加えて砂嵐にする→その逆を学習して、砂嵐から画像を復元する」
2. **なぜGANに勝ったか**：学習安定性・多様性・モード崩壊なし
3. **Stable Diffusionの工夫**：VAEで圧縮→U-Netでノイズ除去→VAEで復元、という3段構造
4. **テキスト制御の仕組み**：CLIP + Cross-Attention + CFG

数値として「512×512×3 → 64×64×4（64分の1に圧縮）」「DDIMで1000ステップ→50ステップ」などが視聴者の「へぇ」を引き出せるポイント。
