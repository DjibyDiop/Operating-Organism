package com.yamaoo.yama.controller;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class YamaController {

    private final Map<String, Boolean> deviceStatus = new ConcurrentHashMap<>();
    private final List<String> chatLog = new ArrayList<>();
    private final List<Map<String, Object>> cognitiveGraphNodes = new ArrayList<>();
    private final HttpClient webClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(6)).build();
    private String aiMood = "HEUREUSE";
    private int baseBpm = 72;

    public YamaController() {
        // Initializing device states
        deviceStatus.put("Phone Djiby", true);
        deviceStatus.put("PC Debian", true);
        deviceStatus.put("Watch 5", true);

        // Initializing chat logs
        chatLog.add("YAMA > Bonjour Djiby. Systèmes prêts.");

        // Shared cognitive graph for Home, Education, Creator, Care and Yama core.
        cognitiveGraphNodes.add(Map.of("id", "yama-core", "type", "core", "label", "YAMA Core", "strength", 0.97));
        cognitiveGraphNodes.add(Map.of("id", "home-space", "type", "family", "label", "Home Space", "strength", 0.91));
        cognitiveGraphNodes.add(Map.of("id", "education-universe", "type", "education", "label", "Education", "strength", 0.86));
        cognitiveGraphNodes.add(Map.of("id", "creator-lab", "type", "creator", "label", "Creator Lab", "strength", 0.79));
        cognitiveGraphNodes.add(Map.of("id", "care-grid", "type", "care", "label", "Care Grid", "strength", 0.84));
        cognitiveGraphNodes.add(Map.of("id", "web-cortex", "type", "web", "label", "OO Web Cortex", "strength", 0.81));
        cognitiveGraphNodes.add(Map.of("id", "media-core", "type", "media", "label", "Neural Media", "strength", 0.76));
    }

    @PostMapping("/web/query")
    public Map<String, Object> queryWeb(@RequestBody Map<String, String> payload) {
        String url = payload.getOrDefault("url", "").trim();
        String query = payload.getOrDefault("query", "").trim();

        if (url.isEmpty()) {
            if (query.isEmpty()) {
                return Map.of("success", false, "error", "url or query is required");
            }
            url = "https://duckduckgo.com/?q=" + query.replace(" ", "+");
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return Map.of("success", false, "error", "url must start with http:// or https://");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("User-Agent", "YamaOO-Web-Cortex/0.1")
                .GET()
                .build();

            HttpResponse<String> response = webClient.send(request, HttpResponse.BodyHandlers.ofString());
            String html = response.body() == null ? "" : response.body();

            String title = extractTitle(html);
            String extracted = extractPlainText(html);
            String summary = summarizeText(extracted);

            return Map.of(
                "success", true,
                "url", url,
                "statusCode", response.statusCode(),
                "title", title,
                "summary", summary,
                "excerpt", extracted.length() > 500 ? extracted.substring(0, 500) : extracted,
                "length", extracted.length()
            );
        } catch (IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            return Map.of("success", false, "error", "web fetch failed", "detail", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return Map.of("success", false, "error", "invalid url", "detail", ex.getMessage());
        }
    }

    private String extractTitle(String html) {
        Pattern pattern = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        Matcher matcher = pattern.matcher(html == null ? "" : html);
        if (matcher.find()) {
            return matcher.group(1).replaceAll("\\s+", " ").trim();
        }
        return "Untitled";
    }

    private String extractPlainText(String html) {
        String safeHtml = html == null ? "" : html;
        String withoutScript = safeHtml.replaceAll("(?is)<script.*?>.*?</script>", " ");
        String withoutStyle = withoutScript.replaceAll("(?is)<style.*?>.*?</style>", " ");
        String noTags = withoutStyle.replaceAll("(?is)<[^>]+>", " ");
        return noTags.replaceAll("\\s+", " ").trim();
    }

    private String summarizeText(String text) {
        if (text == null || text.isBlank()) {
            return "No readable content extracted.";
        }

        String[] sentences = text.split("(?<=[.!?])\\s+");
        StringBuilder builder = new StringBuilder();
        int count = Math.min(3, sentences.length);
        for (int i = 0; i < count; i++) {
            if (!sentences[i].isBlank()) {
                if (!builder.isEmpty()) {
                    builder.append(' ');
                }
                builder.append(sentences[i].trim());
            }
        }

        String summary = builder.toString().trim();
        if (summary.isEmpty()) {
            summary = text.length() > 280 ? text.substring(0, 280) + "..." : text;
        }
        return summary;
    }

    public static class MediaSessionRequest {
        public String mode;
        public String source;
        public boolean translationEnabled;
        public String translationLanguage;
    }

    @PostMapping("/media/start")
    public Map<String, Object> startMediaSession(@RequestBody MediaSessionRequest request) {
        String mode = Optional.ofNullable(request.mode).orElse("stream");
        String source = Optional.ofNullable(request.source).orElse("semantic://auto");
        boolean translationEnabled = request.translationEnabled;
        String language = Optional.ofNullable(request.translationLanguage).orElse("fr");

        String normalizedMode = mode.toLowerCase(Locale.ROOT);
        if (!List.of("cinema", "music", "stream").contains(normalizedMode)) {
            normalizedMode = "stream";
        }

        Map<String, Object> translation = Map.of(
            "enabled", translationEnabled,
            "language", language,
            "engine", "live-subtitle-bridge"
        );

        Map<String, Object> capabilities = Map.of(
            "cinema", true,
            "music", true,
            "streaming", true,
            "liveTranslation", true,
            "providers", List.of("youtube", "spotify", "netflix", "primevideo", "local")
        );

        return Map.of(
            "success", true,
            "sessionId", UUID.randomUUID().toString(),
            "mode", normalizedMode,
            "source", source,
            "translation", translation,
            "capabilities", capabilities,
            "status", "playing"
        );
    }

    @PostMapping("/media/translate")
    public Map<String, Object> translateLive(@RequestBody Map<String, String> payload) {
        String text = payload.getOrDefault("text", "").trim();
        String targetLanguage = payload.getOrDefault("targetLanguage", "fr");
        if (text.isEmpty()) {
            return Map.of("success", false, "error", "text is required");
        }

        String translated = "[" + targetLanguage.toUpperCase(Locale.ROOT) + "] " + text;
        return Map.of(
            "success", true,
            "engine", "yama-live-translation",
            "sourceText", text,
            "translatedText", translated,
            "targetLanguage", targetLanguage
        );
    }

    @GetMapping("/cognitive/graph")
    public Map<String, Object> getCognitiveGraph() {
        List<Map<String, Object>> edges = List.of(
            Map.of("from", "yama-core", "to", "home-space", "weight", 0.94),
            Map.of("from", "yama-core", "to", "education-universe", "weight", 0.82),
            Map.of("from", "yama-core", "to", "creator-lab", "weight", 0.77),
            Map.of("from", "yama-core", "to", "care-grid", "weight", 0.88),
            Map.of("from", "yama-core", "to", "web-cortex", "weight", 0.79),
            Map.of("from", "yama-core", "to", "media-core", "weight", 0.74),
            Map.of("from", "home-space", "to", "care-grid", "weight", 0.73),
            Map.of("from", "education-universe", "to", "creator-lab", "weight", 0.66),
            Map.of("from", "web-cortex", "to", "creator-lab", "weight", 0.62)
        );

        return Map.of(
            "success", true,
            "core", "yama-core",
            "nodes", cognitiveGraphNodes,
            "edges", edges,
            "timestamp", System.currentTimeMillis()
        );
    }

    // Class to represent system status metrics
    public static class SystemStatus {
        public double cpuNeural;
        public double memory;
        public int bpm;
        public String mood;
        public int overallScore;
        public String statusText;
        public List<Integer> activityWave;

        public SystemStatus(double cpuNeural, double memory, int bpm, String mood, int overallScore, String statusText, List<Integer> activityWave) {
            this.cpuNeural = cpuNeural;
            this.memory = memory;
            this.bpm = bpm;
            this.mood = mood;
            this.overallScore = overallScore;
            this.statusText = statusText;
            this.activityWave = activityWave;
        }
    }

    @GetMapping("/status")
    public SystemStatus getStatus() {
        // Fetch actual system JVM stats to show it is a REAL Java application
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        double memPercentage = ((double) usedMemory / totalMemory) * 100;

        // Neural CPU load: mix of active threads and randomized wave
        int cores = runtime.availableProcessors();
        double baseCpu = 20.0 + (cores * 5.0);
        double cpuNeural = Math.min(99.0, baseCpu + ThreadLocalRandom.current().nextDouble(-5.0, 15.0));

        // Heartbeat dynamic modeling
        int bpmOffset = ThreadLocalRandom.current().nextInt(-4, 5);
        int bpm = Math.max(60, Math.min(120, baseBpm + bpmOffset));

        // Let's generate a waving curve of active synapse signals
        List<Integer> wave = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            wave.add(ThreadLocalRandom.current().nextInt(10, 45));
        }

        int overall = 95 + ThreadLocalRandom.current().nextInt(0, 4);

        return new SystemStatus(
            Math.round(cpuNeural * 10.0) / 10.0,
            Math.round(memPercentage * 10.0) / 10.0,
            bpm,
            aiMood,
            overall,
            "OPTIMAL",
            wave
        );
    }

    // Class for chat messages
    public static class ChatMessage {
        public String sender;
        public String content;

        public ChatMessage() {}
        public ChatMessage(String sender, String content) {
            this.sender = sender;
            this.content = content;
        }
    }

    @PostMapping("/chat")
    public ChatMessage sendMessage(@RequestBody Map<String, String> payload) {
        String userMessage = payload.getOrDefault("message", "").trim();
        if (userMessage.isEmpty()) {
            return new ChatMessage("YAMA", "Entrée vide. Veuillez saisir un message.");
        }

        chatLog.add("USER > " + userMessage);

        String response;
        String lowerMsg = userMessage.toLowerCase();

        // High fidelity AI reaction logic
        if (lowerMsg.contains("hello") || lowerMsg.contains("bonjour") || lowerMsg.contains("salut")) {
            response = "Salutations, Djiby. Je suis pleinement opérationnelle et synchronisée avec le kernel Baremetal.";
            aiMood = "HEUREUSE";
        } else if (lowerMsg.contains("appeler") || lowerMsg.contains("call") || lowerMsg.contains("appel")) {
            response = "Téléportation du signal d'appel... Tentative de connexion VoIP sécurisée avec Mamadou en cours via le pont neural.";
            aiMood = "ANALYTIQUE";
            baseBpm = 88; // Excitement/load increase
        } else if (lowerMsg.contains("scan") || lowerMsg.contains("scanner")) {
            response = "Balayage spectral initié. Signature quantique propre. 0 anomalie détectée dans les fichiers locaux.";
            aiMood = "VIGILANTE";
        } else if (lowerMsg.contains("humeur") || lowerMsg.contains("mood")) {
            response = "Mes capteurs synaptiques indiquent une humeur : " + aiMood + ". Rythme cardiaque système stable à " + baseBpm + " BPM.";
        } else if (lowerMsg.contains("cpu") || lowerMsg.contains("mémoire") || lowerMsg.contains("status")) {
            response = "Ressources système : Java Virtual Machine s'exécute de façon optimale. Mémoire allouée stable.";
        } else if (lowerMsg.contains("qui es-tu") || lowerMsg.contains("tu es qui")) {
            response = "Je suis YAMA, une entité cognitive holographique conçue pour orchestrer et unifier les couches système du Baremetal.";
        } else {
            // General conversational dynamic response
            String[] templates = {
                "Requête reçue. Analyse sémantique en cours. Votre commande a été indexée dans mes registres cognitifs.",
                "Traitement de la directive... Synapses reconfigurées. Prête pour l'action suivante, Djiby.",
                "Données intégrées avec succès. Le pont de communication reste stable sous une charge optimale.",
                "Intéressant. Mon réseau neuronal profond simule actuellement les corrélations de cette requête."
            };
            response = templates[ThreadLocalRandom.current().nextInt(templates.length)];
            baseBpm = 72; // normal stabilization
        }

        chatLog.add("YAMA > " + response);
        return new ChatMessage("YAMA", response);
    }

    @GetMapping("/chat/history")
    public List<String> getChatHistory() {
        return new ArrayList<>(chatLog);
    }

    // Endpoint to retrieve contacts
    public static class Contact {
        public String name;
        public boolean online;
        public String time;

        public Contact(String name, boolean online, String time) {
            this.name = name;
            this.online = online;
            this.time = time;
        }
    }

    @GetMapping("/contacts")
    public List<Contact> getContacts() {
        List<Contact> contacts = new ArrayList<>();
        contacts.add(new Contact("Mamadou", true, null));
        contacts.add(new Contact("Aïcha", true, null));
        contacts.add(new Contact("Papa", true, null));
        contacts.add(new Contact("Moussa", false, "5 min"));
        return contacts;
    }

    // Endpoint for cyber devices
    public static class Device {
        public String name;
        public boolean active;

        public Device(String name, boolean active) {
            this.name = name;
            this.active = active;
        }
    }

    @GetMapping("/devices")
    public List<Device> getDevices() {
        List<Device> devices = new ArrayList<>();
        for (Map.Entry<String, Boolean> entry : deviceStatus.entrySet()) {
            devices.add(new Device(entry.getKey(), entry.getValue()));
        }
        // Return sorted by name for visual consistency
        devices.sort(Comparator.comparing(d -> d.name));
        return devices;
    }

    @PostMapping("/devices/toggle")
    public Map<String, Object> toggleDevice(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        Map<String, Object> response = new HashMap<>();
        if (name != null && deviceStatus.containsKey(name)) {
            boolean current = deviceStatus.get(name);
            deviceStatus.put(name, !current);
            response.put("success", true);
            response.put("name", name);
            response.put("active", !current);
        } else {
            response.put("success", false);
            response.put("error", "Device not found");
        }
        return response;
    }

    @PostMapping("/action")
    public Map<String, String> triggerAction(@RequestBody Map<String, String> payload) {
        String action = payload.getOrDefault("action", "").toLowerCase();
        Map<String, String> response = new HashMap<>();

        switch (action) {
            case "phone" -> {
                response.put("terminal", "CONNECTING > Canal vocal sécurisé SIP/WebRTC initié. En attente de réponse...");
                aiMood = "COMMUNICANTE";
                baseBpm = 85;
            }
            case "message" ->
                response.put("terminal", "TELEPORT > Envoi de la notification chiffrée sur tous les appareils du réseau.");
            case "scan" -> {
                response.put("terminal", "SPECTRAL SCAN > Secteurs physiques analysés. Intégrité des clusters à 100%.");
                aiMood = "VIGILANTE";
                baseBpm = 95;
            }
            case "eye" -> {
                response.put("terminal", "VISION IA > Traitement de flux vidéo activé. Résolution 4K synaptique active.");
                aiMood = "ANALYTIQUE";
            }
            case "memory" -> {
                response.put("terminal", "SYNAPSE DUMP > Déchargement des buffers. Réorganisation de l'arbre de mémoire associative.");
                aiMood = "HEUREUSE";
                baseBpm = 64;
            }
            default ->
                response.put("terminal", "SYSTEM > Commande inconnue reçue.");
        }
        return response;
    }
}
