import re, io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

files = [
    'MAGISTER/INFORMATICA/sections/intro_conclusions.py',
    'MAGISTER/INFORMATICA/sections/section_1.py',
    'MAGISTER/INFORMATICA/sections/section_2.py',
    'MAGISTER/INFORMATICA/sections/section_3.py',
    'MAGISTER/INFORMATICA/sections/section_4.py',
    'MAGISTER/INFORMATICA/sections/section_5.py',
    'MAGISTER/INFORMATICA/sections/bibliography.py'
]

banned_cliches = [
    r'варто зазначити',
    r'слід підкреслити',
    r'не викликає сумніву',
    r'широкий спектр',
    r'відіграє ключову роль',
    r'стрімкий розвиток',
    r'унікальний',
    r'революційний',
    r'проривний',
    r'глухий кут',
    r'вичерпали',
    r'безпорадність',
    r'депресія',
    r'ідеальний',
    r'пастка'
]

total_words = 0
found_any = False
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        txt = f.read()
    words = len(txt.split())
    total_words += words
    print(f"{fpath}: {words} words")
    for pat in banned_cliches:
        matches = re.findall(pat, txt, re.IGNORECASE)
        if matches:
            found_any = True
            print(f"  [WARNING] Found {len(matches)} occurrences of '{pat}' in {fpath}")

print(f"\nTotal words in INFORMATICA sections: {total_words}")
if not found_any:
    print("ALL CLEAR: 0 banned clichés found across all sections!")
