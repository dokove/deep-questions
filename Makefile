.PHONY: help build validate test dev

help:
	@echo "================================================================="
	@echo " ❓ DOKOVE QUESTIONS BANK — COMMAND CENTER"
	@echo "================================================================="
	@echo " make build     - Compila questions/*.md a dist/questions-data.json"
	@echo " make validate  - Valida el catálogo contra @dokove/taxonomies"
	@echo " make test      - Ejecuta compilación y validación taxonómica"
	@echo " make dev       - Inicia la previsualización interactiva con Vite"
	@echo "================================================================="

build:
	npm run build

validate:
	npm run validate:taxonomies

test:
	npm test

dev:
	npm run dev
