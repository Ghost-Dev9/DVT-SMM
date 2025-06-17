const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter']
  },
  category: {
    type: String,
    required: true,
    enum: ['followers', 'likes', 'views', 'comments', 'shares', 'subscribers']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'DZD'
  },
  minQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  maxQuantity: {
    type: Number,
    default: 100000,
    min: 1
  },
  deliveryTime: {
    type: String,
    default: '24h'
  },
  quality: {
    type: String,
    enum: ['standard', 'high', 'premium'],
    default: 'standard'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: null
  },
  features: [String],
  refillPolicy: {
    type: String,
    enum: ['none', '30days', '60days', 'lifetime'],
    default: 'none'
  },
  averageTime: {
    type: String,
    default: '1-24 heures'
  }
}, {
  timestamps: true
});

// Index pour les recherches
serviceSchema.index({ platform: 1, category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ price: 1 });

module.exports = mongoose.model('Service', serviceSchema);
