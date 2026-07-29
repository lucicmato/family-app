# CLAUDE.md

Trajni kontekst i pravila za ovaj projekt. Claude Code ovo čita na početku svake sesije.

## Što gradimo
Jednostavna aplikacija za zajedničke svakodnevne zadatke (taskove) za dva korisnika: mene i suprugu. Mora biti jednostavna za korištenje, laka za deploy i dostupna i na mobitelu (kao PWA) i u browseru. Jednostavnost je važnija od broja funkcionalnosti.

## Korisnici
- Točno dva korisnika (ja + supruga). Nema javne registracije.
- Oboje dijele iste taskove — podatke ne razdvajamo po korisniku, osim polja "tko je zadužen".

## Tech stack (odluke donesene — ne mijenjati bez dogovora)
- **Framework:** Next.js (App Router) + React + TypeScript
- **Package manager:** npm
- **Stiliziranje:** Tailwind CSS + shadcn/ui
- **Baza + auth + real-time:** Supabase (PostgreSQL, Auth, Realtime, Row Level Security)
- **Prijava:** magic link ili Google login (bez lozinki)
- **Mutacije:** Next.js Server Actions (izbjegavati zasebne API rute gdje god je moguće)
- **Deploy:** Vercel (auto-deploy s `main` grane)
- **Mobitel:** PWA (manifest + service worker, "Add to Home Screen")

## Struktura (ključne konvencije)
- Supabase klijenti: `lib/supabase/` (zaseban klijent za server i za browser).
- Server Actions: `app/actions/`.
- Dijeljene komponente: `components/`; shadcn/ui komponente: `components/ui/`.
- Ostalo prati standardni Next.js App Router raspored.

## Model podataka
Tablica `tasks`:
- `id`, `title`, `description` (opcionalno)
- `done` (boolean)
- `created_by`, `assigned_to` (opcionalno)
- `due_date` (opcionalno)
- `priority` (1 = visok, 2 = srednji, 3 = nizak; default 2)
- `created_at`, `updated_at`

Dijeljeni popis — oba korisnika vide i mijenjaju sve taskove. Real-time sync preko Supabase subscriptiona: kad jedan korisnik doda ili promijeni task, drugi ga vidi bez refresha.

## Environment varijable
Nazivi (vrijednosti nikad u git — idu u `.env.local` lokalno i u Vercel dashboard za produkciju):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (samo server, i to tek ako zatreba — nikad izložen klijentu)
- `ALLOWED_EMAILS` (samo server) — zarezom odvojena lista dopuštenih Google emailova; provjerava se u `app/auth/callback/route.ts` kao dodatna zaštita uz Supabase dashboard postavku "Allow new users to sign up"

## Konvencije koda
- TypeScript strict; izbjegavati `any`.
- Server Components po defaultu; `"use client"` samo gdje treba interaktivnost.
- Named exports (default export samo gdje Next.js to traži, npr. stranice).
- `async/await`, ne lanci `.then()`.
- Funkcije pisati kao arrow function expressione (`const f = () => {}`) svugdje gdje ima smisla; `function` deklaracije samo gdje su nužne (npr. Next.js stranice/layouti/route handleri koji traže named function export).
- Svaka mutacija (Server Action) vraća jasan rezultat i hvata greške; ne gutati greške tiho.
- Komentari i objašnjenja mogu biti na hrvatskom.

## UI/UX principi
- Mobile-first. Veliki tap targeti, čitljivo na malom ekranu.
- Dodavanje taska mora biti brzo — minimalan broj klikova.
- Jasno vizualno stanje: što je gotovo, što nije, tko je zadužen.
- Bez suvišnih ekrana i postavki; default je jednostavan.

## Sigurnost
- Row Level Security uključen na svim tablicama.
- Na klijentu se koristi samo `anon` ključ; `service_role` ostaje na serveru.
- Pristup podacima imaju samo prijavljena dva korisnika.

## Definicija gotovog
- `npm run build` i `npm run lint` prolaze bez grešaka.
- Feature ručno testiran u browseru (i, gdje ima smisla, na mobitelu).
- Za MVP nema formalnog test suitea — testove uvodimo kad logika naraste. Ne generirati testove bez dogovora.
- Prijaviti svaku naredbu koja se nije mogla pokrenuti.

## Pravila (pitati prije nego što se napravi)
- Ne mijenjati auth, deploy ili Supabase RLS konfiguraciju bez objašnjenja rizika.
- Ne dodavati nove dependencije bez pitanja.
- Ne raditi feature izvan roadmapa bez dogovora — MVP mora ostati jednostavan.
- Ne push-ati na `main` dok `build` ne prolazi.

## Git workflow
- Solo development: radim direktno na `main` grani.
- Mali, česti commitovi s jasnim porukama (može hrvatski).
- Deploy je rutina od prvog dana, ne završni korak.

## Roadmap
1. **MVP:** dodaj task, lista taskova, označi kao gotovo.
2. Rok (`due_date`) i tko je zadužen (`assigned_to`).
3. Real-time sync između oba korisnika.
4. PWA (instalacija na mobitel).
5. Kategorije (kuća, dućan, djeca…).
6. (Kasnije) push notifikacije za podsjetnike.

## Naredbe (potvrditi nakon inicijalizacije)
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
