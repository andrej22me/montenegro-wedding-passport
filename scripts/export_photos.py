"""Crop chosen candidates to 3:2, save optimised JPGs and write photo credits."""
import json
import os
import re
import requests
from PIL import Image

SRC = "scripts/candidates"
OUT = "public/images/photos"
os.makedirs(OUT, exist_ok=True)

# name, candidate, focal y (0 top .. 1 bottom), width, source
PICKS = [
    ("hero", "forza_12", 0.55, 2000, "commons:View_of_the_Kotor_Bay_from_the_road_from_Lovcen.jpg"),
    ("forza-kuk", "forza_10", 0.0, 1200, "Forza Kuk, forzagroup.me"),
    ("boat-day", "boat_3", 0.5, 1600, "commons:Church_of_Our_Lady_of_the_Rocks,_Perast.jpg"),
    ("ribarsko-selo", "ribarsko_1", 0.35, 1170, "Ribarsko Selo, ribarskoselo.com"),
    ("savina", "savina_0", 0.5, 1600, "Castel Savina, castelsavina.me"),
    ("citadela-budva", "budva_0", 0.55, 1600, "commons:Budva_Old_Town_and_Citadel.jpg"),
    ("aura", "aura_7", 0.5, 1024, "Porto Montenegro, portomontenegro.com"),
]

WIKI = {"User-Agent": "AdriaticEventsWeddingSite/1.0 (silvana@adriaticevents.com) python-requests"}


def commons_credit(name):
    r = requests.get(
        "https://commons.wikimedia.org/w/api.php",
        params={
            "action": "query",
            "titles": f"File:{name}",
            "prop": "imageinfo",
            "iiprop": "extmetadata",
            "format": "json",
        },
        headers=WIKI,
        timeout=30,
    ).json()
    meta = next(iter(r["query"]["pages"].values()))["imageinfo"][0]["extmetadata"]
    strip = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()
    return {
        "author": strip(meta.get("Artist", {}).get("value")),
        "license": strip(meta.get("LicenseShortName", {}).get("value")),
        "url": f"https://commons.wikimedia.org/wiki/File:{name}",
    }


credits = []
for name, cand, fy, width, source in PICKS:
    im = Image.open(f"{SRC}/{cand}.jpg").convert("RGB")
    w, h = im.size
    if w / h > 1.5:
        cw, ch = int(h * 1.5), h
        box = ((w - cw) // 2, 0, (w - cw) // 2 + cw, ch)
    else:
        cw, ch = w, int(w / 1.5)
        top = int(max(0, min(h - ch, fy * h - ch / 2)))
        box = (0, top, cw, top + ch)
    im = im.crop(box)
    if im.width > width:
        im = im.resize((width, int(width / 1.5)), Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg", quality=82, optimize=True, progressive=True)
    entry = {"image": f"/images/photos/{name}.jpg"}
    if source.startswith("commons:"):
        entry.update(commons_credit(source[8:]))
    else:
        entry.update({"source": source, "license": "Venue photo, permission required"})
    credits.append(entry)
    print(name, im.size, entry)

with open(f"{OUT}/credits.json", "w", encoding="utf-8") as f:
    json.dump(credits, f, indent=2, ensure_ascii=False)
