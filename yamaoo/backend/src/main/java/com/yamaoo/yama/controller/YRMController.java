package com.yamaoo.yama.controller;

import com.yamaoo.yama.service.DiopMindService;
import com.yamaoo.yama.service.YRMRegistry;
import com.yamaoo.yama.service.YRMRegistry.YRMModule;
import com.yamaoo.yama.websocket.SomaWebSocketHandler;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * API YRM — registre runtime charge depuis modules/manifests/
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class YRMController {

    private final YRMRegistry registry;
    private final SomaWebSocketHandler somaHandler;
    private final DiopMindService diopMind;

    public YRMController(YRMRegistry registry, SomaWebSocketHandler somaHandler, DiopMindService diopMind) {
        this.registry = registry;
        this.somaHandler = somaHandler;
        this.diopMind = diopMind;
    }

    @GetMapping("/modules/state")
    public Map<String, Object> getModulesState() {
        List<Map<String, Object>> modules = registry.getAllModules().values().stream()
            .sorted(Comparator.comparing(YRMModule::getName))
            .map(this::moduleToMap)
            .toList();

        return Map.of(
            "success", true,
            "count", modules.size(),
            "modules", modules
        );
    }

    @PostMapping("/modules/activate")
    public Map<String, Object> activateModule(@RequestBody Map<String, String> body) {
        String name = moduleNameFromBody(body);
        if (name.isEmpty()) {
            return Map.of("success", false, "error", "module name is required");
        }
        if (!registry.setModuleStatus(name, "active")) {
            return Map.of("success", false, "error", "module not found", "name", name);
        }
        return Map.of("success", true, "name", name, "status", "active");
    }

    @PostMapping("/modules/deactivate")
    public Map<String, Object> deactivateModule(@RequestBody Map<String, String> body) {
        String name = moduleNameFromBody(body);
        if (name.isEmpty()) {
            return Map.of("success", false, "error", "module name is required");
        }
        if (!registry.setModuleStatus(name, "dormant")) {
            return Map.of("success", false, "error", "module not found", "name", name);
        }
        return Map.of("success", true, "name", name, "status", "dormant");
    }

    @PostMapping("/cortex/intent")
    public Map<String, Object> processIntent(@RequestBody Map<String, String> body) {
        String intent = firstNonBlank(body.get("intent"), body.get("text"));
        if (intent.isEmpty()) {
            return Map.of("success", false, "error", "intent or text is required");
        }

        IntentRoute route = routeIntent(intent);
        String diopResponse = diopMind.processIntent(intent);
        String activatedFromDiop = extractModuleFromResponse(diopResponse);

        String targetModule = activatedFromDiop != null ? activatedFromDiop : route.targetModule();
        if (registry.getAllModules().containsKey(targetModule)) {
            registry.setModuleStatus(targetModule, "active");
        }

        String thoughtJson = String.format(
            "{\"topic\": \"CORTEX_THOUGHTS\", \"payload\": {\"thought\": %s, \"confidence\": %.1f, \"layer\": 2, \"source\": \"%s\"}}",
            toJsonString(diopResponse.substring(0, Math.min(diopResponse.length(), 120))),
            diopMind.isLLMAvailable() ? 96.5 : 78.0,
            diopMind.getActiveSource()
        );
        somaHandler.broadcast(thoughtJson);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("intent", intent);
        result.put("targetModule", targetModule);
        result.put("action", route.action());
        result.put("plan", route.plan());
        result.put("confidence", diopMind.isLLMAvailable() ? "high" : "medium");
        result.put("response", diopResponse);
        result.put("activatedModule", activatedFromDiop != null ? activatedFromDiop : targetModule);
        result.put("diopSource", diopMind.getActiveSource());
        result.put("diopMindStatus", diopMind.isLLMAvailable() ? "LLM_ACTIVE" : "OO_RULES_FALLBACK");
        return result;
    }

    private String moduleNameFromBody(Map<String, String> body) {
        return firstNonBlank(body.get("name"), body.get("id")).trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private Map<String, Object> moduleToMap(YRMModule mod) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", mod.getName());
        map.put("type", mod.getType());
        map.put("version", mod.getVersion());
        map.put("description", mod.getDescription());
        map.put("capabilities", mod.getCapabilities());
        map.put("executionMode", mod.getExecutionMode());
        map.put("iaHooks", mod.getIaHooks());
        map.put("status", mod.getStatus());
        return map;
    }

    private IntentRoute routeIntent(String intent) {
        String lowered = intent.toLowerCase(Locale.ROOT);

        if (containsAny(lowered, "home", "foyer", "keurgui", "guardian", "routine")) {
            return new IntentRoute("yrm.home", "home.mode.switch",
                List.of("observe_context", "read_home_state", "apply_home_policy", "sync_with_graph"));
        }
        if (containsAny(lowered, "education", "apprentissage", "mentor", "cours")) {
            return new IntentRoute("yrm.education", "learning.path.generate",
                List.of("observe_context", "read_progress", "generate_learning_path", "publish_recommendations"));
        }
        if (containsAny(lowered, "creator", "forge", "synth", "composer", "publier")) {
            return new IntentRoute("yrm.creator", "asset.compose",
                List.of("observe_context", "collect_assets", "compose_pipeline", "prepare_publish_plan"));
        }
        if (containsAny(lowered, "care", "sante", "health", "bio", "rythme")) {
            return new IntentRoute("yrm.care", "risk.alert",
                List.of("observe_signals", "evaluate_risk", "emit_alerts", "schedule_followup"));
        }
        if (containsAny(lowered, "musique", "audio", "cinema", "film", "video", "stream", "media")) {
            return new IntentRoute("yrm.media", "media.stream",
                List.of("observe_context", "select_mode", "start_session", "sync_translation"));
        }
        if (containsAny(lowered, "web", "recherche", "search", "url", "http", "framebuffer", "optimis")) {
            return new IntentRoute("yrm.web", "web.fetch",
                List.of("fetch", "extract", "summarize", "store_memory"));
        }

        return new IntentRoute("yrm.cortex", "intent.plan",
            List.of("observe_context", "build_intent_plan", "route_to_specialized_module", "sync_state"));
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String extractModuleFromResponse(String response) {
        int start = response.indexOf("[yrm.");
        if (start < 0) {
            start = response.indexOf("yrm.");
        }
        if (start < 0) {
            return null;
        }
        if (response.charAt(start) == '[') {
            start++;
        }
        int end = response.indexOf(']', start);
        if (end < 0) {
            end = response.indexOf(':', start);
        }
        if (end < 0) {
            end = response.indexOf(' ', start);
        }
        if (end < 0) {
            end = Math.min(start + 24, response.length());
        }
        String candidate = response.substring(start, end).trim();
        return registry.getAllModules().containsKey(candidate) ? candidate : null;
    }

    private String toJsonString(String s) {
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"")
            .replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }

    private record IntentRoute(String targetModule, String action, List<String> plan) {}
}
