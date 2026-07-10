import sys, zipfile, re
src = sys.argv[1]
with zipfile.ZipFile(src) as z:
    slides = sorted([n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
                    key=lambda n: int(re.search(r"(\d+)", n).group()))
    for n in slides:
        xml = z.read(n).decode("utf-8")
        texts = re.findall(r"<a:t>(.*?)</a:t>", xml, re.S)
        joined = " | ".join(t for t in texts if t.strip())
        num = re.search(r"(\d+)", n).group()
        print(f"=== Slide {num} ===")
        print(joined[:600])
        print()
