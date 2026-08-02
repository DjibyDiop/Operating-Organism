#!/usr/bin/env python3
"""
oo_desktop_runtime.py — Living Desktop Runtime
Operating Organism / Phase 7 Demonstrator

This runtime orchestrates the full oo-desktop-academy ecosystem:
  - LivingWindow / OptimizedLivingWindow (core-biological)
  - NeuralBridge / AdvancedNeuralBridge (neural-bridge)
  - GrowthController (core-biological/growth)
  - BioluminescentShader / UEFIRenderer (renderer)
  - colony-server Hermes bridge (via HTTP REST)

Usage:
    python oo_desktop_runtime.py [--colony http://127.0.0.1:8080] [--organism-id mynode]
"""
from __future__ import annotations  # PEP 563 — forward references for type hints

import sys
import os
import time
import json
import threading
import importlib.util
import argparse
import logging

# ── Path setup ──────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ACADEMY_DIR = os.path.join(BASE_DIR, "oo-desktop-academy")
sys.path.insert(0, ACADEMY_DIR)

# ── Import academy modules ───────────────────────────────────────────────────
def _dyn_load(path, name):
    """Dynamically load a Python module from an absolute file path."""
    spec = importlib.util.spec_from_file_location(name, path)
    mod  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

try:
    from core_biological.window import LivingWindow
    from core_biological.optimized_window import OptimizedLivingWindow, STATE_ACTIVE, STATE_NEURAL_LINK
    from core_biological.growth import GrowthController
    from neural_bridge.core import AdvancedNeuralBridge
    from renderer.soft_render import BioluminescentShader, UEFIFramebuffer, UEFIRenderer
except ImportError:
    # Fallback: load modules dynamically using absolute file paths
    _load = _dyn_load

    _w  = _dyn_load(os.path.join(ACADEMY_DIR, "core-biological", "window.py"),           "oo_window")
    _ow = _dyn_load(os.path.join(ACADEMY_DIR, "core-biological", "optimized_window.py"),  "oo_opt_window")
    _g  = _dyn_load(os.path.join(ACADEMY_DIR, "core-biological", "growth.py"),            "oo_growth")
    _nb = _dyn_load(os.path.join(ACADEMY_DIR, "neural-bridge",   "core.py"),              "oo_neural_bridge")
    _sr = _dyn_load(os.path.join(ACADEMY_DIR, "renderer",        "soft_render.py"),       "oo_soft_render")

    LivingWindow          = _w.LivingWindow
    OptimizedLivingWindow = _ow.OptimizedLivingWindow
    STATE_ACTIVE          = _ow.STATE_ACTIVE
    STATE_NEURAL_LINK     = _ow.STATE_NEURAL_LINK
    GrowthController      = _g.GrowthController
    AdvancedNeuralBridge  = _nb.AdvancedNeuralBridge
    BioluminescentShader  = _sr.BioluminescentShader
    UEFIFramebuffer       = _sr.UEFIFramebuffer
    UEFIRenderer          = _sr.UEFIRenderer


