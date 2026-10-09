---
id: showroom-questions-master
title: "01. Showroom y Banco Canónico de Preguntas Técnicas de Ingeniería"
category: "questions.architecture-systems"
tags:
 - "distributed-systems"
 - "event-loop"
 - "concurrency"
 - "sql"
 - "typescript"
 - "kubernetes"
seniorityRange: "Junior a Lead / Architect"
totalQuestions: 6
---

# ️ Showroom de Preguntas de Entrevista Técnica (Banco Maestro Dokove)

> Este banco maestro actúa como la **pieza de referencia y demostración canónica** de `@dokove/questions-bank`. Reúne preguntas calibradas para los 4 niveles de seniority (`Junior`, `Mid`, `Senior`, `Lead / Architect`), incorporando indicadores críticos de evaluación (**Red Flags ** y **Green Flags **), análisis de trade-offs y bloques de código de producción.

---

## Bloque 1: Concurrencia y Fundamentos de Runtime (Junior - Mid)

### Q1: ¿Cómo gestiona el Event Loop de Node.js las microtareas frente a las macrotareas? ☆☆
- **Seniority**: Junior / Mid
- **Categoría**: `questions.backend-runtime`
- **Conceptos**: `event-loop.microtasks`, `libuv.phases`, `process.nextTick`
- **Red Flag**: Creer que Node.js crea un nuevo hilo del sistema operativo por cada conexión de red entrante.
- **Green Flag**: Explica con precisión la prioridad de la cola de `process.nextTick()` y `microtasks` (Promesas) ejecutándose inmediatamente después de cada fase de Libuv antes de pasar a la siguiente macrotarea.

#### Respuesta Técnica
El Event Loop de Node.js implementado sobre **Libuv** procesa macrotareas en 6 fases circulares (`timers`, `pending callbacks`, `idle/prepare`, `poll`, `check`, `close callbacks`).
Sin embargo, las **microtareas** no pertenecen a una fase de Libuv: se gestionan directamente por el motor V8 en dos colas intermedias:
1. `process.nextTickQueue`: máxima prioridad.
2. `microtaskQueue`: resolución de Promesas nativas (`Promise.then`, `catch`, `finally`) y `queueMicrotask`.

```typescript
console.log('1. Síncrono');

setTimeout(() => console.log('4. Timer (Macrotarea)'), 0);

Promise.resolve().then(() => console.log('3. Microtask (Promise)'));

process.nextTick(() => console.log('2. NextTick (Microtask Prioritaria)'));

// Salida exacta: 1 -> 2 -> 3 -> 4
```

---

### Q2: Niveles de Aislamiento SQL: ¿Qué anomalía previene `REPEATABLE READ` que `READ COMMITTED` permite? ☆☆☆
- **Seniority**: Mid
- **Categoría**: `questions.backend-data`
- **Conceptos**: `sql.isolation-levels`, `postgres.mvcc`, `concurrency.anomalies`
- **Red Flag**: Afirmar que `READ COMMITTED` previene lecturas no repetibles (*Non-Repeatable Reads*).
- **Green Flag**: Define con soltura la diferencia entre *Non-Repeatable Read* (filas modificadas) y *Phantom Read* (filas nuevas insertadas en un rango), y cómo MVCC crea snapshots de transacción.

#### Respuesta Técnica
En `READ COMMITTED`, cada sentencia dentro de la transacción obtiene un nuevo snapshot del estado de la base de datos al momento de ejecutarse. Si otra transacción confirma un `UPDATE` entre dos lecturas de la primera transacción, se produce una **Lectura No Repetible (*Non-Repeatable Read*)**.

En `REPEATABLE READ`, la transacción congela un único snapshot al inicio de su primera consulta:
* **Previene**: Lecturas sucias (*Dirty Reads*) y lecturas no repetibles.
* **En PostgreSQL**: Mediante MVCC (*Multiversion Concurrency Control*), previene además lecturas fantasma sin necesidad de bloqueos de rango pesados.

---

## Bloque 2: Arquitectura y Sistemas Distribuidos (Senior - Lead)

### Q3: Teorema CAP & PACELC: ¿Por qué Raft / Paxos eligen CP y qué implica durante una partición de red? ☆☆☆☆
- **Seniority**: Senior
- **Categoría**: `questions.architecture-systems`
- **Conceptos**: `distributed-systems.cap`, `consensus.raft`, `network.partitioning`
- **Red Flag**: Decir que un sistema distribuido puede ser "CA" (Consistente y Disponible) a través de una red física real.
- **Green Flag**: Cita el teorema PACELC: ante una partición ($P$), el sistema elige Consistencia ($C$) sobre Disponibilidad ($A$); pero en operación normal ($E$ = Else), sacrifica Latencia ($L$) en favor de Consistencia ($C$) para asegurar lecturas lineales.

