#!/usr/bin/env python3
"""Generate demo video frames for Feedback Collector."""

from PIL import Image, ImageDraw, ImageFont
import os

WIDTH, HEIGHT = 1920, 1080
OUT_DIR = '/tmp/demo_frames'
os.makedirs(OUT_DIR, exist_ok=True)

def get_font(size):
    """Try to get a good font, fall back to default."""
    for font_path in ['/usr/share/fonts/TTF/Inter-Bold.ttf',
                      '/usr/share/fonts/TTF/Inter-Regular.ttf',
                      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(font_path):
            return ImageFont.truetype(font_path, size)
    return ImageFont.load_default()

def draw_bg(draw, color1, color2):
    """Draw gradient background."""
    for y in range(HEIGHT):
        r = int(color1[0] + (color2[0] - color1[0]) * y / HEIGHT)
        g = int(color1[1] + (color2[1] - color1[1]) * y / HEIGHT)
        b = int(color1[2] + (color2[2] - color1[2]) * y / HEIGHT)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

def add_text(draw, text, x, y, size, color, bold=False):
    """Add text with shadow."""
    font = get_font(size)
    # Shadow
    draw.text((x+3, y+3), text, fill=(0,0,0,128), font=font)
    draw.text((x, y), text, fill=color, font=font)

def add_rounded_rect(draw, x, y, w, h, radius, fill_color, border_color=None):
    """Draw a rounded rectangle."""
    draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=fill_color)
    if border_color:
        draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, outline=border_color, width=2)

def create_slide_1():
    """Slide 1: Open the Feedback Collector website."""
    img = Image.new('RGB', (WIDTH, HEIGHT), (248, 249, 250))
    draw = ImageDraw.Draw(img)
    draw_bg(draw, (240, 245, 255), (248, 249, 250))
    
    # Title
    add_text(draw, "Step 1: Open Feedback Collector", 100, 80, 56, (13, 110, 253), True)
    
    # Browser mock
    add_rounded_rect(draw, 100, 180, 1720, 800, 15, (255, 255, 255), (222, 226, 230))
    
    # Browser bar
    add_rounded_rect(draw, 100, 180, 1720, 60, 15, (233, 236, 239))
    draw.rounded_rectangle([100, 225, 1820, 240], radius=0, fill=(233, 236, 239))
    draw.ellipse([(130, 200), (150, 220)], fill=(220, 53, 69))
    draw.ellipse([(165, 200), (185, 220)], fill=(255, 193, 7))
    draw.ellipse([(200, 200), (220, 220)], fill=(40, 167, 69))
    add_rounded_rect(draw, 260, 195, 1400, 30, 8, (255, 255, 255), (222, 226, 230))
    add_text(draw, "http://10.93.26.81:3000", 280, 200, 16, (108, 117, 125))
    
    # Nav bar
    add_rounded_rect(draw, 100, 240, 1720, 60, 0, (13, 110, 253))
    add_text(draw, "💬 Feedback Collector", 130, 250, 32, (255, 255, 255), True)
    add_text(draw, "Submit Feedback", 1500, 252, 20, (255, 255, 255))
    add_text(draw, "Dashboard", 1700, 252, 20, (255, 255, 255))
    
    # Form area
    add_text(draw, "📝 Share Your Feedback", 400, 340, 40, (49, 52, 56), True)
    
    # Form fields
    fields = [
        ("Your Name", "John Doe"),
        ("Email", "john@example.com"),
        ("Your Feedback *", "Tell us about your experience..."),
    ]
    y = 420
    for label, placeholder in fields:
        add_text(draw, label, 400, y, 22, (49, 52, 56), True)
        add_rounded_rect(draw, 400, y+35, 1120, 55, 8, (255, 255, 255), (206, 212, 218))
        add_text(draw, placeholder, 420, y+42, 18, (108, 117, 125))
        y += 110
    
    # Star rating
    add_text(draw, "Rating *", 400, y+10, 22, (49, 52, 56), True)
    for i in range(5):
        draw.text((400 + i*55, y+40), "★", fill=(255, 193, 7), font=get_font(48))
    y += 120
    
    # Submit button
    add_rounded_rect(draw, 400, y+20, 1120, 60, 10, (13, 110, 253))
    add_text(draw, "📤 Submit Feedback", 550, y+28, 28, (255, 255, 255), True)
    
    img.save(f'{OUT_DIR}/frame_001.png')

