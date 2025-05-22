import React from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import mujer from "../images/mujer1.jpg";
import hombre from "../images/hombre.jpg";
import nino from "../images/pantalon.jpg";

const Container = styled.div`
  max-width: 1200px;
  margin: 120px auto 40px;
  padding: 20px;
`;

const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5em;
  font-weight: 600;
  position: relative;
  
  &:after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #ff0000, #ff4444);
    margin: 10px auto;
    border-radius: 2px;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const CategoryCard = styled(Link)`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: white;

  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.9) 0%,
    rgba(0,0,0,0.7) 100%
  );
  padding: 25px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: all 0.3s ease;
`;

const CategoryTitle = styled.h3`
  margin: 0;
  font-size: 2em;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Description = styled.p`
  margin-top: 15px;
  font-size: 1.1em;
  line-height: 1.4;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
`;

const RopaMainPage = () => {
  const categories = [
    {
      title: "Mujer",
      image: mujer,
      path: "/Ropamujer",
      description: "Descubre las últimas tendencias en moda femenina"
    },
    {
      title: "Hombre",
      image: hombre,
      path: "/Ropahombre",
      description: "Encuentra tu estilo con nuestra colección masculina"
    },
    {
      title: "Niños",
      image: nino,
      path: "/Ropaniño",
      description: "Ropa cómoda y divertida para los más pequeños"
    }
  ];

  return (
    <Container>
      <Title>Ropa</Title>
      <CategoryGrid>
        {categories.map((category, index) => (
          <CategoryCard 
            to={category.path} 
            key={index}
            onMouseEnter={(e) => {
              const overlay = e.currentTarget.querySelector('div');
              if (overlay) {
                overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)';
              }
            }}
            onMouseLeave={(e) => {
              const overlay = e.currentTarget.querySelector('div');
              if (overlay) {
                overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)';
              }
            }}
          >
            <img src={category.image} alt={category.title} />
            <CardOverlay>
              <CategoryTitle>{category.title}</CategoryTitle>
              <Description>{category.description}</Description>
            </CardOverlay>
          </CategoryCard>
        ))}
      </CategoryGrid>
    </Container>
  );
};

export default RopaMainPage; 