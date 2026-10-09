# Guía de Estilo y Autoría: @dokove/questions-bank

Esta guía define el estándar de redacción, tipado y calibración para preguntas técnicas de entrevista en el ecosistema **Dokove**.

---

## Filosofía de Evaluación

Una buena pregunta técnica no evalúa memorización de sintaxis ni preguntas trampa triviales. Evalúa:
1. **Modelos mentales y comprensión de *internals*** (ej. ¿cómo funciona realmente el motor V8 o el optimizador de consultas de Postgres?).
2. **Capacidad de razonar sobre trade-offs** (ej. consistencia vs disponibilidad, latencia vs throughput).
3. **Buenas prácticas de ingeniería en producción** (ej. mitigación de fallos en cascada, idempotencia).

---

## Estructura Canónica de una Pregunta

Cada archivo en `questions/*.md` sigue el formato estándar:

```markdown
### Q1: ¿Cómo gestiona el Event Loop de Node.js las microtareas frente a las macrotareas? ☆☆
- **Seniority**: Junior / Mid
- **Categoría**: `questions.backend-runtime`
- **Conceptos**: `event-loop.microtasks`, `libuv.phases`
- **Red Flag**: Creer que Node.js crea un nuevo hilo del sistema operativo por cada conexión de red entrante.
- **Green Flag**: Explica con precisión la prioridad de la cola de microtareas ejecutándose inmediatamente después de cada fase de Libuv.

#### Respuesta Técnica
Explicación técnica rigurosa y directa...

\`\`\`typescript
// Código ilustrativo de producción
\`\`\`
```

---

## Calibración por Seniority y Estrellas

| Nivel | Rango de Estrellas | Criterio de Evaluación |
| :--- | :---: | :--- |
| **Junior** | ⭐ a ⭐⭐ | Conceptos fundamentales, control de flujo, asincronía básica, tipos primitivos. |
| **Mid-Level** | ⭐⭐⭐ | Gestión de errores, transacciones, optimización de queries, ciclo de vida de componentes. |
| **Senior** | ⭐⭐⭐⭐ | *Internals* de runtime, sistemas distribuidos, concurrencia, resiliencia, profiling. |
| **Lead / Architect** | ⭐⭐⭐⭐⭐ | Arquitectura a gran escala, trade-offs CAP/PACELC, Event Sourcing, fallos en cascada. |

---

## Red Flags & Green Flags

* **Red Flag (Alerta roja)**:
 - Respuestas dogmáticas (*"siempre uso X porque es mejor"*).
 - Mitos comunes de la industria (ej. *"Node.js es multihilo para todo"* o *"READ COMMITTED evita lecturas repetidas"*).
 - Ignorar la gestión de errores o concurrencia.
* **Green Flag (Señal verde)**:
 - Reconoce inmediatamente los límites de una solución.
 - Cita teoremas o especificaciones (RFC, ACID, CAP, PACELC, AST).
 - Considera observabilidad, métricas y degradación elegante.
