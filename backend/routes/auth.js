const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Schémas de validation
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Génération de tokens JWT
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
  try {
    // Validation des données
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        details: error.details[0].message 
      });
    }

    const { username, email, password, firstName, lastName, phone } = value;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Un compte avec cet email existe déjà' 
          : 'Ce nom d\'utilisateur est déjà pris'
      });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      phone
    });

    await user.save();

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Réponse sans le mot de passe
    const userResponse = user.toPublicJSON();

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: userResponse,
      tokens: { accessToken, refreshToken }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    // Validation des données
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        details: error.details[0].message 
      });
    }

    const { email, password } = value;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Réponse sans le mot de passe
    const userResponse = user.toPublicJSON();

    res.json({
      message: 'Connexion réussie',
      user: userResponse,
      tokens: { accessToken, refreshToken }
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Obtenir les infos de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    const userResponse = req.user.toPublicJSON();
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Erreur me:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/refresh - Rafraîchir le token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Token de rafraîchissement requis' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Utilisateur non trouvé ou inactif' });
    }

    // Générer un nouveau token d'accès
    const { accessToken } = generateTokens(user._id);

    res.json({ accessToken });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token de rafraîchissement invalide' });
    }
    console.error('Erreur refresh:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/logout - Déconnexion
router.post('/logout', auth, async (req, res) => {
  try {
    // Dans une application réelle, vous pourriez vouloir ajouter le token à une blacklist
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
