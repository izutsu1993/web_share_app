# クラシルメモ - Web Share Target API PWA

クラシルのレシピにメモを追加できるPWAアプリケーションです。

## 機能

- Web Share Target APIを使用したレシピURLの共有受信
- Firebase Firestoreを使用したメモの保存・管理
- 匿名認証によるユーザー管理
- PWA対応（ホーム画面に追加可能）

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Firebase (Firestore, Authentication)
- **PWA**: Web Share Target API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebaseプロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成
2. Authenticationを有効化し、匿名認証を許可
3. Firestore Databaseを作成
4. Webアプリを追加し、設定値を取得

### 3. 環境変数の設定

`.env.local.example`を`.env.local`にコピーし、Firebaseの設定値を入力してください。

```bash
cp .env.local.example .env.local
```

### 4. Firestoreセキュリティルールの設定

Firebase ConsoleのFirestore Database > ルールで以下を設定：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memos/{memoId} {
      // 読み取り: 認証済みで、自分のメモのみ
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // 作成: 認証済みで、自分のuserIdを設定している場合
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      
      // 更新: 認証済みで、既存のドキュメントのuserIdと一致する場合
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // 削除: 認証済みで、自分のメモのみ
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4-1. Firestoreインデックスの作成

Firestore Database > インデックスで以下の複合インデックスを作成してください：

- **コレクションID**: `memos`
- **フィールド**: 
  - `userId` (昇順)
  - `updatedAt` (降順)

エラーが発生した場合は、Firebase Consoleのエラーメッセージに表示されるリンクから自動的にインデックスを作成することもできます。

### 5. PWAアイコンの準備

`public/icons/`ディレクトリに以下のアイコンを配置してください：
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

### 6. ローカルHTTPS環境のセットアップ（Web Share Target API用）

Web Share Target APIはHTTPS環境でのみ動作するため、ローカル開発でもHTTPSを有効にする必要があります。

#### mkcertを使用した証明書生成（推奨）

**方法1: npmスクリプトを使用（簡単）**

```bash
# mkcertをインストール（Homebrew使用）
brew install mkcert

# 証明書を自動生成
npm run setup:https
```

**方法2: 手動で実行**

```bash
# mkcertをインストール（Homebrew使用）
brew install mkcert

# ローカルCAを作成
mkcert -install

# 証明書を生成（プロジェクトルートで実行）
mkcert localhost 127.0.0.1 ::1
```

これで`localhost+2.pem`と`localhost+2-key.pem`が生成されます。

#### その他の方法

- **ngrok**: `npm run dev`で起動後、別ターミナルで`ngrok http 3000`を実行
- **Cloudflare Tunnel**: `cloudflared tunnel --url http://localhost:3000`

### 7. 開発サーバーの起動

#### HTTPで起動（通常の開発用）

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

#### HTTPSで起動（Web Share Target APIテスト用）

```bash
npm run dev:https
```

ブラウザで [https://localhost:3000](https://localhost:3000) を開きます。

**注意**: 証明書ファイル（`localhost+2.pem`と`localhost+2-key.pem`）が存在しない場合は、先にmkcertで証明書を生成してください。

## 使用方法

### PWAとしてインストール

1. HTTPSで開発サーバーを起動（`npm run dev:https`）
2. ブラウザで `https://localhost:3000` にアクセス
3. ブラウザの「ホーム画面に追加」または「インストール」を選択
4. アプリがインストールされます

**重要**: Web Share Target APIをテストするには、HTTPS環境（`npm run dev:https`）で起動し、PWAとしてインストールする必要があります。

### メモの追加

1. クラシルのレシピページを開く
2. ブラウザの「共有」ボタンをタップ
3. 「クラシルメモ」アプリを選択
4. メモを入力して保存

### メモの編集

1. ホーム画面で保存済みのメモをタップ
2. メモを編集して保存

## デプロイ

### Vercelへのデプロイ（推奨）

1. [Vercel](https://vercel.com)にプロジェクトをインポート
2. 環境変数を設定
3. デプロイ

### その他のプラットフォーム

Next.jsアプリとしてデプロイ可能なプラットフォームであれば動作します。

## 注意事項

- Web Share Target APIはHTTPS環境でのみ動作します
- PWAとしてインストールする必要があります
- 匿名認証を使用しているため、デバイスを変更するとメモにアクセスできなくなります

## ライセンス

MIT

