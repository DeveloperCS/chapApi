FROM node 
WORKDIR ./
COPY package.json ./
RUN npm install
COPY . . 
RUN npm run postinstall
RUN npm run build
CMD npm run start
EXPOSE 3000
EXPOSE 3001