# ローカルオセロゲーム

この小さなプロジェクトは、HTML/CSS/JavaScriptで動作するローカルのオセロです。ブラウザで`index.html`を開くだけで遊べます。

使い方:

1. このフォルダで簡易HTTPサーバーを起動（推奨）:

```zsh
cd /Users/kodamasaya/Desktop/個人用/趣味用/趣味制作/game
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開いてください。

または `index.html` を直接開いても動作します（ローカルファイル制限に依存しません）。

機能:
- 8x8 のオセロ盤
- 合法手の候補表示（トグル可能）
- スコア表示
- パス、勝敗判定
- 再開始ボタン

次の改善案:
- AI 対戦
- パス回数や履歴の表示
- モバイル向け操作改善

ライブデモ:

- https://koda-jpg.github.io/game/  

公開されたデモURLを README に追加しました。
