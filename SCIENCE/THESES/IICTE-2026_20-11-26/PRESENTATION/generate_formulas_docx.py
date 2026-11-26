"""
Генератор Word-документа (.docx) Довідника формул, метрик і цифр (IICTE-2026)
зі справжніми стилями заголовків Word (Title, Heading 1, Heading 2)
для коректної бічної навігації в Google Docs / MS Word,
підтримкою таблиць та нативних формул OMML (включно з дробами \frac).
"""
import os
import re
import docx
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
SRC_MD = os.path.join(DOCS_DIR, "FORMULAS_AND_METRICS_GUIDE.md")
OUT_DOCX = os.path.join(DOCS_DIR, "FORMULAS_AND_METRICS_GUIDE.docx")

MATH_NS = 'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"'
W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'


def m_run(text: str, normal: bool = False) -> str:
    """Формує OMML <m:r> із шрифтом Cambria Math."""
    nor_xml = "<m:nor/>" if normal else ""
    escaped = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    return (
        f"<m:r>"
        f"<m:rPr>{nor_xml}</m:rPr>"
        f"<w:rPr><w:rFonts w:ascii=\"Cambria Math\" w:hAnsi=\"Cambria Math\"/></w:rPr>"
        f"<m:t xml:space=\"preserve\">{escaped}</m:t>"
        f"</m:r>"
    )


def m_sub(base_xml: str, sub_xml: str) -> str:
    return f"<m:sSub><m:e>{base_xml}</m:e><m:sub>{sub_xml}</m:sub></m:sSub>"


def m_frac(num_xml: str, den_xml: str) -> str:
    return f"<m:f><m:num>{num_xml}</m:num><m:den>{den_xml}</m:den></m:f>"


def read_braced(s: str, start: int):
    """Читає вміст у фігурних дужках { ... } починаючи з індексу start (де s[start] == '{')."""
    if start >= len(s) or s[start] != "{":
        return "", start
    depth = 1
    j = start + 1
    while j < len(s) and depth > 0:
        if s[j] == "{":
            depth += 1
        elif s[j] == "}":
            depth -= 1
        j += 1
    return s[start + 1 : j - 1], j


def latex_to_omml_inner(expr: str) -> str:
    """Рекурсивно перетворює LaTeX-вирази (включно з \\frac, \\text, індексами) на чистий OMML."""
    s = expr.strip()
    simple_replacements = [
        (r"\bigl(", "("),
        (r"\bigr)", ")"),
        (r"\ge", "≥"),
        (r"\le", "≤"),
        (r"\cdot", "·"),
        (r"\mid", "|"),
        (r"\tau", "τ"),
        (r"\psi", "ψ"),
        (r"\phi", "φ"),
        (r"\Delta", "Δ"),
        (r"\forall", "∀"),
        (r"\in", "∈"),
        (r"\to", "→"),
        (r"\approx", "≈"),
        (r"\quad", "   "),
        (r"\,", " "),
        (r"\ ", " "),
        ("{,}", ","),
        (r"\%", "%"),
    ]
    for src, dst in simple_replacements:
        s = s.replace(src, dst)

    parts = []
    i = 0
    n = len(s)
    while i < n:
        # \frac{num}{den}
        if s.startswith(r"\frac", i):
            i += 5
            while i < n and s[i] == " ":
                i += 1
            num_raw, i = read_braced(s, i)
            while i < n and s[i] == " ":
                i += 1
            den_raw, i = read_braced(s, i)
            parts.append(m_frac(latex_to_omml_inner(num_raw), latex_to_omml_inner(den_raw)))
            continue

        # \text{...}
        if s.startswith(r"\text", i):
            i += 5
            txt_raw, i = read_braced(s, i)
            parts.append(m_run(txt_raw, normal=True))
            continue

        # \min
        if s.startswith(r"\min", i):
            i += 4
            parts.append(m_run("min", normal=True))
            continue

        # Нижній індекс X_{...} або X_c (також підтримує грецькі символи як базу, напр. τ_...)
        if i + 1 < n and s[i + 1] == "_" and (s[i].isalpha() or s[i] in "τψφΔ"):
            base_ch = s[i]
            base_xml = m_run(base_ch, normal=(base_ch in "Δ"))
            i += 2
            if i < n and s[i] == "{":
                sub_raw, i = read_braced(s, i)
            else:
                sub_raw = s[i] if i < n else ""
                i += 1
            sub_xml = latex_to_omml_inner(sub_raw)
            parts.append(m_sub(base_xml, sub_xml))
            continue

        # Оператори, цифри, роздільники
        ch = s[i]
        if ch in "0123456789.,;:=|≥≤·∈→≈∀()[]+-/% ":
            j = i
            while j < n and s[j] in "0123456789.,;:=|≥≤·∈→≈∀()[]+-/% ":
                j += 1
            parts.append(m_run(s[i:j], normal=True))
            i = j
        else:
            parts.append(m_run(ch, normal=False))
            i += 1
    return "".join(parts)


