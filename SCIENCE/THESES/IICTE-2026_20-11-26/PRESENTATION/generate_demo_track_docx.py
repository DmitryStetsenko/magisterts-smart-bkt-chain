"""
Генератор Word-документа (.docx) для Сценарію живої демонстрації та ручної перевірки
наскрізного потоку платформи Smart-BKT-Chain (DEMO_TRACK.md -> docs/DEMO_TRACK_SMART_BKT_CHAIN.docx).
Підтримує справжні стилі заголовків Word (Title, Heading 1-4), таблиці, блоки коду та формули OMML.
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
SRC_MD = os.path.join(BASE_DIR, "DEMO_TRACK.md")
OUT_DOCX = os.path.join(DOCS_DIR, "DEMO_TRACK_SMART_BKT_CHAIN.docx")

MATH_NS = 'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"'
W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'


def m_run(text: str, normal: bool = False) -> str:
    nor_xml = "<m:nor/>" if normal else ""
    escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (
        f"<m:r>"
        f"<m:rPr>{nor_xml}</m:rPr>"
        f'<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/></w:rPr>'
        f'<m:t xml:space="preserve">{escaped}</m:t>'
        f"</m:r>"
    )


def m_sub(base_xml: str, sub_xml: str) -> str:
    return f"<m:sSub><m:e>{base_xml}</m:e><m:sub>{sub_xml}</m:sub></m:sSub>"


def latex_to_omml_inner(expr: str) -> str:
    s = expr.strip()
    replacements = [
        (r"\ge", "≥"),
        (r"\le", "≤"),
        (r"\cdot", "·"),
        (r"\tau", "τ"),
        (r"\Delta", "Δ"),
        (r"\in", "∈"),
        (r"\to", "→"),
        (r"\approx", "≈"),
        (r"\forall", "∀"),
        (r"\mid", "|"),
        (r"\,", " "),
        (r"\ ", " "),
        ("{,}", ","),
        (r"\%", "%"),
    ]
    for src, dst in replacements:
        s = s.replace(src, dst)

    parts = []
    i = 0
    n = len(s)
    while i < n:
        if s.startswith(r"\text{", i):
            depth = 1
            j = i + 6
            while j < n and depth > 0:
                if s[j] == "{":
                    depth += 1
                elif s[j] == "}":
                    depth -= 1
                j += 1
            parts.append(m_run(s[i + 6 : j - 1], normal=True))
            i = j
            continue

        if i + 1 < n and s[i + 1] == "_" and (s[i].isalpha() or s[i] == "τ"):
            base = m_run(s[i])
            i += 2
            if i < n and s[i] == "{":
                depth = 1
                j = i + 1
                while j < n and depth > 0:
                    if s[j] == "{":
                        depth += 1
                    elif s[j] == "}":
                        depth -= 1
                    j += 1
                sub_raw = s[i + 1 : j - 1]
                i = j
            else:
                sub_raw = s[i] if i < n else ""
                i += 1
            text_match = re.fullmatch(r"\\text\{(.+)\}", sub_raw)
            if text_match:
                sub_xml = m_run(text_match.group(1), normal=True)
            else:
                sub_xml = m_run(sub_raw, normal=sub_raw.isdigit())
            parts.append(m_sub(base, sub_xml))
            continue

        ch = s[i]
        if ch in "0123456789.,;=≥≤∈→≈∀()[]+-/%|: ":
            j = i
            while j < n and s[j] in "0123456789.,;=≥≤∈→≈∀()[]+-/%|: ":
                j += 1
            parts.append(m_run(s[i:j], normal=True))
            i = j
        else:
            parts.append(m_run(ch, normal=False))
            i += 1
    return "".join(parts)


def append_omml(paragraph, expr: str):
    inner = latex_to_omml_inner(expr)
    omath_xml = f"<m:oMath {MATH_NS} {W_NS}>{inner}</m:oMath>"
    paragraph._p.append(parse_xml(omath_xml))


def set_run_font(run, font_name="Times New Roman", size_pt=11.0, bold=False, italic=False, color_rgb=None):
    run.font.name = font_name
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
    rFonts.set(qn("w:ascii"), font_name)
    rFonts.set(qn("w:hAnsi"), font_name)
    rFonts.set(qn("w:cs"), font_name)


def configure_styles(doc: docx.Document):
    style_specs = {
        "Normal": (11.0, False, (20, 20, 20), 0, 3.5),
        "Title": (15.5, True, (15, 23, 42), 0, 8),
        "Heading 1": (13.5, True, (15, 45, 92), 12, 5),
        "Heading 2": (12.0, True, (30, 58, 138), 10, 4),
        "Heading 3": (11.0, True, (51, 65, 85), 7, 2.5),
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


def add_rich_text(paragraph, text: str, size_pt=11.0, default_bold=False, default_italic=False, color_rgb=None):
    token_re = re.compile(r"(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)")
    omath_count = 0
    pos = 0
    for m in token_re.finditer(text):
        if m.start() > pos:
            r = paragraph.add_run(text[pos : m.start()])
            set_run_font(r, size_pt=size_pt, bold=default_bold, italic=default_italic, color_rgb=color_rgb)
        tok = m.group(0)
        if tok.startswith("$") and tok.endswith("$"):
            append_omml(paragraph, tok[1:-1])
            omath_count += 1
        elif tok.startswith("**") and tok.endswith("**"):
            r = paragraph.add_run(tok[2:-2])
            set_run_font(r, size_pt=size_pt, bold=True, italic=default_italic, color_rgb=color_rgb)
        elif tok.startswith("*") and tok.endswith("*"):
            r = paragraph.add_run(tok[1:-1])
            set_run_font(r, size_pt=size_pt, bold=default_bold, italic=True, color_rgb=color_rgb)
        elif tok.startswith("`") and tok.endswith("`"):
            r = paragraph.add_run(tok[1:-1])
            set_run_font(
                r,
                font_name="Consolas",
                size_pt=max(9.5, size_pt - 1.0),
                bold=default_bold,
                italic=default_italic,
                color_rgb=(30, 41, 59),
            )
        pos = m.end()

    if pos < len(text):
        r = paragraph.add_run(text[pos:])
        set_run_font(r, size_pt=size_pt, bold=default_bold, italic=default_italic, color_rgb=color_rgb)
    return omath_count


def add_heading_rich(doc: docx.Document, text: str, level: int, size_pt: float, color_rgb):
    style_name = "Title" if level == 0 else f"Heading {level}"
    p = doc.add_paragraph(style=style_name)
    if level == 0:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    omath_count = add_rich_text(p, text, size_pt=size_pt, default_bold=True, color_rgb=color_rgb)
    return p, omath_count


def set_cell_shading(cell, fill_hex: str):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {W_NS} w:fill="{fill_hex}"/>')
    tcPr.append(shd)


def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for side, val in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        node = OxmlElement(f"w:{side}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def set_table_borders(table, color="CBD5E1"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {W_NS}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f"</w:tblBorders>"
    )
    tblPr.append(borders)


def render_table(doc: docx.Document, table_lines: list[str]) -> int:
    rows = []
    for line in table_lines:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)

    if len(rows) < 2:
        return 0

    header = rows[0]
    body_rows = [r for r in rows[2:] if len(r) == len(header)]
    if not body_rows:
        return 0

    tbl = doc.add_table(rows=1 + len(body_rows), cols=len(header))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl)

    omath_count = 0

    # Header row
    hdr_row = tbl.rows[0]
    trPr = hdr_row._tr.get_or_add_trPr()
    trPr.append(OxmlElement("w:tblHeader"))
    for idx, text in enumerate(header):
        cell = hdr_row.cells[idx]
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_shading(cell, "0F2D5C")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        omath_count += add_rich_text(p, text, size_pt=10.0, default_bold=True, color_rgb=(255, 255, 255))

    # Body rows
    for r_idx, r_data in enumerate(body_rows):
        row = tbl.rows[r_idx + 1]
        fill = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, text in enumerate(r_data):
            cell = row.cells[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_shading(cell, fill)
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            omath_count += add_rich_text(p, text, size_pt=10.0)

    spacer = doc.add_paragraph(style="Normal")
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(4)
    return omath_count


def render_code_block(doc: docx.Document, code_lines: list[str]):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl, color="CBD5E1")
    cell = tbl.rows[0].cells[0]
    set_cell_shading(cell, "F1F5F9")
    set_cell_margins(cell, top=80, bottom=80, left=140, right=140)
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    code_text = "\n".join(code_lines)
    r = p.add_run(code_text)
    set_run_font(r, font_name="Consolas", size_pt=9.5, color_rgb=(15, 23, 42))

    spacer = doc.add_paragraph(style="Normal")
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(4)


def build_docx():
    with open(SRC_MD, "r", encoding="utf-8") as f:
        lines = [line.rstrip("\r\n") for line in f]

    doc = docx.Document()
    configure_styles(doc)

    sec = doc.sections[0]
    sec.top_margin = Mm(18)
    sec.bottom_margin = Mm(18)
    sec.left_margin = Mm(22)
    sec.right_margin = Mm(15)

    total_omath = 0
    heading_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    table_count = 0
    code_count = 0

    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i]
        stripped = raw.strip()

        if not stripped or stripped == "---":
            i += 1
            continue

        # Code block ```
        if stripped.startswith("```"):
            code_lines = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            render_code_block(doc, code_lines)
            code_count += 1
            i += 1
            continue

        # Markdown table
        if stripped.startswith("|") and stripped.endswith("|"):
            tbl_lines = []
            while i < n and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                tbl_lines.append(lines[i])
                i += 1
            total_omath += render_table(doc, tbl_lines)
            table_count += 1
            continue

        # Headings
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
            _, c = add_heading_rich(doc, stripped[4:].strip(), level=2, size_pt=12.0, color_rgb=(30, 58, 138))
            total_omath += c
            heading_counts[2] += 1
            i += 1
            continue

        if stripped.startswith("#### "):
            _, c = add_heading_rich(doc, stripped[5:].strip(), level=3, size_pt=11.0, color_rgb=(51, 65, 85))
            total_omath += c
            heading_counts[3] += 1
            i += 1
            continue

        # Numbered list (1. ...)
        num_match = re.match(r"^(\s*)(\d+\.)\s+(.*)$", raw)
        if num_match:
            indent_spaces = len(num_match.group(1))
            prefix = num_match.group(2)
            body = num_match.group(3).strip()
            p = doc.add_paragraph(style="Normal")
            p.paragraph_format.left_indent = Mm(6 + (indent_spaces // 2) * 5)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            r_pref = p.add_run(f"{prefix} ")
            set_run_font(r_pref, size_pt=11.0, bold=True)
            total_omath += add_rich_text(p, body, size_pt=11.0)
            i += 1
            continue

        # Bullet list (- ...)
        bullet_match = re.match(r"^(\s*)[-*]\s+(.*)$", raw)
        if bullet_match:
            indent_spaces = len(bullet_match.group(1))
            body = bullet_match.group(2).strip()
            p = doc.add_paragraph(style="Normal")
            p.paragraph_format.left_indent = Mm(6 + (indent_spaces // 2) * 5)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            r_pref = p.add_run("—  " if indent_spaces >= 2 else "•  ")
            set_run_font(r_pref, size_pt=11.0)
            total_omath += add_rich_text(p, body, size_pt=11.0)
            i += 1
            continue

        # Normal paragraph
        p = doc.add_paragraph(style="Normal")
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3.5)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        total_omath += add_rich_text(p, stripped, size_pt=11.0)
        i += 1

    os.makedirs(DOCS_DIR, exist_ok=True)
    doc.save(OUT_DOCX)
    print(f"OK: {OUT_DOCX}")
    print(
        f"Headings -> Title: {heading_counts[0]}, H1: {heading_counts[1]}, "
        f"H2: {heading_counts[2]}, H3: {heading_counts[3]} | Tables: {table_count} | Code: {code_count} | oMath: {total_omath}"
    )


if __name__ == "__main__":
    build_docx()