#### Respuesta Técnica
En presencia de una partición de red ($P$), la red dividirá los nodos en subconjuntos que no pueden comunicarse. Un protocolo de consenso basado en quórum como **Raft** requiere una mayoría estricta:
$$Q = \left\lfloor \frac{N}{2} \right\rfloor + 1$$

* El lado minoritario de la partición no puede alcanzar el quórum y **rechaza escrituras**, sacrificando disponibilidad ($A$) para preservar la consistencia ($C$) y evitar un estado de *Split-Brain*.
* El lado mayoritario continúa aceptando escrituras de forma linealizable.

---

### Q4: Patrón Outbox Transaccional vs Dual-Writes: ¿Cómo garantizar idempotencia al publicar eventos? ☆☆☆☆
- **Seniority**: Senior / Lead
- **Categoría**: `questions.architecture-systems`
- **Conceptos**: `patterns.transactional-outbox`, `event-driven.idempotency`, `kafka.cdc`
- **Red Flag**: Proponer actualizar la base de datos y hacer `kafkaProducer.send()` en el mismo bloque `try/catch` de la aplicación como solución robusta.
- **Green Flag**: Identifica que la base de datos y el broker de mensajería son dos sistemas de almacenamiento independientes sin transacción ACID compartida (sin 2PC), requiriendo el Outbox persistido en la misma transacción relacional más Change Data Capture (Debezium).

#### Respuesta Técnica
El problema de **Dual-Write** ocurre cuando una de las dos escrituras falla después de que la otra tuvo éxito:
```typescript
// ❌ ANTIPATRÓN DUAL-WRITE
await db.order.create({ data });
await kafkaProducer.send({ topic: 'orders', message: data }); // Si falla o la app muere aquí, datos inconsistentes
```

**Solución con Outbox Pattern**:
1. Guardar la orden y el evento de integración en una tabla `outbox_events` dentro de la **misma transacción ACID de base de datos**.
2. Un proceso relay asíncrono o un conector CDC (ej. **Debezium** leyendo el WAL de PostgreSQL) transmite el evento a Kafka con garantía *At-Least-Once*.
3. El consumidor implementa una clave de idempotencia (`idempotency_key`) para descartar duplicados.

---

## Bloque 3: Excelencia en Tipos y Plataforma (Senior - Architect)

### Q5: Inferencia y Mapeo Condicional en TypeScript: ¿Cómo extraer tipos de retornos asíncronos profundos? ☆☆☆☆
- **Seniority**: Senior
- **Categoría**: `questions.language-testing`
- **Conceptos**: `typescript.conditional-types`, `typescript.infer`, `metaprogramming`
- **Red Flag**: Recurrir a `any` o conversiones `as unknown as T` cuando se enfrentan a tipos recursivos o promesas anidadas.
- **Green Flag**: Utiliza tipos condicionales con `infer` recursivo para desenvolver `Promise<Promise<T>>` emulando el comportamiento real de `Awaited<T>`.

#### Respuesta Técnica
```typescript
// Implementación canónica de desenvolvimiento recursivo con infer
type UnwrapPromiseDeep<T> = T extends Promise<infer U>
 ? UnwrapPromiseDeep<U>
 : T;

// Pruebas estáticas de verificación de tipos
type TestSimple = UnwrapPromiseDeep<Promise<string>>; // string
type TestNested = UnwrapPromiseDeep<Promise<Promise<number>>>; // number
type TestDirect = UnwrapPromiseDeep<boolean>; // boolean
```

---

### Q6: Degradación Elegante y Auto-Healing en Kubernetes: ¿Cuál es el impacto de un mal diseño de `livenessProbe`? ☆☆☆☆☆
- **Seniority**: Lead / Architect
- **Categoría**: `questions.infrastructure-devops`
- **Conceptos**: `kubernetes.probes`, `cascading-failures`, `sre.resilience`
- **Red Flag**: Conectar el `livenessProbe` a dependencias externas (ej. comprobar la conexión a la base de datos o a Redis dentro del liveness del microservicio).
- **Green Flag**: Distingue nítidamente entre `readinessProbe` (¿el pod puede recibir tráfico ahora mismo?) y `livenessProbe` (¿el proceso está muerto/bloqueado en deadlock y necesita reiniciarse?).

#### Respuesta Técnica
Si un `livenessProbe` comprueba dependencias externas como PostgreSQL:
1. Si la base de datos experimenta latencia o saturación temporal, los pods comenzarán a fallar su `livenessProbe`.
2. Kubelet reiniciará todos los pods simultáneamente (*CrashLoop*).
3. Al reiniciar, los pods abren nuevas conexiones a la base de datos, agravando la saturación (*Thundering Herd*).
4. **Resultado**: Caída total en cascada del clúster por un fallo transitorio.

> **Regla de Oro**: El `livenessProbe` **SOLO** debe verificar la salud interna del proceso (que el hilo principal responde). El `readinessProbe` es el encargado de verificar dependencias y aislar el pod del balanceador si no puede procesar solicitudes.
