FROM node:14.17

WORKDIR /app/

COPY package-lock.json package.json serverless.yml ./

RUN npm i

COPY . .

COPY docker/docker-entrypoint.sh /scripts/docker-entrypoint.sh

RUN chmod 755 /scripts/docker-entrypoint.sh

ENTRYPOINT ["/scripts/docker-entrypoint.sh"]