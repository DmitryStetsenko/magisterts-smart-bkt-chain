"""
Професійний генератор тез доповіді та заявки для конференції IICTE-2026
відповідно до інженерних стандартів магістерського дослідження:
- Повна підтримка нативних Word Equation (m:oMath / OMML) з вертикальними дробами (m:f) та підрядковими індексами (m:sSub);
- Дворівнева табуляція для формул: центр 80 мм (WD_TAB_ALIGNMENT.CENTER), правий край 158 мм (WD_TAB_ALIGNMENT.RIGHT);
- Реальні таблиці за стандартом ДСТУ (Table Grid, заливка шапки, точні ширини колонок у сумі 160 мм);
- Всі поля сторінки рівно 25 мм з усіх чотирьох сторін;
- Шрифт Times New Roman: заголовок 18 пт жирний по центру, автор 14 пт bold italic, керівник 14 пт italic, основний текст 14 пт justify, список джерел 12 пт;
- Повна ізоляція та версіонування у підкаталозі RELEASE/.
"""

import os
import re
import json
import shutil
from docx import Document
from docx.shared import Pt, Mm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import qn, nsdecls

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFERENCE_DIR = os.path.dirname(SCRIPT_DIR)
RELEASE_DIR = os.path.join(CONFERENCE_DIR, "RELEASE")
SPEC_PATH = os.path.join(CONFERENCE_DIR, "theses_spec.json")

os.makedirs(RELEASE_DIR, exist_ok=True)

VERSION = "V-3.0"
AUTHOR_SURNAME = "Стеценко"

THESES_VERSIONED_PATH = os.path.join(RELEASE_DIR, f"{VERSION}-{AUTHOR_SURNAME}_тези.docx")
APPLICATION_VERSIONED_PATH = os.path.join(RELEASE_DIR, f"{VERSION}-{AUTHOR_SURNAME}_заявка.docx")
THESES_SUBMISSION_PATH = os.path.join(RELEASE_DIR, f"{AUTHOR_SURNAME}_тези.docx")
APPLICATION_SUBMISSION_PATH = os.path.join(RELEASE_DIR, f"{AUTHOR_SURNAME}_заявка.docx")

M = 'http://schemas.openxmlformats.org/officeDocument/2006/math'
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

# --- MATH OMML BUILDERS ---

def r(text):
    return f'<m:r xmlns:m="{M}"><m:t>{text}</m:t></m:r>'

def sub(base, subscript):
    return (
        f'<m:sSub xmlns:m="{M}">'
        f'<m:e>{r(base)}</m:e>'
        f'<m:sub>{r(subscript)}</m:sub>'
        f'</m:sSub>'
    )

def frac(num_xml, den_xml):
    return f'<m:f xmlns:m="{M}"><m:num>{num_xml}</m:num><m:den>{den_xml}</m:den></m:f>'

