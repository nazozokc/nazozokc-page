---
name: nazozokc-portfolio
description: Help debug, improve, and maintain the nazozokc terminal-style HTML portfolio. Use this skill whenever the user wants to modify the portfolio design, add/remove features, fix bugs, optimize performance, improve GitHub API integration, or enhance the terminal UI/UX. This includes styling changes, JavaScript logic updates, new command implementations, and responsive design tweaks.
---

# nazozokc ポートフォリオアシスタント

このスキルは、nazozokcのターミナル風HTMLポートフォリオウェブサイトの管理と改善を支援します。

## プロジェクト概要

このポートフォリオは、Linuxターミナルインターフェースをシミュレートする単一ページのHTMLアプリケーションです。開発者のプロフィール、スキル、GitHubリポジトリをインタラクティブなターミナルデザインで表示します。

**主な機能:**
- ぼかし付きグラスモーフィズムデザインのターミナルUI
- リアルタイムGitHub API連携（ユーザープロファイル、リポジトリ、コミット統計）
- クリックで実行可能なコマンド
- TypeScript/JavaScriptフォーカス表示
- スムーズなアニメーション対応レスポンシブデザイン
- カスタムカラースキーム（Kanagawaインスピレーション）

**技術スタック:**
- HTML5、CSS3（カスタムプロパティ、アニメーション、backdrop-filter）
-  Vanilla JavaScript（async/await、fetch API）
- ライブデータ用GitHub REST API
- Marked.jsライブラリ（現在読み込み済みだが未使用）

---

## アーキテクチャ

### DOM構造
```
<body>
├── <header class="top-bar">          // スティッキーナビゲーション
│   ├── ステータスインジケーター + タイトル
│   └── リンク (X, GitHub)
├── <main class="terminal-container">
│   ├── #terminal (出力エリア)
│   ├── .input-line (コマンド入力)
│   └── .click-commands (ボタングリッド)
```

### カラースキーム（CSS変数）
```
--bg: #0d0c0c              // 背景
--bg-secondary: #181818    // セカンダリ背景
--fg: #c5c9c5              // 前景テキスト
--green: #8a9a7b           // アクセント（プライマリ）
--blue: #8ba4b0            // アクセント（セカンダリ）
--red: #c4746e             // エラー
--yellow: #c4b28a          // ハイライト
--purple: #a292a3          // 未使用
--gray: #6c6a6c            // ミュートテキスト
```

---

## コマンドハンドラー

### 1. `neovim`
テーブル形式でNeovim設定詳細を表示。
- マネージャー: lazy.nvim
- テーマ: kanagawa-dragon
- LSP: lua_ls, ts_ls, html, nixd
- 関連ツール: lualine, noice, nvim-notify, gitsigns, lazygit, octo, nvim-dap, neotest

**ファイル:** スクリプトセクション内にインライン
**タイプ:** 静的表示

### 2. `nix`
Nix/Home Managerセットアップ情報を表示。
- システム: Linux/macOS（クロスプラットフォーム）
- シェル: fish
- 開発ツール: nodejs, bun, deno, rustc
- CLIツール: jq, bat, fzf, zoxide, yazi

**ファイル:** スクリプトセクション内にインライン
**タイプ:** 静的表示

### 3. `wezterm`
WezTermターミナル設定を表示。
- 設定: Luaベース（モジュラー）
- テーマ: kanagawa（カスタムパレット）
- キーボードショートカット（スプリットフォーカス、タブ、フルスクリーン）
- IMEサポート（日本語入力）

**ファイル:** スクリプトセクション内にインライン
**タイプ:** 静的表示

### 4. `X`
X/Twitterプロフィールへの直接リンク: `https://x.com/@NazozoK6519`

**ファイル:** スクリプトセクション内にインライン
**タイプ:** リンク

### 5. `github`
**最も複雑なコマンド** - GitHub APIからライブデータを取得:
1. ユーザープロファイル情報（名前、Bio、公開リポジトリ数、フォロワー、フォロー中）
2. すべての公開リポジトリ
3. 各リポジトリのコミット数（Linkヘッダページネーションを使用）
4. コミット数によるトップ3リポジトリ
5. 完全なGitHubプロフィールへのリンク

**API呼び出し:**
- `GET /users/nazozokc` → ユーザープロファイル
- `GET /users/nazozokc/repos?per_page=100` → リポジトリ一覧
- `GET /repos/nazozokc/{repo}/commits?per_page=1` → コミットページネーション

**制限事項:**
- GitHub APIレート制限: 60リクエスト/時（認証なし）
- 認証トークンなし（パブリックデータのみ）
- 初回読み込みが遅い（複数のシーケンシャルAPI呼び出し）

**潜在的な改善点:**
- localStorageに結果をキャッシュ
- 認証リクエストを使用（更高的レート制限）
- Promise.all()でAPI呼び出しを並列化
- レート制限のエラー処理を追加

### 6. `:q`
ターミナルをクリアして再初期化（vimスタイルの終了+リロード）。

**ファイル:** `handleQuit()` 関数
**動作:** 出力をクリアし、`initTerminal()`を呼び出して初期状態にリセット

### 7. `clear`
シンプルなターミナルクリアコマンド。

**ファイル:** `handleClear()` 関数
**動作:** `terminal.innerHTML = ""` を設定

---

## JavaScript関数

### 初期化
- **`initTerminal()`** - ページ読み込み時および `:q` コマンド後に実行
  - whoami → nazozokc を表示
  - about.txt（3行）を表示
  - ls skills/（スキルタグ）を表示
  - トップ6リポジトリを取得して表示
  - 「以下のコマンドから選択」メッセージを追加

