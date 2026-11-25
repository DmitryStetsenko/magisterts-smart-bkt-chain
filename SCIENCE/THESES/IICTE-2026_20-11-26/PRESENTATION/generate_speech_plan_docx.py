"""
Генератор версіонованого документа Плану виступу (IICTE-2026) у формат .docx
із нативними формулами Word Equation (OMML / m:oMath).
"""
import os
import re
import shutil
import docx
from docx.shared import Mm, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SPEECH_MD = os.path.join(BASE_DIR, "SPEECH_PLAN.md")
RELEASE_DIR = os.path.join(BASE_DIR, "RELEASE")
VERSION = "V-2.1"
VERSIONED_DOCX = os.path.join(RELEASE_DIR, f"{VERSION}-План_виступу_Стеценко.docx")
CANONICAL_DOCX = os.path.join(RELEASE_DIR, "План_виступу_Стеценко.docx")

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
    """Перетворює прості LaTeX-вирази плану виступу на чистий OMML."""
    s = expr.strip()
    # Нормалізація LaTeX-команд
    s = s.replace(r"\ge", "≥").replace(r"\le", "≤").replace(r"\cdot", "·")
    s = s.replace(r"\tau", "τ").replace(r"\,", " ").replace(r"\ ", " ")
    s = s.replace("{,}", ",").replace(r"\%", "%")

    parts = []
    i = 0
    n = len(s)
    while i < n:
        # Обробка нижніх індексів X_{...} або X_c
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

        # Звичайний символ або група операторів
        ch = s[i]
        if ch in "0123456789.,=≥≤()+-/% ":
            j = i
            while j < n and s[j] in "0123456789.,=≥≤()+-/% ":
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


def set_run_font(run, size_pt=12, bold=False, italic=False):
    run.font.name = "Times New Roman"
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:ascii"), "Times New Roman")
    rFonts.set(qn("w:hAnsi"), "Times New Roman")
    rFonts.set(qn("w:cs"), "Times New Roman")


def add_rich_text(paragraph, text: str, size_pt=12, default_italic=False):
    """Парсить $math$, **bold**, *italic* та прибирає зворотні лапки."""
    # Очищаємо markdown code ticks (`text` -> text)
    clean = re.sub(r"`([^`]+)`", r"\1", text)
    # Прибираємо технічну згадку файлу в дужках, якщо є
    clean = clean.replace("; детальний сценарій у DEMO_TRACK.md", "")

    # Токенізуємо по $...$ та **...**
    token_re = re.compile(r"(\$[^$]+\$|\*\*[^*]+\*\*)")
    omath_count = 0
    pos = 0
    for m in token_re.finditer(clean):
        if m.start() > pos:
            r = paragraph.add_run(clean[pos : m.start()])
            set_run_font(r, size_pt=size_pt, italic=default_italic)
        tok = m.group(0)
        if tok.startswith("$") and tok.endswith("$"):
            append_omml(paragraph, tok[1:-1])
            omath_count += 1
        elif tok.startswith("**") and tok.endswith("**"):
            r = paragraph.add_run(tok[2:-2])
            set_run_font(r, size_pt=size_pt, bold=True, italic=default_italic)
        pos = m.end()

    if pos < len(clean):
        r = paragraph.add_run(clean[pos:])
        set_run_font(r, size_pt=size_pt, italic=default_italic)
    return omath_count


def build_docx():
    with open(SPEECH_MD, "r", encoding="utf-8") as f:
        lines = [line.rstrip("\r\n") for line in f]

    doc = docx.Document()
    sec = doc.sections[0]
    sec.top_margin = Mm(20)
    sec.bottom_margin = Mm(20)
    sec.left_margin = Mm(25)
    sec.right_margin = Mm(15)

    total_omath = 0
    word_count = 0

    for raw in lines:
        stripped = raw.strip()
        if not stripped or stripped == "---":
            continue

        # H1: Заголовок документа
        if stripped.startswith("# "):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.line_spacing = 1.15
            title_text = stripped[2:].strip()
            r = p.add_run(title_text)
            set_run_font(r, size_pt=16, bold=True)
            word_count += len(title_text.split())
            continue

        # H2: Розділ плану
        if stripped.startswith("## "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.keep_with_next = True
            h_text = stripped[3:].strip()
            r = p.add_run(h_text)
            set_run_font(r, size_pt=13, bold=True)
            word_count += len(h_text.split())
            continue

        # Курсивна примітка (*(...) *)
        if stripped.startswith("*(") and stripped.endswith(")*"):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            note = stripped[2:-2].strip()
            total_omath += add_rich_text(p, note, size_pt=11.5, default_italic=True)
            word_count += len(note.split())
            continue

        # Списки (* ,   * ,   1. ,      * )
        indent_spaces = len(raw) - len(raw.lstrip(" "))
        bullet_match = re.match(r"^(\*|\d+\.)\s+(.*)$", stripped)
        if bullet_match:
            marker, body = bullet_match.group(1), bullet_match.group(2)
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2.5)
            p.paragraph_format.line_spacing = 1.15
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

            if indent_spaces >= 5:
                p.paragraph_format.left_indent = Mm(18)
                prefix = "–  "
            elif indent_spaces >= 2:
                p.paragraph_format.left_indent = Mm(12)
                prefix = f"{marker} " if marker != "*" else "◦  "
            else:
                p.paragraph_format.left_indent = Mm(6)
                prefix = "•  "

            r_pref = p.add_run(prefix)
            set_run_font(r_pref, size_pt=12, bold=(marker != "*"))
            total_omath += add_rich_text(p, body, size_pt=12)
            word_count += len(body.split())
            continue

        # Звичайний абзац
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        total_omath += add_rich_text(p, stripped, size_pt=12)
        word_count += len(stripped.split())

    os.makedirs(RELEASE_DIR, exist_ok=True)
    doc.save(VERSIONED_DOCX)
    shutil.copy2(VERSIONED_DOCX, CANONICAL_DOCX)
    print(f"OK: {VERSIONED_DOCX}")
    print(f"OK: {CANONICAL_DOCX}")
    print(f"Words: {word_count}, oMath formulas: {total_omath}")


if __name__ == "__main__":
    build_docx()
