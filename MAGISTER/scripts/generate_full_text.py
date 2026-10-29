"""
Головний збирач структури кваліфікаційної магістерської роботи на 4 розділи (50+ сторінок).
"""

from sections.intro_conclusions import get_intro_content, get_conclusions_content
from sections.section_1 import get_section_1
from sections.section_2 import get_section_2
from sections.section_3 import get_section_3
from sections.section_4 import get_section_4

def get_all_thesis_sections(apparatus):
    intro = {
        "id": "intro",
        "title": "ВСТУП",
        "type": "introductory",
        "targetPages": 5,
        "content": get_intro_content(apparatus)
    }

    sec1 = get_section_1()
    sec2 = get_section_2()
    sec3 = get_section_3()
    sec4 = get_section_4()

    conclusions = {
        "id": "conclusions",
        "title": "ЗАГАЛЬНІ ВИСНОВКИ",
        "type": "concluding",
        "targetPages": 4,
        "content": get_conclusions_content()
    }

    return [intro, sec1, sec2, sec3, sec4, conclusions]