### 出力レンダリング
- **`createOutputLine(content, className)`** - アニメーション付きでdivを作成して追加
- **`typeText(text, element, speed)`** - タイピング効果をシミュレート（1文字ずつ）
- **`appendLines(lines, delay)`** - 遅延を入れながら複数行をタイプ
- **`scrollToBottom()`** - スムーズスクロール（古いブラウザ用のフォールバック付き）

### コマンド実行
- **`executeCommand(cmd)`** - メインルーター; プロンプトを表示してハンドラーに委譲
- **`handleNeovim()`, `handleNix()`, `handleWezterm()`, `handleGithub()`** - 個別のコマンドハンドラー

### ユーティリティ
- **`escapeHtml(text)`** - 動的コンテンツ（GitHubデータ）からのXSS防止
- **`sleep(ms)`** - Promiseベースの遅延
- **`displayBackTop()`** - 「トップに戻る」ボタンを作成（定義されているが未使用）

---

## 既知の問題と改善の機会

### パフォーマンス
1. **GitHub API呼び出しがシーケンシャル** - トップ6リポジトリは正常に読み込めるが、コミットカウントが遅い
   - 修正: Promise.all()で並列化

2. **キャッシュなし** - 每次ページリロードで新鮮なデータを取得
   - 修正: TTL付きでlocalStorageに存储

3. **Marked.jsは読み込まれているが未使用**
   - 修正: 不要であればCDNリンクから削除

4. **typeText()が長いコンテンツで遅い**
   - オプション: タイピング速度を落とすかバッチレンダリング

### 信頼性
1. **GitHub認証トークンなし** - レート制限の影響を受けやすい
   - 修正: パーソナルアクセストークンを追加（ただし秘密に保つ）

2. **エラー処理が最小限** - 一般的な「エラー: github情報の読み込みに失敗しました」メッセージ
   - 修正: 具体的なエラーを表示（レート制限 vs ネットワークエラー）

3. **レスポンシブデザイン** - モバイルで横スクロールが発生する可能性がある
   - より小さい画面でのテストが必要; メディアクエリは存在するが調整が必要な場合がある

### UX
1. **トップに戻るボタン** (`displayBackTop()`) は作成されているが決して呼び出されない
   - 決定: 維持するか削除するか

2. **静的コマンドのローディング状態なし** (neovim, nix, wezterm)
   - オプション: 必要であれば微妙なローディングスピナーを追加

3. **コマンド履歴や自動補完なし**
   - オプション: 履歴を矢印キーでナビゲート機能を追加

4. **カーソル点滅アニメーションは入力フィールドにのみ表示**
   - 検討: カーソル外観をターミナルテーマに合わせて調整

---

## 一般的な変更

### 新しいコマンドの追加
1. HTMLにクリックアイテムを追加:
```html
<div class="click-item" data-cmd="mycommand">
  <span class="click-num">[8]</span>
  <span class="click-cmd">mycommand</span>
</div>
```

2. `executeCommand()` switchにcaseを追加:
```javascript
case "mycommand":
  await handleMyCommand();
  break;
```

3. ハンドラーを実装:
```javascript
async function handleMyCommand() {
  await appendLines([
    "line 1",
    "line 2"
  ], 15);
}
```

### 色の変更
`:root` CSS変数を編集:
```css
:root {
  --yellow: #new_color;  // ハイライト色を変更
  --green: #new_color;   // プライマリアクセント色を変更
}
```

### GitHub情報表示の更新
`handleGithub()`関数の出力を変更。重要な要素:
- `user.name`, `user.bio`, `user.followers`, `user.following`
- `repo.name`, `repo.description`, `repo.html_url`
- `repoCommits` 配列（コミット数でソート）

### アニメーション速度の改善
- **タイピング速度:** `appendLines()`の`delay`パラメータを変更（小さいほど速い）
- **フェードインアニメーション:** `.output-line`アニメーションCSSの`0.4s`を調整
- **スクロール動作:** `scrollToBottom()`の`behavior: 'smooth'`を変更

---

## テストチェックリスト

変更時のテスト:
- [ ] すべての7コマンドをテスト（無効なコマンドのエラーケースも含む）
- [ ] GitHub API読み込みを確認（遅い可能性がある、レート制限をテスト）
- [ ] モバイル（< 640px）でのレスポンシブデザインを確認
- [ ] ターミナルスクロール動作を確認
- [ ] キーボード入力をテスト（Enterで送信）
- [ ] クリックで実行ボタンが動作することを確認
- [ ] 読みやすさのためのカラースキームコントラストを確認
- [ ] 異なるブラウザでテスト（Chrome, Firefox, Safari）

---

## リソース

**外部API:**
- GitHub REST API: `https://api.github.com`
- Google Fonts (JetBrains Mono): `https://fonts.googleapis.com`

**ライブラリ:**
- Marked.js: `https://cdn.jsdelivr.net/npm/marked/marked.min.js` （現在未使用）

**ファイル参照:**
- なし（単一ファイルHTMLアプリケーション）

---

## ユーザーへの次のステップ

1. **具体的な問題がありますか？** - 問題を説明してください（UIバグ、API問題、スタイリング）
2. **機能リクエストがありますか？** - 追加したいものとその場所を指定してください
3. **パフォーマンスの問題がありますか？** - 遅いコマンドをプロファイルしてください（おそらくGitHub API）
4. **デザインの変更がありますか？** - 希望する外観を示すか、直接色を変更してください

常に確認すること: 現在の動作 vs 期待される動作は何ですか？
