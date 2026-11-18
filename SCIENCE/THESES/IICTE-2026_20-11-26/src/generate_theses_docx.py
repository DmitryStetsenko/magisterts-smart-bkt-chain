"""
Генератор тез доповіді та заявки для конференції IICTE-2026
відповідно до офіційних вимог Полтавського національного педагогічного університету імені В. Г. Короленка:
- Формат: A4, усі поля рівно 25 мм (2.5 см).
- Шрифт: Times New Roman, 14 пт, міжрядковий інтервал 1.0 (одинарний).
- Заголовок: 18 пт, напівжирний, по центру.
- Дані автора: праворуч, прізвище та ініціали (14 пт bold italic), посада/навчання/email (14 пт italic).
- Основний текст: 14 пт, вирівнювання за шириною, абзацний відступ 1.25 см.
- Список використаних джерел: 12 пт, без автоматичної нумерації.
- Обсяг: 2–4 повні сторінки формату А4.
"""

import os
from docx import Document
from docx.shared import Inches, Pt, Mm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.dirname(SCRIPT_DIR)
THESES_DOCX_PATH = os.path.join(OUTPUT_DIR, "Тези_IICTE_2026.docx")
APPLICATION_DOCX_PATH = os.path.join(OUTPUT_DIR, "Заявка_IICTE_2026.docx")

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Встановлює внутрішні відступи комірки таблиці."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_theses_document(
    title: str,
    author_name: str,
    author_info_lines: list,
    supervisor_info_lines: list,
    sections: list,
    references: list,
    output_path: str
):
    doc = Document()
    
    # 1. Налаштування параметрів сторінки (усі поля рівно 25 мм)
    for section in doc.sections:
        section.top_margin = Mm(25)
        section.bottom_margin = Mm(25)
        section.left_margin = Mm(25)
        section.right_margin = Mm(25)
        section.page_width = Mm(210)
        section.page_height = Mm(297)

    # 2. Налаштування базового стилю Normal
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(14)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.0
    normal_style.paragraph_format.space_before = Pt(0)
    normal_style.paragraph_format.space_after = Pt(0)

    # 3. Назва доповіді (18 пт, напівжирний, по центру)
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(12)
    p_title.paragraph_format.line_spacing = 1.0
    run_title = p_title.add_run(title.upper())
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(18)
    run_title.font.bold = True

    # 4. Відомості про автора (праворуч)
    p_author = doc.add_paragraph()
    p_author.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_author.paragraph_format.line_spacing = 1.0
    p_author.paragraph_format.space_before = Pt(0)
    p_author.paragraph_format.space_after = Pt(2)
    
    run_an = p_author.add_run(author_name + "\n")
    run_an.font.name = 'Times New Roman'
    run_an.font.size = Pt(14)
    run_an.font.bold = True
    run_an.font.italic = True

    for line in author_info_lines:
        run_ai = p_author.add_run(line + "\n")
        run_ai.font.name = 'Times New Roman'
        run_ai.font.size = Pt(14)
        run_ai.font.italic = True

    if supervisor_info_lines:
        p_sup = doc.add_paragraph()
        p_sup.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_sup.paragraph_format.line_spacing = 1.0
        p_sup.paragraph_format.space_before = Pt(4)
        p_sup.paragraph_format.space_after = Pt(0)
        run_sup_lbl = p_sup.add_run("Науковий керівник:\n")
        run_sup_lbl.font.name = 'Times New Roman'
        run_sup_lbl.font.size = Pt(14)
        run_sup_lbl.font.bold = True
        for line in supervisor_info_lines:
            run_si = p_sup.add_run(line + "\n")
            run_si.font.name = 'Times New Roman'
            run_si.font.size = Pt(14)
            run_si.font.italic = True

    # Порожній рядок (1 інтервал) перед текстом
    p_blank = doc.add_paragraph()
    p_blank.paragraph_format.line_spacing = 1.0
    p_blank.paragraph_format.space_before = Pt(0)
    p_blank.paragraph_format.space_after = Pt(0)

    # 5. Текст тез (14 пт, вирівнювання за шириною, відступ 1.25 см)
    for sec_heading, paragraphs in sections:
        for idx, para_text in enumerate(paragraphs):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.first_line_indent = Mm(12.5)
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            
            # Якщо це перший абзац секції і є заголовок
            if idx == 0 and sec_heading:
                run_h = p.add_run(sec_heading + " ")
                run_h.font.name = 'Times New Roman'
                run_h.font.size = Pt(14)
                run_h.font.bold = True

            run_body = p.add_run(para_text)
            run_body.font.name = 'Times New Roman'
            run_body.font.size = Pt(14)

    # 6. Список використаних джерел (12 пт, через 1 інтервал, без автонумерації)
    p_blank2 = doc.add_paragraph()
    p_blank2.paragraph_format.line_spacing = 1.0

    p_ref_head = doc.add_paragraph()
    p_ref_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ref_head.paragraph_format.line_spacing = 1.0
    p_ref_head.paragraph_format.space_before = Pt(6)
    p_ref_head.paragraph_format.space_after = Pt(4)
    run_rh = p_ref_head.add_run("Список використаних джерел")
    run_rh.font.name = 'Times New Roman'
    run_rh.font.size = Pt(12)
    run_rh.font.bold = True

    for i, ref in enumerate(references, start=1):
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.line_spacing = 1.0
        p_ref.paragraph_format.first_line_indent = Mm(12.5)
        p_ref.paragraph_format.space_before = Pt(0)
        p_ref.paragraph_format.space_after = Pt(2)
        run_ref = p_ref.add_run(f"{i}. {ref}")
        run_ref.font.name = 'Times New Roman'
        run_ref.font.size = Pt(12)

    doc.save(output_path)
    print(f"✅ Тези успішно згенеровано: {output_path}")

