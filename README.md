# Banco do Rversutti

App de finanças pessoais com Next.js (App Router) + Firebase (Firestore + Google Auth).
Cada usuário enxerga apenas seus próprios registros.

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS (com tema claro/escuro)
- Firebase Web SDK — Firestore + Authentication (Google)

## Estrutura do Firestore

```
/incomes/{incomeId}      → { userId, name, amount, receivedAt, isRecurring, ... }
/expenses/{expenseId}    → { userId, name, amount, categoryId, categoryName, spentAt, paymentMethod, isRecurring, notes, ... }
/categories/{categoryId} → { userId, name, slug, ... }
```

Todo documento carrega o campo `userId` (== `request.auth.uid`).

## Estrutura do projeto

```
src/
  app/
    page.tsx                Dashboard (totais e saldo do mês)
    login/page.tsx          Tela de login com Google
    incomes/page.tsx        CRUD de receitas + filtro por mês
    expenses/page.tsx       CRUD de despesas + filtros
    categories/page.tsx     CRUD de categorias
    layout.tsx              Providers (tema, auth) + shell
    globals.css
  components/
    AppShell.tsx            Esconde a nav fora da área autenticada
    AuthProvider.tsx        Estado de auth + redirecionamento
    ThemeProvider.tsx       Tema claro/escuro
    Navigation.tsx, MonthFilter.tsx, Icons.tsx, GoogleIcon.tsx
  lib/
    firebase.ts             Inicialização (db + auth)
  services/
    session.ts              requireUserId() — fonte única do uid atual
    auth.service.ts         signInWithGoogle, signOut, watchAuth
    incomes.service.ts      Filtra/injeta userId
    expenses.service.ts     Filtra/injeta userId
    categories.service.ts   Filtra/injeta userId
    summary.service.ts      Orquestra totais/saldo
  types/
    income.ts, expense.ts, category.ts
  utils/
    date.ts, format.ts
firestore.rules             Regras de segurança (cole no console)
```

## Setup

1. Instale dependências:

```bash
npm install
```

2. No [Firebase Console](https://console.firebase.google.com):
   - Crie o projeto e adicione um app **Web**
   - Habilite **Firestore Database**
   - Habilite **Authentication → Sign-in method → Google**
   - Em **Authentication → Settings → Authorized domains**, mantenha `localhost` (já vem) e adicione o domínio de produção quando publicar

3. Copie `.env.local.example` para `.env.local` e preencha com a config do app Web.

4. Cole as regras de segurança (próxima seção) no console.

5. Rode:

```bash
npm run dev
```

A primeira tela é `/login`. Após autenticar, vai para o dashboard.

## Segurança — regras do Firestore

O arquivo `firestore.rules` impõe que **toda leitura e escrita só funciona para documentos onde `userId == request.auth.uid`**, e que ninguém consegue criar um documento atribuído a outro usuário ou trocar o dono de um doc existente.

Para aplicar:

1. Firebase Console → **Firestore Database → Regras**
2. Cole o conteúdo de `firestore.rules`
3. Publicar

Sem essas regras, mesmo com filtro no client, qualquer pessoa autenticada poderia ler dados de outros usuários direto via SDK.

## Índices compostos necessários

Como toda query agora filtra por `userId`, o Firestore exige índices compostos:

| Coleção | Campos |
|---|---|
| `incomes` | `userId asc, receivedAt desc` |
| `expenses` | `userId asc, spentAt desc` |
| `expenses` | `userId asc, categoryId asc, spentAt desc` (se usar filtro por categoria + mês) |
| `categories` | `userId asc, name asc` |

Na primeira vez que cada query rodar, o Firestore lança um erro com um **link direto** para criar o índice — clique e confirme. Em poucos segundos a query passa a funcionar.

## Como evoluir

- A camada `services/` é o único ponto que importa `firebase/firestore`. `requireUserId()` em `session.ts` é a fonte única do uid atual.
- Para gráficos ou exportações, crie novos métodos em `summary.service.ts`.
- Para um modo somente-leitura ou compartilhar dados entre usuários, ajuste tanto as queries quanto as regras em `firestore.rules`.
