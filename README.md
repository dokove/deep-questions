# ❓ Dokove Questions (`@dokove/questions-bank`)

Banco técnico de preguntas de entrevista, diagnósticos conceptuales y evaluaciones de ingeniería de software para el ecosistema **Dokove**.

---

## ️ Filosofía del Repositorio

`pub.questions` es un **repositorio de contenido declarativo puro**:
- **Estructura ultra-plana**: Todo el contenido reside en archivos markdown independientes en `questions/*.md`. Sin anidamientos ni subdirectorios complejos.
- **Sin duplicación de UI**: Los componentes de visualización residen en `dokove.ui` (`packages/questions`). La carpeta `preview/` monta únicamente `<QuestionsViewer />` de `dokove-questions`.
- **Taxonomías estrictas**: Cada pregunta y módulo está catalogado ontológicamente contra `@dokove/taxonomies`.
- **Criterios de evaluación calibrados**:
 - Seniority: `Junior`, `Mid-Level`, `Senior`, `Staff / Architect`.
 - **Red Flag**: Señales de alarma que delatan falta de profundidad o malas prácticas.
 - **Green Flag**: Matices que demuestran maestría conceptual y experiencia en producción.

---

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Compilar preguntas y validar taxonomías
npm test

# Iniciar la previsualización interactiva (puerto 3016)
npm run dev
```

---

## Estructura del Proyecto

```
pub.questions/
├── questions/ # 20 módulos temáticos en Markdown plano
│ ├── 01-showroom-todas-las-preguntas.md
│ ├── express.md
│ ├── typescript.md
│ ├── nodejs.md
│ └── ...
├── scripts/ # Scripts de build y validación
│ ├── build-questions-data.mjs
│ └── validate-taxonomies.mjs
├── dist/ # JSON compilado para consumo en Dokove
│ └── questions-data.json
├── docs/ # Arquitectura y guías de estilo
│ ├── ARCHITECTURE.md
│ ├── STYLEGUIDE.md
│ └── TAXONOMIES.md
├── preview/ # Visualizador interactivo Vite (puerto 3016)
│ ├── App.tsx # Monta QuestionsViewer de dokove-questions
│ ├── index.html # HTML con dark mode y soporte de temas
│ └── main.tsx
├── AGENTS.md # Reglas de autoría para agentes de IA
├── INTERVIEW-QUESTIONS.md # Índice de módulos técnicos
├── Makefile # Atajos de terminal
└── package.json
```

---

## Comandos de Validación

| Comando | Acción |
|---------|--------|
| `npm run build` | Compila `questions/*.md` en `dist/questions-data.json`. |
| `npm run validate:taxonomies` | Valida categorías y etiquetas contra `@dokove/taxonomies`. |
| `npm test` | Ejecuta el build y la validación en secuencia. |
| `npm run dev` | Lanza el servidor Vite local en `http://localhost:3016/`. |
