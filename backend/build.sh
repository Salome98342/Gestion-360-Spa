#!/usr/bin/env bash
# Detener el script si hay un error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate