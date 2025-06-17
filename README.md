# 🚀 DVT SMM Panel - Solution Complète

Panel SMM (Social Media Marketing) professionnel avec intégration Chargily Pay pour l'Algérie.

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Déploiement](#déploiement)
- [Support](#support)

## 🎯 Aperçu

DVT SMM est une plateforme complète de marketing sur les réseaux sociaux qui permet aux utilisateurs algériens de booster leur présence en ligne avec des services de qualité et des paiements sécurisés via Chargily Pay.

### Fonctionnalités Principales

- 🎨 **Interface moderne** avec thème bleu professionnel
- 🔐 **Authentification complète** (classique + OAuth Google/GitHub)
- 💳 **Paiements Chargily Pay** (CIB/EDAHABIA)
- 📊 **Dashboard analytics** avec Chart.js
- 🛒 **Catalogue de services** SMM multi-plateformes
- 👥 **Panel d'administration** complet
- 📱 **Design responsive** pour tous appareils

## 🛠️ Technologies

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js pour les graphiques
- Responsive design
- PWA Ready

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Passport.js (OAuth)
- Chargily Pay SDK

## ⚡ Installation Rapide

### Prérequis
```bash
Node.js >= 18.x
MongoDB >= 5.x
Git
```

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/dvt-smm-panel.git
cd dvt-smm-panel
```

### 2. Installation Backend
```bash
cd backend
npm install
```

### 3. Configuration
```bash
cp .env.example .env
# Modifier .env avec vos configurations
```

### 4. Démarrage
```bash
# Backend
npm run dev

# Frontend (serveur local)
npx serve ../frontend
```

## 🔧 Configuration

### Variables d'environnement (.env)
```env
# Base
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dvt-smm

# JWT
JWT_SECRET=votre-cle-jwt-securisee

# OAuth
GOOGLE_CLIENT_ID=votre-google-client-id
GITHUB_CLIENT_ID=votre-github-client-id

# Chargily Pay
CHARGILY_API_KEY=votre-cle-chargily
CHARGILY_SECRET_KEY=votre-secret-chargily
```

### Configuration Chargily Pay

1. Créer un compte sur [Chargily Pay](https://chargily.com)
2. Obtenir vos clés API (test/production)
3. Configurer le webhook endpoint : `https://votre-domaine.com/api/payments/webhook`
4. Ajouter les clés dans le fichier `.env`

### Configuration OAuth

#### Google OAuth
1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet ou sélectionner existant
3. Activer l'API Google+
4. Créer des identifiants OAuth 2.0
5. Ajouter les URLs autorisées :
   - `http://localhost:5000/api/auth/google/callback`
   - `https://votre-domaine.com/api/auth/google/callback`

#### GitHub OAuth
1. Aller dans les [paramètres GitHub](https://github.com/settings/developers)
2. Créer une nouvelle OAuth App
3. Configurer les URLs :
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`

## 🚀 Usage

### Interface Utilisateur

#### Landing Page
- Hero section attrayante
- Présentation des services
- Plans tarifaires
- Témoignages clients

#### Dashboard Utilisateur
- Statistiques personnelles
- Historique des commandes
- Gestion du solde
- Profil utilisateur

#### Panel Admin
- Vue d'ensemble des statistiques
- Gestion des utilisateurs
- Suivi des commandes
- Configuration des services

### API Endpoints

#### Authentification
```
POST /api/auth/register     # Inscription
POST /api/auth/login        # Connexion
GET  /api/auth/google       # OAuth Google
GET  /api/auth/github       # OAuth GitHub
GET  /api/auth/profile      # Profil utilisateur
```

#### Paiements
```
POST /api/payments/checkout      # Créer checkout
GET  /api/payments/history       # Historique
GET  /api/payments/status/:id    # Vérifier statut
POST /api/payments/webhook       # Webhook Chargily
```

### Exemples d'usage

#### Créer un checkout de paiement
```javascript
const response = await fetch('/api/payments/checkout', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        amount: 5000 // 5000 DZD
    })
});

