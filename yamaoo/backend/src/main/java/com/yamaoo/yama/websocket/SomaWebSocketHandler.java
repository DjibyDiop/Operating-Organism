package com.yamaoo.yama.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * SomaWebSocketHandler — Le Système Nerveux Central
 * ──────────────────────────────────────────────────
 * Gère toutes les sessions WebSocket ouvertes par les interfaces React (YRM).
 * Ne génère PLUS de fausses données. Il délègue à SomaService (qui lit le vrai hardware).
 */
@Component
public class SomaWebSocketHandler extends TextWebSocketHandler {

    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        System.out.println("🧬 [SomaBridge] Nouvelle synapse: " + session.getId()
            + " | Connexions actives: " + sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        System.out.println("⚠️ [SomaBridge] Synapse rompue: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Signal entrant de l'UI (ex: kill process, ajuster module)
        System.out.println("🧠 [SomaBridge] Signal UI reçu: " + message.getPayload());
        // TODO: Router vers DIOP_MIND pour interprétation
    }

    /**
     * Diffuse un message JSON à TOUTES les interfaces React connectées.
     * Appelé par SomaService toutes les 2 secondes avec les données hardware réelles.
     */
    public void broadcast(String jsonPayload) {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(jsonPayload));
                } catch (IOException e) {
                    System.err.println("🩸 Erreur de transmission: " + e.getMessage());
                }
            }
        }
    }
}
