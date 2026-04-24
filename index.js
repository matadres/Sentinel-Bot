require('dotenv').config();
const { spawn } = require('child_process');
const nmap = require('node-nmap');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// --- INICIALIZACIÓN ---
const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });
const alertasEnviadas = new Set();

// --- FUNCIÓN DE RESPUESTA ACTIVA (EXPULSIÓN) ---
function activarExpulsion(ipIntruso) {
    const gateway = process.env.GATEWAY_IP || '192.168.1.1';
    console.log(`[🔥] SENTINEL: Iniciando contramedida ARP contra ${ipIntruso}`);

    // Ejecuta el script de Python que creamos anteriormente
    const ataque = spawn('python', ['kick.py', ipIntruso, gateway]);

    ataque.stdout.on('data', (data) => console.log(`[KICK-LOG]: ${data}`));
    ataque.stderr.on('data', (data) => console.error(`[KICK-ERR]: ${data}`));

    // Mantenemos el bloqueo por 2 minutos para neutralizar al intruso
    setTimeout(() => {
        ataque.kill();
        console.log(`[🛡️] SENTINEL: Bloqueo finalizado para ${ipIntruso}.`);
    }, 120000);
}

// --- FUNCIÓN DE ALERTAS ---
function enviarAlertaDiscord(device, tipo = "INTRUSO DETECTADO Y EXPULSADO") {
    const embed = new EmbedBuilder()
        .setTitle(`🚨 ${tipo}`)
        .setDescription('Se ha detectado un dispositivo no autorizado. El bot ha iniciado el protocolo de expulsión automática.')
        .setColor(0xFF0000) // Rojo para indicar acción defensiva
        .addFields(
            { name: 'IP', value: device.ip || 'N/A', inline: true },
            { name: 'MAC', value: device.mac || 'N/A', inline: true },
            { name: 'Fabricante', value: device.vendor || 'Desconocido', inline: false },
            { name: 'Estado', value: '⚡ Contramedida ARP Activa', inline: false }
        )
        .setTimestamp();

    webhook.send({ embeds: [embed] }).catch(err => console.error("Error Discord:", err));
}

// --- LÓGICA DE ESCANEO ---
function startScan() {
    const red = process.env.RED_LOCAL || '192.168.1.0/24';
    const scan = new nmap.NmapScan(red, '-sn'); 
    
    console.log("🛡️ Sentinel Guardián Activo | Patrullando red...");

    scan.on('complete', (data) => {
        const autorizadas = (process.env.IPS_AUTORIZADAS || "").split(',').map(ip => ip.trim());

        data.forEach(device => {
            const ip = device.ip;
            const mac = device.mac ? device.mac.toUpperCase() : 'N/A';

            // 1. Ignorar dispositivos en lista blanca
            if (autorizadas.includes(ip) || ip === process.env.TV_IP) return;

            // 2. Si no está autorizado y no hemos enviado alerta recientemente
            if (!alertasEnviadas.has(ip)) {
                alertasEnviadas.add(ip);
                console.log(`[!] ALERTA: Intruso detectado en ${ip}. Ejecutando kick.py...`);
                
                activarExpulsion(ip);
                enviarAlertaDiscord(device);
            }
        });

        console.log(`[${new Date().toLocaleTimeString()}] Patrullaje completado.`);
    });

    scan.on('error', (err) => console.error('Error en Nmap:', err));
    scan.startScan();
}

// Escaneo automático cada 60 segundos
setInterval(startScan, 60000);
startScan();