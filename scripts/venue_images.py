import re
import sys
from urllib.parse import urljoin

import requests

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
IMG = re.compile(r"""(?:src|data-src|href|srcset|data-bg|url\()\s*=?\s*["']?([^"'\s>)]+\.(?:jpe?g|webp|png))""", re.I)

sys.stdout.reconfigure(encoding="utf-8")

for page in sys.argv[1:]:
    print(f"## {page}")
    try:
        html = requests.get(page, headers=HEADERS, timeout=30).text
    except Exception as e:
        print("  error", e)
        continue
    seen = set()
    for m in IMG.findall(html):
        url = urljoin(page, m)
        if url in seen or re.search(r"logo|icon|favicon|-\d{2,3}x\d{2,3}\.", url, re.I):
            continue
        seen.add(url)
        print(" ", url)
