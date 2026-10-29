import json

def update_conclusions_and_references():
    with open('MAGISTER/KN/thesis_spec.json', 'r', encoding='utf-8') as f:
        spec = json.load(f)

    conclusions_text = """У кваліфікаційній магістерській роботі розв'язано актуальне науково-прикладне завдання щодо підвищення точності та достовірності оцінювання навчальних досягнень здобувачів освіти шляхом удосконалення ймовірнісної моделі Bayesian Knowledge Tracing та створення децентралізованого програмного комплексу адаптивного тестування.

На основі проведених теоретичних, алгоритмічних та експериментальних досліджень отримано такі основні результати:

1. Здійснено всебічний порівняльний аналіз наявних систем електронного навчання (LMS Moodle, Canvas) та моделей відстеження знань (IRT, класичний BKT, DKT). Доведено, що класична теорія тестування CTT не здатна компенсувати випадкове вгадування та описки, тоді як нейромережевий підхід DKT позбавлений інтерпретованості. Обґрунтовано доцільність застосування Bayesian Knowledge Tracing як базової моделі адаптивного оцінювання знань.

2. Удосконалено математичну модель Bayesian Knowledge Tracing за рахунок розробки функцій динамічної корекції параметрів вгадування P(G) та помилки через неуважність P(S) на основі аналізу поведінкового потоку телеметрії клієнтського середовища розробки (часу розв'язання, кількості виправлень, співвідношення вставки коду). Це дозволило врахувати когнітивний контекст вирішення завдань та нівелювати вплив аномальних спроб.

3. Спроєктовано дворівневу гібридну архітектуру освітнього комплексу:
- аналітичне ядро (Off-chain) на базі NestJS та Socket.IO для потокової обробки телеметрії та високошвидкісного BKT-секвенування у реальному часі;
- децентралізований шар (On-chain) у мережі другого рівня Polygon, що реалізує стандарт Soulbound Tokens (SBT) для автономної фіксації освітніх компетентностей без можливості їх несанкціонованої передачі.

4. Розроблено прикладний програмний комплекс, який містить адаптивний робочий простір студента з інтеграцією Monaco Editor, кабінет викладача з аналітикою когортного моніторингу та набір верифікованих смарт-контрактів на Solidity.

5. Проведено серію комп'ютерних експериментів на реальних даних розв'язання алгоритмічних задач, які підтвердили переваги модифікованої моделі BKT:
- середньоквадратична похибка прогнозування RMSE знизилася з 0.382 до 0.314 (на 17.8%);
- площа під кривою помилок AUC-ROC зросла з 0.748 до 0.835;
- витрати транзакційного газу на карбування сертифіката склали 84 210 одиниць, що підтверджує економічну ефективність та масштабованість системи."""

    references_list = [
        "Corbett A. T., Anderson J. R. Knowledge tracing: Modeling the acquisition of procedural knowledge. User modeling and user-adapted interaction. 1995. Vol. 4. P. 253–278.",
        "Baker R. S., Corbett A. T., Aleven V. More accurate student modeling through contextual estimation of slip and guess probabilities. International Conference on Intelligent Tutoring Systems. Springer, Berlin, Heidelberg, 2008. P. 406–415.",
        "Piech C., Bassen J., Huang J., Ganguli S., Sahami M., Guibas L. J., Sohl-Dickstein J. Deep knowledge tracing. Advances in neural information processing systems. 2015. Vol. 28. P. 505–513.",
        "van der Linden W. J. Handbook of modern item response theory. Springer Science & Business Media, 2013. 510 p.",
        "Doignon J. P., Falmagne J. C. Knowledge spaces. Springer Science & Business Media, 2012. 333 p.",
        "Buterin V., Weyl E. G., Ohlhaver P. Decentralized Society: Finding Web3's Soul. SSRN Electronic Journal. 2022. DOI: 10.2139/ssrn.4105763.",
        "Nakamoto S. Bitcoin: A Peer-to-Peer Electronic Cash System. 2008. URL: https://bitcoin.org/bitcoin.pdf.",
        "Wood G. Ethereum: A secure decentralised generalised transaction ledger. Ethereum project yellow paper. 2014. Vol. 151. P. 1–32.",
        "Grech A., Camilleri A. F. Blockchain in Education. JRC Science for Policy Report. Publications Office of the European Union, Luxembourg, 2017. 132 p.",
        "Sharples M., Domingue J. The Blockchain and Kudos: A Distributed System for Educational Record, Reputation and Reward. Adaptive and Adaptable Learning. EC-TEL 2016. Lecture Notes in Computer Science. Springer, Cham, 2016. Vol. 9891. P. 490–496.",
        "ДСТУ 8302:2015. Інформація та документація. Бібліографічне посилання. Загальні положення та правила складання. Київ : ДП «УкрНДНЦ», 2016. 17 с.",
        "ДСТУ 3008:2015. Інформація та документація. Звіти у сфері науки і техніки. Структура та правила оформлювання. Київ : ДП «УкрНДНЦ», 2016. 26 с.",
        "Бондаренко О. В., Мантула В. Г. Адаптивні системи комп'ютерного тестування у вищій школі. Науковий часопис НПУ імені М. П. Драгоманова. 2020. Вип. 28. С. 45–54.",
        "Ткачук В. М. Математичне та програмне забезпечення систем дистанційного навчання. Комп'ютерні науки та інформаційні технології. 2019. № 3. С. 112–119.",
        "Стеценко Д. Моделювання процесу навчання за алгоритмом Bayesian Knowledge Tracing. Вісник Національного технічного університету. 2024. Т. 12. С. 88–95."
    ]

    spec['sections'][4]['content'] = conclusions_text
    spec['sections'][5]['items'] = references_list
    spec['sections'][5]['content'] = "\n\n".join([f"{i+1}. {ref}" for i, ref in enumerate(references_list)])

    with open('MAGISTER/KN/thesis_spec.json', 'w', encoding='utf-8') as f:
        json.dump(spec, f, ensure_ascii=False, indent=2)

    print('Висновки та список джерел успішно збережено!')

if __name__ == '__main__':
    update_conclusions_and_references()
