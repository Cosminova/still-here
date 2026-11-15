#!/bin/zsh
# Usage: START=630 scripts/_render-resume.sh SHOT END_FRAME [flags...]
# Renders frames START..END_FRAME-1 of SHOT as a slice (frames kept, no
# encode), resuming after crashes and killing the renderer when no new frame
# has appeared for 90 s (Chrome sometimes hangs rather than dies).
shot=$1; total=$2; shift 2
start=${START:-0}
dir=video/$shot-frames
mkdir -p $dir
for attempt in $(seq 1 20); do
  n=$((start + $(ls $dir | wc -l | tr -d ' ')))
  [ "$n" -ge "$total" ] && break
  # --to keeps every run a slice, so nothing wipes the frames or encodes.
  caffeinate -i node scripts/render-video.mjs $shot "$@" --from $n --to $total > video/logs/$shot-rest.log 2>&1 &
  pid=$!
  last=$n; still=0
  while kill -0 $pid 2>/dev/null; do
    sleep 10
    now=$(ls $dir | wc -l | tr -d ' ')
    if [ "$now" = "$last" ]; then still=$((still + 10)); else still=0; last=$now; fi
    if [ $still -ge 90 ]; then pkill -P $pid; kill $pid 2>/dev/null; pkill -f -- "--from $n --to"; break; fi
  done
  wait $pid 2>/dev/null
done
echo "frames $((start + $(ls $dir | wc -l | tr -d ' ')))/$total"
