#!/bin/bash
cd /app

if [ ! -f /app/data/.database.built ]; then
    echo "Creating db..."
    npm run db:create
    npm run fixtures
    touch /app/data/.database.built
fi

npm run start
