# Arquitectura de @dokove/questions-bank

Banco de preguntas técnicas de entrevista, evaluación conceptual y preparación de perfiles de ingeniería de software para el ecosistema **Dokove**.

---

## ️ Propósito & Rol en el Ecosistema

`pub.questions` (`@dokove/questions-bank`) actúa como la fuente de verdad declarativa de preguntas técnicas, diagnósticos y cribas formativas:
1. **Entrevistas Técnicas**: Guía para evaluadores y candidatos con preguntas calibradas por seniority (Junior, Mid-Level, Senior, Staff/Architect).
2. **Evaluación Formativa**: Integración transcluida en lecciones (`pub.lessons`) mediante `<Question ref="slug" />`.
3. **Plataforma Dokove**: Componente centralizado en `dokove.ui` (`dokove-questions`) consumido por `dokove.com` y la previsualización interactiva.

---

## Organización de Directorios (Estructura Ultra-Plana)

Siguiendo el estándar unificado de repositorios de contenido declarativo `pub.*`:

```
pub.questions/
├── questions/ # Directorio canónico ultra-plano de preguntas (Markdown con frontmatter)
│ ├── 01-showroom-todas-las-preguntas.md # Benchmark de calidad y showroom canónico
│ ├── express.md # 50 preguntas de arquitectura Express.js
│ ├── typescript.md # 50 preguntas de TypeScript y Testing
│ ├── nodejs.md # 15 preguntas de V8 & Libuv internals
│ └── ... (20 módulos temáticos)
├── scripts/ # Herramientas de build y validación
│ ├── build-questions-data.mjs # Compilador a dist/questions-data.json
│ └── validate-taxonomies.mjs # Validador ontológico contra @dokove/taxonomies
├── dist/ # Artefactos compilados reproducibles
│ └── questions-data.json # Catálogo completo indexado
├── docs/ # Documentación técnica del repositorio
│ ├── ARCHITECTURE.md # Este documento
│ ├── STYLEGUIDE.md # Guía de redacción de preguntas técnicas
│ └── TAXONOMIES.md # Mapeo estricto con @dokove/taxonomies
├── preview/ # Preview SPA Vite montando QuestionsViewer de dokove-questions
├── AGENTS.md # Reglas de autoría para agentes de IA
├── Makefile # Comandos de compilación, test y desarrollo
└── package.json # Metadatos del paquete @dokove/questions-bank
```

---

## ⚙️ Pipeline de Compilación y Extracción

El script `scripts/build-questions-data.mjs`:
1. Lee los archivos markdown de `questions/*.md`.
2. Parsea metadatos estructurados en cada pregunta:
 - **ID**: identificador determinista (ej. `sec-1-q1`).
 - **Seniority**: Junior, Mid, Senior, Lead / Architect.
 - **Dificultad**: 1 a 5 estrellas.
 - **Red Flag**: Conceptos erróneos que delatan falta de comprensión real.
 - **Green Flag**: Matices avanzados que demuestran maestría técnica.
 - **Cuerpo técnico**: Respuesta exhaustiva con código tipado y patrones de producción.
3. Genera `dist/questions-data.json`, validando que cada módulo se asocie con una categoría canónica de `@dokove/taxonomies`.

---

## Flujo de Trabajo y Validación

```sh
# Compilar y validar el banco de preguntas contra @dokove/taxonomies
npm test

# Ejecutar el previsualizador interactivo Vite (puerto 3016)
npm run dev
```
