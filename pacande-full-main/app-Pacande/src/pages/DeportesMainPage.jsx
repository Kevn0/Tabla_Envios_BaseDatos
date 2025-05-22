import React from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import futbol from "../images/futbol.jpeg";
import baloncesto from "../images/baloncesto.jpeg";
import variedad from "../images/variedad.jpeg";

const Container = styled.div`
  max-width: 100%;
  margin: 0;
  padding: 0;
`;

const BannerSection = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url(${futbol}) center/cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  margin-top: 60px;
`;

const BannerTitle = styled.h1`
  font-size: 3.5em;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
  font-weight: 800;
  color: #ffffff;
`;

const BannerDescription = styled.p`
  font-size: 1.2em;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-weight: 500;
  color: #ffffff;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
`;

const Title = styled.h2`
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
  height: 300px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  img {
    width: 100%;
    height: 100%;
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

const DeportesMainPage = () => {
  const categories = [
    {
      title: "Fútbol",
      image: futbol,
      path: "/deporte/futbol",
      description: "Encuentra todo para el deporte rey: balones, uniformes y accesorios"
    },
    {
      title: "Baloncesto",
      image: baloncesto,
      path: "/BaloncestoPage",
      description: "Equípate para la cancha con lo mejor en baloncesto"
    },
    {
      title: "Variedad",
      image: variedad,
      path: "/VariedadPage",
      description: "Descubre equipamiento para diversos deportes"
    }
  ];

  return (
    <Container>
      <BannerSection>
        <BannerTitle>DEPORTES</BannerTitle>
        <BannerDescription>
          Encuentra todo lo que necesitas para tu pasión deportiva. Equipamiento de alta calidad para
          fútbol, baloncesto y más.
        </BannerDescription>
      </BannerSection>
      
      <MainContent>
        <Title>Deporte</Title>
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
      </MainContent>
    </Container>
  );
};

export default DeportesMainPage; 