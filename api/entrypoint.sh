#!/bin/sh
set -e

# Migrations run at start rather than at build: a build has no database to talk
# to, and an image that has already migrated would be tied to one deployment.
#
# This is safe while a single container runs the app. With several replicas
# starting at once they would race, and migrations would move to a job that
# runs before the rollout.
python manage.py migrate --noinput

# exec, so gunicorn becomes PID 1 and receives the stop signal itself. Without
# it the shell holds PID 1, ignores SIGTERM, and Docker kills the container
# after the timeout instead of letting requests finish.
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -
