#!/usr/bin/env node

/**
 * THE MASTERY SUITE — INTERVIEW QUESTIONS EXTRACTOR & BUILD PIPELINE
 * 
 * Escanea dinámicamente todos los directorios *-mastery en el workspace,
 * procesa cada archivo de preguntas Markdown (INTERVIEW-QUESTIONS*.md),
 * extrae secciones, preguntas, niveles, respuestas técnicas, y banderas (Red/Green Flags),
 * y compila los datasets para el visualizador web en:
 *   - _viewer/data/questions-data.json
 *   - _viewer/data/questions-data.js (window.INTERVIEW_DATA)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VIEWER_DATA_DIR = path.join(ROOT_DIR, '_viewer', 'data');

// Catálogo de metadatos predefinidos para módulos de la suite
const MODULE_METADATA = {
  'nodejs-core': {
    id: 'nodejs-core',
    title: 'Node.js Core & Runtime',
    icon: '🟢',
    badgeColor: '#10b981',
    category: 'Backend & Runtime',
    description: 'V8 internals, Libuv Event Loop, Memory Slabs 8KB, Backpressure, Worker Threads y Atomics.',
    preferredOrder: 1,
  },
  'express': {
    id: 'express',
    title: 'Express.js Architecture',
    icon: '⚡',
    badgeColor: '#f59e0b',
    category: 'Backend & Runtime',
    description: 'Onion Middleware, Express 4 vs 5, Seguridad (Helmet/Rate-limit), RFC 7807 y Streaming.',
    preferredOrder: 2,
  },
  'nestjs': {
    id: 'nestjs',
    title: 'NestJS Enterprise Architecture',
    icon: '🦁',
    badgeColor: '#ef4444',
    category: 'Backend & Runtime',
    description: 'IoC Container, Request Lifecycle, Dynamic Modules, CQRS, Microservicios y Fastify Adapter.',
    preferredOrder: 3,
  },
  'typescript': {
    id: 'typescript',
    title: 'TypeScript & Testing',
    icon: '🔷',
    badgeColor: '#3b82f6',
    category: 'Language & Testing',
    description: 'Conditional Types, infer, Branded Types, Test Doubles, Testcontainers, MSW y Mutation Testing.',
    preferredOrder: 4,
  },
  'frontend': {
    id: 'frontend',
    title: 'Frontend & Client Architecture',
    icon: '⚛️',
    badgeColor: '#06b6d4',
    category: 'Frontend & Web',
    description: 'React 19 Fiber/Lanes, Angular Signals/Zoneless, Next.js App Router/PPR y Core Web Vitals.',
    preferredOrder: 5,
  },
  'backend': {
    id: 'backend',
    title: 'Backend & Distributed Systems',
    icon: '🌐',
    badgeColor: '#8b5cf6',
    category: 'Architecture & Systems',
    description: 'REST RFC 9110, SQL MVCC, SKIP LOCKED, NoSQL CAP/PACELC, Distributed Sagas y Outbox Pattern.',
    preferredOrder: 6,
  },
  'python': {
    id: 'python',
    title: 'Python Ecosystem',
    icon: '🐍',
    badgeColor: '#38bdf8',
    category: 'Backend & Data',
    description: 'CPython Internals, GIL & Free-threading, FastAPI ASGI, Django ORM y PySpark Catalyst.',
    preferredOrder: 7,
  },
  'php': {
    id: 'php',
    title: 'PHP Ecosystem',
    icon: '🐘',
    badgeColor: '#a855f7',
    category: 'Backend & Web',
    description: 'Zend Engine 4 zval/COW, OPcache, JIT, Laravel IoC, Symfony HttpKernel, FrankenPHP y Pest.',
    preferredOrder: 8,
  },
  'cloud': {
    id: 'cloud',
    title: 'Cloud & Platform Engineering',
    icon: '☁️',
    badgeColor: '#0ea5e9',
    category: 'Infrastructure & DevOps',
    description: 'Multi-AZ/Region, AWS Well-Architected, Kubernetes Internals, HPA, Terraform y FinOps.',
    preferredOrder: 9,
  },
  'cicd': {
    id: 'cicd',
    title: 'CI/CD & Delivery Engineering',
    icon: '🚀',
    badgeColor: '#f97316',
    category: 'Infrastructure & DevOps',
    description: 'DAGs, Matrices, Canary, SLSA Level 3, SBOM, OIDC Keyless, GitOps ArgoCD y Métricas DORA.',
    preferredOrder: 10,
  },
  'agile': {
    id: 'agile',
    title: 'Agile & Delivery Engineering',
    icon: '🏃',
    badgeColor: '#ec4899',
    category: 'Methodology & Leadership',
    description: 'Scrum Guide 2020, Flujo Kanban, Ley de Little, XP (TDD/Trunk-Based), Cynefin y Team Topologies.',
    preferredOrder: 11,
  },
};

/**
 * Determina el ID del módulo a partir del nombre del directorio y del archivo.
 */
