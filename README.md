# Stock Trading Platform - Frontend

## 🚀 概要
AI駆動の次世代株式分析プラットフォームのフロントエンドアプリケーション。リアルタイムで正確な投資分析を提供します。

## ✨ 主な機能

### コア機能
- **リアルタイム株式検索**: 銘柄コード・企業名での高速検索（デバウンス機能付き）
- **価格チャート**: インタラクティブな価格履歴グラフ
- **テクニカル分析**: RSI、MACD、ボリンジャーバンド、移動平均線
- **AI投資分析**: 売買推奨、目標価格、損切りライン
- **トレーディングシグナル**: リアルタイムアラート
- **AIチャット機能**: 分析結果に関する質問に即座に回答

### 新機能 (2025/01)
- **ポートフォリオトラッカー**: 保有銘柄の損益管理
- **ウォッチリスト**: 価格監視と通知機能
- **マーケット概況**: 主要指数・人気株の一覧
- **ダークモード**: システム連動の自動切り替え

## 🛠️ 技術スタック
- Next.js 15.3.4
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React 19

## 📦 インストール
```bash
npm install
```

## 🚀 開発サーバー起動
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセス

## 🌐 環境変数
`.env.local`ファイルを作成:
```bash
NEXT_PUBLIC_API_URL=https://stock-backend-production-4ff1.up.railway.app
```

## 📅 最新の更新
- 2025-07-05: AIトレーディングシグナル実装完了・Git自動デプロイ設定
- 2025-07-05: 市場アラートシステム・リアルタイム更新機能追加
- 2025-07-04: 高度な投資管理機能を追加（ポートフォリオ、ウォッチリスト、市場概況）
- 2025-07-04: Vercelデプロイ対応とRailwayバックエンド完全統合

## 🚀 デプロイ

### Vercel (推奨)
- **本番環境**: https://stock-frontend-clean.vercel.app
- **Git自動デプロイ**: mainブランチへのプッシュで自動ビルド・デプロイ
- **GitHub統合**: https://github.com/wanifuchi/stock-frontend.git と連携済み
- 環境変数はVercelダッシュボードで設定済み

### Railway バックエンド
- **API**: https://stock-backend-production-4ff1.up.railway.app
- フロントエンドからプロキシ経由でアクセス（CORS対応）

---

Created with ❤️ by Stock Advisor Team