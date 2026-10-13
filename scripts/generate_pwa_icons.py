#!/usr/bin/env python3
import struct
import zlib
import math
import os

def create_png(width, height, draw_fn, filename):
    raw_bytes = bytearray()
    for y in range(height):
        raw_bytes.append(0) # filter byte 0 (None)
        for x in range(width):
            r, g, b, a = draw_fn(x, y, width, height)
            raw_bytes.extend([r, g, b, a])
    
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)
    
    header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)
    compressed = zlib.compress(bytes(raw_bytes), 9)
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')
    os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(header + ihdr + idat + iend)
    print(f"Generated {filename} ({width}x{height})")

def dist_to_segment(px, py, x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(px - x1, py - y1)
    t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy
    return math.hypot(px - proj_x, py - proj_y)

def make_drawer(scale=1.0, is_maskable=False):
    # Base coordinates on 512x512
    # If maskable, scale icon down into safe zone (80% diameter)
    icon_scale = 0.72 if is_maskable else 0.88

    def drawer(x, y, width, height):
        # normalize to 512x512 space
        nx = (x / width - 0.5) / icon_scale + 0.5
        ny = (y / height - 0.5) / icon_scale + 0.5
        px = nx * 512.0
        py = ny * 512.0

        # Background color #0f172a (15, 23, 42)
        bg = (15, 23, 42, 255)

        # Rounded corner for non-maskable icons
        if not is_maskable:
            # Check rounded box border on full canvas
            cx = x - width / 2.0
            cy = y - height / 2.0
            # slight corner radius check
            rw = width * 0.48
            rh = height * 0.48
            dx = max(0.0, abs(cx) - (rw - width * 0.15))
            dy = max(0.0, abs(cy) - (rh - height * 0.15))
            if dx * dx + dy * dy > (width * 0.15) ** 2:
                # outside rounded rect
                return (0, 0, 0, 0)

        # If outside scaled coordinate space, return background
        if px < 0 or px > 512 or py < 0 or py > 512:
            return bg

        # Center subtle glow circle: cx=256, cy=256, r=160
        gc_dist = math.hypot(px - 256.0, py - 256.0)
        glow_factor = max(0.0, 1.0 - gc_dist / 160.0) if gc_dist <= 160 else 0.0

        # Base background with subtle gradient glow
        r = int(15 + 14 * glow_factor)
        g = int(23 + 30 * glow_factor)
        b = int(42 + 60 * glow_factor)
        base_color = (r, g, b, 255)

        # Node coordinates in 512x512:
        # Node 1: (160, 220) - Sky cyan #38bdf8 (56, 189, 248), r=44
        # Node 2: (352, 220) - Indigo #818cf8 (129, 140, 248), r=44
        # Node 3: (256, 340) - Emerald #34d399 (52, 211, 153), r=50

        # Connection lines:
        # Line 1: (160, 220) to (352, 220), width=14
        d_line1 = dist_to_segment(px, py, 160.0, 220.0, 352.0, 220.0)
        # Line 2: (160, 220) to (256, 340), width=18
        d_line2 = dist_to_segment(px, py, 160.0, 220.0, 256.0, 340.0)
        # Line 3: (352, 220) to (256, 340), width=18
        d_line3 = dist_to_segment(px, py, 352.0, 220.0, 256.0, 340.0)

        cur_color = list(base_color)

        if d_line1 <= 7.0:
            # Line 1 color: #94a3b8 (148, 163, 184)
            t = max(0.0, 1.0 - d_line1 / 7.0)
            cur_color[0] = int(cur_color[0] * (1 - t) + 148 * t)
            cur_color[1] = int(cur_color[1] * (1 - t) + 163 * t)
            cur_color[2] = int(cur_color[2] * (1 - t) + 184 * t)

        if d_line2 <= 9.0:
            # Line 2 color: #38bdf8
            t = max(0.0, 1.0 - d_line2 / 9.0)
            cur_color[0] = int(cur_color[0] * (1 - t) + 56 * t)
            cur_color[1] = int(cur_color[1] * (1 - t) + 189 * t)
            cur_color[2] = int(cur_color[2] * (1 - t) + 248 * t)

        if d_line3 <= 9.0:
            # Line 3 color: #818cf8
            t = max(0.0, 1.0 - d_line3 / 9.0)
            cur_color[0] = int(cur_color[0] * (1 - t) + 129 * t)
            cur_color[1] = int(cur_color[1] * (1 - t) + 140 * t)
            cur_color[2] = int(cur_color[2] * (1 - t) + 248 * t)

        # Check nodes on top of lines:
        d_n1 = math.hypot(px - 160.0, py - 220.0)
        d_n2 = math.hypot(px - 352.0, py - 220.0)
        d_n3 = math.hypot(px - 256.0, py - 340.0)

        if d_n1 <= 44.0:
            # Node 1: #38bdf8 with slight border
            edge = 44.0 - d_n1
            t = min(1.0, edge / 1.5)
            # inner highlight
            ih = max(0.0, 1.0 - math.hypot(px - 150.0, py - 210.0) / 30.0)
            r_c = int(56 + 50 * ih)
            g_c = int(189 + 40 * ih)
            b_c = 255
            cur_color[0] = int(cur_color[0] * (1 - t) + r_c * t)
            cur_color[1] = int(cur_color[1] * (1 - t) + g_c * t)
            cur_color[2] = int(cur_color[2] * (1 - t) + b_c * t)

        if d_n2 <= 44.0:
            # Node 2: #818cf8 with highlight
            edge = 44.0 - d_n2
            t = min(1.0, edge / 1.5)
            ih = max(0.0, 1.0 - math.hypot(px - 342.0, py - 210.0) / 30.0)
            r_c = int(129 + 50 * ih)
            g_c = int(140 + 40 * ih)
            b_c = 255
            cur_color[0] = int(cur_color[0] * (1 - t) + r_c * t)
            cur_color[1] = int(cur_color[1] * (1 - t) + g_c * t)
            cur_color[2] = int(cur_color[2] * (1 - t) + b_c * t)

        if d_n3 <= 50.0:
            # Node 3: #34d399 with highlight
            edge = 50.0 - d_n3
            t = min(1.0, edge / 1.5)
            ih = max(0.0, 1.0 - math.hypot(px - 248.0, py - 330.0) / 35.0)
            r_c = int(52 + 50 * ih)
            g_c = 255
            b_c = int(153 + 40 * ih)
            cur_color[0] = int(cur_color[0] * (1 - t) + r_c * t)
            cur_color[1] = int(cur_color[1] * (1 - t) + g_c * t)
            cur_color[2] = int(cur_color[2] * (1 - t) + b_c * t)

        return tuple(cur_color)

    return drawer

# Generate the PWA icons
create_png(192, 192, make_drawer(scale=1.0, is_maskable=False), "public/pwa-192x192.png")
create_png(512, 512, make_drawer(scale=1.0, is_maskable=False), "public/pwa-512x512.png")
create_png(512, 512, make_drawer(scale=1.0, is_maskable=True), "public/pwa-maskable-512x512.png")
create_png(180, 180, make_drawer(scale=1.0, is_maskable=False), "public/apple-touch-icon.png")
create_png(64, 64, make_drawer(scale=1.0, is_maskable=False), "public/favicon.ico")
print("All PWA icons generated successfully!")
