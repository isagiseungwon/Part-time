#!/bin/bash
# 새 세션마다 도구를 다시 세운다.
# 이 컨테이너는 세션이 끝나면 사라지므로, 깃에 없는 것은 전부 여기서 다시 깔아야 한다.
set -euo pipefail

# 로컬(사용자 PC)에서는 건드리지 않는다 — 웹/원격 세션에서만 돈다.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# 1. 프로젝트 의존성 (api/ 가 @supabase/supabase-js 를 쓴다)
if [ ! -d node_modules ]; then
  npm install --no-audit --no-fund >/dev/null 2>&1 || true
fi

# 2. agent-browser CLI
#    .claude/skills/agent-browser 는 껍데기일 뿐이고, 실제 동작은 이 전역 CLI 가 한다.
#    깃에 담기지 않으므로 매 세션 다시 깔린다.
if ! command -v agent-browser >/dev/null 2>&1; then
  npm install -g agent-browser >/dev/null 2>&1 || true
fi

# 3. 크롬 경로
#    agent-browser install 은 googlechromelabs.github.io 를 받으러 가는데
#    이 환경의 네트워크 정책이 그 도메인을 막는다(403). 컨테이너에 이미 있는
#    Chromium 을 가리켜서 우회한다.
CHROME="$(ls -d /opt/pw-browsers/*/chrome-linux/chrome 2>/dev/null | head -1 || true)"
if [ -n "$CHROME" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export AGENT_BROWSER_EXECUTABLE_PATH=\"$CHROME\"" >> "$CLAUDE_ENV_FILE"
  echo "export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1" >> "$CLAUDE_ENV_FILE"
fi

echo "setup: node_modules $([ -d node_modules ] && echo ok || echo skip) · agent-browser $(command -v agent-browser >/dev/null 2>&1 && echo ok || echo missing) · chrome ${CHROME:-none}"
