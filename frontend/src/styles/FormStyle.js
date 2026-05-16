import styled from 'styled-components';
import { MdOutlineRemoveCircleOutline } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
`;

export const Title = styled.h1`
  font-size: 1.0rem;
  margin-bottom: 20px;
  color: #C0C0C0;
  font-weight: 400;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const StyledForm = styled.form`
  background: #2c2c2c;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 27px;
  width: 40%; /* Ocupará 80% da largura da tela */
  max-width: 550px; /* Máximo permitido */
  
`;

export const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
    color: #C0C0C0;
    font-size: 14px;
  }

  input {
    width: 100%;
    padding: 7px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 15px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      outline: none;
    }
  }
`;

export const SubmitButton = styled.button`
  display: inline-block;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #1E3A5F;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: ${(props) => props.$marginTop || '7px'};
  height: 45px;
  transition: transform 0.1s ease-in-out; /* Suaviza a transformação */

  &:hover {
    transform: scale(1.05); 
  }
 `;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const CheckboxLabel = styled.label`
  margin: 4px;
  margin-left: 4px;
  font-size: 800px; /* Tamanho da fonte do label */
  white-space: nowrap; /* Impede a quebra de linha */
  line-height: 1; /* Ajuste para alinhamento vertical */
  font-size: 12px !important; /* Força o tamanho da fonte no label */
  font-weight: normal !important;; /* Impede o texto de ficar em negrito */
`;

export const RemoveIcon = styled(MdOutlineRemoveCircleOutline)`
  cursor: pointer;
  color:  #007bff; // #4169E1;
  font-size: 35px;
  margin-left: 5px;
  margin-right: 8px;
  transition: transform 0.1s ease-in-out; /* Suaviza a transformação */

  &:hover {
    transform: scale(1.2); 
  }
`;

export const AddColumnIcon = styled(IoIosAddCircleOutline)`
  cursor: pointer;
  color: #007bff;
  font-size: 35px;
  margin-top: 8px;
  transition: transform 0.1s ease-in-out; /* Suaviza a transformação */

  &:hover {
    transform: scale(1.2); 
  }
`;

export const TextArea = styled.textarea`
  width: 100%; /* O campo de texto ocupa toda a largura do grupo */
  padding: 10px; /* Espaço interno no campo */
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