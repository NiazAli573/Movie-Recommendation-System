import React, { useRef, useState } from 'react';
import MovieSearch from './components/MovieSearch';
import LegalPages from './components/LegalPages';

function App() {
  const searchRef = useRef(null);
  const [activeSection, setActiveSection] = useState('home');
  const [legalPage, setLegalPage] = useState(null);

  const goHome = () => {
    setActiveSection('home');
    setLegalPage(null);
    searchRef.current?.resetToHome();
  };

  const showLegalPage = (page) => {
    setLegalPage(page);
    setActiveSection('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'discover', label: 'Discover' },
    { id: 'genres', label: 'Genres' },
    { id: 'toprated', label: 'Top Rated' },
  ];

  const handleNav = (id) => {
    setActiveSection(id);
    setLegalPage(null);
    if (id === 'home') {
      searchRef.current?.resetToHome();
    } else if (id === 'discover') {
      searchRef.current?.focusSearch();
    } else if (id === 'genres') {
      searchRef.current?.showGenres();
    } else if (id === 'toprated') {
      searchRef.current?.showTopRated();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ── Fixed Header with glass morphism ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-3 group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-sm font-bold text-black leading-none">C</span>
            </div>
            <span className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors duration-300">
              Cine<span className="text-amber-400">Max</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`text-sm px-4 py-2 rounded-full transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-amber-500/10 text-amber-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => searchRef.current?.focusSearch()}
            className="md:hidden text-gray-400 hover:text-amber-400 transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-24 pb-20">
        {legalPage ? (
          <LegalPages page={legalPage} />
        ) : (
          <MovieSearch ref={searchRef} activeSection={activeSection} onSectionChange={setActiveSection} />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-black">C</span>
                </div>
                <span className="text-sm font-semibold text-white">Cine<span className="text-amber-400">Max</span></span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Discover your next favorite film with AI-powered recommendations.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Navigate</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNav(item.id)}
                      className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-300"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => showLegalPage('privacy')} 
                    className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-300"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => showLegalPage('terms')} 
                    className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-300"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => showLegalPage('about')} 
                    className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-300"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => showLegalPage('contact')} 
                    className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-300"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} CineMax. All rights reserved.</p>
            <p className="text-xs text-gray-600">Data provided by TMDB</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
