# pms

課長1人運用向けの業績管理MVPです。ブラウザで動くシンプルなWebアプリを含みます。

## 起動方法

```bash
cd app
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## 機能

- 月次実績入力（売上 / 原価 / 受注 / 内注 / メモ）
- 粗利・粗利率の自動計算
- 最新月ダッシュボード表示
- 前月比の簡易表示
- 履歴一覧表示
- CSV出力
- データ永続化（localStorage）


## 画面モック

完成イメージ確認用に `app/mock.html` を追加しています。

```bash
cd app
python3 -m http.server 8000
# http://localhost:8000/mock.html を開く
```

## HTMLだけで手っ取り早く確認する

サーバーを立てずに、`app/quick-check.html` をブラウザで直接開くだけで確認できます。

- 入力
- ダッシュボード
- 履歴表示

を1ファイルで試せます。

## ダウンロード用パッケージ

PRツールの制約でZIPバイナリはGit管理せず、ローカル生成方式にしています。

```bash
python3 scripts/build_delivery.py
```

生成物:
- `deliverables/pms-html-mvp.zip`
- SHA-256 はスクリプト実行時に表示

ZIPを展開して `app/quick-check.html` を開けば、サーバーなしですぐ確認できます。
