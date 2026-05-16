import React from "react";
import { FaSpinner } from "react-icons/fa";
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Loader = styled.div`
  color: #fff;
  text-align: center;
  margin-top: 20px;
  font-size: 2rem;
  animation: ${spin} 1s linear infinite;  // Aplica a animação de rotação
`;

const Container = styled.div`
  background-color: #1C1C1C;
  display: flex; /* Altera para flexbox para centralizar */
  justify-content: center; /* Centraliza horizontalmente */
  align-items: center; /* Centraliza verticalmente */
  width: 100vw; /* Largura total da viewport */
  height: 100vh; /* Altura total da viewport */
`;


export const LoaderPage = ({ }) => {

  return (
    <div className="bg-black-custom">
      <Container>
        <Loader>
          <FaSpinner />
        </Loader>
      </Container>
    </div>

  );
}
export default LoaderPage