def create_slide_2():
    """Slide 2: Customer submits feedback."""
    img = Image.new('RGB', (WIDTH, HEIGHT), (248, 249, 250))
    draw = ImageDraw.Draw(img)
    draw_bg(draw, (240, 245, 255), (248, 249, 250))
    
    add_text(draw, "Step 2: Customer Submits Feedback", 100, 80, 56, (25, 135, 84), True)
    
    # Browser mock
    add_rounded_rect(draw, 100, 180, 1720, 800, 15, (255, 255, 255), (222, 226, 230))
    add_rounded_rect(draw, 100, 180, 1720, 60, 15, (233, 236, 239))
    draw.rounded_rectangle([100, 225, 1820, 240], radius=0, fill=(233, 236, 239))
    draw.ellipse([(130, 200), (150, 220)], fill=(220, 53, 69))
    draw.ellipse([(165, 200), (185, 220)], fill=(255, 193, 7))
    draw.ellipse([(200, 200), (220, 220)], fill=(40, 167, 69))
    
    add_rounded_rect(draw, 100, 240, 1720, 60, 0, (13, 110, 253))
    add_text(draw, "💬 Feedback Collector", 130, 250, 32, (255, 255, 255), True)
    
    # Filled form
    add_text(draw, "📝 Share Your Feedback", 400, 340, 40, (49, 52, 56), True)
    
    # Filled fields
    filled_data = [
        ("Your Name", "Alice Johnson"),
        ("Email", "alice@cafe-review.com"),
    ]
    y = 420
    for label, value in filled_data:
        add_text(draw, label, 400, y, 22, (49, 52, 56), True)
        add_rounded_rect(draw, 400, y+35, 1120, 55, 8, (255, 255, 255), (206, 212, 218))
        add_text(draw, value, 420, y+42, 20, (49, 52, 56))
        y += 110
    
    # Stars - 5 selected
    add_text(draw, "Rating *", 400, y+10, 22, (49, 52, 56), True)
    for i in range(5):
        draw.text((400 + i*55, y+40), "★", fill=(255, 193, 7), font=get_font(48))
    y += 120
    
    # Filled message
    add_text(draw, "Your Feedback *", 400, y, 22, (49, 52, 56), True)
    add_rounded_rect(draw, 400, y+35, 1120, 100, 8, (255, 255, 255), (206, 212, 218))
    add_text(draw, "Great coffee and friendly staff!", 420, y+50, 20, (49, 52, 56))
    add_text(draw, "Will definitely come back again. 🌟", 420, y+75, 20, (49, 52, 56))
    y += 140
    
    # Submit button highlighted
    add_rounded_rect(draw, 400, y+10, 1120, 60, 10, (25, 135, 84))
    add_text(draw, "✅ Submit Feedback", 550, y+18, 28, (255, 255, 255), True)
    
    img.save(f'{OUT_DIR}/frame_002.png')

def create_slide_3():
    """Slide 3: Dashboard with statistics."""
    img = Image.new('RGB', (WIDTH, HEIGHT), (248, 249, 250))
    draw = ImageDraw.Draw(img)
    draw_bg(draw, (240, 245, 255), (248, 249, 250))
    
    add_text(draw, "Step 3: View Dashboard & Statistics", 100, 60, 56, (13, 110, 253), True)
    
    # Stats cards row
    cards = [
        ("Total Feedback", "47", (13, 110, 253)),
        ("Average Rating", "4.3", (25, 135, 84)),
        ("5-Star Reviews", "28", (13, 202, 240)),
    ]
    for i, (title, value, color) in enumerate(cards):
        x = 100 + i * 590
        add_rounded_rect(draw, x, 140, 560, 120, 12, color)
        add_text(draw, title, x + 30, y := 155, 20, (255, 255, 255))
        add_text(draw, value, x + 30, 190, 48, (255, 255, 255), True)
    
    # Bar chart
    add_rounded_rect(draw, 100, 290, 1720, 350, 12, (255, 255, 255), (222, 226, 230))
    add_text(draw, "📊 Rating Distribution", 150, 320, 32, (49, 52, 56), True)
    
    # Bars
    bar_data = [(1, 3), (2, 5), (3, 8), (4, 14), (5, 28)]
    max_count = 28
    chart_left = 200
    chart_bottom = 600
    chart_top = 380
    bar_width = 180
    gap = 100
    
    # Axis
    draw.line([(chart_left, chart_top), (chart_left, chart_bottom)], fill=(108, 117, 125), width=2)
    draw.line([(chart_left, chart_bottom), (1700, chart_bottom)], fill=(108, 117, 125), width=2)
    
    for i, (rating, count) in enumerate(bar_data):
        x = chart_left + 50 + i * (bar_width + gap)
        bar_h = int((count / max_count) * (chart_bottom - chart_top - 40))
        y = chart_bottom - bar_h
        
        # Bar gradient
        add_rounded_rect(draw, x, y, bar_width, bar_h, 8, (13, 110, 253))
        
        # Count on top
        add_text(draw, str(count), x + 60, y - 30, 24, (49, 52, 56), True)
        
        # Label
        stars = "★" * rating
        add_text(draw, stars, x + 30, chart_bottom + 15, 28, (255, 193, 7))
        add_text(draw, f"{rating}/5", x + 60, chart_bottom + 50, 18, (108, 117, 125))
    
    # Feedback list preview
    add_rounded_rect(draw, 100, 670, 1720, 300, 12, (255, 255, 255), (222, 226, 230))
    add_text(draw, "Recent Feedback", 150, 700, 28, (49, 52, 56), True)
    
    # Feedback items
    items = [
        ("Alice Johnson", "★★★★★", "Great coffee and friendly staff!"),
        ("Bob Smith", "★★★★☆", "Good service, slow delivery."),
    ]
    for i, (name, stars, msg) in enumerate(items):
        y = 760 + i * 90
        add_rounded_rect(draw, 150, y, 1620, 75, 8, (248, 249, 250))
        add_text(draw, name, 180, y + 10, 22, (49, 52, 56), True)
        add_text(draw, stars, 400, y + 10, 22, (255, 193, 7))
        add_text(draw, msg, 650, y + 12, 20, (108, 117, 125))
    
    img.save(f'{OUT_DIR}/frame_003.png')

