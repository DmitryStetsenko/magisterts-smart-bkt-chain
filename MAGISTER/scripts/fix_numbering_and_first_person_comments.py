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
    'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
}

for prefix, uri in NAMESPACES.items():
    ET.register_namespace(prefix, uri)

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

# First-person author comments (IDs 12..18)
FIRST_PERSON_COMMENTS = {
    '12': 'Посилання [1, 3] та [11, 13] я прибрав. Модель динамічних регуляторів ймовірностей вгадування P(G_t) та промаху P(S_t) на основі сенсорної телеметрії редактора коду — це моя власна ідея і розробка; у цитованих статтях використовувалися лише сталі константи або класичні моделі без аналізу динаміки набору коду.',
    '13': 'Посилання [3, 4] я прибрав. Хоча Бейкер і Юдельсон досліджували контекстні та індивідуальні параметри BKT, введення обчислюваних динамічних регуляторів P(G_t) і P(S_t) на основі телеметрії кодової сесії — це моя власна ідея та запропонований мною підхід.',
    '14': 'Посилання [12] я прибрав, оскільки структуру та набір компонентів темпорального вектора дій студента E_t у кодовому редакторі я спроєктував самостійно спеціально для архітектури нашої платформи.',
    '15': 'Посилання [13] я прибрав. Математичне доведення знаку похідної та властивості адаптивної нечутливості до випадкових механічних описок — це мій власний теоретичний розрахунок.',
    '16': 'Посилання [31, 34] та [16] я прибрав. Математичне правило граничного затискання з гарантованою нижньою асимптотою P_min = 0.05 та спосіб усунення машинної втрати розрядів у формулі Байєса розроблені мною.',
    '17': 'Посилання я прибрав. Клієнтський сенсор телеметрії редактора Monaco, формули логістичного штрафу P(G_t), адаптивного пом\'якшення P(S_t) та згортки інтегрального індексу академічної доброчесності C_trust — це моя власна розробка та науковий результат.',
    '18': 'Посилання [7, 15] та [17] я прибрав. Алгоритм тактичного відступу назад за орієнтованим графом пререквізитів та трирівневу систему підтримки я спроєктував самостійно; у цитованих статтях описано лише загальні психолого-педагогічні концепції без конкретних алгоритмів.'
}

# Unified Table of Contents lines (31 lines)
NEW_TOC_LINES = [
    "ВСТУП",
    "РОЗДІЛ 1. АНАЛІЗ ПРЕДМЕТНОЇ ОБЛАСТІ ТА НАУКОВО-МЕТОДИЧНИХ ПІДХОДІВ ДО ОЦІНЮВАННЯ ЗНАНЬ",
    "1.1 Персоналізація навчання: концепції, принципи та підходи до формування індивідуальних освітніх траєкторій",
    "1.2 Еволюція та архітектурні обмеження систем електронного навчання",
    "1.3 Моделі відстеження знань (CTT, IRT, класичний BKT, DKT)",
    "1.4 Децентралізовані стандарти непередаваних цифрових активів (Soulbound Tokens) та постановка завдань розробки",
    "РОЗДІЛ 2. МАТЕМАТИЧНЕ МОДЕЛЮВАННЯ ТА ПРОЄКТУВАННЯ АЛГОРИТМІВ ПЕРСОНАЛІЗОВАНОГО НАВЧАННЯ",
    "2.1 Обмеження класичної моделі BKT",
    "2.2 Модифікована модель BKT із динамічними регуляторами ймовірностей P(G_t) та P(S_t)",
    "2.3 Математичне правило числових границь з гарантованою асимптотою (Clamping Rule)",
    "2.4 Алгоритми багатовимірної сенсорної телеметрії кодописання та інтегральний коефіцієнт довіри C_trust",
    "2.5 Запобігання циклічності однотипних помилок та забезпечення підтримки (DAG Backtracking)",
    "2.6 Математична та криптографічна модель аудиту навчальних сесій і верифікації сертифікатів",
    "РОЗДІЛ 3. АРХІТЕКТУРА ТА ПРОГРАМНА РЕАЛІЗАЦІЯ ІНТЕЛЕКТУАЛЬНОЇ EDTECH-СИСТЕМИ",
    "3.1 Загальна мікросервісна та мікрофронтендна архітектура монорепозиторію",
    "3.2 Гексагональне аналітичне ядро бекенду (apps/api), WebSocket-шлюзи та схема бази даних",
    "3.3 Клієнтські підсистеми практичного кодування та методичного керування (apps/student, apps/teacher, apps/admin)",
    "3.4 Архітектура навчального простору первинної дидактики та рушія фокусування (apps/study та Zen Focus Reading Engine)",
    "3.5 Смарт-контракт децентралізованої сертифікації SoulboundCertificate у мережі Polygon",
    "РОЗДІЛ 4. ОРГАНІЗАЦІЯ ПРОЦЕСУ РОЗРОБКИ ТА УПРАВЛІННЯ ВИМОГАМИ ДО ПРОГРАМНОГО КОМПЛЕКСУ",
    "4.1 Гнучка методологія розробки, архітектура компонентів та декомпозиція епіків у системі Jira",
    "4.2 Регламент контролю версій, семантичне маркування коммітів (Jira Conventional Commits) та автоматизовані Git Hooks",
    "4.3 Автоматизований експорт та синхронізація артефактів проєктної аналітики",
    "4.4 Критерії готовності функціоналу (Definition of Done) та інженерна верифікація мікро-кроків",
    "РОЗДІЛ 5. ЕКСПЕРИМЕНТАЛЬНІ ДОСЛІДЖЕННЯ ТА ОЦІНКА ЕФЕКТИВНОСТІ РОЗРОБЛЕНОЇ СИСТЕМИ",
    "5.1 Методика організації комп'ютерного експерименту та характеристика тестового датасету",
    "5.2 Емпіричне порівняння діагностичної точності моделей (RMSE, AUC-ROC, час збіжності) та калібрування BKT",
    "5.3 Дослідження стійкості системи до академічного шахрайства та використання LLM-генераторів",
    "5.4 Навантажувальне тестування веб-сокетного ядра та оптимізація транзакційних витрат у блокчейні",
    "ЗАГАЛЬНІ ВИСНОВКИ",
    "СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ"
]

