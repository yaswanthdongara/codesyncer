import struct
import zlib

def make_png(width, height):
    # IHDR
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr) & 0xffffffff
    
    # IDAT (Green pixels)
    # 0 (filter) + R (0) + G (255) + B (0)
    row = b'\x00' + b'\x00\xff\x00' * width
    data = row * height
    compressed = zlib.compress(data)
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    
    # IEND
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    
    return (b'\x89PNG\r\n\x1a\n' +
            struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', ihdr_crc) +
            struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc) +
            struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))

with open('mobile_app/assets/icon.png', 'wb') as f:
    f.write(make_png(1024, 1024))
print("Icon created successfully")
