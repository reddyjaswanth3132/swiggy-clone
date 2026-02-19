import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AuthModal from './components/AuthModal/AuthModal';
import Home from './pages/Home/Home';
import Restaurant from './pages/Restaurant/Restaurant';
import Search from './pages/Search/Search';
import Cart from './pages/Cart/Cart';
import OrderTracking from './pages/OrderTracking/OrderTracking';
import Help from './pages/Help/Help';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <LocationProvider>
          <AuthProvider>
            <CartProvider>
              <div className="app">
                <Header />
                <AuthModal />
                <main className="app__main">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/restaurant/:id" element={<Restaurant />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/order/:orderId" element={<OrderTracking />} />
                    <Route path="/help" element={<Help />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </LocationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
