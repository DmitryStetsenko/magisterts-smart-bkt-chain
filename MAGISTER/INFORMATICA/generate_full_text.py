"""
Збирач повного дерева розділів кваліфікаційної магістерської роботи
зі спеціальності 014 «Середня освіта (Інформатика)».
Тема: «Формування алгоритмічної компетентності учнями старшої школи у процесі вивчення розділу "Вебтехнології"»
"""

import sys
import os

# Додаємо локальну папку sections до шляхів імпорту
current_dir = os.path.dirname(os.path.abspath(__file__))
sections_dir = os.path.join(current_dir, 'sections')
if sections_dir not in sys.path:
    sys.path.insert(0, sections_dir)

# Імпорт модулів розділів із пакету sections
from sections.intro_conclusions import get_intro_content, get_conclusions_content
from sections.section_1 import get_section_1
from sections.section_2 import get_section_2
from sections.section_3 import get_section_3
from sections.section_4 import get_section_4
from sections.bibliography import get_bibliography_section

def get_all_info_thesis_sections(apparatus):
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

    bibliography = get_bibliography_section()

    return [intro, sec1, sec2, sec3, sec4, conclusions, bibliography]

