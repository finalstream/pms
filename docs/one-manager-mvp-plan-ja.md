# 課長1人運用向け 業績管理Webアプリ初期設計

## 1. 目的
課長が毎月の業績を自分で入力し、即座に振り返りできる最小構成（MVP）を作る。
将来的に全社展開できるよう、データ構造はマルチユーザー前提で設計する。

## 2. 対象KPI（初期）
ユーザー指定の5指標を初期KPIとして採用する。

- 売上（revenue）
- 原価（cost）
- 粗利（gross_profit）
- 受注（orders_received）
- 内注（internal_orders）

### 2.1 指標定義
- **売上**: 当月の売上金額
- **原価**: 売上に対する原価総額
- **粗利**: 売上 - 原価（自動計算優先。必要時のみ手入力上書き可）
- **受注**: 当月に受注した件数または金額（運用で固定）
- **内注**: 社内からの受注件数または金額（運用で固定）

> 受注/内注は「件数」または「金額」で単位がぶれやすいため、KPI定義で unit を固定する。

## 3. 画面（MVP）

1. ダッシュボード
   - 当月実績（5指標）
   - 前月比（% / 差分）
   - 粗利率（粗利 ÷ 売上）

2. 実績入力
   - 月を選択して入力
   - メモ（特記事項）
   - 保存時に粗利を自動計算

3. 履歴一覧
   - 月次で時系列表示
   - CSV出力

## 4. データモデル（将来拡張対応）

```sql
-- 会社
create table companies (
  id uuid primary key,
  name text not null
);

-- 部門（課）
create table departments (
  id uuid primary key,
  company_id uuid not null references companies(id),
  name text not null
);

-- ユーザー
create table users (
  id uuid primary key,
  company_id uuid not null references companies(id),
  department_id uuid not null references departments(id),
  display_name text not null,
  role text not null check (role in ('admin','manager','member'))
);

-- KPI定義
create table kpis (
  id uuid primary key,
  company_id uuid not null references companies(id),
  code text not null,
  name text not null,
  unit text not null,
  unique (company_id, code)
);

-- 月次実績
create table monthly_performances (
  id uuid primary key,
  company_id uuid not null references companies(id),
  department_id uuid not null references departments(id),
  user_id uuid not null references users(id),
  target_month date not null,
  revenue numeric(14,2) not null default 0,
  cost numeric(14,2) not null default 0,
  gross_profit numeric(14,2) not null default 0,
  orders_received numeric(14,2) not null default 0,
  internal_orders numeric(14,2) not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, department_id, user_id, target_month)
);
```

## 5. 計算ルール（初期）
- 粗利 = 売上 - 原価
- 粗利率 = 粗利 / 売上（売上が0のとき0%）
- 前月比 = (当月 - 前月) / 前月

## 6. 2週間実装タスク

### Week 1
- 画面モック（ダッシュボード/入力/履歴）
- DB作成
- 実績入力API + 一覧API

### Week 2
- 集計API（前月比・粗利率）
- CSV出力
- バリデーション/エラーハンドリング

## 7. 運用ルール（1人運用時）
- 毎月初営業日に前月実績を入力
- 更新履歴として note に理由を残す
- 受注/内注の単位を運用開始時に固定する

