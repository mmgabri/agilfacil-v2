import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { FaClock } from 'react-icons/fa';
import { AiOutlineExport } from "react-icons/ai";
import { FaNoteSticky, FaUserPen } from "react-icons/fa6";
import { FaUsers, FaPlay, FaStop, FaPlus } from 'react-icons/fa';
import { LiaEyeSlashSolid, LiaEyeSolid } from "react-icons/lia";
import InputMask from 'react-input-mask';
import ModalAddCollumn from '../modals/ModalAddCollumn';

const BoardControls = ({ countCard, countUserLogged, countUserWithCard, timeInput, isRunningTimer, handleInputTimerChange, handleStartTimer, handlePauseTimer, handleAddColumn, handleSetIsObfuscatedBoardLevel, isObfuscatedBoardLevel, isBoardCreator, isInvalidFormat, handleExportBoard, isObfuscatedCardLevel }) => {

  const [isModalOpen, setModalOpen] = useState(false);

  const InfoCard = ({ text, icon, count, iconSize }) => {
    return (
      <InfoCardContainer>
        <Text>{text}</Text>
        <Count>{count}</Count> {/* Contagem (valor) abaixo */}
      </InfoCardContainer>
    );
  };

  const handleModalAddCollmnSubmit = (collunName) => {
    handleAddColumn(collunName)
  }

  return (
    <BoardControlsStyled>
      <ModalAddCollumn
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalAddCollmnSubmit}
      />
      <InfoBox>
        <InfoCard text="Total de Cards no board" icon={FaNoteSticky} count={countCard} iconSize={30} />
        <InfoCard text="Participantes Online" icon={FaUsers} count={countUserLogged} iconSize={30} />
        <InfoCard text="Participantes com Card" icon={FaUserPen} count={countUserWithCard} iconSize={30} />
      </InfoBox>


      <TimerBox>
        <TimerIconClock />

        <TimerInput
          mask="99:99" // Máscara para MM:SS
          maskChar="_" // Caracter padrão de preenchimento
          value={timeInput}
          onChange={handleInputTimerChange}
          disabled={isRunningTimer}
          placeholder="MM:SS"
          $isInvalid={isInvalidFormat}
        />

        <TimerControls>
          {!isRunningTimer && (
            <TimerIconStart onClick={handleStartTimer} />
          )}
          {isRunningTimer && (
            <TimerIconStop onClick={handlePauseTimer} />
          )}
        </TimerControls>
      </TimerBox>

      <BoardActions>
        <ActionBox>
          {isBoardCreator && (
            <>
              {isObfuscatedBoardLevel ?
                (<ActionButton onClick={() => handleSetIsObfuscatedBoardLevel(false)} color="#1E3A5F" >
                  <LiaEyeSolid size={19} /> Revelar Cards
                </ActionButton>)
                :
                (<ActionButton onClick={() => handleSetIsObfuscatedBoardLevel(true)} color="#1E3A5F" >
                  <LiaEyeSlashSolid size={19} /> Ocultar cards
                </ActionButton>)
              }
            </>)}
          <ActionButton onClick={() => setModalOpen(true)} color="#1E3A5F">
            <FaPlus /> Incluir Coluna
          </ActionButton>
          {(!isObfuscatedBoardLevel && !isObfuscatedCardLevel) &&
            <ActionButton onClick={() => handleExportBoard()} color="#1E3A5F">
              <AiOutlineExport size={19} /> Exportar Board
            </ActionButton>}
        </ActionBox>
      </BoardActions>


    </BoardControlsStyled>

  );
};


// Estilização principal do controle do board
const BoardControlsStyled = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
margin-top: 5px;
padding: 0px 10px 0px 10px;
background-color: transparent; // #2c2c2c;
color: #fff;
flex-wrap: wrap; /* Adiciona flexibilidade ao layout */

/* Responsividade para telas menores */
@media (max-width: 768px) {
  flex-direction: column;
  align-items: flex-start;
}
`;


const InfoBox = styled.div`
display: flex; /* Garante que as colunas fiquem lado a lado */
align-items: center; /* Alinha os itens verticalmente */
justify-content: space-between; /* Espaçamento entre colunas */
flex-wrap: nowrap; /* Evita quebra de linha */
background-color: transparent; /* Fundo transparente */
padding: 0px; /* Espaçamento interno */
box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Sombra para destacar */
margin: 0px;
`;


const BoardActions = styled.div`
display: flex;
gap: 10px;
flex-wrap: wrap; /* Adiciona flexibilidade ao layout */

/* Responsividade para telas menores */
@media (max-width: 768px) {
  justify-content: center; /* Centraliza os botões em telas menores */
  width: 100%; /* Ocupa toda a largura disponível */
}
`;

const TimerBox = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
padding: 10px;
background-color: #2c2c2c;
border-radius: 8px;
color: #fff;
gap: 10px;
`;

// Estilo do TimerInput
const TimerInput = styled(InputMask)`
  width: 60px;
  padding: 5px;
  text-align: center;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid ${({ $isInvalid }) => ($isInvalid ? "red" : "#555")};
  background-color: ${({ $isInvalid }) => ($isInvalid ? "#1C1C1C" : "#1C1C1C")};
  color: #d1d1d1;

  &:disabled {
    background-color: #282c34;
    color: #888;
  }
`;

const TimerControls = styled.div`
display: flex;
gap: 8px;
`;

const TimerIconClock = styled(FaClock)`
font-size: 20px;
color: #d1d1d1;
margin-right: 3px;
`;

const TimerIconStart = styled(FaPlay)`
font-size: 20px;
color: #4169E1;
margin-right: 10px;
transition: transform 0.2s ease-in-out; /* Suaviza a transformação */

&:hover {
  transform: scale(1.3); /* Aumenta o tamanho em 20% */
}
`;
const TimerIconStop = styled(FaStop)`
font-size: 20px;
color: #4169E1;
margin-right: 10px;
transition: transform 0.2s ease-in-out; /* Suaviza a transformação */

&:hover {
  transform: scale(1.3); /* Aumenta o tamanho em 20% */
}
`;

const ActionBox = styled.div`
display: flex;
justify-content: flex-end; /* Alinha os botões à direita */
align-items: center;
gap: 10px;
background-color: transparent; /* Fundo transparente */
padding: 0px;
border-radius: 8px;
box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Sombra para destaque */

/* Responsividade */
@media (max-width: 768px) {
 justify-content: center; /* Centraliza os botões em telas menores */
 width: 100%;
}
`;


const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 7px;
   background-color: ${(props) => props.color || 'blue'}; 
  color: #fff;
  font-size: 13px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    transform: scale(1.1); /* Aumenta o tamanho em 20% */
  }

  span {
    font-size: 16px;
  }

  /* Responsividade para telas menores */
  @media (max-width: 768px) {
    width: 100%; /* Os botões ocupam toda a largura */
    justify-content: center; /* Centraliza o conteúdo */
    margin-bottom: 10px; /* Espaçamento entre os botões */
  }
`;







const InfoCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 10px;
  background-color: #1E3A5F;
  width: 85px;
  height: 50px;
  margin-right: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Text = styled.div`
  font-size: 10px;
  color: #fff;
  margin-bottom: 0px;
  text-align: center;
  font-weight: 500;
`;


const Count = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
`;

export default BoardControls;
