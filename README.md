# Site perso de Lenny — Hub multi-apps

Site personnel qui regroupe plusieurs apps. La première : **Muscu**, un suivi de musculation basé sur le programme Arnold Split x PPL (4 séances/semaine).

## Fonctionnalités de l'app Muscu

- **Séance du jour** détectée automatiquement (lundi = Pecs/Épaules/Triceps, mardi = Dos/Biceps, mercredi = Run, jeudi = Jambes, samedi = Épaules/Bras).
- Saisie des **kg et reps par série**, validation série par série puis de la séance.
- **Dernière perf** affichée sur chaque exo (et poids pré-rempli).
- Pour chaque exo : **photo + équivalent en machine guidée disponible à Fitness Park** (photo + comment la trouver). Images libres de droits ([free-exercise-db](https://github.com/yuhonas/free-exercise-db), domaine public).
- **Programme** modifiable (séries, reps, ajout/suppression d'exos).
- **Historique** des séances validées.
- **Progression** : graphique du poids max par exercice.

## Stack

- `client/` — React 18 + Vite + TypeScript, Tailwind CSS v4, React Router, Recharts.
- `server/` — Node.js + Express 5 + Mongoose 9.
- Base : **MongoDB** (`mongodb://localhost:27017/site_lenny`), consultable avec MongoDB Compass.

## Lancer en local

Prérequis : Node ≥ 20 et MongoDB qui tourne en local (`brew services start mongodb-community`).

```bash
# 1. Installer les dépendances
cd server && npm install
cd ../client && npm install

# 2. Remplir la base (programme + catalogue d'exos) — à refaire si tu veux réinitialiser le programme
cd ../server && npm run seed

# 3. Lancer l'API (terminal 1)
cd server && npm run dev        # http://localhost:3001

# 4. Lancer le site (terminal 2)
cd client && npm run dev        # http://localhost:5173
```

Le client proxy les appels `/api` vers le port 3001 (voir `client/vite.config.ts`).

> ⚠️ `npm run seed` écrase les collections `exercises` et `programs` mais **ne touche jamais aux séances enregistrées** (`workoutsessions`).

## Structure

```
client/src/pages/Home.tsx        # portail d'accueil (tuiles d'apps)
client/src/apps/muscu/           # app Muscu (Séance, Programme, Historique, Progression)
client/public/exercises/         # photos des exos et machines
server/src/models/               # Exercise, Program, WorkoutSession
server/src/routes/               # /api/exercises, /api/program, /api/sessions
server/seed/seed.ts              # programme + équivalences machines Fitness Park
docs/DEPLOY_VPS.md               # guide de déploiement sur le VPS
```

## Déploiement

Voir [docs/DEPLOY_VPS.md](docs/DEPLOY_VPS.md).
