# Taxonomías en @dokove/questions-bank

Todos los módulos y preguntas en `pub.questions` se vinculan obligatoriamente con el registro centralizado de **`@dokove/taxonomies`** utilizando el ámbito canónico `questions`.

---

## ️ Categorías Canónicas (`scope: questions`)

| ID de Categoría | Etiqueta Canónica | Módulos Asociados |
| :--- | :--- | :--- |
| `questions.backend-runtime` | Backend & Runtime | `nodejs`, `python`, `pyspark`, `php` |
| `questions.backend-web` | Backend & Web | `express`, `nestjs`, `laravel-symfony`, `fastapi-django` |
| `questions.language-testing` | Language & Testing | `typescript` |
| `questions.frontend-web` | Frontend & Web | `react`, `angular`, `nextjs`, `web-performance` |
| `questions.architecture-systems` | Architecture & Systems | `distributed-systems`, `rest-apis` |
| `questions.backend-data` | Backend & Data | `sql`, `nosql` |
| `questions.infrastructure-devops` | Infrastructure & DevOps | `cloud`, `kubernetes`, `terraform`, `cicd`, `gitops` |
| `questions.methodology-leadership` | Methodology & Leadership | `agile`, `kanban` |
| `questions.software-engineering` | Software Engineering | Conceptos transversales de ingeniería |

---

## Tags y Seniority

Las preguntas se clasifican dimensionalmente mediante:
1. **Seniority**:
 - `Junior` (1-2 estrellas) — Conceptos base, sintaxis, flujos estándar.
 - `Mid` (2-3 estrellas) — Gestión de errores, asincronía, ciclo de vida, optimización básica.
 - `Senior` (3-4 estrellas) — Trade-offs de diseño, internals, concurrencia, resiliencia.
 - `Lead / Architect` (4-5 estrellas) — Escalabilidad, patrones distribuidos, mitigación de fallos en cascada.
2. **Flags de Calibración**:
 - **Red Flag**: Fallo conceptual crítico o mito común.
 - **Green Flag**: Criterio de ingeniería sólido, mención de trade-offs o internals.

---

## Regla de Gobernanza
Si una nueva especialidad técnica requiere una categoría que no existe en `@dokove/taxonomies`:
1. Debe agregarse primero a `pub.taxonomies/taxonomy.md`.
2. Compilarse mediante `npm run build` en `pub.taxonomies`.
3. Consumirse posteriormente en `pub.questions`.
