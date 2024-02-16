# Step 1: Use an official Node base image
FROM node:18-alpine3.18

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY prisma ./prisma/

# Step 4: Install your app dependencies
RUN npm install

# If you're building your code for production
# RUN npm ci --only=production

# Step 5: Bundle your app's source code inside the Docker image
COPY . .

# Step 6: Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Step 7: Define the command to run your app using CMD which defines your runtime
CMD [ "node", "./src/index.js" ]
