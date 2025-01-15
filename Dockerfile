# Step 1: Use an official Node.js runtime as the base image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and pnpm-lock.yaml first (leverage Docker caching)
COPY package.json pnpm-lock.yaml ./

# Step 4: Install pnpm globally and project dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Step 5: Copy the entire project directory into the container
COPY . .

# Step 6: Build the Next.js app
RUN pnpm build

# Step 7: Expose the port Next.js runs on
EXPOSE 7001

# Step 8: Set the command to start the application
CMD ["pnpm", "start"]
