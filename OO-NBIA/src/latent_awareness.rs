// Phenomenon Types (matching phenomenon_layer.h)
pub const PHENOMENON_DRIFT: u16 = 1;
pub const PHENOMENON_EMERGENCE: u16 = 2;
pub const PHENOMENON_PHASE_CHANGE: u16 = 3;
pub const PHENOMENON_CONVERGENCE: u16 = 4;
pub const PHENOMENON_TOPOLOGY_MAP: u16 = 0x54;
pub const PHENOMENON_CAUSAL_TRACE: u16 = 0x43;

// Perception IDs
pub const PERCEPTION_ORGANISM_AWARENESS: u32 = 35253223; // FNV-1a of "ORGANISM_AWARENESS"
pub const PERCEPTION_OPI_HEARTBEAT: u32 = 0x0F1_0001;
pub const PERCEPTION_OPI_INFERENCE: u32 = 0x0F1_0002;
pub const PERCEPTION_HERMES_TRAFFIC: u32 = 0x0F1_0003;
pub const PERCEPTION_MEMORY_FRAG: u32 = 0x0F1_0004;

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct OOPhenomenon {
    pub p_type: u16,
    pub source: u16,
    pub confidence: u8,
    pub flags: u8,
    pub evidence_id: u32,
}

impl Default for OOPhenomenon {
    fn default() -> Self {
        Self {
            p_type: 0,
            source: 0,
            confidence: 0,
            flags: 0,
            evidence_id: 0,
        }
    }
}

pub struct LatentAwarenessEngine {
    // Real state metrics (normalized 0.0 - 100.0)
    pub real_awareness: f32,
    pub real_opi_heartbeat: bool,
    pub real_opi_inference: u32,
    pub real_hermes_traffic: f32,
    pub real_memory_frag: f32,

    // Shadow state representation (What NBIA thinks the organism is becoming)
    pub shadow_awareness: f32,
    pub shadow_hermes_traffic: f32,
    pub shadow_memory_frag: f32,
    pub last_drift: f32,

    // Temporal timing
    pub ms_since_last_heartbeat: u32,
    pub ms_accumulator_1s: u32,
    pub heartbeat_isolation_emitted: bool,

    // History (60 samples, 1 sample per second)
    pub history_memory_frag: [f32; 60],
    pub history_hermes_traffic: [f32; 60],
    pub history_count: usize,
    pub history_head: usize,

    // Phenomenon circular queue
    pub phenomena_queue: [OOPhenomenon; 32],
    pub phenomena_head: usize,
    pub phenomena_tail: usize,
    pub phenomena_len: usize,

    // State tracking
    pub was_in_drift: bool,
}

impl LatentAwarenessEngine {
    pub const fn new() -> Self {
        Self {
            real_awareness: 10.0,
            real_opi_heartbeat: true,
            real_opi_inference: 1,
            real_hermes_traffic: 15.0,
            real_memory_frag: 5.0,

            shadow_awareness: 10.0,
            shadow_hermes_traffic: 15.0,
            shadow_memory_frag: 5.0,
            last_drift: 0.0,

            ms_since_last_heartbeat: 0,
            ms_accumulator_1s: 0,
            heartbeat_isolation_emitted: false,

            history_memory_frag: [0.0; 60],
            history_hermes_traffic: [0.0; 60],
            history_count: 0,
            history_head: 0,

            phenomena_queue: [OOPhenomenon {
                p_type: 0,
                source: 0,
                confidence: 0,
                flags: 0,
                evidence_id: 0,
            }; 32],
            phenomena_head: 0,
            phenomena_tail: 0,
            phenomena_len: 0,

            was_in_drift: false,
        }
    }

    pub fn push_phenomenon(&mut self, phenom: OOPhenomenon) {
        if self.phenomena_len < 32 {
            self.phenomena_queue[self.phenomena_tail] = phenom;
            self.phenomena_tail = (self.phenomena_tail + 1) % 32;
            self.phenomena_len += 1;
        } else {
            // Drop oldest on overflow
            self.phenomena_queue[self.phenomena_tail] = phenom;
            self.phenomena_tail = (self.phenomena_tail + 1) % 32;
            self.phenomena_head = (self.phenomena_head + 1) % 32;
        }
    }

    pub fn pop_phenomena(&mut self, buffer: &mut [OOPhenomenon]) -> usize {
        let count = buffer.len().min(self.phenomena_len);
        for item in buffer.iter_mut().take(count) {
            *item = self.phenomena_queue[self.phenomena_head];
            self.phenomena_head = (self.phenomena_head + 1) % 32;
            self.phenomena_len -= 1;
        }
        count
    }

