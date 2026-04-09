#!/bin/bash
# Create demo video from generated frames

cd /tmp/demo_frames

# Duplicate frames for 2 second display each (50 frames at 25fps = 2 seconds per slide)
for i in $(seq 1 5); do
  num=$(printf "%03d" $i)
  for j in $(seq 1 50); do
    cp frame_${num}.png frame_${num}_$(printf "%03d" $j).png
  done
done

# Create video
ffmpeg -y -framerate 25 \
  -pattern_type glob -i 'frame_*_*.png' \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -preset medium \
  -crf 23 \
  /home/markm/software-engineering-toolkit/se-toolkit-hackathon/demo.mp4

echo "✅ Demo video created: demo.mp4"
ls -lh /home/markm/software-engineering-toolkit/se-toolkit-hackathon/demo.mp4
