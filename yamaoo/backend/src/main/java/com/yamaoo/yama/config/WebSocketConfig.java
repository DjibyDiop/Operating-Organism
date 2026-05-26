package com.yamaoo.yama.config;

import com.yamaoo.yama.websocket.SomaWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SomaWebSocketHandler somaWebSocketHandler;

    public WebSocketConfig(SomaWebSocketHandler somaWebSocketHandler) {
        this.somaWebSocketHandler = somaWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Le pont sanguin : /api/ws/soma
        registry.addHandler(somaWebSocketHandler, "/api/ws/soma").setAllowedOrigins("*");
    }
}
