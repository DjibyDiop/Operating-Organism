/**
 * test_sense.c
 * Automated test suite for sense-baremetal (Sensory Receptors -> United Bus transduction)
 */

#include "../include/sensory_receptors.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <string.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Sense-Baremetal Validation ===\n");
    united_bus_init();
    sense_init();

    printf("[Sense] Transducing keystroke (scancode=0x1E, unicode='a')...\n");
    sense_transduce_keystroke(0x1E, 'a');

    globule_t buf[4];
    int n = united_bus_absorb(ORGAN_CORTEX, buf, 4);
    assert(n == 1);
    assert(buf[0].type == GLOBULE_RED);
    assert(buf[0].source_organ == ORGAN_SENSORY);
    oo_stimulus_t* stim = (oo_stimulus_t*)buf[0].payload_addr;
    assert(stim->type == STIMULUS_TOUCH);
    assert(stim->raw_data[0] == 0x1E);
    assert(stim->raw_data[1] == 'a');

    printf("[Sense] Transducing timer heartbeat (tick=100)... \n");
    sense_transduce_timer(100);

    int n_timer = united_bus_absorb(ORGAN_CORTEX, buf, 4);
    assert(n_timer == 1);
    assert(buf[0].type == GLOBULE_YELLOW);
    assert(buf[0].source_organ == ORGAN_SENSORY);

    printf("=== [PASS] Sense-Baremetal Transduction & Sensory Reception verified ===\n");
    return 0;
}
