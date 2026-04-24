# 🛡️ Sentinel-Bot: Autonomous Intrusion Prevention System (IPS)

Sentinel-Bot es una solución integral de seguridad de red diseñada para la **detección proactiva y neutralización** de dispositivos no autorizados en entornos LAN. El sistema actúa como un centinela digital, fusionando el escaneo de bajo nivel de **Nmap** con la capacidad de respuesta activa de **Python (Scapy)** bajo una arquitectura dirigida por eventos en **Node.js**.

## 🚀 Funcionalidades Core

* **Patrullaje Automatizado:** Implementación de escaneos cíclicos mediante `nmap -sn` para el descubrimiento de hosts sin degradar el rendimiento de la red.
* **Respuesta Activa (IPS):** Mitigación inmediata de amenazas mediante **ARP Poisoning**. El sistema aísla al intruso del Gateway, cortando su comunicación a nivel de Capa 2.
* **Telemetría y Alertas:** Integración con **Discord Webhooks** para el envío de reportes detallados (IP, MAC, Fabricante y Timestamp).
* **Validación de Identidad:** Sistema de *Whitelist* avanzado que cruza direcciones MAC registradas para prevenir ataques de suplantación.
* **Dashboard Visual:** Monitorización en tiempo real mediante WebSockets para una gestión visual del estado de la red.

## 🏗️ Arquitectura del Sistema

El flujo de operación se divide en tres capas críticas:
1.  **Capa de Reconocimiento (Node.js + Nmap):** Identifica cambios en la topología de la red.
2.  **Capa de Decisión (Logic Engine):** Contrasta los hallazgos con la base de datos de confianza (`.env`).
3.  **Capa de Ejecución (Python + Scapy):** Lanza las contramedidas de red de forma quirúrgica.



## 🛠️ Stack Tecnológico

| Componente | Tecnología | Función |
| :--- | :--- | :--- |
| **Orquestador** | Node.js | Gestión de procesos y lógica de eventos. |
| **Motor IPS** | Python (Scapy) | Inyección de paquetes y manipulación de tablas ARP. |
| **Scanner** | Nmap | Descubrimiento de activos y huella digital. |
| **Frontend** | Socket.io | Dashboard interactivo en tiempo real. |

## 📦 Instalación y Setup

### Requisitos Técnicos
* **Node.js** v16+ y **Python 3.x**.
* **Nmap** instalado en el PATH del sistema.
* Privilegios de **Administrador/Root** (necesarios para el envío de paquetes Raw).

### Configuración del Entorno
1.  Clona el repositorio: `git clone https://github.com/tu_usuario/sentinel-bot.git`
2.  Instala dependencias: `npm install` y `pip install scapy`
3.  Configura el archivo `.env`:
    ```env
    DISCORD_WEBHOOK_URL=[https://discord.com/api/webhooks/](https://discord.com/api/webhooks/)...
    GATEWAY_IP=192.168.1.1
    IPS_AUTORIZADAS=192.168.1.10,192.168.1.15
    MACS_AUTORIZADAS=XX:XX:XX:XX:XX:XX,YY:YY:YY:YY:YY:YY
    ```

## ⚠️ Disclaimer Etico
Esta herramienta ha sido desarrollada exclusivamente para fines educativos y de auditoría en redes domésticas bajo control del propietario. El uso de técnicas de ARP Spoofing en redes ajenas sin autorización es ilegal y poco ético.
