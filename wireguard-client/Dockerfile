FROM alpine:3.18

RUN apk add --no-cache wireguard-tools iproute2

# Creamos carpeta de configs
RUN mkdir -p /etc/wireguard

# Copiamos tu wg0.conf
COPY wg0.conf /etc/wireguard/wg0.conf

# Definimos zona horaria (opcional)
ENV TZ=America/Guayaquil

# Al iniciar levanta wg0 y deja el contenedor vivo
CMD wg-quick up wg0 && tail -f /dev/null