# ── Colony Hermes client ─────────────────────────────────────────────────────
try:
    import urllib.request, urllib.error

    class HermesClient:
        def __init__(self, colony_url: str, organism_id: str):
            self.base = colony_url.rstrip("/")
            self.organism_id = organism_id

        def send(self, to_organism_id: str, channel: int, data: dict):
            payload = json.dumps({
                "from_organism_id": self.organism_id,
                "to_organism_id": to_organism_id,
                "channel": channel,
                "data": data,
            }).encode()
            try:
                req = urllib.request.Request(
                    f"{self.base}/api/hermes",
                    data=payload,
                    headers={"Content-Type": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=3) as r:
                    return json.loads(r.read())
            except Exception as e:
                return {"error": str(e)}

        def inbox(self):
            try:
                url = f"{self.base}/api/hermes/inbox?organism_id={self.organism_id}"
                with urllib.request.urlopen(url, timeout=3) as r:
                    return json.loads(r.read())
            except Exception as e:
                return []

        def push_registry(self, registry: list):
            payload = json.dumps(registry).encode()
            try:
                req = urllib.request.Request(
                    f"{self.base}/api/registry?organism_id={self.organism_id}",
                    data=payload,
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=3) as r:
                    return r.status
            except Exception as e:
                return -1

except Exception:
    class HermesClient:
        def __init__(self, *a, **kw): pass
        def send(self, *a, **kw): return {}
        def inbox(self): return []
        def push_registry(self, *a, **kw): return -1


# ── Desktop Manager ──────────────────────────────────────────────────────────
class LivingDesktop:
    """
    Orchestrate the Living Desktop: windows, neural bridge, framebuffer,
    Hermes messaging and registry synchronization.
    """

    INITIAL_APPS = [
        ("REPL",       0.3),
        ("HUD",        0.2),
        ("Browser",    0.4),
        ("Academy",    0.5),
        ("D+Monitor",  0.35),
        ("Chronicle",  0.25),
    ]

    def __init__(self, organism_id: str = "oo-desktop-0", colony_url: str | None = None):
        self.organism_id = organism_id
        self.logger = logging.getLogger("LivingDesktop")
        self.running = False
        self._tick   = 0
        self._lock   = threading.Lock()

        # Neural substrate
        self.bridge  = AdvancedNeuralBridge()
        self.growth  = GrowthController(self.bridge)
        self.windows: list[OptimizedLivingWindow] = []

        # UEFI framebuffer
        self.fb       = UEFIFramebuffer(width=800, height=600)
        self.renderer = UEFIRenderer(self.fb, width=800, height=600)
        self.shader   = BioluminescentShader()

        # Colony Hermes
        self.hermes = HermesClient(colony_url, organism_id) if colony_url else None

    # ── Boot sequence ────────────────────────────────────────────────────────
    def boot(self):
        self.logger.info("=== OO Living Desktop BOOT ===")
        self.logger.info(f"  Organism ID : {self.organism_id}")
        self.logger.info(f"  Framebuffer : {self.fb.width}×{self.fb.height} @ 0x{self.fb.base_addr:08X}")

        for name, resp in self.INITIAL_APPS:
            result = self.growth.spawn_organism(name, respiration=resp)
            self.logger.info(f"  spawn → {result}")
        self.windows = self.growth.active_nodes
        self.logger.info(f"  {len(self.windows)} living windows active on neural bridge.")

        # Sync registry to colony
        self._sync_registry()
        self.logger.info("  Registry synced to colony.")
        self.logger.info("=== BOOT COMPLETE ===\n")

    # ── Main loop ────────────────────────────────────────────────────────────
    def run(self, max_ticks: int = 0):
        self.running = True
        self.logger.info("Living Desktop entering main loop.")
        try:
            while self.running:
                if max_ticks and self._tick >= max_ticks:
                    break
                self._tick_cycle()
                time.sleep(0.1)   # 10 Hz heartbeat
        except KeyboardInterrupt:
            self.logger.info("Shutdown requested by user.")
        finally:
            self.running = False
            self.logger.info("Living Desktop stopped.")

    # ── Per-tick logic ───────────────────────────────────────────────────────
    def _tick_cycle(self):
        self._tick += 1
        with self._lock:
            # 1. Biological pulse across all windows
            self.bridge.broadcast_high_intensity_pulse(0.3)

            # 2. Render each window to framebuffer
            for w in self.windows:
                glow = self.shader.compute_vitality_glow(w.vitality)
                self.renderer.clear((5, 5, 25))       # deep space background
                # Write glow pixel (simplified — center cell indicator)
                self.renderer.sync_to_uefi()

            # 3. Every 30 ticks: sync registry + poll Hermes inbox
            if self._tick % 30 == 0:
                self._sync_registry()
                self._poll_inbox()

            # 4. Status print every 50 ticks
            if self._tick % 50 == 0:
                self._print_status()

    def _sync_registry(self):
        if not self.hermes:
            return
        reg = [
            {
                "window_id": w.window_id,
                "vitality": round(w.vitality, 4),
                "state_flags": w.state_flags,
                "respiration_rate": w.respiration_rate,
            }
            for w in self.windows
        ]
        self.hermes.push_registry(reg)

    def _poll_inbox(self):
        if not self.hermes:
            return
        messages = self.hermes.inbox()
        for msg in messages:
            channel = msg.get("channel", 0)
            data    = msg.get("data", {})
            self.logger.info(f"[Hermes] incoming ch=0x{channel:04X} data={data}")
            self._handle_hermes_message(channel, data)

    def _handle_hermes_message(self, channel: int, data: dict):
        # OO_CH_DIOP_IN = 0x0104
        if channel == 0x0104:
            cmd = data.get("command", "")
            self.logger.info(f"[DIOP] command received: {cmd}")
        # OO_CH_PULSE = 0x1010
        elif channel == 0x1010:
            self.bridge.broadcast_high_intensity_pulse(data.get("intensity", 0.5))
        else:
            self.logger.debug(f"[Hermes] unknown channel 0x{channel:04X}, ignored.")

    def _print_status(self):
        avg_vitality = sum(w.vitality for w in self.windows) / max(len(self.windows), 1)
        self.logger.info(
            f"[tick={self._tick:06d}] windows={len(self.windows)} "
            f"avg_vitality={avg_vitality:.3f} fb={self.fb.width}×{self.fb.height}"
        )

    def status_dict(self) -> dict:
        return {
            "organism_id": self.organism_id,
            "tick": self._tick,
            "windows": [
                {"id": w.window_id, "vitality": round(w.vitality, 4), "flags": w.state_flags}
                for w in self.windows
            ],
            "framebuffer": {"width": self.fb.width, "height": self.fb.height, "base": hex(self.fb.base_addr)},
        }

    def stop(self):
        self.running = False


# ── CLI entry-point ──────────────────────────────────────────────────────────
def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s  %(message)s",
        datefmt="%H:%M:%S",
    )

    parser = argparse.ArgumentParser(description="OO Living Desktop Runtime")
    parser.add_argument("--organism-id", default="oo-desktop-0", help="Organism identifier")
    parser.add_argument("--colony", default=None, help="Colony server URL (e.g. http://127.0.0.1:8080)")
    parser.add_argument("--ticks", type=int, default=0, help="Max ticks (0 = infinite)")
    args = parser.parse_args()

    desktop = LivingDesktop(
        organism_id=args.organism_id,
        colony_url=args.colony,
    )
    desktop.boot()
    desktop.run(max_ticks=args.ticks)


if __name__ == "__main__":
    main()
