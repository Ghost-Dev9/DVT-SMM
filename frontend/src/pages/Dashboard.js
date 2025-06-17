import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderService, userService } from '../services/api';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Eye,
  Heart,
  MessageCircle,
  Share
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, balanceResponse] = await Promise.all([
          orderService.getDashboardStats(),
          userService.getBalance()
        ]);

        setStats(statsResponse.data);
        setBalance(balanceResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickStats = [
    {
      title: 'Solde disponible',
      value: `${balance?.balance || 0} DZD`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      title: 'Commandes totales',
      value: stats?.stats?.find(s => s._id === 'completed')?.count || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+5%'
    },
    {
      title: 'Dépenses totales',
      value: `${balance?.totalSpent || 0} DZD`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'Ce mois',
      value: stats?.monthlyStats?.count || 0,
      icon: Users,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  const platformStats = [
    { name: 'Instagram', followers: 12500, likes: 45200, color: '#E4405F' },
    { name: 'TikTok', followers: 8900, likes: 32100, color: '#000000' },
    { name: 'YouTube', subscribers: 3400, views: 78500, color: '#FF0000' },
    { name: 'Facebook', followers: 6700, likes: 21300, color: '#1877F2' },
    { name: 'Twitter', followers: 4200, likes: 15600, color: '#1DA1F2' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue, {user?.firstName} {user?.lastName} ! 👋
        </h1>
        <p className="opacity-90">
          Gérez vos campagnes de marketing sur les réseaux sociaux depuis votre tableau de bord
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique des commandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des commandes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="followers" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Commandes récentes */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Commandes récentes</h3>
          <div className="space-y-4">
            {stats?.recentOrders?.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {order.service.platform === 'instagram' && <Heart className="h-5 w-5 text-blue-600" />}
                    {order.service.platform === 'tiktok' && <Eye className="h-5 w-5 text-blue-600" />}
                    {order.service.platform === 'youtube' && <Share className="h-5 w-5 text-blue-600" />}
                    {order.service.platform === 'facebook' && <MessageCircle className="h-5 w-5 text-blue-600" />}
                    {order.service.platform === 'twitter' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{order.service.name}</p>
                    <p className="text-xs text-gray-500">
                      {order.quantity.toLocaleString()} unités
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{order.totalAmount} DZD</p>
                  <span className={`badge ${
                    order.status === 'completed' ? 'badge-success' :
                    order.status === 'processing' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary p-4 text-left">
            <ShoppingCart className="h-6 w-6 mb-2" />
            <div>
              <p className="font-semibold">Nouvelle commande</p>
              <p className="text-sm opacity-90">Créer une nouvelle commande</p>
            </div>
          </button>

          <button className="btn btn-outline p-4 text-left">
            <DollarSign className="h-6 w-6 mb-2" />
            <div>
              <p className="font-semibold">Recharger le solde</p>
              <p className="text-sm opacity-90">Ajouter des fonds</p>
            </div>
          </button>

          <button className="btn btn-secondary p-4 text-left">
            <Users className="h-6 w-6 mb-2" />
            <div>
              <p className="font-semibold">Support client</p>
              <p className="text-sm opacity-90">Contacter l'équipe</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
