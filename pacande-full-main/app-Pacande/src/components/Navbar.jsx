import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaShoppingCart, FaUsersCog, FaBoxOpen, FaTruck, FaSearch } from "react-icons/fa";
import styled from "@emotion/styled";
import "uikit/dist/css/uikit.min.css";
import logo from "../images/logopaca.png";
import LoginModal from "./LoginModal";
import Tooltip from "./Tooltip";

const NavbarContainer = styled.nav`
  background-color: rgba(0, 0, 0, 0.95);
  box-shadow: 0 2px 15px rgba(255, 0, 0, 0.1);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  height: auto;
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.3rem 2rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 0, 0, 0.1);
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 10px;
`;

const Logo = styled.img`
  height: 35px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const BrandName = styled.span`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
`;

const HighlightedLetter = styled.span`
  color: #ff0000;
  font-size: 28px;
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 2px solid rgba(255, 0, 0, 0.3);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff0000;
    background-color: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: #ff0000;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.5rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.3rem 1.5rem;
  font-size: 1rem;
  position: relative;
  transition: all 0.3s ease;

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background-color: #ff0000;
    transition: all 0.3s ease;
  }

  &:hover {
    color: #ff0000;
    
    &:after {
      width: 80%;
      left: 10%;
    }
  }
`;

const UserMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: rgba(0, 0, 0, 0.95);
  border: 1px solid #ff0000;
  border-radius: 8px;
  padding: 0.5rem 0;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform-origin: top right;
  transform: ${({ isOpen }) => isOpen ? 'scale(1)' : 'scale(0.95)'};
  opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 0.8rem 1.5rem;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: rgba(255, 0, 0, 0.1);
    color: #ff0000;
  }
`;

const AdminPanel = styled.div`
  display: flex;
  gap: 1rem;
  margin-right: 1rem;
`;

const AdminButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.8rem;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 15px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: rgba(255, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1rem;
  }
`;

const UserGreeting = styled.span`
  color: white;
  font-weight: 500;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  background: linear-gradient(45deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.2));
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: linear-gradient(45deg, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0.3));
  }
`;

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rol, setRol] = useState(null);

  const updateUserInfo = () => {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre");
    const rolUsuario = localStorage.getItem("rol");
    if (token) {
      setIsAuthenticated(true);
      setNombreUsuario(nombre);
      setRol(rolUsuario);
    }
  };

  useEffect(() => {
    updateUserInfo();

    // Escuchar cambios en el localStorage de otras pestañas
    const handleStorageChange = (e) => {
      if (e.key === "nombre") {
        updateUserInfo();
      }
    };

    // Escuchar el evento personalizado para cambios en la misma pestaña
    const handleCustomEvent = (e) => {
      updateUserInfo();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nombreUsuarioActualizado', handleCustomEvent);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nombreUsuarioActualizado', handleCustomEvent);
    };
  }, []);

  const handleUserClick = () => {
    if (isAuthenticated) {
      setUserMenuOpen(!userMenuOpen);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
    localStorage.removeItem("userId");
    setRol(null);
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <NavbarContainer>
      <NavContent>
        <TopBar>
          <LogoContainer to="/">
            <Logo src={logo} alt="Logo" />
            <BrandName>
              <HighlightedLetter>P</HighlightedLetter>acande
            </BrandName>
          </LogoContainer>

          <SearchBar>
            <SearchIcon />
            <SearchInput placeholder="Buscar productos..." />
          </SearchBar>

          <UserActions>
            {isAuthenticated && (rol === "Admin" || rol === "Superadmin") && (
              <AdminPanel>
                {rol === "Superadmin" && (
                  <AdminButton to="/superadmin">
                    <FaUsersCog />
                    Usuarios
                  </AdminButton>
                )}
                <AdminButton to="/admin/productos">
                  <FaBoxOpen />
                  Productos
                </AdminButton>
                <AdminButton to="/admin/envios">
                  <FaTruck />
                  Envíos
                </AdminButton>
              </AdminPanel>
            )}

            <div style={{ position: 'relative' }}>
              {isAuthenticated ? (
                <UserGreeting onClick={handleUserClick}>
                  Hola, {nombreUsuario}
                </UserGreeting>
              ) : (
                <IconButton onClick={handleUserClick}>
                  <FaUser />
                </IconButton>
              )}

              <UserMenu isOpen={userMenuOpen}>
                <MenuItem onClick={() => {
                  setUserMenuOpen(false);
                  window.location.href = "/perfil";
                }}>
                  <FaUser /> Mi Perfil
                </MenuItem>
                <MenuItem onClick={() => {
                  setUserMenuOpen(false);
                  window.location.href = "/mis-envios";
                }}>
                  <FaTruck /> Mis Envíos
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Cerrar Sesión
                </MenuItem>
              </UserMenu>
            </div>

            {isAuthenticated && (
              <IconButton as={Link} to="/carrito">
                <FaShoppingCart />
              </IconButton>
            )}
          </UserActions>
        </TopBar>

        <NavLinks>
          <NavLink to="/ropa">Ropa</NavLink>
          <NavLink to="/tecnologia">Tecnología</NavLink>
          <NavLink to="/hogar">Hogar</NavLink>
          <NavLink to="/deportes">Deportes</NavLink>
          <NavLink to="/ofertas">Ofertas</NavLink>
        </NavLinks>
      </NavContent>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </NavbarContainer>
  );
};

export default Navbar;
