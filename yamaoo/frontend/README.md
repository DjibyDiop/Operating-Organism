# YamaOO Frontend

Interface cognitive de YamaOO (React + TypeScript + Vite), alignee avec le paradigme OO:

- pas des applications classiques;
- des modules OO natifs relies au tronc cognitif YAMA;
- une interface d'orchestration de capacites.

## Vision

Le frontend expose un arbre vivant:

- `YAMA Core` (tronc)
- `Home` (branche famille)
- `Education` (branche apprentissage)
- `Creator` (branche creation)
- `Care` (branche sante)

Chaque branche represente un module intelligent pilotable par IA, pas une app isolee.

## Routes principales

- `/` : OO Living Tree (hub)
- `/screen/yama` : noyau cognitif YAMA
- `/screen/home` : espace Home
- `/screen/education` : univers education
- `/screen/creator` : creator lab
- `/screen/care` : care grid

Compatibilite legacy:

- `/screen/keurgui` pointe encore vers Home.

## Contrat backend

Le frontend consomme notamment:

- `GET /api/home/state`
- `POST /api/home/guardian/toggle`
- `POST /api/home/mode-foyer`
- `POST /api/media/start`
- `POST /api/media/translate`
- `GET /api/cognitive/graph`

## Dev local

Depuis `yamaoo/frontend`:

```bash
npm install
npx vite --host 0.0.0.0 --port 5173
```

Commandes recommandees:

```bash
npm run dev:host
npm run preview:host
```

Frontend:

- `http://localhost:5173/`
- `http://localhost:4173/` pour le preview build stable

Le backend doit etre actif sur:

- `http://localhost:8080/`

## Build

```bash
npm run build
```

## Direction produit (OO native)

Le frontend est une surface de controle du runtime OO. Les futures evolutions doivent privilegier:

- des modules declares par capacites;
- des flux cognitifs (events, memoire, contexte);
- l'orchestration par intention (YAMA) plutot que par menu d'applications.

## OO Web Cortex (cap cible)

Le navigateur YamaOO ne doit pas etre un clone Chrome. Phase initiale recommandee:

- fetch web;
- extraction semantique;
- resume IA;
- liaison au contexte du projet OO.

En UI, cela se traduit par des panneaux intelligents (insights, sources, actions), pas par un rendu HTML complet en priorite 1.
