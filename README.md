# Banco do Rversutti

App pessoal de finanças com Next.js (App Router) + Firebase Cloud Firestore.
Sem autenticação, sem login, sem multiusuário — uso individual.

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Firebase Web SDK (Firestore)

## Estrutura do Firestore

```
/incomes/{incomeId}
/expenses/{expenseId}
/categories/{categoryId}
```

## Estrutura do projeto

```
src/
  app/                    Páginas (App Router)
    page.tsx              Dashboard (totais e saldo do mês)
    incomes/page.tsx      CRUD de receitas + filtro por mês
    expenses/page.tsx     CRUD de despesas + filtros
    categories/page.tsx   CRUD de categorias
    layout.tsx
    globals.css
  components/
    Navigation.tsx
    MonthFilter.tsx
  lib/
    firebase.ts           Inicialização do Firebase
  services/               Camada que isola o Firestore
    incomes.service.ts
    expenses.service.ts
    categories.service.ts
    summary.service.ts    Orquestra totais/saldo
  types/
    income.ts
    expense.ts
    category.ts
  utils/
    date.ts               Range de mês, parse/format de data
    format.ts             Currency, slug, formato de data
```

## Setup

1. Instale as dependências:

```bash
npm install
```

2. Crie um projeto no [Firebase Console](https://console.firebase.google.com), habilite o Cloud Firestore e copie as credenciais Web.

3. Copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

4. Rode em desenvolvimento:

```bash
npm run dev
```

## Regras do Firestore

Como é um app de uso pessoal sem autenticação, restrinja o acesso por rede/IP no console
ou rode em ambiente protegido. Se for publicar, considere bloquear leituras/escritas
externas via regras antes de subir para produção.

## Como evoluir

- A camada `services/` é o único ponto que importa `firebase/firestore`. Para trocar o
  banco ou adicionar cache, mude apenas ali.
- Tipos em `types/` são compartilhados entre serviços e UI.
- Para gráficos ou exportações, crie novos métodos em `summary.service.ts`.
- Para autenticação multiusuário no futuro, adicione `userId` aos documentos e filtre
  nas queries dos serviços.

## Índices necessários

As queries de `listIncomesByMonth` e `listExpensesByMonth` usam `where` em range +
`orderBy` no mesmo campo, então não precisam de índices compostos. Já a função
`listExpensesByCategory` filtrada por mês exige um índice composto em
`(categoryId asc, spentAt desc)` — o Firestore mostra o link de criação na primeira vez
que a query rodar.
