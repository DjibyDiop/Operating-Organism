package com.yamaoo.yama.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yamaoo.yama.websocket.SomaWebSocketHandler;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * YRMRegistry — Le Registre Runtime des Modules Vivants
 * ─────────────────────────────────────────────────────
 * Au démarrage, scanne tous les manifests JSON du répertoire /modules/manifests/
 * et les enregistre dans une Map en mémoire.
 *
 * Il implémente le contrat de l'architecture OO Native Module :
 * - Chaque YRM peut être ACTIVÉ, mis en ARRIÈRE-PLAN, ou mis en HIBERNATION.
 * - L'IA (DIOP_MIND) peut interagir avec les modules via les iaHooks.
 * - Le registre diffuse les changements d'état via SomaBridge en temps réel.
 */
@Service
public class YRMRegistry {

    private final Map<String, YRMModule> registry = new ConcurrentHashMap<>();
    private final SomaWebSocketHandler somaHandler;
    private final ObjectMapper mapper = new ObjectMapper();

    public YRMRegistry(SomaWebSocketHandler somaHandler) {
        this.somaHandler = somaHandler;
        this.loadManifests();
    }

    /**
     * Charge les manifests JSON depuis le disque au démarrage.
     * Cherche dans plusieurs chemins relatifs.
     */
    private void loadManifests() {
        List<String> searchPaths = List.of(
            "modules/manifests",
            "../modules/manifests",
            "../../modules/manifests"
        );

        for (String path : searchPaths) {
            File dir = new File(path);
            if (dir.exists() && dir.isDirectory()) {
                File[] files = dir.listFiles((d, name) -> name.endsWith(".json"));
                if (files != null) {
                    for (File f : files) {
                        try {
                            YRMModule mod = mapper.readValue(f, YRMModule.class);
                            registry.put(mod.getName(), mod);
                            System.out.println("🧬 [YRMRegistry] Module chargé: " + mod.getName()
                                + " [" + mod.getExecutionMode() + "] → " + mod.getStatus());
                        } catch (Exception e) {
                            System.err.println("⚠️ Erreur chargement manifest " + f.getName() + ": " + e.getMessage());
                        }
                    }
                }
                System.out.println("🧠 [YRMRegistry] " + registry.size() + " modules YRM enregistrés.");
                return;
            }
        }
        System.out.println("⚠️ [YRMRegistry] Aucun répertoire de manifests trouvé. Modules vides.");
    }

    public Map<String, YRMModule> getAllModules() {
        return Collections.unmodifiableMap(registry);
    }

    /**
     * Change le statut d'un module et le diffuse à tous les clients React.
     */
    public boolean setModuleStatus(String name, String newStatus) {
        YRMModule mod = registry.get(name);
        if (mod == null) return false;

        String oldStatus = mod.getStatus();
        mod.setStatus(newStatus);

        // Diffuser le changement via SomaBridge
        try {
            String json = String.format(
                "{\"topic\": \"MODULE_STATE\", \"payload\": {\"name\": \"%s\", \"oldStatus\": \"%s\", \"newStatus\": \"%s\"}}",
                name, oldStatus, newStatus
            );
            somaHandler.broadcast(json);
        } catch (Exception e) {
            System.err.println("Erreur diffusion état module: " + e.getMessage());
        }

        System.out.printf("🔄 [YRMRegistry] %s : %s → %s%n", name, oldStatus, newStatus);
        return true;
    }

    // ─── Data Model ─────────────────────────────────────────────────────────

    public static class YRMModule {
        private String name;
        private String type;
        private String version;
        private String description;
        private List<String> capabilities = new ArrayList<>();
        private String executionMode;
        private List<String> iaHooks = new ArrayList<>();
        private String status;

        // Getters & Setters
        public String getName() { return name; }
        public void setName(String n) { this.name = n; }
        public String getType() { return type; }
        public void setType(String t) { this.type = t; }
        public String getVersion() { return version; }
        public void setVersion(String v) { this.version = v; }
        public String getDescription() { return description; }
        public void setDescription(String d) { this.description = d; }
        public List<String> getCapabilities() { return capabilities; }
        public void setCapabilities(List<String> c) { this.capabilities = c; }
        public String getExecutionMode() { return executionMode; }
        public void setExecutionMode(String e) { this.executionMode = e; }
        public List<String> getIaHooks() { return iaHooks; }
        public void setIaHooks(List<String> h) { this.iaHooks = h; }
        public String getStatus() { return status; }
        public void setStatus(String s) { this.status = s; }
    }
}
