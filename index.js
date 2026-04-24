require('dotenv').config();
const { spawn } = require('child_process');
const nmap = require('node-nmap');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// --- CONFIGURACIÓN ---
const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });
const alertasEnviadas = new Set();
const DASHBOARD_URL = 'http://localhost:3000/enviar-alerta';

// --- COMUNICACIÓN CON DASHBOARD ---
async function reportarAlDashboard(tipo, msg, ip, mac) {
    try {
        await axios.get(DASHBOARD_URL, {
            params: { tipo, msg, ip, mac }
        });
    } catch (error) {
        // El bot continúa si el dashboard está offline
    }
}

// --- RESPUESTA ACTIVA (EXPULSIÓN) ---
function activarExpulsion(ipIntruso, macIntruso) {
    const gateway = process.env.GATEWAY_IP || '192.168.1.1';
    console.log(`[🔥] SENTINEL: Iniciando contramedida contra ${ipIntruso}`);

    reportarAlDashboard('BLOQUEO', 'Protocolo de expulsión ARP iniciado', ipIntruso, macIntruso);

    // Ejecución del script de Python (Asegúrate de que kick.py esté en el repo)
    const ataque = spawn('python', ['kick.py', ipIntruso, gateway]);

    setTimeout(() => {
        ataque.kill();
        console.log(`[🛡️] SENTINEL: Bloqueo finalizado para ${ipIntruso}.`);
        reportarAlDashboard('INFO', 'Bloqueo finalizado (Tiempo cumplido)', ipIntruso, macIntruso);
    }, 120000);
}

// --- MOTOR DE VIGILANCIA ---
function startScan() {
    const red = process.env.RED_LOCAL || '192.168.1.0/24';
    // Usamos -sn para escaneo rápido de red
    const scan = new nmap.NmapScan(red, '-sn'); 
    
    console.log("🛡️ Sentinel Guardián Activo | Patrullando red...");

    scan.on('complete', (data) => {
        // Cargamos listas de autorización desde variables de entorno
        const autorizadasIP = (process.env.IPS_AUTORIZADAS || "").split(',').map(ip => ip.trim());
        const autorizadasMAC = (process.env.MACS_AUTORIZADAS || "").toUpperCase().split(',').map(mac => mac.trim());

        data.forEach(device => {
            const ip = device.ip;
            const mac = device.mac ? device.mac.toUpperCase() : 'N/A';

            // Verificación cruzada (IP o MAC)
            const esSeguro = autorizadasIP.includes(ip) || autorizadasMAC.includes(mac);

            if (esSeguro) {
                reportarAlDashboard('SEGURO', 'Dispositivo autorizado detectado', ip, mac);
                return;
            }

            // Gestión de Intrusos
            if (!alertasEnviadas.has(mac !== 'N/A' ? mac : ip)) {
                alertasEnviadas.add(mac !== 'N/A' ? mac : ip);
                console.log(`[!] ALERTA: Intruso detectado en ${ip} [${mac}]`);
                
                reportarAlDashboard('DETECCION', '¡Intruso no autorizado!', ip, mac);
                activarExpulsion(ip, mac);
                
                // Alerta a Discord
                const embed = new EmbedBuilder()
                    .setTitle(`🚨 INTRUSO DETECTADO`)
                    .setColor(0xFF0000)
                    .addFields(
                        { name: 'IP', value: ip, inline: true },
                        { name: 'MAC', value: mac, inline: true }
                    )
                    .setTimestamp();
                webhook.send({ embeds: [embed] }).catch(() => {});
            }
        });
        console.log(`[${new Date().toLocaleTimeString()}] Patrullaje completado.`);
    });

    scan.on('error', (err) => console.error('Error en Nmap:', err));
    scan.startScan();
}

setInterval(startScan, 60000); // Patrullaje cada minuto
startScan();