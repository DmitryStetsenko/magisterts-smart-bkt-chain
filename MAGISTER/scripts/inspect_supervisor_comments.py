import docx
import zipfile
import xml.etree.ElementTree as ET

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
}

doc = docx.Document(r'MAGISTER\KN\RELEASE\V-13.8-Магістерська_робота_122.docx')

# 1. Read comments
comments_map = {}
with zipfile.ZipFile(r'MAGISTER\KN\RELEASE\V-13.8-Магістерська_робота_122.docx') as z:
    comm_xml = z.read('word/comments.xml')
    comm_tree = ET.fromstring(comm_xml)
    for c in comm_tree:
        cid = c.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id')
        author = c.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}author')
        text = ''.join(c.itertext()).strip()
        comments_map[cid] = {'author': author, 'text': text}

# 2. Find comment references in document paragraphs
anchors = {}
with zipfile.ZipFile(r'MAGISTER\KN\RELEASE\V-13.8-Магістерська_робота_122.docx') as z:
    doc_tree = ET.fromstring(z.read('word/document.xml'))
    body = doc_tree.find('.//w:body', namespaces)
    for p_idx, p in enumerate(body.findall('w:p', namespaces)):
        c_refs = p.findall('.//w:commentReference', namespaces)
        c_starts = p.findall('.//w:commentRangeStart', namespaces)
        ids = set()
        for r in c_refs:
            ids.add(r.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id'))
        for s in c_starts:
            ids.add(s.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id'))
        for cid in ids:
            if cid not in anchors:
                anchors[cid] = []
            if p_idx not in anchors[cid]:
                anchors[cid].append(p_idx)

# Find current section for each paragraph
headings = []
for idx, p in enumerate(doc.paragraphs):
    if p.style.name.startswith('Heading'):
        headings.append((idx, p.text.strip()))

def get_section(p_idx):
    sec = 'ВСТУП'
    for h_idx, h_text in headings:
        if h_idx <= p_idx:
            sec = h_text
        else:
            break
    return sec

print("=== ЗАУВАЖЕННЯ НАУКОВОГО КЕРІВНИКА (ТЕТЯНА БАРБОЛІНА) ===")
for cid in sorted(comments_map.keys(), key=lambda x: int(x)):
    cdata = comments_map[cid]
    if cdata['author'] == 'Тетяна Барболіна':
        p_list = anchors.get(cid, [])
        print(f"\n📌 [КОМЕНТАР №{cid}]")
        print(f"Зміст зауваження: \"{cdata['text']}\"")
        for p_idx in p_list:
            sec = get_section(p_idx)
            print(f"Локація в роботі: абзац {p_idx} ({sec})")
            print(f"Фрагмент тексту: {doc.paragraphs[p_idx].text}")
        print("-" * 70)
