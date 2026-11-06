import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.9-Магістерська_робота_122.docx') as z:
    doc_root = ET.fromstring(z.read('word/document.xml'))

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

for cid in ['9', '10']:
    for i, p in enumerate(doc_root.findall(f'.//{W}p')):
        crs = p.findall(f'.//{W}commentRangeStart[@{W}id="{cid}"]')
        if crs:
            print(f"Comment {cid} in P{i}:")
            for idx, child in enumerate(p):
                tag = child.tag.replace(W, 'w:')
                print(f"   [{idx:2d}] {tag:22s} id={child.attrib.get(f'{W}id')} txt={' '.join(child.itertext())[:30]}")
