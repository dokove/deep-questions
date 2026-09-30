# 🏛️ The Mastery Suite: Hub Maestro de Preguntas de Entrevistas Técnicas

> **Total: 1,100 Preguntas Técnicas de Nivel Profesional** divididas en 11 guías de especialidad (100 preguntas cada una) a través de los 9 repositorios de la suite, diseñadas para roles de **Mid-Level, Senior Software Engineer, Tech Lead, Staff Engineer, Principal Architect y Engineering Manager**.

---

## 🧭 Estructura del Ecosistema de Preguntas (1,100 Preguntas)

Cada módulo de **The Mastery Suite** actúa como la única fuente de verdad (*Single Source of Truth*) para sus preguntas técnicas, organizadas en secciones temáticas canónicas con código de producción y criterios rigurosos de evaluación:

```
the-mastery-suite/
├── INTERVIEW-QUESTIONS.md                                <--- [ESTE HUB MAESTRO GLOBAL]
│
├── nodejs-ecosystem-mastery/
│   ├── INTERVIEW-QUESTIONS-NODEJS.md                     <--- 100 Q: Node.js Core, V8, Libuv & Concurrencia
│   ├── INTERVIEW-QUESTIONS-EXPRESS.md                    <--- 100 Q: Express.js, Middlewares & Seguridad
│   └── INTERVIEW-QUESTIONS-NESTJS.md                     <--- 100 Q: NestJS Enterprise, IoC, CQRS & Microservicios
│
├── typescript-mastery/
│   └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: TypeScript Avanzado, Type Gymnastics & Testing
│
├── frontend-mastery/
│   └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: React 19, Angular v19, Next.js PPR & Web Vitals
│
├── backend-mastery/
│   └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: REST RFC 9110, SQL MVCC, NoSQL CAP & Sagas
│
├── python-ecosystem-mastery/
│   └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: CPython, GIL (PEP 703), FastAPI & PySpark
│
├── php-ecosystem-mastery/
│   └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: Zend Engine 4, OPcache, Laravel & FrankenPHP
│
├── cloud-mastery/
│   └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: AWS/Azure, Kubernetes HPA, Terraform & FinOps
│
├── cicd-mastery/
│   └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: Pipelines DAG, SLSA Level 3, GitOps & DORA
│
└── agile-mastery/
    └── INTERVIEW-QUESTIONS.md                            <--- 100 Q: Scrum 2020, Ley de Little, XP & Team Topologies
```

---

## 📚 Acceso Directo a las 11 Guías Técnicas

| # | Especialidad Técnica | Preguntas | Temas Nucleares | Guía Markdown |
|---|---|:---:|---|:---:|
| 1 | 🟢 **Node.js Core & Runtime** | **100** | V8 (Ignition/TurboFan), Libuv Event Loop, Slabs 8KB, Worker Threads, Streams. | [Ver Guía](./nodejs-ecosystem-mastery/INTERVIEW-QUESTIONS-NODEJS.md) |
| 2 | ⚡ **Express.js Architecture** | **100** | Onion Middleware, Express 4 vs 5, RFC 7807, Helmet, Rate Limiter con Redis. | [Ver Guía](./nodejs-ecosystem-mastery/INTERVIEW-QUESTIONS-EXPRESS.md) |
| 3 | 🦁 **NestJS Enterprise** | **100** | IoC Container, Request Lifecycle, Dynamic Modules, CQRS, Microservices. | [Ver Guía](./nodejs-ecosystem-mastery/INTERVIEW-QUESTIONS-NESTJS.md) |
| 4 | 🔷 **TypeScript & Testing** | **100** | Conditional Types, `infer`, Branded Types, Test Doubles, Testcontainers, MSW. | [Ver Guía](./typescript-mastery/INTERVIEW-QUESTIONS.md) |
| 5 | ⚛️ **Frontend & Web Client** | **100** | React 19 Fiber/Lanes, Angular Signals & Zoneless, Next.js PPR, Core Web Vitals. | [Ver Guía](./frontend-mastery/INTERVIEW-QUESTIONS.md) |
| 6 | 🌐 **Backend & Distributed Systems** | **100** | RFC 9110, SQL MVCC, SKIP LOCKED, NoSQL CAP/PACELC, Distributed Sagas, Outbox. | [Ver Guía](./backend-mastery/INTERVIEW-QUESTIONS.md) |
| 7 | 🐍 **Python Ecosystem** | **100** | CPython Internals, GIL & PEP 703 Free-Threading, FastAPI ASGI, Django, PySpark. | [Ver Guía](./python-ecosystem-mastery/INTERVIEW-QUESTIONS.md) |
| 8 | 🐘 **PHP Moderno & High-Performance** | **100** | Zend Engine 4 zval/COW, OPcache JIT, Laravel IoC, Symfony HttpKernel, FrankenPHP. | [Ver Guía](./php-ecosystem-mastery/INTERVIEW-QUESTIONS.md) |
| 9 | ☁️ **Cloud & Platform Engineering** | **100** | Multi-AZ/Region, AWS Well-Architected, Kubernetes Internals, HPA, Terraform, FinOps. | [Ver Guía](./cloud-mastery/INTERVIEW-QUESTIONS.md) |
| 10 | 🚀 **CI/CD & Delivery Engineering** | **100** | DAGs, Matrices, Canary, Blue-Green, SLSA Level 3, SBOM, OIDC Keyless, ArgoCD, DORA. | [Ver Guía](./cicd-mastery/INTERVIEW-QUESTIONS.md) |
| 11 | 🏃 **Agile & Delivery Engineering** | **100** | Scrum Guide 2020, Ley de Little, Flujo Kanban, XP (TDD/Trunk-Based), Cynefin. | [Ver Guía](./agile-mastery/INTERVIEW-QUESTIONS.md) |

