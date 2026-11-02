"""
Список використаних джерел до кваліфікаційної магістерської роботи
зі спеціальності 122 «Комп'ютерні науки».
Тема: «Розробка інтелектуальної EdTech-системи адаптивного навчання та децентралізованого
оцінювання знань на основі моделі Bayesian Knowledge Tracing та технології блокчейн»

Оформлено згідно з вимогами ДСТУ 8302:2015 та ДСТУ 3008:2015.
Структурно покриває всі 5 розділів роботи:
- [1] - [10]: Моделі Knowledge Tracing (BKT, IRT, DKT), адаптивне навчання та ITS
- [11] - [18]: Поведінкова телеметрія, аналітика кодописання та детектори аномалій
- [19] - [26]: Блокчейн, смарт-контракти, Soulbound токени та Web3 в освіті
- [27] - [34]: Архітектура мікросервісів, WebSockets, NestJS, монорепозиторії та UI
- [35] - [39]: Гнучка методологія Agile/Jira, тестування, метрики RMSE/AUC та статистика
- [40] - [44]: Провідні вітчизняні дослідження цифрової трансформації освіти, ШІ та адаптивних систем (В. Биков, О. Спірін, С. Семеріков, В. Осадчий, К. Осадча)
- [45] - [46]: Дослідження українських науковців у галузі блокчейн-технологій, смарт-контрактів та NFT в освіті (І. Опірський, В. Балацька, В. Побережник)
- [47] - [48]: Національні державні стандарти України (ДСТУ 3008:2015, ДСТУ 8302:2015)
"""

def get_bibliography_items():
    return [
        # 1-10: Моделі Knowledge Tracing, теорія тестів та адаптивні системи
        "1. Corbett A. T., Anderson J. R. Knowledge tracing: Modeling the acquisition of procedural knowledge. User Modeling and User-Adapted Interaction. 1994. Vol. 4, no. 4. P. 253–278. DOI: 10.1007/BF01099821.",
        "2. Piech C., Bassen J., Huang J., Ganguli S., Sahami M., Guibas L. J., Sohl-Dickstein J. Deep knowledge tracing. Advances in Neural Information Processing Systems (NeurIPS 2015). Montreal, 2015. Vol. 28. P. 505–513.",
        "3. Baker R. S. J. d., Corbett A. T., Aleven V. More accurate student modeling through contextual estimation of slip and guess probabilities. Intelligent Tutoring Systems : 9th International Conference (Montreal, June 23–27, 2008). Berlin : Springer, 2008. P. 406–415. DOI: 10.1007/978-3-540-69132-7_44.",
        "4. Yudelson M. V., Koedinger K. R., Gordon G. J. Individualized Bayesian Knowledge Tracing models. Artificial Intelligence in Education : 16th International Conference (Memphis, July 9–13, 2013). Berlin : Springer, 2013. P. 171–180. DOI: 10.1007/978-3-642-39112-5_18.",
        "5. Lord F. M. Applications of Item Response Theory to Practical Testing Problems. Mahwah : Lawrence Erlbaum Associates, 1980. 288 p.",
        "6. Rasch G. Probabilistic Models for Some Intelligence and Attainment Tests. Chicago : University of Chicago Press, 1993. 199 p.",
        "7. Falmagne J.-C., Doignon J.-P. Learning Spaces: Interdisciplinary Applied Mathematics. Berlin, Heidelberg : Springer-Verlag, 2011. 434 p. DOI: 10.1007/978-3-642-01039-2.",
        "8. VanLehn K. The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring modalities. Educational Psychologist. 2011. Vol. 46, no. 4. P. 197–221. DOI: 10.1080/00461520.2011.611369.",
        "9. Anderson J. R., Corbett A. T., Koedinger K. R., Pelletier R. Cognitive tutors: Lessons learned. The Journal of the Learning Sciences. 1995. Vol. 4, no. 2. P. 167–207. DOI: 10.1207/s15327809jls0402_2.",
        "10. Koedinger K. R., Corbett A. T. Cognitive tutors: Technology bringing learning science to the classroom. The Cambridge Handbook of the Learning Sciences / ed. by R. K. Sawyer. Cambridge : Cambridge University Press, 2006. P. 61–78.",

        # 11-18: Сенсорна телеметрія, аналітика процесу кодування та академічна доброчесність
        "11. Edwards S. H., Snyder C. A., Perez-Quinones M. A., Allevato A., Saha D., Subramanian K. Comparing effective and ineffective behaviors of student programmers. Proceedings of the fifth international workshop on Computing education research (ICER '09). Berkeley, 2009. P. 3–14. DOI: 10.1145/1584322.1584325.",
        "12. Blikstein P. Using learning analytics to assess students' behavior in open-ended programming tasks. Proceedings of the 1st International Conference on Learning Analytics and Knowledge (LAK '11). Banff, 2011. P. 102–111. DOI: 10.1145/2090116.2090132.",
        "13. Becker B. A., Denny P., Finnie-Ansley J., Luxton-Reilly A., Prather J., Santos E. A. Programming Is Hard — Or at Least It Used to Be: Educational Opportunities and Challenges of AI Code Generation. Proceedings of the 54th ACM Technical Symposium on Computer Science Education (SIGCSE 2023). Toronto, 2023. P. 500–506. DOI: 10.1145/3545945.3569759.",
        "14. Sorva J. Visual program simulation in introductory programming education : doctoral dissertation. Espoo : Aalto University, 2012. 288 p.",
        "15. Qian Y., Lehman J. Students' misconceptions and other difficulties in introductory programming: A literature review. ACM Transactions on Computing Education. 2017. Vol. 18, no. 1. P. 1–24. DOI: 10.1145/3077618.",
        "16. Sweller J. Cognitive load theory and educational technology. Educational Technology Research and Development. 2020. Vol. 68, no. 1. P. 1–16. DOI: 10.1007/s11423-019-09701-3.",
        "17. Wood D., Bruner J. S., Ross G. The role of tutoring in problem solving. Journal of Child Psychology and Psychiatry. 1976. Vol. 17, no. 2. P. 89–100. DOI: 10.1111/j.1469-7610.1976.tb00381.x.",
        "18. Epp C. D., Lippold M., Mandryk R. L. Identifying emotional states using keystroke dynamics. Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI '11). Vancouver, 2011. P. 715–724. DOI: 10.1145/1978942.1979046.",

        # 19-26: Блокчейн, смарт-контракти, непередавані токени (SBT) та безпека
        "19. Nakamoto S. Bitcoin: A Peer-to-Peer Electronic Cash System. 2008. 9 p. URL: https://bitcoin.org/bitcoin.pdf (accessed: 14.10.2026).",
        "20. Buterin V. Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform. 2014. 36 p. URL: https://ethereum.org/en/whitepaper/ (accessed: 14.10.2026).",
        "21. Weyl E. G., Ohlhaver P., Buterin V. Decentralized Society: Finding Web3's Soul. SSRN Electronic Journal. 2022. 37 p. DOI: 10.2139/ssrn.4105763.",
        "22. Entriken W., Shirley D., Evans J., Sachs N. EIP-721: Non-Fungible Token Standard. Ethereum Improvement Proposals. 2018. no. 721. URL: https://eips.ethereum.org/EIPS/eip-721 (accessed: 14.10.2026).",
        "23. Darabi T., Martins T. EIP-5192: Minimal Soulbound NFTs. Ethereum Improvement Proposals. 2022. no. 5192. URL: https://eips.ethereum.org/EIPS/eip-5192 (accessed: 14.10.2026).",
        "24. Grech A., Camilleri A. F. Blockchain in Education. Luxembourg : Publications Office of the European Union, 2017. 132 p. DOI: 10.2760/60649.",
        "25. Schmidt P. MIT Media Lab: Certificates, Reputation, and the Blockchain. MIT Media Lab Working Paper. Cambridge : MIT, 2015. 14 p.",
        "26. Wood G. Ethereum: A Secure Decentralised Generalised Transaction Ledger (Berlin Version). 2024. 41 p. URL: https://ethereum.github.io/yellowpaper/paper.pdf (accessed: 14.10.2026).",

        # 27-34: Архітектура програмних комплексів, вебсокети, бази даних та фронтенд
        "27. Cockburn A. Hexagonal Architecture: Alistair Cockburn's architectural pattern (Ports and Adapters). 2005. URL: https://alistair.cockburn.us/hexagonal-architecture/ (accessed: 14.10.2026).",
        "28. Martin R. C. Clean Architecture: A Craftsman's Guide to Software Structure and Design. Boston : Prentice Hall, 2017. 432 p.",
        "29. Fette I., Melnikov A. The WebSocket Protocol. RFC 6455. Internet Engineering Task Force (IETF), 2011. 71 p. DOI: 10.17487/RFC6455.",
        "30. Flanagan D. JavaScript: The Definitive Guide. Master the World's Most-Used Programming Language. 7th ed. Sebastopol : O'Reilly Media, 2020. 706 p.",
        "31. Bierman G., Abadi M., Torgersen M. Understanding TypeScript. European Conference on Object-Oriented Programming (ECOOP 2014). Berlin : Springer, 2014. P. 257–281. DOI: 10.1007/978-3-662-44202-9_11.",
        "32. Banks A., Porcello E. Learning React: Modern Patterns for Developing React Applications. 2nd ed. Sebastopol : O'Reilly Media, 2020. 330 p.",
        "33. Geewax C. API Design Patterns. Shelter Island : Manning Publications, 2021. 475 p.",
        "34. Kleppmann M. Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems. Sebastopol : O'Reilly Media, 2017. 616 p.",

        # 35-48: Інженерія ПЗ, гнучкі методології Agile/Jira, сучасні вітчизняні дослідження та стандарти
        "35. Beck K., Beedle M., van Bennekum A., Cockburn A., Cunningham W., Fowler M., Highsmith J., Hunt A., Jeffries R., Kern J., Marick B., Martin R. C., Mellor S., Schwaber K., Sutherland J., Thomas D. Manifesto for Agile Software Development. 2001. URL: https://agilemanifesto.org/ (accessed: 14.10.2026).",
        "36. Schwaber K., Sutherland J. The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game. Scrum.org, 2020. 14 p.",
        "37. Chacon S., Straub B. Pro Git. 2nd ed. New York : Apress, 2014. 456 p. DOI: 10.1007/978-1-4842-0076-6.",
        "38. Fawcett T. An introduction to ROC analysis. Pattern Recognition Letters. 2006. Vol. 27, no. 8. P. 861–874. DOI: 10.1016/j.patrec.2005.10.010.",
        "39. Cohen J. Statistical Power Analysis for the Behavioral Sciences. 2nd ed. Hillsdale : Lawrence Erlbaum Associates, 1988. 567 p.",
        "40. Биков В. Ю., Спірін О. М., Пінчук О. П. Сучасні завдання цифрової трансформації освіти. Вісник Кафедри ЮНЕСКО «Неперервна професійна освіта ХХІ століття». 2020. Вип. 1. С. 27–36. DOI: 10.35387/ucj.1(1).2020.27-36.",
        "41. Спірін О. М., Олексюк В. П., Осадчий В. В., Вакалюк Т. А., Семеріков С. О. Основні компоненти теоретичної моделі інтеграції штучного інтелекту в наукові дослідження у галузі освіти. Інформаційні технології і засоби навчання. 2026. Т. 113, № 3. С. 211–238. DOI: 10.33407/itlt.v113i3.6707.",
        "42. Osadcha K., Osadchyi V., Semerikov S., Chemerys H., Chorna A. The review of the adaptive learning systems for the formation of individual educational trajectory. CEUR Workshop Proceedings (ICTERI 2020). 2020. Vol. 2732. P. 547–558. URL: https://ceur-ws.org/Vol-2732/20200547.pdf (accessed: 14.10.2026).",
        "43. Osadchyi V., Krasheninnik I., Spirin O., Koniukhov S., Diuzhykova T. Personalized and Adaptive ICT-Enhanced Learning: A Brief Review of Research from 2010 to 2019. CEUR Workshop Proceedings (ICTERI 2020). 2020. Vol. 2732. P. 559–571. URL: https://ceur-ws.org/Vol-2732/20200559.pdf (accessed: 14.10.2026).",
        "44. Осадча К. П., Осадчий В. В., Круглик В. С., Спірін О. М., Крашеніннік І. В., Горбатюк Р. М. Model of blended learning in higher educational institutions: development, implementation and evaluation. Інформаційні технології і засоби навчання. 2022. Т. 91, № 5. С. 158–169. DOI: 10.33407/itlt.v91i5.5045.",
        "45. Опірський І. Р., Балацька В. С., Побережник В. О. Сучасні можливості використання технології блокчейн у системі освіти. Безпека інформації. 2023. Т. 29, № 3. С. 138–146. DOI: 10.18372/2225-5036.29.18073.",
        "46. Балацька В. С., Побережник В. О., Опірський І. Р. Використання Non-Fungible Tokens та блокчейн для розмежування доступу до державних реєстрів. Кібербезпека: освіта, наука, техніка. 2024. Т. 4, № 24. С. 45–58. DOI: 10.28925/2663-4023.2024.24.4558.",
        "47. ДСТУ 3008:2015. Інформація та документація. Звіти у сфері науки і техніки. Структура та правила оформлювання. Київ : ДП «УкрНДНЦ», 2016. 26 с.",
        "48. ДСТУ 8302:2015. Інформація та документація. Бібліографічне посилання. Загальні положення та правила складання. Київ : ДП «УкрНДНЦ», 2016. 17 с."
    ]

def get_bibliography_section():
    items = get_bibliography_items()
    content = "\n\n".join(items)
    return {
        "id": "bibliography",
        "title": "СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ",
        "type": "bibliography",
        "targetPages": 4,
        "content": content
    }
