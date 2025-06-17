
<p align="center"><img src="https://github.com/Ghost-Dev9/Devmin/blob/master/images/Devmin-blue.png" alt="DVT-SMM" width="310px"></p>
<p align="center"><img src="https://github.com/Devmin-Server/DVT-SMM/blob/main/frontend/generated-image.png" alt="DVT-SMM" width="1010px"></p>
Panel SMM professionnel avec intégration Chargily Pay pour l'Algérie.

## 🚀 Fonctionnalités

- **Dashboard moderne** avec thème bleu responsive
- **Authentification sécurisée** avec JWT et refresh tokens
- **Intégration Chargily Pay** (CIB/Edahabia) pour l'Algérie
- **Gestion des services SMM** multi-plateformes
- **Système de commandes** automatisé
- **Panel d'administration** complet
- **API RESTful** documentée
- **Support mobile** responsive

## 🛠️ Technologies

### Backend
- Node.js + Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- Chargily Pay V2 API
- Docker pour le déploiement

### Frontend
- React 18 + Hooks
- Tailwind CSS pour le design
- React Query pour la gestion des données
- React Router pour la navigation
- Recharts pour les graphiques

## 📦 Installation Rapide

### 1. Prérequis
```bash
# Node.js 18+
node --version

# Docker et Docker Compose
docker --version
docker-compose --version
```

### 2. Cloner le projet
```bash
git clone https://github.com/votre-username/dev-it-smm-panel.git
cd dev-it-smm-panel
```

### 3. Configuration
```bash
# Copier les fichiers d'environnement
cp backend/.env.example backend/.env

# Modifier les variables dans backend/.env
# CHARGILY_API_KEY=votre_cle_api_chargily
# CHARGILY_SECRET_KEY=votre_cle_secrete_chargily
```

### 4. Démarrage avec Docker
```bash
# Construire et démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### 5. Accès à l'application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: localhost:27017

### 6. Compte admin par défaut
- **Email**: admin@dev-it.dz
- **Mot de passe**: admin123

## 🔧 Installation Manuelle

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Base de données
```bash
# MongoDB local
mongod --dbpath /data/db

# Ou utiliser MongoDB Atlas (cloud)
```

## 📝 Configuration Chargily Pay

1. Créer un compte sur [Chargily.com](https://chargily.com)
2. Obtenir vos clés API (test et production)
3. Configurer les webhooks :
   - URL: `https://votre-domaine.com/api/payments/webhook`
   - Événements: `checkout.paid`, `checkout.failed`

## 🌐 Déploiement

### Production avec Docker
```bash
# Construire pour la production
docker-compose -f docker-compose.prod.yml up -d

# Ou déployer sur un VPS
git clone https://github.com/Devmin-Server/DVT-SMM.git
cd dev-it-smm-panel
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Variables d'environnement production
```bash
NODE_ENV=production
MONGODB_URI=mongodb://username:password@host:port/database
CHARGILY_API_KEY=live_pk_votre_cle_production
CHARGILY_SECRET_KEY=live_sk_votre_cle_production
FRONTEND_URL=https://votre-domaine.com
```

## 📱 API Documentation

### Authentification
```bash
# Inscription
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

# Connexion
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Services
```bash
# Liste des services
GET /api/services

# Services par plateforme
GET /api/services?platform=instagram&category=followers
```

### Commandes
```bash
# Créer une commande
POST /api/orders
{
  "serviceId": "service_id",
  "quantity": 1000,
  "targetUrl": "https://instagram.com/profile"
}
```

### Paiements
```bash
# Créer un paiement
POST /api/payments/create
{
  "amount": 1500,
  "method": "chargily_cib",
  "description": "Recharge de compte"
}
```

## 🔐 Sécurité

- Authentification JWT avec tokens de rafraîchissement
- Validation des données avec Joi
- Protection CSRF et XSS
- Rate limiting par IP
- Chiffrement des mots de passe avec bcrypt
- Validation des webhooks Chargily

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📊 Monitoring

- Logs structurés avec Morgan
- Métriques de performance
- Monitoring des erreurs
- Dashboard admin avec analytics

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Email**: support@dev-it.dz
- **Website**: https://dev-it.dz
- **GitHub Issues**: Pour les bugs et demandes de fonctionnalités

## 🏗️ Architecture

```
dev-it-smm-panel/
├── backend/              # API Node.js/Express
│   ├── config/          # Configuration
│   ├── controllers/     # Contrôleurs
│   ├── models/         # Modèles MongoDB
│   ├── routes/         # Routes API
│   ├── middleware/     # Middlewares
│   ├── services/       # Services métier
│   └── utils/          # Utilitaires
├── frontend/            # Interface React
│   ├── public/         # Fichiers publics
│   ├── src/
│   │   ├── components/ # Composants React
│   │   ├── pages/      # Pages
│   │   ├── contexts/   # Contextes React
│   │   ├── services/   # Services API
│   │   └── styles/     # Styles CSS
├── docker/             # Configuration Docker
├── docs/               # Documentation
└── scripts/            # Scripts utilitaires
```

---

Développé avec ❤️ par l'équipe Dev-IT
