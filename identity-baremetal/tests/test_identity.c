/**
 * test_identity.c
 * Automated test for Identity Baremetal (TPM, DNA Signatures & Thymus Self Recognition)
 */

#include "../include/dna_hash.h"
#include "../../united-baremetal/include/united_bus.h"
#include <stdio.h>
#include <assert.h>
#include <string.h>

void oo_print(const char* msg) {
    printf("%s", msg);
}

int main(void) {
    printf("=== Running Identity-Baremetal Validation ===\n");
    united_bus_init();
    identity_init();

    assert(identity_get_trusted_count() == 0);
    assert(identity_verify_genome_integrity() == 1);

    const char* self_code = "OO_KERNEL_V1_VERIFIED_SIGNATURE";
    const char* virus_code = "MALICIOUS_FOREIGN_PAYLOAD";

    oo_dna_signature_t sig_self, sig_virus;
    identity_calculate_dna(self_code, strlen(self_code), &sig_self);
    identity_calculate_dna(virus_code, strlen(virus_code), &sig_virus);

    // Initially neither is self
    assert(identity_is_self(&sig_self) == 0);

    // Trust self_code signature
    identity_trust_dna(&sig_self);
    assert(identity_get_trusted_count() == 1);
    assert(identity_verify_genome_integrity() == 1);

    // Now self should be recognized, virus rejected
    assert(identity_is_self(&sig_self) == 1);
    assert(identity_is_self(&sig_virus) == 0);

    printf("=== [PASS] Identity-Baremetal DNA Hash & Thymus verified ===\n");
    return 0;
}
