FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.11.6 /uv /usr/local/bin/uv

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project

COPY api/ ./api/

CMD ["sh", "-c", "cd api && uv run python manage.py migrate --noinput && uv run gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
