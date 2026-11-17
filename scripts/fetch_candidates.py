import io
import os

import requests
from PIL import Image, ImageDraw

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
WIKI_HEADERS = {"User-Agent": "AdriaticEventsWeddingSite/1.0 (silvana@adriaticevents.com) python-requests"}
C = "https://commons.wikimedia.org/wiki/Special:FilePath/"
ONLY = set(os.environ.get("ONLY", "").split(",")) - {""}

CANDIDATES = {
    "forza": [f"https://forzagroup.me/wp-content/uploads/2026/04/{n}.jpg" for n in
              ["1-2", "2-2", "3-2", "4-2", "5-2", "6-2", "7-2", "8-2", "9-2", "10-2", "11", "12"]]
             + [C + "View_of_the_Kotor_Bay_from_the_road_from_Lovcen.jpg?width=1600"],
    "boat": [C + n + "?width=1600" for n in [
        "Our_Lady_of_the_Rocks,_Bay_of_Kotor_(10)_(29245877343).jpg",
        "Church_of_Our_Lady_of_the_Rocks,_Perast_(49631172447).jpg",
        "Perast,_Church_of_our_Lady_of_the_Rocks_(49720879847).jpg",
        "Church_of_Our_Lady_of_the_Rocks,_Perast.jpg",
        "Perasto_-_Montenegro.JPG",
        "Bucht_von_Kotor_-_Panorama_1.jpg",
        "Kotor_bay_with_a_ship.jpg",
        "Bay_of_Kotor_Panorama.jpg",
    ]],
    "ribarsko": [
        "https://ribarskoselo.com/assets/img/ribarsko-selo-lustica-zanjic-restoran-iz-vazduha-1170.jpg",
        "https://ribarskoselo.com/assets/img/ribarsko-selo-lustica-sto-pored-topa-iznad-mora-1170.jpg",
        "https://ribarskoselo.com/assets/img/ribarsko-selo-lustica-riba-sa-blitvom-i-krompirom-1170.jpg",
    ],
    "savina": [
        "https://castelsavina.me/images/vineyard-2.jpg",
        "https://castelsavina.me/images/vineyard-3.jpg",
        "https://castelsavina.me/images/girl-savina.jpg",
        "https://castelsavina.me/images/cellar-vinarija-4.jpg",
        C + "E15_-_Manastir_Savina.jpg?width=1600",
    ],
    "budva": [C + n + "?width=1600" for n in [
        "Budva_Old_Town_and_Citadel.jpg",
        "Budva_old_town.jpg",
        "Old_Town_Budva,_Montenegro.jpg",
        "View_of_Budva_Old_Town.jpg",
        "View_over_the_Old_Town_of_Budva_from_the_Citadel.jpg",
        "D02.30_Budva,_Stadtstrand_und_Zitadelle.jpg",
        "Budva_Old_Town_-_panoramio.jpg",
        "Budva_Old_Town_-_panoramio_(1).jpg",
    ]],
    "aura": [
        "https://www.aura-beach.com/img/slide/aura-beach-sunbeds-tivat.jpg",
        "https://www.aura-beach.com/img/slide/aura-beach-cabana-tivat.jpg",
        "https://www.aura-beach.com/img/slide/aura-beach-club-montenegro-reservations.jpg",
        "https://www.aura-beach.com/img/slide/aura-beach-montenegro-restaurant.jpg",
        "https://www.aura-beach.com/img/slide/AB6.jpeg",
        "https://www.aura-beach.com/img/slide/AB7.jpeg",
        "https://www.aura-beach.com/img/slide/AB9.jpeg",
        "https://portomontenegro.com/wp-content/uploads/2026/06/54803553522_52d04a9921_o-1024x683.webp",
    ],
}

os.makedirs("scripts/candidates", exist_ok=True)
for group, urls in CANDIDATES.items():
    if ONLY and group not in ONLY:
        continue
    tiles = []
    for i, url in enumerate(urls):
        try:
            headers = WIKI_HEADERS if "wikimedia.org" in url else HEADERS
            r = requests.get(url, headers=headers, timeout=60)
            r.raise_for_status()
            im = Image.open(io.BytesIO(r.content)).convert("RGB")
        except Exception as e:
            print(group, i, "failed", url, e)
            continue
        im.save(f"scripts/candidates/{group}_{i}.jpg", quality=92)
        print(group, i, im.size, url)
        t = im.copy()
        t.thumbnail((420, 300))
        tile = Image.new("RGB", (420, 320), "white")
        tile.paste(t, ((420 - t.width) // 2, 20))
        ImageDraw.Draw(tile).text((6, 4), f"{group}_{i} {im.size[0]}x{im.size[1]}", fill="black")
        tiles.append(tile)
    if not tiles:
        continue
    cols = 4
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 420, rows * 320), "white")
    for k, t in enumerate(tiles):
        sheet.paste(t, ((k % cols) * 420, (k // cols) * 320))
    sheet.save(f"scripts/candidates/_sheet_{group}.jpg", quality=85)
