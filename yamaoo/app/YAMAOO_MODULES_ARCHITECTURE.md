# YamaOO Native Modules Architecture

## Objectif

Adapter YamaOO au paradigme OO bare-metal:

- remplacer la logique "apps classiques" par des modules OO natifs;
- conserver une ergonomie simple (`/yamaoo/apps` possible en facade);
- faire de YAMA l'orchestrateur cognitif des capacites.

## Principe cle

Question structurante:

- pas "quelle app lancer ?"
- mais "quelle capacite activer ?"

## Nomenclature recommandee

Deux options coherentes:

- YRM: Yama Runtime Modules
- ONM: OO Native Modules

Recommendation: utiliser `YRM` dans YamaOO et mapper vers `ONM` dans l'ecosysteme OO global.

## Contrat d'un module

Chaque module expose 4 blocs minimum.

### 1. Identity

```json
{
  "name": "home",
  "type": "service-module",
  "version": "0.1.0"
}
```

### 2. Capabilities

```json
[
  "family_state_read",
  "guardian_policy_apply",
  "routine_schedule"
]
```

### 3. Execution mode

Valeurs typiques:

- `native`
- `isolated`
- `privileged`
- `realtime`

### 4. IA hooks

Hooks DIOP/YAMA:

- observation (`observe`)
- optimisation (`optimize`)
- orchestration (`control`)

## Mapping YamaOO actuel -> modules

- YAMA Core -> `yrm.cortex`
- Home -> `yrm.home`
- Education -> `yrm.education`
- Creator -> `yrm.creator`
- Care -> `yrm.care`
- Media IA -> `yrm.media`
- Cognitive graph -> `yrm.graph`

## Structure cible (incrementale)

```text
yamaoo/
  modules/
    manifests/
    home/
    education/
    creator/
    care/
    media/
  runtime/
  cortex/
  render/
  memory/
  ai/
```

## OO Web Cortex (module web natif)

Ne pas viser un navigateur complet en phase 1.

### Phase 1: oo-web worker

Capacites:

- `web.fetch`
- `web.extract`
- `web.summarize`
- `web.store_memory`

### Phase 2: visualisation intelligente

- cartes de contenu
- panneaux sources
- liens contextuels avec projets OO

### Phase 3+: interaction et moteur avance

- documents interactifs
- rendu plus riche
- runtime JS/CSS cible long terme si besoin

## API minimale conseillee

- `POST /api/modules/activate`
- `POST /api/modules/deactivate`
- `GET /api/modules/state`
- `POST /api/cortex/intent`
- `POST /api/web/query`

## Exemple d'activation par intention

Intention:

"trouve comment optimiser mon framebuffer"

Pipeline attendu:

1. `yrm.web` collecte sources techniques
2. `yrm.web` extrait points critiques
3. `yrm.cortex` relie au contexte projet
4. `yrm.creator` ou `yrm.home` propose action/preset
5. resultat stocke dans `memory`

## Decision strategique

Conserver `yamaoo/apps` comme facade UX est acceptable, a condition que:

- l'implementation interne soit `YRM/ONM`;
- les interactions soient basees sur capacites;
- YAMA pilote les modules par intention.

## Definition de done (v1)

- manifests modules en place
- registre runtime des modules actif
- activation/desactivation via API
- graph cognitif connecte aux modules
- premier `oo-web` operationnel (fetch + extract + summarize)
