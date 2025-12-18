# Games（ローカル／デモ）

このリポジトリは複数の小さなブラウザゲームをまとめて管理するための monorepo です。
各ゲームは `games/` フォルダ配下に置かれます。

ローカルで動かす（推奨）:

```zsh
cd /Users/kodamasaya/Desktop/個人用/趣味用/趣味制作/game
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` にアクセスし、ランディングページから各ゲームに移動してください。

個別ゲームを直接起動する場合:

```zsh
cd /Users/kodamasaya/Desktop/個人用/趣味用/趣味制作/game/games/OthelloGame
python3 -m http.server 8000
```

機能（現在）:
- `games/OthelloGame/` : 8x8 のオセロゲーム（ローカルプレイ、簡易AI）

デプロイ:
- このリポジトリは GitHub Actions による自動デプロイを設定しています。
	`main` ブランチに push すると、静的ファイルが `gh-pages` ブランチにデプロイされ、
	サイトは `https://koda-jpg.github.io/game/` で公開されます。

次の改善案:
- AI の強化（難易度設定）
- モバイル操作の改善
- ランディングページの自動生成

ライブデモ:

- https://koda-jpg.github.io/game/

（注）各ゲーム内のアセットは相対パスで参照してください。Actions は `index.html` と `games/` を `public/` にコピーして `gh-pages` に公開します。
