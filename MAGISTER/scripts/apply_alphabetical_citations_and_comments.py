import zipfile
import xml.etree.ElementTree as ET
import re
import os
import shutil

# 1. Namespaces mapping
NAMESPACES = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'm': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
    'w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
    'w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
    'w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
    'w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
    'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
}

for prefix, uri in NAMESPACES.items():
    ET.register_namespace(prefix, uri)

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'
W16CEX = '{http://schemas.microsoft.com/office/word/2018/wordml/cex}'
W16CID = '{http://schemas.microsoft.com/office/word/2016/wordml/cid}'

# 2. Re-mapping dictionary (Old ID -> New Alphabetical ID)
OLD_TO_NEW = {
    1: 19, 2: 37, 3: 9, 4: 48, 5: 32, 6: 39, 7: 24, 8: 44, 9: 8, 10: 31,
    11: 21, 12: 14, 13: 12, 14: 42, 15: 38, 16: 43, 17: 46, 18: 23, 19: 34, 20: 15,
    21: 45, 22: 22, 23: 20, 24: 29, 25: 40, 26: 47, 27: 17, 28: 33, 29: 26, 30: 27,
    31: 13, 32: 10, 33: 28, 34: 30, 35: 11, 36: 41, 37: 16, 38: 25, 39: 18, 40: 2,
    41: 7, 42: 35, 43: 36, 44: 6, 45: 5, 46: 1, 47: 3, 48: 4
}