def update_comments_xml(comm_xml_bytes):
    tree = ET.fromstring(comm_xml_bytes)
    for c in tree.findall(f'{W}comment'):
        cid = c.attrib.get(f'{W}id')
        if cid in FIRST_PERSON_COMMENTS:
            t_elem = c.find(f'.//{W}t')
            if t_elem is not None:
                t_elem.text = FIRST_PERSON_COMMENTS[cid]
                print(f'Updated comment {cid} to first-person text.')
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def set_paragraph_heading2(p, full_text):
    pPr = p.find(f'{W}pPr')
    if pPr is None:
        pPr = ET.SubElement(p, f'{W}pPr')
    pStyle = pPr.find(f'{W}pStyle')
    if pStyle is None:
        pStyle = ET.SubElement(pPr, f'{W}pStyle')
    pStyle.attrib[f'{W}val'] = 'Heading2'
    
    # Remove existing runs and add a single clean run
    for r in p.findall(f'{W}r'):
        p.remove(r)
    
    r = ET.SubElement(p, f'{W}r')
    rPr = ET.SubElement(r, f'{W}rPr')
    rFonts = ET.SubElement(rPr, f'{W}rFonts')
    rFonts.attrib[f'{W}ascii'] = 'Times New Roman'
    rFonts.attrib[f'{W}hAnsi'] = 'Times New Roman'
    rFonts.attrib[f'{W}cs'] = 'Times New Roman'
    sz = ET.SubElement(rPr, f'{W}sz')
    sz.attrib[f'{W}val'] = '28'
    szCs = ET.SubElement(rPr, f'{W}szCs')
    szCs.attrib[f'{W}val'] = '28'
    b = ET.SubElement(rPr, f'{W}b')
    t = ET.SubElement(r, f'{W}t')
    t.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
    t.text = full_text

