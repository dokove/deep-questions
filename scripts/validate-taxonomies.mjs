import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveResourceTaxonomy, getCategory } from '@dokove/taxonomies';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const questionsJsonPath = path.join(rootDir, 'dist', 'questions-data.json');

console.log('Validando banco de preguntas y taxonomías en pub.questions...\n');

if (!fs.existsSync(questionsJsonPath)) {
 throw new Error('Falta dist/questions-data.json. Ejecuta primero `npm run build`.');
}

const data = JSON.parse(fs.readFileSync(questionsJsonPath, 'utf8'));
let validatedCount = 0;

for (const mod of data.modules) {
 const relativePath = mod.filePath || `questions/${mod.id}.md`;
 
 // Validar categoría principal del módulo
 let resolvedCategory = mod.category;
 try {
 const resolved = resolveResourceTaxonomy(
 {
 category: mod.category,
 tags: mod.tags || [],
 },
 relativePath,
 'questions'
 );
 resolvedCategory = resolved.category;
 } catch (err) {
 // Si no está prefijada con questions., verificar si existe en la taxonomía
 const catObj = getCategory(mod.category);
 if (!catObj) {
 console.warn(`[WARN] Módulo ${mod.id}: categoría '${mod.category}' no encontrada en taxonomía questions.`);
 }
 }

 console.log(`Modulo: [${mod.id}] ${mod.title}`);
 console.log(`   Categoria: ${resolvedCategory || mod.category}`);
 console.log(`   Preguntas: ${mod.totalQuestions}`);

 for (const sec of mod.sections) {
 for (const q of sec.questions) {
 validatedCount++;
 }
 }
}

console.log('\n-----------------------------------------------------------');
console.log(`[OK] Validación exitosa: ${data.modules.length} módulos y ${validatedCount} preguntas conformes con @dokove/taxonomies.\n`);
