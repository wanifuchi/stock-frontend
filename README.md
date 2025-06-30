# Stock Frontend - 次世代投資分析プラットフォーム

## 🚀 概要
AI駆動の次世代株式分析プラットフォームのフロントエンドアプリケーション。リアルタイムで正確な投資分析を提供します。

## ✨ 主な機能
- **強化分析エンジン**: 銘柄ごとに多様で現実的な分析結果
- **リアルタイム進行インジケータ**: API進行と完全同期
- **AIチャット機能**: 分析結果に関する質問に即座に回答
- **高速銘柄検索**: デバウンス機能付きのインテリジェント検索
- **美しいUI/UX**: shadcn/ui + Tailwind CSS v4

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
NEXT_PUBLIC_API_URL=http://localhost:8000
```

本番環境では適切なバックエンドURLを設定してください。

## 📅 最終更新
- 2025-06-30: UIバグ修正（AIチャット透過問題、再検索時の表示問題）
- 2025-06-30: 進行状況インジケータの大幅改善
- 2025-06-30: 強化分析エンジン統合

## 🚀 デプロイ
Vercelへの自動デプロイ対応済み。GitHubにプッシュすると自動的にビルド・デプロイされます。

---

Created with ❤️ by Stock Advisor Team