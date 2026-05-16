import React, { useState } from 'react';
import axios from "axios";
import { SERVER_BASE_URL } from "../../../constants/apiConstants";
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import {FormContainer, FormGroup, Input, SubmitButton } from '../../../styles/ModalFormStyles';

const ModalAddCollumn = ({ isOpen, onClose, onSubmit}) => {
    const [formData, setFormData] = useState({
        userName: '',
        roomId: '',
    });
    const [textareaValue, setTextareaValue] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(textareaValue);
        setTextareaValue('');
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };


    return (

        <Modal isOpen={true} onClose={onClose}>
            <FormContainer>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <label>Nome da Coluna*</label>
                        <Input
                            id="contentCard"
                            name="contentCard"
                            value={textareaValue}
                            onChange={(e) => setTextareaValue(e.target.value)}
                            placeholder="Digite aqui o nome da coluna..."
                            maxLength={50}
                            required
                        />
                    </FormGroup>
                    <SubmitButton type="submit">Adicionar Coluna</SubmitButton>
                </form>
            </FormContainer>
        </Modal>
    );
};

export default ModalAddCollumn;
