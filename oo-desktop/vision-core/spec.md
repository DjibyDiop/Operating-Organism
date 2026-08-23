# OO-Vision Core — Spécification initiale

But
- Fournir une API minimale et portable pour décrire les primitives graphiques d'`oo-desktop` (Surface, Layer, Scene, Event, Compositor, Renderer).

Primitives
- `Surface` : zone dessinable, identifiable et composable.
- `Layer` : collection de surfaces avec z-order et propriétés d'opacité.
- `Scene` : arbre de `Layer` et `Surface` organisé pour le hit-testing.
- `Event` : entrée (souris, touche, touch), routage et propagation.
- `Compositor` : logique d'assemblage final des surfaces en framebuffers.
- `Renderer trait` : abstraction pour backend (Software, Host GPU, LVGL/Slint adapter).

Contraintes initiales
- Démarrer avec une implémentation Host (std + wgpu possible) pour prototypage rapide.
- Maintenir une abstraction qui permettra plus tard un port `no_std` + alloc pour UEFI/bare-metal.
- Fournir des stubs testables et une example host pour valider l'API.

Roadmap courte
1. API minimale (ce document).
2. Crate `oo-vision-core` — trait `OORenderer` + stubs.
3. Example host qui utilise `SoftwareRenderer`.
4. Adapter un backend wgpu (optionnel, expérimental).
5. Explorer `LVGL`/`Slint` pour bare-metal ou widget toolkit.
