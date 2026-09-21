#!/usr/bin/env bash
# サブカルポップBGMコンポーザー ローカルサーバー起動スクリプト

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT=8080
while lsof -i :$PORT >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo "========================================================"
echo " 🍹 サブカルポップBGMコンポーザー を起動しています..."
echo " ローカルURL: http://localhost:$PORT"
echo " 終了するには Ctrl+C を押してください。"
echo "========================================================"

if command -v xdg-open >/dev/null 2>&1; then
  (sleep 1 && xdg-open "http://localhost:$PORT") &
fi

python3 -m http.server "$PORT"
