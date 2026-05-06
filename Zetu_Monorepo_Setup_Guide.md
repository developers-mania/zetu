

| SPRINT26  ·  ZETU CAPSTONE Monorepo Setup Guide Vue 3  \+  NestJS  \+  Prisma  \+  PostgreSQL *A complete step-by-step guide to scaffolding the Zetu codebase from scratch.* Developers Mania  ·  Rethinking Software — Sharpening the Craft |
| :---- |

# **Introduction**

*This guide walks you through creating the Zetu monorepo from an empty folder to a fully scaffolded, version-controlled codebase with a working Vue 3 frontend, NestJS backend, shared TypeScript packages, and a Prisma database layer. Every command is explained. Nothing is assumed.*

By the end of this guide you will have:

* A pnpm workspace monorepo containing three packages: web (Vue 3), api (NestJS), and shared (types/utilities)

* A fully typed Vue 3 frontend using Vite, Vue Router, Pinia, and Tailwind CSS

* A modular NestJS API with Auth, Groups, Contributions, Payouts, and Notifications modules

* A Prisma ORM setup connected to PostgreSQL with the complete Zetu schema

* ESLint \+ Prettier configured across the entire monorepo

* Git initialized with a conventional commit structure and a .env.example

* The repo pushed to GitHub and ready for the next Sprint26 session

| Tool | Version / Notes |
| :---- | :---- |
| **Node.js** | v20 LTS or higher — check with: node \--version |
| **pnpm** | v9+ — faster, stricter than npm for monorepos — install: npm install \-g pnpm |
| **Vue** | 3.4+ (Composition API \+ \<script setup\>) |
| **NestJS** | v10+ |
| **Prisma** | v5+ |
| **PostgreSQL** | v15+ — local install or Docker |
| **Git** | Any recent version |
| **VS Code** | Recommended editor — extensions listed in Appendix |

|    | Why pnpm over npm? pnpm handles monorepo workspaces significantly better than npm. It uses hard links for node\_modules (saving disk space), enforces strict dependency isolation between packages, and has first-class workspace support. For a monorepo with three packages sharing dependencies, pnpm is the right tool. |
| :---- | :---- |

| SECTION 1 — Monorepo Structure & Philosophy |
| :---- |

# **Understanding the Monorepo**

A monorepo is a single Git repository containing multiple related packages or applications. For Zetu, this means the frontend, backend, and shared code all live in one place — one git history, one CI pipeline, and shared TypeScript types between client and server.

The alternative is a polyrepo: separate repositories for frontend and backend. Polyrepos create synchronization problems — when you change a shared type (say, the shape of a Group object), you must update and coordinate two repositories. In a monorepo, one change propagates everywhere.

## **The Target Structure**

Before writing a single command, understand what you are building:

| zetu/                          \# Repository root ├── apps/ │   ├── web/                   \# Vue 3 frontend (Vite) │   │   ├── src/ │   │   │   ├── assets/ │   │   │   ├── components/    \# Reusable UI components │   │   │   │   ├── ui/        \# Generic: Button, Input, Modal │   │   │   │   ├── groups/    \# GroupCard, MemberList, RotationView │   │   │   │   └── payments/  \# ContributionForm, PayoutStatus │   │   │   ├── composables/   \# Vue composables (useGroup, useAuth) │   │   │   ├── layouts/       \# AppLayout, AuthLayout │   │   │   ├── pages/         \# Route-level components │   │   │   │   ├── auth/      \# Login.vue, Register.vue │   │   │   │   ├── dashboard/ \# Dashboard.vue │   │   │   │   └── groups/    \# GroupDetail.vue, GroupCreate.vue │   │   │   ├── router/        \# Vue Router config │   │   │   ├── stores/        \# Pinia stores │   │   │   │   ├── auth.store.ts │   │   │   │   └── groups.store.ts │   │   │   ├── services/      \# API client calls │   │   │   ├── types/         \# Frontend-specific types │   │   │   └── utils/         \# Formatters, helpers │   │   ├── index.html │   │   ├── vite.config.ts │   │   ├── tsconfig.json │   │   └── package.json │   │ │   └── api/                   \# NestJS backend │       ├── src/ │       │   ├── modules/ │       │   │   ├── auth/      \# Auth module (register, login, OTP) │       │   │   ├── groups/    \# Groups module (CRUD, members) │       │   │   ├── contributions/ \# Payments, STK Push │       │   │   ├── payouts/   \# Payout rotation logic │       │   │   └── notifications/ \# SMS \+ in-app │       │   ├── shared/ │       │   │   ├── decorators/ │       │   │   ├── guards/    \# JWT, roles │       │   │   ├── filters/   \# Exception filters │       │   │   ├── interceptors/ │       │   │   └── pipes/ │       │   ├── config/        \# ConfigModule setup │       │   ├── prisma/        \# PrismaService \+ PrismaModule │       │   └── main.ts        \# Application entry point │       ├── prisma/ │       │   └── schema.prisma  \# Database schema │       ├── test/ │       ├── tsconfig.json │       └── package.json │ ├── packages/ │   └── shared/                \# Shared TypeScript types & utils │       ├── src/ │       │   ├── types/         \# Shared interfaces (Group, User, etc) │       │   └── utils/         \# Shared pure functions │       ├── tsconfig.json │       └── package.json │ ├── .env.example               \# Environment variable template ├── .gitignore ├── .eslintrc.js               \# Root ESLint config ├── .prettierrc                \# Prettier config ├── pnpm-workspace.yaml        \# pnpm workspace definition ├── turbo.json                 \# Turborepo pipeline (optional) └── package.json               \# Root package.json |
| :---- |

| SECTION 2 — Root Setup |
| :---- |

