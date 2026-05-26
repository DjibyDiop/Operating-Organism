import { useEffect, useState } from 'react';

export type TelemetryTopic = 'SYSTEM_VITALS' | 'PHAGE_ALERTS' | 'CORTEX_THOUGHTS' | 'AUDIO_SPECTRUM' | 'NETWORK_SWARM';

/**
 * SomaBridge
 * Le pont sanguin (WebSocket) entre les interfaces React (YRM) et le noyau Spring Boot / Rust (Baremetal).
 * Il s'agit du système nerveux central de l'application frontend.
 */
class SomaBridge {
  private static instance: SomaBridge;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  public isConnected = false;

  private constructor() {
    this.connect();
  }

  public static getInstance(): SomaBridge {
    if (!SomaBridge.instance) {
      SomaBridge.instance = new SomaBridge();
    }
    return SomaBridge.instance;
  }

  private connect() {
    // Si on est en dev (localhost:5173), on pointe vers le Spring Boot (8080)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;
    
    // Le point de terminaison WebSocket sur Spring Boot
    const wsUrl = `${protocol}//${host}/api/ws/soma`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("🧬 [SomaBridge] Connexion synaptique établie avec le Noyau Baremetal.");
        this.isConnected = true;
        this.broadcast('CONNECTION_STATE', { status: 'CONNECTED' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Le payload doit avoir une forme { topic: 'SYSTEM_VITALS', payload: { ... } }
          if (data.topic) {
            this.broadcast(data.topic, data.payload);
          }
        } catch (e) {
          console.error("🩸 [SomaBridge] Erreur de parsing du fluide de données:", e);
        }
      };

      this.ws.onclose = () => {
        console.warn("⚠️ [SomaBridge] Rupture synaptique. Tentative de reconnexion...");
        this.isConnected = false;
        this.broadcast('CONNECTION_STATE', { status: 'DISCONNECTED' });
        // Tentative de reconnexion automatique (Rythme cardiaque de survie)
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        // En mode dev sans le backend lancé, ça va échouer silencieusement pour utiliser les simulateurs
      };
    } catch (e) {
      // Fallback
    }
  }

  public subscribe(topic: string, callback: Function) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, []);
    }
    this.listeners.get(topic)!.push(callback);
    return () => this.unsubscribe(topic, callback);
  }

  private unsubscribe(topic: string, callback: Function) {
    const list = this.listeners.get(topic);
    if (list) {
      this.listeners.set(topic, list.filter(cb => cb !== callback));
    }
  }

  private broadcast(topic: string, data: any) {
    const list = this.listeners.get(topic);
    if (list) {
      list.forEach(cb => cb(data));
    }
  }

  /**
   * Permet à l'UI d'envoyer un signal (ex: kill process, ajuster module)
   */
  public sendSignal(topic: TelemetryTopic | 'ACTION', payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ topic, payload }));
    } else {
      console.warn("⚠️ [SomaBridge] Impossible d'envoyer le signal, système nerveux déconnecté.");
    }
  }
}

// ─── React Hooks ─────────────────────────────────────────────────────────────

/**
 * Hook pour se brancher directement sur le flux sanguin de données (Telemetry)
 */
export function useSomaTelemetry<T>(topic: TelemetryTopic, fallbackData: T): T {
  const [data, setData] = useState<T>(fallbackData);

  useEffect(() => {
    const bridge = SomaBridge.getInstance();
    const unsubscribe = bridge.subscribe(topic, (newData: Partial<T> | T) => {
      // Si on reçoit des données brutes (array), on les remplace. Si c'est un objet, on merge.
      setData(prev => {
        if (Array.isArray(newData) || typeof newData !== 'object') return newData as T;
        return { ...prev, ...newData };
      });
    });
    return unsubscribe;
  }, [topic]);

  return data;
}

/**
 * Hook pour connaître l'état vital de la connexion au Noyau
 */
export function useSomaConnection() {
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const bridge = SomaBridge.getInstance();
    setConnected(bridge.isConnected);
    const unsubscribe = bridge.subscribe('CONNECTION_STATE', (data: { status: string }) => {
      setConnected(data.status === 'CONNECTED');
    });
    return unsubscribe;
  }, []);

  return connected;
}

export const somaBridgeInstance = SomaBridge.getInstance();
