import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";
import ProductGallery from "../components/ProductGallery";
import { fetchExchangeRates, convertCurrency } from "../services/CurrencyService";
import variedad from "../images/variedad.jpeg";

const Container = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 20px 40px;
`;

const CategoryHeader = styled.div`
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
              url(${props => props.backgroundImage});
  background-size: cover;
  background-position: center;
  padding: 60px 20px;
  margin-bottom: 40px;
  text-align: center;
  color: white;
  border-radius: 15px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);

  h1 {
    font-size: 5rem;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-weight: 800;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
    color: #ffffff;
  }

  p {
    font-size: 1.8rem;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    color: #ffffff;
    font-weight: 500;
  }
`;

const SectionTitle = styled.h2`
  margin-bottom: 30px;
  color: #000000;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  width: 100%;

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

const BorderedContainer = styled.div`
  padding: 30px;
  border-radius: 15px;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 50px;
  color: #666;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 50px;
  color: #dc3545;
`;

const VariedadPage = () => {
  const [currency, setCurrency] = useState("COP");
  const [exchangeRates, setExchangeRates] = useState({});
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedCategory = "Deporte";
  const selectedSubcategory = "variedad";

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const rates = await fetchExchangeRates();
        if (isMounted) {
          setExchangeRates(rates || {});
        }

        const response = await fetch(
          `http://localhost:5000/api/products/products?category=${selectedCategory}&subcategory=${selectedSubcategory}`
        );

        if (!response.ok) {
          throw new Error("Error al obtener productos");
        }

        const data = await response.json();
        
        if (isMounted) {
          setProducts(data.products || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        if (isMounted) {
          setError(error.message);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedSubcategory]);

  const convertPrice = (price) => {
    if (currency === "COP" || !exchangeRates || !exchangeRates[currency]) return price;
    return convertCurrency(price, exchangeRates[currency]);
  };

  if (error) {
    return (
      <Container>
        <MainContent>
          <CategoryHeader backgroundImage={variedad}>
            <h1>Variedad</h1>
            <p>Descubre una amplia selección de equipamiento deportivo para diferentes disciplinas.</p>
          </CategoryHeader>
          <ErrorContainer>
            <h3>Error</h3>
            <p>{error}</p>
          </ErrorContainer>
        </MainContent>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <MainContent>
          <CategoryHeader backgroundImage={variedad}>
            <h1>Variedad</h1>
            <p>Descubre una amplia selección de equipamiento deportivo para diferentes disciplinas.</p>
          </CategoryHeader>
          <LoadingContainer>
            <div uk-spinner="ratio: 2"></div>
            <p>Cargando productos...</p>
          </LoadingContainer>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <MainContent>
        <CategoryHeader backgroundImage={variedad}>
          <h1>Variedad</h1>
          <p>Descubre una amplia selección de equipamiento deportivo para diferentes disciplinas.</p>
        </CategoryHeader>
        
        <BorderedContainer>
          <ProductGallery
            products={products.map((product) => ({
              ...product,
              price: convertPrice(product.price),
              image: product.imageUrl,
            }))}
            showSpecs={true}
          />
        </BorderedContainer>
      </MainContent>
    </Container>
  );
};

export default VariedadPage;
