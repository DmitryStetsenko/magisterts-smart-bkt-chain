import zipfile
import xml.etree.ElementTree as ET
import os
import shutil

NAMESPACES = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'm': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
    'w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
    'w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
    'w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
    'w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
}

for prefix, uri in NAMESPACES.items():
    ET.register_namespace(prefix, uri)

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'
W16CEX = '{http://schemas.microsoft.com/office/word/2018/wordml/cex}'
W16CID = '{http://schemas.microsoft.com/office/word/2016/wordml/cid}'

HUMAN_REPLIES = [
    {
        'id': '19',
        'parentCommentId': '0',
        'parentParaId': '0000036F',
        'paraId': '00000390',
        'durableId': '00000020',
        'text': 'Підрозділ 1.1 наповнено теоретичним матеріалом щодо парадигми ITS та методів ШІ для персоналізації навчання.'
    },
    {
        'id': '20',
        'parentCommentId': '1',
        'parentParaId': '00000370',
        'paraId': '00000391',
        'durableId': '00000021',
        'text': 'Додано посилання на дослідження навчальної аналітики [14, 38].'
    },
    {
        'id': '21',
        'parentCommentId': '2',
        'parentParaId': '0000036C',
        'paraId': '00000392',
        'durableId': '00000022',
        'text': 'Виправлено описку в номері 1.4 та оформлено формули у редакторі формул.'
    },
    {
        'id': '22',
        'parentCommentId': '3',
        'parentParaId': '0000036B',
        'paraId': '00000393',
        'durableId': '00000023',
        'text': 'Погоджено, опис моделі винесено у Розділ 2.'
    },
    {
        'id': '23',
        'parentCommentId': '4',
        'parentParaId': '00000372',
        'paraId': '00000394',
        'durableId': '00000024',
        'text': 'Це власна розробка, посилання знято.'
    },
    {
        'id': '24',
        'parentCommentId': '5',
        'parentParaId': '00000369',
        'paraId': '00000395',
        'durableId': '00000025',
        'text': 'Позначення "raw" означає розрахункове значення до застосування правила затискання. Пояснення додано під формулою.'
    },
    {
        'id': '25',
        'parentCommentId': '6',
        'parentParaId': '00000376',
        'paraId': '00000396',
        'durableId': '00000026',
        'text': 'Калібрується залежно від складності теми (0.15 для складних концептів, 0.20 для базових). Обґрунтування внесено в текст.'
    },
    {
        'id': '26',
        'parentCommentId': '7',
        'parentParaId': '0000036D',
        'paraId': '00000397',
        'durableId': '00000027',
        'text': 'Константи є базовими евристиками для середньої складності. Викладач може змінювати нормативи часу та пороги вставки в інтерфейсі під кожну задачу. Пояснення додано в текст.'
    },
    {
        'id': '27',
        'parentCommentId': '8',
        'parentParaId': '0000036A',
        'paraId': '00000398',
        'durableId': '00000028',
        'text': 'Підбір ваг проводився за максимізацією AUC-ROC (0.94) на тестовому датасеті з пріоритетом на фактор вставки коду. Обґрунтування наведено в підрозділі 2.4.'
    },
    {
        'id': '28',
        'parentCommentId': '9',
        'parentParaId': '00000375',
        'paraId': '00000399',
        'durableId': '00000029',
        'text': 'Додано лістинг клієнтського сенсора телеметрії Monaco (Лістинг 2.2).'
    },
    {
        'id': '29',
        'parentCommentId': '10',
        'parentParaId': '00000374',
        'paraId': '0000039A',
        'durableId': '0000002A',
        'text': 'Підрозділ 2.6 доповнено описом структури контракту Soulbound (EIP-5192), схеми підпису EIP-712 та формули хешування Keccak-256.'
    },
    {
        'id': '30',
        'parentCommentId': '11',
        'parentParaId': '00000371',
        'paraId': '0000039B',
        'durableId': '0000002B',
        'text': 'Опис використання LLM додано у Розділ 1 (в контексті ITS) та деталізовано в Розділі 3 (архітектура сервісів LLMJudgeService і SocraticTutorService).'
    }
]

REPLY_MAP = {r['id']: r for r in HUMAN_REPLIES}
PARENT_TO_REPLY = {r['parentCommentId']: r for r in HUMAN_REPLIES}

