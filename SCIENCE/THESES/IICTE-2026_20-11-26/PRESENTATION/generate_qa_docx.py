"""
Генератор Word-документа (.docx) Довідника запитань і відповідей (Q&A, IICTE-2026)
зі справжніми стилями заголовків Word (Title, Heading 1, Heading 2, Heading 3)
для коректної бічної навігації в Google Docs / MS Word та нативними формулами OMML.
"""
import os
import re
import docx
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
QA_MD = os.path.join(DOCS_DIR, "QA_PREPARATION_GUIDE.md")
QA_DOCX = os.path.join(DOCS_DIR, "QA_PREPARATION_GUIDE.docx")

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


def latex_to_omml_inner(expr: str) -> str:
    """Перетворює inline LaTeX-вирази на чистий OMML."""
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
        if i + 1 < n and s[i + 1] == "_" and s[i].isalpha():
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
        if ch in "0123456789.,;=≥≤∈→≈∀()[]+-/% ":
            j = i
            while j < n and s[j] in "0123456789.,;=≥≤∈→≈∀()[]+-/% ":
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


def set_run_font(run, size_pt=11.5, bold=False, italic=False, color_rgb=None):
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
    """Налаштовує вбудовані стилі Title, Heading 1, Heading 2, Heading 3 для Word та Google Docs."""
    style_specs = {
        "Normal": (11.5, False, (20, 20, 20), 0, 4),
        "Title": (16, True, (15, 23, 42), 0, 8),
        "Heading 1": (14, True, (15, 45, 92), 14, 6),
        "Heading 2": (12.5, True, (30, 58, 138), 10, 4),
        "Heading 3": (11.5, True, (51, 65, 85), 8, 3),
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


def add_rich_text(paragraph, text: str, size_pt=11.5, default_bold=False, default_italic=False, color_rgb=None):
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
            append_omml(paragraph, tok[1:-1])
            omath_count += 1
        elif tok.startswith("**") and tok.endswith("**"):
            r = paragraph.add_run(tok[2:-2])
            set_run_font(r, size_pt=size_pt, bold=True, italic=default_italic, color_rgb=color_rgb)
        elif tok.startswith("*") and tok.endswith("*"):
            r = paragraph.add_run(tok[1:-1])
            set_run_font(r, size_pt=size_pt, bold=default_bold, italic=True, color_rgb=color_rgb)
        pos = m.end()

    if pos < len(clean):
        r = paragraph.add_run(clean[pos:])
        set_run_font(r, size_pt=size_pt, bold=default_bold, italic=default_italic, color_rgb=color_rgb)
    return omath_count


def add_heading_rich(doc: docx.Document, text: str, level: int, size_pt: float, color_rgb):
    """Створює справжній Word Heading (Title / Heading 1 / 2 / 3) із підтримкою формул."""
    style_name = "Title" if level == 0 else f"Heading {level}"
    p = doc.add_paragraph(style=style_name)
    if level == 0:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    omath_count = add_rich_text(p, text, size_pt=size_pt, default_bold=True, color_rgb=color_rgb)
    return p, omath_count


def build_docx():
    with open(QA_MD, "r", encoding="utf-8") as f:
        lines = [line.rstrip("\r\n") for line in f]

    doc = docx.Document()
    configure_styles(doc)

    sec = doc.sections[0]
    sec.top_margin = Mm(20)
    sec.bottom_margin = Mm(20)
    sec.left_margin = Mm(25)
    sec.right_margin = Mm(15)

    total_omath = 0
    heading_counts = {0: 0, 1: 0, 2: 0, 3: 0}

    for raw in lines:
        stripped = raw.strip()
        if not stripped or stripped == "---":
            continue

        # Title (# )
        if stripped.startswith("# "):
            _, c = add_heading_rich(doc, stripped[2:].strip(), level=0, size_pt=16, color_rgb=(15, 23, 42))
            total_omath += c
            heading_counts[0] += 1
            continue

        # Heading 1 (## )
        if stripped.startswith("## "):
            _, c = add_heading_rich(doc, stripped[3:].strip(), level=1, size_pt=14, color_rgb=(15, 45, 92))
            total_omath += c
            heading_counts[1] += 1
            continue

        # Heading 2 (### )
        if stripped.startswith("### "):
            _, c = add_heading_rich(doc, stripped[4:].strip(), level=2, size_pt=12.5, color_rgb=(30, 58, 138))
            total_omath += c
            heading_counts[2] += 1
            continue

        # Heading 3 (#### )
        if stripped.startswith("#### "):
            _, c = add_heading_rich(doc, stripped[5:].strip(), level=3, size_pt=11.5, color_rgb=(51, 65, 85))
            total_omath += c
            heading_counts[3] += 1
            continue

        # Списки (- ... або * ...)
        bullet_match = re.match(r"^[-*]\s+(.*)$", stripped)
        if bullet_match:
            body = bullet_match.group(1)
            p = doc.add_paragraph(style="Normal")
            p.paragraph_format.left_indent = Mm(7)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2.5)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            r_pref = p.add_run("•  ")
            set_run_font(r_pref, size_pt=11.5)
            total_omath += add_rich_text(p, body, size_pt=11.5)
            continue

        # Звичайний абзац
        p = doc.add_paragraph(style="Normal")
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        total_omath += add_rich_text(p, stripped, size_pt=11.5)

    os.makedirs(DOCS_DIR, exist_ok=True)
    doc.save(QA_DOCX)
    print(f"OK: {QA_DOCX}")
    print(
        f"Headings -> Title: {heading_counts[0]}, H1: {heading_counts[1]}, "
        f"H2: {heading_counts[2]}, H3: {heading_counts[3]} | oMath: {total_omath}"
    )


if __name__ == "__main__":
    build_docx()
