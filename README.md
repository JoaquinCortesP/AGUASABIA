# AGUASABIA
<<<<<<< HEAD
Integrantes: Sofia Araya, Joaquin Cortes 
=======

Integrantes: Sofia Araya, Joaquin Cortes
>>>>>>> Joaquin/branch
Seccion : 00D1

Proyecto de taller de programacion

## Descripción

Sistema de gestión hídrica para municipios basado en FAO-56.

## Tecnologías

- FastAPI
- PostgreSQL
- React
- Redis
- Celery

## Levantar backend

pip install -r requirements.txt
uvicorn app.main:app --reload

## Base de datos

psql -U postgres -d aguasabia < schema.sql

## Deploy

Railway
