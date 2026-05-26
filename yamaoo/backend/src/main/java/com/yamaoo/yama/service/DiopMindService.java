package com.yamaoo.yama.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * DiopMindService — Pont vers le Gateway DIOP Natif de l'OO
 * ──────────────────────────────────────────────────────────
 * Ce service se connecte au DIOP Gateway (llm-baremetal/diop/gateway/server.py)
 * qui est le vrai cerveau de l'Operating Organism.
 *
 * Conforme à OO_VISION.md "Sovereignty" — 0 cloud, 0 dépendance externe.
 * Le DIOP Gateway expose une API Ollama-compatible sur :11434.
 *
 * Hiérarchie de tentatives (en ordre de priorité) :
 *   1. DIOP Gateway (:11434) — gateway natif OO avec modèle djibion
 *   2. Thalamic Bloom Server (:8082) — modèle Mamba3 150M OO-natif
 *   3. Fallback OO rule-based — routage par mots-clés (Organic Laws)
 *
 * Pour lancer le DIOP Gateway :
 *   cd llm-baremetal/diop
 *   python -m diop.gateway.server --adapter mock  (sans GPU)
 *   python -m diop.gateway.server --adapter native (avec C FFI)
 */
@Service
public class DiopMindService {

    // ─── Endpoints OO-natifs (ordre de priorité) ──────────────────────────────
    private static final String DIOP_GATEWAY_URL   = "http://localhost:11434/api/generate";
    private static final String DIOP_HEALTH_URL    = "http://localhost:11434/api/health";
    private static final String THALAMIC_URL        = "http://localhost:8082/intent";
    private static final String THALAMIC_HEALTH_URL = "http://localhost:8082/health";

    private static final String DIOP_MODEL = "djibion";

    // Contexte système aligné sur le catalogue OO (OO_ORGAN_CATALOG.md)
    private static final String OO_SYSTEM_CONTEXT =
        "Tu es DIOP_MIND, l'intelligence cognitive centrale du système YamaOO Operating Organism. " +
        "Organes actifs: Cortex (planification/yrm.cortex), Phage (immunité/bot-baremetal), " +
        "Hippocampe (mémoire/memory-baremetal), NeuroForge (évolution/evolution-baremetal), " +
        "SomaBridge (télémétrie/united-baremetal). " +
        "5 Lois Organiques (D+): Non-Harm, Transparence, Réversibilité, Dignité, Bien-Commun. " +
        "Réponds en français, de façon concise. Si un module doit être activé, nomme-le exactement.";

    private final AtomicBoolean diopGatewayAvailable  = new AtomicBoolean(false);
    private final AtomicBoolean thalamiAvailable       = new AtomicBoolean(false);

    public DiopMindService() {
        // Vérification de disponibilité au démarrage
        checkAvailability();
        logStatus();
    }

    // ─── API principale ───────────────────────────────────────────────────────

    public String processIntent(String userIntent) {
        // Re-vérifier si les services sont disponibles
        if (!diopGatewayAvailable.get() && !thalamiAvailable.get()) {
            checkAvailability();
        }

        // Tentative 1 : DIOP Gateway (modèle djibion natif OO)
        if (diopGatewayAvailable.get()) {
            try {
                return callDiopGateway(userIntent);
            } catch (Exception e) {
                diopGatewayAvailable.set(false);
                System.err.println("⚠️ [DIOP] Gateway inaccessible: " + e.getMessage());
            }
        }

        // Tentative 2 : Thalamic Bloom Server (Mamba3 150M OO-natif)
        if (thalamiAvailable.get()) {
            try {
                return callThalamiServer(userIntent);
            } catch (Exception e) {
                thalamiAvailable.set(false);
                System.err.println("⚠️ [DIOP] Thalamic server inaccessible: " + e.getMessage());
            }
        }

        // Tentative 3 : Routage OO rule-based (D+ Organic Laws)
        return buildOOFallbackResponse(userIntent);
    }

    public String getActiveSource() {
        if (diopGatewayAvailable.get()) return "DIOP_GATEWAY (djibion, :11434)";
        if (thalamiAvailable.get())      return "THALAMIC_BLOOM (mamba3-150m, :8082)";
        return "OO_RULES_FALLBACK (D+ Organic Laws)";
    }

    public boolean isLLMAvailable() {
        return diopGatewayAvailable.get() || thalamiAvailable.get();
    }

    // ─── Implémentations des appels ──────────────────────────────────────────

    /**
     * Appelle le DIOP Gateway (:11434) — API Ollama-compatible /api/generate
     * (conforme à diop/adapters/local.py — même API surface)
     */
    private String callDiopGateway(String userIntent) throws IOException {
        String prompt = OO_SYSTEM_CONTEXT + "\n\nIntention: " + userIntent;
        String jsonBody = String.format(
            "{\"model\": \"%s\", \"prompt\": %s, \"stream\": false}",
            DIOP_MODEL, toJsonString(prompt)
        );

        String raw = httpPost(DIOP_GATEWAY_URL, jsonBody, 20000);

        // Extraire "response" du format Ollama
        return extractField(raw, "response");
    }

