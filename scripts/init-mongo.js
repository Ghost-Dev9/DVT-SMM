// Script d'initialisation MongoDB pour Dev-IT SMM Panel

// Créer la base de données
db = db.getSiblingDB('devit-smm');

// Créer un utilisateur admin par défaut
db.users.insertOne({
  username: 'admin',
  email: 'admin@dev-it.dz',
  password: '$2a$12$LQv3c1yqBwEHxv4v4m5.L.K8YK2xYQ1GQH5Wr5xKZ1JqKq4Y4Y4Y4',
  firstName: 'Admin',
  lastName: 'Dev-IT',
  role: 'admin',
  balance: 0,
  totalSpent: 0,
  vipLevel: 'platinum',
  isActive: true,
  isEmailVerified: true,
  preferences: {
    language: 'fr',
    currency: 'DZD',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Créer des services par défaut
db.services.insertMany([
  {
    name: 'Followers Instagram Premium',
    description: 'Followers Instagram de haute qualité avec profils réels',
    platform: 'instagram',
    category: 'followers',
    price: 1500,
    currency: 'DZD',
    minQuantity: 100,
    maxQuantity: 50000,
    deliveryTime: '1-24h',
    quality: 'premium',
    isActive: true,
    features: ['Profils réels', 'Livraison rapide', 'Garantie 30 jours'],
    refillPolicy: '30days',
    averageTime: '1-12 heures',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Likes Instagram',
    description: 'Likes Instagram instantanés de qualité',
    platform: 'instagram',
    category: 'likes',
    price: 800,
    currency: 'DZD',
    minQuantity: 50,
    maxQuantity: 100000,
    deliveryTime: '0-1h',
    quality: 'high',
    isActive: true,
    features: ['Livraison instantanée', 'Profils actifs'],
    refillPolicy: 'none',
    averageTime: '0-30 minutes',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Vues TikTok',
    description: 'Vues TikTok rapides et sécurisées',
    platform: 'tiktok',
    category: 'views',
    price: 300,
    currency: 'DZD',
    minQuantity: 1000,
    maxQuantity: 1000000,
    deliveryTime: '0-2h',
    quality: 'standard',
    isActive: true,
    features: ['Livraison rapide', 'Vues réelles'],
    refillPolicy: 'none',
    averageTime: '0-1 heure',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Base de données Dev-IT SMM initialisée avec succès !');