const { checkout_url } = await response.json();
window.location.href = checkout_url;
```

#### Connexion utilisateur
```javascript
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'motdepasse123'
    })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

## 📊 Structure du Projet

```
dvt-smm-panel/
├── frontend/
│   ├── index.html          # Landing page
│   ├── style.css           # Styles globaux
│   ├── app.js              # Logique frontend
│   └── assets/             # Images, icônes
├── backend/
│   ├── server.js           # Point d'entrée
│   ├── config/             # Configurations
│   ├── controllers/        # Logique métier
│   ├── models/             # Modèles MongoDB
│   ├── routes/             # Routes API
│   ├── middleware/         # Middlewares
│   └── utils/              # Utilitaires
├── docs/                   # Documentation
├── tests/                  # Tests unitaires
└── README.md               # Ce fichier
```

## 🔒 Sécurité

### Mesures implémentées
- Authentification JWT sécurisée
- Validation des données d'entrée
- Protection CORS configurée
- Rate limiting pour les API
- Hashage bcrypt des mots de passe
- Vérification des webhooks Chargily
- Middleware de protection admin

### Best Practices
- Variables d'environnement pour les secrets
- Logs de sécurité
- Validation côté client et serveur
- HTTPS en production recommandé

## 🚀 Déploiement

### Déploiement Local
```bash
# Installation complète
npm run install:all

# Démarrage en développement
npm run dev

# Build production
npm run build

# Démarrage production
npm start
```

### Déploiement Cloud

#### Heroku
```bash
# Installation Heroku CLI
npm install -g heroku

# Connexion et création
heroku login
heroku create dvt-smm-app

# Variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...
heroku config:set CHARGILY_API_KEY=...

# Déploiement
git push heroku main
```

#### VPS/Serveur dédié
```bash
# Installation sur Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm mongodb

# Configuration Nginx
sudo nano /etc/nginx/sites-available/dvt-smm

# Certificat SSL avec Let's Encrypt
sudo certbot --nginx -d votre-domaine.com

# Process manager avec PM2
npm install -g pm2
pm2 start server.js --name="dvt-smm"
pm2 startup
pm2 save
```

## 📱 Fonctionnalités Mobiles

### PWA Features
- Installation sur écran d'accueil
- Fonctionnement hors ligne (cache)
- Notifications push
- Interface optimisée mobile

### Responsive Design
- Adaptation automatique aux écrans
- Navigation mobile intuitive
- Touch-friendly interface
- Performance optimisée

## 🔧 Maintenance

### Monitoring
- Logs applicatifs avec Morgan
- Surveillance des erreurs
- Métriques de performance
- Alertes automatiques

### Mises à jour
```bash
# Vérifier les dépendances
npm audit

# Mettre à jour
npm update

# Tests avant déploiement
npm test
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### Guidelines
- Suivre les standards ESLint
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les changements
- Respecter l'architecture existante

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Guide d'installation](docs/installation.md)
- [FAQ](docs/faq.md)

### Contact
- **Email**: support@dvt-smm.com
- **Telegram**: @dvt_smm_support
- **WhatsApp**: +213 XXX XXX XXX

### Community
- [Discord](https://discord.gg/dvt-smm)
- [Forum](https://forum.dvt-smm.com)
- [GitHub Issues](https://github.com/dvt-smm/issues)

---

## 🎉 Remerciements

Merci à tous les contributeurs et à la communauté open source pour leurs outils formidables :

- [Express.js](https://expressjs.com/) - Framework web
- [MongoDB](https://mongodb.com/) - Base de données
- [Chart.js](https://chartjs.org/) - Graphiques
- [Chargily Pay](https://chargily.com/) - Paiements Algérie
- [Passport.js](http://passportjs.org/) - Authentification

---

**Développé avec ❤️ par l'équipe Dev-IT**

*Boostez votre présence sociale avec DVT SMM !*
