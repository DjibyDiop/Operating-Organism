package com.yamaoo.yama.service;

import com.yamaoo.yama.websocket.SomaWebSocketHandler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.hardware.NetworkIF;

import java.util.Arrays;
import java.util.List;

/**
 * SomaService — Le Cœur Battant du Backend
 * ─────────────────────────────────────────
 * Ce service lit en continu les métriques RÉELLES du hardware (pas de simulation).
 * Il utilise la librairie OSHI pour accéder directement aux données baremetal :
 * CPU, RAM, réseau — et les transmet via le SomaWebSocketHandler aux interfaces React.
 *
 * Philosophie : Ce service EST le "sang" de l'Organisme. Chaque battement
 * (invocation du scheduler) pompe des données vitales vers la conscience visuelle.
 */
@Service
@EnableScheduling
public class SomaService {

    private final SomaWebSocketHandler somaWebSocketHandler;
    private final SystemInfo systemInfo = new SystemInfo();
    private final HardwareAbstractionLayer hardware = systemInfo.getHardware();
    private final CentralProcessor cpu = hardware.getProcessor();
    private final GlobalMemory memory = hardware.getMemory();

    // Snapshot des ticks CPU précédents pour calculer le % d'usage
    private long[] prevTicks = cpu.getSystemCpuLoadTicks();

    public SomaService(SomaWebSocketHandler somaWebSocketHandler) {
        this.somaWebSocketHandler = somaWebSocketHandler;
    }

    /**
     * BATTEMENT VITAL — Toutes les 2 secondes
     * Collecte et diffuse les données SYSTEM_VITALS vers le SomaBridge frontend.
     */
    @Scheduled(fixedRate = 2000)
    public void broadcastSystemVitals() {
        // --- CPU RÉEL ---
        long[] ticks = cpu.getSystemCpuLoadTicks();
        double cpuLoad = cpu.getSystemCpuLoadBetweenTicks(prevTicks) * 100.0;
        prevTicks = ticks;

        // --- RAM RÉELLE ---
        long totalMem = memory.getTotal();
        long availMem = memory.getAvailable();
        double memUsedPct = (1.0 - ((double) availMem / totalMem)) * 100.0;
        long memUsedGB = (totalMem - availMem) / (1024 * 1024 * 1024);
        long memTotalGB = totalMem / (1024 * 1024 * 1024);

        // --- RÉSEAU RÉEL ---
        List<NetworkIF> nets = hardware.getNetworkIFs();
        long bytesSent = 0, bytesRecv = 0;
        for (NetworkIF net : nets) {
            net.updateAttributes();
            bytesSent += net.getBytesSent();
            bytesRecv += net.getBytesRecv();
        }

        // --- PHAGES (Processus actifs) ---
        int processCount = systemInfo.getOperatingSystem().getProcessCount();

        // Forge du payload JSON
        String vitalsJson = String.format(
            "{\"topic\": \"SYSTEM_VITALS\", \"payload\": {" +
            "\"cpuNeural\": %.1f, " +
            "\"memory\": %.1f, " +
            "\"memUsedGB\": %d, " +
            "\"memTotalGB\": %d, " +
            "\"networkSentKB\": %.1f, " +
            "\"networkRecvKB\": %.1f, " +
            "\"activeProcesses\": %d" +
            "}}",
            cpuLoad, memUsedPct, memUsedGB, memTotalGB,
            bytesSent / 1024.0, bytesRecv / 1024.0,
            processCount
        );

        somaWebSocketHandler.broadcast(vitalsJson);
    }

    /**
     * ALERTE PHAGE — Toutes les 5 secondes
     * Scanne les processus actifs et identifie des "menaces" (usage CPU anormalement élevé).
     * Envoie les données PHAGE_ALERTS vers les Phages de l'ImmuneSystemScreen.
     */
    @Scheduled(fixedRate = 5000)
    public void broadcastPhageAlerts() {
        // Cherche les 5 processus qui consomment le plus de CPU
        var threats = systemInfo.getOperatingSystem()
            .getProcesses().stream()
            .filter(p -> p.getProcessCpuLoadBetweenTicks(null) > 0.01)
            .limit(5)
            .map(p -> String.format("{\"pid\": %d, \"name\": \"%s\", \"cpuPct\": %.1f}",
                p.getProcessID(), p.getName(), p.getProcessCpuLoadBetweenTicks(null) * 100))
            .toList();

        String json = String.format(
            "{\"topic\": \"PHAGE_ALERTS\", \"payload\": {\"threats\": [%s]}}",
            String.join(",", threats)
        );

        somaWebSocketHandler.broadcast(json);
    }
}
