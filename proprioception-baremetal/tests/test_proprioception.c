/**
 * test_proprioception.c
 * Automated test for Proprioception Baremetal (Body Posture & Stack/Heap Integrity)
 */

#include "../include/proprioception.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Proprioception-Baremetal Validation ===\n");
    united_bus_init();
    proprioception_init();

    proprioception_check_posture();
    assert(proprioception_is_balanced() == 1);

    printf("=== [PASS] Proprioception-Baremetal posture & balance verified ===\n");
    return 0;
}
