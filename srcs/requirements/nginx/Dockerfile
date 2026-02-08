FROM nginx:1.28.0-alpine

# Without the -p flag, mkdir can only create 
# one folder at a time, and the "parent" folder must already exist.
RUN mkdir -p /etc/nginx/certs

# Alpine’s package manager (apk) to refresh its package index —
# basically, to download the latest list of what software versions are available
# If your image is old, its cached package index 
# (stored in /var/lib/apk) may point to outdated URLs or removed packages.
RUN apk update && apk add --no-cache openssl


# Generate a self-signed cert inside the image
# -x509 - Create self-signed certificate instead of CSR
# -nodes - No DES encryption (private key not password-protected)
# -days 365 - Certificate valid for 1 year
# -newkey rsa:2048 - Generate new 2048-bit RSA key
# -subj - Subject details for the certificate
# /C=TR         → Country: Turkey
# /ST=Istanbul  → State/Province: Istanbul  
# /L=Istanbul   → Locality/City: Istanbul
# /O=Example    → Organization: Example
# /OU=IT        → Organizational Unit: IT
# /CN=localhost → Common Name: localhost
# TLS (Transport Layer Security) newer SSL
# SSL (Secure Sockets Layer) deprecated
RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/certs/server.key \
    -out /etc/nginx/certs/server.crt \
    -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Example/OU=IT/CN=localhost"

# COPY sources are relative to the build context, not the Dockerfile’s directory
# niginx birden fazla conf doyasi ile calisabilir, ve birlestirir
RUN rm -f /etc/nginx/conf.d/* 
COPY conf/nginx.conf /etc/nginx/conf.d/nginx.conf

# Default arguments: stay in foreground
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
