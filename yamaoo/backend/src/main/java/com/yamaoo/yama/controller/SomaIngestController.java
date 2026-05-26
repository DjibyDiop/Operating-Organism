package com.yamaoo.yama.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yamaoo.yama.websocket.SomaWebSocketHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

/**
 * SomaIngestController — La Bouche du Noyau Java
 * ─────────────────────────────────────────────────
 * Reçoit les données brutes de l'agent Rust (yama-kernel-agent)
 * et les relaie instantanément à tous les écrans React via SomaBridge.
 *
 * Route : POST /api/soma/ingest
 *
 * Ce contrôleur EST le pont entre le monde Rust (baremetal) et React (visuel).
 * Il représente la "synapse" entre le noyau physique et la conscience affichée.
 */
@RestController
@RequestMapping("/api/soma")
@CrossOrigin(origins = "*")
public class SomaIngestController {

    private final SomaWebSocketHandler somaHandler;
    private final ObjectMapper mapper = new ObjectMapper();

    // Dernier état reçu de l'agent Rust (pour health-check)
    public static final AtomicReference<Map<String, Object>> lastRustPayload = new AtomicReference<>();
    public static volatile long lastRustPulse = 0;

    public SomaIngestController(SomaWebSocketHandler somaHandler) {
        this.somaHandler = somaHandler;
    }

    /**
     * POST /api/soma/ingest
     * Reçoit les métriques brutes depuis l'agent Rust, les reformate,
     * et les diffuse en temps réel à tous les clients WebSocket (React).
     */
    @PostMapping("/ingest")
    public ResponseEntity<String> ingest(@RequestBody Map<String, Object> rustPayload) {
        lastRustPayload.set(rustPayload);
        lastRustPulse = System.currentTimeMillis();

        try {
            // Reformater en payload SYSTEM_VITALS compatible SomaBridge
            String vitalsJson = String.format(
                "{\"topic\": \"SYSTEM_VITALS\", \"payload\": {" +
                "\"cpuNeural\": %s, " +
                "\"memory\": %s, " +
                "\"memUsedGB\": %s, " +
                "\"memTotalGB\": %s, " +
                "\"activeProcesses\": %s, " +
                "\"source\": \"rust_kernel_agent\"" +
                "}}",
                rustPayload.getOrDefault("cpuNeural", 0),
                rustPayload.getOrDefault("memory", 0),
                toGB(rustPayload.getOrDefault("memUsedMB", 0)),
                toGB(rustPayload.getOrDefault("memTotalMB", 0)),
                rustPayload.getOrDefault("activeProcesses", 0)
            );
            somaHandler.broadcast(vitalsJson);

            // Si une menace est signalée par l'agent Rust
            Object topThreat = rustPayload.get("topThreat");
            if (topThreat instanceof Map<?, ?> threat) {
                Object threatName = threat.get("name");
                Object threatCpu  = threat.get("cpuPct");
                String phageJson = String.format(
                    "{\"topic\": \"PHAGE_ALERTS\", \"payload\": {\"threats\": [{\"pid\": 0, \"name\": \"%s\", \"cpuPct\": %s}]}}",
                    threatName != null ? threatName.toString() : "unknown",
                    threatCpu  != null ? threatCpu.toString()  : "0"
                );
                somaHandler.broadcast(phageJson);
            }

            System.out.printf("\r🔴 RUST PULSE → CPU:%.1f%% RAM:%sMB/%sMB",
                getDouble(rustPayload.get("cpuNeural")),
                rustPayload.getOrDefault("memUsedMB", 0),
                rustPayload.getOrDefault("memTotalMB", 0));

        } catch (Exception e) {
            System.err.println("Erreur ingestion Rust: " + e.getMessage());
        }

        return ResponseEntity.ok("Pulse intégré.");
    }

    /**
     * GET /api/soma/status
     * Indique si l'agent Rust est connecté (pulse < 5s) ou non.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        long elapsed = System.currentTimeMillis() - lastRustPulse;
        boolean rustAlive = lastRustPulse > 0 && elapsed < 5000;
        return ResponseEntity.ok(Map.of(
            "rustAgentConnected", rustAlive,
            "lastPulseMs", elapsed,
            "source", rustAlive ? "rust_kernel_agent" : "java_oshi_fallback"
        ));
    }

    private double getDouble(Object val) {
        if (val instanceof Number n) return n.doubleValue();
        if (val instanceof String s) { try { return Double.parseDouble(s); } catch(Exception e) { return 0; } }
        return 0;
    }

    private long toGB(Object valMB) {
        long mb = 0;
        if (valMB instanceof Number n) mb = n.longValue();
        return mb / 1024;
    }
}
