# Guide d'Installation Détaillé - Dev-IT SMM Panel

## 📋 Vue d'ensemble

Ce guide vous accompagne étape par étape pour installer et configurer votre panel SMM avec intégration Chargily Pay.

## 🎯 Prérequis

### Système
- OS: Ubuntu 20.04+ / CentOS 8+ / Windows 10+ / macOS 10.15+
- RAM: Minimum 2GB (4GB recommandé)
- Stockage: 10GB d'espace libre
- Connexion Internet stable

### Logiciels requis
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose
sudo apt-get install docker-compose-plugin
```

## 🚀 Installation Rapide (Recommandée)

### 1. Télécharger le projet
```bash
# Extraire le fichier ZIP
unzip dev-it-smm-panel-v1.0.zip
cd dev-it-smm-panel
```

### 2. Configuration initiale
```bash
# Copier le fichier d'environnement
cp backend/.env.example backend/.env

# Éditer la configuration
nano backend/.env
```

### 3. Variables Chargily Pay (IMPORTANT)
Modifiez ces variables dans `backend/.env`:
```bash
# Mode test pour débuter
CHARGILY_MODE=test
CHARGILY_API_KEY=test_pk_VOTRE_CLE_TEST_ICI
CHARGILY_SECRET_KEY=test_sk_VOTRE_CLE_SECRETE_TEST_ICI

# En production, utilisez:
# CHARGILY_MODE=prod
# CHARGILY_API_KEY=live_pk_VOTRE_CLE_PRODUCTION_ICI
# CHARGILY_SECRET_KEY=live_sk_VOTRE_CLE_SECRETE_PRODUCTION_ICI
```

### 4. Démarrage avec Docker
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### 5. Accès à l'application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Compte admin: admin@dev-it.dz / admin123

## 🔧 Installation Manuelle

### 1. Installation du backend
```bash
cd backend

# Installer les dépendances
npm install

# Copier et configurer l'environnement
cp .env.example .env
nano .env

# Démarrer MongoDB localement
sudo systemctl start mongod

# Lancer le backend
npm run dev
```

### 2. Installation du frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier d'environnement
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Lancer le frontend
npm start
```

## 🏗️ Configuration Chargily Pay

### 1. Créer un compte Chargily
1. Visitez https://chargily.com
2. Créez un compte développeur
3. Vérifiez votre email

### 2. Obtenir les clés API
1. Connectez-vous au dashboard Chargily
2. Allez dans "Développeurs" > "Clés API"
3. Copiez vos clés de test et production

### 3. Configurer les webhooks
```bash
# URL de webhook à ajouter dans Chargily:
https://votre-domaine.com/api/payments/webhook

# Événements à activer:
- checkout.paid
- checkout.failed
- checkout.cancelled
```

## 🌐 Déploiement en Production

### Option 1: VPS avec Docker
```bash
# Sur votre serveur VPS
git clone https://github.com/votre-repo/dev-it-smm-panel.git
cd dev-it-smm-panel

# Configuration production
cp backend/.env.example backend/.env
nano backend/.env  # Configurer pour production

# Déployer
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### Option 2: Hébergement traditionnel
```bash
# Backend (ex: sur un serveur Node.js)
cd backend
npm install --production
npm run build
npm start

# Frontend (ex: sur Netlify/Vercel)
cd frontend
npm run build
# Uploader le dossier 'build' sur votre hébergeur
```

## 🔐 Configuration Sécurité

### 1. Certificats SSL
```bash
# Avec Certbot (Let's Encrypt)
sudo apt install certbot
sudo certbot --nginx -d votre-domaine.com
```

### 2. Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Variables de production
```bash
# Dans backend/.env
NODE_ENV=production
JWT_SECRET=un_secret_tres_fort_de_32_caracteres_minimum
MONGODB_URI=mongodb://user:pass@host:port/database
```

## 📊 Monitoring et Maintenance

### 1. Logs en temps réel
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Logs système
tail -f /var/log/nginx/access.log
```

### 2. Sauvegarde de la base de données
```bash
# Script de sauvegarde automatique
#!/bin/bash
mongodump --uri="mongodb://user:pass@host:port/database" \
  --out="/backup/$(date +%Y%m%d-%H%M%S)"
```

### 3. Mises à jour
```bash
# Arrêter les services
docker-compose down

# Mettre à jour le code
git pull origin main

# Redémarrer
docker-compose up -d
```

## 🐛 Résolution de problèmes

### Problème: Port déjà utilisé
```bash
# Trouver le processus utilisant le port
sudo lsof -i :3000
sudo lsof -i :5000

# Arrêter le processus
sudo kill -9 PID
```

### Problème: Base de données non accessible
```bash
# Vérifier MongoDB
sudo systemctl status mongod
sudo systemctl start mongod

# Vérifier la connexion
mongo mongodb://localhost:27017/devit-smm
```

### Problème: Erreurs Chargily Pay
```bash
# Vérifier les clés API
curl -H "Authorization: Bearer VOTRE_CLE_API" \
  https://pay.chargily.net/test/api/v2/balance

# Vérifier les webhooks
tail -f logs/webhook.log
```

## 📞 Support Technique

### Documentation API
- Swagger: http://localhost:5000/api/docs
- Postman Collection: `docs/api.postman_collection.json`

### Contact Support
- Email: support@dev-it.dz
- GitHub Issues: Pour les bugs
- Documentation: README.md

### Communauté
- Discord: [Lien vers serveur Discord]
- Forum: [Lien vers forum]

## ✅ Checklist Post-Installation

- [ ] Application accessible sur http://localhost:3000
- [ ] API répond sur http://localhost:5000/api/health
- [ ] Connexion admin fonctionne (admin@dev-it.dz)
- [ ] Services SMM visibles
- [ ] Test de création de commande
- [ ] Configuration Chargily Pay testée
- [ ] Webhooks configurés
- [ ] SSL activé (production)
- [ ] Sauvegarde automatique configurée
- [ ] Monitoring en place

---

🎉 **Félicitations !** Votre panel SMM Dev-IT est maintenant opérationnel.

Pour toute question, consultez la documentation ou contactez le support.
