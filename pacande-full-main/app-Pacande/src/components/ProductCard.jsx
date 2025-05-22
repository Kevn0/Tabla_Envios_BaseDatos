import React, { useState } from "react";
import styled from "@emotion/styled";
import "uikit/dist/css/uikit.min.css";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import PurchaseDialog from "./PurchaseDialog";
import { toast } from "react-hot-toast";
import { addToCart } from "../services/cartService";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";

const addToCartAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 0px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  position: relative;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.03);
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: ${({ isFavorite }) => (isFavorite ? "#ff0000" : "#808080")};
  transition: color 0.3s ease;
  z-index: 2;
  &:hover {
    color: ${({ isFavorite }) => (isFavorite ? "#cc0000" : "#ff0000")};
  }
  &:focus {
    outline: none;
  }
`;

const DiscountLabel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff0000;
  color: white;
  padding: 5px 10px;
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 5px;
  z-index: 2;
`;

const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: transform 0.3s ease;
  background-color: #f5f5f5;
  padding: 10px;
  z-index: 1;
  &:hover {
    transform: scale(1.1);
    z-index: 0;
  }
`;

const ProductTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

const StarRating = styled.div`
  color: #ffc107;
  margin-bottom: 10px;
`;

const PriceContainer = styled.div`
  margin-bottom: 10px;
`;

const Price = styled.span`
  font-size: 1.2rem;
  color: rgb(0, 0, 0);
  font-weight: bold;
`;

const SpecificationsContainer = styled.div`
  margin: 15px 0;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  text-align: left;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px 80px;
`;

const BuyButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #ff0000;
  color: white;
  cursor: pointer;
  border-radius: 0px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #cc0000;
  }
`;

const CartButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #ff0000;
  color: white;
  cursor: pointer;
  border-radius: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background-color 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: #cc0000;
  }

  &.adding {
    animation: ${addToCartAnimation} 0.5s ease;
  }

  .cart-icon {
    transition: transform 0.3s ease;
  }

  &:hover .cart-icon {
    transform: translateX(3px);
  }
`;

const SuccessOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(40, 167, 69, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transform: translateY(100%);
  transition: transform 0.3s ease;

  &.show {
    transform: translateY(0);
  }
`;

const ProductCard = ({
  _id,
  title,
  price,
  image,
  showSizes,
  sizes,
  discount,
  category,
  specifications,
  description,
  subcategory
}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
  };

  const handleSizeClick = (size) => {
    if (selectedSize === size) {
      setSelectedSize(null);
    } else {
      setSelectedSize(size);
    }
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Por favor inicia sesión para realizar esta acción", {
        icon: '🔒',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000
      });
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleBuyClick = () => {
    if (checkAuthentication()) {
      setOpenPurchaseDialog(true);
    }
  };

  const handleAddToCart = () => {
    if (!checkAuthentication()) {
      return;
    }

    try {
      const productToAdd = {
        _id,
        title,
        price,
        image,
        category,
        subcategory
      };
      
      setIsAddingToCart(true);
      setShowSuccess(true);
      
      addToCart(productToAdd);
      
      toast.success("¡Producto agregado al carrito!", {
        icon: '🛍️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      setTimeout(() => {
        setIsAddingToCart(false);
        setShowSuccess(false);
      }, 1000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error("Error al agregar el producto al carrito");
      setIsAddingToCart(false);
      setShowSuccess(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    toast.success("¡Inicio de sesión exitoso!");
  };

  const imageUrl = image || "http://placekitten.com/500/500";

  return (
    <Card>
      <FavoriteButton isFavorite={isFavorite} onClick={handleFavoriteClick}>
        <FaStar />
      </FavoriteButton>
      {discount && <DiscountLabel>50% OFF</DiscountLabel>}
      <ProductImage src={imageUrl} alt={title} />
      <ProductTitle>{title}</ProductTitle>
      {description && (
        <p style={{ marginBottom: "10px", color: "#666" }}>{description}</p>
      )}
      <StarRating>
        <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
      </StarRating>
      <PriceContainer>
        <Price>{price}</Price>
      </PriceContainer>

      {category === "Tecnología" && specifications && (
        <SpecificationsContainer>
          <h4>Especificaciones:</h4>
          <ul>
            {specifications.map((spec, index) => (
              <li key={index}>{spec}</li>
            ))}
          </ul>
        </SpecificationsContainer>
      )}

      <ButtonContainer>
        <BuyButton onClick={handleBuyClick}>Comprar Ahora</BuyButton>
        <CartButton 
          onClick={handleAddToCart} 
          className={isAddingToCart ? 'adding' : ''}
          disabled={isAddingToCart}
        >
          <FaShoppingCart className="cart-icon" />
          Agregar al Carrito
          <SuccessOverlay className={showSuccess ? 'show' : ''}>
            ¡Agregado! ✓
          </SuccessOverlay>
        </CartButton>
      </ButtonContainer>

      <PurchaseDialog
        open={openPurchaseDialog}
        onClose={() => setOpenPurchaseDialog(false)}
        product={{
          _id,
          title,
          price: typeof price === 'string' ? price.replace(/[^0-9]/g, '') : price,
          image,
          category,
          subcategory
        }}
      />

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </Card>
  );
};

export default ProductCard;
