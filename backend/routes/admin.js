const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Service = require('../models/Service');

const router = express.Router();

// GET /api/admin/dashboard - Statistiques du dashboard admin
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    // Statistiques générales
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Commandes par statut
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenus des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Services les plus populaires
    const popularServices = await Order.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      }
    ]);

    // Nouveaux utilisateurs cette semaine
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Commandes en attente
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'processing'] } 
    });

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        newUsersThisWeek,
        pendingOrders
      },
      ordersByStatus,
      dailyRevenue,
      popularServices
    });

  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/analytics - Analytics avancées
router.get('/analytics', auth, adminOnly, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Revenus par plateforme
    const revenueByPlatform = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      { $unwind: '$serviceInfo' },
      {
        $group: {
          _id: '$serviceInfo.platform',
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Évolution mensuelle
    const monthlyEvolution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top utilisateurs
    const topUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      }
    ]);

    res.json({
      revenueByPlatform,
      monthlyEvolution,
      topUsers
    });

  } catch (error) {
    console.error('Erreur analytics admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/services/seed - Créer des services par défaut
router.post('/services/seed', auth, adminOnly, async (req, res) => {
  try {
    const defaultServices = [
      // Instagram
      {
        name: 'Followers Instagram Réels',
        description: 'Followers Instagram de qualité avec profils réels',
        platform: 'instagram',
        category: 'followers',
        price: 1500, // Prix pour 1000
        minQuantity: 100,
        maxQuantity: 50000,
        deliveryTime: '1-24h',
        quality: 'high',
        features: ['Profiles réels', 'Livraison rapide', 'Garantie 30 jours']
      },
      {
        name: 'Likes Instagram',
        description: 'Likes Instagram instantanés de qualité',
        platform: 'instagram',
        category: 'likes',
        price: 800,
        minQuantity: 50,
        maxQuantity: 100000,
        deliveryTime: '0-1h',
        quality: 'standard',
        features: ['Livraison instantanée', 'Profiles actifs']
      },
      // TikTok
      {
        name: 'Followers TikTok',
        description: 'Followers TikTok de qualité premium',
        platform: 'tiktok',
        category: 'followers',
        price: 1200,
        minQuantity: 100,
        maxQuantity: 100000,
        deliveryTime: '1-6h',
        quality: 'high'
      },
      {
        name: 'Vues TikTok',
        description: 'Vues TikTok rapides et sécurisées',
        platform: 'tiktok',
        category: 'views',
        price: 200,
        minQuantity: 1000,
        maxQuantity: 1000000,
        deliveryTime: '0-1h',
        quality: 'standard'
      },
      // YouTube
      {
        name: 'Abonnés YouTube',
        description: 'Abonnés YouTube réels et permanents',
        platform: 'youtube',
        category: 'subscribers',
        price: 2500,
        minQuantity: 50,
        maxQuantity: 10000,
        deliveryTime: '1-3 jours',
        quality: 'premium'
      },
      {
        name: 'Vues YouTube',
        description: 'Vues YouTube de haute qualité',
        platform: 'youtube',
        category: 'views',
        price: 400,
        minQuantity: 1000,
        maxQuantity: 1000000,
        deliveryTime: '6-24h',
        quality: 'high'
      }
    ];

    // Supprimer les services existants (optionnel)
    // await Service.deleteMany({});

    // Créer les nouveaux services
    const services = await Service.insertMany(defaultServices);

    res.json({
      message: `${services.length} services créés avec succès`,
      services
    });

  } catch (error) {
    console.error('Erreur création services par défaut:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/system/info - Informations système
router.get('/system/info', auth, adminOnly, async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({ systemInfo });

  } catch (error) {
    console.error('Erreur infos système:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