# 3. New Alphabetical Bibliography Items (1 to 48)
BIBLIOGRAPHY_ITEMS = [
    "Балацька В. С., Побережник В. О., Опірський І. Р. Використання Non-Fungible Tokens та блокчейн для розмежування доступу до державних реєстрів. Кібербезпека: освіта, наука, техніка. 2024. Т. 4, № 24. С. 45–58. DOI: 10.28925/2663-4023.2024.24.4558.",
    "Биков В. Ю., Спірін О. М., Пінчук О. П. Сучасні завдання цифрової трансформації освіти. Вісник Кафедри ЮНЕСКО «Неперервна професійна освіта ХХІ століття». 2020. Вип. 1. С. 27–36. DOI: 10.35387/ucj.1(1).2020.27-36.",
    "ДСТУ 3008:2015. Інформація та документація. Звіти у сфері науки і техніки. Структура та правила оформлювання. Київ : ДП «УкрНДНЦ», 2016. 26 с.",
    "ДСТУ 8302:2015. Інформація та документація. Бібліографічне посилання. Загальні положення та правила складання. Київ : ДП «УкрНДНЦ», 2016. 17 с.",
    "Опірський І. Р., Балацька В. С., Побережник В. О. Сучасні можливості використання технології блокчейн у системі освіти. Безпека інформації. 2023. Т. 29, № 3. С. 138–146. DOI: 10.18372/2225-5036.29.18073.",
    "Осадча К. П., Осадчий В. В., Круглик В. С., Спірін О. М., Крашеніннік І. В., Горбатюк Р. М. Model of blended learning in higher educational institutions: development, implementation and evaluation. Інформаційні технології і засоби навчання. 2022. Т. 91, № 5. С. 158–169. DOI: 10.33407/itlt.v91i5.5045.",
    "Спірін О. М., Олексюк В. П., Осадчий В. В., Вакалюк Т. А., Семеріков С. О. Основні компоненти теоретичної моделі інтеграції штучного інтелекту в наукові дослідження у галузі освіти. Інформаційні технології і засоби навчання. 2026. Т. 113, № 3. С. 211–238. DOI: 10.33407/itlt.v113i3.6707.",
    "Anderson J. R., Corbett A. T., Koedinger K. R., Pelletier R. Cognitive tutors: Lessons learned. The Journal of the Learning Sciences. 1995. Vol. 4, no. 2. P. 167–207. DOI: 10.1207/s15327809jls0402_2.",
    "Baker R. S. J. d., Corbett A. T., Aleven V. More accurate student modeling through contextual estimation of slip and guess probabilities. Intelligent Tutoring Systems : 9th International Conference (Montreal, June 23–27, 2008). Berlin : Springer, 2008. P. 406–415. DOI: 10.1007/978-3-540-69132-7_44.",
    "Banks A., Porcello E. Learning React: Modern Patterns for Developing React Applications. 2nd ed. Sebastopol : O'Reilly Media, 2020. 330 p.",
    "Beck K., Beedle M., van Bennekum A., Cockburn A., Cunningham W., Fowler M., Highsmith J., Hunt A., Jeffries R., Kern J., Marick B., Martin R. C., Mellor S., Schwaber K., Sutherland J., Thomas D. Manifesto for Agile Software Development. 2001. URL: https://agilemanifesto.org/ (accessed: 14.10.2026).",
    "Becker B. A., Denny P., Finnie-Ansley J., Luxton-Reilly A., Prather J., Santos E. A. Programming Is Hard — Or at Least It Used to Be: Educational Opportunities and Challenges of AI Code Generation. Proceedings of the 54th ACM Technical Symposium on Computer Science Education (SIGCSE 2023). Toronto, 2023. P. 500–506. DOI: 10.1145/3545945.3569759.",
    "Bierman G., Abadi M., Torgersen M. Understanding TypeScript. European Conference on Object-Oriented Programming (ECOOP 2014). Berlin : Springer, 2014. P. 257–281. DOI: 10.1007/978-3-662-44202-9_11.",
    "Blikstein P. Using learning analytics to assess students' behavior in open-ended programming tasks. Proceedings of the 1st International Conference on Learning Analytics and Knowledge (LAK '11). Banff, 2011. P. 102–111. DOI: 10.1145/2090116.2090132.",
    "Buterin V. Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform. 2014. 36 p. URL: https://ethereum.org/en/whitepaper/ (accessed: 14.10.2026).",
    "Chacon S., Straub B. Pro Git. 2nd ed. New York : Apress, 2014. 456 p. DOI: 10.1007/978-1-4842-0076-6.",
    "Cockburn A. Hexagonal Architecture: Alistair Cockburn's architectural pattern (Ports and Adapters). 2005. URL: https://alistair.cockburn.us/hexagonal-architecture/ (accessed: 14.10.2026).",
    "Cohen J. Statistical Power Analysis for the Behavioral Sciences. 2nd ed. Hillsdale : Lawrence Erlbaum Associates, 1988. 567 p.",
    "Corbett A. T., Anderson J. R. Knowledge tracing: Modeling the acquisition of procedural knowledge. User Modeling and User-Adapted Interaction. 1994. Vol. 4, no. 4. P. 253–278. DOI: 10.1007/BF01099821.",
    "Darabi T., Martins T. EIP-5192: Minimal Soulbound NFTs. Ethereum Improvement Proposals. 2022. no. 5192. URL: https://eips.ethereum.org/EIPS/eip-5192 (accessed: 14.10.2026).",
    "Edwards S. H., Snyder C. A., Perez-Quinones M. A., Allevato A., Saha D., Subramanian K. Comparing behaviors of student programmers: traces of different kinds of developers. Proceedings of the 5th International Workshop on Computing Education Research (ICER '09). Berkeley, 2009. P. 3–14. DOI: 10.1145/1584322.1584325.",
    "Entriken W., Shirley D., Evans J., Sachs N. EIP-721: Non-Fungible Token Standard. Ethereum Improvement Proposals. 2018. no. 721. URL: https://eips.ethereum.org/EIPS/eip-721 (accessed: 14.10.2026).",
    "Epp C. D., Lippold M., Mandryk R. L. Identifying emotional states using keystroke dynamics. Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI '11). Vancouver, 2011. P. 715–724. DOI: 10.1145/1978942.1979046.",
    "Falmagne J.-C., Doignon J.-P. Learning Spaces: Interdisciplinary Applied Mathematics. Berlin, Heidelberg : Springer-Verlag, 2011. 434 p. DOI: 10.1007/978-3-642-01039-2.",
    "Fawcett T. An introduction to ROC analysis. Pattern Recognition Letters. 2006. Vol. 27, no. 8. P. 861–874. DOI: 10.1016/j.patrec.2005.10.010.",
    "Fette I., Melnikov A. The WebSocket Protocol. RFC 6455. Internet Engineering Task Force (IETF), 2011. 71 p. DOI: 10.17487/RFC6455.",
    "Flanagan D. JavaScript: The Definitive Guide. Master the World's Most-Used Programming Language. 7th ed. Sebastopol : O'Reilly Media, 2020. 706 p.",
    "Geewax C. API Design Patterns. Shelter Island : Manning Publications, 2021. 475 p.",
    "Grech A., Camilleri A. F. Blockchain in Education. Luxembourg : Publications Office of the European Union, 2017. 132 p. DOI: 10.2760/60649.",
    "Kleppmann M. Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems. Sebastopol : O'Reilly Media, 2017. 616 p.",
    "Koedinger K. R., Corbett A. T. Cognitive tutors: Technology bringing learning science to the classroom. The Cambridge Handbook of the Learning Sciences / ed. by R. K. Sawyer. Cambridge : Cambridge University Press, 2006. P. 61–78.",
    "Lord F. M. Applications of Item Response Theory to Practical Testing Problems. Mahwah : Lawrence Erlbaum Associates, 1980. 288 p.",
    "Martin R. C. Clean Architecture: A Craftsman's Guide to Software Structure and Design. Boston : Prentice Hall, 2017. 432 p.",
    "Nakamoto S. Bitcoin: A Peer-to-Peer Electronic Cash System. 2008. 9 p. URL: https://bitcoin.org/bitcoin.pdf (accessed: 14.10.2026).",
    "Osadcha K., Osadchyi V., Semerikov S., Chemerys H., Chorna A. The review of the adaptive learning systems for the formation of individual educational trajectory. CEUR Workshop Proceedings (ICTERI 2020). 2020. Vol. 2732. P. 547–558. URL: https://ceur-ws.org/Vol-2732/20200547.pdf (accessed: 14.10.2026).",
    "Osadchyi V., Krasheninnik I., Spirin O., Koniukhov S., Diuzhykova T. Personalized and Adaptive ICT-Enhanced Learning: A Brief Review of Research from 2010 to 2019. CEUR Workshop Proceedings (ICTERI 2020). 2020. Vol. 2732. P. 559–571. URL: https://ceur-ws.org/Vol-2732/20200559.pdf (accessed: 14.10.2026).",
    "Piech C., Bassen J., Huang J., Ganguli S., Sahami M., Guibas L. J., Sohl-Dickstein J. Deep knowledge tracing. Advances in Neural Information Processing Systems (NeurIPS 2015). Montreal, 2015. Vol. 28. P. 505–513.",
    "Qian Y., Lehman J. Students' misconceptions and other difficulties in introductory programming: A literature review. ACM Transactions on Computing Education. 2017. Vol. 18, no. 1. P. 1–24. DOI: 10.1145/3077618.",
    "Rasch G. Probabilistic Models for Some Intelligence and Attainment Tests. Chicago : University of Chicago Press, 1993. 199 p.",
    "Schmidt P. MIT Media Lab: Certificates, Reputation, and the Blockchain. MIT Media Lab Working Paper. Cambridge : MIT, 2015. 14 p.",
    "Schwaber K., Sutherland J. The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game. Scrum.org, 2020. 14 p.",
    "Sorva J. Visual program simulation in introductory programming education : doctoral dissertation. Espoo : Aalto University, 2012. 288 p.",
    "Sweller J. Cognitive load theory and educational technology. Educational Technology Research and Development. 2020. Vol. 68, no. 1. P. 1–16. DOI: 10.1007/s11423-019-09701-3.",
    "VanLehn K. The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring modalities. Educational Psychologist. 2011. Vol. 46, no. 4. P. 197–221. DOI: 10.1080/00461520.2011.611369.",
    "Weyl E. G., Ohlhaver P., Buterin V. Decentralized Society: Finding Web3's Soul. SSRN Electronic Journal. 2022. 37 p. DOI: 10.2139/ssrn.4105763.",
    "Wood D., Bruner J. S., Ross G. The role of tutoring in problem solving. Journal of Child Psychology and Psychiatry. 1976. Vol. 17, no. 2. P. 89–100. DOI: 10.1111/j.1469-7610.1976.tb00381.x.",
    "Wood G. Ethereum: A Secure Decentralised Generalised Transaction Ledger (Berlin Version). 2024. 41 p. URL: https://ethereum.github.io/yellowpaper/paper.pdf (accessed: 14.10.2026).",
    "Yudelson M. V., Koedinger K. R., Gordon G. J. Individualized Bayesian Knowledge Tracing models. Artificial Intelligence in Education : 16th International Conference (Memphis, July 9–13, 2013). Berlin : Springer, 2013. P. 171–180. DOI: 10.1007/978-3-642-39112-5_18."
]

