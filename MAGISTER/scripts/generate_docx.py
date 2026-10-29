"""
Генератор магістерської кваліфікаційної роботи у форматі DOCX
за суворими вимогами Полтавського національного педагогічного університету імені В. Г. Короленка (ПНПУ):
- Додаток А (с. 62 методички): титульна сторінка ПНПУ
- Додаток Б (с. 63 методички): ЗМІСТ
- Вимоги с. 17-18 методички до ТАБЛИЦЬ:
  - Справжні Word-таблиці з рамками;
  - Назва над таблицею з абзацного відступу: «Таблиця X.Y — Назва таблиці»;
  - Шрифт тексту в таблиці: Times New Roman, 11-12 pt (на 2 пункти менше основного тексту);
  - Міжрядковий інтервал у таблиці: 1.0 - 1.15;
  - Вирівнювання шапки по центру, жирний шрифт, вирівнювання тексту в комірках.
"""

import os
import json
import re
import docx
from docx import Document
from docx.shared import Inches, Pt, Mm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def add_page_number_to_header(section):
    """Нумерація сторінок у правому верхньому куті (ДСТУ/ПНПУ)"""
    header = section.header
    section.different_first_page_header_footer = True
    p = header.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.first_line_indent = Mm(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    
    fldSimple = OxmlElement('w:fldSimple')
    fldSimple.set(qn('w:instr'), 'PAGE')
    run = p.add_run()
    run.font.name = 'Times New Roman'
    run.font.size = Pt(14)
    run._r.append(fldSimple)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Встановлює внутрішні відступи в комірці таблиці (dxa)"""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table):
    """Встановлює стандартну сітку для таблиці ДСТУ"""
    tblPr = table._tbl.tblPr
    borders_xml = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders_xml)

def render_formula(doc, raw_formula_text):
    """
    Рендерить математичну формулу згідно з академічним стандартом ДСТУ:
    - Формула по центру сторінки (85 мм)
    - Номер формули (наприклад, (1.1)) праворуч (170 мм)
    - Курсив для математичних змінних, прямий шрифт для чисел і дужок
    """
    clean = re.sub(r'^\[Формула:\s*', '', raw_formula_text.strip()).rstrip(']')
    
    # Витягуємо номер формули з кінця рядка (наприклад, | (1.1))
    m = re.search(r'\|\s*(\(\d+\.\d+\))\s*$', clean)
    if m:
        num_str = m.group(1).strip()
        formula_body = clean[:m.start()].strip()
    else:
        num_str = ""
        formula_body = clean.strip()

    # 1. Заміна дробів \frac{чисельник}{знаменник} -> [ чисельник ] / [ знаменник ]
    frac_pat = r'\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}'
    while True:
        m_frac = re.search(frac_pat, formula_body)
        if not m_frac:
            break
        num = m_frac.group(1).strip()
        denom = m_frac.group(2).strip()
        formula_body = formula_body[:m_frac.start()] + f"[{num}] / [{denom}]" + formula_body[m_frac.end():]

    # 2. Заміна квадратного кореня \sqrt{вираз} -> √[ вираз ]
    sqrt_pat = r'\\sqrt\{((?:[^{}]|\{[^{}]*\})*)\}'
    while True:
        m_sqrt = re.search(sqrt_pat, formula_body)
        if not m_sqrt:
            break
        content = m_sqrt.group(1).strip()
        formula_body = formula_body[:m_sqrt.start()] + f"√[ {content} ]" + formula_body[m_sqrt.end():]

    # 3. Приводимо математичні символи до охайного типографічного вигляду
    formula_body = formula_body.replace(r'\cdot', '·')
    formula_body = formula_body.replace('*', '·')
    formula_body = formula_body.replace(r'\in', '∈')
    formula_body = formula_body.replace(r'\ge', '≥')
    formula_body = formula_body.replace(r'\left(', '(').replace(r'\right)', ')')
    formula_body = formula_body.replace(r'\left[', '[').replace(r'\right]', ']')
    formula_body = formula_body.replace(r'\le', '≤')
    formula_body = formula_body.replace(r'\ge', '≥')
    formula_body = formula_body.replace(r'\gg', '≫')
    formula_body = formula_body.replace(r'\sum', '∑')
    formula_body = formula_body.replace(r'\langle', '⟨')
    formula_body = formula_body.replace(r'\rangle', '⟩')
    formula_body = formula_body.replace(r'\{', '{').replace(r'\}', '}')
    formula_body = formula_body.replace(r'\alpha', 'α')
    formula_body = formula_body.replace(r'\beta', 'β')
    formula_body = formula_body.replace(r'\theta', 'θ')
    formula_body = formula_body.replace(r'\Delta', 'Δ')
    formula_body = formula_body.replace(r'\exp', 'exp')

    # 4. Видаляємо зайві фігурні дужки у простих індексах на зразок _{t-1} -> _{t-1}
    formula_body = re.sub(r'\{([^{}]+)\}', r'\1', formula_body)

    # 5. Очищення від випадкових керівних символів
    formula_body = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', formula_body)
    num_str = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', num_str)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.first_line_indent = Mm(0)
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.5

    # Додаємо табуляції: центр (85 мм) і правий край (170 мм)
    tab_stops = p.paragraph_format.tab_stops
    tab_stops.add_tab_stop(Mm(85), WD_TAB_ALIGNMENT.CENTER)
    tab_stops.add_tab_stop(Mm(170), WD_TAB_ALIGNMENT.RIGHT)

    # Табуляція до центру
    p.add_run('\t')
    run_f = p.add_run(formula_body)
    run_f.font.name = 'Times New Roman'
    run_f.font.size = Pt(13)
    run_f.italic = True

    # Табуляція до правого краю та номер формули
    if num_str:
        p.add_run('\t')
        run_n = p.add_run(num_str)
        run_n.font.name = 'Times New Roman'
        run_n.font.size = Pt(14)
        run_n.bold = False

def render_real_table(doc, raw_table_text):
    """
    Парсить розмітку таблиці та вставляє реальну Word-таблицю
    [Таблиця: Заголовок 1 | Заголовок 2 ...]
    - Рядок 1: Комірка 1 | Комірка 2
    """
    lines = raw_table_text.strip().split('\n')
    header_line = lines[0].strip()
    
    # Витягуємо шапку: [Таблиця: A | B | C]
    clean_hdr = re.sub(r'^\[Таблиця:\s*', '', header_line).rstrip(']')
    headers = [h.strip() for h in clean_hdr.split('|') if h.strip()]
    
    # Витягуємо рядки
    data_rows = []
    for line in lines[1:]:
        l = line.strip()
        if not l:
            continue
        l = re.sub(r'^[•\-\*]\s*', '', l).rstrip(';')
        parts = [p.strip() for p in l.split('|')]
        # Якщо перший стовпчик містив двокрапку замість пайпа (наприклад, Критерій: LMS)
        if len(parts) == len(headers) - 1 and ':' in parts[0]:
            col0, col1 = parts[0].split(':', 1)
            parts = [col0.strip(), col1.strip()] + parts[1:]
        # Вирівнюємо довжину рядка під шапку
        while len(parts) < len(headers):
            parts.append('')
        if len(parts) > len(headers):
            parts = parts[:len(headers)]
        data_rows.append(parts)

    table = doc.add_table(rows=len(data_rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    # Пропорційні ширини стовпчиків (загальна ширина 170 мм)
    col_widths = []
    if len(headers) == 5:
        # Для порівняльної таблиці 1.1: 30 мм, 35 мм, 35 мм, 35 мм, 35 мм
        col_widths = [Mm(30), Mm(35), Mm(35), Mm(35), Mm(35)]
    elif len(headers) == 4:
        # Для таблиці 3.1: 50 мм, 40 мм, 40 мм, 40 мм
        col_widths = [Mm(50), Mm(40), Mm(40), Mm(40)]

    # Заповнюємо шапку (Header row)
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        cell = hdr_cells[i]
        if col_widths and i < len(col_widths):
            cell.width = col_widths[i]
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.first_line_indent = Mm(0)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(title)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11)

    # Заповнюємо дані (Data rows)
    for r_idx, row_data in enumerate(data_rows):
        row_cells = table.rows[r_idx + 1].cells
        for c_idx, val in enumerate(row_data):
            cell = row_cells[c_idx]
            if col_widths and c_idx < len(col_widths):
                cell.width = col_widths[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            p = cell.paragraphs[0]
            p.paragraph_format.first_line_indent = Mm(0)
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            # Якщо перший стовпчик або коротке число/код — вирівнюємо відповідно
            if c_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            run = p.add_run(val)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10.5)

    # Додаємо порожній рядок після таблиці для нормального відступу
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(6)
    p_after.paragraph_format.space_after = Pt(0)
    p_after.paragraph_format.line_spacing = 1.5

def create_master_thesis_doc(spec_path: str, output_path: str):
    with open(spec_path, 'r', encoding='utf-8') as f:
        spec = json.load(f)

    doc = Document()

    # 1. Параметри сторінки А4
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.top_margin = Mm(20)
    section.bottom_margin = Mm(20)
    section.left_margin = Mm(30)
    section.right_margin = Mm(10)

    add_page_number_to_header(section)

    # 2. Базовий стиль Normal
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(14)
    font.color.rgb = RGBColor(0, 0, 0)
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    style_normal.paragraph_format.first_line_indent = Mm(12.5) # 1.25 см
    style_normal.paragraph_format.space_after = Pt(0)
    style_normal.paragraph_format.space_before = Pt(0)

    # 3. Налаштування стилів заголовків для повноцінної навігації (Outline Navigation)
    # Heading 1: Для структурних частин (ВСТУП, РОЗДІЛ X, ВИСНОВКИ)
    style_h1 = doc.styles['Heading 1']
    font_h1 = style_h1.font
    font_h1.name = 'Times New Roman'
    font_h1.size = Pt(14)
    font_h1.bold = True
    font_h1.color.rgb = RGBColor(0, 0, 0)
    style_h1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_h1.paragraph_format.first_line_indent = Mm(0)
    style_h1.paragraph_format.line_spacing = 1.5
    style_h1.paragraph_format.space_before = Pt(18)
    style_h1.paragraph_format.space_after = Pt(18)

    # Heading 2: Для підрозділів (1.1, 1.2 тощо)
    style_h2 = doc.styles['Heading 2']
    font_h2 = style_h2.font
    font_h2.name = 'Times New Roman'
    font_h2.size = Pt(14)
    font_h2.bold = True
    font_h2.color.rgb = RGBColor(0, 0, 0)
    style_h2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    style_h2.paragraph_format.first_line_indent = Mm(12.5)
    style_h2.paragraph_format.line_spacing = 1.5
    style_h2.paragraph_format.space_before = Pt(24)
    style_h2.paragraph_format.space_after = Pt(12)

    meta = spec.get('meta', {})
    sections = spec.get('sections', [])

    def add_major_heading(text: str):
        """Заголовок структурної частини: стиль Heading 1, великими літерами, по центру, жирний 14pt, без крапки"""
        p = doc.add_paragraph(style='Heading 1')
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.first_line_indent = Mm(0)
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(18)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(text.upper())
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)

    def add_chapter_heading(number: int, text: str):
        """Заголовок розділу: стиль Heading 1, РОЗДІЛ X: НАЗВА (по центру, жирний 14pt)"""
        p = doc.add_paragraph(style='Heading 1')
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.first_line_indent = Mm(0)
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(24)
        p.paragraph_format.line_spacing = 1.5
        
        r1 = p.add_run(f"РОЗДІЛ {number}\n")
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)

        r2 = p.add_run(text.upper())
        r2.bold = True
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    def add_subchapter_heading(number: str, text: str):
        """Заголовок підрозділу: стиль Heading 2, з абзацу 1.25 см, жирний 14pt, без крапки"""
        p = doc.add_paragraph(style='Heading 2')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.first_line_indent = Mm(12.5)
        p.paragraph_format.space_before = Pt(24)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(f"{number}. {text}")
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)

    def add_table_title(table_title_text: str):
        """Назва таблиці за ДСТУ (с. 17 методички): з абзацного відступу 1.25 см, без відступу після"""
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.first_line_indent = Mm(12.5)
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(table_title_text)
        run.bold = False
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)

    def add_body_paragraph(text: str):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.first_line_indent = Mm(12.5)
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.space_before = Pt(0)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)

    # ==================== 1. ТИТУЛЬНА СТОРІНКА ПНПУ (ДОДАТОК А) ====================
    p_hdr = doc.add_paragraph()
    p_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_hdr.paragraph_format.first_line_indent = Mm(0)
    p_hdr.paragraph_format.line_spacing = 1.15
    r_hdr = p_hdr.add_run(
        "Міністерство освіти і науки України\n"
        "Полтавський національний педагогічний університет\n"
        "імені В. Г. Короленка\n"
        "Факультет комп'ютерних наук, математики, фізики та економіки\n"
        "Кафедра математичного аналізу та інформатики\n\n"
    )
    r_hdr.font.name = 'Times New Roman'
    r_hdr.font.size = Pt(12)

    p_rec = doc.add_paragraph()
    p_rec.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_rec.paragraph_format.first_line_indent = Mm(0)
    p_rec.paragraph_format.line_spacing = 1.15
    r_rec = p_rec.add_run(
        "Рекомендовано до захисту\n"
        "«____» ____________ 2026 р.,\n"
        "протокол № _________\n"
        "Завкафедри ____________________\n"
        "                               (підпис)\n\n"
    )
    r_rec.font.name = 'Times New Roman'
    r_rec.font.size = Pt(11)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.first_line_indent = Mm(0)
    p_title.paragraph_format.line_spacing = 1.3
    r_t1 = p_title.add_run("Кваліфікаційна робота\n")
    r_t1.bold = True
    r_t1.font.size = Pt(14)
    r_t2 = p_title.add_run("на здобуття другого (магістерського)\nрівня вищої освіти\n\n")
    r_t2.font.size = Pt(13)

    r_top = p_title.add_run(f"«{meta.get('topic', '')}»\n\n")
    r_top.bold = True
    r_top.font.size = Pt(14)

    p_stu = doc.add_paragraph()
    p_stu.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_stu.paragraph_format.first_line_indent = Mm(85)
    p_stu.paragraph_format.line_spacing = 1.15
    r_stu = p_stu.add_run(
        "Виконав: студент VI курсу\n"
        "денної форми навчання\n"
        "спеціальності 122 Комп'ютерні науки\n"
        "освітньої програми Комп'ютерні науки\n"
        "Стеценко Дмитро\n\n"
        "Науковий керівник:\n"
        "_____________________________________\n"
        "(науковий ступінь, вчене звання, ПІБ)\n\n"
        "Рецензент:\n"
        "_____________________________________\n"
        "(науковий ступінь, вчене звання, ПІБ)\n\n"
    )
    r_stu.font.name = 'Times New Roman'
    r_stu.font.size = Pt(11)

    p_def = doc.add_paragraph()
    p_def.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_def.paragraph_format.first_line_indent = Mm(0)
    p_def.paragraph_format.line_spacing = 1.1
    r_def = p_def.add_run(
        "Захищено «____» ________________ 2026 р.\n"
        "кількість балів: ____________\n"
        "значення оцінки: ___________\n"
        "Голова Екзаменаційної комісії _____________________\n"
        "                                                               (підпис)\n"
    )
    r_def.font.name = 'Times New Roman'
    r_def.font.size = Pt(10)

    p_city = doc.add_paragraph()
    p_city.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_city.paragraph_format.first_line_indent = Mm(0)
    r_c = p_city.add_run("\nПолтава – 2026")
    r_c.font.size = Pt(12)

    doc.add_page_break()

    # ==================== 2. ЗМІСТ (ДОДАТОК Б, СТОРІНКА 2) ====================
    add_major_heading("ЗМІСТ")
    
    p_t_int = doc.add_paragraph()
    p_t_int.paragraph_format.first_line_indent = Mm(0)
    p_t_int.paragraph_format.space_before = Pt(4)
    p_t_int.paragraph_format.space_after = Pt(4)
    p_t_int.add_run("ВСТУП").bold = True

    for sec in sections:
        sec_type = sec.get('type')
        title = sec.get('title')
        if sec_type in ['introductory']:
            continue
        elif sec_type in ['concluding', 'bibliography']:
            p_t = doc.add_paragraph()
            p_t.paragraph_format.first_line_indent = Mm(0)
            p_t.paragraph_format.space_before = Pt(6)
            p_t.paragraph_format.space_after = Pt(4)
            p_t.add_run(title).bold = True
        else:
            num = sec.get('number', '')
            p_t = doc.add_paragraph()
            p_t.paragraph_format.first_line_indent = Mm(0)
            p_t.paragraph_format.space_before = Pt(6)
            p_t.paragraph_format.space_after = Pt(2)
            p_t.add_run(f"РОЗДІЛ {num}. {title}").bold = True
            for sub in sec.get('subsections', []):
                p_sub = doc.add_paragraph()
                p_sub.paragraph_format.first_line_indent = Mm(6.25)
                p_sub.paragraph_format.space_before = Pt(0)
                p_sub.paragraph_format.space_after = Pt(0)
                p_sub.add_run(f"{sub.get('number')} {sub.get('title')}")

    # ==================== 3. ОСНОВНА ЧАСТИНА ====================
    def process_content_blocks(content_str):
        """Розбиває текст на параграфи та табличні блоки"""
        paragraphs = content_str.split('\n\n')
        i = 0
        while i < len(paragraphs):
            p_text = paragraphs[i].strip()
            if not p_text:
                i += 1
                continue
            
            # Якщо параграф містить таблицю (починається з "Таблиця " або містить "[Таблиця:")
            if 'Таблиця ' in p_text and '[Таблиця:' in p_text:
                lines = p_text.split('\n')
                # Перший рядок - назва таблиці
                title_line = lines[0].strip()
                add_table_title(title_line)
                # Решта рядків - розмітка таблиці
                table_body = '\n'.join(lines[1:]).strip()
                render_real_table(doc, table_body)
                i += 1
                continue

            # Якщо назва таблиці і розмітка йдуть двома різними параграфами
            if p_text.startswith('Таблиця ') and ('—' in p_text or '-' in p_text) and i + 1 < len(paragraphs) and '[Таблиця:' in paragraphs[i+1]:
                add_table_title(p_text)
                render_real_table(doc, paragraphs[i+1].strip())
                i += 2
                continue
            
            # Якщо розмітка йде без назви
            if p_text.startswith('[Таблиця:'):
                render_real_table(doc, p_text)
                i += 1
                continue

            # Якщо блок є формулою або містить кілька формул підряд
            if '[Формула:' in p_text:
                lines = p_text.split('\n')
                for line in lines:
                    line_s = line.strip()
                    if not line_s:
                        continue
                    if line_s.startswith('[Формула:'):
                        render_formula(doc, line_s)
                    else:
                        add_body_paragraph(line_s)
                i += 1
                continue
            
            add_body_paragraph(p_text)
            i += 1

    for sec in sections:
        doc.add_page_break()
        sec_type = sec.get('type')
        title = sec.get('title')
        content = sec.get('content', '')

        if sec_type in ['introductory', 'concluding', 'bibliography']:
            add_major_heading(title)
            if content:
                process_content_blocks(content)
        else:
            num = sec.get('number', '')
            add_chapter_heading(num, title)
            for sub in sec.get('subsections', []):
                sub_num = sub.get('number', '')
                sub_title = sub.get('title', '')
                add_subchapter_heading(sub_num, sub_title)
                sub_content = sub.get('content', '')
                if sub_content:
                    process_content_blocks(sub_content)

    doc.save(output_path)
    print(f"Документ з повноцінними Word-таблицями успішно створено: {output_path}")

if __name__ == '__main__':
    spec = os.path.join(os.path.dirname(__file__), '..', 'KN', 'thesis_spec.json')
    out = os.path.join(os.path.dirname(__file__), '..', 'KN', 'Магістерська_робота_122.docx')
    create_master_thesis_doc(spec, out)