---

## 🖥️ Visualizador Web Interactivo de Entrevistas

Para una experiencia de estudio gamificada y dinámica, la suite incluye una aplicación web interactiva que procesa las 1,100 preguntas:

```bash
# 1. Compilar los datos de preguntas desde las carpetas *-mastery:
make build-viewer
# o bien:
npm run build:questions

# 2. Abrir el visualizador interactivo:
make viewer
# o abrir directamente:
open viewer/index.html
```

- **Filtros por Nivel**: Explora preguntas para `Junior`, `Mid-Level`, `Senior` y `Staff / Lead`.
- **Búsqueda Instantánea**: Encuentra preguntas por algoritmos, RFCs, directivas o banderas.
- **Seguimiento de Progreso**: Marca preguntas dominadas (✓) y favoritas (★) persistidas en tu navegador.
- **Trazabilidad de Código**: Cada módulo enlaza directamente al archivo Markdown de origen en su repositorio.

---

## 🎯 Matriz de Evaluación por Nivel de Seniority

### 1. 🐣 Mid-Level Engineer
- **Expectativa**: Conoce la sintaxis del lenguaje, aplica buenas prácticas de frameworks (Express, NestJS, React, Laravel, FastAPI) y comprende el flujo asíncrono y los códigos de estado HTTP.
- **Diferenciador**: Capaz de escribir código seguro y modular, con tests unitarios e integración básica.

### 2. 🚀 Senior Software Engineer
- **Expectativa**: Domina los internals del runtime (V8, CPython, Zend Engine, JVM), concurrencia, gestión de memoria, patrones de diseño, transacciones SQL ACID y resiliencia ante caídas de red.
- **Diferenciador**: Diagnostica memory leaks con Heap Snapshots, optimiza consultas con `EXPLAIN ANALYZE` y diseña pipelines de CI/CD reproducibles.

### 3. 🦁 Staff Engineer / Technical Lead
- **Expectativa**: Diseña sistemas distribuidos desacoplados (Event-Driven, CQRS, Sagas), lidera estándares arquitectónicos entre múltiples equipos y erradica cuellos de botella organizacionales con métricas de flujo (Ley de Little, DORA).
- **Diferenciador**: Evalúa tradeoffs económicos y técnicos (FinOps, escalabilidad horizontal vs vertical, adopción tecnológica justificada).

### 4. 👑 Principal Engineer / Enterprise Architect
- **Expectativa**: Establece la visión tecnológica corporativa, gobierno de plataforma (IaC, Kubernetes, GitOps), seguridad de cadena de suministro (SLSA 3, SBOM) y alineación estratégica de tecnología con valor de negocio (Outcome vs Output).