    pub fn ingest_perception(&mut self, perception_id: u32, value: u32) {
        match perception_id {
            PERCEPTION_ORGANISM_AWARENESS => {
                self.real_awareness = value as f32;
            }
            PERCEPTION_OPI_HEARTBEAT => {
                self.real_opi_heartbeat = value != 0;
                self.ms_since_last_heartbeat = 0;
                self.heartbeat_isolation_emitted = false;
            }
            PERCEPTION_OPI_INFERENCE => {
                self.real_opi_inference = value;
            }
            PERCEPTION_HERMES_TRAFFIC => {
                self.real_hermes_traffic = value as f32;
            }
            PERCEPTION_MEMORY_FRAG => {
                self.real_memory_frag = value as f32;
            }
            _ => {
                self.real_awareness = value as f32;
            }
        }
    }

    pub fn advance_time(&mut self, delta_ms: u32) {
        self.ms_since_last_heartbeat = self.ms_since_last_heartbeat.saturating_add(delta_ms);
        self.ms_accumulator_1s = self.ms_accumulator_1s.saturating_add(delta_ms);

        // 1. Negative Event Detection: Absence of OPI Heartbeat for >= 3000ms
        if self.ms_since_last_heartbeat >= 3000 && !self.heartbeat_isolation_emitted {
            self.heartbeat_isolation_emitted = true;
            self.push_phenomenon(OOPhenomenon {
                p_type: PHENOMENON_PHASE_CHANGE,
                source: 0x4E42, // 'NB'
                confidence: 95,
                flags: 1, // Alert flag
                evidence_id: 0x0F1_150, // "OPI_ISOLATION"
            });
        }

        // 2. Periodic Metabolism & Integration (every 1s / 1000ms)
        if self.ms_accumulator_1s >= 1000 {
            self.ms_accumulator_1s -= 1000;
            self.tick_metabolism_1s();
        }
    }

    fn tick_metabolism_1s(&mut self) {
        self.history_memory_frag[self.history_head] = self.real_memory_frag;
        self.history_hermes_traffic[self.history_head] = self.real_hermes_traffic;
        self.history_head = (self.history_head + 1) % 60;
        if self.history_count < 60 {
            self.history_count += 1;
        }

        let alpha = 0.20_f32;
        self.shadow_awareness = self.shadow_awareness * (1.0 - alpha) + self.real_awareness * alpha;
        self.shadow_hermes_traffic = self.shadow_hermes_traffic * (1.0 - alpha) + self.real_hermes_traffic * alpha;
        self.shadow_memory_frag = self.shadow_memory_frag * (1.0 - alpha) + self.real_memory_frag * alpha;

        let diff_awareness = self.shadow_awareness - self.real_awareness;
        let diff_traffic = self.shadow_hermes_traffic - self.real_hermes_traffic;
        let diff_frag = self.shadow_memory_frag - self.real_memory_frag;

        let dist_sq = (diff_awareness * diff_awareness) + (diff_traffic * diff_traffic) + (diff_frag * diff_frag);
        self.last_drift = dist_sq / 100.0;

        if self.last_drift > 0.70 {
            self.was_in_drift = true;
            let conf = ((self.last_drift * 10.0).min(99.0)) as u8;
            self.push_phenomenon(OOPhenomenon {
                p_type: PHENOMENON_DRIFT,
                source: 0x4E42,
                confidence: conf.max(70),
                flags: 0,
                evidence_id: (self.last_drift * 100.0) as u32,
            });
        } else if self.was_in_drift && self.last_drift < 0.20 {
            self.was_in_drift = false;
            self.push_phenomenon(OOPhenomenon {
                p_type: PHENOMENON_CONVERGENCE,
                source: 0x4E42,
                confidence: 90,
                flags: 0,
                evidence_id: 1,
            });
        }

        if self.history_count >= 5 {
            let frag_increasing = self.is_frag_increasing();
            let traffic_erratic = self.is_traffic_erratic();
            let inference_stalled = self.real_opi_inference == 0;

            if frag_increasing && traffic_erratic && inference_stalled {
                self.push_phenomenon(OOPhenomenon {
                    p_type: PHENOMENON_EMERGENCE,
                    source: 0x4E42,
                    confidence: 92,
                    flags: 2,
                    evidence_id: 0x57A1101, // "COGNITIVE_AND_MEMORY_STALL"
                });
            }
        }
    }

    fn is_frag_increasing(&self) -> bool {
        if self.history_count < 5 {
            return false;
        }
        let idx_new = (self.history_head + 60 - 1) % 60;
        let idx_old = (self.history_head + 60 - 5) % 60;
        self.history_memory_frag[idx_new] > self.history_memory_frag[idx_old] + 1.0
    }

    fn is_traffic_erratic(&self) -> bool {
        if self.history_count < 5 {
            return false;
        }
        let mut sum = 0.0;
        for i in 1..=5 {
            let idx = (self.history_head + 60 - i) % 60;
            sum += self.history_hermes_traffic[idx];
        }
        let mean = sum / 5.0;
        let mut variance = 0.0;
        for i in 1..=5 {
            let idx = (self.history_head + 60 - i) % 60;
            let diff = self.history_hermes_traffic[idx] - mean;
            variance += diff * diff;
        }
        variance > 5.0
    }
}
