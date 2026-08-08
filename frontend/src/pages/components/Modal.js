import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { MdClose } from 'react-icons/md';

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


  // Renderiza direto no <body> via portal — assim o modal (position: fixed)
  // sempre cobre a tela toda, mesmo se o botão que o abre estiver dentro de
  // um ancestral com backdrop-filter/transform (ex: o Header), que cria um
  // novo "containing block" e faria o fixed se posicionar errado.
  return createPortal(
    <ModalOverlay>
       <ModalContent ref={modalRef}>
        <CloseButton onClick={onClose}><MdClose size={16} /></CloseButton>
        {children}
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  `;

export const ModalContent = styled.div`
  position: relative;
  background: #141418;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
  padding: 24px;
  border-radius: 20px;
  width: 500px;
  max-width: 90%;
  `;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  cursor: pointer;
  color: rgba(245, 245, 247, 0.62);

  &:hover {
    background: rgba(255, 255, 255, 0.11);
  }
  `;

export default Modal;