def build_native_omath(num_id: str):
    """Будує нативний об'єкт m:oMath Word Equation для відповідної формули з повною підтримкою Unicode-операторів."""
    if num_id == "(1)":
        return parse_xml(
            f'<m:oMath xmlns:m="{M}">'
            f'{r("P(")}{sub("L", "n")}{r(" | ")}{sub("Y", "n")}{r(" = 1) = ")}'
            f'{frac(r("P(") + sub("L", "n-1") + r(") \u00b7 (1 \u2212 P(S))"), r("P(") + sub("L", "n-1") + r(") \u00b7 (1 \u2212 P(S)) + (1 \u2212 P(") + sub("L", "n-1") + r(")) \u00b7 P(G)"))}'
            f'</m:oMath>'
        )
    elif num_id == "(2)":
        return parse_xml(
            f'<m:oMath xmlns:m="{M}">'
            f'{r("P(")}{sub("L", "n")}{r(" | ")}{sub("Y", "n")}{r(" = 0) = ")}'
            f'{frac(r("P(") + sub("L", "n-1") + r(") \u00b7 P(S)"), r("P(") + sub("L", "n-1") + r(") \u00b7 P(S) + (1 \u2212 P(") + sub("L", "n-1") + r(")) \u00b7 (1 \u2212 P(G))"))}'
            f'</m:oMath>'
        )
    elif num_id == "(3)":
        return parse_xml(
            f'<m:oMath xmlns:m="{M}">'
            f'{r("P(")}{sub("L", "n")}{r(") = P(")}{sub("L", "n")}{r(" | ")}{sub("Y", "n")}{r(") + (1 \u2212 P(")}{sub("L", "n")}{r(" | ")}{sub("Y", "n")}{r(")) \u00b7 P(T)")}'
            f'</m:oMath>'
        )
    elif num_id == "(4)":
        return parse_xml(
            f'<m:oMath xmlns:m="{M}">'
            f'{r("P(")}{sub("L", "n")}{r(") \u2265 ")}{sub("\u03c4", "mastery")}'
            f'</m:oMath>'
        )
    elif num_id == "(5)":
        return parse_xml(
            f'<m:oMath xmlns:m="{M}">'
            f'{r("\u2200")}{sub("KC", "i")}{r(" \u2208 ")}'
            f'<m:r><m:rPr><m:nor/></m:rPr><m:t>Pre</m:t></m:r>'
            f'{r("(") + sub("KC", "j") + r("): P(")}'
            f'<m:sSub><m:e>{r("L")}</m:e><m:sub><m:sSub><m:e>{r("KC")}</m:e><m:sub>{r("i")}</m:sub></m:sSub></m:sub></m:sSub>'
            f'{r(") \u2265 ") + sub("\u03c4", "mastery")}'
            f'</m:oMath>'
        )
    elif num_id == "(6)":
        return parse_xml(
            f'<m:oMath xmlns:m="{M}">'
            f'<m:sSub><m:e>{r("C")}</m:e><m:sub><m:r><m:rPr><m:nor/></m:rPr><m:t>trust</m:t></m:r></m:sub></m:sSub>'
            f'{r(" = ")}{sub("w", "1")}{r(" \u00b7 \u03c8(WPM) + ")}{sub("w", "2")}{r(" \u00b7 (1 \u2212 ")}'
            f'<m:sSub><m:e>{r("R")}</m:e><m:sub><m:r><m:rPr><m:nor/></m:rPr><m:t>paste</m:t></m:r></m:sub></m:sSub>'
            f'{r(") + ")}{sub("w", "3")}{r(" \u00b7 \u03c6(\u0394")}{sub("t", "pause")}{r(")")}'
            f'</m:oMath>'
        )
    elif num_id == "(7)":
        return parse_xml(
            f'<m:oMath xmlns:m="{M}">'
            f'<m:sSub><m:e>{r("P")}</m:e><m:sub><m:r><m:rPr><m:nor/></m:rPr><m:t>adj</m:t></m:r></m:sub></m:sSub>'
            f'{r("(G) = min(0,90, P(G) + (1 \u2212 P(G)) \u00b7 (1 \u2212 ")}'
            f'<m:sSub><m:e>{r("C")}</m:e><m:sub><m:r><m:rPr><m:nor/></m:rPr><m:t>trust</m:t></m:r></m:sub></m:sSub>'
            f'{r("))")}'
            f'</m:oMath>'
        )
    return None

# --- TEXT & TABLE HELPERS ---

def enforce_ltr(p):
    """Явно встановлює w:bidi val="0", запобігаючи довільному включенню RTL під час експорту у PDF."""
    pPr = p._element.get_or_add_pPr()
    for b in pPr.findall(qn('w:bidi')):
        pPr.remove(b)
    pPr.append(parse_xml(f'<w:bidi {nsdecls("w")} w:val="0"/>'))

