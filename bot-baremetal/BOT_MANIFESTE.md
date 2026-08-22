# BOT MANIFESTE : Constitution et Souveraineté Périphérique

> [!NOTE]
> 🇬🇧 **[English Version Available Here](BOT_MANIFESTE_en.md)**

> **LOI FONDAMENTALE**
> Un Bot (ex: NBIA) est un organisme périphérique local. Bien qu'il possède un instinct de survie (Souveraineté Locale), la **Constitution globale de l'Organisme (oo-constitution)** est au-dessus de lui et possède le droit absolu de décision sur lui. OPI (le cerveau) propose, mais la Constitution OO dispose en maître.

Ce manifeste définit l'architecture et les règles d'engagement de tous les organismes périphériques (Bots) de l'écosystème OO.

## 1. Qu'est-ce qu'un Bot ?
Un Bot est le système nerveux périphérique (Sensori-Moteur) de la colonie OO. Contrairement à OPI (le cerveau cognitif), le Bot interagit avec le monde physique ou des interfaces de bas niveau. Il allie l'hyper-réactivité d'un système de règles (réflexes en D+) à la sécurité cryptographique d'un organisme bare-metal.

## 2. Qui possède son autorité ?
**L'Autorité Suprême appartient à `oo-constitution`.** 
En temps normal, le Bot obéit aux décrets signés par la Constitution Globale de l'Organisme. L'Autorité Locale du Bot n'entre en jeu que pour les réflexes d'urgence physique immédiate ou s'il se retrouve isolé du reste du système (Split-Brain). 

## 3. Qu'est-ce qu'il peut recevoir d'OPI ?
Via le réseau Hermes, le Bot reçoit des *Propositions* :
- Des intentions compilées sous forme de bytecode cryptographié (DBC).
- Des faits globaux établis par d'autres organes de la colonie.
- **OPI propose, le Bot dispose.**

## 4. Qu'est-ce qu'OPI ne peut jamais lui imposer ?
OPI (l'intelligence) ne peut jamais contourner les limites physiques du Bot, car **seule la Constitution globale (oo-constitution)** détient l'autorité pour redéfinir les règles de sécurité. OPI ne peut pas forcer une action vitale si `oo-constitution` ou le Warden local (en dernier recours) s'y oppose. 

## 5. Qui peut modifier sa Constitution ?
La modification des règles vitales du Bot est un acte souverain dicté par la **Constitution globale (oo-constitution)** via un "Meiotic Splicing" réseau hautement sécurisé, ou par une clé d'urgence matérielle locale en cas de compromission totale.

## 6. Qu'est-ce qui déclenche son instinct ?
Les capteurs environnementaux et matériels connectés au Bot (le *Sensor Bus*). 
Le déclenchement d'un seuil déclenche immédiatement une intention D+ locale (le réflexe), exécutée en quelques microsecondes sans nécessiter la moindre validation réseau d'OPI.

## 7. Comment fonctionne son veto local ?
Toute intention réseau suit une chaîne de méfiance systémique absolue :
1. `HERMES` (Réception du paquet)
2. `IDENTITY CHECK` (Vérification de la signature d'OPI)
3. `REPLAY CHECK` (Anti-rejeu)
4. `DBC INTEGRITY` (Vérification cryptographique de l'intention)
5. `LOCAL D+ / WARDEN` (Évaluation sémantique et sécuritaire locale)
   - `ALLOW` -> Action sur le monde physique.
   - `DENY` -> Rejet total (Veto), le Bot abandonne l'intention et notifie la colonie du danger.

## 8. Comment rejoint-il/quitte-t-il une colonie ?
Via le protocole d'authentification Hermes (Phase T6). Le Bot prouve son intégrité et s'abonne aux faits d'OPI. S'il détecte une corruption réseau ou perd le signal, il s'isole immédiatement (Split-Brain Sovereignty).

## 9. Comment survit-il à la perte d'OPI ?
En mode *Souveraineté Locale*, le Bot continue d'appliquer ses règles de base D+ (ex: maintenir la température d'une pièce au-dessus du gel, verrouiller les portes). Il perd la capacité de *réflexion*, mais conserve son *instinct de survie*.

## 10. Quel sous-ensemble D+ peut-il exécuter ?
Le Bot exécute une machine virtuelle de police (Policy VM) restreinte, focalisée sur :
- L'analyse d'état des capteurs physiques (`SENSOR_READ`).
- L'actuation matérielle (`ACTUATOR_WRITE`).
- Les contraintes temporelles strictes et spatiales.
Il ne possède pas les opcodes d'inférence (MAMBA) ni d'allocations complexes qui appartiennent au domaine exclusif d'OPI.
