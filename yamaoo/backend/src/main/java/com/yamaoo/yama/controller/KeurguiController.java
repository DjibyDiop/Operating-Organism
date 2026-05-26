package com.yamaoo.yama.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@RestController
@RequestMapping({"/api/home", "/api/keurgui"})
@CrossOrigin(origins = "*")
public class KeurguiController {

    private static final String STATE_PATH = resolveStatePath();

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/state")
    public Object getState() throws Exception {
        return mapper.readValue(readFile(), Object.class);
    }

    @PostMapping("/mode-foyer")
    public Map<String, Object> setModeFoyer(@RequestBody Map<String, String> payload) throws Exception {
        String mode = payload.getOrDefault("mode", "normal");
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        state.put("mode_foyer", mode);
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true, "mode_foyer", mode);
    }

    @PostMapping("/guardian/toggle")
    public Map<String, Object> toggleGuardian() throws Exception {
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        boolean current = state.get("guardian_mode_enabled").asBoolean();
        state.put("guardian_mode_enabled", !current);
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true, "guardian_mode_enabled", !current);
    }

    @PostMapping("/guardian/preset")
    public Map<String, Object> setPreset(@RequestBody Map<String, String> payload) throws Exception {
        String profile = payload.getOrDefault("profile", "general");
        String preset = payload.getOrDefault("preset", "balanced");
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        ObjectNode presets = (ObjectNode) state.get("guardian_profile_preset_modes");
        presets.put(profile, preset);
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true, "profile", profile, "preset", preset);
    }

    @PostMapping("/membre")
    public Map<String, Object> addMembre(@RequestBody Map<String, String> payload) throws Exception {
        String prenom = payload.getOrDefault("prenom", "Nouveau");
        String role   = payload.getOrDefault("role", "member");
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        ArrayNode membres = (ArrayNode) state.get("membres");
        String newId = "m" + (membres.size() + 1);
        ObjectNode m = mapper.createObjectNode();
        m.put("id", newId); m.put("prenom", prenom); m.put("role", role);
        membres.add(m);
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true);
    }

    @PostMapping("/routine")
    public Map<String, Object> addRoutine(@RequestBody Map<String, String> payload) throws Exception {
        String nom = payload.getOrDefault("nom", "Routine");
        String heure = payload.getOrDefault("heure", "08:00");
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        ArrayNode routines = (ArrayNode) state.get("routines");
        String newId = "r" + (routines.size() + 1);
        ObjectNode r = mapper.createObjectNode();
        r.put("id", newId); r.put("nom", nom); r.put("heure", heure); r.put("actif", true);
        routines.add(r);
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true);
    }

    @PostMapping("/routine/toggle")
    public Map<String, Object> toggleRoutine(@RequestBody Map<String, String> payload) throws Exception {
        String id = payload.get("id");
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        ArrayNode routines = (ArrayNode) state.get("routines");
        for (int i = 0; i < routines.size(); i++) {
            ObjectNode r = (ObjectNode) routines.get(i);
            if (r.get("id").asText().equals(id)) { r.put("actif", !r.get("actif").asBoolean()); break; }
        }
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true);
    }

    @PostMapping("/complete")
    public Map<String, Object> completeFirstLife() throws Exception {
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        state.put("first_life_completed", true);
        ObjectNode qs = (ObjectNode) state.get("quickstart");
        if (qs != null) qs.put("completed", true);
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true, "first_life_completed", true);
    }

    @PostMapping("/foyer")
    public Map<String, Object> updateFoyer(@RequestBody Map<String, String> payload) throws Exception {
        ObjectNode state = (ObjectNode) mapper.readTree(readFile());
        if (payload.containsKey("nom_foyer")) state.put("nom_foyer", payload.get("nom_foyer"));
        if (payload.containsKey("langue"))    state.put("langue", payload.get("langue"));
        if (payload.containsKey("onboarding_profile")) state.put("onboarding_profile", payload.get("onboarding_profile"));
        writeFile(mapper.writeValueAsString(state));
        return Map.of("success", true);
    }

    private String readFile() throws IOException {
        return new String(Files.readAllBytes(Paths.get(STATE_PATH)));
    }
    private void writeFile(String content) throws IOException {
        Files.write(Paths.get(STATE_PATH), content.getBytes());
    }

    private static String resolveStatePath() {
        String override = System.getenv("HOME_STATE_PATH");
        if (override != null && !override.isBlank()) {
            return override;
        }

        override = System.getenv("KEURGUI_STATE_PATH");
        if (override != null && !override.isBlank()) {
            return override;
        }

        Path cwd = Paths.get(System.getProperty("user.dir"));
        Path candidate = cwd.resolve("..")
            .resolve("app")
            .resolve("data")
            .resolve("keurgui_state.json")
            .normalize();

        return candidate.toString();
    }
}