def append_omml(paragraph, expr: str, display: bool = False):
    inner = latex_to_omml_inner(expr)
    if display:
        xml = f"<m:oMathPara {MATH_NS} {W_NS}><m:oMath>{inner}</m:oMath></m:oMathPara>"
    else:
        xml = f"<m:oMath {MATH_NS} {W_NS}>{inner}</m:oMath>"
    paragraph._p.append(parse_xml(xml))


def set_run_font(run, size_pt=11, bold=False, italic=False, color_rgb=None):
    run.font.name = "Times New Roman"
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    if color_rgb is not None:
        run.font.color.rgb = RGBColor(*color_rgb)
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:ascii"), "Times New Roman")
    rFonts.set(qn("w:hAnsi"), "Times New Roman")
    rFonts.set(qn("w:cs"), "Times New Roman")


def configure_styles(doc: docx.Document):
    """Налаштовує вбудовані стилі Title, Heading 1, Heading 2 для Word та Google Docs."""
    style_specs = {
        "Normal": (11, False, (20, 20, 20), 0, 3.5),
        "Title": (15.5, True, (15, 23, 42), 0, 8),
        "Heading 1": (13.5, True, (15, 45, 92), 14, 6),
        "Heading 2": (12, True, (30, 58, 138), 9, 4),
        "Heading 3": (11, True, (51, 65, 85), 6, 3),
    }
    for name, (size_pt, is_bold, rgb, sb, sa) in style_specs.items():
        if name not in doc.styles:
            continue
        st = doc.styles[name]
        st.font.name = "Times New Roman"
        st.font.size = Pt(size_pt)
        st.font.bold = is_bold
        st.font.color.rgb = RGBColor(*rgb)
        rPr = st.element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = OxmlElement("w:rFonts")
            rPr.append(rFonts)
        rFonts.set(qn("w:ascii"), "Times New Roman")
        rFonts.set(qn("w:hAnsi"), "Times New Roman")
        rFonts.set(qn("w:cs"), "Times New Roman")
        st.paragraph_format.space_before = Pt(sb)
        st.paragraph_format.space_after = Pt(sa)
        st.paragraph_format.line_spacing = 1.15
        if name.startswith("Heading"):
            st.paragraph_format.keep_with_next = True


def add_rich_text(paragraph, text: str, size_pt=11, default_bold=False, default_italic=False, color_rgb=None):
    """Парсить $math$, **bold**, *italic* та прибирає зворотні лапки."""
    clean = re.sub(r"`([^`]+)`", r"\1", text)
    token_re = re.compile(r"(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)")
    omath_count = 0
    pos = 0
    for m in token_re.finditer(clean):
        if m.start() > pos:
            r = paragraph.add_run(clean[pos : m.start()])
            set_run_font(r, size_pt=size_pt, bold=default_bold, italic=default_italic, color_rgb=color_rgb)
        tok = m.group(0)
        if tok.startswith("$") and tok.endswith("$"):
            append_omml(paragraph, tok[1:-1], display=False)
            omath_count += 1
        elif tok.startswith("**") and tok.endswith("**"):
            inner_bold = tok[2:-2]
            if "$" in inner_bold:
                omath_count += add_rich_text(
                    paragraph, inner_bold, size_pt=size_pt, default_bold=True, default_italic=default_italic, color_rgb=color_rgb
                )
            else:
                r = paragraph.add_run(inner_bold)
                set_run_font(r, size_pt=size_pt, bold=True, italic=default_italic, color_rgb=color_rgb)
        elif tok.startswith("*") and tok.endswith("*"):
            inner_it = tok[1:-1]
            r = paragraph.add_run(inner_it)
            set_run_font(r, size_pt=size_pt, bold=default_bold, italic=True, color_rgb=color_rgb)
        pos = m.end()

    if pos < len(clean):
        r = paragraph.add_run(clean[pos:])
        set_run_font(r, size_pt=size_pt, bold=default_bold, italic=default_italic, color_rgb=color_rgb)
    return omath_count


def add_heading_rich(doc: docx.Document, text: str, level: int, size_pt: float, color_rgb):
    style_name = "Title" if level == 0 else f"Heading {level}"
    p = doc.add_paragraph(style=style_name)
    if level == 0:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c = add_rich_text(p, text, size_pt=size_pt, default_bold=True, color_rgb=color_rgb)
    return p, c


def set_cell_shading(cell, fill_hex: str):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {W_NS} w:fill="{fill_hex}"/>')
    tcPr.append(shd)


def set_cell_margins(cell, top=60, bottom=60, left=90, right=90):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {W_NS}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f"</w:tcMar>"
    )
    tcPr.append(tcMar)


def set_table_borders(table, color="CBD5E1"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {W_NS}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>'
        f'<w:left w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f"</w:tblBorders>"
    )
    tblPr.append(borders)