function resolveModuleId(dirName, fileName) {
  if (dirName === 'nodejs-ecosystem-mastery') {
    if (fileName === 'INTERVIEW-QUESTIONS-NODEJS.md') return 'nodejs-core';
    if (fileName === 'INTERVIEW-QUESTIONS-EXPRESS.md') return 'express';
    if (fileName === 'INTERVIEW-QUESTIONS-NESTJS.md') return 'nestjs';
    // Descartamos hub y duplicado typescript
    return null;
  }
  if (dirName === 'typescript-mastery') return 'typescript';
  if (dirName === 'frontend-mastery') return 'frontend';
  if (dirName === 'backend-mastery') return 'backend';
  if (dirName === 'python-ecosystem-mastery') return 'python';
  if (dirName === 'php-ecosystem-mastery') return 'php';
  if (dirName === 'cloud-mastery') return 'cloud';
  if (dirName === 'cicd-mastery') return 'cicd';
  if (dirName === 'agile-mastery') return 'agile';

  // Fallback para nuevos módulos *-mastery
  return dirName.replace(/-mastery$/, '');
}

/**
 * Parsea un archivo de preguntas Markdown en una estructura de secciones y preguntas.
 */
function parseInterviewMarkdown(filePath, moduleId) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const sections = [];
  let currentSection = null;
  let currentQuestion = null;
  let secIdx = 0;

  // Extraer H1 para fallback de título/icono si no existe en el catálogo
  let h1Title = '';
  const firstH1 = lines.find(l => l.startsWith('# '));
  if (firstH1) {
    h1Title = firstH1.replace(/^#\s+/, '').trim();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detección de Sección: "## 1. Título..."
    if (/^##\s+\d+\.\s+/.test(line)) {
      secIdx++;
      currentSection = {
        id: `sec-${secIdx}`,
        title: line.replace(/^##\s+/, '').trim(),
        questions: [],
      };
      sections.push(currentSection);
      currentQuestion = null;
      continue;
    }

    // Detección de Pregunta: "### 1. ¿Título...?" o "### Pregunta 1: ¿Título...?"
    const qMatch = line.match(/^###\s+(?:Pregunta\s+)?(\d+)[\.:\s]+(.*)/);
    if (qMatch) {
      const qNum = parseInt(qMatch[1], 10);
      const qTitle = qMatch[2].trim();

      // Si hay preguntas antes de la primera sección formal, crear sección General
      if (!currentSection) {
        secIdx++;
        currentSection = {
          id: `sec-${secIdx}`,
          title: '1. General',
          questions: [],
        };
        sections.push(currentSection);
      }

      currentQuestion = {
        id: `${moduleId}-q${qNum}`,
        number: qNum,
        title: qTitle,
        seniority: 'Senior / Staff',
        answerLines: [],
        redFlag: '',
        greenFlag: '',
      };
      currentSection.questions.push(currentQuestion);
      continue;
    }

    if (!currentQuestion) continue;

    // Extracción de Nivel de Seniority
    const senMatch = line.match(/^-\s+\*\*Nivel\*\*:\s*(.*)/i);
    if (senMatch) {
      currentQuestion.seniority = senMatch[1].trim();
      continue;
    }

    // Extracción de Red Flag (🚩)
    const redMatch = line.match(/[🚩|🔴]?\s*[*_]{1,2}Red Flag[*_]{1,2}:\s*(.*)/i);
    if (redMatch) {
      currentQuestion.redFlag = redMatch[1].trim();
      continue;
    }

    // Extracción de Green Flag (🟢)
    const greenMatch = line.match(/[🟢|✅]?\s*[*_]{1,2}Green Flag[*_]{1,2}:\s*(.*)/i);
    if (greenMatch) {
      currentQuestion.greenFlag = greenMatch[1].trim();
      continue;
    }

    // Omitir cabeceras de metadatos y separadores
    if (/^-\s+\*\*Respuesta Técnica\*\*:\s*$/i.test(line)) continue;
    if (/^-\s+\*\*Diferenciadores en la entrevista\*\*:?/i.test(line)) continue;
    if (/^-\s+\*\*Criterio(?:s)? de Evaluación\*\*:?/i.test(line)) continue;
    if (/^---\s*$/.test(line)) continue;

    // Agregar línea de respuesta
    currentQuestion.answerLines.push(line);
  }

  // Normalización y limpieza de respuestas
  let totalQuestions = 0;
  let totalRedFlags = 0;
  let totalGreenFlags = 0;

  for (const sec of sections) {
    totalQuestions += sec.questions.length;
    for (const q of sec.questions) {
      if (q.redFlag) totalRedFlags++;
      if (q.greenFlag) totalGreenFlags++;

      let rawAnswer = q.answerLines.join('\n').trim();
      // Eliminar indentación común de 2 o 4 espacios introducida por listas markdown
      rawAnswer = rawAnswer.replace(/^\s{2,4}/gm, '');
      q.answer = rawAnswer;
      delete q.answerLines;
    }
  }

  return {
    h1Title,
    sections,
    totalQuestions,
    totalRedFlags,
    totalGreenFlags,
  };
}

/**
 * Escanea el workspace y compila todos los módulos.
 */
function build() {
  console.log('🏛️  THE MASTERY SUITE — INTERVIEW QUESTIONS EXTRACTOR');
  console.log('===========================================================');
  console.log(`📁 Directorio raíz: ${ROOT_DIR}`);

  // 1. Descubrir todos los directorios *-mastery
  const rootEntries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const masteryDirs = rootEntries
    .filter(e => e.isDirectory() && e.name.endsWith('-mastery'))
    .map(e => e.name)
    .sort();

  console.log(`🔍 Repositorios encontrados: ${masteryDirs.length} directorios *-mastery`);

  const modules = [];

  for (const dirName of masteryDirs) {
    const dirPath = path.join(ROOT_DIR, dirName);
    const files = fs.readdirSync(dirPath);

    // Buscar archivos de preguntas Markdown
    const questionFiles = files.filter(f => f.toUpperCase().includes('QUESTION') && f.endsWith('.md'));

    for (const fileName of questionFiles) {
      const moduleId = resolveModuleId(dirName, fileName);
      if (!moduleId) {
        // Ignorado intencionadamente (ej: hub o duplicados)
        continue;
      }

      const filePath = path.join(dirPath, fileName);
      const relativePath = path.relative(ROOT_DIR, filePath);

      const parsed = parseInterviewMarkdown(filePath, moduleId);

      // Metadatos base o fallback
      const baseMeta = MODULE_METADATA[moduleId] || {
        id: moduleId,
        title: parsed.h1Title || moduleId,
        icon: '📚',
        badgeColor: '#6366f1',
        category: 'Software Engineering',
        description: `Banco de preguntas técnicas extraídas de ${dirName}`,
        preferredOrder: 99,
      };

      modules.push({
        ...baseMeta,
        filePath: relativePath,
        totalQuestions: parsed.totalQuestions,
        stats: {
          sections: parsed.sections.length,
          redFlags: parsed.totalRedFlags,
          greenFlags: parsed.totalGreenFlags,
        },
        sections: parsed.sections,
      });
    }
  }

  // Ordenar módulos según preferredOrder
  modules.sort((a, b) => (a.preferredOrder || 99) - (b.preferredOrder || 99));

  const totalQuestions = modules.reduce((acc, m) => acc + m.totalQuestions, 0);
  const totalSections = modules.reduce((acc, m) => acc + m.stats.sections, 0);
  const totalRedFlags = modules.reduce((acc, m) => acc + m.stats.redFlags, 0);
  const totalGreenFlags = modules.reduce((acc, m) => acc + m.stats.greenFlags, 0);

  // 2. Imprimir resumen en consola
  console.log('\n📊 RESUMEN DE EXTRACCIÓN POR MÓDULO:');
  console.log('───────────────────────────────────────────────────────────');
  for (const m of modules) {
    const flagIcon = (m.stats.redFlags === m.totalQuestions && m.stats.greenFlags === m.totalQuestions) ? '✅' : '⚠️';
    console.log(
      `${m.icon} [${m.id.padEnd(12)}] ${m.title.padEnd(35)} | ` +
      `${String(m.totalQuestions).padStart(3)} preguntas | ` +
      `${String(m.stats.sections).padStart(2)} sec | ` +
      `Flags: ${m.stats.redFlags}/${m.stats.greenFlags} ${flagIcon}`
    );
  }
  console.log('───────────────────────────────────────────────────────────');
  console.log(`✨ Total Módulos:    ${modules.length}`);
  console.log(`📑 Total Secciones:  ${totalSections}`);
  console.log(`🎯 Total Preguntas:  ${totalQuestions}`);
  console.log(`🚩 Red Flags:        ${totalRedFlags} / ${totalQuestions} (${Math.round((totalRedFlags/totalQuestions)*100)}%)`);
  console.log(`🟢 Green Flags:      ${totalGreenFlags} / ${totalQuestions} (${Math.round((totalGreenFlags/totalQuestions)*100)}%)`);

  // 3. Preparar dataset para el viewer
  const dataset = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    totalModules: modules.length,
    totalQuestions: totalQuestions,
    modules: modules.map(m => {
      // Excluir estadísticas temporales del output final
      const { stats, preferredOrder, ...rest } = m;
      return rest;
    }),
  };

  // 4. Guardar archivos de salida
  if (!fs.existsSync(VIEWER_DATA_DIR)) {
    fs.mkdirSync(VIEWER_DATA_DIR, { recursive: true });
  }

  const jsonPath = path.join(VIEWER_DATA_DIR, 'questions-data.json');
  const jsPath = path.join(VIEWER_DATA_DIR, 'questions-data.js');

  fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2), 'utf8');
  console.log(`\n💾 Guardado JSON: ${path.relative(ROOT_DIR, jsonPath)} (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);

  const jsContent = `/**
 * THE MASTERY SUITE — COMPILED QUESTIONS DATABASE
 * Generated automatically by _scripts/build-questions-data.js
 * Generated at: ${dataset.generatedAt}
 */
window.INTERVIEW_DATA = ${JSON.stringify(dataset, null, 2)};
`;
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  console.log(`💾 Guardado JS:   ${path.relative(ROOT_DIR, jsPath)} (${(fs.statSync(jsPath).size / 1024).toFixed(1)} KB)`);
  console.log('\n✅ ¡EXTRACCIÓN Y CONSTRUCCIÓN COMPLETADAS CON ÉXITO!');
}

build();