def create_slide_4():
    """Slide 4: Filter by rating."""
    img = Image.new('RGB', (WIDTH, HEIGHT), (248, 249, 250))
    draw = ImageDraw.Draw(img)
    draw_bg(draw, (240, 245, 255), (248, 249, 250))
    
    add_text(draw, "Step 4: Filter Feedback by Rating", 100, 60, 56, (111, 66, 193), True)
    
    # Browser mock
    add_rounded_rect(draw, 100, 140, 1720, 850, 12, (255, 255, 255), (222, 226, 230))
    
    # Filter bar
    add_rounded_rect(draw, 150, 180, 1620, 60, 8, (248, 249, 250), (222, 226, 230))
    add_text(draw, "Filter by rating:", 180, 192, 22, (49, 52, 56), True)
    
    # Dropdown
    add_rounded_rect(draw, 1200, 185, 250, 50, 8, (255, 255, 255), (13, 110, 253))
    add_text(draw, "⭐⭐⭐⭐⭐ (5) ▼", 1220, 192, 20, (13, 110, 253), True)
    
    # Filtered results
    add_text(draw, "Filtered: 5-Star Reviews Only", 180, 270, 28, (111, 66, 193), True)
    
    feedback_items = [
        ("Alice Johnson", "★★★★★", "Great coffee and friendly staff!", "2 min ago"),
        ("Mike Davis", "★★★★★", "Best bakery in town!", "15 min ago"),
        ("Sarah Lee", "★★★★★", "Amazing pastries and service!", "1 hour ago"),
    ]
    
    for i, (name, stars, msg, time) in enumerate(feedback_items):
        y = 330 + i * 180
        add_rounded_rect(draw, 150, y, 1620, 160, 10, (248, 249, 250))
        # Color left border
        draw.line([(150, y), (150, y+160)], fill=(25, 135, 84), width=6)
        
        add_text(draw, name, 190, y + 15, 26, (49, 52, 56), True)
        add_text(draw, stars, 400, y + 15, 26, (255, 193, 7))
        add_text(draw, time, 1600, y + 15, 18, (108, 117, 125))
        add_text(draw, msg, 190, y + 60, 22, (108, 117, 125))
    
    img.save(f'{OUT_DIR}/frame_004.png')

def create_slide_5():
    """Slide 5: Email notification."""
    img = Image.new('RGB', (WIDTH, HEIGHT), (248, 249, 250))
    draw = ImageDraw.Draw(img)
    draw_bg(draw, (240, 245, 255), (248, 249, 250))
    
    add_text(draw, "Step 5: Automatic Email Notifications", 100, 60, 56, (253, 126, 20), True)
    
    # Email mock
    add_rounded_rect(draw, 200, 140, 1520, 820, 12, (255, 255, 255), (222, 226, 230))
    
    # Email header
    add_rounded_rect(draw, 200, 140, 1520, 80, 12, (248, 249, 250))
    draw.rounded_rectangle([200, 208, 1720, 220], radius=0, fill=(248, 249, 250))
    
    add_text(draw, "📧", 230, 150, 36, (49, 52, 56))
    add_text(draw, "New Feedback Received (5/5 stars)", 290, 155, 28, (49, 52, 56), True)
    add_text(draw, "From: Feedback Collector <noreply@feedback-collector.local>", 230, 200, 16, (108, 117, 125))
    add_text(draw, "To: owner@business.com", 1000, 200, 16, (108, 117, 125))
    
    # Email body
    add_text(draw, "New Customer Feedback", 280, 260, 32, (49, 52, 56), True)
    
    # Table
    y = 320
    rows = [
        ("Customer:", "Alice Johnson"),
        ("Email:", "alice@cafe-review.com"),
        ("Rating:", "★★★★★"),
        ("Message:", "Great coffee and friendly staff!\nWill definitely come back again. 🌟"),
        ("Received:", "April 9, 2026 at 3:45 PM"),
    ]
    
    for label, value in rows:
        add_text(draw, label, 280, y, 22, (49, 52, 56), True)
        add_text(draw, value, 500, y, 22, (108, 117, 125))
        y += 70
    
    # Auto notice
    add_rounded_rect(draw, 280, y+40, 1300, 50, 8, (232, 246, 236))
    add_text(draw, "✓ This is an automated notification from Feedback Collector", 310, y+50, 16, (25, 135, 84))
    
    img.save(f'{OUT_DIR}/frame_005.png')

# Generate all frames
if __name__ == '__main__':
    create_slide_1()
    create_slide_2()
    create_slide_3()
    create_slide_4()
    create_slide_5()
    print("✅ All 5 demo frames generated in /tmp/demo_frames/")
