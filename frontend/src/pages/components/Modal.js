import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Modal = ({ onClose, children }) => {
  const modalRef = useRef(null); // Referência para o contêiner do modal

  // Fechar o modal se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); 
      }
    };

    // Adiciona o listener de evento
    window.addEventListener('mousedown', handleClickOutside);
    
    // Limpeza do listener de evento na desmontagem do componente
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]); // Dependência do onClose para garantir que o hook se comporte corretamente


  return (
    <ModalOverlay>
       <ModalContent ref={modalRef}>
        <CloseButton onClick={onClose}>X</CloseButton>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  
  z-index: 9999;
  `;

export const ModalContent = styled.div`
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  `;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: bold;
  float: right;
  color: #C0C0C0
  `;

export default Modal;