FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

EXPOSE 8002

CMD ["npm", "run", "start:dev"]