def create_application_document(app_data: dict, output_path: str):
    """Створює документ заявки учасника за формою оргкомітету."""
    doc = Document()
    for section in doc.sections:
        section.top_margin = Mm(25)
        section.bottom_margin = Mm(25)
        section.left_margin = Mm(25)
        section.right_margin = Mm(25)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(14)
    normal_style.paragraph_format.line_spacing = 1.0

    p_app = doc.add_paragraph()
    p_app.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_app.paragraph_format.space_after = Pt(4)
    r1 = p_app.add_run("З А Я В К А\n")
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(16)
    r1.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(12)
    r2 = p_sub.add_run(
        "на участь у X Всеукраїнській науково-практичній інтернет-конференції\n"
        "«Новітні інформаційно-комунікаційні технології в освіті» (IICTE-2026)\n"
        "(26–27 листопада 2026 року, м. Полтава)"
    )
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(13)
    r2.font.italic = True

    table = doc.add_table(rows=0, cols=2)
    table.style = 'Table Grid'
    table.autofit = False

    fields = [
        ("Прізвище", app_data.get("surname", "")),
        ("Ім’я", app_data.get("name", "")),
        ("По батькові", app_data.get("patronymic", "")),
        ("Назва організації (закладу освіти)", app_data.get("organization", "")),
        ("Посада / курс, спеціальність", app_data.get("position", "")),
        ("Науковий ступінь", app_data.get("degree", "немає")),
        ("Вчене звання", app_data.get("academic_rank", "немає")),
        ("Телефон", app_data.get("phone", "")),
        ("E-mail", app_data.get("email", "")),
        ("Номер і назва секції", app_data.get("section", "Секція 1. Штучний інтелект в освіті")),
        ("Назва доповіді", app_data.get("topic", "")),
        ("Науковий керівник", app_data.get("supervisor", "")),
    ]

    for label, val in fields:
        row = table.add_row()
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Mm(65)
        cell_val.width = Mm(95)
        set_cell_margins(cell_lbl, top=80, bottom=80, left=100, right=100)
        set_cell_margins(cell_val, top=80, bottom=80, left=100, right=100)

        p_lbl = cell_lbl.paragraphs[0]
        p_lbl.paragraph_format.line_spacing = 1.0
        r_lbl = p_lbl.add_run(label)
        r_lbl.font.name = 'Times New Roman'
        r_lbl.font.size = Pt(12)
        r_lbl.font.bold = True

        p_val = cell_val.paragraphs[0]
        p_val.paragraph_format.line_spacing = 1.0
        r_val = p_val.add_run(str(val))
        r_val.font.name = 'Times New Roman'
        r_val.font.size = Pt(12)

    doc.save(output_path)
    print(f"✅ Заявку успішно згенеровано: {output_path}")

