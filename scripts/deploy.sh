#!/bin/bash

# Script de déploiement Dev-IT SMM Panel
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="dev-it-smm-panel"

echo "🚀 Déploiement de $PROJECT_NAME en mode $ENVIRONMENT"

# Vérifier les prérequis
echo "🔍 Vérification des prérequis..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker n'est pas installé"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose n'est pas installé"; exit 1; }

# Arrêter les conteneurs existants
echo "⏹️ Arrêt des conteneurs existants..."
docker-compose down

# Sauvegarder la base de données (si elle existe)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "💾 Sauvegarde de la base de données..."
    docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/devit-smm?authSource=admin" --out=/tmp/backup-$(date +%Y%m%d-%H%M%S)
fi

# Construire les images
echo "🔨 Construction des images Docker..."
docker-compose build --no-cache

# Démarrer les services
echo "▶️ Démarrage des services..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier la santé des services
echo "🏥 Vérification de la santé des services..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend opérationnel"
else
    echo "❌ Erreur backend"
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend opérationnel"
else
    echo "❌ Erreur frontend"
    docker-compose logs frontend
    exit 1
fi

# Afficher les informations de déploiement
echo ""
echo "🎉 Déploiement terminé avec succès !"
echo ""
echo "📋 Informations de déploiement:"
echo "  - Environment: $ENVIRONMENT"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5000/api"
echo "  - Admin: admin@dev-it.dz / admin123"
echo ""
echo "📊 Statut des conteneurs:"
docker-compose ps

echo ""
echo "📝 Pour voir les logs:"
echo "  docker-compose logs -f"
