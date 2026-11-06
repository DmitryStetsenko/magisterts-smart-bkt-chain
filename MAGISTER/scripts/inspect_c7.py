import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.9-Магістерська_робота_122.docx') as z:
    c_root = ET.fromstring(z.read('word/comments.xml'))
    ce_root = ET.fromstring(z.read('word/commentsExtended.xml'))
    doc_root = ET.fromstring(z.read('word/document.xml'))

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'

print("--- Comment 7 & 26 in comments.xml ---")
for c in c_root.findall(f'{W}comment'):
    cid = c.attrib.get(f'{W}id')
    if cid in ['7', '26']:
        p = c.find(f'{W}p')
        para_id = p.attrib.get(f'{W14}paraId') if p is not None else None
        txt = ''.join(c.itertext()).strip()
        print(f"Comment ID {cid}: author={c.attrib.get(f'{W}author')}, paraId={para_id}")
        print(f"   text: {txt}")

print("\n--- commentEx in commentsExtended.xml ---")
for ce in ce_root.findall(f'{W15}commentEx'):
    pid = ce.attrib.get(f'{W15}paraId')
    parent = ce.attrib.get(f'{W15}paraIdParent')
    if pid in ['0000036D', '00000397']:
        print(f"commentEx: paraId={pid}, paraIdParent={parent}")

print("\n--- document.xml anchors for 7 and 26 ---")
for cid in ['7', '26']:
    start = doc_root.findall(f'.//{W}commentRangeStart[@{W}id="{cid}"]')
    end = doc_root.findall(f'.//{W}commentRangeEnd[@{W}id="{cid}"]')
    ref = doc_root.findall(f'.//{W}commentReference[@{W}id="{cid}"]')
    print(f"ID {cid}: start={len(start)}, end={len(end)}, ref={len(ref)}")
