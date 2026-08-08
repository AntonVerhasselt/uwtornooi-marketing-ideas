#!/bin/bash
# Orchestrate: rescue scrape → wait analyze → merge → delta analyze → cluster → commit/push
set -euo pipefail
ROOT="/Users/antonverhasselt/Documents/uwtornooi-marketing-ideas"
cd "$ROOT"
LOG="/tmp/finalize-intel-db.log"
exec >>"$LOG" 2>&1
echo "=== finalize start $(date) ==="

SCRAPE_PID=23158
ANALYZE_PID=50949
TERM_SCRAPE="/Users/antonverhasselt/.cursor/projects/Users-antonverhasselt-Documents-uwtornooi-marketing-ideas/terminals/177769.txt"
TERM_ANALYZE="/Users/antonverhasselt/.cursor/projects/Users-antonverhasselt-Documents-uwtornooi-marketing-ideas/terminals/404221.txt"
RESCUE_DIR=""
MERGED_SCRAPE=""

load_env() {
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
  export SQLITE_PATH="$ROOT/data/tournament-intel.db"
  if [ -z "${OPENAI_API_KEY:-}" ]; then
    echo "ERROR: OPENAI_API_KEY missing"
    exit 1
  fi
}

rescue_scrape_while_alive() {
  echo "=== rescue_scrape $(date) ==="
  kill -STOP "$SCRAPE_PID" 2>/dev/null || true
  # parent tsx too if present
  local ppid
  ppid=$(ps -p "$SCRAPE_PID" -o ppid= | tr -d ' ')
  kill -STOP "$ppid" 2>/dev/null || true
  sleep 0.4

  local stamp
  stamp=$(date +%Y%m%d-%H%M%S)
  RESCUE_DIR="$ROOT/data/scrape-rescue-finish-$stamp"
  mkdir -p "$RESCUE_DIR"
  local out="$RESCUE_DIR/main-from-fd.db"

  cp -p "$ROOT/data/recovery-auto-2026-08-08T12-04-08-209Z/tournament-intel.db-wal" "$RESCUE_DIR/" 2>/dev/null || true
  cp -p "$ROOT/data/recovery-auto-2026-08-08T12-04-08-209Z/tournament-intel.db-shm" "$RESCUE_DIR/" 2>/dev/null || true

  # FD 27 = orphan main (verified via lsof)
  lldb -p "$SCRAPE_PID" -b \
    -o "expr -- long total = 0; void *buf = (void *)malloc((size_t)1048576); int outfd = (int)open(\"$out\", 1537, 0644); if (outfd >= 0 && buf) { long n = 0; while ((n = (long)read(27, buf, (size_t)1048576)) > 0) { (void)write(outfd, buf, (size_t)n); total += n; } (void)close(outfd); (void)lseek(27, (long long)0, 0); } total" \
    -o detach -o quit

  echo "rescued bytes: $(stat -f%z "$out" 2>/dev/null || echo 0)"

  # Build checkpointed scrape DB
  local build="$RESCUE_DIR/build"
  mkdir -p "$build"
  cp "$out" "$build/tournament-intel.db"
  cp "$RESCUE_DIR/tournament-intel.db-wal" "$build/tournament-intel.db-wal" 2>/dev/null || true
  cp "$RESCUE_DIR/tournament-intel.db-shm" "$build/tournament-intel.db-shm" 2>/dev/null || true

  python3 - <<PY
import sqlite3, os
build = "$build"
main = os.path.join(build, "tournament-intel.db")
c = sqlite3.connect(main)
c.execute("pragma busy_timeout=5000")
print("integrity", c.execute("pragma integrity_check").fetchone()[0])
try:
    print("checkpoint", c.execute("pragma wal_checkpoint(TRUNCATE)").fetchone())
except Exception as e:
    print("checkpoint err", e)
cands = c.execute("select count(*) from candidate_posts").fetchone()[0]
logs = c.execute("select count(*) from scrape_logs").fetchone()[0]
print("scrape_rescue cands", cands, "logs", logs)
print("final integrity", c.execute("pragma integrity_check").fetchone()[0])
c.close()
for side in ("-wal", "-shm"):
    p = main + side
    if os.path.exists(p):
        os.remove(p)
print("ok", main)
PY

  MERGED_SCRAPE="$RESCUE_DIR/scrape-merged.db"
  cp "$build/tournament-intel.db" "$MERGED_SCRAPE"
  echo "$MERGED_SCRAPE" > /tmp/finalize-scrape-merged.path
  echo "$RESCUE_DIR" > /tmp/finalize-rescue-dir.path

  kill -CONT "$ppid" 2>/dev/null || true
  kill -CONT "$SCRAPE_PID" 2>/dev/null || true
  echo "=== scrape resumed after rescue $(date) ==="
}

