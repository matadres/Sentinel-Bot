require('dotenv').config();
const RED = process.env.RED_LOCAL || '192.168.1.0/24'; // Usa el env o uno por defecto
const fs = require('fs');
const os = require('os');
const nmap = require('node-nmap');
const { WebhookClient, EmbedBuilder } = require('discord.js');

const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });

const alertasEnviadas = new Set();

function obtenerMisIPs() {
    const interfaces = os.networkInterfaces();
    const misIPs = [];
    for (let interfaz in interfaces) {
        for (let config of interfaces[interfaz]) {
            if (config.family === 'IPv4' && !config.internal) {
                misIPs.push(config.address);
            }
        }
    }
    return misIPs;
}

function registrarEnLog(dispositivo) {
    const fecha = new Date().toLocaleString();
    const linea = `[${fecha}] IP: ${dispositivo.ip} | Fabricante: ${dispositivo.vendor || 'Desconocido'} | MAC: ${dispositivo.mac || 'N/A'}\n`;
    fs.appendFile('actividad.log', linea, (err) => {
        if (err) console.error('Error al escribir en log:', err);
    });
}

function enviarAlertaDiscord(device, tipo = "INTRUSO DETECTADO") {
    const embed = new EmbedBuilder()
        .setTitle(`🚨 ${tipo}`)
        .setDescription('Se ha detectado actividad no autorizada en la red.')
        .setColor(tipo.includes("SUPLANTACIÓN") ? 0xFF0000 : 0xFFFF00)
        .addFields(
            { name: 'IP', value: device.ip || 'N/A', inline: true },
            { name: 'MAC', value: device.mac || 'N/A', inline: true },
            { name: 'Fabricante', value: device.vendor || 'Desconocido', inline: false }
        )
        .setTimestamp();

    webhook.send({ embeds: [embed] });
}

function startScan() {
    const scan = new nmap.NmapScan(RED, '-sn'); // Escaneo rápido para detectar presencia
    console.log("🛡️ Sentinel Guardián Activo | Buscando...");

    scan.on('complete', (data) => {
        const misIPsActuales = obtenerMisIPs();
        const autorizadas = (process.env.IPS_AUTORIZADAS || "").split(',').map(ip => ip.trim());

        data.forEach(device => {
            const ip = device.ip;
            const mac = device.mac ? device.mac.toUpperCase() : 'N/A';

            // 1. AUTO-DETECCIÓN
            if (misIPsActuales.includes(ip)) return;

            // 2. VALIDACIÓN IP-MAC (Smart TV)
            if (ip === process.env.TV_IP) {
                if (mac === process.env.TV_MAC) return; 
                enviarAlertaDiscord(device, "ALERTA: POSIBLE SUPLANTACIÓN (MAC INCORRECTA)");
                registrarEnLog(device);
                return;
            }

            // 3. LISTA BLANCA Y ANTI-SPAM
            if (autorizadas.includes(ip) || alertasEnviadas.has(ip)) return;

            // 4. NUEVO INTRUSO
            alertasEnviadas.add(ip);
            console.log(`[!] ALERTA: Intruso en IP ${ip}`);
            enviarAlertaDiscord(device);
            registrarEnLog(device);
        });

        console.log(`[${new Date().toLocaleTimeString()}] Patrullaje completado.`);
    });

    scan.on('error', (err) => console.error('Error en Nmap:', err));
    scan.startScan();
}

setInterval(startScan, 120000); // Escanear cada 2 minutos
startScan();