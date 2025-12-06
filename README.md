# Livio App – Multi-tenant E-commerce (Demo)

## 1. Cos'è questo progetto

È una piattaforma e-commerce multi-tenant con tre ruoli:

- **SUPER_ADMIN** → amministratore globale (struttura pronta, funzioni avanzate da aggiungere)
- **UTENTEMASTER** → gestisce un negozio (prodotti, inviti clienti, storefront)
- **UTENTEBASIC** → cliente finale del negozio (carrello, ordini)

Ogni Master ha il suo “negozio” con:

- catalogo prodotti
- vetrina pubblica dedicata: `/s/[storeSlug]`
- clienti collegati tramite link di invito (o QR code)

Ogni cliente Basic:

- viene creato tramite invito di un Master
- è collegato a un solo negozio
- può sfogliare i prodotti, usare il carrello e creare ordini (pagamento simulato).

---

## 2. Stack Tecnico

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma ORM 5
- PostgreSQL (Neon – compatibile Supabase)
- NextAuth v5 (Auth.js) con Prisma Adapter
- Tailwind CSS

Variabili d'ambiente (NON sono nel repo, solo in locale):

```env
DATABASE_URL=...
AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
