import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('MAGISTER/KN/RELEASE/V-13.8-Магістерська_робота_122.docx') as z:
    root = ET.fromstring(z.read('word/document.xml'))
    W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
    M = '{http://schemas.openxmlformats.org/officeDocument/2006/math}'
    body = root.find(f'{W}body')
    paragraphs = body.findall(f'{W}p')
    for idx in range(108, 117):
        p = paragraphs[idx]
        maths = p.findall(f'.//{M}oMath')
        elems = []
        for child in p.iter():
            if child.tag == f'{W}t':
                elems.append(f'T:"{child.text}"')
            elif child.tag == f'{M}t':
                elems.append(f'MT:"{child.text}"')
        print(f'P{idx} (maths={len(maths)}):', ' | '.join(elems))
