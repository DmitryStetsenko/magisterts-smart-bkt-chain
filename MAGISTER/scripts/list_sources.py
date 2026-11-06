import re

with open('MAGISTER/scripts/apply_alphabetical_citations_and_comments.py', encoding='utf-8') as f:
    text = f.read()

start = text.find('BIBLIOGRAPHY_ITEMS = [')
end = text.find(']\n\ndef remap_citation_str', start)
block = text[start:end]

items = re.findall(r'"([^"\n]+)"', block)
for i, item in enumerate(items, 1):
    print(f"{i:2d}: {item[:80]}")
