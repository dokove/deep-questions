.PHONY: help status test-all update

help:
	@echo "================================================================="
	@echo " 🏛️ THE MASTERY SUITE: COMMAND CENTER"
	@echo "================================================================="
	@echo " make status    - Muestra el estado de Git en los 8 repositorios"
	@echo " make test-all  - Ejecuta los laboratorios senior en los 8 repos"
	@echo " make update    - Actualiza todos los submódulos desde GitHub"
	@echo "================================================================="

status:
	@for dir in nodejs-ecosystem-mastery python-ecosystem-mastery php-ecosystem-mastery backend-mastery frontend-mastery cloud-mastery cicd-mastery agile-mastery; do \
		echo "\n🔍 [$$dir]:"; \
		(cd $$dir && git status -s); \
	done

test-all:
	@echo "\n🟢 [1/8] Ejecutando nodejs-ecosystem-mastery..."
	@(cd nodejs-ecosystem-mastery && npm run node:senior:m1:1)
	@echo "\n🐍 [2/8] Ejecutando python-ecosystem-mastery..."
	@(cd python-ecosystem-mastery && npm run py:gil:01)
	@echo "\n🐘 [3/8] Ejecutando php-ecosystem-mastery..."
	@(cd php-ecosystem-mastery && php tracks/01-php-runtime-and-internals/01-zend-engine-opcache-and-memory.php)
	@echo "\n🌐 [4/8] Ejecutando backend-mastery..."
	@(cd backend-mastery && npm run api:senior:01)
	@echo "\n⚛️ [5/8] Ejecutando frontend-mastery..."
	@(cd frontend-mastery && npm run react:senior:01)
	@echo "\n☁️ [6/8] Ejecutando cloud-mastery..."
	@(cd cloud-mastery && npm run cloud:senior:01)
	@echo "\n🚀 [7/8] Ejecutando cicd-mastery..."
	@(cd cicd-mastery && npm run cicd:senior:01)
	@echo "\n🏃 [8/8] Ejecutando agile-mastery..."
	@(cd agile-mastery && npm run agile:sim:01)
	@echo "\n✅ ¡TODOS LOS 8 LABORATORIOS COMPLETADOS CON ÉXITO!"

update:
	@git submodule update --init --recursive --remote
