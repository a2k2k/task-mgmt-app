FROM node:lts-alpine as dev

WORKDIR /code

COPY package.json ./

RUN npm install

CMD ["echo Oops"]