def clean_inline_math(text: str) -> str:
    """Очищує параграф від сирого LaTeX і замінює на чисті математичні юнікод-символи"""
    t = text
    # Зберігаємо екрановані фігурні дужки множин \{ ... \}
    t = t.replace(r'\{', '__LBRACE__').replace(r'\}', '__RBRACE__')

    t = re.sub(r'\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}', r'[\1] / [\2]', t)
    t = re.sub(r'\\sqrt\{((?:[^{}]|\{[^{}]*\})*)\}', r'√(\1)', t)
    
    replacements = [
        (r'\rightarrow', '→'), (r'\leftarrow', '←'), (r'\leftrightarrow', '↔'),
        (r'\approx', '≈'), (r'\neq', '≠'), (r'\ge', '≥'), (r'\le', '≤'),
        (r'\in', '∈'), (r'\notin', '∉'), (r'\cdot', '·'), (r'\times', '×'),
        (r'\sum', '∑'), (r'\forall', '∀'), (r'\exists', '∃'),
        (r'\Delta', 'Δ'), (r'\theta', 'θ'), (r'\tau', 'τ'),
        (r'\alpha', 'α'), (r'\beta', 'β'), (r'\psi', 'ψ'), (r'\phi', 'φ'),
        (r'\sigma', 'σ'), (r'\mu', 'μ'), (r'\lambda', 'λ'),
        (r'\to', '→'), (r'\quad', '  '), (r'\text', ''), (r'\\_', '_'),
    ]
    for r_from, r_to in replacements:
        t = t.replace(r_from, r_to)
        
    t = re.sub(r'\{([^{}]+)\}', r'\1', t)
    t = t.replace('\\', '')
    
    # Відновлюємо дужки множин
    t = t.replace('__LBRACE__', '{').replace('__RBRACE__', '}')
    
    # Текстові специфічні математичні заміни для академічної чистоти
    text_replacements = [
        ('psi(WPM)', 'ψ(WPM)'),
        ('phi(Delta t_pause)', 'φ(Δt_pause)'),
        ('Delta t_pause', 'Δt_pause'),
        ('Δ t_pause', 'Δt_pause'),
        ('Δ t', 'Δt'),
        ('tau_mastery', 'τ_mastery'),
        ('P(L_n-1)', 'P(L_{n-1})'),
        ('KC_j', 'KC_j'),
        ('KC_i', 'KC_i'),
        ('R_paste', 'R_paste'),
        ('C_trust', 'C_trust'),
        ('P_adj(G)', 'P_adj(G)'),
        ('w_1, w_2, w_3', 'w_1, w_2, w_3'),
        ('Explainable AI XAI', 'Explainable AI (XAI)'),
        ('Deep Knowledge Tracing DKT', 'Deep Knowledge Tracing (DKT)'),
        ('26,4 %', '26,4%'),
        ('18,6 %', '18,6%'),
        ('11,5 %', '11,5%'),
        ('38,1 %', '38,1%'),
        ('35,5 %', '35,5%'),
        ('обгрунтування', 'обґрунтування'),
        ('необгрунтований', 'необґрунтований'),
        ('0,15 P(T)', '0,15, P(T)'),
        ('K_err ≥ 3', 'K_err ≥ 3'),
    ]
    for r_from, r_to in text_replacements:
        t = t.replace(r_from, r_to)

    # Виправлення можливих кириличних гомогліфів у латинських термінах та математиці
    t = re.sub(r'[\u041D]MM', 'HMM', t)                       # Кирилична 'Н' в HMM
    t = re.sub(r'[\u0412]ayesian', 'Bayesian', t)               # Кирилична 'В' в Bayesian
    t = re.sub(r'[KКkк][CСcс]_[jј]', 'KC_j', t)               # Будь-які комбінації гомогліфів KC_j
    t = re.sub(r'[KКkк][CСcс]_[iі]', 'KC_i', t)               # Будь-які комбінації гомогліфів KC_i
    t = re.sub(r'на поточному кроці [\u043Fп]', 'на поточному кроці n', t) # Кирилична 'п' -> латинська n
    t = re.sub(r'[\u0442т]_mastery', 'τ_mastery', t)           # Кирилична 'т' -> грецька τ
    t = re.sub(r'n\s*=\s*1,\s*2,\s*\.\.\.,\s*№', 'n = 1, 2, ..., N', t) # Знак номера -> N

    return t

