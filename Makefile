.PHONY: help status test-all update build-viewer viewer

help:
	@echo "================================================================="
	@echo " 🏛️ THE MASTERY SUITE: COMMAND CENTER"
	@echo "================================================================="
	@echo " make status        - Muestra el estado de Git en los 9 módulos de la suite"
	@echo " make test-all      - Ejecuta los 9 laboratorios senior de la suite"
	@echo " make build-viewer  - Compila las 1,100 preguntas desde los repositorios a JSON y JS"
	@echo " make viewer        - Abre el visualizador web interactivo"
	@echo " make update        - Actualiza todos los submódulos desde GitHub"
	@echo "================================================================="

status:
	@for dir in nodejs-ecosystem-mastery typescript-mastery python-ecosystem-mastery php-ecosystem-mastery backend-mastery frontend-mastery cloud-mastery cicd-mastery agile-mastery; do \
		if [ -d "$$dir" ]; then \
			echo "\n🔍 [$$dir]:"; \
			(cd $$dir && git status -s 2>/dev/null || echo "Directorio local activo"); \
		fi \
	done

build-viewer:
	@node _scripts/build-questions-data.js

viewer: build-viewer
	@echo "🌐 Abriendo el visualizador interactivo de preguntas..."
	@open _viewer/index.html || xdg-open _viewer/index.html 2>/dev/null || echo "Abre _viewer/index.html en tu navegador"

test-all:
	@echo "\n🟢 [1/9] Ejecutando nodejs-ecosystem-mastery..."
	@(cd nodejs-ecosystem-mastery && npm run node:senior:m1:1)
	@echo "\n🔷 [2/9] Ejecutando typescript-mastery..."
	@(cd typescript-mastery && node --import ./node_modules/tsx/dist/loader.mjs tracks/05-type-gymnastics-and-patterns/lab-senior-types.ts 2>/dev/null || ../nodejs-ecosystem-mastery/node_modules/.bin/tsx typescript-mastery/tracks/05-type-gymnastics-and-patterns/lab-senior-types.ts)
	@echo "\n🐍 [3/9] Ejecutando python-ecosystem-mastery..."
	@(cd python-ecosystem-mastery && npm run py:gil:01)
	@echo "\n🐘 [4/9] Ejecutando php-ecosystem-mastery..."
	@(cd php-ecosystem-mastery && php tracks/01-php-runtime-and-internals/01-zend-engine-opcache-and-memory.php)
	@echo "\n🌐 [5/9] Ejecutando backend-mastery..."
	@(cd backend-mastery && npm run api:senior:01)
	@echo "\n⚛️ [6/9] Ejecutando frontend-mastery..."
	@(cd frontend-mastery && npm run react:senior:01)
	@echo "\n☁️ [7/9] Ejecutando cloud-mastery..."
	@(cd cloud-mastery && npm run cloud:senior:01)
	@echo "\n🚀 [8/9] Ejecutando cicd-mastery..."
	@(cd cicd-mastery && npm run cicd:senior:01)
	@echo "\n🏃 [9/9] Ejecutando agile-mastery..."
	@(cd agile-mastery && npm run agile:sim:01)
	@echo "\n✅ ¡TODOS LOS 9 LABORATORIOS SENIOR COMPLETADOS CON ÉXITO!"

update:
	@git submodule update --init --recursive --remote
