const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configuration multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// GET /api/users/profile - Obtenir le profil utilisateur
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/users/profile - Mettre à jour le profil
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'preferences', 'socialMedia'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profil mis à jour avec succès',
      user
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides',
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/users/avatar - Upload d'avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    res.json({
      message: 'Avatar mis à jour avec succès',
      avatarUrl
    });

  } catch (error) {
    console.error('Erreur upload avatar:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/users/balance - Obtenir le solde
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance totalSpent');
    res.json({
      balance: user.balance,
      totalSpent: user.totalSpent
    });
  } catch (error) {
    console.error('Erreur récupération solde:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/users/password - Changer le mot de passe
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Mot de passe actuel et nouveau mot de passe requis' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
      });
    }

    const user = await User.findById(req.user._id);

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes admin
// GET /api/users/admin/all - Tous les utilisateurs (Admin)
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération utilisateurs admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/users/:id/status - Activer/Désactiver un utilisateur (Admin)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      user
    });

  } catch (error) {
    console.error('Erreur mise à jour statut utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
