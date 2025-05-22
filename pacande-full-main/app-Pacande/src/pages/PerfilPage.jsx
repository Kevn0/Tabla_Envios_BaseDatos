import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaEdit } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/auth";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const Container = styled.div`
  width: min(95%, 1200px);
  margin: 100px auto 2rem;
  padding: clamp(1rem, 3vw, 2rem);
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #000000, #333333);
  border-radius: 1rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  position: relative;
  top: -2rem;
  margin-bottom: -1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    top: 0;
    margin-bottom: 0;
  }
`;

const ProfileAvatar = styled.div`
  width: clamp(100px, 15vw, 140px);
  height: clamp(100px, 15vw, 140px);
  background-color: #ff0000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 4px solid white;
  transform: translateY(-30%);

  @media (min-width: 768px) {
    transform: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    transform: ${props => props.isUpdating ? 'none' : 'scale(1.05) translateY(-30%)'};
    @media (min-width: 768px) {
      transform: ${props => props.isUpdating ? 'none' : 'scale(1.05)'};
    }
  }

  &:hover .overlay {
    opacity: 1;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;

  h1 {
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  p {
    font-size: clamp(1rem, 3vw, 1.3rem);
    opacity: 0.9;
    margin: 0.5rem 0 0;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(3px);
  font-size: 1.5rem;
`;

const ProfileGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: clamp(1.5rem, 4vw, 2rem);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }

  h3 {
    color: #000000;
    margin: 0 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: clamp(1.1rem, 3vw, 1.3rem);
    font-weight: 600;

    svg {
      color: #ff0000;
      font-size: 1.2em;
    }
  }
`;

const InfoGroup = styled.div`
  margin-bottom: 1.2rem;
  
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #444;
    font-size: 0.95rem;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
    word-break: break-word;
    line-height: 1.4;
  }
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? '#555' : '#ff0000'};
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background-color: ${props => props.secondary ? '#666' : '#e60000'};
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #999;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  margin: 0.5rem 0;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #ff0000;
    box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

const LoadingSpinner = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const PerfilPage = () => {
  const [perfil, setPerfil] = useState({ nombre: "", correo: "", profilePicture: null });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", correo: "" });
  const [passwordForm, setPasswordForm] = useState({ actual: "", nueva: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  }), []);

  const handleApiError = useCallback((error, customMessage) => {
    console.error("Error:", error);
    toast.error(customMessage || "Ha ocurrido un error");
  }, []);

  const cargarPerfil = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const res = await fetch(`${API_URL}/perfil`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        throw new Error("Error al cargar el perfil");
      }

      const data = await res.json();
      setPerfil(data);
      setEditForm({ nombre: data.nombre, correo: data.correo });
    } catch (error) {
      handleApiError(error, "Error al cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, getAuthHeaders, handleApiError]);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('nombre', perfil.nombre);
    formData.append('correo', perfil.correo);

    setIsUpdating(true);
    try {
      const res = await fetch(`${API_URL}/actualizar`, {
        method: "PUT",
        headers: { Authorization: getAuthHeaders().Authorization },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al actualizar la foto");

      const data = await res.json();
      setPerfil(prev => ({ ...prev, profilePicture: data.usuario.profilePicture }));
      toast.success("Foto de perfil actualizada correctamente");
    } catch (error) {
      handleApiError(error, "Error al actualizar la foto de perfil");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.nombre.trim() || !editForm.correo.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`${API_URL}/actualizar`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Error al actualizar la información");

      setPerfil(prev => ({ ...prev, ...editForm }));
      setEditMode(false);
      toast.success("Información actualizada correctamente");
    } catch (error) {
      handleApiError(error, "Error al actualizar la información");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.actual.trim() || !passwordForm.nueva.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (passwordForm.nueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/cambiar-contrasena`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contrasenaActual: passwordForm.actual,
          nuevaContrasena: passwordForm.nueva,
        }),
      });

      if (!res.ok) throw new Error("Error al cambiar la contraseña");

      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ actual: "", nueva: "" });
    } catch (error) {
      handleApiError(error, "Error al cambiar la contraseña");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <ProfileHeader>
        <ProfileAvatar onClick={() => fileInputRef.current?.click()} isUpdating={isUpdating}>
          {isUpdating ? (
            <LoadingSpinner />
          ) : perfil.profilePicture ? (
            <img src={`${API_URL}${perfil.profilePicture}`} alt="Foto de perfil" />
          ) : (
            <FaUser />
          )}
          <AvatarOverlay className="overlay">
            <FaCamera />
          </AvatarOverlay>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </ProfileAvatar>
        <ProfileInfo>
          <h1>{perfil.nombre}</h1>
          <p>{perfil.correo}</p>
        </ProfileInfo>
      </ProfileHeader>

      <ProfileGrid>
        <ProfileCard>
          <h3><FaEnvelope /> Información de Contacto</h3>
          {editMode ? (
            <>
              <InfoGroup>
                <label>Nombre</label>
                <Input
                  type="text"
                  placeholder="Tu nombre"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  disabled={isUpdating}
                />
              </InfoGroup>
              <InfoGroup>
                <label>Correo electrónico</label>
                <Input
                  type="email"
                  placeholder="Tu correo"
                  value={editForm.correo}
                  onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                  disabled={isUpdating}
                />
              </InfoGroup>
              <Button onClick={handleSaveEdit} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner /> : "Guardar Cambios"}
              </Button>
              <Button secondary onClick={() => setEditMode(false)} disabled={isUpdating}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <InfoGroup>
                <label>Nombre</label>
                <p>{perfil.nombre}</p>
              </InfoGroup>
              <InfoGroup>
                <label>Correo electrónico</label>
                <p>{perfil.correo}</p>
              </InfoGroup>
              <Button onClick={() => setEditMode(true)}>
                <FaEdit /> Editar Información
              </Button>
            </>
          )}
        </ProfileCard>

        <ProfileCard>
          <h3><FaLock /> Cambiar Contraseña</h3>
          <InfoGroup>
            <label>Contraseña actual</label>
            <Input
              type="password"
              placeholder="Ingresa tu contraseña actual"
              value={passwordForm.actual}
              onChange={(e) => setPasswordForm({ ...passwordForm, actual: e.target.value })}
              disabled={isChangingPassword}
            />
          </InfoGroup>
          <InfoGroup>
            <label>Nueva contraseña</label>
            <Input
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              value={passwordForm.nueva}
              onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
              disabled={isChangingPassword}
            />
          </InfoGroup>
          <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
            {isChangingPassword ? <LoadingSpinner /> : "Actualizar Contraseña"}
          </Button>
        </ProfileCard>
      </ProfileGrid>
    </Container>
  );
};

export default PerfilPage;