def set_cell_margins(cell, top=60, bottom=60, left=80, right=80):
    """Встановлює компактні внутрішні поля комірки таблиці."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m_name, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m_name}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, hex_color="F2F4F8"):
    """Встановлює фонову заливку комірки таблиці."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="{hex_color}"/>')
    tcPr.append(shd)

def render_formula(doc, raw_formula_text):
    """
    Рендерить математичну формулу згідно з академічним стандартом магістерської роботи:
    - Відступи: 0 см зліва і справа, без абзацного відступу;
    - Дворівнева табуляція: центр 80 мм (для 160 мм друкованої області), правий край 158.0 мм (із запасом);
    - Нативний Word Equation (m:oMath) з вертикальними дробами та нижніми індексами;
    - Номер формули (1) праворуч у Times New Roman 14 pt (звичайний);
    - Компактні відступи 2.5 pt перед і після формули.
    """
    clean = re.sub(r'^\[Формула:\s*', '', raw_formula_text.strip()).rstrip(']')
    
    m_num = re.search(r'\|\s*(\(\d+\))\s*$', clean)
    if m_num:
        num_str = m_num.group(1).strip()
        formula_body = clean[:m_num.start()].strip()
    else:
        num_str = ""
        formula_body = clean.strip()

    p = doc.add_paragraph()
    enforce_ltr(p)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.left_indent = Mm(0)
    p.paragraph_format.right_indent = Mm(0)
    p.paragraph_format.first_line_indent = Mm(0)
    p.paragraph_format.space_before = Pt(2.5)
    p.paragraph_format.space_after = Pt(2.5)
    p.paragraph_format.line_spacing = 1.0

    # Табулятори: 80 мм (центр), 158.0 мм (правий край із запасом 2 мм для уникнення переносу номера)
    tab_stops = p.paragraph_format.tab_stops
    tab_stops.add_tab_stop(Mm(80), WD_TAB_ALIGNMENT.CENTER)
    tab_stops.add_tab_stop(Mm(158.0), WD_TAB_ALIGNMENT.RIGHT)

    p.add_run('\t')

    omath_elem = build_native_omath(num_str)
    if omath_elem is not None:
        p._element.append(omath_elem)
    else:
        clean_body = clean_inline_math(formula_body)
        run_f = p.add_run(clean_body)
        run_f.font.name = 'Times New Roman'
        run_f.font.size = Pt(13)
        run_f.italic = True

    if num_str:
        p.add_run('\t')
        run_n = p.add_run(num_str)
        run_n.font.name = 'Times New Roman'
        run_n.font.size = Pt(14)
        run_n.bold = False

