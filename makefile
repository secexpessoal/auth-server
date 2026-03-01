# ===== CONFIG =====
FRONTEND_DIR := frontend
DIST_DIR := $(FRONTEND_DIR)/dist
BACKEND_STATIC_DIR := backend/auth/src/main/resources/static

# ===== TARGETS =====
.PHONY: all build clean copy deploy

all: deploy

build:
	@echo ">> Building frontend..."
	cd $(FRONTEND_DIR) && npm run build

clean:
	@echo ">> Cleaning backend static directory..."
	rm -rf $(BACKEND_STATIC_DIR)/*
	mkdir -p $(BACKEND_STATIC_DIR)

copy:
	@echo ">> Copying dist to backend static..."
	cp -r $(DIST_DIR)/* $(BACKEND_STATIC_DIR)/

deploy: build clean copy
	@echo ">> Deploy pipeline completed successfully."