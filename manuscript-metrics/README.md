# Manuscript Metrics Tool

HTML + CSS + JavaScript だけで動作する、ブラウザ向けのシンプルな原稿メトリクス診断ツールです。

## 概要

原稿テキスト（ファイルまたは貼り付けテキスト）を指定すると、台詞バランス・読みやすさ・章別推移をまとめて表示します。

- A. 台詞・地の文
  - 台詞文字数比率 / 台詞行数比率
  - 平均台詞行長 / 平均地の文行長
- B. 読みやすさ（軽量メトリクス）
  - 1文平均文字数 / 中央値
  - 長文割合、句読点密度、改行密度
  - 漢字率、ひらがな率、カタカナ率
- C. 合成スコア（目安）
  - テンポ指数 / 負荷指数
  - 文学度 / ライトノベル度 / Web小説度（計算式表示付き）
  - 傾向判定（〜寄り）
- グラフ
  - 章別推移（台詞比率 / テンポ指数 / 負荷指数）
  - 連続台詞の長さ分布

## 使い方

1. `index.html` をブラウザで開きます。
2. テキストを入力します（どちらかの方法で可）。
   - ファイル読込
     - `ファイル読込（.txt）` でテキストファイルを選択
   - コピペ
     - `テキスト入力` に直接貼り付け
3. 章区切りを選択します（`# 見出し行` / `◆ 行` / `空行2連続` / `任意の区切り文字`）。
4. 必要に応じて `半角引用符 "..." も台詞として判定` を ON/OFF します。
5. 指標とグラフが自動で更新されます。

補助操作:

- `クリア`: 入力と表示を初期化

## 使用技術

- HTML5
- CSS3
- Vanilla JavaScript
- [Chart.js 4.4.1](https://www.chartjs.org/)
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`

## 仕様

### 入力仕様

- 入力ソース
  - テキストエリアへの貼り付け
  - `.txt` ファイル読込
- 章区切りモード
  - `#` 見出し行
  - `◆` 行
  - 空行2連続
  - 任意の区切り文字
- 台詞判定モード
  - 標準: `「…」` / `『…』`
  - オプション: `"..."`（半角引用符）
- 改行コードは内部で `\n` に正規化して処理

### 差分計算仕様

記号定義:

- `clamp01(x) = min(max(x, 0), 1)`
- `totalContentChars`: 空白（半角/全角空白、改行など）を除いた総文字数
- `sentenceLengths = [len_1, len_2, ...]`（各文の空白除去後文字数）

台詞・地の文:

- 文字単位で台詞フラグを付与
  - 標準対応: `「...」`, `『...』`
  - オプション: `"..."`（ON時）
- 行 `i` の台詞率:
  - `lineDialogueRatio_i = dialogueCharsInLine_i / nonWhitespaceCharsInLine_i`
- 行分類:
  - `lineDialogueRatio_i >= 0.5` なら台詞行、それ以外は地の文行
- 全体比率:
  - `dialogueCharRatio = dialogueChars / (dialogueChars + narrationChars)`（分母0なら0）
  - `dialogueLineRatio = dialogueLines / (dialogueLines + narrationLines)`（分母0なら0）

読みやすさ:

- 文分割: `。！？!?` または改行で文を区切る
- 文長:
  - `avgSentenceLen = sum(sentenceLengths) / sentenceCount`（`sentenceCount=0` なら0）
  - `medianSentenceLen = sentenceLengths` の中央値
- 長文率 / 短文率:
  - `longSentenceRate = count(len_i >= 80) / sentenceCount`（`sentenceCount=0` なら0）
  - `shortSentenceRate = count(len_i <= 40) / sentenceCount`（`sentenceCount=0` なら0）
- 密度・文字種比率:
  - `punctuationDensity = (count("、","。") / totalContentChars) * 100`（分母0なら0）
  - `newlineDensity = (newlineCount / totalContentChars) * 100`（分母0なら0）
  - `kanjiRatio = kanjiCount / totalContentChars`（分母0なら0）
  - `hiraganaRatio = hiraganaCount / totalContentChars`（分母0なら0）
  - `katakanaRatio = katakanaCount / totalContentChars`（分母0なら0）

合成スコア:

- 句読点不足ペナルティ:
  - `punctuationShortage = max(0, 4 - punctuationDensity) / 4`（`totalContentChars=0` なら0）
- テンポ指数（0-100）:
  - `tempoIndex = clamp01(0.45*shortSentenceRate + 0.20*min(newlineDensity/12, 1) + 0.35*dialogueCharRatio) * 100`
- 負荷指数（0-100）:
  - `loadIndex = clamp01(0.45*longSentenceRate + 0.35*kanjiRatio + 0.20*punctuationShortage) * 100`

文体度（文学度 / ライトノベル度 / Web小説度）:

- 特徴量（0-1へ正規化）:
  - `f_dialogue = clamp01(dialogueCharRatio)`
  - `f_newline = clamp01(newlineDensity / 10)`
  - `f_shortness = clamp01(1 - avgSentenceLen / 90)`
  - `f_heavy = clamp01(loadIndex / 100)`
  - `f_kanji = clamp01(kanjiRatio / 0.5)`
  - `f_tempo = clamp01(tempoIndex / 100)`
- 重み:
  - `w_dialogue=1.2, w_newline=0.9, w_shortness=1.0, w_heavy=1.1, w_kanji=1.0, w_tempo=1.2`
  - `W = 1.2+0.9+1.0+1.1+1.0+1.2 = 6.4`
- 文体ごとの目標値 `t_style,k`:
  - 文学: `(0.20, 0.18, 0.28, 0.72, 0.72, 0.35)`
  - ライトノベル: `(0.42, 0.35, 0.58, 0.38, 0.45, 0.64)`
  - Web小説: `(0.56, 0.62, 0.72, 0.25, 0.34, 0.82)`
  - 順序は `(dialogue, newline, shortness, heavy, kanji, tempo)`
- 距離と生スコア:
  - `distance_style = Σ_k |f_k - t_style,k| * w_k`
  - `raw_style = max(0, 1 - distance_style / W)`
- 最終スコア（%）:
  - `score_style = raw_style / (raw_literary + raw_lightNovel + raw_webNovel) * 100`
  - 生スコア合計が0なら全スタイル0%
- 傾向判定:
  - `argmax(score_literary, score_lightNovel, score_webNovel)` を採用

### 表示仕様

- 上段2カラム
  - 左: 入力・設定
  - 右: 診断ダッシュボード（A/B/C）
- 下段2カラム
  - 章別推移ラインチャート
  - 連続台詞分布バー チャート
- 文学度 / ライトノベル度 / Web小説度の各カードには、計算方法の要約テキストを表示

### レスポンシブ仕様

- 画面幅が狭い場合、上段・下段とも 1 カラムに切り替え
- テキストエリアの最小高さを縮小してモバイル表示に対応

## 注意事項

- `Chart.js` を CDN から読み込むため、初回表示時はネットワーク接続が必要です。
- 各スコアと文体判定は推敲支援の目安であり、作品の良し悪しを断定するものではありません。
- 巨大テキスト（非常に長い行や大量行）では、ブラウザ描画に時間がかかる場合があります。
