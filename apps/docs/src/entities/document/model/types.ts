export interface CodeBlock {
  lang: string;
  content: string;
}

export interface Item {
  type: string;
  key?: string;
  value?: string;
  raw_text: string;
  subitems: string[];
}

export interface Subsection {
  title: string;
  level: number;
  paragraphs: string[];
  code_blocks: CodeBlock[];
  items: Item[];
}

export interface Section {
  title: string;
  level: number;
  paragraphs: string[];
  code_blocks: CodeBlock[];
  items: Item[];
  subsections: Subsection[];
}

export interface DocData {
  project_title: string;
  sections: Section[];
}

export type Tab = 'roadmap' | 'tech' | 'pm';
