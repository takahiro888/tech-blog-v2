import "server-only"

// 必須の環境変数を読む。未設定なら、どの変数が足りないか分かるエラーにする
export function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`環境変数 ${name} が設定されていません`)
  }
  return value
}