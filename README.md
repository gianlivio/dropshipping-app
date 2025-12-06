# Dropshipping App – Demo multi-ruolo

Applicazione demo costruita con:

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **NextAuth** per autenticazione
- **Prisma ORM**
- **PostgreSQL (Supabase)** come database
- Deploy su **Vercel**

L'obiettivo è mostrare:

- gestione utenti con **3 ruoli**
- flusso di invito Master → Basic
- marketplace base (prodotti, carrello, ordini)
- storefront pubblico per ogni Master

---

## 1. Ruoli utente

Sono definiti 3 ruoli nel modello `User`:

- `SUPER_ADMIN`
- `UTENTEMASTER`
- `UTENTEBASIC`

### Account demo (seed)

Nel seed sono creati questi utenti:

- **Admin**
  - Email: `admin@test.com`
  - Password: `admin123`
  - Ruolo: `SUPER_ADMIN`

- **Master**
  - Email: `master@test.com`
  - Password: `admin123`
  - Ruolo: `UTENTEMASTER`
  - Negozio di test: `Elettrica Shop` con slug `elettricashop`

- **Basic**
  - Email: `basic@test.com`
  - Password: `admin123`
  - Ruolo: `UTENTEBASIC`

---

## 2. Funzionalità principali

### 2.1 Autenticazione

- Login / Logout
- Registrazione:
  - standard (utente Basic generico)
  - tramite **link invito** creato dal Master (Basic associato a un Master specifico)
- Reset password:
  - pagina `Forgot Password`
  - generazione token e pagina `Reset Password`
  - per la demo, il link viene **loggato in console** lato server (non viene inviata email vera)

### 2.2 SUPER_ADMIN

Dopo il login come `admin@test.com`:

- Dashboard con panoramica semplice
- Pagina `Master` (`/dashboard/admin/masters`):
  - lista di tutti i Master registrati
  - info base sullo store (nome, slug, data creazione)

Questa parte è pensata come base per un futuro pannello admin più ricco
(statistiche globali, gestione ruoli, ecc.).

### 2.3 UTENTEMASTER (venditore)

Dopo il login come `master@test.com`:

- **Dashboard Master**
  - riepilogo ordini recenti
  - riepilogo prodotti
  - link rapidi
- **Prodotti** (`/dashboard/products`)
  - lista prodotti del Master
  - creazione nuovo prodotto
  - modifica prodotto
  - eliminazione prodotto
  - stato Attivo/Inattivo
- **Inviti** (`/dashboard/invites`)
  - creazione link invito per utenti Basic
  - mostra token e QR code
  - conto di quante volte è stato usato
- **Ordini** (`/dashboard/orders`)
  - lista ordini ricevuti dal Master
  - stato ordine (PENDING / PAID / ecc.)
  - dettagli prodotti acquistati

### 2.4 UTENTEBASIC (cliente)

Dopo il login come `basic@test.com` (o dopo registrazione via invito):

- **Dashboard Basic**
  - riepilogo carrello
  - ordini recenti
- **Carrello** (`/dashboard/cart`)
  - visualizza prodotti aggiunti da uno storefront
  - modifica quantità
  - rimozione prodotto
  - pulsante di checkout (demo)
- **Ordini** (`/dashboard/orders`)
  - lista ordini dell'utente
  - stato e totale

### 2.5 Storefront pubblico (vetrina Master)

Ogni Master ha un suo URL pubblico:

```txt
/s/[storeSlug]
Esempio:

/s/elettricashop

La pagina storefront mostra:

logo e nome negozio (se impostati)

descrizione

lista prodotti attivi con:

nome

immagine

prezzo

pulsante “Aggiungi al carrello”

Se l’utente non è loggato o non è Basic:

viene reindirizzato al login quando prova ad aggiungere al carrello.

3. Struttura del database (Prisma)

Il file prisma/schema.prisma contiene tutti i modelli:

User, Account, Session, VerificationToken (NextAuth)

Master – dati negozio + relazione con User

BasicProfile – profilo Basic + relazione con Master

InviteLink – link invito Master → Basic

Product – prodotti del Master

Cart e CartItem – carrello per Basic

Order e OrderItem – ordini effettuati

Le migration sono in prisma/migrations.

4. Setup locale
4.1 Requisiti

Node.js 20+

pnpm / npm

Database PostgreSQL (es. Supabase o Neon)

4.2 Variabili ambiente (.env.local)

Esempio:

DATABASE_URL="postgresql://..."
AUTH_SECRET="..."  # generato da `npx auth secret`
NEXT_PUBLIC_APP_URL="http://localhost:3000"

UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""


Per il deploy su Vercel, le stesse chiavi vanno inserite nella sezione Environment Variables del progetto:

DATABASE_URL

DIRECT_URL (se usi Supabase)

AUTH_SECRET

NEXTAUTH_URL

NEXT_PUBLIC_APP_URL

UPLOADTHING_SECRET (dummy se non usi upload reale)

UPLOADTHING_APP_ID (dummy)

4.3 Install, migrate, seed, run
# Install dipendenze
npm install

# Genera client Prisma
npx prisma generate

# Esegui migration
npx prisma migrate deploy
# oppure in dev:
# npx prisma migrate dev

# Seed database (crea utenti demo)
npm run seed

# Avvia app
npm run dev


App disponibile su:
http://localhost:3000

5. Deploy su Vercel

Repository su GitHub: gianlivio/dropshipping-app

Nuovo progetto su Vercel, import da GitHub

Imposta variabili ambiente come descritto sopra

Build:

npm run build

Start automatico: Next.js su Vercel