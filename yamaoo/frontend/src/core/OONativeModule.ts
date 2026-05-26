export type ModuleState = 'DORMANT' | 'ACTIVE' | 'HYPER_FOCUS' | 'BACKGROUND';
export type ExecutionMode = 'NATIVE' | 'ISOLATED' | 'PRIVILEGED' | 'REALTIME';
export type ModuleType = 'COGNITIVE' | 'SENSORY' | 'MOTOR' | 'SYSTEM' | 'EXTERNAL_API';

export interface ModuleIdentity {
  id: string;          // ex: 'sys_cinema_01'
  name: string;        // ex: 'Neural Vision (Cinema)'
  type: ModuleType;
  version: string;
}

export interface ModuleCapabilities {
  render_ui?: boolean;
  audio_output?: boolean;
  network_access?: boolean;
  memory_read?: boolean;
  memory_write?: boolean;
  gpu_acceleration?: boolean;
  p2p_swarm_node?: boolean;
}

export interface AIHooks {
  /**
   * Retourne l'état vital du module à l'Orchestrateur (DIOP_MIND)
   */
  getTelemetry: () => Record<string, any>;
  
  /**
   * Permet à l'IA de prendre le contrôle direct du module
   */
  orchestrate: (command: string, payload?: any) => void;
  
  /**
   * Le module signale s'il a besoin de l'attention de l'IA (ex: erreur, choix complexe)
   */
  requiresAttention: boolean;
  attentionPriority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}

/**
 * OO Native Module (ONM) / Yama Runtime Module (YRM)
 * 
 * Contrat fondamental pour tout composant du système YamaOO.
 * Une "app" n'existe pas. Tout est un Organe/Module avec des capacités
 * gérées par le métabolisme central (Soma Core).
 */
export interface OONativeModule {
  identity: ModuleIdentity;
  capabilities: ModuleCapabilities;
  executionMode: ExecutionMode;
  currentState: ModuleState;
  
  // Lifecycle Métabolique
  awaken: () => Promise<void>;    // Réveil synaptique
  hibernate: () => Promise<void>; // Mise en veille profonde
  
  // Intégration IA / Système Nerveux
  aiHooks: AIHooks;
}
