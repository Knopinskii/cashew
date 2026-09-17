FROM python:3.13-slim

# slim over alpine: alpine uses musl, so packages without a musl wheel are
# compiled from source — minutes of build time to save a few megabytes.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/usr/local

# uv from its own image, pinned: :latest would make the build differ by the day
# it ran, which is the opposite of what an image is for.
COPY --from=ghcr.io/astral-sh/uv:0.11.6 /uv /usr/local/bin/uv

WORKDIR /app

# Dependencies before code. Docker caches each layer and reuses it while its
# inputs are unchanged, so editing a view rebuilds seconds of work instead of
# reinstalling every package.
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project

COPY api/ ./api/
WORKDIR /app/api

# collectstatic needs settings to import, and settings refuse to load without a
# SECRET_KEY. This one exists for the length of this layer and never becomes an
# ENV, so it cannot leak into the running container.
RUN SECRET_KEY=build-only-not-a-secret python manage.py collectstatic --noinput

# Root inside a container is still root if anything escapes it, and dropping
# privileges later is far harder than starting without them.
RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

EXPOSE 8000
CMD ["./entrypoint.sh"]