def render_real_table(doc, raw_table_text):
    """
    Парсить розмітку таблиці та генерує реальну Word-таблицю за стандартом ДСТУ:
    Ширина колонок строго розподілена до 160 мм.
    """
    lines = raw_table_text.strip().split('\n')
    header_line = lines[0].strip()
    clean_hdr = re.sub(r'^\[Таблиця:\s*', '', header_line).rstrip(']')
    headers = [h.strip() for h in clean_hdr.split('|') if h.strip()]
    
    data_rows = []
    for line in lines[1:]:
        l = line.strip()
        if not l:
            continue
        l = re.sub(r'^[•\-\*]\s*', '', l).rstrip(';')
        parts = [p.strip() for p in l.split('|')]
        while len(parts) < len(headers):
            parts.append('')
        if len(parts) > len(headers):
            parts = parts[:len(headers)]
        data_rows.append(parts)

    table = doc.add_table(rows=0, cols=len(headers))
    table.style = 'Table Grid'
    table.autofit = False

    # Розподіл ширин для 4 колонок (разом = 160 мм)
    if len(headers) == 4:
        col_widths = [Mm(52), Mm(32), Mm(44), Mm(32)]
    else:
        avg_w = 160.0 / len(headers)
        col_widths = [Mm(avg_w)] * len(headers)

    # 1. Шапка таблиці
    row_hdr = table.add_row()
    trPr = row_hdr._element.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

    for i, h_text in enumerate(headers):
        cell = row_hdr.cells[i]
        cell.width = col_widths[i]
        set_cell_margins(cell, top=45, bottom=45, left=70, right=70)
        set_cell_background(cell, "F2F4F8")
        p = cell.paragraphs[0]
        enforce_ltr(p)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.first_line_indent = Mm(0)
        p.paragraph_format.space_before = Pt(1.0)
        p.paragraph_format.space_after = Pt(1.0)
        run = p.add_run(clean_inline_math(h_text))
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11)

    # 2. Рядки даних
    for r_idx, r_data in enumerate(data_rows):
        row_data = table.add_row()
        trPr_d = row_data._element.get_or_add_trPr()
        trPr_d.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

        for c_idx, val in enumerate(r_data):
            cell = row_data.cells[c_idx]
            cell.width = col_widths[c_idx]
            set_cell_margins(cell, top=40, bottom=40, left=70, right=70)
            if r_idx % 2 == 1:
                set_cell_background(cell, "FAFAFB")

            p = cell.paragraphs[0]
            enforce_ltr(p)
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.first_line_indent = Mm(0)
            p.paragraph_format.space_before = Pt(1.0)
            p.paragraph_format.space_after = Pt(1.0)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx == 0 else WD_ALIGN_PARAGRAPH.CENTER

            run = p.add_run(clean_inline_math(val))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(11)