def update_document_xml(doc_xml_bytes):
    tree = ET.fromstring(doc_xml_bytes)
    body = tree.find(f'{W}body')
    paragraphs = body.findall(f'{W}p')
    print(f'Found {len(paragraphs)} body paragraphs in XML.')

    # 1. Update headings in Section 2 and Section 3
    for p in paragraphs:
        text = ''.join(p.itertext()).strip()
        
        # Section 2 fixes
        if 'Алгоритми багатовимірної сенсорної телеметрії' in text and p.find(f'{W}pPr/{W}pStyle[@{W}val="Heading2"]') is not None:
            set_paragraph_heading2(p, '2.4. Алгоритми багатовимірної сенсорної телеметрії кодописання та інтегральний коефіцієнт довіри C_trust')
            print('Set Heading 2.4')
        elif 'Запобігання циклічності однотипних помилок' in text and p.find(f'{W}pPr/{W}pStyle[@{W}val="Heading2"]') is not None:
            set_paragraph_heading2(p, '2.5. Запобігання циклічності однотипних помилок та забезпечення підтримки')
            print('Set Heading 2.5')
        elif 'Математична та криптографічна модель аудиту навчальних сесій' in text and p.find(f'{W}pPr/{W}pStyle[@{W}val="Heading2"]') is not None:
            set_paragraph_heading2(p, '2.6. Математична та криптографічна модель аудиту навчальних сесій і верифікації сертифікатів')
            print('Set Heading 2.6')

        # Section 3 fixes
        elif 'Клієнтські підсистеми платформи' in text and p.find(f'{W}pPr/{W}pStyle[@{W}val="Heading2"]') is not None:
            set_paragraph_heading2(p, '3.3. Клієнтські підсистеми практичного кодування та методичного керування (apps/student, apps/teacher, apps/admin)')
            print('Set Heading 3.3')
        elif 'apps/study (порт 3006)' in text and ('Простір теоретичного навчання' in text or '3.4.' in text):
            set_paragraph_heading2(p, '3.4. Архітектура навчального простору первинної дидактики та рушія фокусування (apps/study та Zen Focus Reading Engine)')
            print('Set Heading 3.4')
        elif 'SoulboundCertificate' in text and ('3.4.' in text or '3.5.' in text) and p.find(f'{W}pPr/{W}pStyle[@{W}val="Heading2"]') is not None:
            set_paragraph_heading2(p, '3.5. Смарт-контракт децентралізованої сертифікації SoulboundCertificate у мережі Polygon')
            print('Set Heading 3.5')

    # 2. Update Table of Contents (paragraphs 22..52)
    # Paragraph 21 is 'ЗМІСТ'. Paragraphs 22..52 are the 31 TOC items.
    # Locate TOC range
    toc_start_idx = None
    intro_idx = None
    for idx, p in enumerate(paragraphs):
        t = ''.join(p.itertext()).strip()
        if t == 'ЗМІСТ':
            toc_start_idx = idx + 1
        elif toc_start_idx is not None and t == 'ВСТУП' and p.find(f'{W}pPr/{W}pStyle[@{W}val="Heading1"]') is not None:
            intro_idx = idx
            break

    print(f'TOC start: {toc_start_idx}, Body ВСТУП: {intro_idx}')
    toc_paras = paragraphs[toc_start_idx:intro_idx]
    print(f'TOC paragraphs count: {len(toc_paras)}, New TOC lines count: {len(NEW_TOC_LINES)}')

    for i, line_text in enumerate(NEW_TOC_LINES):
        p = toc_paras[i]
        # Clear existing runs
        is_last = (i == len(NEW_TOC_LINES) - 1)
        for r in p.findall(f'{W}r'):
            p.remove(r)
        
        # Add run with text
        r = ET.SubElement(p, f'{W}r')
        rPr = ET.SubElement(r, f'{W}rPr')
        rFonts = ET.SubElement(rPr, f'{W}rFonts')
        rFonts.attrib[f'{W}ascii'] = 'Times New Roman'
        rFonts.attrib[f'{W}hAnsi'] = 'Times New Roman'
        rFonts.attrib[f'{W}cs'] = 'Times New Roman'
        sz = ET.SubElement(rPr, f'{W}sz')
        sz.attrib[f'{W}val'] = '28'
        t = ET.SubElement(r, f'{W}t')
        t.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
        t.text = line_text

        # If it's the last line (СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ), add a page break run after it
        if is_last:
            r_br = ET.SubElement(p, f'{W}r')
            br = ET.SubElement(r_br, f'{W}br')
            br.attrib[f'{W}type'] = 'page'

    print('Table of Contents successfully synchronized with page break preserved.')
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def main():
    src_path = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\RELEASE\V-13.7-Магістерська_робота_122.docx'
    dst_v13_8 = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\RELEASE\V-13.8-Магістерська_робота_122.docx'
    dst_main = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\Магістерська_робота_122.docx'

    print(f'Reading source: {src_path}')
    with zipfile.ZipFile(src_path, 'r') as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    print('Updating comments to first person...')
    files['word/comments.xml'] = update_comments_xml(files['word/comments.xml'])

    print('Updating document XML headings and TOC...')
    files['word/document.xml'] = update_document_xml(files['word/document.xml'])

    print(f'Writing to: {dst_v13_8}')
    with zipfile.ZipFile(dst_v13_8, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)

    print(f'Copying to: {dst_main}')
    shutil.copyfile(dst_v13_8, dst_main)
    print('Transformation complete!')

if __name__ == '__main__':
    main()