# 4. Author comments specification
NEW_COMMENTS = [
    {
        'id': '12',
        'paraId': '00000381',
        'durableId': '0000000D',
        'p_idx': 161,
        'anchor': 'відмовилися від припущення, що ймовірність вгадування P(G) та ймовірність промаху P(S) є сталими величинами',
        'text': 'Посилання [1, 3] та [11, 13] прибрано. Модель динамічних регуляторів ймовірностей вгадування P(G_t) та промаху P(S_t) на основі сенсорної телеметрії редактора коду є власною авторською розробкою; у цитованих статтях розглядалися лише статичні константи або класичні моделі без аналізу динаміки набору коду.'
    },
    {
        'id': '13',
        'paraId': '00000382',
        'durableId': '0000000E',
        'p_idx': 162,
        'anchor': 'динамічні регулятори P(G_t) та P(S_t)',
        'text': 'Посилання [3, 4] прибрано. Хоча Бейкер і Юдельсон досліджували контекстні та індивідуальні параметри BKT, введення обчислюваних динамічних регуляторів P(G_t) і P(S_t) на основі телеметрії кодової сесії запропоновано автором.'
    },
    {
        'id': '14',
        'paraId': '00000383',
        'durableId': '0000000F',
        'p_idx': 164,
        'anchor': 'темпоральний вектор поведінки E_t',
        'text': 'Посилання [12] прибрано, оскільки структуру та набір компонентів темпорального вектора поведінки студента E_t у кодовому редакторі розроблено автором спеціально для архітектури платформи.'
    },
    {
        'id': '15',
        'paraId': '00000384',
        'durableId': '00000010',
        'p_idx': 186,
        'anchor': 'зворотну властивість регулятора',
        'text': 'Посилання [13] прибрано. Математичне доведення знаку похідної та адаптивної нечутливості до випадкових механічних описок є авторським науковим результатом.'
    },
    {
        'id': '16',
        'paraId': '00000385',
        'durableId': '00000011',
        'p_idx': 188,
        'anchor': 'специфіку поведінки формули Байєса при тривалих серіях помилок',
        'text': 'Посилання [31, 34] та [16] прибрано. Математичне правило граничного затискання з гарантованою нижньою асимптотою P_min = 0.05 та усунення машинної втрати розрядів у формулі Байєса розроблено автором.'
    },
    {
        'id': '17',
        'paraId': '00000386',
        'durableId': '00000012',
        'p_idx': 225,
        'anchor': 'інтегральний індекс показників',
        'text': 'Посилання прибрано. Клієнтський сенсор телеметрії редактора Monaco, формули логістичного штрафу P(G_t), адаптивного пом\'якшення P(S_t) та згортки індексу академічної доброчесності C_trust становлять авторський результат.'
    },
    {
        'id': '18',
        'paraId': '00000387',
        'durableId': '00000013',
        'p_idx': 236,
        'anchor': 'алгоритм тактичного відступу по графу знань курсу',
        'text': 'Посилання [7, 15] та [17] прибрано. Алгоритм тактичного відступу назад за орієнтованим графом пререквізитів та трирівнева система когнітивної підтримки спроєктовані автором; у зазначених джерелах викладено лише загальні психолого-педагогічні концепції.'
    }
]

