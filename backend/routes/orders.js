const express = require('express');
const Joi = require('joi');
const { auth, adminOnly } = require('../middleware/auth');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');

const router = express.Router();

// Schéma de validation pour créer une commande
const createOrderSchema = Joi.object({
  serviceId: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  targetUrl: Joi.string().uri().required()
});

// POST /api/orders - Créer une nouvelle commande
router.post('/', auth, async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        details: error.details[0].message 
      });
    }

    const { serviceId, quantity, targetUrl } = value;
    const user = req.user;

    // Vérifier que le service existe et est actif
    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé ou inactif' });
    }

    // Vérifier les limites de quantité
    if (quantity < service.minQuantity || quantity > service.maxQuantity) {
      return res.status(400).json({ 
        message: `La quantité doit être entre ${service.minQuantity} et ${service.maxQuantity}` 
      });
    }

    // Calculer le montant total
    const totalAmount = (service.price / 1000) * quantity; // Prix pour 1000 unités

    // Vérifier le solde de l'utilisateur
    if (user.balance < totalAmount) {
      return res.status(400).json({ 
        message: 'Solde insuffisant. Veuillez recharger votre compte.',
        required: totalAmount,
        current: user.balance
      });
    }

    // Créer la commande
    const order = new Order({
      user: user._id,
      service: serviceId,
      quantity,
      totalAmount,
      targetUrl,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Débiter le solde utilisateur
    user.balance -= totalAmount;
    user.totalSpent += totalAmount;
    await user.save();

    // Marquer la commande comme payée
    order.paymentStatus = 'paid';
    order.status = 'processing';
    await order.save();

    // Peupler les détails pour la réponse
    await order.populate('service', 'name platform category deliveryTime');

    res.status(201).json({
      message: 'Commande créée avec succès',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        service: order.service,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        targetUrl: order.targetUrl,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/orders - Obtenir les commandes de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Construire le filtre
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('service', 'name platform category icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/orders/:id - Obtenir une commande spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('service');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json({ order });

  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/orders/stats/dashboard - Statistiques des commandes pour le dashboard
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Commandes récentes
    const recentOrders = await Order.find({ user: userId })
      .populate('service', 'name platform category')
      .sort({ createdAt: -1 })
      .limit(5);

    // Total des commandes ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Order.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      stats,
      recentOrders,
      monthlyStats: monthlyStats[0] || { count: 0, totalAmount: 0 }
    });

  } catch (error) {
    console.error('Erreur stats commandes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes admin
// GET /api/orders/admin/all - Toutes les commandes (Admin)
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user', 'username email firstName lastName')
      .populate('service', 'name platform category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération commandes admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/orders/:id/status - Mettre à jour le statut d'une commande (Admin)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, startCount, delivered, remains } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Mettre à jour les champs
    order.status = status;
    if (startCount !== undefined) order.startCount = startCount;
    if (delivered !== undefined) order.delivered = delivered;
    if (remains !== undefined) order.remains = remains;

    if (status === 'completed') {
      order.completedAt = new Date();
      order.delivered = order.quantity;
      order.remains = 0;
    }

    await order.save();

    res.json({
      message: 'Statut de la commande mis à jour',
      order
    });

  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
