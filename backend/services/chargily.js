const axios = require('axios');
const crypto = require('crypto');

class ChargilyService {
  constructor() {
    this.apiKey = process.env.CHARGILY_API_KEY;
    this.secretKey = process.env.CHARGILY_SECRET_KEY;
    this.mode = process.env.CHARGILY_MODE || 'test';
    this.baseUrl = this.mode === 'test' 
      ? 'https://pay.chargily.net/test/api/v2'
      : 'https://pay.chargily.net/api/v2';
  }

  // Créer un lien de paiement
  async createPaymentLink(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/checkouts`, {
        amount: data.amount,
        currency: data.currency || 'DZD',
        success_url: data.success_url,
        failure_url: data.failure_url,
        webhook_endpoint: data.webhook_url,
        description: data.description,
        customer_id: data.customer_id,
        metadata: data.metadata || {}
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur Chargily createPaymentLink:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création du lien de paiement'
      };
    }
  }

  // Créer un client
  async createCustomer(customerData) {
    try {
      const response = await axios.post(`${this.baseUrl}/customers`, {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address || {},
        metadata: customerData.metadata || {}
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur Chargily createCustomer:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création du client'
      };
    }
  }

  // Récupérer les détails d'un checkout
  async getCheckout(checkoutId) {
    try {
      const response = await axios.get(`${this.baseUrl}/checkouts/${checkoutId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur Chargily getCheckout:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération du checkout'
      };
    }
  }

  // Vérifier la signature du webhook
  verifyWebhookSignature(payload, signature) {
    const computedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === computedSignature;
  }

  // Récupérer le solde du compte
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur Chargily getBalance:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération du solde'
      };
    }
  }
}

module.exports = new ChargilyService();
