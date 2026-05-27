export const skillCategories = [
	{
		label: 'Languages',
		class: 'lang',
		items: [
			{ name: 'TypeScript', pct: 78, color: 'var(--blue)' },
			{ name: 'JavaScript', pct: 60, color: 'var(--yellow)' },
			{ name: 'Lua', pct: 54, color: 'var(--purple)' },
			{ name: 'Nix', pct: 70, color: 'var(--green)' },
			{ name: 'HTML / CSS', pct: 62, color: 'var(--red)' },
		]
	},
	{
		label: 'Tools',
		class: 'tools',
		tags: ['Neovim', 'fish', 'lazygit', 'fzf', 'WezTerm', 'GitHub Actions']
	},
	{
		label: 'OS / Infra',
		class: 'infra',
		tags: ['Arch Linux', 'home-manager', 'nix-darwin', 'flake-parts', 'Node.js']
	}
];

export const environmentCards = [
	{
		title: 'Neovim',
		details: ['lazy.nvim / kanagawa-dragon', 'LSP: lua_ls, ts_ls, nixd']
	},
	{
		title: 'Nix',
		details: ['home-manager / nix-darwin', 'shell: fish']
	},
	{
		title: 'WezTerm',
		details: ['lua config / kanagawa theme', 'opacity: 0.90']
	}
];

export const interests = [
	{ icon: '🐧', label: 'Linux / CLI' },
	{ icon: '📦', label: 'Nix / dotfiles' },
	{ icon: '⌨️', label: 'Neovim' },
	{ icon: '🛠️', label: 'CLIツール自作' },
	{ icon: '🤖', label: 'AIエージェント' },
	{ icon: '🎮', label: 'Minecraft' },
	{ icon: '🌐', label: 'Web開発' },
];

export const wipItems = [
	{
		status: 'active' as const,
		title: 'dotfiles (Nix)',
		desc: 'flake-parts構成の改善、agent-skills-nix、CI/CD整備',
		url: 'https://github.com/nazozokc/dotfiles'
	},
	{
		status: 'active' as const,
		title: 'pomodoro-timer-cli',
		desc: 'TypeScript製CLIポモドーロタイマー、Nix flakeでパッケージング',
		url: 'https://github.com/nazozokc/pomodoro-timer-cli'
	},
	{
		status: 'wip' as const,
		title: 'Neovim 最適化',
		desc: 'lazy.nvimプロファイル分析、起動時間削減',
		url: null
	},
	{
		status: 'wip' as const,
		title: 'CLIツール量産',
		desc: 'TypeScriptで小さいツールをどんどん作る練習中',
		url: null
	}
];

export const timeline = [
	{ date: '2026.03.13', title: '1500コミット突破', desc: null },
	{ date: '2026.02.14', title: 'Nixに目覚める', desc: null },
	{ date: '2026.01.14', title: 'GitHubを使い始める', desc: '初めてのリポジトリはdotfiles' },
	{ date: '2025.12.01', title: 'CLIが大好きになる', desc: null },
	{ date: '2025.11.10', title: 'Neovimに目覚める', desc: null },
	{ date: '2025.03.01', title: 'Linuxに目覚める', desc: null },
	{ date: '2024.12.25', title: 'PCゲット！', desc: null },
	{ date: '2010.07.21', title: '爆誕', desc: null },
];
