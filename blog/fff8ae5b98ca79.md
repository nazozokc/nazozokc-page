---
title: "neovimのディストリビューション「NazoVim」を作った話" 
emoji: "✨"
date: 2025-3-18
category: neovim
---
## なぜ作ろうと思ったのか
なぜ作ろうと思ったかというと、自分の設定ファイルが出来上がってきたかなって思ったからです。AIと一緒にneovimの設定をしていたのですが、このうちの思想が詰まった設定ファイルディストロにして公開したら面白そうじゃね？と思ったからです。
いまさら感あるかもしれませんが、この記事に最後までお付き合いいただけたら幸いです。

## NazoVimの使い方
NazoVimはneovimのディストロもどきです。プラグインマネージャーはLazy.nvimを使っています。

![](https://storage.googleapis.com/zenn-user-upload/68dfbf1e2efa-20260318.png)

### インストール方法
#### 方法１ nixの環境で試しに使ってみる
このneovimディストロはnixを使って、本来の設定を汚さずに、NazoVimを試しに使ってみることができます。
```bash
nix run github:nazozokc/NazoVim
```

#### 方法２ 本気でこのディストロを使う
本気でこのディストロを使う場合はgit cloneを使用します。

```bash
mv ~/.config/nvim ~/.config/nvim.backup  # バックアップ（任意）
git clone https://github.com/nazozokc/NazoVim ~/.config/nvim
nvim
```

### ディレクトリ構成
```
.
├── flake.nix             # Nix flake (nix run / nix develop)
├── init.lua              # エントリーポイント・キーマップ定義
├── lazy-lock.json        # プラグインバージョンロック
├── lua/
│   ├── vim-options.lua   # 基本vim設定
│   ├── plugins.lua       # lazy.nvim エントリ (空 = plugins/ 以下を自動読み込み)
│   └── plugins/          # プラグイン設定 (1ファイル1プラグイン)
├── template/             # ファイルテンプレート
│   ├── js/
│   ├── ts/
│   ├── lua/
│   ├── md/
│   └── project/
└── .github/
    ├── workflows/        # CI (nvim startup check / auto-merge)
    └── ISSUE_TEMPLATE/   # Bug report / Feature request / Plugin proposal
```

### キーバインディング
NazoVimのキーバインディングは以下のようになっています。

`<Leader>` = `Space`

<details>
<summary><b>基本</b></summary>

| キー | 動作 |
|------|------|
| `<Leader><Leader>` | ファイル検索 (snacks Picker) |
| `<Leader>g` | Live Grep |
| `<Leader>b` | バッファ一覧 |
| `<Leader>r` | 最近使ったファイル |
| `<Leader>h` | 検索ハイライト解除 |
| `<Leader>z` | Zen mode |
| `<Leader>m` | Oil ファイルエクスプローラー |
| `<Leader>n` | Neo-tree |
| `<Leader>t` | フローティングターミナル |
| `<Leader>f` | フォーマット |

</details>

<details>
<summary><b>LSP</b></summary>

| キー | 動作 |
|------|------|
| `K` | ホバー |
| `gd` | 定義へ移動 |
| `ga` | コードアクション (Lspsaga) |
| `<Leader>ca` | コードアクション (preview) |
| `<Leader>gd` | 定義へ移動 |
| `<Leader>gr` | 参照一覧 |
| `<Leader>oi` | Import整理 (TS) |
| `<Leader>ru` | 未使用削除 (TS) |

</details>

<details>
<summary><b>Treesitter Textobjects</b></summary>

| キー | 動作 |
|------|------|
| `af` / `if` | outer / inner 関数 |
| `ac` / `ic` | outer / inner クラス |
| `aa` / `ia` | outer / inner 引数 |
| `ai` / `ii` | outer / inner 条件分岐 |
| `al` / `il` | outer / inner ループ |
| `ab` / `ib` | outer / inner ブロック |
| `]f` / `[f` | 次/前の関数へジャンプ |
| `]c` / `[c` | 次/前のクラスへジャンプ |
| `]a` / `[a` | 次/前の引数へジャンプ |
| `<Leader>sn` | 次の引数と swap |
| `<Leader>sp` | 前の引数と swap |

</details>

<details>
<summary><b>Git</b></summary>

| キー | 動作 |
|------|------|
| `<Leader>gd` | DiffviewOpen |
| `<Leader>gh` | ファイル履歴 |
| `<Leader>gH` | ブランチ履歴 |
| `<Leader>gc` | Diffview Close |
| `<Leader>gp` | Hunkプレビュー |
| `<Leader>gt` | Blame toggle |

</details>

<details>
<summary><b>セッション</b></summary>

| キー | 動作 |
|------|------|
| `<Leader>qs` | セッション復元 |
| `<Leader>qS` | セッション選択 |
| `<Leader>ql` | 最後のセッションを復元 |
| `<Leader>qd` | セッション保存を停止 |

</details>

<details>
<summary><b>AI</b></summary>

| キー | 動作 |
|------|------|
| `<Leader>ac` | Claude Code toggle |
| `<Leader>af` | Claude Code focus |
| `<Leader>ab` | 現在バッファを追加 |
| `<C-a>` | opencode ask |
| `<C-x>` | opencode select action |
| `<C-.>` | opencode toggle |

</details>

<details>
<summary><b>DAP</b></summary>

| キー | 動作 |
|------|------|
| `<F5>` | 実行 / 継続 |
| `<F10>` | ステップオーバー |
| `<F11>` | ステップイン |
| `<F12>` | ステップアウト |
| `<Leader>db` | ブレークポイント切替 |
| `<Leader>du` | DAP UI toggle |

</details>

<details>
<summary><b>テスト</b></summary>

| キー | 動作 |
|------|------|
| `<leader>tr` | 最寄りのテスト実行 |
| `<leader>tR` | 全テスト実行 |
| `<leader>tf` | ファイルのテスト実行 |
| `<leader>to` | テスト出力 toggle |

</details>

<details>
<summary><b>ウィンドウ / バッファ</b></summary>

| キー | 動作 |
|------|------|
| `<C-h/j/k/l>` | ウィンドウ移動 (tmux対応) |
| `<C-PageDown/Up>` | バッファ切替 |
| `<C-t>` | 新規バッファ |
| `<C-q>` | バッファを閉じる |

</details>

### プラグイン
プラグインは以下です。

<details>
<summary><b>LSP / 補完</b></summary>

| プラグイン | 用途 |
|------------|------|
| nvim-lspconfig + mason | LSP管理 |
| typescript-tools.nvim | TypeScript専用LSP（高速化設定済み） |
| nvim-cmp | 補完エンジン |
| LuaSnip + denippet.vim | スニペット（VSCode互換） |
| lspsaga.nvim | LSP UI拡張 |
| actions-preview.nvim | コードアクションプレビュー |
| conform.nvim | フォーマッター（stylua / prettier等） |
| none-ls.nvim | rubocop等の追加診断 |
| fidget.nvim | LSPプログレス表示 |
| tiny-inline-diagnostic.nvim | インライン診断 |
| lazydev.nvim | Lua/Neovim API の補完・型チェック強化 |

</details>

<details>
<summary><b>Fuzzy Finder / ナビゲーション</b></summary>

| プラグイン | 用途 |
|------------|------|
| snacks.nvim | Picker / Dashboard / Zen / Words / Session |
| telescope.nvim | ファジーファインダー（サブ） |
| oil.nvim | バッファベースのファイルエクスプローラー |
| neo-tree.nvim | ツリー形式ファイルエクスプローラー |
| yazi.nvim | yaziファイルマネージャー統合 |
| dropbar.nvim | Winbar / パンくずリスト |
| flash.nvim | ジャンプ（`<CR>` でスマートジャンプ） |
| aerial.nvim | シンボルアウトライン |
| project.nvim | プロジェクトルート自動検出 |

</details>

<details>
<summary><b>UI / 見た目</b></summary>

| プラグイン | 用途 |
|------------|------|
| kanagawa.nvim | カラースキーム（dragon + 透明） |
| lualine.nvim | ステータスライン |
| barbar.nvim | タブバー |
| noice.nvim | コマンドラインUI / 通知 |
| nvim-notify | 通知システム |
| nvim-scrollbar / satellite.nvim | スクロールバー |
| modes.nvim | モード別カーソル色変化 |
| nvim-illuminate | カーソル下シンボルのハイライト |
| incline.nvim | フローティングファイル名 |
| todo-comments.nvim | TODO/FIXME等のハイライト |
| render-markdown.nvim | Markdownのリッチレンダリング |
| nvim-highlight-colors | カラーコードのインラインプレビュー |

</details>

<details>
<summary><b>Git</b></summary>

| プラグイン | 用途 |
|------------|------|
| gitsigns.nvim | Git差分サインカラム |
| diffview.nvim | 差分ビュー / ファイル履歴 |
| lazygit.nvim | LazyGit統合 |
| vim-fugitive | Git操作 |
| octo.nvim | GitHub Issue / PR / Notification 操作 |

</details>

<details>
<summary><b>エディタ機能</b></summary>

| プラグイン | 用途 |
|------------|------|
| nvim-treesitter | シンタックスハイライト / インデント |
| nvim-treesitter-textobjects | 関数・クラス・引数単位のテキストオブジェクト |
| nvim-autopairs | 括弧自動補完 |
| mini.ai / surround / comment | テキストオブジェクト・Surround・コメント |
| nvim-spider | CamelCase/snake_case対応 w/e/b |
| substitute.nvim | レジスタを使った置換 |
| dial.nvim | `<C-a>/<C-x>` の拡張インクリメント |
| which-key.nvim | キーマップヘルプ |
| toggleterm.nvim | フローティングターミナル |
| kulala.nvim | REST client (.http ファイル) |
| persistence.nvim | セッション管理 |

</details>

<details>
<summary><b>AI統合</b></summary>

| プラグイン | 用途 |
|------------|------|
| claudecode.nvim | Claude Code統合 |
| opencode.nvim | opencode統合 |
| CopilotChat.nvim | GitHub Copilot Chat |
| copilot.lua | GitHub Copilot補完 |

</details>

<details>
<summary><b>デバッグ / テスト</b></summary>

| プラグイン | 用途 |
|------------|------|
| nvim-dap + nvim-dap-ui | デバッガー |
| nvim-dap-vscode-js | JS/TS デバッグアダプタ |
| neotest | テストランナー |
| neotest-jest / vitest / playwright | テストアダプタ |
| nvim-coverage | カバレッジ表示 |

</details>

## まとめ
ぜひ一度使ってみてください！issueやPRはもう大歓迎です！！！！
https://github.com/nazozokc/NazoVim
