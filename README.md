# プリント管理 - 学校プリント自動カレンダー登録アプリ

写真を撮るだけで、学校のプリントからイベント情報を読み取り、Googleカレンダーに自動登録するWebアプリです。

## セットアップ手順

### 1. Google Cloud Console でOAuthクライアントIDを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」
4. アプリケーションの種類：「ウェブアプリケーション」
5. 承認済みリダイレクトURI に以下を追加：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. 作成後、**クライアントID** と **クライアントシークレット** をメモ

### 2. Google Calendar API を有効化

1. Google Cloud Console で「APIとサービス」→「ライブラリ」
2. 「Google Calendar API」を検索して有効化

### 3. Gemini API キーを取得

1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. 「Get API Key」→「Create API Key」
3. APIキーをメモ

### 4. 環境変数を設定

`.env.local` ファイルをプロジェクトルートに作成：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here
GOOGLE_CLIENT_ID=上でメモしたクライアントID
GOOGLE_CLIENT_SECRET=上でメモしたクライアントシークレット
GEMINI_API_KEY=上でメモしたGemini APIキー
```

`NEXTAUTH_SECRET` は任意の文字列でOKです（例：`openssl rand -base64 32` で生成）。

### 5. 起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 技術スタック

- Next.js 14 (App Router)
- Tailwind CSS
- NextAuth.js v5 (Google OAuth)
- Google Gemini 1.5 Flash API
- Google Calendar API v3
