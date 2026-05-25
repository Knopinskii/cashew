

.PHONY: run server client install build lint migrate makemigrations shell dev


# ── Backend ───────────────────────────────────────────────
server:
	cd api && uv run python manage.py runserver

migrate:
	cd api && uv run python manage.py migrate

makemigrations:
	cd api && uv run python manage.py makemigrations

shell:
	cd api && uv run python manage.py shell

# ── Frontend ──────────────────────────────────────────────
client:
	cd app && npm run dev

install:
	cd app && npm install

build:
	cd app && npm run build

lint:
	cd app && npm run lint

# ── Both ──────────────────────────────────────────────────
dev:
	make -j2 server client
