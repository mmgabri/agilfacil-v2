import React, { useState } from 'react';
import axios from "axios";
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import Modal from './Modal';
import { toast } from 'react-toastify';
import { Title, FormContainer, FormGroup, Input, TextArea, SubmitButton } from '../../styles/ModalFormStyles';

const SuggestionForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    userName: '',
    roomId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(SERVER_BASE_URL + '/suggestion', { userName: formData.userName, email: formData.email, suggestion: formData.suggestion })
      .then(response => {
        toast.success('Obrigado por contribuir com sua sugestão!', {
          position: 'top-center', // Usando string para a posição
          autoClose: 3000, // Fecha automaticamente após 8 segundos
          hideProgressBar: false,
          closeButton: true, // Mostra o botão de fechar
          draggable: true, // Permite arrastar a notificação
          pauseOnHover: true, // Pausa o fechamento automático ao passar o mouse
        });
      })
      .catch((error) => {
        toast.warning('Ops, não foi possível registrar sua sugestão!', {
          position: 'top-center', // Usando string para a posição
          autoClose: 5000, // Fecha automaticamente após 8 segundos
          hideProgressBar: false,
          closeButton: true, // Mostra o botão de fechar
          draggable: true, // Permite arrastar a notificação
          pauseOnHover: true, // Pausa o fechamento automático ao passar o mouse
        });
      });

    onClose();
  };

  return (

    <Modal isOpen={true} onClose={onClose}>
      <FormContainer>
        <Title>Deixe aqui sua sugestão</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              type="text"
              id="name"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Digite seu nome (opcional)"
              maxLength={12}
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email (opcional)" // Placeholder
            />
          </FormGroup>
          <FormGroup>
            <TextArea
              id="suggestion"
              name="suggestion"
              value={formData.suggestion}
              onChange={handleChange}
              placeholder="Digite sua sugestão aqui"
              maxLength={500} // Limite de 500 caracteres
              rows={4} // Altura do textarea
              required
            />
          </FormGroup>
          <SubmitButton type="submit">Enviar</SubmitButton>
        </form>
      </FormContainer>
    </Modal>
  );
};

export default SuggestionForm;
