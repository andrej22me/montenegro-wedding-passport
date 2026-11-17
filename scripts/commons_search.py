import json
import sys

import requests

API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "AdriaticEventsWeddingSite/1.0 (silvana@adriaticevents.com)"}


def search(term, limit=12):
    r = requests.get(
        API,
        params={
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"filetype:bitmap {term}",
            "gsrnamespace": 6,
            "gsrlimit": limit,
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata",
            "iiurlwidth": 1600,
        },
        headers=HEADERS,
        timeout=30,
    )
    pages = r.json().get("query", {}).get("pages", {}).values()
    out = []
    for p in pages:
        ii = p["imageinfo"][0]
        meta = ii.get("extmetadata", {})
        out.append(
            {
                "title": p["title"],
                "w": ii["width"],
                "h": ii["height"],
                "thumb": ii.get("thumburl"),
                "license": meta.get("LicenseShortName", {}).get("value"),
                "artist": meta.get("Artist", {}).get("value", "")[:80],
            }
        )
    return out


if __name__ == "__main__":
    for term in sys.argv[1:]:
        print(f"## {term}")
        for x in search(term):
            if x["w"] >= 1600:
                print(json.dumps(x, ensure_ascii=False))
