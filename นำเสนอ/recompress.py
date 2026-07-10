import sys, zipfile, shutil, os
src = sys.argv[1]
tmp = src + ".tmp"
with zipfile.ZipFile(src, "r") as zin:
    names = [n for n in zin.namelist() if not n.endswith("/")]
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
        for n in names:
            zout.writestr(zin.getinfo(n), zin.read(n))
shutil.move(tmp, src)
print("recompressed:", os.path.getsize(src), "bytes,", len(names), "entries")