def render_table(doc: docx.Document, table_lines):
    rows = []
    for ln in table_lines:
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-+:?", c) for c in cells):
            continue
        rows.append(cells)

    if not rows:
        return 0

    ncols = len(rows[0])
    # Ширини колонок (сума ~175 мм для A4 з полями 20 мм і 15 мм)
    if ncols == 3:
        col_widths_mm = [34, 52, 89]
        font_pt = 10.0
    elif ncols == 5:
        col_widths_mm = [28, 44, 40, 36, 27]
        font_pt = 9.0
    else:
        w = 175.0 / ncols
        col_widths_mm = [w] * ncols
        font_pt = 9.5

    tbl = doc.add_table(rows=len(rows), cols=ncols)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl)

    omath_total = 0
    for r_idx, r_data in enumerate(rows):
        row = tbl.rows[r_idx]
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f"<w:cantSplit {W_NS}/>"))
        if r_idx == 0:
            trPr.append(parse_xml(f"<w:tblHeader {W_NS}/>"))

        for c_idx in range(ncols):
            val = r_data[c_idx] if c_idx < len(r_data) else ""
            cell = row.cells[c_idx]
            cell.width = Mm(col_widths_mm[c_idx])
            cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
            set_cell_margins(cell, top=55, bottom=55, left=80, right=80)
            if r_idx == 0:
                set_cell_shading(cell, "E8EEF5")
            elif r_idx % 2 == 0:
                set_cell_shading(cell, "F8FAFC")

            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            omath_total += add_rich_text(
                p,
                val,
                size_pt=font_pt,
                default_bold=(r_idx == 0),
                color_rgb=(15, 23, 42) if r_idx == 0 else (20, 20, 20),
            )

    # Невеликий відступ після таблиці
    sp = doc.add_paragraph(style="Normal")
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)
    return omath_total


def build_docx():
    with open(SRC_MD, "r", encoding="utf-8") as f:
        lines = [line.rstrip("\r\n") for line in f]

    doc = docx.Document()
    configure_styles(doc)

    sec = doc.sections[0]
    sec.top_margin = Mm(18)
    sec.bottom_margin = Mm(18)
    sec.left_margin = Mm(20)
    sec.right_margin = Mm(15)

    total_omath = 0
    heading_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    table_count = 0

    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i]
        stripped = raw.strip()

        if not stripped or stripped == "---":
            i += 1
            continue

        # Markdown-таблиця
        if stripped.startswith("|") and stripped.endswith("|"):
            tbl_lines = []
            while i < n and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                tbl_lines.append(lines[i])
                i += 1
            total_omath += render_table(doc, tbl_lines)
            table_count += 1
            continue

        # Display-формула $$...$$
        if stripped.startswith("$$") and stripped.endswith("$$") and len(stripped) > 4:
            expr = stripped[2:-2].strip()
            p = doc.add_paragraph(style="Normal")
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            append_omml(p, expr, display=True)
            total_omath += 1
            i += 1
            continue

        # Заголовки
        if stripped.startswith("# "):
            _, c = add_heading_rich(doc, stripped[2:].strip(), level=0, size_pt=15.5, color_rgb=(15, 23, 42))
            total_omath += c
            heading_counts[0] += 1
            i += 1
            continue

        if stripped.startswith("## "):
            _, c = add_heading_rich(doc, stripped[3:].strip(), level=1, size_pt=13.5, color_rgb=(15, 45, 92))
            total_omath += c
            heading_counts[1] += 1
            i += 1
            continue

        if stripped.startswith("### "):
            _, c = add_heading_rich(doc, stripped[4:].strip(), level=2, size_pt=12, color_rgb=(30, 58, 138))
            total_omath += c
            heading_counts[2] += 1
            i += 1
            continue

        if stripped.startswith("#### "):
            _, c = add_heading_rich(doc, stripped[5:].strip(), level=3, size_pt=11, color_rgb=(51, 65, 85))
            total_omath += c
            heading_counts[3] += 1
            i += 1
            continue

        # Списки (підтримка вкладеного рівня)
        indent = len(raw) - len(raw.lstrip(" "))
        bullet_match = re.match(r"^[-*]\s+(.*)$", stripped)
        if bullet_match:
            body = bullet_match.group(1)
            p = doc.add_paragraph(style="Normal")
            p.paragraph_format.left_indent = Mm(13 if indent >= 2 else 7)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            prefix = "–  " if indent >= 2 else "•  "
            r_pref = p.add_run(prefix)
            set_run_font(r_pref, size_pt=11)
            total_omath += add_rich_text(p, body, size_pt=11)
            i += 1
            continue

        # Звичайний абзац
        p = doc.add_paragraph(style="Normal")
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3.5)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        total_omath += add_rich_text(p, stripped, size_pt=11)
        i += 1

    os.makedirs(DOCS_DIR, exist_ok=True)
    doc.save(OUT_DOCX)
    print(f"OK: {OUT_DOCX}")
    print(
        f"Headings -> Title: {heading_counts[0]}, H1: {heading_counts[1]}, "
        f"H2: {heading_counts[2]}, H3: {heading_counts[3]} | Tables: {table_count} | oMath: {total_omath}"
    )


if __name__ == "__main__":
    build_docx()
