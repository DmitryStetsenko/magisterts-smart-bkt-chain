import docx
import re

doc = docx.Document(r'D:\PROJECTS\MAGISTERS\SMART-BKT-CHAIN\MAGISTER\KN\RELEASE\V-13.6-Магістерська_робота_122.docx')
sources = []
for i in range(439, len(doc.paragraphs)):
    t = doc.paragraphs[i].text.strip()
    if t:
        m = re.match(r'^(\d+)\.\s*(.+)', t)
        if m:
            sources.append((int(m.group(1)), m.group(2).strip(), t))

print(f'Total sources found: {len(sources)}')

# Ukrainian alphabet sorting
ukr_alphabet = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ'
ukr_order = {ch: idx for idx, ch in enumerate(ukr_alphabet)}

def ukr_key(s):
    clean = s[1].upper()
    return [ukr_order.get(c, ord(c) + 100) for c in clean[:30]]

cyr = [s for s in sources if ord(s[1][0]) > 128]
lat = [s for s in sources if ord(s[1][0]) <= 128]

cyr_sorted = sorted(cyr, key=ukr_key)
lat_sorted = sorted(lat, key=lambda s: s[1].lower())

all_sorted = cyr_sorted + lat_sorted

old_to_new = {}
print('=== SORTED SOURCES ===')
for new_idx, (old_num, entry, raw) in enumerate(all_sorted, 1):
    old_to_new[old_num] = new_idx
    print(f'{new_idx:2d}. [was {old_num:2d}] {entry[:75]}')

print('\n=== MAPPING DICT ===')
print('OLD_TO_NEW = {')
for o in sorted(old_to_new.keys()):
    print(f'    {o}: {old_to_new[o]},')
print('}')
