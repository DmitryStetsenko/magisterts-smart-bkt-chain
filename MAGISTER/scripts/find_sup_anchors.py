import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.9-Магістерська_робота_122.docx') as z:
    doc_root = ET.fromstring(z.read('word/document.xml'))

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

for cid in range(12):
    s_id = str(cid)
    found = False
    for i, p in enumerate(doc_root.findall(f'.//{W}p')):
        crs = p.findall(f'.//{W}commentRangeStart[@{W}id="{s_id}"]')
        if crs:
            txt = ''.join(p.itertext()).strip()
            print(f"Comment {s_id:2s} (P{i}): {txt[:70]}...")
            found = True
            break
    if not found:
        print(f"Comment {s_id:2s}: NOT FOUND!")