# Helper to re-map a single citation match string
def remap_citation_str(match_str):
    raw = match_str[1:-1] # strip '[' and ']'
    nums = []
    for part in raw.split(','):
        part = part.strip()
        if '–' in part or '-' in part:
            dash = '–' if '–' in part else '-'
            sub = part.split(dash)
            nums.extend(range(int(sub[0]), int(sub[1]) + 1))
        elif part.isdigit():
            nums.append(int(part))
    new_nums = sorted(set(OLD_TO_NEW[n] for n in nums if n in OLD_TO_NEW))
    if not new_nums:
        return match_str
    return '[' + ', '.join(str(n) for n in new_nums) + ']'

def process_document_xml(doc_xml_bytes):
    tree = ET.fromstring(doc_xml_bytes)
    body = tree.find(f'{W}body')
    paragraphs = body.findall(f'{W}p')
    print(f'Total body paragraphs in XML: {len(paragraphs)}')

    # 1. Update Bibliography paragraphs (439 to 486)
    for b_idx, entry in enumerate(BIBLIOGRAPHY_ITEMS):
        p_idx = 439 + b_idx
        p = paragraphs[p_idx]
        full_entry_text = f"{b_idx + 1}. {entry}"
        # Set text on the first run with text, clear other text runs in paragraph
        runs = p.findall(f'{W}r')
        text_placed = False
        for r in runs:
            t_elem = r.find(f'{W}t')
            if t_elem is not None:
                if not text_placed:
                    t_elem.text = full_entry_text
                    text_placed = True
                else:
                    t_elem.text = ''
        if not text_placed:
            # Create a run if none existed
            r = ET.SubElement(p, f'{W}r')
            rPr = ET.SubElement(r, f'{W}rPr')
            rFonts = ET.SubElement(rPr, f'{W}rFonts')
            rFonts.attrib[f'{W}ascii'] = 'Times New Roman'
            rFonts.attrib[f'{W}hAnsi'] = 'Times New Roman'
            rFonts.attrib[f'{W}cs'] = 'Times New Roman'
            sz = ET.SubElement(rPr, f'{W}sz')
            sz.attrib[f'{W}val'] = '28'
            t = ET.SubElement(r, f'{W}t')
            t.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
            t.text = full_entry_text

    print('Bibliography updated successfully (48 items).')

    # 2. Specific updates for target Section 2 paragraphs
    # Paragraph 161:
    # Original runs in 161 have supervisor comment 4 anchored to run '3' in '[1, 3]'.
    # We want to remove '[1, 3]' and '[11, 13]'.
    # Keep supervisor comment 4 on 'сталими величинами'.
    # Add author comment 12 on ' (авторська модифікація)'.
    p161 = paragraphs[161]
    # Let's inspect runs and elements of p161:
    # We rebuild children of p161 preserving pPr
    p161_pPr = p161.find(f'{W}pPr')
    # Remove all children of p161
    p161[:] = [p161_pPr]
    
    def add_run(p, text):
        r = ET.SubElement(p, f'{W}r')
        rPr = ET.SubElement(r, f'{W}rPr')
        rFonts = ET.SubElement(rPr, f'{W}rFonts')
        rFonts.attrib[f'{W}ascii'] = 'Times New Roman'
        rFonts.attrib[f'{W}hAnsi'] = 'Times New Roman'
        rFonts.attrib[f'{W}cs'] = 'Times New Roman'
        sz = ET.SubElement(rPr, f'{W}sz')
        sz.attrib[f'{W}val'] = '28'
        t = ET.SubElement(r, f'{W}t')
        t.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
        t.text = text
        return r

    def add_comment_range(p, c_id, text):
        cr_start = ET.SubElement(p, f'{W}commentRangeStart')
        cr_start.attrib[f'{W}id'] = c_id
        r = add_run(p, text)
        cr_end = ET.SubElement(p, f'{W}commentRangeEnd')
        cr_end.attrib[f'{W}id'] = c_id
        r_ref = ET.SubElement(p, f'{W}r')
        c_ref = ET.SubElement(r_ref, f'{W}commentReference')
        c_ref.attrib[f'{W}id'] = c_id
        return r

    add_run(p161, 'Щоб подолати збої класичного BKT, пов’язані з некоректним зростанням оцінки при сторонньому введенні та інертністю реабілітації, нами запропоновано відмовитися від припущення, що ймовірність вгадування P(G) та ймовірність промаху P(S) є ')
    # Anchor supervisor comment 4 on 'сталими величинами'
    add_comment_range(p161, '4', 'сталими величинами')
    # Anchor author comment 12
    add_comment_range(p161, '12', ' (авторська модифікація)')
    add_run(p161, '. У живому навчальному процесі вони змінюються: учень може писати код зосереджено, припускаючись дрібних синтаксичних помилок, або навпаки — миттєво вставити чужий готовий блок без найменшого розуміння логіки.')

    # Paragraph 162:
    # "Тому константи були замінені на динамічні регулятори P(G_t) та P(S_t), значення яких обчислюються безпосередньо під час сесії на основі даних клієнтського сенсора [3, 4]."
    p162 = paragraphs[162]
    p162_pPr = p162.find(f'{W}pPr')
    p162[:] = [p162_pPr]
    add_run(p162, 'Тому константи були замінені на ')
    add_comment_range(p162, '13', 'динамічні регулятори P(G_t) та P(S_t)')
    add_run(p162, ', значення яких обчислюються безпосередньо під час сесії на основі даних клієнтського сенсора.')

    # Paragraph 164:
    # "Коли учень завершує крок і запускає автоматичне модульне тестування коду, бекенд отримує бінарний результат тестів Y_t ∈ 0, 1 та разом з тим зчитує згенерований сенсором темпоральний вектор поведінки E_t [12] (детальніше побудова цього вектора буде описана в наступних підрозділах)."
    p164 = paragraphs[164]
    p164_pPr = p164.find(f'{W}pPr')
    p164[:] = [p164_pPr]
    add_run(p164, 'Коли учень завершує крок і запускає автоматичне модульне тестування коду, бекенд отримує бінарний результат тестів Y_t ∈ {0, 1} та разом з тим зчитує згенерований сенсором ')
    add_comment_range(p164, '14', 'темпоральний вектор поведінки E_t')
    add_run(p164, ' (детальніше побудова цього вектора буде описана в наступних підрозділах).')

    # Paragraph 186:
    # "Додатний знак похідної (2.6) демонструє зворотну властивість регулятора: чим більше система впевнена, що помилка була випадковою механічною опискою сумлінного учня (зростання P(S_t)), тим менше просідає його рейтинг знання. Оцінка не обвалюється через забуту крапку з комою або друкарську помилку в назві змінної [13]."
    p186 = paragraphs[186]
    p186_pPr = p186.find(f'{W}pPr')
    p186[:] = [p186_pPr]
    add_run(p186, 'Додатний знак похідної (2.6) демонструє ')
    add_comment_range(p186, '15', 'зворотну властивість регулятора')
    add_run(p186, ': чим більше система впевнена, що помилка була випадковою механічною опискою сумлінного учня (зростання P(S_t)), тим менше просідає його рейтинг знання. Оцінка не обвалюється через випадково забуту крапку з комою або незначну друкарську описку в назві ідентифікатора.')

    # Paragraph 188: Contains <m:oMath>!
    # "Під час практичної апробації прототипу серверної частини було виявлено специфіку поведінки формули Байєса при тривалих серіях помилок: значення P(L) стрімко зменшується, набуваючи дуже малих додатних значень (менших за 10^-16) [31, 34]. Якщо після цього здобувач опановує навчальний матеріал і демонструє правильний розв'язок, виникає ризик обнулення знаменника через втрату точності розрядів або надмірну математичну інертність оцінки."
    p188 = paragraphs[188]
    # In p188 we DO NOT clear children! We modify runs in place!
    for r in p188.findall(f'{W}r'):
        t_elem = r.find(f'{W}t')
        if t_elem is not None and t_elem.text:
            if '[31, 34]' in t_elem.text:
                t_elem.text = t_elem.text.replace(' [31, 34].', '.')
    # Add comment 16 range around the target phrase in p188:
    # Let's see runs of p188
    # The first run has "Під час практичної апробації прототипу серверної частини було виявлено специфіку поведінки формули Байєса при тривалих серіях помилок: значення P(L) стрімко "
    # Wrap "специфіку поведінки формули Байєса при тривалих серіях помилок" with comment 16:
    for idx_c, child in enumerate(list(p188)):
        if child.tag == f'{W}r':
            t_elem = child.find(f'{W}t')
            if t_elem is not None and 'специфіку поведінки формули Байєса' in t_elem.text:
                full_t = t_elem.text
                part1, rest = full_t.split('специфіку поведінки формули Байєса при тривалих серіях помилок', 1)
                t_elem.text = part1
                # Insert commentRangeStart, run with anchor, commentRangeEnd, run with commentReference
                cr_s = ET.Element(f'{W}commentRangeStart')
                cr_s.attrib[f'{W}id'] = '16'
                
                r_anc = ET.Element(f'{W}r')
                rPr = ET.SubElement(r_anc, f'{W}rPr')
                rFonts = ET.SubElement(rPr, f'{W}rFonts')
                rFonts.attrib[f'{W}ascii'] = 'Times New Roman'
                rFonts.attrib[f'{W}hAnsi'] = 'Times New Roman'
                rFonts.attrib[f'{W}cs'] = 'Times New Roman'
                sz = ET.SubElement(rPr, f'{W}sz')
                sz.attrib[f'{W}val'] = '28'
                t_anc = ET.SubElement(r_anc, f'{W}t')
                t_anc.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
                t_anc.text = 'специфіку поведінки формули Байєса при тривалих серіях помилок'

                cr_e = ET.Element(f'{W}commentRangeEnd')
                cr_e.attrib[f'{W}id'] = '16'

                r_ref = ET.Element(f'{W}r')
                c_ref = ET.SubElement(r_ref, f'{W}commentReference')
                c_ref.attrib[f'{W}id'] = '16'

                r_rest = ET.Element(f'{W}r')
                rPr_rest = ET.SubElement(r_rest, f'{W}rPr')
                rFonts_rest = ET.SubElement(rPr_rest, f'{W}rFonts')
                rFonts_rest.attrib[f'{W}ascii'] = 'Times New Roman'
                rFonts_rest.attrib[f'{W}hAnsi'] = 'Times New Roman'
                rFonts_rest.attrib[f'{W}cs'] = 'Times New Roman'
                sz_rest = ET.SubElement(rPr_rest, f'{W}sz')
                sz_rest.attrib[f'{W}val'] = '28'
                t_rest = ET.SubElement(r_rest, f'{W}t')
                t_rest.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
                t_rest.text = rest

                # Insert into p188 after idx_c
                insert_idx = idx_c + 1
                for el in [cr_s, r_anc, cr_e, r_ref, r_rest]:
                    p188.insert(insert_idx, el)
                    insert_idx += 1
                break

    # Paragraph 192:
    # "...припускаючи наявність мінімального потенціалу засвоєння концепту (5%), тимчасово заблокованого когнітивною втомою чи стресом [16]."
    p192 = paragraphs[192]
    for r in p192.findall(f'{W}r'):
        t_elem = r.find(f'{W}t')
        if t_elem is not None and t_elem.text:
            if '[16]' in t_elem.text:
                t_elem.text = t_elem.text.replace(' [16].', '.')

    # Paragraph 210:
    # "Модифікована модель BKT, представлена у підрозділі 2.2, використовує дані про те, як саме студент створював розв’язок  [11, 12]. Для отримання таких даних було розроблено клієнтський сенсор, вбудований у редактор коду Monaco, який використовується в розробленій онлайн-платформі [30]."
    p210 = paragraphs[210]
    p210_pPr = p210.find(f'{W}pPr')
    p210[:] = [p210_pPr]
    add_run(p210, 'Модифікована модель BKT, представлена у підрозділі 2.2, використовує аналітичні дані про динаміку створення студентом програмного розв’язку. Для отримання таких метрик було спроєктовано та реалізовано клієнтський сенсор, вбудований у редактор вихідного коду Monaco у складі клієнтського застосунку платформи.')

    # Paragraph 221:
    # "Цей регулятор забезпечує підтримку сумлінного студента, який довго й наполегливо шукав помилку [13]. Якщо учень провів над задачею понад дві хвилини і має десятки правок клавішею Backspace, карати його за випадкову кому в коді негуманно. Тому збільшуємо значення ймовірності промаху:"
    p221 = paragraphs[221]
    for r in p221.findall(f'{W}r'):
        t_elem = r.find(f'{W}t')
        if t_elem is not None and t_elem.text:
            if '[13]' in t_elem.text:
                t_elem.text = t_elem.text.replace(' [13].', '.')

    # Paragraph 225:
    # "Для формування загального вердикту про доброчесність використовується інтегральний індекс показників [11, 18]:"
    p225 = paragraphs[225]
    p225_pPr = p225.find(f'{W}pPr')
    p225[:] = [p225_pPr]
    add_run(p225, 'Для формування загального вердикту про доброчесність використовується ')
    add_comment_range(p225, '17', 'інтегральний індекс показників')
    add_run(p225, ':')

    # Paragraph 236:
    # "Як уже відзначалося у попередньому розділі, однією з вад класичного BKT є циклічність однотипних помилок. Коли студент не може впоратися з задачею, найгірше, що може зробити навчальна система — це знову і знову видавати йому той самий тип завдань. Щоб розірвати петлю фрустрації (The Frustration Loop), розроблено алгоритм тактичного відступу по графу знань курсу [7, 15]."
    p236 = paragraphs[236]
    p236_pPr = p236.find(f'{W}pPr')
    p236[:] = [p236_pPr]
    add_run(p236, 'Як уже відзначалося у попередньому розділі, однією з вад класичного BKT є циклічність однотипних помилок. Коли студент не може впоратися з задачею, найгірше, що може зробити навчальна система — це знову і знову видавати йому той самий тип завдань. Щоб розірвати петлю фрустрації (The Frustration Loop), розроблено ')
    add_comment_range(p236, '18', 'алгоритм тактичного відступу по графу знань курсу')
    add_run(p236, '.')

    # Paragraph 246:
    # "Відзначимо також, що при розробці онлайн-платформи ми принципово відмовилися від кнопки «Показати розв'язок». Замість цього система допомагає поступово [17]."
    p246 = paragraphs[246]
    for r in p246.findall(f'{W}r'):
        t_elem = r.find(f'{W}t')
        if t_elem is not None and t_elem.text:
            if '[17]' in t_elem.text:
                t_elem.text = t_elem.text.replace(' [17].', '.')

    print('Target Section 2 paragraphs successfully updated with removals and author comments.')

    # 3. Now perform re-mapping of all remaining citations across all paragraphs 0..437
    # Regex for citation brackets
    cit_pattern = re.compile(r'\[([\d\s,\–\-]+)\]')
    total_remapped = 0

    for idx in range(0, 438):
        p = paragraphs[idx]
        for r in p.findall(f'{W}r'):
            t_elem = r.find(f'{W}t')
            if t_elem is not None and t_elem.text:
                text = t_elem.text
                if '[' in text and ']' in text:
                    def replacer(m):
                        nonlocal total_remapped
                        res = remap_citation_str(m.group(0))
                        total_remapped += 1
                        return res
                    new_text = cit_pattern.sub(replacer, text)
                    t_elem.text = new_text

    print(f'Total citation occurrences remapped in document runs: {total_remapped}')

    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def process_comments_xml(comm_xml_bytes):
    tree = ET.fromstring(comm_xml_bytes)
    
    for comm in NEW_COMMENTS:
        c_elem = ET.SubElement(tree, f'{W}comment')
        c_elem.attrib[f'{W}id'] = comm['id']
        c_elem.attrib[f'{W}author'] = 'Дмитро Стеценко'
        c_elem.attrib[f'{W}date'] = '2026-11-06T10:30:00Z'
        c_elem.attrib[f'{W}initials'] = 'ДС'

        p_elem = ET.SubElement(c_elem, f'{W}p')
        p_elem.attrib[f'{W14}paraId'] = comm['paraId']
        p_elem.attrib[f'{W}rsidR'] = '00000000'
        p_elem.attrib[f'{W}rsidRDefault'] = '00000000'

        pPr = ET.SubElement(p_elem, f'{W}pPr')
        sp = ET.SubElement(pPr, f'{W}spacing')
        sp.attrib[f'{W}after'] = '0'
        sp.attrib[f'{W}before'] = '0'
        sp.attrib[f'{W}line'] = '240'
        sp.attrib[f'{W}lineRule'] = 'auto'
        jc = ET.SubElement(pPr, f'{W}jc')
        jc.attrib[f'{W}val'] = 'left'

        rPr_p = ET.SubElement(pPr, f'{W}rPr')
        rFonts_p = ET.SubElement(rPr_p, f'{W}rFonts')
        rFonts_p.attrib[f'{W}ascii'] = 'Times New Roman'
        rFonts_p.attrib[f'{W}hAnsi'] = 'Times New Roman'
        rFonts_p.attrib[f'{W}cs'] = 'Times New Roman'
        sz_p = ET.SubElement(rPr_p, f'{W}sz')
        sz_p.attrib[f'{W}val'] = '20'

        r_elem = ET.SubElement(p_elem, f'{W}r')
        rPr_r = ET.SubElement(r_elem, f'{W}rPr')
        rFonts_r = ET.SubElement(rPr_r, f'{W}rFonts')
        rFonts_r.attrib[f'{W}ascii'] = 'Times New Roman'
        rFonts_r.attrib[f'{W}hAnsi'] = 'Times New Roman'
        rFonts_r.attrib[f'{W}cs'] = 'Times New Roman'
        sz_r = ET.SubElement(rPr_r, f'{W}sz')
        sz_r.attrib[f'{W}val'] = '20'

        t_elem = ET.SubElement(r_elem, f'{W}t')
        t_elem.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
        t_elem.text = comm['text']

    print(f'Appended {len(NEW_COMMENTS)} author comments to comments.xml.')
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def process_comments_extended_xml(xml_bytes):
    tree = ET.fromstring(xml_bytes)
    for comm in NEW_COMMENTS:
        c_ex = ET.SubElement(tree, f'{W15}commentEx')
        c_ex.attrib[f'{W15}paraId'] = comm['paraId']
        c_ex.attrib[f'{W15}done'] = '0'
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def process_comments_ids_xml(xml_bytes):
    tree = ET.fromstring(xml_bytes)
    for comm in NEW_COMMENTS:
        c_id = ET.SubElement(tree, f'{W16CID}commentId')
        c_id.attrib[f'{W16CID}paraId'] = comm['paraId']
        c_id.attrib[f'{W16CID}durableId'] = comm['durableId']
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def process_comments_extensible_xml(xml_bytes):
    tree = ET.fromstring(xml_bytes)
    for comm in NEW_COMMENTS:
        c_ex = ET.SubElement(tree, f'{W16CEX}commentExtensible')
        c_ex.attrib[f'{W16CEX}durableId'] = comm['durableId']
        c_ex.attrib[f'{W16CEX}dateUtc'] = '2026-11-06T10:30:00Z'
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)

def main():
    src_path = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\RELEASE\V-13.6-Магістерська_робота_122.docx'
    dst_v13_7 = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\RELEASE\V-13.7-Магістерська_робота_122.docx'
    dst_main = r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\Магістерська_робота_122.docx'

    print(f'Reading source: {src_path}')
    
    with zipfile.ZipFile(src_path, 'r') as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    print('Modifying XML files...')
    files['word/document.xml'] = process_document_xml(files['word/document.xml'])
    files['word/comments.xml'] = process_comments_xml(files['word/comments.xml'])
    files['word/commentsExtended.xml'] = process_comments_extended_xml(files['word/commentsExtended.xml'])
    files['word/commentsIds.xml'] = process_comments_ids_xml(files['word/commentsIds.xml'])
    files['word/commentsExtensible.xml'] = process_comments_extensible_xml(files['word/commentsExtensible.xml'])

    print(f'Writing output to: {dst_v13_7}')
    with zipfile.ZipFile(dst_v13_7, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)

    print(f'Copying to: {dst_main}')
    shutil.copyfile(dst_v13_7, dst_main)
    print('Done successfully!')

if __name__ == '__main__':
    main()
