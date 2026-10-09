#!/usr/bin/env node

/**
 * Compilador ultra-plano de preguntas técnicas para @dokove/questions-bank
 * Lee questions/*.md y compila dist/questions-data.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const QUESTIONS_DIR = path.join(ROOT_DIR, 'questions');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

fs.mkdirSync(DIST_DIR, { recursive: true });

function parseStars(line) {
 const match = line.match(/(?:[★☆]+)/);
 if (!match) return 2;
 const starsStr = match[0];
 return (starsStr.match(/[★☆]/g) || []).length;
}

function parseQuestionFile(filePath, filename) {
 const rawContent = fs.readFileSync(filePath, 'utf8');
 const parsedMatter = matter(rawContent);
 const frontmatter = parsedMatter.data || {};
 const content = parsedMatter.content || '';

 const fileSlug = filename.replace(/\.md$/, '');
 const lines = content.split('\n');

 const cleanModuleTitle = frontmatter.title
 ? frontmatter.title.replace(/^\d+[\.\s\-]+/, '').trim()
 : fileSlug.replace(/-/g, ' ').toUpperCase();

 let currentSection = {
 id: 'sec-1',
 title: cleanModuleTitle,
 questions: [],
 };
 const sections = [currentSection];
 let currentQuestion = null;
 let fileQuestionCount = 0;

 for (let i = 0; i < lines.length; i++) {
 const line = lines[i];
 const trimmed = line.trim();

 // Check for Section headers (## Bloque ...)
 const sectionMatch = trimmed.match(/^##\s+(.*)/);
 if (sectionMatch) {
 if (currentQuestion) {
 currentSection.questions.push(currentQuestion);
 currentQuestion = null;
 }
 currentSection = {
 id: `sec-${sections.length + 1}`,
 title: sectionMatch[1].trim(),
 questions: [],
 };
 sections.push(currentSection);
 continue;
 }

 // Check for Question headers (### Q<n>: ... or ### <n>: ...)
 const qMatch = trimmed.match(/^###\s+(?:Q\d+:|\d+\.|\d+:)?\s*(.*)/i);
 if (qMatch && !trimmed.startsWith('####')) {
 if (currentQuestion) {
 currentSection.questions.push(currentQuestion);
 }
 const title = qMatch[1].replace(/[★☆]+/g, '').trim();
 const stars = parseStars(trimmed);
 fileQuestionCount++;
 const qIndex = fileQuestionCount;

 currentQuestion = {
 id: `${fileSlug}-q${qIndex}`,
 number: qIndex,
 title,
 seniority: frontmatter.seniority || (stars <= 2 ? 'Junior' : stars === 3 ? 'Mid' : stars === 4 ? 'Senior' : 'Lead / Architect'),
 difficulty: stars <= 2 ? 'Junior' : stars === 3 ? 'Mid' : stars === 4 ? 'Senior' : 'Lead / Architect',
 stars,
 category: frontmatter.category || 'questions.software-engineering',
 tags: frontmatter.tags || [],
 concepts: frontmatter.concepts || [],
 redFlag: null,
 greenFlag: null,
 answerLines: [],
 };
 continue;
 }

 if (!currentQuestion) continue;

 // Parse metadata inside question
 const senMatch = line.match(/^-\s+\*\*(?:Seniority|Nivel|Dificultad)\*\*:\s*(.*)/i);
 if (senMatch) {
 currentQuestion.seniority = senMatch[1].trim();
 continue;
 }

 const catMatch = line.match(/^-\s+\*\*(?:Categoría|Category)\*\*:\s*`?(.*?)`?$/i);
 if (catMatch) {
 currentQuestion.category = catMatch[1].trim();
 continue;
 }

 const conceptsMatch = line.match(/^-\s+\*\*(?:Conceptos|Concepts)\*\*:\s*(.*)/i);
 if (conceptsMatch) {
 currentQuestion.concepts = conceptsMatch[1]
 .split(',')
 .map((c) => c.replace(/[`*]/g, '').trim())
 .filter(Boolean);
 continue;
 }

 const redMatch = line.match(/^[-*\s]*(?:|)?\s*[*_]{1,2}Red Flags?[*_]{1,2}:\s*(.*)/iu);
 if (redMatch) {
 currentQuestion.redFlag = redMatch[1].trim();
 continue;
 }

 const greenMatch = line.match(/^[-*\s]*[*_]{1,2}Green Flags?[*_]{1,2}:\s*(.*)/iu);
 if (greenMatch) {
 currentQuestion.greenFlag = greenMatch[1].trim();
 continue;
 }

 if (/^####\s+Respuesta Técnica/i.test(trimmed)) continue;
 if (/^####\s+Respuesta Conceptual/i.test(trimmed)) continue;
 if (/^---\s*$/.test(trimmed)) continue;

 currentQuestion.answerLines.push(line);
 }

 if (currentQuestion) {
 currentSection.questions.push(currentQuestion);
 }

 // Finalize answers and counts
 const validSections = sections.filter((s) => s.questions.length > 0);
 let totalQuestions = 0;
 let totalRedFlags = 0;
 let totalGreenFlags = 0;

 for (const sec of validSections) {
 totalQuestions += sec.questions.length;
 for (const q of sec.questions) {
 if (q.redFlag) totalRedFlags++;
 if (q.greenFlag) totalGreenFlags++;
 q.answer = q.answerLines.join('\n').trim();
 delete q.answerLines;
 }
 }

 return {
 id: fileSlug,
 title: frontmatter.title || fileSlug.replace(/-/g, ' ').toUpperCase(),
 category: frontmatter.category || 'questions.software-engineering',
 tags: frontmatter.tags || [],
 filePath: `questions/${filename}`,
 totalQuestions,
 stats: {
 sections: validSections.length,
 redFlags: totalRedFlags,
 greenFlags: totalGreenFlags,
 },
 sections: validSections,
 };
}

export function buildQuestions() {
 console.log('Compilando banco de preguntas ultra-plano de @dokove/questions-bank...');

 const files = fs
 .readdirSync(QUESTIONS_DIR)
 .filter((f) => f.endsWith('.md'))
 .sort();

 const modules = [];
 let grandTotalQuestions = 0;
 let grandTotalRedFlags = 0;
 let grandTotalGreenFlags = 0;

 for (const file of files) {
 const fullPath = path.join(QUESTIONS_DIR, file);
 const mod = parseQuestionFile(fullPath, file);
 if (mod.totalQuestions > 0) {
 modules.push(mod);
 grandTotalQuestions += mod.totalQuestions;
 grandTotalRedFlags += mod.stats.redFlags;
 grandTotalGreenFlags += mod.stats.greenFlags;
 }
 }

 const dataset = {
 version: '3.1.0',
 generatedAt: new Date().toISOString(),
 totalModules: modules.length,
 totalQuestions: grandTotalQuestions,
 totalRedFlags: grandTotalRedFlags,
 totalGreenFlags: grandTotalGreenFlags,
 modules,
 };

 const distJsonPath = path.join(DIST_DIR, 'questions-data.json');
 fs.writeFileSync(distJsonPath, JSON.stringify(dataset, null, 2), 'utf8');

 // Generate dist/index.js
 const indexJsContent = `import dataset from './questions-data.json' with { type: 'json' };

export const questionsData = dataset;
export const modules = dataset.modules;

export function getModule(id) {
 return modules.find((m) => m.id === id) || null;
}

export function getQuestionsByCategory(category) {
 return modules.filter((m) => m.category === category);
}

export default dataset;
`;
 fs.writeFileSync(path.join(DIST_DIR, 'index.js'), indexJsContent, 'utf8');

 // Generate dist/index.d.ts
 const indexDtsContent = `export interface QuestionItemData {
 id: string;
 number: number;
 title: string;
 seniority: string;
 difficulty?: string;
 stars?: number;
 category?: string;
 tags?: string[];
 concepts?: string[];
 redFlag?: string | null;
 greenFlag?: string | null;
 answer: string;
}

export interface QuestionSectionData {
 id: string;
 title: string;
 questions: QuestionItemData[];
}

export interface QuestionsModuleData {
 id: string;
 title: string;
 category: string;
 tags: string[];
 filePath: string;
 totalQuestions: number;
 stats: {
 sections: number;
 redFlags: number;
 greenFlags: number;
 };
 sections: QuestionSectionData[];
}

export interface QuestionsDataPackage {
 version: string;
 generatedAt: string;
 totalModules: number;
 totalQuestions: number;
 totalRedFlags: number;
 totalGreenFlags: number;
 modules: QuestionsModuleData[];
}

export declare const questionsData: QuestionsDataPackage;
export declare const modules: QuestionsModuleData[];
export declare function getModule(id: string): QuestionsModuleData | null;
export declare function getQuestionsByCategory(category: string): QuestionsModuleData[];
declare const _default: QuestionsDataPackage;
export default _default;
`;
 fs.writeFileSync(path.join(DIST_DIR, 'index.d.ts'), indexDtsContent, 'utf8');

 console.log(`[OK] Build completado exitosamente:`);
 console.log(` - Módulos procesados: ${modules.length}`);
 console.log(` - Total preguntas: ${grandTotalQuestions}`);
 console.log(` - Red Flags indexadas: ${grandTotalRedFlags}`);
 console.log(` - Green Flags indexadas: ${grandTotalGreenFlags}`);
 console.log(` - Artefactos generados: dist/questions-data.json, dist/index.js, dist/index.d.ts\n`);

 return dataset;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
 buildQuestions();
}
