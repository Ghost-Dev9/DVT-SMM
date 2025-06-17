const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'DZD'
  },
  method: {
    type: String,
    enum: ['chargily_cib', 'chargily_edahabia', 'balance'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  chargilyCheckoutId: {
    type: String,
    default: null
  },
  chargilyResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  refundId: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index pour les recherches
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ chargilyCheckoutId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
