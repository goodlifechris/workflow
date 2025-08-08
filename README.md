This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Workflow Builder

Workflow Builder is a full-stack application for creating and managing dynamic workflows visually. This README provides setup instructions for local development, Docker usage, and deployment.

## Features

- Visual workflow builder
- Auth system (NextAuth.js)
- PostgreSQL + Prisma ORM
- CI/CD via GitHub Actions
- Dockerized for production

---

## 🚀 Getting Started Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/workflow-builder.git
cd workflow-builder
```

### 2. Create environment variables

Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workflow-builder?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Access the app at `http://localhost:3000`.

## 🐳 Run postgres with Docker

### 1. Build and start container

```bash
docker-compose up db --build
```
---

## 🐳 Run all with Docker

### 1. Build and start containers

```bash
docker-compose up --build
```

### 2. Access the app

- Web App: [http://localhost:3000](http://localhost:3000)
- PostgreSQL: running on port `5432`

---

## ✅ CI/CD

This project uses GitHub Actions for CI/CD. On every push to the `main` branch:

- Linting, testing, and Prisma migration are run
- Future: automatic deploy to production via Docker (e.g., Railway or Render)

---



## 🧪 Running Tests

```bash
npm run test
```

Make sure your PostgreSQL database is running before running tests.

---

## 🛠 Tech Stack

- Next.js
- TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- Docker
- GitHub Actions

---

## 📄 License

MIT


