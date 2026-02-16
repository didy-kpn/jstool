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
- `totalContentChars`: 空白 `[\s\u3000]` と括弧文字 `「」『』"` を除いた総文字数
- `sentenceLengths = [len_1, len_2, ...]`（各文の空白・括弧除去後文字数）

前処理:

- 改行は `\r\n` / `\r` を `\n` に正規化
- 章区切りに使う行（`#`見出し行 / `◆`行 / 任意区切り文字行）は
  - 章タイトルとして保持
  - 分析対象テキストから除外
- ルビ除去オプション ON 時:
  - `｜` を除去
  - `《...》` を除去

台詞・地の文:

- 対応括弧:
  - 標準: `「...」`, `『...』`
  - オプション ON: `"..."`（半角二重引用符）
- 台詞フラグはスタック方式（入れ子可）
- 括弧文字自体（`「」『』"`）は文字数カウントから除外
- 未閉じ括弧がある場合も計算継続し、`unclosedJapanese` / `unclosedAscii` を警告表示
- 行 `i` の集計:
  - `lineContentChars_i` = 空白・括弧除去後の行文字数
  - `lineDialogueChars_i` = 台詞フラグが立った行文字数
  - `lineDialogueRatio_i = lineDialogueChars_i / lineContentChars_i`（分母0なら0）
- 行分類:
  - 行頭（trim後）が `「` / `『`（オプションON時は `"` も）なら台詞行
  - それ以外は `lineDialogueRatio_i >= dialogueLineThreshold`（既定 0.60）で台詞行
- 全体比率:
  - `dialogueCharRatio = dialogueChars / (dialogueChars + narrationChars)`（分母0なら0）
  - `dialogueLineRatio = dialogueLines / (dialogueLines + narrationLines)`（分母0なら0）

読みやすさ:

- 文分割:
  - 既定: `。！？!?` または改行
  - 折り返し改行無視 ON: `。！？!?` のみ
- 文長:
  - `avgSentenceLen = sum(sentenceLengths) / sentenceCount`（`sentenceCount=0` なら0）
  - `medianSentenceLen = sentenceLengths` の中央値
- 長文率 / 短文率:
  - `longSentenceRate = count(len_i >= 80) / sentenceCount`（`sentenceCount=0` なら0）
  - `shortSentenceRate = count(len_i <= 40) / sentenceCount`（`sentenceCount=0` なら0）
- 密度・文字種比率:
  - `punctuationCount = count("、","。","！","？","!","?")`
  - `punctuationDensity = (punctuationCount / totalContentChars) * 100`（分母0なら0）
  - `newlineDensity = (newlineCount / totalContentChars) * 100`（分母0なら0）
  - `blanklineDensity = (blanklineCount / totalContentChars) * 100`（分母0なら0）
  - `kanjiRatio = kanjiCount / totalContentChars`（分母0なら0）
  - `hiraganaRatio = hiraganaCount / totalContentChars`（分母0なら0）
  - `katakanaRatio = katakanaCount / totalContentChars`（分母0なら0）
  - `otherRatio = 1 - (kanjiRatio + hiraganaRatio + katakanaRatio)`（0-1に clamp）

合成スコア:

- 句読点不足ペナルティ:
  - `punctuationShortage = max(0, P0 - punctuationDensity) / P0`（`P0` 既定6.0、UI調整可）
- テンポ指数（0-100）:
  - `tempoNewlineDensity = ignoreWrap ? blanklineDensity : newlineDensity`
  - `tempoIndex = clamp01(0.45*shortSentenceRate + 0.20*min(tempoNewlineDensity/12, 1) + 0.35*dialogueCharRatio) * 100`
- 負荷指数（0-100）:
  - `loadIndex = clamp01(0.45*longSentenceRate + 0.35*kanjiRatio + 0.20*punctuationShortage) * 100`

文体度（文学度 / ライトノベル度 / Web小説度）:

- 二重カウント回避のため、`tempoIndex` / `loadIndex` は文体判定の特徴量に直接使わない
- 特徴量（0-1へ正規化）:
  - `f_dialogue = clamp01(dialogueCharRatio)`
  - `f_newline = clamp01((ignoreWrap ? blanklineDensity : newlineDensity) / 10)`
  - `f_shortness = clamp01(1 - medianSentenceLen / 90)`
  - `f_long = clamp01(longSentenceRate)`
  - `f_kanji = clamp01(kanjiRatio / 0.5)`
  - `f_punctAdeq = clamp01(1 - punctuationShortage)`
- 重み:
  - `w_dialogue=1.2, w_newline=1.0, w_shortness=1.1, w_long=1.1, w_kanji=1.0, w_punctAdeq=1.0`
  - `W = 6.4`
- 文体ごとの目標値 `t_style,k`（順序: `dialogue, newline, shortness, long, kanji, punctAdeq`）:
  - 文学: `(0.20, 0.18, 0.28, 0.62, 0.72, 0.78)`
  - ライトノベル: `(0.42, 0.35, 0.58, 0.35, 0.45, 0.72)`
  - Web小説: `(0.56, 0.62, 0.72, 0.22, 0.34, 0.68)`
- 距離と生スコア:
  - `distance_style = Σ_k |f_k - t_style,k| * w_k`
  - `raw_style = max(0, 1 - distance_style / W)`
- 最終スコア（%）:
  - `score_style = raw_style / (raw_literary + raw_lightNovel + raw_webNovel) * 100`
  - 生スコア合計が0なら全スタイル0%
- 傾向判定と信頼度:
  - 判定: `argmax(score_literary, score_lightNovel, score_webNovel)`
  - `confidence = topScore - secondScore`
  - `confidence < 8` の場合は「判定弱」を付与

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