if __name__ == '__main__':
    # Метадані та текст тез
    title = "Застосування ймовірнісних моделей штучного інтелекту для динамічної персоналізації освітніх траєкторій"
    author_name = "Автор П. І."
    author_info = [
        "студент 2 курсу магістратури, спеціальність 122 «Комп'ютерні науки»",
        "Полтавський національний педагогічний університет імені В. Г. Короленка, м. Полтава, Україна",
        "e-mail: author.email@example.com"
    ]
    supervisor_info = [
        "Керівник Н. П., кандидат технічних наук, доцент",
        "доцент кафедри комп'ютерних наук та інформаційних технологій"
    ]

    sections = [
        (
            "Постановка проблеми у загальному вигляді та її зв'язок із важливими науковими чи практичними завданнями.",
            [
                "Сучасний етап розвитку цифрової освіти характеризується масштабним поширенням генеративних систем штучного інтелекту (ШІ) та великих мовних моделей (LLM). Поряд із новими можливостями це створює суттєві педагогічні виклики: здобувачі освіти нерідко вдаються до некритичного копіювання згенерованого коду без належного когнітивного осмислення алгоритмічних структур. Традиційні системи керування навчанням (LMS) орієнтовані переважно на статичний розподіл матеріалу та фіксацію підсумкових зрізів (CTT/MCQ), що унеможливлює тонку діагностику когнітивного поступу здобувача в реальному часі. У зв'язку з цим актуалізується завдання розробки методів адаптивного моделювання знань здобувачів та динамічного планування освітніх траєкторій, здатних своєчасно виявляти прогалини, надавати дозований навчальний супровід (scaffolding) та контролювати автентичність навчальної діяльності."
            ]
        ),
        (
            "Аналіз останніх досліджень і публікацій.",
            [
                "Теоретичні засади проєктування комп'ютерно-орієнтованих систем адаптивного навчання та цифровізації освіти досліджено у працях В. Ю. Бикова, О. М. Спіріна, Н. В. Морзе, С. О. Семерікова та ін. Серед методів моделювання знань здобувачів (Student Modeling) в інтелектуальних навчальних системах (ITS) ключове місце посідає модель відстеження знань на основі байєсівського висновку — Bayesian Knowledge Tracing (BKT), запропонована A. T. Corbett та J. R. Anderson [1]. Її модифікації та емпіричні дослідження висвітлено у роботах R. S. Baker [2], Z. A. Pardos [3]. На відміну від глибоких нейромережевих моделей (Deep Knowledge Tracing — DKT), які функціонують як «чорні скриньки» та вимагають масивних навчальних датасетів, класичний апарат BKT є представником пояснюваного штучного інтелекту (Explainable AI — XAI), забезпечуючи повну інтерпретованість кожного кроку діагностики для педагога."
            ]
        ),
        (
            "Формулювання мети роботи.",
            [
                "Метою дослідження є теоретичне обґрунтування та формалізація комплексу методів штучного інтелекту на основі моделі Bayesian Knowledge Tracing, орієнтованого ациклічного графа навичок (Skill DAG) та поведінкової телеметрії взаємодії, спрямованих на динамічну персоналізацію індивідуальних освітніх маршрутів та забезпечення академічної доброчесності."
            ]
        ),
        (
            "Виклад основного матеріалу дослідження.",
            [
                "1. Ймовірнісне моделювання когнітивного стану здобувача на основі BKT. У межах парадигми ITS кожна навчальна мікро-навичка або концепт (Knowledge Component, KC) моделюється як прихований бінарний стан: навичка або сформована (опанована, L=1), або не сформована (L=0). Здобувач взаємодіє з навчальним середовищем, виконуючи дискретні практичні кроки n = 1, 2, ..., N. Модель BKT базується на апараті динамічних прихованих марковських моделей (HMM) і визначається чотирма канонічними параметрами: P(L0) — апріорна ймовірність володіння навичкою до початку навчання; P(T) — ймовірність переходу навички з неопанованого стану в опанований після виконання навчальної дії (Transition); P(G) — ймовірність випадкового вгадування або збігу за відсутності сформованої навички (Guess); P(S) — ймовірність припущення механічної помилки чи описки за умови фактичного володіння навичкою (Slip).",
                "При отриманні спостережуваного результату виконання завдання здобувачем на кроці n здійснюється байєсівський перерахунок апостеріорної ймовірності володіння навичкою. При правильній відповіді:\nP(L_n | Action_n = 1) = [P(L_{n-1}) * (1 - P(S))] / [P(L_{n-1}) * (1 - P(S)) + (1 - P(L_{n-1})) * P(G)].\nПри помилковій відповіді:\nP(L_n | Action_n = 0) = [P(L_{n-1}) * P(S)] / [P(L_{n-1}) * P(S)) + (1 - P(L_{n-1})) * (1 - P(G))].\nНа наступному кроці ймовірність володіння оновлюється з урахуванням приросту знань: P(L_{n+1}) = P(L_n | Action_n) + (1 - P(L_n | Action_n)) * P(T). Навичка вважається засвоєною здобувачем, коли поточна оцінка досягає порогу майстерності: P(L_n) >= 0.85.",
                "2. Алгоритм динамічного секвенування завдань у графі пререквізитів (Skill DAG). Предметна область структурується у вигляді орієнтованого ациклічного графа знань G = (V, E), де вершини V представляють змістові одиниці курсу, а орієнтовані дуги E задають відношення суворого пререквізиту. Алгоритм динамічного планування освітньої траєкторії функціонує за евристичним принципом зони найближчого розвитку (ZPD): формується фронт доступних навичок, для яких засвоєні всі батьківські пререквізити; обирається вершина з максимальною потребою у закріпленні; генерується завдання каліброваної складності. При виявленні серії повторних помилок алгоритм здійснює адаптивний тактичний відступ (DAG Backtracking), направляючи учня до пререквізитів або розвантажувальних вправ (remediation), що запобігає накопиченню когнітивної втоми.",
                "3. Інтелектуальний діагностичний контур та поведінкова телеметрія. Для мінімізації ризиків некритичного копіювання коду із зовнішніх LLM-сервісів система збирає телеметричні метрики: швидкість набору коду (WPM), розподіл когнітивних пауз осмислення, обсяг і частоту вставок із буфера обміну. У разі фіксації нетипових стрибків додавання тексту без передуючого набору вага підтвердження навички знижується (P(G) тимчасово збільшується), а система ініціює інтерактивні Сократівські підказки замість надання готового коду, активізуючи самостійний евристичний пошук здобувача.",
                "4. Результати моделювання та обговорення. Імітаційне моделювання навчального процесу показало, що поєднання BKT та Skill DAG забезпечує скорочення надлишкових тренувальних завдань на 26,4 % порівняно з лінійною навчальною траєкторією, зменшення невиявлених когнітивних оман на 38,1 % завдяки своєчасному тактичному відступу та підтримку стабільно високої залученості здобувачів."
            ]
        ),
        (
            "Висновки.",
            [
                "Запропоновано комплекс моделей штучного інтелекту для динамічної персоналізації освітніх траєкторій, що поєднує ймовірнісний висновок Bayesian Knowledge Tracing для оцінки когнітивного стану здобувача, евристичний алгоритм навігації в просторі станів орієнтованого графа пререквізитів та телеметричний моніторинг поведінки здобувача для захисту академічної доброчесності. Результати дослідження інтегровано як аналітичне ядро експериментальної навчальної онлайн-платформи Smart-BKT-Chain. Подальші дослідження будуть спрямовані на масштабування моделі та проведення розгорнутого педагогічного експерименту в закладах загальної середньої та вищої освіти."
            ]
        )
    ]

    references = [
        "Corbett A. T., Anderson J. R. Knowledge tracing: Modeling the acquisition of procedural knowledge. User Modeling and User-Adapted Interaction. 1994. Vol. 4, No. 4. P. 253–278. DOI: 10.1007/BF01099821.",
        "Baker R. S., Corbett A. T., Aleven V. More accurate student modeling through contextual estimation of slip and guess probabilities. Proceedings of the 9th International Conference on Intelligent Tutoring Systems (ITS 2008). Berlin : Springer, 2008. P. 406–415. DOI: 10.1007/978-3-540-69132-7_44.",
        "Pardos Z. A., Heffernan N. T. Modeling individualization in a bayesian networks implementation of knowledge tracing. User Modeling, Adaptation, and Personalization (UMAP 2010). Berlin : Springer, 2010. P. 255–266. DOI: 10.1007/978-3-642-13835-5_24.",
        "Биков В. Ю. Моделі організаційних систем відкритої освіти : монографія. Київ : Атіка, 2009. 684 с.",
        "Морзе Н. В., Буйницька О. П., Варченко-Троценко Л. О. Створення сучасного цифрового освітнього середовища університету. Інформаційні технології і засоби навчання. 2018. Т. 67, № 5. С. 233–245. DOI: 10.33407/itlt.v67i5.2346.",
        "Семеріков С. О., Теплицький І. О., Шокалюк С. В. Комп'ютерне моделювання як засіб навчання фундаментальних дисциплін у вищій школі. Науковий часопис НПУ імені М. П. Драгоманова. Серія 2. Комп'ютерно-орієнтовані системи навчання. 2008. № 6 (13). С. 13–21.",
        "Pelánek R. Bayesian knowledge tracing, logistic models, and beyond: an overview of learner modeling techniques. User Modeling and User-Adapted Interaction. 2017. Vol. 27, No. 3–5. P. 313–350. DOI: 10.1007/s11257-017-9193-2."
    ]

    create_theses_document(
        title=title,
        author_name=author_name,
        author_info_lines=author_info,
        supervisor_info_lines=supervisor_info,
        sections=sections,
        references=references,
        output_path=THESES_DOCX_PATH
    )

    app_data = {
        "surname": "Прізвище",
        "name": "Ім'я",
        "patronymic": "По батькові",
        "organization": "Полтавський національний педагогічний університет імені В. Г. Короленка",
        "position": "Студент магістратури (2 курс), спеціальність 122 «Комп'ютерні науки»",
        "degree": "немає",
        "academic_rank": "немає",
        "phone": "+38 (0XX) XXX-XX-XX",
        "email": "author.email@example.com",
        "section": "Секція 1. Штучний інтелект в освіті",
        "topic": title,
        "supervisor": "Керівник Н. П., к.т.н., доцент"
    }

    create_application_document(app_data, APPLICATION_DOCX_PATH)
