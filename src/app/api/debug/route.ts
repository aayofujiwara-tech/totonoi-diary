import { NextResponse } from 'next/server'

// 一時的なデバッグエンドポイント：環境変数の先頭4文字だけ返す
// 確認後は削除すること
export function GET() {
  const peek = (v: string | undefined) =>
    v && v.length > 0 ? `${v.slice(0, 4)}… (len=${v.length})` : '(empty/unset)'

  return NextResponse.json({
    NEXT_PUBLIC_FIREBASE_API_KEY: peek(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: peek(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: peek(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: peek(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: peek(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    NEXT_PUBLIC_FIREBASE_APP_ID: peek(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    _note: 'NEXT_PUBLIC_ vars are inlined at build time. Server reads them at runtime here.',
  })
}
