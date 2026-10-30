"""
Уніфікований конфігуратор та диспетчер профілів магістерських робіт.
Підтримує дві незалежні роботи:
  1. 'kn'   (122 Комп'ютерні науки) -> MAGISTER/KN/
  2. 'info' (014 Середня освіта / Інформатика) -> MAGISTER/INFORMATICA/
"""

import os

BASE_MAGISTER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Калібрувальні константи щільності тексту за ДСТУ 3008:2015 для Google Docs / MS Word
WORDS_PER_PAGE = 175          # Емпірична середня кількість слів на 1 сторінку А4 (14pt, 1.5 інтервал)
MIN_TARGET_PAGES = 60         # Мінімальний поріг сторінок магістерської роботи
RECOMMENDED_TARGET_PAGES = 65 # Рекомендований оптимальний обсяг сторінок
TARGET_WORDS_MIN = MIN_TARGET_PAGES * WORDS_PER_PAGE               # 10 500 слів
TARGET_WORDS_RECOMMENDED = RECOMMENDED_TARGET_PAGES * WORDS_PER_PAGE # 11 375 слів

PROFILES = {
    'kn': {
        'code': '122',
        'specialty': "122 Комп'ютерні науки",
        'short_name': 'kn',
        'dir_name': 'KN',
        'base_dir': os.path.join(BASE_MAGISTER_DIR, 'KN'),
        'sections_dir': os.path.join(BASE_MAGISTER_DIR, 'KN', 'sections'),
        'spec_path': os.path.join(BASE_MAGISTER_DIR, 'KN', 'thesis_spec.json'),
        'docx_path': os.path.join(BASE_MAGISTER_DIR, 'KN', 'Магістерська_робота_122.docx'),
        'target_pages': 65,
        'min_words': TARGET_WORDS_MIN,
        'optimal_words': TARGET_WORDS_RECOMMENDED,
    },
    'info': {
        'code': '014',
        'specialty': "014 Середня освіта (Інформатика)",
        'short_name': 'info',
        'dir_name': 'INFORMATICA',
        'base_dir': os.path.join(BASE_MAGISTER_DIR, 'INFORMATICA'),
        'sections_dir': os.path.join(BASE_MAGISTER_DIR, 'INFORMATICA', 'sections'),
        'spec_path': os.path.join(BASE_MAGISTER_DIR, 'INFORMATICA', 'thesis_spec.json'),
        'docx_path': os.path.join(BASE_MAGISTER_DIR, 'INFORMATICA', 'Магістерська_робота_014.docx'),
        'target_pages': 65,
        'min_words': TARGET_WORDS_MIN,
        'optimal_words': TARGET_WORDS_RECOMMENDED,
    }
}

def get_profile(name: str = 'kn') -> dict:
    key = name.lower().strip()
    if key in ['122', 'kn', 'cs']:
        return PROFILES['kn']
    elif key in ['014', 'info', 'informatica', 'so']:
        return PROFILES['info']
    else:
        raise ValueError(f"Невідомий профіль дисертації: '{name}'. Допустимі: 'kn' (122), 'info' (014).")
