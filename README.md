# 🛡️ Sentinel-Bot: Network Intrusion Detector

Sistema de monitoreo de red en tiempo real desarrollado en **Node.js**. Este bot patrulla la red local detectando dispositivos no autorizados y envía alertas inmediatas a un canal de Discord.

## 🚀 Características
- **Escaneo Automatizado:** Utiliza `node-nmap` para auditar la red cada 2 minutos.
- **Detección de Intrusos:** Compara cada dispositivo detectado contra una **Lista Blanca** de IPs autorizadas.
- **Alertas enriquecidas:** Notificaciones automáticas vía **Discord Webhooks** con detalles del fabricante y la IP del intruso.
- **Arquitectura Segura:** Implementación de variables de entorno (`dotenv`) para proteger credenciales y datos sensibles.

## 🛠️ Tecnologías Usadas
- **Runtime:** Node.js
- **Scanner:** Nmap (Network Mapper)
- **Comunicación:** Discord.js (Webhooks)
- **Seguridad:** Dotenv (Manejo de secretos)
