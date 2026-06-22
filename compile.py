#!/usr/bin/env python3
"""compile.py — Fetches all 花间集 volumes and compiles into poems.json"""
import json, urllib.request, sys, re

# Use already-fetched data — write poems.json from inline data
# Since we can't fetch with Unicode URLs, we'll create the JSON programmatically
# from the raw data we already downloaded.

# Read each volume from the local copies (if available) or construct manually
# We'll use the data stored in the tool's context

VOLUME_URLS = [
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-1-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-2-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-3-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-4-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-5-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-6-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-7-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-8-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-9-juan.json",
    "https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E4%BA%94%E4%BB%A3%E8%AF%97%E8%AF%8D/huajianji/huajianji-x-juan.json",
]

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    all_poems = []
    authors = set()
    pid = 1

    for url in VOLUME_URLS:
        print(f"Fetching {url}...", file=sys.stderr)
        poems = fetch_json(url)
        for p in poems:
            author = p.get("author", "").strip()
            clean_author = re.sub(r'[。\s]*\d+[首\s]*$', '', author).strip() or author
            authors.add(clean_author)
            all_poems.append({
                "id": pid,
                "title": p.get("title", ""),
                "author": clean_author,
                "rhythmic": p.get("rhythmic", ""),
                "content": p.get("paragraphs", []),
                "period": "五代",
                "tags": [],
            })
            pid += 1

    # Keyword tagging
    keyword_tags = {
        "春": "spring", "秋": "autumn", "花": "flower", "月": "moon",
        "柳": "willow", "雨": "rain", "雪": "snow", "莲": "lotus",
        "梅": "plum", "梦": "dream", "愁": "sorrow", "恨": "regret",
        "泪": "tears", "相思": "longing", "离别": "parting", "忆": "memory",
        "归": "return", "闺": "boudoir", "妆": "adornment",
    }
    for poem in all_poems:
        text = poem["title"] + "".join(poem["content"])
        for kw, tag in keyword_tags.items():
            if kw in text and tag not in poem["tags"]:
                poem["tags"].append(tag)

    output = {
        "meta": {
            "title": "花间集",
            "period": "五代",
            "total": len(all_poems),
            "authors": sorted(authors),
        },
        "poems": all_poems,
    }
    with open("poems.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"Done! {len(all_poems)} poems, {len(authors)} authors → poems.json")

if __name__ == "__main__":
    main()
