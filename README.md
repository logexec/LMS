# Desarrollo local de LMS

Este repositorio contiene el setup de Docker para correr el proyecto LMS.

## Quick start

1. Hay que asegurarse de tener Docker y Docker Compose instalados.
2. Crear un directorio `letsencrypt` en la raiz del proyecto y poner los certificados SSL dentro de `live/lms-dev.logex.com.ec/` (`fullchain.pem` y `privkey.pem`). Para desarrollo local se puede generar certificados auto-firmados o usar una herramienta como `mkcert`.
3. Verifica que tu `/etc/hosts` incluye `127.0.0.1 lms-dev.logex.com.ec`.
4. Revisa los ficheros `.env` en `backend/` y `frontend/` y asegurate de que los valores coincidan con el dominio local:
   - `APP_URL=https://lms-dev.logex.com.ec`
   - `SANCTUM_STATEFUL_DOMAINS=lms-dev.logex.com.ec`
   - `SESSION_DOMAIN=lms-dev.logex.com.ec`
   - `NEXT_PUBLIC_API_URL=https://lms-dev.logex.com.ec`
5. Inicia el stack:

```bash
docker compose up --build
```

Nginx va a estar disponible en `https://lms-dev.logex.com.ec`.
