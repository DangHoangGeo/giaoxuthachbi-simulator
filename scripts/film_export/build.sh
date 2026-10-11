#!/bin/sh
# Joins the pictures and sound collected by receiver.py into one MP4 for
# sharing: H.264 (yuv420p, limited range, BT.709, high profile, at most
# 12 Mbit/s) and AAC, 1920 × 1080, constant frame rate, "faststart". These
# settings are accepted by X and Instagram.
#
# Usage: scripts/film_export/build.sh <export folder> [film] [output.mp4] [sound lead in seconds]
#   film         the film's name in the viewer: full (default, the five-minute film),
#                lighting, air, sound or grid
#   sound lead   seconds of the sound recording before film time zero; read
#                from <film>-export.json when it was recorded in the same run
set -eu
dir=$1
film=${2:-full}
out=${3:-$dir/thach-bi-$film.mp4}
info="$dir/$film-export.json"
read_info() { python3 -c "import json,sys; v=json.load(open(sys.argv[1])).get(sys.argv[2]); print(v if v is not None else '')" "$info" "$1"; }
fps=$(read_info fps)
frames=$(read_info frames)
lead=${4:-$(read_info soundLead)}
lead=${lead:-0}
sound=$(ls "$dir/$film-sound".* | head -1)
found=$(ls "$dir/$film-frames" | wc -l | tr -d ' ')
[ "$found" = "$frames" ] || { echo "Expected $frames pictures, found $found" >&2; exit 1; }
seconds=$(python3 -c "print($frames / $fps)")
ffmpeg -hide_banner -loglevel warning -y \
  -framerate "$fps" -i "$dir/$film-frames/%05d.jpg" \
  -ss "$lead" -i "$sound" \
  -map 0:v -map 1:a \
  -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 20 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -r "$fps" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 \
  -t "$seconds" -movflags +faststart "$out"
echo "Wrote $out"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of default=nw=1 "$out"
