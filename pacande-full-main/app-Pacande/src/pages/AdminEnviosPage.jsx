import React, { useEffect, useState } from "react";
import {
  getAllShipments,
  updateShipmentStatus,
} from "../services/shipmentService";
import { toast } from "react-hot-toast";
import styled from "@emotion/styled";

const AdminContainer = styled.div`
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
    transform: translateY(-2px);
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const StatusSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background-color: white;
  color: #2c3e50;
  font-size: 0.9em;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #b3b3b3;
  }

  &:focus {
    outline: none;
    border-color: #ff0000;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.1);
  }

  option {
    padding: 10px;
  }
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
  }
`;

const AdminEnviosPage = () => {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllShipments()
      .then((res) => {
        setEnvios(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error al cargar los envíos");
        setLoading(false);
      });
  }, []);

  const handleChangeStatus = async (id, nuevoEstado) => {
    try {
      await updateShipmentStatus(id, nuevoEstado);
      setEnvios(
        envios.map((envio) =>
          envio._id === id ? { ...envio, estado: nuevoEstado } : envio
        )
      );
      toast.success("Estado actualizado correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el estado");
    }
  };

  if (loading) {
    return (
      <AdminContainer>
        <div className="uk-flex uk-flex-center uk-flex-middle" style={{minHeight: '300px'}}>
          <div uk-spinner="ratio: 2"></div>
        </div>
      </AdminContainer>
    );
  }

  if (envios.length === 0) {
    return (
      <AdminContainer>
        <Title>Gestión de Envíos</Title>
        <EmptyState>
          <h3>No hay envíos registrados</h3>
          <p>Cuando los clientes realicen compras, los envíos aparecerán aquí.</p>
        </EmptyState>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Title>Gestión de Envíos</Title>
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
                <Label>Cliente</Label>
                <Value>{envio.cliente?.nombre || envio.cliente}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Dirección de envío</Label>
                <Value>{envio.direccionEnvio}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Estado actual</Label>
                <StatusSelect
                  value={envio.estado}
                  onChange={(e) => handleChangeStatus(envio._id, e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </StatusSelect>
              </InfoItem>
            </ShipmentInfo>
          </ShipmentBody>
        </ShipmentCard>
      ))}
    </AdminContainer>
  );
};

export default AdminEnviosPage;
