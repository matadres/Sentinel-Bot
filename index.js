require('dotenv').config(); // <--- Esto carga los secretos
const nmap = require('node-nmap');
const { WebhookClient, EmbedBuilder } = require('discord.js');

// 1. TU URL DE WEBHOOK (La que ya te funciona)
const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });

const RED = '192.168.1.0/24'; 

// ==========================================================
// 🛡️ LISTA BLANCA ACTUALIZADA
// ==========================================================
const IPS_AUTORIZADAS = process.env.IPS_AUTORIZADAS.split(',');
    

console.log("🛡️ Sentinel Guardián Activo | Buscando intrusos...");

function startScan() {
    const scan = new nmap.QuickScan(RED);
    
    scan.on('complete', (data) => {
        data.forEach(device => {
            // Si detecta una IP que NO está en tu lista de arriba...
            if (!IPS_AUTORIZADAS.includes(device.ip)) {
                
                const embed = new EmbedBuilder()
                    .setTitle('⚠️ ¡INTRUSO DETECTADO EN LA RED!')
                    .setDescription('Un dispositivo no autorizado ha intentado conectar.')
                    .setColor(0xFF0000) 
                    .addFields(
                        { name: 'IP del Intruso', value: device.ip || 'N/A' },
                        { name: 'Fabricante', value: device.vendor || 'Desconocido' },
                        { name: 'Acción', value: '🚨 Monitoreando actividad...' }
                    )
                    .setTimestamp();

                webhook.send({ embeds: [embed] });
                console.log(`[!] ALERTA: Intruso en IP ${device.ip}`);
            }
        });
        console.log(`[${new Date().toLocaleTimeString()}] Patrullaje completado. Red segura.`);
    });

    scan.on('error', (error) => console.error('Error:', error));
    scan.startScan();
}

setInterval(startScan, 120000);
startScan();