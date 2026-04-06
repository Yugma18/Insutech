FROM node:22.12-slim

WORKDIR /app

# Required for Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
