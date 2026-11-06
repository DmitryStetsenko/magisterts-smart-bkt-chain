import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.9-Магістерська_робота_122.docx') as z:
    doc_root = ET.fromstring(z.read('word/document.xml'))

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

for i, p in enumerate(doc_root.findall(f'.//{W}p')):
    c_refs = p.findall(f'.//{W}commentReference[@{W}id="7"]')
    if c_refs:
        print(f"Found comment 7 reference in P{i}:")
        for idx, child in enumerate(p):
            tag = child.tag.replace(W, 'w:')
            cid = child.attrib.get(f'{W}id')
            txt = ''.join(child.itertext()).strip()
            print(f"  [{idx:2d}] {tag:22s} id={cid} txt={txt[:30]}")
