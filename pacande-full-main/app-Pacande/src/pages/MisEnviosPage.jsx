import React, { useEffect, useState } from "react";
import { getShipmentsByUser } from "../services/shipmentService";
import { toast } from "react-hot-toast";
import styled from "@emotion/styled";

const EnviosContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
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

const ShipmentCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ShipmentHeader = styled.div`
  background: #000000;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ShipmentBody = styled.div`
  padding: 20px;
`;

const ShipmentInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.span`
  color: #666;
  font-size: 0.9em;
`;

const Value = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'entregado':
        return '#28a745';
      case 'enviado':
        return '#007bff';
      case 'pendiente':
        return '#ffc107';
      case 'cancelado':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }};
  color: white;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const ErrorContainer = styled.div`
  background: #fff3f3;
  border: 1px solid #dc3545;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  text-align: center;

  h4 {
    color: #dc3545;
    margin-bottom: 10px;
  }

  button {
    margin-top: 15px;
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #c82333;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px auto;
  max-width: 600px;

  h3 {
    color: #2c3e50;
    margin-bottom: 15px;
  }

  p {
    color: #6c757d;
    margin-bottom: 20px;
  }
`;

const MisEnviosPage = () => {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
    
    const fetchEnvios = async () => {
      try {
        if (!storedUserId) {
          setError("No se encontró la identificación del usuario. Por favor, inicie sesión nuevamente.");
          setLoading(false);
          return;
        }

        const res = await getShipmentsByUser(storedUserId);
        if (res && res.data) {
          setEnvios(res.data);
        } else {
          setError("No se pudieron obtener los envíos");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        toast.error(`Error al cargar los envíos: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvios();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner>
        <div uk-spinner="ratio: 2"></div>
      </LoadingSpinner>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <h4>Error al cargar los envíos</h4>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Intentar nuevamente
        </button>
      </ErrorContainer>
    );
  }

  if (envios.length === 0) {
    return (
      <EnviosContainer>
        <Title>Mis Envíos</Title>
        <EmptyState>
          <h3>No tienes envíos registrados</h3>
          <p>Cuando realices una compra, tus envíos aparecerán aquí.</p>
        </EmptyState>
      </EnviosContainer>
    );
  }

  return (
    <EnviosContainer>
      <Title>Mis Envíos</Title>
      {envios.map((envio) => (
        <ShipmentCard key={envio._id}>
          <ShipmentHeader>
            <span>Pedido #{envio._id.slice(-6)}</span>
            <StatusBadge status={envio.estado}>
              {envio.estado}
            </StatusBadge>
          </ShipmentHeader>
          <ShipmentBody>
            <ShipmentInfo>
              <InfoItem>
                <Label>Dirección de envío</Label>
                <Value>{envio.direccionEnvio}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Fecha de envío</Label>
                <Value>
                  {new Date(envio.fechaEnvio).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>Método de envío</Label>
                <Value>{envio.metodoEnvio}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Costo de envío</Label>
                <Value>${envio.costoEnvio.toLocaleString()}</Value>
              </InfoItem>
            </ShipmentInfo>
          </ShipmentBody>
        </ShipmentCard>
      ))}
    </EnviosContainer>
  );
};

export default MisEnviosPage;
