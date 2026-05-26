import type { ExecutionMode, ModuleState, ModuleType, OONativeModule } from './OONativeModule';

export interface ApiYrmModule {
  name: string;
  type?: string;
  version?: string;
  description?: string;
  capabilities?: string[];
  executionMode?: string;
  iaHooks?: string[];
  status?: string;
}

const TYPE_MAP: Record<string, ModuleType> = {
  'core-module': 'COGNITIVE',
  'service-module': 'SYSTEM',
  'worker-module': 'EXTERNAL_API',
  'sensory-module': 'SENSORY',
};

function toModuleType(apiType?: string): ModuleType {
  if (!apiType) return 'SYSTEM';
  return TYPE_MAP[apiType.toLowerCase()] ?? 'SYSTEM';
}

function toExecutionMode(mode?: string): ExecutionMode {
  const key = (mode ?? 'native').toUpperCase();
  if (key === 'NATIVE' || key === 'ISOLATED' || key === 'PRIVILEGED' || key === 'REALTIME') {
    return key;
  }
  return 'NATIVE';
}

export function toModuleState(status?: string): ModuleState {
  const normalized = (status ?? 'dormant').toLowerCase();
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'background') return 'BACKGROUND';
  if (normalized === 'hyper_focus' || normalized === 'hyper-focus') return 'HYPER_FOCUS';
  return 'DORMANT';
}

function displayName(module: ApiYrmModule): string {
  if (module.description) return module.description;
  const short = module.name.replace(/^yrm\./, '');
  return short.charAt(0).toUpperCase() + short.slice(1);
}

export function mapApiModuleToOONative(module: ApiYrmModule): OONativeModule {
  const capabilityList = module.capabilities ?? [];
  const capabilities = {
    render_ui: capabilityList.some(c => c.includes('ui') || c.includes('cinema')),
    audio_output: capabilityList.some(c => c.includes('audio') || c.includes('music')),
    network_access: capabilityList.some(c => c.startsWith('web.')),
    memory_read: capabilityList.some(c => c.includes('memory') || c.includes('state')),
    memory_write: capabilityList.some(c => c.includes('store')),
    gpu_acceleration: capabilityList.some(c => c.includes('vision') || c.includes('cinema')),
    p2p_swarm_node: capabilityList.some(c => c.includes('swarm') || c.includes('p2p')),
  };

  return {
    identity: {
      id: module.name,
      name: displayName(module),
      type: toModuleType(module.type),
      version: module.version ?? '0.1.0',
    },
    capabilities,
    executionMode: toExecutionMode(module.executionMode),
    currentState: toModuleState(module.status),
    awaken: async () => {},
    hibernate: async () => {},
    aiHooks: {
      getTelemetry: () => ({ capabilities: capabilityList, hooks: module.iaHooks ?? [] }),
      orchestrate: () => {},
      requiresAttention: module.name === 'yrm.care' || module.name === 'yrm.web',
      attentionPriority: module.name === 'yrm.care' ? 'HIGH' : 'NORMAL',
    },
  };
}

export function mapApiModules(modules: ApiYrmModule[]): OONativeModule[] {
  return modules
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(mapApiModuleToOONative);
}
