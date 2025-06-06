FROM node:24-slim

RUN groupadd -r app && useradd -r -g app app

WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci
COPY . .
USER app
EXPOSE 3000

CMD ["npm", "run", "start"]