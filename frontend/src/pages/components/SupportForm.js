import React, { useState } from 'react';
import axios from "axios";
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import Modal from './Modal';
import { toast } from 'react-toastify';
import { Title, FormContainer, FormGroup, Input, TextArea, SubmitButton } from '../../styles/ModalFormStyles';

const SupportForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(SERVER_BASE_URL + '/support', { userName: formData.userName, email: formData.email, message: formData.message })
      .then(response => {
        toast.success('Sua solicitação de suporte foi enviada!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: true,
          draggable: true,
          pauseOnHover: true,
        });
      })
      .catch((error) => {
        toast.warning('Ops, não foi possível enviar sua solicitação de suporte!', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeButton: true,
          draggable: true,
          pauseOnHover: true,
        });
      });

    onClose();
  };

  return (

    <Modal isOpen={true} onClose={onClose}>
      <FormContainer>
        <Title>Precisa de ajuda? Fale com o suporte</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              type="text"
              id="supportName"
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
              id="supportEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email para retorno"
              required
            />
          </FormGroup>
          <FormGroup>
            <TextArea
              id="supportMessage"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Descreva o problema ou dúvida"
              maxLength={500}
              rows={4}
              required
            />
          </FormGroup>
          <SubmitButton type="submit">Enviar</SubmitButton>
        </form>
      </FormContainer>
    </Modal>
  );
};

export default SupportForm;
