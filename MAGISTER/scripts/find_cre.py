import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.9-Магістерська_робота_122.docx') as z:
    doc_root = ET.fromstring(z.read('word/document.xml'))

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

for cid in ['9', '10']:
    cre = doc_root.findall(f'.//{W}commentRangeEnd[@{W}id="{cid}"]')
    for elem in cre:
        # find parent
        for p in doc_root.findall(f'.//{W}p'):
            if elem in list(p):
                print(f"Comment {cid} RangeEnd in p: {' '.join(p.itertext())[:40]}")
