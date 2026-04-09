#!/usr/bin/env python3
"""Create demo video from frames using ffmpeg."""
import subprocess
import os
from PIL import Image

FRAMES_DIR = '/tmp/demo_frames'
OUTPUT = '/home/markm/software-engineering-toolkit/se-toolkit-hackathon/demo.mp4'
TMP_VIDEO = '/tmp/video_frames'

os.makedirs(TMP_VIDEO, exist_ok=True)

# Duplicate each frame 50 times (2 seconds at 25fps)
for i in range(1, 6):
    src = os.path.join(FRAMES_DIR, f'frame_{i:03d}.png')
    img = Image.open(src)
    for j in range(1, 51):
        dst = os.path.join(TMP_VIDEO, f'frame_{i:03d}_{j:03d}.png')
        if not os.path.exists(dst):
            img.save(dst)

print(f"✅ Generated {5*50} video frames")

# Create video with ffmpeg
cmd = [
    'ffmpeg', '-y', '-framerate', '25',
    '-pattern_type', 'glob', '-i', f'{TMP_VIDEO}/frame_*_*.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '23',
    OUTPUT
]

print(f"Running ffmpeg: {' '.join(cmd[:6])}...")
result = subprocess.run(cmd, capture_output=True, text=True)

if result.returncode == 0:
    size = os.path.getsize(OUTPUT) / (1024*1024)
    print(f"✅ Demo video created: {OUTPUT}")
    print(f"   Size: {size:.1f} MB")
    print(f"   Duration: ~10 seconds (5 slides × 2 sec)")
else:
    print(f"❌ ffmpeg error: {result.stderr[-500:]}")
