#!/bin/bash
# One-time server setup script.
# Run this once to configure nginx and obtain SSL for lite.mindofapollo.org.
# Requires: DNS A record for lite.mindofapollo.org pointing to the server IP.
set -e

REMOTE=apollo-do
NGINX_DIR=/etc/nginx/sites-available

echo "==> Copying nginx configs..."
scp server/nginx/concluder.org      $REMOTE:$NGINX_DIR/concluder.org
scp server/nginx/lite.mindofapollo.org $REMOTE:$NGINX_DIR/lite.mindofapollo.org

echo "==> Enabling lite.mindofapollo.org site..."
ssh $REMOTE "ln -sf $NGINX_DIR/lite.mindofapollo.org /etc/nginx/sites-enabled/lite.mindofapollo.org"

echo "==> Testing and reloading nginx..."
ssh $REMOTE "nginx -t && systemctl reload nginx"

echo "==> Obtaining SSL certificate for lite.mindofapollo.org..."
ssh $REMOTE "certbot --nginx -d lite.mindofapollo.org --non-interactive --agree-tos -m admin@mindofapollo.org"

echo "==> Reloading nginx with SSL..."
ssh $REMOTE "nginx -t && systemctl reload nginx"

echo "==> Creating .env for wiki_concluder server (edit with your DB credentials)..."
ssh $REMOTE "test -f /root/wiki_concluder/server/.env || cat > /root/wiki_concluder/server/.env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=wiki_concluder
EOF"

echo ""
echo "Done! Next steps:"
echo "  1. Edit the .env on the server: ssh $REMOTE 'nano /root/wiki_concluder/server/.env'"
echo "  2. Run ./deploy.sh to deploy the application"
