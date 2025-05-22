import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";
import ProductGallery from "../components/ProductGallery";
import { fetchExchangeRates, convertCurrency } from "../services/CurrencyService";
import futbol from "../images/futbol.jpeg";

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
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

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

const DeportePage = () => {
  const [currency, setCurrency] = useState("COP");
  const [exchangeRates, setExchangeRates] = useState({});
  const [products, setProducts] = useState([]);
  const location = useLocation();
  
  const selectedCategory = "Deporte";
  const selectedSubcategory = location.pathname === "/deporte/futbol" ? "Fútbol" : "";

  useEffect(() => {
    const fetchRates = async () => {
      const rates = await fetchExchangeRates();
      if (rates) setExchangeRates(rates);
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `http://localhost:5000/api/products/products?category=${selectedCategory}`;
        if (selectedSubcategory) {
          url += `&subcategory=${selectedSubcategory}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Respuesta no válida del servidor");
        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory]);

  const convertPrice = (price) => {
    if (currency === "COP") return price;
    const rate = exchangeRates[currency];
    return rate ? convertCurrency(price, rate) : price;
  };

  return (
    <Container>
      <MainContent>
        <CategoryHeader backgroundImage={futbol}>
          <h1>Fútbol</h1>
          <p>Encuentra todo lo que necesitas para tu pasión deportiva. Equipamiento de alta calidad para el deporte rey.</p>
        </CategoryHeader>
        
        <BorderedContainer>
          <ProductGallery
            products={products.map((product) => ({
              ...product,
              price: convertPrice(product.price),
              image: product.imageUrl,
            }))}
            showSizes={true}
          />
        </BorderedContainer>
      </MainContent>
    </Container>
  );
};

export default DeportePage;
