import zipfile, re, sys
import xml.dom.minidom as M
f = "ข้อเสนอเชิงยุทธศาสตร์ DGSI (เอกสารผู้บริหาร).docx"
z = zipfile.ZipFile(f)
need = ["[Content_Types].xml","word/document.xml","word/_rels/document.xml.rels"]
for n in need:
    print("OK" if n in z.namelist() else "MISSING", n)
xml = z.read("word/document.xml").decode("utf-8")
try:
    M.parseString(xml); print("XML well-formed: YES")
except Exception as e:
    print("XML ERROR:", e)
texts = re.findall(r"<w:t[^>]*>(.*?)</w:t>", xml, re.S)
joined = " ".join(t for t in texts)
for kw in ["บทสรุปผู้บริหาร","ความได้เปรียบ","Data Maturity","D4 คุณภาพข้อมูล","แผนปฏิบัติการ","ข้อเสนอเชิงนโยบาย","Q8"]:
    print("FOUND" if kw in joined else "!! MISSING", kw)
print("total text runs:", len(texts), "| tables:", xml.count("<w:tbl>"))
