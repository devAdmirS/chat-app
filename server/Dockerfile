FROM node:14

WORKDIR /app/server

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]