| 01 | Create the Root Directory & Initialize Git |
| :---: | :---- |

Start from wherever you keep your projects. Every command that follows assumes you are in the zetu/ root unless stated otherwise.

| \# Create the project root and navigate into it mkdir zetu && cd zetu   \# Initialize git git init   \# Create the workspace folder structure mkdir \-p apps/web apps/api packages/shared docs |
| :---- |

| 02 | Create the Root package.json |
| :---: | :---- |

The root package.json does not contain application code. It defines the workspace, shared dev tools, and scripts that run across all packages.

| \# Create root package.json cat \> package.json \<\< 'EOF' {   "name": "zetu",   "version": "1.0.0",   "private": true,   "scripts": {     "dev": "turbo run dev",     "build": "turbo run build",     "lint": "turbo run lint",     "test": "turbo run test",     "format": "prettier \--write \\"\*\*/\*.{ts,vue,json,md}\\""   },   "devDependencies": {     "turbo": "^2.0.0",     "prettier": "^3.3.0",     "eslint": "^9.0.0",     "@typescript-eslint/eslint-plugin": "^7.0.0",     "@typescript-eslint/parser": "^7.0.0"   } } EOF |
| :---- |

|    | What is Turbo? Turborepo is a build system for monorepos. It understands the dependency graph between your packages and runs tasks (build, test, lint) in the correct order with caching. It is optional for Sprint26 but adding it now costs nothing and saves significant time as the project grows. |
| :---- | :---- |

| 03 | Create the pnpm Workspace Configuration |
| :---: | :---- |

This file tells pnpm which directories contain packages. Any package.json found inside these paths becomes a workspace package.

| cat \> pnpm-workspace.yaml \<\< 'EOF' packages:   \- "apps/\*"   \- "packages/\*" EOF |
| :---- |

| 04 | Create Turborepo Configuration |
| :---: | :---- |

| cat \> turbo.json \<\< 'EOF' {   "$schema": "https://turbo.build/schema.json",   "tasks": {     "build": {       "dependsOn": \["^build"\],       "outputs": \["dist/\*\*", ".next/\*\*"\]     },     "dev": {       "cache": false,       "persistent": true     },     "lint": {       "dependsOn": \["^build"\]     },     "test": {       "dependsOn": \["^build"\]     }   } } EOF |
| :---- |

| 05 | Prettier & ESLint at the Root |
| :---: | :---- |

Formatting and linting rules are defined once at the root and apply to all packages. This prevents style drift between the frontend and backend.

| \# Prettier config cat \> .prettierrc \<\< 'EOF' {   "semi": false,   "singleQuote": true,   "trailingComma": "all",   "printWidth": 100,   "tabWidth": 2,   "plugins": \["prettier-plugin-tailwindcss"\] } EOF |
| :---- |

| \# ESLint config cat \> .eslintrc.js \<\< 'EOF' module.exports \= {   root: true,   parser: '@typescript-eslint/parser',   plugins: \['@typescript-eslint'\],   extends: \[     'eslint:recommended',     'plugin:@typescript-eslint/recommended',   \],   rules: {     '@typescript-eslint/no-unused-vars': \['warn', { argsIgnorePattern: '^\_' }\],     '@typescript-eslint/explicit-function-return-type': 'off',     '@typescript-eslint/no-explicit-any': 'warn',   },   ignorePatterns: \['dist/', 'node\_modules/', '.next/'\], } EOF |
| :---- |

| 06 | Create .gitignore and .env.example |
| :---: | :---- |

| cat \> .gitignore \<\< 'EOF' \# Dependencies node\_modules/   \# Build outputs dist/ .next/ build/   \# Environment variables — NEVER commit these .env .env.local .env.\*.local   \# Logs \*.log npm-debug.log\* pnpm-debug.log\*   \# Editor .vscode/settings.json .idea/   \# OS .DS\_Store Thumbs.db   \# Turbo .turbo/ EOF |
| :---- |

| cat \> .env.example \<\< 'EOF' \# ── DATABASE ───────────────────────────────────────── DATABASE\_URL=postgresql://postgres:password@localhost:5432/zetu\_dev   \# ── JWT AUTH ───────────────────────────────────────── JWT\_SECRET=replace\_with\_a\_long\_random\_string JWT\_EXPIRES\_IN=7d   \# ── MPESA (Safaricom Daraja API) ───────────────────── MPESA\_CONSUMER\_KEY= MPESA\_CONSUMER\_SECRET= MPESA\_SHORTCODE= MPESA\_PASSKEY= MPESA\_CALLBACK\_URL=https://yourdomain.com/api/contributions/mpesa/callback MPESA\_ENV=sandbox   \# ── AFRICA'S TALKING (SMS) ──────────────────────────── AT\_API\_KEY= AT\_USERNAME=sandbox   \# ── APP ────────────────────────────────────────────── PORT=3000 NODE\_ENV=development FRONTEND\_URL=http://localhost:5173 EOF |
| :---- |

|    | Security Rule \#1 The .env file contains secrets. It is in .gitignore. It must never appear in a commit. The .env.example is the safe, committed version — it shows what variables are needed without revealing any values. Always keep these two files in sync. |
| :---- | :---- |

| SECTION 3 — Shared Package (packages/shared) |
| :---- |

# **The Shared Package**

Before scaffolding the frontend or backend, build the shared package first. The reason: both apps depend on it. Setting it up first means both Vue and NestJS can import from @zetu/shared — shared TypeScript interfaces, DTO types, and utility functions that prevent duplication.

| 07 | Initialize the Shared Package |
| :---: | :---- |

