import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.9-Магістерська_робота_122.docx') as z:
    doc_root = ET.fromstring(z.read('word/document.xml'))
    c_root = ET.fromstring(z.read('word/comments.xml'))
    ce_root = ET.fromstring(z.read('word/commentsExtended.xml'))

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'

print("=== CHECKING ALL 12 SUPERVISOR COMMENTS & HUMAN REPLIES ===")
comments = {}
for c in c_root.findall(f'{W}comment'):
    cid = c.attrib.get(f'{W}id')
    author = c.attrib.get(f'{W}author')
    p = c.find(f'{W}p')
    para_id = p.attrib.get(f'{W14}paraId') if p is not None else None
    txt = ''.join(c.itertext()).strip()
    comments[cid] = {'author': author, 'paraId': para_id, 'text': txt}

comment_ex_map = {}
for ce in ce_root.findall(f'{W15}commentEx'):
    pid = ce.attrib.get(f'{W15}paraId')
    parent = ce.attrib.get(f'{W15}paraIdParent')
    comment_ex_map[pid] = parent

for s_cid in range(12):
    s_id = str(s_cid)
    s_c = comments[s_id]
    s_para = s_c['paraId']
    
    # check doc anchors for supervisor comment
    s_crs = doc_root.findall(f'.//{W}commentRangeStart[@{W}id="{s_id}"]')
    s_ref = doc_root.findall(f'.//{W}commentReference[@{W}id="{s_id}"]')
    
    # find reply
    r_cids = [cid for cid, c in comments.items() if comment_ex_map.get(c['paraId']) == s_para]
    
    print(f"\n[Supervisor Comment {s_id:2s}] ({s_c['author']}): \"{s_c['text'][:65]}...\"")
    print(f"   anchors in doc.xml: start={len(s_crs)}, ref={len(s_ref)}")
    
    for r_id in r_cids:
        r_c = comments[r_id]
        r_crs = doc_root.findall(f'.//{W}commentRangeStart[@{W}id="{r_id}"]')
        r_ref = doc_root.findall(f'.//{W}commentReference[@{W}id="{r_id}"]')
        print(f"   ↳ [Reply {r_id:2s}] ({r_c['author']}): \"{r_c['text']}\"")
        print(f"      anchors in doc.xml: start={len(r_crs)}, ref={len(r_ref)} | paraIdParent={comment_ex_map.get(r_c['paraId'])}")