echo "Waiting for scrape finish line or exit..."
RESCUED=0
for i in $(seq 1 720); do
  if ! ps -p "$SCRAPE_PID" >/dev/null 2>&1; then
    echo "Scrape already exited before rescue — check if orphan lost"
    if [ -f /tmp/finalize-scrape-merged.path ]; then
      MERGED_SCRAPE=$(cat /tmp/finalize-scrape-merged.path)
      RESCUED=1
    else
      # Try last-known recovery WAL + any remaining named main in recovery
      echo "Attempting late recovery from recovery-auto folder"
      RESCUE_DIR="$ROOT/data/scrape-rescue-finish-late-$(date +%Y%m%d-%H%M%S)"
      mkdir -p "$RESCUE_DIR"
      if [ -f "$ROOT/data/recovery-auto-2026-08-08T12-04-08-209Z/tournament-intel.db" ]; then
        cp -p "$ROOT/data/recovery-auto-2026-08-08T12-04-08-209Z/"* "$RESCUE_DIR/" || true
        python3 - <<PY
import sqlite3, os, shutil
d="$RESCUE_DIR"
main=os.path.join(d,"tournament-intel.db")
c=sqlite3.connect(main)
print("late integrity", c.execute("pragma integrity_check").fetchone()[0])
try: print("ckpt", c.execute("pragma wal_checkpoint(TRUNCATE)").fetchone())
except Exception as e: print(e)
print("cands", c.execute("select count(*) from candidate_posts").fetchone()[0])
c.close()
for side in ("-wal","-shm"):
  p=main+side
  if os.path.exists(p): os.remove(p)
out=os.path.join(d,"scrape-merged.db")
shutil.copy2(main,out)
print(out)
open("/tmp/finalize-scrape-merged.path","w").write(out)
PY
        MERGED_SCRAPE=$(cat /tmp/finalize-scrape-merged.path)
        RESCUED=1
      else
        echo "FATAL: scrape exited and no rescue possible"
        exit 2
      fi
    fi
    break
  fi

  if [ "$RESCUED" -eq 0 ] && rg -q 'Candidate posts in DB:' "$TERM_SCRAPE" 2>/dev/null; then
    echo "Detected scrape finish line"
    rescue_scrape_while_alive
    RESCUED=1
    # wait for exit
    for j in $(seq 1 180); do
      ps -p "$SCRAPE_PID" >/dev/null 2>&1 || break
      sleep 2
    done
    echo "scrape process: $(ps -p "$SCRAPE_PID" >/dev/null 2>&1 && echo still_alive || echo exited)"
    break
  fi

  # Near end: if 86/86 seen and idle for a bit, keep waiting for finish line
  sleep 15
done

if [ "$RESCUED" -eq 0 ]; then
  echo "Timeout waiting for scrape — forcing rescue while alive"
  if ps -p "$SCRAPE_PID" >/dev/null 2>&1; then
    rescue_scrape_while_alive
    RESCUED=1
  fi
fi

MERGED_SCRAPE=$(cat /tmp/finalize-scrape-merged.path)
echo "Scrape merged DB: $MERGED_SCRAPE"