def update_comments_xml(xml_bytes):
    tree = ET.fromstring(xml_bytes)
    # Update text of comments 19..30
    for c in tree.findall(f'{W}comment'):
        cid = c.attrib.get(f'{W}id')
        if cid in REPLY_MAP:
            new_text = REPLY_MAP[cid]['text']
            t_elem = c.find(f'.//{W}t')
            if t_elem is not None:
                t_elem.text = new_text
            print(f'Updated text in comments.xml for reply ID {cid}: "{new_text[:40]}..."')
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def update_document_xml(xml_bytes):
    tree = ET.fromstring(xml_bytes)
    body = tree.find(f'{W}body')

    # Remove any existing anchors for comments 19..30 first to ensure clean state
    for cid in REPLY_MAP.keys():
        for el in body.findall(f'.//{W}commentRangeStart[@{W}id="{cid}"]'):
            for p in body.findall(f'.//{W}p'):
                if el in list(p):
                    p.remove(el)
        for el in body.findall(f'.//{W}commentRangeEnd[@{W}id="{cid}"]'):
            for p in body.findall(f'.//{W}p'):
                if el in list(p):
                    p.remove(el)
        for el in body.findall(f'.//{W}commentReference[@{W}id="{cid}"]'):
            for r in body.findall(f'.//{W}r'):
                if el in list(r):
                    for p in body.findall(f'.//{W}p'):
                        if r in list(p):
                            p.remove(r)

    # Now anchor each reply comment right alongside its parent supervisor comment!
    for p_cid, reply_info in PARENT_TO_REPLY.items():
        r_cid = reply_info['id']
        found = False

        # Find paragraph containing parent's commentRangeEnd or commentRangeStart
        for p in body.findall(f'.//{W}p'):
            parent_end = p.find(f'.//{W}commentRangeEnd[@{W}id="{p_cid}"]')
            parent_ref = p.find(f'.//{W}commentReference[@{W}id="{p_cid}"]')
            parent_start = p.find(f'.//{W}commentRangeStart[@{W}id="{p_cid}"]')

            target_child = None
            if parent_ref is not None:
                # Find the run containing parent_ref
                for child in list(p):
                    if child.find(f'.//{W}commentReference[@{W}id="{p_cid}"]') is not None or child == parent_ref:
                        target_child = child
                        break
            elif parent_end is not None:
                target_child = parent_end
            elif parent_start is not None:
                target_child = parent_start

            if target_child is not None and target_child in list(p):
                idx = list(p).index(target_child)
                
                # Create reply anchor elements
                cr_start = ET.Element(f'{W}commentRangeStart')
                cr_start.attrib[f'{W}id'] = r_cid

                cr_end = ET.Element(f'{W}commentRangeEnd')
                cr_end.attrib[f'{W}id'] = r_cid

                r_ref = ET.Element(f'{W}r')
                rPr = ET.SubElement(r_ref, f'{W}rPr')
                rStyle = ET.SubElement(rPr, f'{W}rStyle')
                rStyle.attrib[f'{W}val'] = 'CommentReference'
                c_ref = ET.SubElement(r_ref, f'{W}commentReference')
                c_ref.attrib[f'{W}id'] = r_cid

                # Insert after target_child
                p.insert(idx + 1, cr_start)
                p.insert(idx + 2, cr_end)
                p.insert(idx + 3, r_ref)

                print(f'Anchored Reply ID {r_cid} (parent ID {p_cid}) in document.xml paragraph!')
                found = True
                break

        if not found:
            print(f'[WARNING] Parent comment ID {p_cid} not found in document.xml!')

    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def main():
    src_docx = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\RELEASE\V-13.9-Магістерська_робота_122.docx'
    dst_main = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\Магістерська_робота_122.docx'

    print(f'Opening: {src_docx}')
    with zipfile.ZipFile(src_docx, 'r') as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    files['word/comments.xml'] = update_comments_xml(files['word/comments.xml'])
    files['word/document.xml'] = update_document_xml(files['word/document.xml'])

    print(f'Writing updated archive: {src_docx}')
    with zipfile.ZipFile(src_docx, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)

    shutil.copyfile(src_docx, dst_main)
    print('Successfully updated V-13.9 and synced to working file!')

if __name__ == '__main__':
    main()
