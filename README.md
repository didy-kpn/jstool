# jstool

HTML + CSS + JavaScript だけで作るツール置き場です。

## 構成

- `index.html`: 目次ページ（GitHub Pages の公開ルート）
- `style.css`: 目次ページのスタイル
- `script.js`: 目次に表示するツール一覧

## GitHub Pages 公開手順

1. GitHub にこのリポジトリを push します。
2. GitHub の `Settings` > `Pages` を開きます。
3. `Build and deployment` の `Source` で `Deploy from a branch` を選びます。
4. Branch は `main`（または利用ブランチ）、Folder は `/ (root)` を選んで保存します。
5. 数分後に表示される URL（例: `https://<ユーザー名>.github.io/jstool/`）を開くと目次ページが表示されます。

## ツール追加方法

`script.js` の `tools` 配列に要素を追加してください。

```js
{ name: "JSON 整形", href: "./tools/json-formatter/index.html", description: "JSON を見やすく整形" }
```
