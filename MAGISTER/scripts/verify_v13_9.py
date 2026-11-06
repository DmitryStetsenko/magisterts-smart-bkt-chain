import docx
import zipfile
import xml.etree.ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
M = '{http://schemas.openxmlformats.org/officeDocument/2006/math}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'

doc_path = 'MAGISTER/KN/RELEASE/V-13.9-Магістерська_робота_122.docx'

print("=== VERIFYING V-13.9 ===")

# 1. Check with python-docx
doc = docx.Document(doc_path)
print(f"Total paragraphs in document: {len(doc.paragraphs)}")

# 2. Section word counts
sec_words = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
current_sec = 0

for p in doc.paragraphs:
    txt = p.text.strip()
    if 'РОЗДІЛ 1' in txt:
        current_sec = 1
    elif 'РОЗДІЛ 2' in txt:
        current_sec = 2
    elif 'РОЗДІЛ 3' in txt:
        current_sec = 3
    elif 'РОЗДІЛ 4' in txt:
        current_sec = 4
    elif 'РОЗДІЛ 5' in txt:
        current_sec = 5
    elif 'ЗАГАЛЬНІ ВИСНОВКИ' in txt:
        current_sec = 0

    words = len(txt.split())
    if current_sec in sec_words:
        sec_words[current_sec] += words

print("\n--- SECTION WORD & PAGE COUNTS (at ~175 words/page) ---")
for s, w in sec_words.items():
    print(f"Section {s}: {w:5d} words | ~{w/175:5.1f} pages (at 175 w/p) | ~{w/200:5.1f} pages (at 200 w/p)")

sec2_3_words = sec_words[2] + sec_words[3]
print(f"\n>> TOTAL SECTION 2 + 3: {sec2_3_words} words | ~{sec2_3_words/175:.1f} pages in Google Docs! <<")

# 3. Check Table of Contents
print("\n--- TABLE OF CONTENTS VERIFICATION ---")
for i, p in enumerate(doc.paragraphs[:65]):
    txt = p.text.strip()
    if any(k in txt for k in ['ЗМІСТ', 'РОЗДІЛ', 'Висновки до розділу', 'ЗАГАЛЬНІ ВИСНОВКИ']):
        print(f"  P{i:2d}: {txt}")

# 4. Check comments XML and replies
print("\n--- COMMENTS AND THREADED REPLIES VERIFICATION ---")
with zipfile.ZipFile(doc_path) as z:
    c_root = ET.fromstring(z.read('word/comments.xml'))
    ce_root = ET.fromstring(z.read('word/commentsExtended.xml'))

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

print(f"Total comments in comments.xml: {len(comments)}")
print(f"Total commentEx in commentsExtended.xml: {len(comment_ex_map)}")

print("\nChecking replies to Supervisor comments (0..11):")
for s_cid in range(12):
    s_str = str(s_cid)
    s_comm = comments.get(s_str)
    if not s_comm:
        print(f"  [ERROR] Supervisor comment {s_str} missing!")
        continue
    s_para = s_comm['paraId']
    # find reply with parent == s_para
    replies = [cid for cid, c in comments.items() if comment_ex_map.get(c['paraId']) == s_para]
    print(f"  Comment {s_str:2s} ({s_comm['author']}, paraId={s_para}): {len(replies)} reply -> Reply IDs: {replies}")
    for r_id in replies:
        print(f"     ↳ {comments[r_id]['author']}: {comments[r_id]['text'][:75]}...")

# 5. Check formulas 1.3, 1.4, 1.5
print("\n--- FORMULAS 1.3, 1.4, 1.5 VERIFICATION ---")
with zipfile.ZipFile(doc_path) as z:
    doc_root = ET.fromstring(z.read('word/document.xml'))

for formula_id in ['(1.3)', '(1.4)', '(1.5)']:
    found = False
    for p in doc_root.findall(f'.//{W}p'):
        txt = ''.join(p.itertext())
        if formula_id in txt:
            math_el = p.find(f'.//{M}oMath')
            found = True
            has_frac = math_el.find(f'.//{M}f') is not None if math_el is not None else False
            print(f"  Formula {formula_id}: oMath present = {math_el is not None}, has vertical fraction = {has_frac}")
    if not found:
        print(f"  [ERROR] Formula {formula_id} not found!")

print("\n=== VERIFICATION COMPLETED ===")
