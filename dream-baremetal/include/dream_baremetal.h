#ifndef ACB8DCA7_0F84_4449_9E21_01F322DED0CB
#define ACB8DCA7_0F84_4449_9E21_01F322DED0CB
#ifndef DREAM_BAREMETAL_H
#define DREAM_BAREMETAL_H

#ifdef __cplusplus
extern "C" {
#endif

// Main loop for the dream organ runtime.
void dream_baremetal_loop(void);

// Phase 6: Dream Mode (Idle-Time Learning) & Memory Consolidation
void trigger_diop_sleep_learning(void);
unsigned int dream_get_sleep_cycles(void);
unsigned int dream_get_consolidated_count(void);

#ifdef __cplusplus
}
#endif

#endif // DREAM_BAREMETAL_H


#endif /* ACB8DCA7_0F84_4449_9E21_01F322DED0CB */
