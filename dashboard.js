const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración para leer la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('✅ Administrador conectado al Dashboard');
});

// FUNCIÓN CLAVE: Esta es la que usarás para enviar datos desde tu bot real
app.get('/enviar-alerta', (req, res) => {
    const { tipo, msg, ip, mac } = req.query;
    const alerta = {
        tipo: tipo || 'INFO',
        mensaje: msg || 'Actividad detectada',
        ip: ip || '0.0.0.0',
        mac: mac || 'N/A',
        timestamp: new Date().toLocaleTimeString()
    };
    io.emit('alerta-seguridad', alerta);
    res.send('Alerta procesada');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`  SENTINEL-BOT: MODO VISUALIZACIÓN`);
    console.log(`  Panel: http://localhost:${PORT}`);
    console.log(`=========================================\n`);
});