echo "Waiting for analyze to finish..."
for i in $(seq 1 720); do
  if ! ps -p "$ANALYZE_PID" >/dev/null 2>&1; then
    echo "Analyze exited $(date)"
    break
  fi
  # also detect Done in log
  if rg -q '^Done\.|^DB totals' "$TERM_ANALYZE" 2>/dev/null && ! ps -p "$ANALYZE_PID" >/dev/null 2>&1; then
    break
  fi
  sleep 20
done

if ps -p "$ANALYZE_PID" >/dev/null 2>&1; then
  echo "WARN: analyze still running after wait — continuing to wait more"
  while ps -p "$ANALYZE_PID" >/dev/null 2>&1; do sleep 30; done
fi

tail -40 "$TERM_ANALYZE" || true

# Checkpoint analyze DB
load_env
python3 - <<'PY'
import sqlite3
p="/Users/antonverhasselt/Documents/uwtornooi-marketing-ideas/data/tournament-intel.db"
c=sqlite3.connect(p)
c.execute("pragma busy_timeout=5000")
try: print("analyze ckpt", c.execute("pragma wal_checkpoint(TRUNCATE)").fetchone())
except Exception as e: print("ckpt", e)
print("analyzed", c.execute("select analyzed,count(*) from candidate_posts group by 1").fetchall())
print("posts", c.execute("select count(*) from posts").fetchone()[0])
print("tournaments", c.execute("select count(*) from tournaments").fetchone()[0])
print("integrity", c.execute("pragma integrity_check").fetchone()[0])
c.close()
PY

echo "=== merge dry-run $(date) ==="
npx tsx scripts/merge-candidate-posts.ts --from="$MERGED_SCRAPE" --dry-run | tee /tmp/finalize-merge-dry-run.log

echo "=== merge real $(date) ==="
npx tsx scripts/merge-candidate-posts.ts --from="$MERGED_SCRAPE" | tee /tmp/finalize-merge-real.log

echo "=== delta analyze $(date) ==="
npm run intel:analyze | tee /tmp/finalize-delta-analyze.log

echo "=== cluster $(date) ==="
npm run intel:cluster | tee /tmp/finalize-cluster.log

# Sync working.db for Next
cp -p "$ROOT/data/tournament-intel.db" "$ROOT/data/tournament-intel.working.db"
rm -f "$ROOT/data/tournament-intel.working.db-wal" "$ROOT/data/tournament-intel.working.db-shm" 2>/dev/null || true

python3 - <<'PY'
import sqlite3
c=sqlite3.connect("/Users/antonverhasselt/Documents/uwtornooi-marketing-ideas/data/tournament-intel.db")
print("FINAL candidates", c.execute("select count(*) from candidate_posts").fetchone()[0])
print("FINAL analyzed", c.execute("select count(*) from candidate_posts where analyzed=1").fetchone()[0])
print("FINAL unanalyzed", c.execute("select count(*) from candidate_posts where analyzed=0").fetchone()[0])
print("FINAL posts", c.execute("select count(*) from posts").fetchone()[0])
print("FINAL tournaments", c.execute("select count(*) from tournaments").fetchone()[0])
print("FINAL events", c.execute("select count(*) from tournament_events").fetchone()[0])
print("FINAL upcoming", c.execute("select count(*) from tournament_events where start_date is not null and start_date >= date('now')").fetchone()[0])
PY

echo "=== commit push $(date) ==="
git add data/tournament-intel.db scripts/merge-candidate-posts.ts scripts/finalize-intel-db.sh
if git diff --cached --quiet; then
  echo "Nothing to commit"
else
  git commit -m "$(cat <<'EOF'
Finalize intel DB: merge rescued scrape with analyzed posts and cluster events.

EOF
)"
  git push origin HEAD
  echo "Pushed $(git rev-parse --short HEAD)"
fi

echo "=== finalize done $(date) ==="
echo DONE > /tmp/finalize-intel-db.done
