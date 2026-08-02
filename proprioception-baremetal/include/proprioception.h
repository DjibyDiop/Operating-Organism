#ifndef OO_PROPRIOCEPTION_H
#define OO_PROPRIOCEPTION_H

#include <stdint.h>

/// Initialise la conscience corporelle
void proprioception_init(void);

/// Vérifie l'intégrité de la posture de l'organisme
/// Scanne les piles et les zones mémoires critiques
void proprioception_check_posture(void);

/// Retourne 1 si la posture est stable (équilibre OK), 0 si anomalie
int proprioception_is_balanced(void);

#endif // OO_PROPRIOCEPTION_H
