import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: TrendingUp,
      title: 'Croissance Rapide',
      description: 'Boostez votre présence sur les réseaux sociaux en quelques clics'
    },
    {
      icon: Shield,
      title: '100% Sécurisé',
      description: 'Paiements sécurisés avec Chargily Pay (CIB/Edahabia)'
    },
    {
      icon: Zap,
      title: 'Livraison Rapide',
      description: 'Services livrés en 0-24h selon le type de commande'
    },
    {
      icon: Users,
      title: 'Support 24/7',
      description: 'Équipe support disponible pour vous aider à tout moment'
    }
  ];

  const platforms = [
    { name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', users: '2B+' },
    { name: 'TikTok', color: 'bg-gradient-to-r from-black to-gray-800', users: '1B+' },
    { name: 'YouTube', color: 'bg-gradient-to-r from-red-500 to-red-600', users: '2.7B+' },
    { name: 'Facebook', color: 'bg-gradient-to-r from-blue-500 to-blue-600', users: '3B+' },
    { name: 'Twitter', color: 'bg-gradient-to-r from-blue-400 to-blue-500', users: '450M+' }
  ];

  const testimonials = [
    {
      name: 'Ahmed K.',
      role: 'Influenceur',
      content: 'Excellent service ! J\'ai gagné 10K followers Instagram en 2 jours.',
      rating: 5
    },
    {
      name: 'Sarah M.',
      role: 'Entrepreneuse',
      content: 'Interface simple et paiement sécurisé. Je recommande !',
      rating: 5
    },
    {
      name: 'Yacine B.',
      role: 'Créateur de contenu',
      content: 'Support client réactif et services de qualité. Parfait !',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Boostez votre présence sur
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}les réseaux sociaux
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Panel SMM professionnel avec paiement Chargily Pay (CIB/Edahabia). 
              Followers, likes, vues et plus encore pour toutes les plateformes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn btn-primary px-8 py-4 text-lg"
                >
                  Accéder au dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-primary px-8 py-4 text-lg"
                  >
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/services"
                    className="btn btn-outline px-8 py-4 text-lg"
                  >
                    Voir les services
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir Dev-IT SMM ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              La solution complète pour votre marketing sur les réseaux sociaux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Toutes les plateformes supportées
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Services disponibles pour les principales plateformes sociales
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {platforms.map((platform, index) => (
              <div key={index} className="card p-6 text-center hover:scale-105 transition-transform">
                <div className={`w-16 h-16 ${platform.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-bold text-lg">
                    {platform.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {platform.users} utilisateurs
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Plus de 10,000 clients satisfaits nous font confiance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à développer votre audience ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à Dev-IT SMM
          </p>
          {!user && (
            <Link
              to="/register"
              className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Créer un compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
