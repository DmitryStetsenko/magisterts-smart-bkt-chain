# -*- coding: utf-8 -*-
import os
import re
import json

def parse_markdown(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Source file not found at {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    project_title = ""
    sections = []
    current_section = None
    
    # Regular expressions for headers
    h1_re = re.compile(r"^#\s+(.+)$")
    h2_re = re.compile(r"^##\s+(.+)$")
    h3_re = re.compile(r"^###\s+(.+)$")
    
    # Regular expression to parse bold key-value pairs (e.g., **Key:** **Value** or **Key:** Value)
    kv_re = re.compile(r"^\*\*([^*:]+)\*\*:\s*(.*)$")
    
    in_code_block = False
    code_block_content = []
    code_block_lang = ""

    for line in lines:
        stripped = line.strip()
        
        # Handle code blocks
        if stripped.startswith("```"):
            if in_code_block:
                in_code_block = False
                if current_section:
                    target = current_section
                    if current_section["subsections"]:
                        target = current_section["subsections"][-1]
                    target["code_blocks"].append({
                        "lang": code_block_lang,
                        "content": "".join(code_block_content).strip()
                    })
                code_block_content = []
                code_block_lang = ""
            else:
                in_code_block = True
                code_block_lang = stripped[3:].strip()
            continue
            
        if in_code_block:
            code_block_content.append(line)
            continue
            
        # Match H1
        m1 = h1_re.match(stripped)
        if m1:
            project_title = m1.group(1).strip()
            continue
            
        # Match H2
        m2 = h2_re.match(stripped)
        if m2:
            if current_section:
                sections.append(current_section)
            current_section = {
                "title": m2.group(1).strip(),
                "level": 2,
                "paragraphs": [],
                "code_blocks": [],
                "items": [],
                "subsections": []
            }
            continue
            
        # Match H3
        m3 = h3_re.match(stripped)
        if m3:
            subsec = {
                "title": m3.group(1).strip(),
                "level": 3,
                "paragraphs": [],
                "code_blocks": [],
                "items": []
            }
            if current_section:
                current_section["subsections"].append(subsec)
            else:
                # Fallback if no H2 yet
                current_section = {
                    "title": "Introduction",
                    "level": 2,
                    "paragraphs": [],
                    "code_blocks": [],
                    "items": [],
                    "subsections": [subsec]
                }
            continue

        # Add text content or lists to active section/subsection
        if current_section:
            target = current_section
            if current_section["subsections"]:
                target = current_section["subsections"][-1]
            
            if stripped:
                # Check if this is a subitem (starts with indent and * or - or is rationale)
                is_subitem = line.startswith("    ") or line.startswith("\t") or stripped.startswith("*Чому:*") or stripped.startswith("_Чому:_")
                
                if is_subitem:
                    sub_text = re.sub(r'^\s*[*+-]\s+', '', stripped).strip()
                    # Clean up markdown formatting from rationale prefix
                    if sub_text.startswith("*Чому:*"):
                        sub_text = sub_text[len("*Чому:*"):].strip()
                    elif sub_text.startswith("_Чому:_"):
                        sub_text = sub_text[len("_Чому:_"):].strip()
                    elif sub_text.startswith("Чому:"):
                        sub_text = sub_text[len("Чому:"):].strip()
                        
                    if "items" in target and target["items"]:
                        target["items"][-1]["subitems"].append(sub_text)
                    else:
                        target["paragraphs"].append(stripped)
                elif stripped.startswith("*") or stripped.startswith("-") or (stripped[0].isdigit() and stripped[1] == '.'):
                    # Clean the list item bullet
                    item_text = re.sub(r'^\s*[*+-]\s+', '', stripped).strip()
                    if item_text and item_text[0].isdigit() and '.' in item_text[:3]:
                        item_text = item_text.split('.', 1)[1].strip()
                    
                    # Parse key-value structure in bullet items
                    kv_match = kv_re.match(item_text)
                    if kv_match:
                        key = kv_match.group(1).strip()
                        val = kv_match.group(2).strip()
                        # Strip bold formatting from value if present
                        if val.startswith("**") and val.endswith("**"):
                            val = val[2:-2].strip()
                        target["items"].append({
                            "type": "kv",
                            "key": key,
                            "value": val,
                            "raw_text": item_text,
                            "subitems": []
                        })
                    else:
                        target["items"].append({
                            "type": "text",
                            "raw_text": item_text,
                            "subitems": []
                        })
                else:
                    target["paragraphs"].append(stripped)
                    
    if current_section:
        sections.append(current_section)
        
    return {
        "project_title": project_title,
        "sections": sections
    }

def compile_file(source_path, primary_output_path, secondary_output_path=None):
    print(f"Parsing {source_path}...")
    try:
        structured_data = parse_markdown(source_path)
        
        # Save to primary JSON
        with open(primary_output_path, "w", encoding="utf-8") as f:
            json.dump(structured_data, f, indent=2, ensure_ascii=False)
        print(f"Successfully generated structured JSON at: {primary_output_path}")
        
        # Save to secondary JSON if provided
        if secondary_output_path:
            os.makedirs(os.path.dirname(secondary_output_path), exist_ok=True)
            with open(secondary_output_path, "w", encoding="utf-8") as f:
                json.dump(structured_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated structured JSON at: {secondary_output_path}")
    except Exception as e:
        print(f"Error parsing {source_path}: {str(e)}")

def main():
    compile_file("docs/roadmap.md", "docs/roadmap.json", "apps/docs/src/data/roadmap.json")
    compile_file("docs/tech_stack.source.md", "docs/tech_stack.json", "apps/docs/src/data/tech_stack.json")
    compile_file("docs/project_management.md", "docs/project_management.json", "apps/docs/src/data/project_management.json")

if __name__ == "__main__":
    main()