| cd packages/shared   cat \> package.json \<\< 'EOF' {   "name": "@zetu/shared",   "version": "1.0.0",   "main": "./src/index.ts",   "types": "./src/index.ts",   "scripts": {     "build": "tsc",     "lint": "eslint src/\*\*/\*.ts"   },   "devDependencies": {     "typescript": "^5.0.0"   } } EOF |
| :---- |

| cat \> tsconfig.json \<\< 'EOF' {   "compilerOptions": {     "target": "ES2020",     "module": "CommonJS",     "strict": true,     "declaration": true,     "outDir": "./dist",     "rootDir": "./src"   },   "include": \["src/\*\*/\*"\] } EOF   mkdir \-p src/types src/utils |
| :---- |

| 08 | Write the Shared Type Definitions |
| :---: | :---- |

These interfaces are derived directly from the Zetu SRS. Any change to these types propagates to both the frontend and backend simultaneously — this is the core value of the shared package.

| \# src/types/user.types.ts |
| :---- |
| export interface User {   id: string   phone: string   displayName: string | null   mpesaNumber: string | null   createdAt: Date }   export interface CreateUserDto {   phone: string   password: string   displayName?: string }   export interface LoginDto {   phone: string   password: string }   export interface AuthResponse {   accessToken: string   user: Omit\<User, 'createdAt'\> } |

| \# src/types/group.types.ts |
| :---- |
| export type ContributionFrequency \= 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' export type GroupStatus \= 'SETUP' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' export type MemberRole \= 'ADMIN' | 'MEMBER' export type MemberStatus \= 'PENDING' | 'ACTIVE' | 'REMOVED'   export interface Group {   id: string   name: string   description: string | null   contributionAmount: number   frequency: ContributionFrequency   status: GroupStatus   platformFeePercent: number   createdAt: Date   memberCount?: number }   export interface GroupMember {   id: string   userId: string   groupId: string   role: MemberRole   status: MemberStatus   joinedAt: Date | null   user?: Pick\<import('./user.types').User, 'id' | 'displayName' | 'phone'\> }   export interface CreateGroupDto {   name: string   description?: string   contributionAmount: number   frequency: ContributionFrequency }   export interface InviteMemberDto {   phone: string } |

| \# src/types/contribution.types.ts |
| :---- |
| export type ContributionStatus \= 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED' export type TransactionType \= 'CONTRIBUTION' | 'PAYOUT' | 'PLATFORM\_FEE' | 'REFUND'   export interface Contribution {   id: string   groupId: string   userId: string   amount: number   status: ContributionStatus   mpesaRef: string | null   dueDate: Date   paidAt: Date | null }   export interface Transaction {   id: string   type: TransactionType   amount: number   reference: string   createdAt: Date }   export interface MpesaCallbackPayload {   Body: {     stkCallback: {       MerchantRequestID: string       CheckoutRequestID: string       ResultCode: number       ResultDesc: string       CallbackMetadata?: {         Item: Array\<{ Name: string; Value: string | number }\>       }     }   } } |

| \# src/index.ts — the barrel export |
| :---- |
| export \* from './types/user.types' export \* from './types/group.types' export \* from './types/contribution.types' |

| SECTION 4 — Vue 3 Frontend (apps/web) |
| :---- |

# **Scaffolding the Vue 3 Frontend**

*Vue 3 with the Composition API and \<script setup\> syntax is the modern way to build Vue applications. Combined with Vite (the fastest frontend build tool available), Pinia for state management, and Vue Router for navigation, this stack is production-grade and developer-friendly.*

| 09 | Create the Vue App with Vite |
| :---: | :---- |

Navigate to the apps directory and scaffold the Vue app. When prompted, choose Vue \+ TypeScript.

| cd apps   \# Scaffold Vue 3 \+ TypeScript with Vite pnpm create vue@latest web   \# When prompted, select the following options: \# ✔ Add TypeScript?                    › Yes \# ✔ Add JSX Support?                   › No \# ✔ Add Vue Router for SPA?            › Yes \# ✔ Add Pinia for state management?    › Yes \# ✔ Add Vitest for unit testing?        › Yes \# ✔ Add an End-to-End Testing Solution? › No (add later) \# ✔ Add ESLint for code quality?        › Yes \# ✔ Add Prettier for code formatting?   › Yes \# ✔ Add Vue DevTools?                   › Yes   cd web   \# Install Tailwind CSS pnpm add \-D tailwindcss postcss autoprefixer prettier-plugin-tailwindcss npx tailwindcss init \-p   \# Install additional dependencies pnpm add axios @vueuse/core pnpm add @zetu/shared |
| :---- |

