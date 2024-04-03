#!/bin/bash

# collections without user data
tables=(
  "ability_block"
  "ancestry"
  "archetype"
  "background"
  "class"
  "campaign"
  "character"
  "class"
  "content_source"
  "content_update"
  "creature"
  "encounter"
  "item"
  "language"
  # "public_user"
  "spell"
  "trait"
)

# Dump the schema only
pg_dump --schema-only --table="public.*" "$1" > schema.sql

rm data.sql
for table in ${tables[@]}
do
  pg_dump --data-only --table="public.${table}" "$1" >> data.sql
done