def compile_theses_from_spec(spec_data: dict, output_path: str):
    """Створює повний Word-документ тез на основі specification."""
    doc = Document()
    meta = spec_data['metadata']

    # 1. Поля сторінки рівно 25 мм
    for s in doc.sections:
        s.top_margin = Mm(25)
        s.bottom_margin = Mm(25)
        s.left_margin = Mm(25)
        s.right_margin = Mm(25)
        s.page_width = Mm(210)
        s.page_height = Mm(297)

    # 2. Базовий стиль Normal
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(14)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.0
    normal_style.paragraph_format.space_before = Pt(0)
    normal_style.paragraph_format.space_after = Pt(0)

    # 3. Назва доповіді (18 пт, жирний, центр)
    p_title = doc.add_paragraph()
    enforce_ltr(p_title)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(10)
    p_title.paragraph_format.line_spacing = 1.0
    run_title = p_title.add_run(meta['title'].upper())
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(18)
    run_title.font.bold = True

    # 4. Відомості про автора (праворуч)
    auth = meta['author']
    p_author = doc.add_paragraph()
    enforce_ltr(p_author)
    p_author.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_author.paragraph_format.line_spacing = 1.0
    p_author.paragraph_format.space_before = Pt(0)
    p_author.paragraph_format.space_after = Pt(2)
    
    run_an = p_author.add_run(auth['initials'] + "\n")
    run_an.font.name = 'Times New Roman'
    run_an.font.size = Pt(14)
    run_an.font.bold = True
    run_an.font.italic = True

    author_lines = [
        f"{auth['position']}",
        f"{auth['university']}, {auth['city']}",
        f"e-mail: {auth['email']}"
    ]
    for l in author_lines:
        run_al = p_author.add_run(l + "\n")
        run_al.font.name = 'Times New Roman'
        run_al.font.size = Pt(14)
        run_al.font.italic = True

    # 5. Відомості про наукового керівника: за вимогою оргкомітету та наукового керівника
    # не включаються у шапку тез (зазначаються лише в офіційній заявці учасника)

    # Порожній рядок перед текстом
    p_blank = doc.add_paragraph()
    enforce_ltr(p_blank)
    p_blank.paragraph_format.line_spacing = 1.0

    # 6. Основний текст із формулами та таблицями
    for sec in spec_data['sections']:
        paragraphs = sec['paragraphs']
        heading = sec.get('heading', '')
        
        i = 0
        while i < len(paragraphs):
            p_text = paragraphs[i].strip()
            if not p_text:
                i += 1
                continue

            # Якщо це формула
            if p_text.startswith('[Формула:'):
                render_formula(doc, p_text)
                i += 1
                continue

            # Якщо це назва таблиці (без відступу першого рядка та з keep_with_next)
            if p_text.startswith('Таблиця ') and ('.' in p_text or '—' in p_text or '-' in p_text):
                p_tbl_title = doc.add_paragraph()
                enforce_ltr(p_tbl_title)
                p_tbl_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p_tbl_title.paragraph_format.left_indent = Mm(0)
                p_tbl_title.paragraph_format.first_line_indent = Mm(0)
                p_tbl_title.paragraph_format.space_before = Pt(4)
                p_tbl_title.paragraph_format.space_after = Pt(2)
                p_tbl_title.paragraph_format.line_spacing = 1.0
                p_tbl_title.paragraph_format.keep_with_next = True
                r_tt = p_tbl_title.add_run(clean_inline_math(p_text))
                r_tt.font.name = 'Times New Roman'
                r_tt.font.size = Pt(14)
                r_tt.bold = False

                # Наступний параграф має бути вмістом таблиці
                if i + 1 < len(paragraphs) and paragraphs[i+1].startswith('[Таблиця:'):
                    tbl_lines = [paragraphs[i+1]]
                    j = i + 2
                    while j < len(paragraphs) and (paragraphs[j].startswith('- ') or paragraphs[j].startswith('• ')):
                        tbl_lines.append(paragraphs[j])
                        j += 1
                    render_real_table(doc, '\n'.join(tbl_lines))
                    i = j
                    continue
                i += 1
                continue

            # Якщо це експлікація змінних (починається з "де:" або перелічує змінні)
            is_expl = (
                p_text.startswith('де:') or 
                (p_text.startswith('P(') and '—' in p_text) or 
                (p_text.startswith('P_{adj}') and '—' in p_text) or
                (p_text.startswith('R_') and '—' in p_text) or 
                (p_text.startswith('w_') and '—' in p_text) or 
                (p_text.startswith('psi(') and '—' in p_text) or 
                ('\\psi' in p_text and '—' in p_text) or 
                ('ψ(' in p_text and '—' in p_text) or
                (p_text.startswith('phi(') and '—' in p_text) or
                ('\\phi' in p_text and '—' in p_text) or
                ('φ(' in p_text and '—' in p_text) or
                ('\\tau' in p_text and '—' in p_text) or
                ('τ' in p_text and '—' in p_text) or
                ('Pre(' in p_text and '—' in p_text) or
                p_text.startswith('Отримане значення P(L_n) стає апріорною')
            )
            
            p = doc.add_paragraph()
            enforce_ltr(p)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.first_line_indent = Mm(12.5)

            if is_expl:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(1.5)
            else:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)

            # Якщо це перший параграф секції і є заголовок
            if i == 0 and heading:
                run_h = p.add_run(heading + " ")
                run_h.font.name = 'Times New Roman'
                run_h.font.size = Pt(14)
                run_h.bold = True

            run_body = p.add_run(clean_inline_math(p_text))
            run_body.font.name = 'Times New Roman'
            run_body.font.size = Pt(14)
            i += 1

    # 7. Список використаних джерел (12 пт, без автонумерації)
    p_ref_head = doc.add_paragraph()
    enforce_ltr(p_ref_head)
    p_ref_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ref_head.paragraph_format.line_spacing = 1.0
    p_ref_head.paragraph_format.space_before = Pt(6)
    p_ref_head.paragraph_format.space_after = Pt(2)
    run_rh = p_ref_head.add_run("Список використаних джерел")
    run_rh.font.name = 'Times New Roman'
    run_rh.font.size = Pt(12)
    run_rh.bold = True

    for idx, ref_text in enumerate(spec_data['references'], start=1):
        p_ref = doc.add_paragraph()
        enforce_ltr(p_ref)
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.line_spacing = 1.0
        p_ref.paragraph_format.first_line_indent = Mm(12.5)
        p_ref.paragraph_format.space_before = Pt(0)
        p_ref.paragraph_format.space_after = Pt(1.5)
        run_ref = p_ref.add_run(f"{idx}. {ref_text}")
        run_ref.font.name = 'Times New Roman'
        run_ref.font.size = Pt(12)

    doc.save(output_path)
    print(f"✅ Тези успішно скомпільовано: {output_path}")

