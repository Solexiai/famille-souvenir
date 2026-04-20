# Solexi.ai

Application front-end Vite + React + TypeScript connectee a Supabase.

## Demarrage local

1. Installer les dependances :

   ```bash
   npm install
   ```

2. Copier le fichier d'environnement :

   ```bash
   cp .env.example .env
   ```

3. Renseigner dans `.env` :

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

4. Lancer l'application :

   ```bash
   npm run dev
   ```

Le serveur Vite demarre sur `http://localhost:8080`.

## Verification

- Build production : `npm run build`
- Tests : `npm test`
