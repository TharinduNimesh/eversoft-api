FROM node:20-alpine3.19 

RUN mkdir /app

RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --chown=app:app package*.json ./

RUN chown app:app ./
RUN chmod 775 ./

USER app

RUN npm install

COPY --chown=app:app . .

EXPOSE 8000
CMD ./docker-entrypoint.sh