def compile_application_document(meta: dict, output_path: str):
    """Створює офіційну заявку учасника за формою оргкомітету."""
    doc = Document()
    for s in doc.sections:
        s.top_margin = Mm(25)
        s.bottom_margin = Mm(25)
        s.left_margin = Mm(25)
        s.right_margin = Mm(25)

    auth = meta['author']
    sup = meta['supervisor']
    conf = meta['conference']

    p_app = doc.add_paragraph()
    enforce_ltr(p_app)
    p_app.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_app.paragraph_format.space_after = Pt(4)
    r1 = p_app.add_run("З А Я В К А\n")
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(16)
    r1.font.bold = True

    p_sub = doc.add_paragraph()
    enforce_ltr(p_sub)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(12)
    r2 = p_sub.add_run(
        f"на участь у {conf['full_name']} ({conf['short_name']})\n"
        f"({conf['date']}, {conf['city']})"
    )
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(13)
    r2.font.italic = True

    table = doc.add_table(rows=0, cols=2)
    table.style = 'Table Grid'
    table.autofit = False

    fields = [
        ("Прізвище", auth['surname']),
        ("Ім’я", auth['name']),
        ("По батькові", auth.get('patronymic', '')),
        ("Назва організації (закладу освіти)", auth['university']),
        ("Посада / курс, спеціальність", auth['position']),
        ("Науковий ступінь", auth.get('degree', 'немає')),
        ("Вчене звання", auth.get('academic_rank', 'немає')),
        ("Телефон", auth.get('phone', '')),
        ("E-mail", auth['email']),
        ("Номер і назва секції", f"Секція {meta['section_number']}. {meta['section_title']}"),
        ("Назва доповіді", meta['title']),
        ("Науковий керівник", f"{sup['full_name']}, {sup['degree']}, {sup['academic_rank']}"),
    ]

    for label, val in fields:
        row = table.add_row()
        c_lbl, c_val = row.cells[0], row.cells[1]
        c_lbl.width = Mm(65)
        c_val.width = Mm(95)
        set_cell_margins(c_lbl, top=80, bottom=80, left=100, right=100)
        set_cell_margins(c_val, top=80, bottom=80, left=100, right=100)

        p_l = c_lbl.paragraphs[0]
        enforce_ltr(p_l)
        p_l.paragraph_format.line_spacing = 1.0
        r_l = p_l.add_run(label)
        r_l.font.name = 'Times New Roman'
        r_l.font.size = Pt(12)
        r_l.font.bold = True

        p_v = c_val.paragraphs[0]
        enforce_ltr(p_v)
        p_v.paragraph_format.line_spacing = 1.0
        r_v = p_v.add_run(str(val))
        r_v.font.name = 'Times New Roman'
        r_v.font.size = Pt(12)

    doc.save(output_path)
    print(f"✅ Заявку успішно скомпільовано: {output_path}")

if __name__ == '__main__':
    with open(SPEC_PATH, 'r', encoding='utf-8') as f:
        spec = json.load(f)

    # 1. Компіляція версіонованих документів
    compile_theses_from_spec(spec, THESES_VERSIONED_PATH)
    compile_application_document(spec['metadata'], APPLICATION_VERSIONED_PATH)

    # 2. Створення робочих дублікатів для подання
    shutil.copyfile(THESES_VERSIONED_PATH, THESES_SUBMISSION_PATH)
    shutil.copyfile(APPLICATION_VERSIONED_PATH, APPLICATION_SUBMISSION_PATH)

    print(f"🎉 Реліз {VERSION} готовий у папці: {RELEASE_DIR}")