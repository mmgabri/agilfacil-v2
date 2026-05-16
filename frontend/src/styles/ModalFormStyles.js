import styled from 'styled-components';

export const Title = styled.h2`
  font-size: 20px;
  color: #C0C0C0;
  text-align: center;
  margin-bottom: 25px;
`;

export const TitleAddCard = styled.h2`
  font-size: 20px;
  color: #c0c0c0;
  text-align: center;
  margin-bottom: 25px;
`;

export const FormContainer = styled.div`
  max-width: 500px; /* Largura máxima do container */
  margin: 20px auto; /* Centralizando horizontalmente */
  padding: 10px; /* Espaçamento interno */
  border-radius: 10px; /* Bordas arredondadas */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra para efeito de profundidade */
  color: #C0C0C0; /* Cor do texto */
  background-color: #2c2c2c;
`;
// Estilizando o FormGroup
export const FormGroup = styled.div`
  margin-bottom: 15px; /* Espaçamento entre os grupos de formulário */
`;

export const Input = styled.input`
  width: 100%; /* O campo de entrada ocupa toda a largura do grupo */
  padding: 10px; /* Espaço interno no campo */
  border: 1px solid #ccc; /* Borda padrão */
  border-radius: 5px; /* Bordas arredondadas */
  font-size: 13px; /* Tamanho da fonte do campo de entrada */
  background-color: #ffffff; /* Cor de fundo do campo */
  
  &:focus {
    border-color: #10b981; /* Cor da borda ao focar no campo */
    outline: none; /* Remove a borda padrão de foco */
  }
`;

export const TextArea = styled.textarea`
  width: 100%; /* O campo de texto ocupa toda a largura do grupo */
  padding: 10px; /* Espaço interno no campo */
  margin-botton: 300px;
  border: 1px solid #ccc; /* Borda padrão */
  border-radius: 5px; /* Bordas arredondadas */
  font-size: 13px; /* Tamanho da fonte do campo de entrada */
  background-color: #ffffff; /* Cor de fundo do campo */
  resize: none; /* Impede o redimensionamento do campo de texto */

  &:focus {
    border-color: #10b981; /* Cor da borda ao focar no campo */
    outline: none; /* Remove a borda padrão de foco */
  }
`;

export const SubmitButton = styled.button`
  display: inline-block;
  width: 100%;
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #1E3A5F;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 0px;
  height: 45px;
  transition: transform 0.1s ease-in-out; /* Suaviza a transformação */

  &:hover {
    transform: scale(1.05); 
  }
 `;