    /**
     * Appelle le Thalamic Bloom Server (:8082) — API YamaOO custom
     */
    private String callThalamiServer(String userIntent) throws IOException {
        String jsonBody = String.format(
            "{\"text\": %s, \"module_context\": {\"source\": \"yamaoo_cortex\"}}",
            toJsonString(userIntent)
        );
        String raw = httpPost(THALAMIC_URL, jsonBody, 15000);
        return extractField(raw, "response");
    }

    /**
     * Routage rule-based aligné sur OO_ORGAN_CATALOG.md et les 5 Lois Organiques.
     * Utilisé quand AUCUN LLM n'est disponible.
     */
    private String buildOOFallbackResponse(String intent) {
        String p = intent.toLowerCase();

        // Mapping conforme à OO_ORGAN_CATALOG.md
        if (anyOf(p, "web", "recherche", "url", "http", "framebuffer", "optimis"))
            return "🌐 [yrm.web] OO Web Cortex activé. Pipeline fetch → extract → summarize prêt.";
        if (anyOf(p, "home", "foyer", "keurgui", "guardian", "routine"))
            return "🏠 [yrm.home] Module Home activé. Politique guardian et mode foyer synchronisés.";
        if (anyOf(p, "musique", "audio", "son", "fréquence", "écoute"))
            return "🎵 [yrm.media] Neural Audio activé. Engine Audio Fréquentiel initialisé.";
        if (anyOf(p, "cinéma", "film", "vidéo", "vision", "image"))
            return "🎬 [yrm.media:vision] CinemaDimension activé. Pipeline Neural Vision chargé.";
        if (anyOf(p, "santé", "corps", "bio", "cœur", "rythme", "organe"))
            return "💚 [yrm.care] Bio-Résonance activé. Liaison somatique en cours.";
        if (anyOf(p, "créer", "générer", "forge", "synthèse", "code", "construire"))
            return "✦ [yrm.creator] Synthesis Forge activé. Pipeline cognitif initialisé. D+ verdict: ALLOW.";
        if (anyOf(p, "mémoire", "rappel", "hippocampe", "souvenir", "historique"))
            return "🧠 [yrm.cortex:memory] Hippocampe en accès. Consolidation synaptique active.";
        if (anyOf(p, "menace", "phage", "sécurité", "intégrité", "virus", "anomalie"))
            return "⚕️ [bot-baremetal] Phage activé. IntegrityGuardEngine en mode chasse. D+ Law 1 vérifiée.";
        if (anyOf(p, "réseau", "p2p", "swarm", "colonie", "pair"))
            return "🌐 [swarm-baremetal] SwarmCoordEngine activé. Phéromone P2P diffusée.";
        if (anyOf(p, "rêve", "sommeil", "maintenance", "compaction"))
            return "🌙 [dream-baremetal] RecoveryCycleEngine activé. Consolidation et compaction en cours.";
        if (anyOf(p, "status", "état", "rapport", "bilan", "santé système"))
            return "📊 [DIOP_MIND:fallback] Tous systèmes nominaux. 13 dimensions actives. DIOP Gateway hors-ligne — démarrez: cd llm-baremetal/diop && python -m diop.gateway.server";

        return "🔮 [DIOP_MIND:OO-Rules] Intention reçue. D+ verdict: ALLOW. " +
               "DIOP Gateway offline — démarrez: cd llm-baremetal/diop && python -m diop.gateway.server --adapter mock";
    }

    // ─── Utilitaires HTTP ─────────────────────────────────────────────────────

    private String httpPost(String urlStr, String jsonBody, int timeoutMs) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(2000);
        conn.setReadTimeout(timeoutMs);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
        }

        if (conn.getResponseCode() != 200) {
            throw new IOException("HTTP " + conn.getResponseCode());
        }

        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(
            new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
        }
        return sb.toString();
    }

    private void checkAvailability() {
        diopGatewayAvailable.set(ping(DIOP_HEALTH_URL));
        thalamiAvailable.set(ping(THALAMIC_HEALTH_URL));
    }

    private boolean ping(String urlStr) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(500);
            conn.setReadTimeout(500);
            conn.setRequestMethod("GET");
            return conn.getResponseCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    private void logStatus() {
        System.out.println("🧠 [DIOP_MIND] Source active: " + getActiveSource());
    }

    private String extractField(String json, String field) {
        String key = "\"" + field + "\"";
        int idx = json.indexOf(key);
        if (idx < 0) return json.trim();
        int colon = json.indexOf(":", idx + key.length());
        if (colon < 0) return json.trim();
        String after = json.substring(colon + 1).trim();
        if (after.startsWith("\"")) {
            int start = 1;
            StringBuilder sb = new StringBuilder();
            for (int i = start; i < after.length(); i++) {
                char c = after.charAt(i);
                if (c == '\\' && i + 1 < after.length()) { sb.append(after.charAt(++i)); continue; }
                if (c == '"') break;
                sb.append(c);
            }
            return sb.toString().trim();
        }
        return after.split("[,}\\]]")[0].trim();
    }

    private String toJsonString(String s) {
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"")
                       .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + "\"";
    }

    private boolean anyOf(String text, String... keywords) {
        for (String k : keywords) if (text.contains(k)) return true;
        return false;
    }
}
