import React from 'react';

const LegalPages = ({ page }) => {
  const renderContent = () => {
    switch (page) {
      case 'about':
        return (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">About CineMax</h1>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                Welcome to <span className="text-amber-400 font-medium">CineMax</span> — your intelligent movie discovery platform powered by advanced AI recommendation algorithms.
              </p>
              <p>
                We've built CineMax to help movie enthusiasts discover their next favorite film. Using machine learning and natural language processing, our system analyzes thousands of movies based on genres, cast, crew, keywords, and plot descriptions to provide you with highly personalized recommendations.
              </p>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Our Mission</h2>
              <p>
                Our mission is simple: to make movie discovery effortless and enjoyable. Whether you're looking for films similar to your favorites or exploring new genres, CineMax provides intelligent, context-aware recommendations tailored to your taste.
              </p>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">How It Works</h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-medium text-amber-400 mb-2">🎬 Content-Based Filtering</h3>
                  <p className="text-sm">
                    Our algorithm analyzes movie characteristics including genres, cast, director, keywords, and plot themes to find films with similar attributes.
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-medium text-amber-400 mb-2">🤖 Machine Learning</h3>
                  <p className="text-sm">
                    We use cosine similarity on vectorized movie features to compute relationships between thousands of films in our database.
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <h3 className="text-lg font-medium text-amber-400 mb-2">📊 Quality Filtering</h3>
                  <p className="text-sm">
                    Our Top Rated section filters movies with high user ratings and sufficient vote counts to ensure quality recommendations.
                  </p>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Data Source</h2>
              <p>
                Movie data, ratings, and metadata are provided by <span className="text-amber-400">The Movie Database (TMDB)</span>, one of the world's most comprehensive movie databases. Poster images and additional information are fetched dynamically to ensure you always have the latest details.
              </p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Privacy Policy</h1>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              
              <p>
                At <span className="text-amber-400">CineMax</span>, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our movie recommendation service.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Information We Collect</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-amber-400 mb-2">Search Queries</h3>
                  <p className="text-sm">
                    We process your movie search queries to provide recommendations. These queries are not stored permanently and are only used to generate results during your session.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-amber-400 mb-2">Usage Data</h3>
                  <p className="text-sm">
                    We may collect anonymous usage statistics such as page views and feature usage to improve our service. This data is aggregated and cannot be used to identify individual users.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>To provide movie recommendations based on your search queries</li>
                <li>To improve our recommendation algorithms and user experience</li>
                <li>To analyze usage patterns and optimize platform performance</li>
                <li>To respond to user inquiries and provide support</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data. Our platform does not require user accounts or authentication, minimizing the personal information we collect.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Third-Party Services</h2>
              <p>
                We use The Movie Database (TMDB) API to fetch movie information and poster images. Please refer to <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline">TMDB's Privacy Policy</a> for information about their data practices.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Cookies</h2>
              <p>
                We use minimal cookies necessary for the basic functionality of our website. We do not use tracking cookies or third-party advertising cookies.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Your Rights</h2>
              <p className="text-sm">
                Since we don't collect personally identifiable information, there is no personal data to access, modify, or delete. Your searches are processed in real-time and not permanently stored.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:markhorsdev@gmail.com" className="text-amber-400 hover:text-amber-300 underline">
                  markhorsdev@gmail.com
                </a>
              </p>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Terms of Service</h1>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              
              <p>
                Welcome to <span className="text-amber-400">CineMax</span>. By accessing and using our service, you agree to be bound by these Terms of Service.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-sm">
                By accessing or using CineMax, you agree to comply with and be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Service Description</h2>
              <p className="text-sm">
                CineMax is a movie recommendation platform that uses machine learning algorithms to suggest films based on your preferences. We provide movie information, ratings, and recommendations powered by data from The Movie Database (TMDB).
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Use of Service</h2>
              <div className="text-sm space-y-2">
                <p>You agree to use CineMax only for lawful purposes. You must not:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Attempt to gain unauthorized access to our systems or networks</li>
                  <li>Use automated scripts or bots to scrape or download content</li>
                  <li>Interfere with the proper functioning of the service</li>
                  <li>Use the service to transmit malicious code or viruses</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Intellectual Property</h2>
              <p className="text-sm">
                Movie data, images, and metadata are provided by TMDB and are subject to their terms of use. The CineMax platform design, code, and recommendation algorithms are proprietary. All rights reserved.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Disclaimer of Warranties</h2>
              <p className="text-sm">
                CineMax is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that the recommendations will meet your expectations. We are not responsible for the accuracy of movie information provided by third-party sources.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Limitation of Liability</h2>
              <p className="text-sm">
                To the maximum extent permitted by law, CineMax and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">7. Changes to Terms</h2>
              <p className="text-sm">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of CineMax after changes constitutes acceptance of the modified terms.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">8. Third-Party Services</h2>
              <p className="text-sm">
                CineMax uses data from The Movie Database (TMDB). Use of this data is subject to TMDB's terms of service. We are not responsible for the availability, accuracy, or content of third-party services.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">9. Governing Law</h2>
              <p className="text-sm">
                These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">10. Contact Information</h2>
              <p className="text-sm">
                For questions or concerns regarding these Terms of Service, please contact us at{' '}
                <a href="mailto:markhorsdev@gmail.com" className="text-amber-400 hover:text-amber-300 underline">
                  markhorsdev@gmail.com
                </a>
              </p>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Contact Us</h1>
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                We'd love to hear from you! Whether you have questions, suggestions, feedback, or need support, feel free to reach out.
              </p>

              <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl">
                <h2 className="text-xl font-semibold text-white mb-4">Get In Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-400 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Email</h3>
                      <a 
                        href="mailto:markhorsdev@gmail.com"
                        className="text-lg text-amber-400 hover:text-amber-300 transition-colors duration-300"
                      >
                        markhorsdev@gmail.com
                      </a>
                      <p className="text-sm text-gray-500 mt-1">For any queries, suggestions, or support requests</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">What can we help you with?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/20 rounded-lg">
                    <h3 className="text-amber-400 font-medium mb-2">💡 Feature Suggestions</h3>
                    <p className="text-sm text-gray-400">Have ideas for new features? We're always looking to improve!</p>
                  </div>
                  <div className="p-4 bg-black/20 rounded-lg">
                    <h3 className="text-amber-400 font-medium mb-2">🐛 Bug Reports</h3>
                    <p className="text-sm text-gray-400">Found an issue? Let us know so we can fix it quickly.</p>
                  </div>
                  <div className="p-4 bg-black/20 rounded-lg">
                    <h3 className="text-amber-400 font-medium mb-2">❓ General Inquiries</h3>
                    <p className="text-sm text-gray-400">Questions about how CineMax works? Ask away!</p>
                  </div>
                  <div className="p-4 bg-black/20 rounded-lg">
                    <h3 className="text-amber-400 font-medium mb-2">🤝 Partnerships</h3>
                    <p className="text-sm text-gray-400">Interested in collaborating? Reach out to discuss.</p>
                  </div>
                </div>
              </div>

              <div className="text-center p-6 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-gray-400 mb-3">We typically respond within 24-48 hours</p>
                <a
                  href="mailto:markhorsdev@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-full transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send us an email
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] py-8">
      {renderContent()}
    </div>
  );
};

export default LegalPages;
