FROM node:20-alpine

WORKDIR /app

# 1. Nest CLI'yi en başta global olarak sisteme kuruyoruz (Hatayı çözen sihirli satır)
RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8002

CMD ["npm", "run", "start:dev"]