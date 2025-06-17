const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const Service = require('../models/Service');

const router = express.Router();

// GET /api/services - Obtenir tous les services actifs
router.get('/', async (req, res) => {
  try {
    const { platform, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Construire le filtre
    const filter = { isActive: true };
    if (platform) filter.platform = platform;
    if (category) filter.category = category;

    const services = await Service.find(filter)
      .sort({ platform: 1, category: 1, price: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(filter);

    // Grouper par plateforme pour une meilleure organisation
    const groupedServices = services.reduce((acc, service) => {
      if (!acc[service.platform]) {
        acc[service.platform] = {};
      }
      if (!acc[service.platform][service.category]) {
        acc[service.platform][service.category] = [];
      }
      acc[service.platform][service.category].push(service);
      return acc;
    }, {});

    res.json({
      services: groupedServices,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/services/platforms - Obtenir les plateformes disponibles
router.get('/platforms', async (req, res) => {
  try {
    const platforms = await Service.distinct('platform', { isActive: true });

    // Obtenir les catégories pour chaque plateforme
    const platformsWithCategories = await Promise.all(
      platforms.map(async (platform) => {
        const categories = await Service.distinct('category', { 
          platform, 
          isActive: true 
        });

        const serviceCount = await Service.countDocuments({ 
          platform, 
          isActive: true 
        });

        return {
          name: platform,
          categories,
          serviceCount
        };
      })
    );

    res.json({ platforms: platformsWithCategories });

  } catch (error) {
    console.error('Erreur récupération plateformes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/services/:id - Obtenir un service spécifique
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({ service });

  } catch (error) {
    console.error('Erreur récupération service:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes admin uniquement
// POST /api/services - Créer un nouveau service (Admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();

    res.status(201).json({
      message: 'Service créé avec succès',
      service
    });

  } catch (error) {
    console.error('Erreur création service:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides',
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/services/:id - Mettre à jour un service (Admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({
      message: 'Service mis à jour avec succès',
      service
    });

  } catch (error) {
    console.error('Erreur mise à jour service:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides',
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/services/:id - Supprimer un service (Admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json({ message: 'Service désactivé avec succès' });

  } catch (error) {
    console.error('Erreur suppression service:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