|    | What is @vueuse/core? VueUse is a collection of composables (Vue's equivalent of React hooks) for common browser APIs. useStorage, useFetch, useDebounce, useEventListener — these save significant boilerplate. It is the single most useful Vue utility library and is worth knowing well. |
| :---- | :---- |

| 10 | Configure Tailwind CSS |
| :---: | :---- |

| \# tailwind.config.js — replace the generated config with: |
| :---- |
| /\*\* @type {import('tailwindcss').Config} \*/ export default {   content: \[     './index.html',     './src/\*\*/\*.{vue,js,ts,jsx,tsx}',   \],   theme: {     extend: {       colors: {         brand: {           50:  '\#e6f7fb',           100: '\#b3e8f5',           500: '\#00B4D8',           600: '\#0077B6',           900: '\#0D1B2A',         },         zetu: {           primary:   '\#00B4D8',           secondary: '\#0077B6',           dark:      '\#0D1B2A',         }       }     }   },   plugins: \[\], } |

| \# src/assets/main.css — replace with: |
| :---- |
| @tailwind base; @tailwind components; @tailwind utilities;   @layer base {   body {     @apply bg-gray-50 text-gray-900 antialiased;   } } |

| 11 | Configure Vite |
| :---: | :---- |

The Vite config sets up path aliases (so you can import from @/ instead of ../../), the dev server proxy (so API calls go to NestJS without CORS issues in development), and the shared package resolution.

| \# vite.config.ts |
| :---- |
| import { fileURLToPath, URL } from 'node:url' import { defineConfig } from 'vite' import vue from '@vitejs/plugin-vue'   export default defineConfig({   plugins: \[vue()\],   resolve: {     alias: {       '@': fileURLToPath(new URL('./src', import.meta.url)),       '@zetu/shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url)),     },   },   server: {     port: 5173,     proxy: {       '/api': {         target: 'http://localhost:3000',         changeOrigin: true,       },     },   }, }) |

| 12 | Restructure the Vue App Folder |
| :---: | :---- |

The create-vue scaffold gives you a starting structure. Clean it up and extend it to match the Zetu architecture:

| \# Remove the example components and views rm \-rf src/components/\* src/views/\* src/stores/\*   \# Create the Zetu folder structure mkdir \-p src/components/ui mkdir \-p src/components/groups mkdir \-p src/components/payments mkdir \-p src/pages/auth mkdir \-p src/pages/dashboard mkdir \-p src/pages/groups mkdir \-p src/layouts mkdir \-p src/composables mkdir \-p src/services mkdir \-p src/stores mkdir \-p src/utils mkdir \-p src/types |
| :---- |

| 13 | Configure Vue Router |
| :---: | :---- |

Vue Router is the official routing library. Configure it with route guards so unauthenticated users are redirected to login automatically.

| \# src/router/index.ts |
| :---- |
| import { createRouter, createWebHistory } from 'vue-router' import { useAuthStore } from '@/stores/auth.store'   const router \= createRouter({   history: createWebHistory(import.meta.env.BASE\_URL),   routes: \[     // ── Auth routes (no layout wrapper) ──     {       path: '/auth',       component: () \=\> import('@/layouts/AuthLayout.vue'),       children: \[         { path: 'login',    name: 'login',    component: () \=\> import('@/pages/auth/Login.vue') },         { path: 'register', name: 'register', component: () \=\> import('@/pages/auth/Register.vue') },       \],     },     // ── Protected routes (requires auth) ──     {       path: '/',       component: () \=\> import('@/layouts/AppLayout.vue'),       meta: { requiresAuth: true },       children: \[         { path: '',         name: 'dashboard',     component: () \=\> import('@/pages/dashboard/Dashboard.vue') },         { path: 'groups',   name: 'groups',        component: () \=\> import('@/pages/groups/GroupList.vue') },         { path: 'groups/:id', name: 'group-detail', component: () \=\> import('@/pages/groups/GroupDetail.vue') },         { path: 'groups/create', name: 'group-create', component: () \=\> import('@/pages/groups/GroupCreate.vue') },       \],     },     // ── Catch-all ──     { path: '/:pathMatch(.\*)\*', redirect: '/' },   \], })   // Navigation guard — redirects unauthenticated users router.beforeEach((to) \=\> {   const authStore \= useAuthStore()   if (to.meta.requiresAuth && \!authStore.isAuthenticated) {     return { name: 'login', query: { redirect: to.fullPath } }   } })   export default router |

| 14 | Set Up Pinia Auth Store |
| :---: | :---- |

Pinia is Vue 3's official state management library. The auth store holds the current user and JWT token, persisting them to localStorage so the session survives a page refresh.

| \# src/stores/auth.store.ts |
| :---- |
| import { defineStore } from 'pinia' import { ref, computed } from 'vue' import type { User, LoginDto, CreateUserDto, AuthResponse } from '@zetu/shared' import { authService } from '@/services/auth.service'   export const useAuthStore \= defineStore('auth', () \=\> {   // ── State ──   const user  \= ref\<User | null\>(null)   const token \= ref\<string | null\>(localStorage.getItem('zetu\_token'))     // ── Getters ──   const isAuthenticated \= computed(() \=\> \!\!token.value)   const currentUser     \= computed(() \=\> user.value)     // ── Actions ──   async function login(dto: LoginDto): Promise\<void\> {     const response: AuthResponse \= await authService.login(dto)     token.value \= response.accessToken     user.value  \= response.user as User     localStorage.setItem('zetu\_token', response.accessToken)   }     async function register(dto: CreateUserDto): Promise\<void\> {     await authService.register(dto)   }     function logout(): void {     token.value \= null     user.value  \= null     localStorage.removeItem('zetu\_token')   }     return { user, token, isAuthenticated, currentUser, login, register, logout } }) |

| 15 | Create the API Service Layer |
| :---: | :---- |

All HTTP calls to the NestJS backend go through a centralized Axios instance. This means auth headers, base URLs, and error handling are configured in one place and inherited by every service.

| \# src/services/api.client.ts |
| :---- |
| import axios from 'axios'   export const apiClient \= axios.create({   baseURL: '/api',   headers: { 'Content-Type': 'application/json' },   timeout: 10\_000, })   // Attach JWT token to every request apiClient.interceptors.request.use((config) \=\> {   const token \= localStorage.getItem('zetu\_token')   if (token) config.headers.Authorization \= \`Bearer ${token}\`   return config })   // Handle 401 globally — token expired or invalid apiClient.interceptors.response.use(   (response) \=\> response,   (error) \=\> {     if (error.response?.status \=== 401\) {       localStorage.removeItem('zetu\_token')       window.location.href \= '/auth/login'     }     return Promise.reject(error)   }, ) |

| \# src/services/auth.service.ts |
| :---- |
| import type { LoginDto, CreateUserDto, AuthResponse } from '@zetu/shared' import { apiClient } from './api.client'   export const authService \= {   async login(dto: LoginDto): Promise\<AuthResponse\> {     const { data } \= await apiClient.post\<AuthResponse\>('/auth/login', dto)     return data   },     async register(dto: CreateUserDto): Promise\<void\> {     await apiClient.post('/auth/register', dto)   },     async verifyOtp(phone: string, otp: string): Promise\<void\> {     await apiClient.post('/auth/verify-otp', { phone, otp })   }, } |

| SECTION 5 — NestJS Backend (apps/api) |
| :---- |

# **Scaffolding the NestJS Backend**

*NestJS is a progressive Node.js framework built on top of Express, using TypeScript and inspired by Angular's architecture. It enforces structure through modules, controllers, services, and dependency injection — perfectly matching the software design principles from the Sprint26 talk.*

| 16 | Create the NestJS App |
| :---: | :---- |

Navigate to the apps directory. Use the NestJS CLI to scaffold the application. Do not use git init inside it — the root already manages git.

| cd apps   \# Install the NestJS CLI globally if you don't have it pnpm add \-g @nestjs/cli   \# Scaffold a new NestJS project (skip git init) nest new api \--package-manager pnpm \--skip-git   cd api   \# Install core dependencies for Zetu pnpm add @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt pnpm add @prisma/client bcrypt class-validator class-transformer pnpm add @nestjs/throttler helmet pnpm add \-D prisma @types/bcrypt @types/passport-jwt   \# Reference the shared package pnpm add @zetu/shared |
| :---- |

| 17 | Configure the NestJS Folder Structure |
| :---: | :---- |

The NestJS CLI scaffold gives you a basic structure. Extend it to match Zetu's modular architecture. Each module directory follows the same internal pattern — mirroring the design principle of consistency.

| \# Remove the default app controller/service (we use modules) rm src/app.controller.ts src/app.controller.spec.ts src/app.service.ts   \# Create module directories mkdir \-p src/modules/auth mkdir \-p src/modules/groups mkdir \-p src/modules/contributions mkdir \-p src/modules/payouts mkdir \-p src/modules/notifications   \# Create shared infrastructure directories mkdir \-p src/shared/decorators mkdir \-p src/shared/guards mkdir \-p src/shared/filters mkdir \-p src/shared/interceptors mkdir \-p src/shared/pipes   \# Create config and prisma directories mkdir \-p src/config mkdir \-p src/prisma |
| :---- |

| 18 | Set Up PrismaService |
| :---: | :---- |

In NestJS, Prisma is wrapped in a PrismaService — an injectable service that manages the database connection. This is the only place in the entire application that the Prisma client is instantiated.

| \# src/prisma/prisma.service.ts |
| :---- |
| import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common' import { PrismaClient } from '@prisma/client'   @Injectable() export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {   async onModuleInit(): Promise\<void\> {     await this.$connect()   }     async onModuleDestroy(): Promise\<void\> {     await this.$disconnect()   } } |

| \# src/prisma/prisma.module.ts |
| :---- |
| import { Global, Module } from '@nestjs/common' import { PrismaService } from './prisma.service'   // @Global() means PrismaModule only needs to be imported once (in AppModule) // and PrismaService is available everywhere without re-importing @Global() @Module({   providers: \[PrismaService\],   exports:   \[PrismaService\], }) export class PrismaModule {} |

| 19 | Configure the Root AppModule |
| :---: | :---- |

The AppModule is the root of NestJS's dependency injection tree. Every module in the application is registered here — or imported into a module that is registered here.

| \# src/app.module.ts |
| :---- |
| import { Module } from '@nestjs/common' import { ConfigModule } from '@nestjs/config' import { ThrottlerModule } from '@nestjs/throttler' import { PrismaModule } from './prisma/prisma.module' import { AuthModule } from './modules/auth/auth.module' import { GroupsModule } from './modules/groups/groups.module' import { ContributionsModule } from './modules/contributions/contributions.module' import { PayoutsModule } from './modules/payouts/payouts.module' import { NotificationsModule } from './modules/notifications/notifications.module'   @Module({   imports: \[     // Load .env variables globally     ConfigModule.forRoot({ isGlobal: true }),       // Rate limiting — protects all endpoints     ThrottlerModule.forRoot(\[{ ttl: 60\_000, limit: 30 }\]),       // Global database access     PrismaModule,       // Domain modules     AuthModule,     GroupsModule,     ContributionsModule,     PayoutsModule,     NotificationsModule,   \], }) export class AppModule {} |

| 20 | Configure main.ts |
| :---: | :---- |

main.ts is the NestJS entry point. This is where global pipes, filters, guards, and Swagger documentation are configured.

| \# src/main.ts |
| :---- |
| import { NestFactory } from '@nestjs/core' import { ValidationPipe } from '@nestjs/common' import { ConfigService } from '@nestjs/config' import helmet from 'helmet' import { AppModule } from './app.module'   async function bootstrap() {   const app \= await NestFactory.create(AppModule)     const config \= app.get(ConfigService)   const port   \= config.get\<number\>('PORT', 3000\)   const origin \= config.get\<string\>('FRONTEND\_URL', 'http://localhost:5173')     // Security headers   app.use(helmet())     // CORS — only allow requests from the Vue frontend   app.enableCors({ origin, credentials: true })     // Global API prefix — all routes are /api/...   app.setGlobalPrefix('api')     // Global validation pipe — validates all incoming DTOs   // whitelist: strips unknown properties from request body   // forbidNonWhitelisted: throws error if unknown properties sent   app.useGlobalPipes(new ValidationPipe({     whitelist: true,     forbidNonWhitelisted: true,     transform: true,   }))     await app.listen(port)   console.log(\`Zetu API running on: http://localhost:${port}/api\`) }   bootstrap() |

| 21 | Scaffold the Module Pattern — Groups Module as Template |
| :---: | :---- |

Every module in NestJS follows the same internal pattern. Build the Groups module first — then replicate the structure for Auth, Contributions, Payouts, and Notifications. The NestJS CLI generates the files:

| \# Generate all module files using the CLI nest generate module   modules/groups  \--flat nest generate controller modules/groups \--flat \--no-spec nest generate service  modules/groups  \--flat \--no-spec   \# Manually create the remaining files touch src/modules/groups/groups.repository.ts touch src/modules/groups/groups.dto.ts touch src/modules/groups/groups.types.ts   \# Repeat for other modules nest generate module   modules/auth  \--flat nest generate controller modules/auth \--flat \--no-spec nest generate service  modules/auth  \--flat \--no-spec touch src/modules/auth/auth.repository.ts touch src/modules/auth/auth.dto.ts   nest generate module   modules/contributions  \--flat nest generate controller modules/contributions \--flat \--no-spec nest generate service  modules/contributions  \--flat \--no-spec   nest generate module   modules/payouts  \--flat nest generate controller modules/payouts \--flat \--no-spec nest generate service  modules/payouts  \--flat \--no-spec   nest generate module   modules/notifications  \--flat nest generate service  modules/notifications  \--flat \--no-spec |
| :---- |

Now wire up the Groups module as the reference implementation:

| \# src/modules/groups/groups.module.ts |
| :---- |
| import { Module } from '@nestjs/common' import { GroupsController } from './groups.controller' import { GroupsService } from './groups.service' import { GroupsRepository } from './groups.repository'   @Module({   controllers: \[GroupsController\],   providers:   \[GroupsService, GroupsRepository\],   exports:     \[GroupsService\],  // exported for use in PayoutsModule }) export class GroupsModule {} |

| \# src/modules/groups/groups.dto.ts |
| :---- |
| import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator' import type { ContributionFrequency } from '@zetu/shared'   export class CreateGroupDto {   @IsString()   name: string     @IsOptional()   @IsString()   description?: string     @IsNumber()   @Min(100)     // Minimum KES 100 contribution   @Max(1\_000\_000)   contributionAmount: number     @IsEnum(\['WEEKLY', 'BIWEEKLY', 'MONTHLY'\])   frequency: ContributionFrequency }   export class InviteMemberDto {   @IsString()   phone: string } |

| \# src/modules/groups/groups.repository.ts |
| :---- |
| import { Injectable } from '@nestjs/common' import { PrismaService } from '@/prisma/prisma.service' import { CreateGroupDto } from './groups.dto'   @Injectable() export class GroupsRepository {   constructor(private readonly prisma: PrismaService) {}     async create(adminId: string, dto: CreateGroupDto) {     return this.prisma.group.create({       data: {         ...dto,         members: {           create: { userId: adminId, role: 'ADMIN', status: 'ACTIVE' },         },       },       include: { members: true },     })   }     async findById(id: string) {     return this.prisma.group.findUnique({       where: { id },       include: {         members: { include: { user: { select: { id: true, displayName: true, phone: true } } } },       },     })   }     async findUserGroups(userId: string) {     return this.prisma.group.findMany({       where: { members: { some: { userId, status: 'ACTIVE' } } },       include: { \_count: { select: { members: true } } },     })   } } |

| \# src/modules/groups/groups.service.ts |
| :---- |
| import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common' import { GroupsRepository } from './groups.repository' import { CreateGroupDto } from './groups.dto'   @Injectable() export class GroupsService {   constructor(private readonly groupsRepository: GroupsRepository) {}     async create(adminId: string, dto: CreateGroupDto) {     return this.groupsRepository.create(adminId, dto)   }     async findById(id: string, requestingUserId: string) {     const group \= await this.groupsRepository.findById(id)     if (\!group) throw new NotFoundException('Group not found')       // Only group members can view group details     const isMember \= group.members.some(       (m) \=\> m.userId \=== requestingUserId && m.status \=== 'ACTIVE',     )     if (\!isMember) throw new ForbiddenException('You are not a member of this group')       return group   }     async getUserGroups(userId: string) {     return this.groupsRepository.findUserGroups(userId)   } } |

| \# src/modules/groups/groups.controller.ts |
| :---- |
| import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common' import { GroupsService } from './groups.service' import { CreateGroupDto } from './groups.dto' import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard'   @Controller('groups') @UseGuards(JwtAuthGuard)  // All routes in this controller require auth export class GroupsController {   constructor(private readonly groupsService: GroupsService) {}     @Post()   create(@Body() dto: CreateGroupDto, @Request() req: any) {     return this.groupsService.create(req.user.id, dto)   }     @Get()   findMyGroups(@Request() req: any) {     return this.groupsService.getUserGroups(req.user.id)   }     @Get(':id')   findOne(@Param('id') id: string, @Request() req: any) {     return this.groupsService.findById(id, req.user.id)   } } |

| SECTION 6 — Prisma Schema & Database Setup |
| :---- |

# **Prisma Schema & Database**

| 22 | Initialize Prisma and Write the Schema |
| :---: | :---- |

| \# From apps/api/ npx prisma init   \# Copy your DATABASE\_URL from .env.example into a local .env cp ../../.env.example .env \# Then edit .env to set your actual local PostgreSQL connection string |
| :---- |

Replace the contents of prisma/schema.prisma with the complete Zetu schema:

| \# prisma/schema.prisma |
| :---- |
| generator client {   provider \= "prisma-client-js" }   datasource db {   provider \= "postgresql"   url      \= env("DATABASE\_URL") }   // ── USER ──────────────────────────────────────────── model User {   id            String   @id @default(cuid())   phone         String   @unique   passwordHash  String   displayName   String?   mpesaNumber   String?   isVerified    Boolean  @default(false)   createdAt     DateTime @default(now())   updatedAt     DateTime @updatedAt     memberships   GroupMember\[\]   contributions Contribution\[\]   notifications Notification\[\]   otpCodes      OtpCode\[\]     @@index(\[phone\]) }   // ── OTP ───────────────────────────────────────────── model OtpCode {   id        String   @id @default(cuid())   userId    String   code      String   expiresAt DateTime   usedAt    DateTime?   createdAt DateTime @default(now())     user      User @relation(fields: \[userId\], references: \[id\], onDelete: Cascade) }   // ── GROUP ──────────────────────────────────────────── model Group {   id                 String                @id @default(cuid())   name               String   description        String?   contributionAmount Decimal               @db.Decimal(12, 2\)   frequency          ContributionFrequency   status             GroupStatus           @default(SETUP)   platformFeePercent Decimal               @db.Decimal(5, 4\) @default(0.02)   createdAt          DateTime              @default(now())   updatedAt          DateTime              @updatedAt     members            GroupMember\[\]   rotationSlots      RotationSlot\[\]   contributions      Contribution\[\]   payouts            Payout\[\] }   // ── GROUP MEMBER ───────────────────────────────────── model GroupMember {   id       String       @id @default(cuid())   userId   String   groupId  String   role     MemberRole   @default(MEMBER)   status   MemberStatus @default(PENDING)   joinedAt DateTime?     user     User  @relation(fields: \[userId\],  references: \[id\])   group    Group @relation(fields: \[groupId\], references: \[id\])     @@unique(\[userId, groupId\])   @@index(\[groupId\]) }   // ── ROTATION SLOT ──────────────────────────────────── model RotationSlot {   id          String     @id @default(cuid())   groupId     String   userId      String   slotOrder   Int   cycleNumber Int        @default(1)   status      SlotStatus @default(PENDING)     group       Group   @relation(fields: \[groupId\], references: \[id\])   payout      Payout?     @@unique(\[groupId, slotOrder, cycleNumber\]) }   // ── CONTRIBUTION ───────────────────────────────────── model Contribution {   id           String             @id @default(cuid())   groupId      String   userId       String   amount       Decimal            @db.Decimal(12, 2\)   status       ContributionStatus @default(PENDING)   mpesaRef     String?   dueDate      DateTime   paidAt       DateTime?   createdAt    DateTime           @default(now())     group        Group  @relation(fields: \[groupId\], references: \[id\])   user         User   @relation(fields: \[userId\],  references: \[id\])   transactions Transaction\[\]     @@index(\[groupId, status\])   @@index(\[userId, groupId\]) }   // ── PAYOUT ─────────────────────────────────────────── model Payout {   id             String       @id @default(cuid())   groupId        String   rotationSlotId String       @unique   amount         Decimal      @db.Decimal(12, 2\)   feeDeducted    Decimal      @db.Decimal(12, 2\)   netAmount      Decimal      @db.Decimal(12, 2\)   mpesaRef       String?   status         PayoutStatus @default(PENDING)   initiatedAt    DateTime     @default(now())   completedAt    DateTime?     group          Group        @relation(fields: \[groupId\],        references: \[id\])   rotationSlot   RotationSlot @relation(fields: \[rotationSlotId\], references: \[id\])   transactions   Transaction\[\] }   // ── TRANSACTION (Immutable Ledger) ─────────────────── model Transaction {   id             String          @id @default(cuid())   contributionId String?   payoutId       String?   type           TransactionType   amount         Decimal         @db.Decimal(12, 2\)   reference      String          @unique  // M-Pesa transaction code   metadata       Json?   createdAt      DateTime        @default(now())     contribution   Contribution? @relation(fields: \[contributionId\], references: \[id\])   payout         Payout?       @relation(fields: \[payoutId\],       references: \[id\])     // No updatedAt — transactions are immutable   @@index(\[reference\]) }   // ── NOTIFICATION ───────────────────────────────────── model Notification {   id        String             @id @default(cuid())   userId    String   type      NotificationType   channel   NotificationChannel   message   String   sentAt    DateTime?   createdAt DateTime           @default(now())     user      User @relation(fields: \[userId\], references: \[id\]) }   // ── ENUMS ──────────────────────────────────────────── enum ContributionFrequency  { WEEKLY BIWEEKLY MONTHLY } enum GroupStatus            { SETUP ACTIVE COMPLETED SUSPENDED } enum MemberRole             { ADMIN MEMBER } enum MemberStatus           { PENDING ACTIVE REMOVED } enum ContributionStatus     { PENDING PAID OVERDUE WAIVED } enum SlotStatus             { PENDING PAID } enum PayoutStatus           { PENDING PROCESSING COMPLETED FAILED } enum TransactionType        { CONTRIBUTION PAYOUT PLATFORM\_FEE REFUND } enum NotificationType       { CONTRIBUTION\_REMINDER CONTRIBUTION\_CONFIRMED PAYOUT\_RECEIVED OVERDUE\_ALERT } enum NotificationChannel    { SMS IN\_APP } |

| 23 | Run the First Migration |
| :---: | :---- |

With the schema written and the database running, generate the first migration. This creates the actual database tables.

| \# From apps/api/ — make sure PostgreSQL is running   \# Generate migration files AND apply them to the database npx prisma migrate dev \--name "init\_zetu\_schema"   \# This command: \# 1\. Compares schema.prisma to the current database state \# 2\. Generates SQL migration files in prisma/migrations/ \# 3\. Applies those migrations to your local database \# 4\. Regenerates the Prisma Client with the new types   \# Verify the tables were created npx prisma studio  \# Opens a visual database browser at localhost:5555 |
| :---- |

|    | Migration vs. Push npx prisma migrate dev creates versioned migration files — this is what you use for all environments where you need an audit trail of schema changes (which is always). npx prisma db push skips migrations and directly syncs the schema — only use this for rapid local prototyping, never in staging or production. |
| :---- | :---- |

| SECTION 7 — Installing Dependencies & First Run |
| :---- |

| 24 | Install All Dependencies from the Root |
| :---: | :---- |

| \# From the root zetu/ directory pnpm install   \# This installs dependencies for all workspace packages simultaneously \# and creates a single node\_modules at the root with symlinks |
| :---- |

| 25 | Add Dev Scripts to Root package.json |
| :---: | :---- |

Update the root package.json scripts so you can run the entire stack from one terminal:

| \# In the root package.json "scripts" section, add: "dev:web": "pnpm \--filter @zetu/web dev", "dev:api": "pnpm \--filter @zetu/api dev", "dev": "turbo run dev", "prisma:migrate": "pnpm \--filter @zetu/api exec prisma migrate dev", "prisma:studio": "pnpm \--filter @zetu/api exec prisma studio", "prisma:generate": "pnpm \--filter @zetu/api exec prisma generate" |
| :---- |

| 26 | Run the Development Servers |
| :---: | :---- |

| \# Option A — Run everything together with Turbo pnpm dev   \# Option B — Run frontend and backend in separate terminals \# Terminal 1: pnpm dev:api    \# NestJS starts on http://localhost:3000   \# Terminal 2: pnpm dev:web    \# Vue starts on http://localhost:5173   \# The Vite proxy forwards /api/\* calls to NestJS automatically \# so in Vue you call fetch('/api/groups') and it hits NestJS |
| :---- |

| 27 | First Commit & Push to GitHub |
| :---: | :---- |

| \# Back in the root zetu/ directory   \# Stage everything git add .   \# First commit — use conventional commit format git commit \-m "feat: initial Zetu monorepo scaffold (Vue 3 \+ NestJS \+ Prisma)"   \# Create the GitHub repo (do this on github.com first), then: git remote add origin https://github.com/YOUR\_USERNAME/zetu.git git branch \-M main git push \-u origin main |
| :---- |

|    | Before You Push Double-check that .env is NOT in your staged files. Run: git status and look for any .env files. If you see one, add it to .gitignore immediately and run: git rm \--cached .env. A secret committed to GitHub is a compromised secret — even if you delete it later, it exists in git history. |
| :---- | :---- |

| APPENDIX — Reference & Troubleshooting |
| :---- |

# **Appendix A — Recommended VS Code Extensions**

| Extension | Purpose |
| :---- | :---- |
| **Vue \- Official (Volar)** | Vue 3 language support, syntax highlighting, IntelliSense |
| **TypeScript Vue Plugin (Volar)** | TypeScript support inside .vue files |
| **Prisma** | Schema syntax highlighting and formatting |
| **ESLint** | Inline linting feedback |
| **Prettier** | Auto-format on save |
| **REST Client** | Test API endpoints directly from VS Code |
| **GitLens** | Enhanced git history and blame annotations |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind class names |
| **Thunder Client** | Lightweight Postman alternative inside VS Code |

# **Appendix B — Troubleshooting Common Issues**

| Issue | Solution |
| :---- | :---- |
| **pnpm: command not found** | Run: npm install \-g pnpm then close and reopen your terminal |
| **EACCES permission errors on pnpm global install** | Run: sudo npm install \-g pnpm or configure npm prefix |
| **DATABASE\_URL connection refused** | Make sure PostgreSQL is running. On Mac: brew services start postgresql. On Linux: sudo systemctl start postgresql |
| **Prisma migrate fails with authentication error** | Check DATABASE\_URL in your .env — username, password, and database name must all be correct |
| **Vue app shows blank page after routing** | Make sure Vue Router history mode requires server-side fallback configuration. In dev, Vite handles this automatically. |
| **@zetu/shared not resolving in Vue** | Check that the alias in vite.config.ts points to the correct path relative to apps/web/ |
| **NestJS won't start — port in use** | Kill the process using port 3000: lsof \-ti:3000 | xargs kill \-9 |
| **pnpm install fails in monorepo** | Delete all node\_modules and pnpm-lock.yaml, then run pnpm install from the root again |
| **Prisma client out of sync with schema** | Run: npx prisma generate to regenerate the client after schema changes |
| **CORS errors in browser** | Make sure FRONTEND\_URL in .env exactly matches the Vue dev server origin including port |

# **Appendix C — Useful Commands Reference**

| Command | What It Does |
| :---- | :---- |
| **pnpm install** | Install all workspace dependencies |
| **pnpm dev** | Start all apps in development mode via Turbo |
| **pnpm \--filter @zetu/api exec nest generate module X** | Generate a new NestJS module in the api app |
| **npx prisma migrate dev \--name X** | Create and apply a new database migration |
| **npx prisma studio** | Open visual database browser |
| **npx prisma generate** | Regenerate Prisma Client after schema change |
| **npx prisma migrate reset** | Reset database and re-run all migrations (dev only) |
| **git log \--oneline** | Show compact commit history |
| **pnpm run format** | Format all files with Prettier |
| **pnpm run lint** | Run ESLint across all packages |

*Sprint26  ·  Zetu Monorepo Setup Guide  ·  Vue 3 \+ NestJS \+ Prisma  ·  Developers Mania*