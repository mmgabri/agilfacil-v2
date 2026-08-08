import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import '../../styles/Invite.css';
import { FRONT_BASE_URL } from "../../constants/apiConstants";
import styled from "@emotion/styled";

const Invite = ({ id, onClose, service }) => {
  const [copied, setCopied] = useState(false);

  // Gerar URL com base no ID da sala
  const inviteUrlPoker = `${FRONT_BASE_URL}/room/guest/${id}`;
  const inviteUrlBoard = `${FRONT_BASE_URL}/board/guest/${id}`;

  // Função para lidar com o estado de cópia
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Resetar o estado após 2 segundos
  };

  if (!id) return null; // Não renderiza o modal se não houver roomId

  return (
    <div className="overlay">
      <div className="invite-container">
        <button className="close-button" onClick={onClose}>&times;</button>
        <CopyToClipboard
          text={service === 'poker' ? inviteUrlPoker : inviteUrlBoard} onCopy={handleCopy}>
          <div className="invite-url-container">
            <input
              type="text"
              value={service === 'poker' ? inviteUrlPoker : inviteUrlBoard}
              readOnly
              className="invite-url"
              onClick={handleCopy} // Copia a URL ao clicar no input
            />
            <CopyButtonStyled>
              {copied ? 'Copiado!' : 'Copiar URL'}
            </CopyButtonStyled>
          </div>
        </CopyToClipboard>
      </div>
    </div>
  );
};

const CopyButtonStyled = styled.button`
  background: linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%);
  margin-bottom: 4px;
  margin-top: 4px;
  color: #0a0a0d;
  border: none;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(139, 124, 246, 0.18);
  transition: filter 0.15s ease, transform 0.1s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

export default Invite;
