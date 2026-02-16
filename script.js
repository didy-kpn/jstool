const tools = [
  { name: "diff-viewer", href: "./diff-viewer/index.html", description: "テキスト差分を比較表示" },
  {
    name: "realtime-strcount",
    href: "./realtime-strcount/index.html",
    description: "リアルタイム文字数カウント",
  },
  {
    name: "manuscript-metrics",
    href: "./manuscript-metrics/index.html",
    description: "原稿メトリクス診断（台詞比率・読みやすさ・章別推移）",
  },
  // 例:
  // { name: "JSON 整形", href: "./tools/json-formatter/index.html", description: "JSON を見やすく整形" },
];

const listEl = document.getElementById("tool-list");
const emptyEl = document.getElementById("empty-message");

function renderTools(items) {
  if (!Array.isArray(items) || items.length === 0) {
    emptyEl.classList.remove("hidden");
    listEl.innerHTML = "";
    return;
  }

  emptyEl.classList.add("hidden");
  listEl.innerHTML = items
    .map((tool) => {
      const desc = tool.description ? ` - ${tool.description}` : "";
      return `<li><a class="tool-link" href="${tool.href}">${tool.name}</a>${desc}</li>`;
    })
    .join("");
}

renderTools(tools);
