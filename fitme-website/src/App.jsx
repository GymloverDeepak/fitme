import Features from './components/Features.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Install from './components/Install.jsx';
import Screenshots from './components/Screenshots.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <Screenshots />
        <Install />
      </main>
      <Footer />
    </>
  );
}
