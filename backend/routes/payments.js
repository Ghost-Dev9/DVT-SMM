const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const chargilyService = require('../services/chargily');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const router = express.Router();

// Schémas de validation
const createPaymentSchema = Joi.object({
  amount: Joi.number().min(75).required(), // Minimum Chargily
  orderId: Joi.string().optional(),
  description: Joi.string().required(),
  method: Joi.string().valid('chargily_cib', 'chargily_edahabia').required()
});

const addFundsSchema = Joi.object({
  amount: Joi.number().min(75).required(),
  method: Joi.string().valid('chargily_cib', 'chargily_edahabia').required()
});

// POST /api/payments/create - Créer un paiement
router.post('/create', auth, async (req, res) => {
  try {
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        details: error.details[0].message 
      });
    }

    const { amount, orderId, description, method } = value;
    const user = req.user;

    // Vérifier la commande si fournie
    let order = null;
    if (orderId) {
      order = await Order.findOne({ _id: orderId, user: user._id });
      if (!order) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }
      if (order.paymentStatus === 'paid') {
        return res.status(400).json({ message: 'Cette commande est déjà payée' });
      }
    }

    // Créer l'enregistrement de paiement
    const payment = new Payment({
      paymentId: `pay_${Date.now()}_${user._id}`,
      user: user._id,
      order: orderId || null,
      amount,
      method,
      status: 'pending',
      metadata: {
        description,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    });

    await payment.save();

    // Créer le client Chargily si nécessaire
    const customerResult = await chargilyService.createCustomer({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone || '',
      metadata: {
        userId: user._id.toString(),
        paymentId: payment.paymentId
      }
    });

    if (!customerResult.success) {
      return res.status(500).json({ 
        message: 'Erreur lors de la création du client de paiement',
        error: customerResult.error
      });
    }

    // URLs de redirection
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment/success?payment=${payment.paymentId}`;
    const failureUrl = `${baseUrl}/payment/failed?payment=${payment.paymentId}`;
    const webhookUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`;

    // Créer le lien de paiement
    const paymentResult = await chargilyService.createPaymentLink({
      amount: amount * 100, // Chargily utilise les centimes
      currency: 'DZD',
      description,
      customer_id: customerResult.data.id,
      success_url: successUrl,
      failure_url: failureUrl,
      webhook_url: webhookUrl,
      metadata: {
        paymentId: payment.paymentId,
        userId: user._id.toString(),
        orderId: orderId || null
      }
    });

    if (!paymentResult.success) {
      payment.status = 'failed';
      payment.failureReason = paymentResult.error;
      await payment.save();

      return res.status(500).json({ 
        message: 'Erreur lors de la création du lien de paiement',
        error: paymentResult.error
      });
    }

    // Mettre à jour le paiement avec les infos Chargily
    payment.chargilyCheckoutId = paymentResult.data.id;
    payment.chargilyResponse = paymentResult.data;
    await payment.save();

    res.json({
      message: 'Lien de paiement créé avec succès',
      payment: {
        id: payment.paymentId,
        amount,
        currency: 'DZD',
        status: payment.status,
        checkoutUrl: paymentResult.data.checkout_url
      }
    });

  } catch (error) {
    console.error('Erreur création paiement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/payments/add-funds - Ajouter des fonds au solde
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { error, value } = addFundsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        details: error.details[0].message 
      });
    }

    const { amount, method } = value;
    const user = req.user;

    // Utiliser la route de création de paiement
    const paymentData = {
      amount,
      description: `Ajout de fonds au compte - ${amount} DZD`,
      method
    };

    // Rediriger vers la création de paiement
    req.body = paymentData;
    return router.handle(req, res);

  } catch (error) {
    console.error('Erreur ajout fonds:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/payments/webhook - Webhook Chargily
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['signature'];
    const payload = req.body;

    // Vérifier la signature
    if (!chargilyService.verifyWebhookSignature(payload, signature)) {
      console.error('Signature webhook invalide');
      return res.status(400).json({ message: 'Signature invalide' });
    }

    const { type, data } = payload;

    if (type === 'checkout.paid') {
      await handleSuccessfulPayment(data);
    } else if (type === 'checkout.failed') {
      await handleFailedPayment(data);
    }

    res.json({ message: 'Webhook traité avec succès' });

  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Fonction pour traiter un paiement réussi
async function handleSuccessfulPayment(checkoutData) {
  try {
    const paymentId = checkoutData.metadata?.paymentId;
    if (!paymentId) {
      console.error('PaymentId manquant dans les métadonnées');
      return;
    }

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      console.error(`Paiement non trouvé: ${paymentId}`);
      return;
    }

    // Mettre à jour le statut du paiement
    payment.status = 'paid';
    payment.webhookData = checkoutData;
    await payment.save();

    // Mettre à jour le solde utilisateur
    const user = await User.findById(payment.user);
    if (user) {
      user.balance += payment.amount;
      user.totalSpent += payment.amount;
      await user.save();
    }

    // Mettre à jour la commande si elle existe
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
      }
    }

    console.log(`Paiement traité avec succès: ${paymentId}`);

  } catch (error) {
    console.error('Erreur traitement paiement réussi:', error);
  }
}

// Fonction pour traiter un paiement échoué
async function handleFailedPayment(checkoutData) {
  try {
    const paymentId = checkoutData.metadata?.paymentId;
    if (!paymentId) return;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) return;

    payment.status = 'failed';
    payment.failureReason = checkoutData.failure_reason || 'Paiement échoué';
    payment.webhookData = checkoutData;
    await payment.save();

    // Mettre à jour la commande si elle existe
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();
      }
    }

    console.log(`Paiement échoué traité: ${paymentId}`);

  } catch (error) {
    console.error('Erreur traitement paiement échoué:', error);
  }
}

// GET /api/payments/history - Historique des paiements
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user._id })
      .populate('order', 'orderNumber service quantity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: req.user._id });

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur historique paiements:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/payments/:id - Détails d'un paiement
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      paymentId: req.params.id, 
      user: req.user._id 
    }).populate('order');

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    res.json({ payment });

  } catch (error) {
    console.error('Erreur détails paiement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
