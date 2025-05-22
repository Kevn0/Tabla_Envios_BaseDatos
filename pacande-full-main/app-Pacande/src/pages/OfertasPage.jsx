import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import ProductGallery from "../components/ProductGallery";
import { fetchExchangeRates, convertCurrency } from "../services/CurrencyService";
import axios from "axios";
import { toast } from "react-hot-toast";
import "uikit/dist/css/uikit.min.css";
import { FaPercent, FaTag, FaShoppingCart } from "react-icons/fa";

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 40px;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 20px 40px;
`;

const OffersHeader = styled.div`
  background: linear-gradient(135deg, #000000, #1a1a1a);
  color: white;
  padding: 60px 40px;
  margin-bottom: 40px;
  text-align: center;
  border-radius: 15px;
  box-shadow: 0 4px 25px rgba(255, 0, 0, 0.15);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,0,0,0.1) 0%, transparent 60%);
    animation: pulse 4s linear infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.4;
    }
    100% {
      transform: scale(1);
      opacity: 0.6;
    }
  }
`;

const HeaderTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 800;
  background: linear-gradient(45deg, #ffffff, #ff0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  svg {
    color: #ff0000;
    -webkit-text-fill-color: #ff0000;
  }
`;

const HeaderDescription = styled.p`
  font-size: 1.4rem;
  max-width: 800px;
  margin: 20px auto 0;
  line-height: 1.6;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 30px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(5px);

  h3 {
    font-size: 2rem;
    margin: 0;
    color: #ff0000;
  }

  p {
    margin: 5px 0 0;
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const ProductsSection = styled.div`
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: #000000;
  margin-bottom: 40px;
  text-align: center;
  font-weight: bold;
  position: relative;
  display: block;
  width: 100%;
  padding-bottom: 10px;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(to right, #ff0000, #ff4444);
    border-radius: 2px;
  }
`;

const OfferBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff0000, #cc0000);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1rem;
  z-index: 1;
  box-shadow: 0 2px 10px rgba(255, 0, 0, 0.3);
  transform: rotate(5deg);
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

  p {
    color: #666;
    margin-top: 20px;
    font-size: 1.1rem;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 50px;
  background: #fff3f3;
  border-radius: 15px;
  color: #dc3545;
  margin: 20px;

  h3 {
    margin-bottom: 15px;
  }

  button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 15px;
    transition: all 0.3s ease;

    &:hover {
      background: #c82333;
    }
  }
`;

const OfertasPage = () => {
  const [currency, setCurrency] = useState("COP");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [stats, setStats] = useState({
    totalOffers: 0,
    maxDiscount: 0,
    averageSaving: 0
  });

  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error("Error al cargar tasas de cambio:", error);
        toast.error("Error al cargar las tasas de cambio");
      }
    };

    loadExchangeRates();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/products");
        const discountedProducts = response.data.products.filter(product => product.discount > 0);
        
        // Calcular estadísticas
        const totalOffers = discountedProducts.length;
        const maxDiscount = Math.max(...discountedProducts.map(p => p.discount));
        const totalSavings = discountedProducts.reduce((acc, p) => {
          const originalPrice = p.price;
          const discountAmount = (originalPrice * p.discount) / 100;
          return acc + discountAmount;
        }, 0);
        const averageSaving = totalSavings / totalOffers;

        setStats({
          totalOffers,
          maxDiscount,
          averageSaving: Math.round(averageSaving)
        });
        
        setProducts(discountedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setError("Error al cargar los productos en oferta");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const convertPrice = (price) => {
    if (!exchangeRates) return price;
    return convertCurrency(price, "COP", currency, exchangeRates);
  };

  if (loading) {
    return (
      <Container>
        <MainContent>
          <LoadingContainer>
            <div uk-spinner="ratio: 2"></div>
            <p>Cargando ofertas especiales...</p>
          </LoadingContainer>
        </MainContent>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <MainContent>
          <ErrorContainer>
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Intentar nuevamente
            </button>
          </ErrorContainer>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <MainContent>
        <OffersHeader>
          <HeaderTitle>
            <FaTag /> ¡Ofertas Especiales! <FaPercent />
          </HeaderTitle>
          <HeaderDescription>
            Descubre increíbles descuentos en nuestros productos seleccionados. 
            ¡No te pierdas estas oportunidades únicas para ahorrar!
          </HeaderDescription>
          <StatsContainer>
            <StatItem>
              <h3>{stats.totalOffers}</h3>
              <p>Productos en Oferta</p>
            </StatItem>
            <StatItem>
              <h3>Hasta {stats.maxDiscount}%</h3>
              <p>De Descuento</p>
            </StatItem>
            <StatItem>
              <h3>${stats.averageSaving.toLocaleString()}</h3>
              <p>Ahorro Promedio</p>
            </StatItem>
          </StatsContainer>
        </OffersHeader>

        <ProductsSection>
          <SectionTitle>Productos en Oferta</SectionTitle>
          {products.length > 0 ? (
            <ProductGallery
              products={products.map((product) => ({
                ...product,
                price: convertPrice(product.price),
                image: product.imageUrl,
                badge: (
                  <OfferBadge>
                    <FaTag /> {product.discount}% OFF
                  </OfferBadge>
                )
              }))}
              showSizes={true}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FaShoppingCart size={50} color="#ddd" />
              <h3 style={{ color: '#333', marginTop: '20px' }}>No hay ofertas disponibles</h3>
              <p style={{ color: '#666' }}>¡Vuelve pronto para encontrar nuevas ofertas increíbles!</p>
            </div>
          )}
        </ProductsSection>
      </MainContent>
    </Container>
  );
};

export default OfertasPage;
