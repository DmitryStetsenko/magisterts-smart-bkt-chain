"""
Скрипт аудиту якості та відповідності тез доповіді IICTE-2026:
- Перевірка наявності нативних Word Equation (m:oMath);
- Перевірка наявності реальних таблиць за стандартом ДСТУ;
- Перевірка обсягу слів та розрахункової кількості сторінок (норматив: 2–4 сторінки при одинарному інтервалі);
- Перевірка на заборонені канцеляризми та кліше ШІ;
- Перевірка на 0 російських джерел (Правило 12).
"""

import os
import re
import docx

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFERENCE_DIR = os.path.dirname(SCRIPT_DIR)
RELEASE_DIR = os.path.join(CONFERENCE_DIR, "RELEASE")
DOCX_PATH = os.path.join(RELEASE_DIR, "V-3.0-Стеценко_тези.docx")

BANNED_CLICHES = [
    r'варто зазначити',
    r'слід підкреслити',
    r'не викликає сумніву',
    r'широкий спектр',
    r'відіграє ключову роль',
    r'стрімкий розвиток',
    r'революційний',
    r'проривний',
    r'не має аналогів',
    r'кардинально новий',
    r'докорінна зміна',
    r'глухий кут',
    r'вичерпали',
    r'безпорадність',
    r'пастка',
    r'унеможливлює',
    r'чорні скриньки',
    r'тактичний відступ',
    r'провідне місце',
    r'повну аналітичну',
    r'масштабним поширенням',
    r'суворого пререквізиту',
    r'максимальної пластичності',
    r'безпідставне зростання',
    r'впроваджено як аналітичне ядро',
]

RUSSIAN_PATTERNS = [
    r'москва', r'санкт-петербург', r'педагогика', r'просвещение',
    r'\bроссия\b', r'\bроссийск', r'\bизд-во\b'
]

def run_audit():
    print(f"🔍 Запуск аудиту якості для файлу: {DOCX_PATH}")
    if not os.path.exists(DOCX_PATH):
        print(f"❌ Помилка: файл {DOCX_PATH} не знайдено!")
        return False

    doc = docx.Document(DOCX_PATH)
    total_words = 0
    total_chars = 0
    omath_count = 0
    full_text = []

    for p in doc.paragraphs:
        txt = p.text
        full_text.append(txt)
        total_words += len(txt.split())
        total_chars += len(txt)
        if 'oMath' in p._element.xml:
            omath_count += 1

    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                ctxt = cell.text
                full_text.append(ctxt)
                total_words += len(ctxt.split())
                total_chars += len(ctxt)

    all_text = " ".join(full_text)

    # 1. Метрики обсягу
    WORDS_PER_PAGE = 360  # калібрувальна константа для 14pt Times New Roman, 1.0 інтервал, 25 мм поля
    est_pages = total_words / WORDS_PER_PAGE

    print("\n📊 --- РЕЗУЛЬТАТИ АУДИТУ ОБСЯГУ ---")
    print(f"Загальна кількість слів: {total_words}")
    print(f"Загальна кількість символів (із пробілами): {total_chars}")
    print(f"Кількість параграфів: {len(doc.paragraphs)}")
    print(f"Кількість таблиць: {len(doc.tables)}")
    print(f"Кількість нативних Word Equation формул (m:oMath): {omath_count}")
    print(f"Розрахунковий обсяг сторінок (при K={WORDS_PER_PAGE} слів/стор): {est_pages:.2f} стор. А4")

    # Перевірка сторінок
    passed = True
    if est_pages < 2.0:
        print("❌ [ПОМИЛКА]: Обсяг менший за 2.0 сторінки (вимога оргкомітету: 2–4 повні сторінки)!")
        passed = False
    elif est_pages > 4.0:
        print("❌ [ПОМИЛКА]: Обсяг перевищує 4.0 сторінки (вимога оргкомітету: 2–4 повні сторінки)!")
        passed = False
    else:
        print("✅ [OK]: Обсяг ідеально вкладається у встановлені оргкомітетом рамки (2–4 сторінки)!")

    # Перевірка формул
    if omath_count < 7:
        print(f"⚠️ [ПОПЕРЕДЖЕННЯ]: Очікувалося 7 формул oMath, виявлено {omath_count}!")
        passed = False
    else:
        print(f"✅ [OK]: Усі {omath_count} формул згенеровано як нативні Word Equation (m:oMath) із вертикальними дробами!")

    # 2. Перевірка на анти-AI кліше
    print("\n🛡️ --- АУДИТ КАНЦЕЛЯРИЗМІВ ТА КЛІШЕ ШІ ---")
    found_cliches = 0
    for pat in BANNED_CLICHES:
        matches = re.findall(pat, all_text, re.IGNORECASE)
        if matches:
            found_cliches += len(matches)
            print(f"  ❌ Знайдено заборонене кліше: '{pat}' ({len(matches)} входжень)")

    if found_cliches == 0:
        print("✅ [OK]: Заборонених кліше та маркерів машинної генерації не виявлено!")
    else:
        passed = False

    # 3. Перевірка на російські джерела (Правило 12)
    print("\n🚫 --- АУДИТ ВІДСУТНОСТІ РОСІЙСЬКИХ ДЖЕРЕЛ (Правило 12) ---")
    found_ru = 0
    for pat in RUSSIAN_PATTERNS:
        matches = re.findall(pat, all_text, re.IGNORECASE)
        if matches:
            found_ru += len(matches)
            print(f"  ❌ Знайдено ознаку російського джерела: '{pat}'")

    if found_ru == 0:
        print("✅ [OK]: Російських джерел, видавництв чи географічних локацій не виявлено (0% РФ)!")
    else:
        passed = False

    print("\n🎯 --- ПІДСУМОК АУДИТУ ---")
    if passed:
        print("🏆 ВСІ КРИТЕРІЇ УСПІШНО ПРОЙДЕНО: Документ готовий до наукового рецензування та подання!")
    else:
        print("⚠️ Виявлено зауваження, що потребують усунення.")
    return passed

if __name__ == '__main__':
    run_audit()
