import React, { useState, useEffect, useMemo } from 'react';
import { QuestionsViewer, type QuestionsDataPackage } from 'dokove-questions';
import {
  CircleHelpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  CoffeeIcon,
  SearchIcon,
  FlameIcon,
  ZapIcon,
  StarIcon,
} from 'dokove-icons';
import rawData from '../dist/questions-data.json';
import 'dokove-ui/styles.css';
import { CatalogFilterBar, type SelectOption } from 'dokove-ui';
import 'dokove-questions/styles.css';

const dataset = rawData as QuestionsDataPackage;

type ThemeMode = 'dark' | 'light' | 'sepia';
type ViewMode = 'catalog' | 'viewer';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeModuleId, setActiveModuleId] = useState<string>(dataset.modules[0]?.id || '');

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeniority, setSelectedSeniority] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Sincronización del tema en el elemento raíz HTML
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'sepia-theme');
    document.documentElement.removeAttribute('data-theme');

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'sepia') {
      document.documentElement.classList.add('sepia-theme');
      document.documentElement.setAttribute('data-theme', 'sepia');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Categorías únicas
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    dataset.modules.forEach((m) => {
      if (m.category) {
        set.add(m.category.replace(/^questions\./, ''));
      }
    });
    return Array.from(set).sort();
  }, []);

  // Tags únicos
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    dataset.modules.forEach((m) => {
      (m.tags || []).forEach((t) => set.add(t));
      (m.sections || []).forEach((s) => {
        (s.questions || []).forEach((q) => {
          (q.tags || []).forEach((t) => set.add(t));
        });
      });
    });
    return Array.from(set).sort();
  }, []);

  const categoryOptions: SelectOption[] = useMemo(() => [
    { value: 'all', label: 'Todas las categorías' },
    ...availableCategories.map((cat) => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
    })),
  ], [availableCategories]);

  const seniorityOptions: SelectOption[] = useMemo(() => [
    { value: 'all', label: 'Todos los niveles' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Mid', label: 'Mid-Level' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Lead', label: 'Lead / Architect' },
  ], []);

  const tagOptions: SelectOption[] = useMemo(() => [
    ...availableTags.map((tag) => ({
      value: tag,
      label: `#${tag}`,
    })),
  ], [availableTags]);

  // Filtrado de módulos
  const filteredModules = useMemo(() => {
    return dataset.modules.filter((m) => {
      const catClean = m.category ? m.category.replace(/^questions\./, '') : '';

      // Búsqueda por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchId = m.id.toLowerCase().includes(q);
        const matchTags = (m.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchQuestions = (m.sections || []).some((s) =>
          (s.questions || []).some(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              (item.concepts || []).some((c) => c.toLowerCase().includes(q))
          )
        );
        if (!matchTitle && !matchId && !matchTags && !matchQuestions) return false;
      }

      // Filtro por categoría
      if (selectedCategory !== 'all' && catClean !== selectedCategory) {
        return false;
      }

      // Filtro por seniority
      if (selectedSeniority !== 'all') {
        const hasSeniority = (m.sections || []).some((s) =>
          (s.questions || []).some(
            (item) =>
              (item.seniority && item.seniority.toLowerCase().includes(selectedSeniority.toLowerCase())) ||
              (item.difficulty && item.difficulty.toLowerCase().includes(selectedSeniority.toLowerCase()))
          )
        );
        if (!hasSeniority) return false;
      }

      // Filtro por tags (multi-select)
      if (selectedTags.length > 0) {
        const moduleTags = m.tags || [];
        const questionTags = (m.sections || []).flatMap((s) =>
          (s.questions || []).flatMap((item) => item.tags || [])
        );
        const allTags = [...moduleTags, ...questionTags];
        if (!selectedTags.some((t) => allTags.includes(t))) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedSeniority, selectedTags]);

  const activeModule = dataset.modules.find((m) => m.id === activeModuleId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Top Navbar unificada con Selector de Tema */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode('catalog')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform inline-flex items-center justify-center">
                <CircleHelpIcon className="w-5 h-5" />
              </span>
              <div>
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Dokove Questions
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                    pub.questions
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                  {dataset.totalModules} {dataset.totalModules === 1 ? 'módulo' : 'módulos'} · {dataset.totalQuestions} {dataset.totalQuestions === 1 ? 'pregunta' : 'preguntas'} calibradas por seniority
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de Tema: Light, Dark, Sepia */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                title="Modo Claro"
                aria-label="Modo Claro"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg text-xs transition-colors inline-flex items-center justify-center cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-amber-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <SunIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Modo Oscuro"
                aria-label="Modo Oscuro"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg text-xs transition-colors inline-flex items-center justify-center cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-blue-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <MoonIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Modo Sepia"
                aria-label="Modo Sepia"
                onClick={() => setTheme('sepia')}
                className={`p-1.5 rounded-lg text-xs transition-colors inline-flex items-center justify-center cursor-pointer ${
                  theme === 'sepia'
                    ? 'bg-amber-100 text-amber-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <CoffeeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= CONTENIDO: CATÁLOGO O QUESTIONS VIEWER ================= */}
      {viewMode === 'catalog' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
          {/* Header Compacto con Badges y Gamificación */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                  Preguntas & Entrevistas Técnicas
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Catálogo por Cards
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Catálogo de Preguntas Técnicas
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
                Banco canónico de preguntas de entrevista y evaluación de arquitectura calibradas por seniority con rúbricas de respuesta.
              </p>
            </div>

            {/* Badges de Gamificación */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                <FlameIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>4 Días Racha</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <ZapIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>305 XP</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <StarIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Nivel 3</span>
              </div>
            </div>
          </div>

          {/* Fila Armoniosa de Filtros Unificados con react-select */}
          <CatalogFilterBar
            theme={theme}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar en taxonomías: conceptos, temas, nodos..."
            categoryLabel="Categoría"
            selectedCategory={selectedCategory}
            categoryOptions={categoryOptions}
            onCategoryChange={setSelectedCategory}
            secondaryLabel="Seniority"
            selectedSecondary={selectedSeniority}
            secondaryOptions={seniorityOptions}
            onSecondaryChange={setSelectedSeniority}
            tagLabel="Etiquetas"
            selectedTags={selectedTags}
            tagOptions={tagOptions}
            onTagsChange={setSelectedTags}
            totalFiltered={filteredModules.length}
            itemNounSingle="módulo"
            itemNounPlural="módulos"
            onClearFilters={() => {
              setSelectedCategory('all');
              setSelectedSeniority('all');
              setSelectedTags([]);
              setSearchQuery('');
            }}
          />

          {/* Título de Sección con Contador */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Módulos de Preguntas Disponibles
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800/60">
                {filteredModules.length}
              </span>
            </div>
            {activeModule && (
              <button
                type="button"
                onClick={() => setViewMode('viewer')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Abrir módulo activo ({activeModule.title.split(':')[0]})</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid de Cards */}
          {filteredModules.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <SearchIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No se encontraron módulos de preguntas
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Intenta cambiar los filtros de categoría, seniority o término de búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredModules.map((m) => {
                const isSelected = m.id === activeModuleId;
                const catClean = m.category ? m.category.replace(/^questions\./, '') : 'general';
                const catLabel = catClean.charAt(0).toUpperCase() + catClean.slice(1).replace('-', ' ');
                const cleanTags = (m.tags || []).slice(0, 3);
                const sectionsCount = m.stats?.sections || m.sections?.length || 1;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setActiveModuleId(m.id);
                      setViewMode('viewer');
                    }}
                    className={`group relative rounded-lg p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer bg-white dark:bg-slate-900 hover:shadow-md ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                          <span>~</span>
                          <span>{catLabel}</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {m.totalQuestions} Preguntas
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {m.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
                          Banco de evaluación con {m.totalQuestions} preguntas técnicas distribuidas en {sectionsCount} secciones con criterios de evaluación.
                        </p>
                      </div>

                      {cleanTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cleanTags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2.5 font-medium text-[11px]">
                        <span className="flex items-center gap-1">
                          <CircleHelpIcon className="w-3.5 h-3.5 text-slate-400" />
                          {m.totalQuestions} preguntas
                        </span>
                        {sectionsCount > 1 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span>{sectionsCount} bloques</span>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          <ZapIcon className="w-3.5 h-3.5" />
                          +100 XP
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform text-xs">
                        Explorar
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 w-full">
          <QuestionsViewer
            data={dataset}
            initialModuleId={activeModuleId}
            onModuleChange={(modId) => setActiveModuleId(modId)}
            onBackToCatalog={() => setViewMode('catalog')}
          />
        </main>
      )}
    </div>
  );
}
