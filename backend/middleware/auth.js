const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token d\'accès requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    console.error('Erreur auth middleware:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Middleware pour vérifier le rôle admin
const adminOnly = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès admin requis' });
  }
  next();
};

// Middleware pour vérifier le rôle moderator ou admin
const moderatorOrAdmin = async (req, res, next) => {
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès modérateur ou admin requis' });
  }
  next();
};

module.exports = { auth, adminOnly, moderatorOrAdmin };
