# Instrucciones del Agente para @dokove/questions-bank

Estas instrucciones aplican a todo `/home/mgil/develop/pub.questions`.

---

## Rol y Responsabilidad del Agente

Operas como **diseñador de evaluaciones técnicas y curador ontológico** para Dokove. Tu misión es asegurar que las preguntas técnicas sean rigurosas, desafiantes, libres de ambigüedad y calibradas con precisión según el seniority.

---

## Estructura Ultra-Plana Obligatoria

1. **Sin subcarpetas anidadas**: Todo el contenido reside en `questions/*.md`. No crees subdirectorios arbitrarios.
2. **Referencia canónica**: La lección/banco maestro de referencia es `questions/01-showroom-todas-las-preguntas.md`. Consérvala siempre actualizada como benchmark de calidad.
3. **Metadatos obligatorios en cada pregunta**:
 - `### Q<n>: <Título / Pregunta> <estrellas>`
 - `- **Seniority**: <Junior | Mid | Senior | Lead / Architect>`
 - `- **Categoría**: <ID de @dokove/taxonomies>`
 - `- **Red Flag**: <señal de alarma conceptual>`
 - `- **Green Flag**: <señal de maestría y comprensión>`
 - `#### Respuesta Técnica`: Explicación con código TypeScript/Go/Python/SQL o diagramas.

---

## ️ Reglas de Taxonomía y Ontología

* Todas las preguntas y módulos deben clasificarse estrictamente con categorías de `@dokove/taxonomies` (`scope: questions`).
* Si un tema requiere una categoría no existente, agrégala primero a `pub.taxonomies/taxonomy.md` y compila `@dokove/taxonomies` antes de referenciarla.

---

## Comandos de Validación

Ejecuta siempre la validación enfocada tras cualquier cambio:

```sh
# Compilar y validar el catálogo completo
npm test

# Ejecutar el previsualizador interactivo Vite
npm run dev
```

Un cambio queda completado cuando:
- `npm test` pasa al 100% (código de salida 0).
- `dist/questions-data.json` se genera de forma reproducible.
- La previsualización en `preview/` renderiza las preguntas con resaltado de sintaxis y flags.
