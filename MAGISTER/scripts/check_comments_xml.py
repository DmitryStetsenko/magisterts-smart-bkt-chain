import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.8-Магістерська_робота_122.docx') as z:
    doc_root = ET.fromstring(z.read('word/document.xml'))
    c_root = ET.fromstring(z.read('word/comments.xml'))
    ce_root = ET.fromstring(z.read('word/commentsExtended.xml'))

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'

print("--- Comments in word/comments.xml ---")
comment_map = {}
for c in c_root.findall(f'{W}comment'):
    cid = c.attrib.get(f'{W}id')
    author = c.attrib.get(f'{W}author')
    p = c.find(f'{W}p')
    para_id = p.attrib.get(f'{W14}paraId') if p is not None else None
    txt = ''.join(c.itertext()).strip()
    comment_map[cid] = {'author': author, 'paraId': para_id, 'text': txt}
    print(f"ID {cid:2s} | Author: {author:20s} | ParaId: {para_id} | Text: {txt[:60]}...")

print("\n--- Anchors in word/document.xml ---")
for cid in sorted([int(k) for k in comment_map.keys()]):
    str_id = str(cid)
    crs = doc_root.findall(f'.//{W}commentRangeStart[@{W}id="{str_id}"]')
    cre = doc_root.findall(f'.//{W}commentRangeEnd[@{W}id="{str_id}"]')
    crf = doc_root.findall(f'.//{W}commentReference[@{W}id="{str_id}"]')
    print(f"Comment {str_id:2s} ({comment_map[str_id]['author']}): RangeStart={len(crs)}, RangeEnd={len(cre)}, Ref={len(crf)}")
