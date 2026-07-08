# Déployer le site sur ton VPS

Guide pour passer de la démo locale au VPS (Ubuntu/Debian supposé). À faire quand la démo te convient.

## 1. Installer les prérequis sur le VPS

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB Community (voir la doc officielle selon ta version d'OS)
# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
sudo systemctl enable --now mongod

# PM2 (garde l'API allumée) + nginx (sert le site)
sudo npm install -g pm2
sudo apt-get install -y nginx
```

> MongoDB doit écouter **uniquement en local** (`bindIp: 127.0.0.1` dans `/etc/mongod.conf`, c'est le défaut). Ne jamais l'exposer sur internet. Pour le consulter avec Compass depuis ton PC : tunnel SSH → `ssh -L 27017:localhost:27017 user@ton-vps`, puis Compass sur `mongodb://localhost:27017`.

## 2. Récupérer le code

```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/Lennynpj/site_lenny.git
sudo chown -R $USER:$USER /var/www/site_lenny
```

## 3. Backend

```bash
cd /var/www/site_lenny/server
npm install
cp .env .env.bak 2>/dev/null; cat > .env <<'EOF'
MONGODB_URI=mongodb://localhost:27017/site_lenny
PORT=3001
EOF

npm run seed                      # première fois seulement
pm2 start "npm run start" --name site-lenny-api
pm2 save && pm2 startup           # relance auto au reboot
```

## 4. Frontend (build statique)

```bash
cd /var/www/site_lenny/client
npm install
npm run build                     # génère client/dist/
```

## 5. nginx

`/etc/nginx/sites-available/site_lenny` :

```nginx
server {
    listen 80;
    server_name ton-domaine.fr;    # ou l'IP du VPS

    root /var/www/site_lenny/client/dist;
    index index.html;

    # React Router : toutes les routes renvoient index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API → Node
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/site_lenny /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 6. HTTPS (recommandé, gratuit)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ton-domaine.fr
```

## 7. Mise à jour du site

Après un `git push` depuis ton PC :

```bash
ssh user@ton-vps
cd /var/www/site_lenny && git pull
cd server && npm install
cd ../client && npm install && npm run build
pm2 restart site-lenny-api
```

## Sauvegarde de la base

```bash
# Sur le VPS, dump quotidien possible en cron
mongodump --db site_lenny --out /var/backups/mongo/$(date +%F)
```
