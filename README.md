# 🛡️ Sentinel-Bot: Sistema Autónomo de Prevención de Intrusiones (IPS)

**Sentinel-Bot** es una herramienta de seguridad de red diseñada para monitorear, detectar y neutralizar dispositivos no autorizados en tiempo real dentro de una red local (LAN). Combina la potencia de escaneo de **Nmap**, la lógica de eventos en **Node.js** y la respuesta activa mediante **Python**.

## 🚀 Funcionalidades Principales
* **Monitoreo Continuo**: Escaneo automático de la red mediante `nmap -sn` para detectar hosts activos.
* **Respuesta Activa (Kick)**: Ejecución de contramedidas ARP (Spoofing) para aislar intrusos de la conexión a internet de forma inmediata.
* **Alertas en Tiempo Real**: Integración con **Discord Webhooks** para notificar detalles del intruso (IP, MAC, Fabricante).
* **Lista Blanca**: Gestión de dispositivos autorizados y validación de suplantación de identidad (MAC Checking).

## 🛠️ Stack Tecnológico
* **Node.js**: Orquestador del sistema y manejo de lógica de red.
* **Python (Scapy)**: Motor de inyección de paquetes para contramedidas de Capa 2.
* **Nmap**: Motor de descubrimiento de red profesional.
* **Discord.js**: Sistema de telemetría y alertas remotas.

## 📦 Instalación y Configuración

1. **Requisitos Previos**:
   * Tener instalado [Node.js](https://nodejs.org/) y [Python 3.x](https://www.python.org/).
   * Instalación de dependencias de red: `pip install scapy` y `npm install`.
   * Ejecutar la terminal como **Administrador** para permitir la inyección de paquetes.

2. **Configuración del Entorno**:
   Renombra el archivo `.env.example` a `.env` y completa tus datos:
   ```env
   DISCORD_WEBHOOK_URL=tu_url_aqui
   IPS_AUTORIZADAS=192.168.1.1,192.168.1.x
   GATEWAY_IP=192.168.1.1
