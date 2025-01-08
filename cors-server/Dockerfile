#version
FROM node:14-alpine

#creat container directory
RUN mkdir /app

#working directory
WORKDIR /app

#copy the files from the directory to the container
COPY . /app

#expose the port
EXPOSE 8080

# Set the working directory to /app/node_modules/cors-anywhere
WORKDIR /app/node_modules/cors-anywhere

#run commands
RUN npm install
CMD ["node", "server.js"]
