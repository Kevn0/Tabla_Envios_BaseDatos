// frontend/src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage"; // Importa la página de administración
import SuperAdminPage from "./pages/SuperAdminPage"; // Importa la página de Super Administrador
import HomePage from "./pages/HomePage";
import Footer from "./components/Footer";
import ContactPage from "./pages/ContactPage";
import ActualizarUsuarioPage from "./pages/ActualizarUsuarioPage"; // Importa la página de actualización de usuario
import ErrorPage from "./pages/ErrorPage";
import TermsPage from "./pages/TermsPage"; // Importa la página de Términos
import PrivacyPage from "./pages/PrivacyPage"; // Importa la página de Privacidad
import HelpPage from "./pages/HelpPage"; // Importa la página de Ayuda
import TecnologiaPage from "./pages/TecnologiaPage"; // Importa la página de Tecnología
import HogarMainPage from "./pages/HogarMainPage";
import HogarPage from "./pages/HogarPage"; // Importa la página de Hogar
import DeportePage from "./pages/DeportePage"; // Importa la página de Deporte
import VariedadPage from "./pages/VariedadPage";
import PerfilPage from "./pages/PerfilPage";
import BaloncestoPage from "./pages/BaloncestoPage";
import DecoraPage from "./pages/DecoraPage";
import GardenPage from "./pages/GardenPage";
import styled from "@emotion/styled";
import logopaca from "./images/logopaca.png";
import RopaMujer from "./pages/Ropamujer";
import RopaHombre from "./pages/Ropahombre";
import RopaNiñoPage from "./pages/Ropanino";
import Tecnologiacomputadores from "./pages/Tecnologiacomputadores";
import Tecnologiaaccesorios from "./pages/Tecnologiaaccesorios";
import TecnologiaCelulares from "./pages/TecnologiaCelulares";
import OfertaPage from "./pages/OfertasPage";
import ProductPage from "./pages/ProductPage";
import CreateProductPage from "./pages/CreateProductPage";
import CartPage from "./pages/CartPage";
import MisEnviosPage from "./pages/MisEnviosPage";
import AdminEnviosPage from "./pages/AdminEnviosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProductosPage from "./pages/AdminProductosPage"; // Importa la página de gestión de productos
import CheckoutPage from "./pages/CheckoutPage";
import RopaMainPage from "./pages/RopaMainPage"; // Importa la página principal de Ropa
import DeportesMainPage from "./pages/DeportesMainPage"; // Importa la página principal de Deportes
import TecnologiaMainPage from "./pages/TecnologiaMainPage";

// Estilos para la pantalla de carga
const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000;
  position: relative;
`;

const Logo = styled.img`
  width: 80px;
  height: 60px;
  z-index: 10;
`;

const CircleLoader = styled.div`
  position: absolute;
  border: 4px solid transparent;
  border-top: 4px solid #ff0000;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  z-index: 5;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadResources = () =>
      new Promise((resolve) => setTimeout(() => resolve(), 1000));

    setLoading(true);

    Promise.all([loadResources()]).then(() => {
      setLoading(false);
    });
  }, [location]);

  if (loading) {
    return (
      <LoaderContainer>
        <Logo src={logopaca} alt="Logo de la página" />
        <CircleLoader />
      </LoaderContainer>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} /> {/* Ruta de Términos */}
        <Route path="/privacy" element={<PrivacyPage />} />{" "}
        {/* Ruta de Privacidad */}
        <Route path="/help" element={<HelpPage />} /> {/* Ruta de Ayuda */}
        <Route path="/ropa" element={<RopaMainPage />} /> {/* Ruta principal para Ropa */}
        <Route path="/Ropamujer" element={<RopaMujer />} />
        <Route path="/Ropahombre" element={<RopaHombre />} />
        <Route path="/Ropaniño" element={<RopaNiñoPage />} />
        <Route path="/tecnologia" element={<TecnologiaMainPage />} />
        <Route path="/Teccel" element={<TecnologiaCelulares />} />
        <Route path="/Tecpc" element={<Tecnologiacomputadores />} />
        <Route path="/Decorapage" element={<DecoraPage />} />
        <Route path="/GardenPage" element={<GardenPage />} />
        <Route path="/VariedadPage" element={<VariedadPage />} />
        <Route path="/BaloncestoPage" element={<BaloncestoPage />} />
        <Route path="/HogarPage" element={<HogarPage />} />
        <Route path="/Tecaccesorios" element={<Tecnologiaaccesorios />} />
        <Route path="/hogar" element={<HogarMainPage />} />
        <Route path="/deportes" element={<DeportesMainPage />} />
        <Route path="/deporte/futbol" element={<DeportePage />} />
        <Route path="/ofertas" element={<OfertaPage />} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* Rutas protegidas de administrador */}
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/superadmin" element={<ProtectedRoute><SuperAdminPage /></ProtectedRoute>} />
        <Route path="/admin/actualizar-usuario/:id" element={<ProtectedRoute><ActualizarUsuarioPage /></ProtectedRoute>} />
        <Route path="/admin/productos" element={<ProtectedRoute><AdminProductosPage /></ProtectedRoute>} />
        <Route path="/mis-envios" element={<MisEnviosPage />} />
        <Route path="/admin/envios" element={<ProtectedRoute><AdminEnviosPage /></ProtectedRoute>} />
      </Routes>
      <Footer />
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
