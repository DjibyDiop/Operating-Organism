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

typedef struct {
    uint64_t stack_position;
    uint64_t heap_base;
    uint64_t heap_limit;
    uint64_t tsc_elapsed;
    int integrity_ok;
} proprioception_state_t;

void proprioception_get_state(proprioception_state_t* state);

#endif // OO_PROPRIOCEPTION_H
