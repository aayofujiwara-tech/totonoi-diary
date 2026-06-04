# CLAUDE.md — ととログ 実装指示書

このファイルはClaude Codeへの実装指示です。
詳細な仕様は `ととログ_仕様書_v0.1.md` を参照してください。

---

## プロジェクト概要

**ととログ** — サウナととのい最適化アプリ  
サ活を記録し、ととのいやすい条件をデータから導き出すWebアプリ。

---

## リポジトリ

```
https://github.com/aayofujiwara-tech/totonoi-diary.git
```

---

## 技術スタック

| 項目 | 選定 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| DB / Auth | Supabase |
| ホスティング | Vercel |
| グラフ | Recharts |

---

## プロジェクト初期化手順

```bash
npx create-next-app@latest totonoi-diary \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd totonoi-diary
npm install @supabase/supabase-js @supabase/ssr recharts lucide-react
```

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # BottomNavを含む共通レイアウト
│   │   ├── home/page.tsx
│   │   ├── record/page.tsx     # 記録入力
│   │   ├── facilities/page.tsx # 施設マスタ
│   │   ├── dashboard/page.tsx  # 分析ダッシュボード
│   │   └── mypage/page.tsx
│   ├── layout.tsx
│   └── page.tsx                # ルート → /home にリダイレクト
├── components/
│   ├── ui/                     # 汎用UIコンポーネント
│   ├── record/                 # 記録入力フォームのパーツ
│   └── dashboard/              # グラフコンポーネント
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # クライアントサイドSupabase
│   │   └── server.ts           # サーバーサイドSupabase
│   └── types.ts                # 型定義
└── hooks/                      # カスタムフック
```

---

## 環境変数

`.env.local` に以下を設定すること：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Supabase — テーブル定義

以下のSQLをSupabaseのSQL Editorで実行すること。

```sql
-- facilities（施設マスタ）
create table facilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  address text,
  loyly boolean default false,
  notes text,
  created_at timestamptz default now()
);
alter table facilities enable row level security;
create policy "自分の施設のみ操作可" on facilities
  using (auth.uid() = user_id);

-- sessions（サ活ヘッダー）
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  facility_id uuid references facilities,
  visited_at timestamptz not null,
  totonoil_score int check (totonoil_score between 1 and 5),
  memo text,
  created_at timestamptz default now()
);
alter table sessions enable row level security;
create policy "自分のセッションのみ操作可" on sessions
  using (auth.uid() = user_id);

-- sets（セットごとの詳細）
create table sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions on delete cascade not null,
  set_number int not null,
  sauna_minutes int,
  cold_bath_seconds int,
  loyly boolean default false,
  rest_type text check (rest_type in ('outdoor', 'indoor', 'none'))
);
alter table sets enable row level security;
create policy "自分のセットのみ操作可" on sets
  using (
    exists (
      select 1 from sessions
      where sessions.id = sets.session_id
      and sessions.user_id = auth.uid()
    )
  );

-- conditions（コンディション）
create table conditions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions on delete cascade not null,
  sleep_hours float,
  physical_condition int check (physical_condition between 1 and 5),
  hunger_level text check (hunger_level in ('hungry', 'normal', 'full'))
);
alter table conditions enable row level security;
create policy "自分のコンディションのみ操作可" on conditions
  using (
    exists (
      select 1 from sessions
      where sessions.id = conditions.session_id
      and sessions.user_id = auth.uid()
    )
  );
```

---

## 型定義（src/lib/types.ts）

```typescript
export type Facility = {
  id: string
  user_id: string
  name: string
  address?: string
  loyly: boolean
  notes?: string
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  facility_id?: string
  visited_at: string
  totonoil_score: number
  memo?: string
  created_at: string
  facility?: Facility
  sets?: Set[]
  condition?: Condition
}

export type Set = {
  id: string
  session_id: string
  set_number: number
  sauna_minutes?: number
  cold_bath_seconds?: number
  loyly: boolean
  rest_type: 'outdoor' | 'indoor' | 'none'
}

export type Condition = {
  id: string
  session_id: string
  sleep_hours?: number
  physical_condition?: number
  hunger_level?: 'hungry' | 'normal' | 'full'
}
```

---

## 画面ごとの実装指示

### 1. ホーム（/home）
- 直近5件のサ活記録をカード表示（施設名・日付・ととのい度★）
- 「サ活を記録する」ボタン → /record へ遷移
- ととのい度の7日間推移をミニグラフで表示

### 2. 記録入力（/record）
- ステップ形式（Step1: 施設 → Step2: コンディション → Step3: セット入力 → Step4: 結果）
- セット入力は「+セット追加」ボタンで最大5セットまで動的追加
- 全ステップ完了後にSupabaseへ一括insert（sessions + sets + conditions）

### 3. 施設マスタ（/facilities）
- 施設一覧（名前・löyly有無・平均ととのい度）
- 施設追加モーダル
- タップで施設詳細（過去の訪問履歴・平均スコア）

### 4. 分析ダッシュボード（/dashboard）
- Rechartsで以下を実装：
  - `LineChart`: ととのい度の時系列推移
  - `ScatterChart`: ととのい度 × 水風呂時間
  - `ScatterChart`: ととのい度 × 睡眠時間
  - `BarChart`: 施設別平均ととのい度
- 「あなたのベスト条件」テキストは記録データから算出して表示
  - 例：「水風呂 90〜120秒・睡眠 7h以上・löylyありの日はととのい度が平均4.2」

### 5. マイページ（/mypage）
- 累計サ活回数・総セット数・平均ととのい度
- ログアウトボタン

---

## ナビゲーション

スマホ対応のボトムナビゲーションを実装すること。

```
🏠 ホーム | ✍️ 記録 | 🏢 施設 | 📊 分析 | 👤 マイページ
```

---

## UIデザイン方針

- カラーテーマ：ダーク系（サウナの雰囲気）、アクセントは琥珀色（`#D4853A`）
- フォント：日本語対応（Noto Sans JP）
- モバイルファースト（最大幅 430px 中心、PCでも崩れないよう対応）
- 入力操作はタップ主体で設計（スライダー・トグル・星評価など）

---

## 実装順序（推奨）

1. `npx create-next-app` でプロジェクト作成
2. Supabase プロジェクト作成 → SQL実行 → `.env.local` 設定
3. Supabase Auth（メールログイン）実装
4. 施設マスタCRUD
5. 記録入力フォーム（ステップ形式）
6. ホーム画面（一覧表示）
7. 分析ダッシュボード（Recharts）
8. マイページ
9. Vercelデプロイ

---

## 注意事項

- RLSポリシーを必ず有効にし、他ユーザーのデータが見えないようにすること
- Supabase SSRパッケージ（`@supabase/ssr`）を使い、App Routerのサーバーコンポーネントでも認証状態を扱えるようにすること
- セット入力は動的なので `useFieldArray`（react-hook-form）か `useState` で管理すること
