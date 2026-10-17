FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache su-exec
COPY package.json ./
RUN npm install --omit=dev
COPY sql ./sql
COPY src ./src
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && mkdir -p /data/docs
EXPOSE 3000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
