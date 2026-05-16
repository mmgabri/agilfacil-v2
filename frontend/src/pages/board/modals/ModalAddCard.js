import React, { useState, useEffect } from 'react';
import axios from "axios";
import { SERVER_BASE_URL } from "../../../constants/apiConstants";
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import { FormContainer, FormGroup, TitleAddCard, SubmitButton, TextArea } from '../../../styles/ModalFormStyles';

const ModalAddCard = ({ isOpen, onClose, onSubmit, title, isUpdateCard, content }) => {
    const [textareaValue, setTextareaValue] = useState('');

    // Atualiza textareaValue quando o modal é aberto ou quando content/isUpdateCard mudam
    useEffect(() => {
        if (isOpen) {
            setTextareaValue(isUpdateCard ? content : '' );
        }
    }, [isOpen, isUpdateCard, content]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(textareaValue);
        setTextareaValue('');
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <FormContainer>
                <TitleAddCard>{title}</TitleAddCard>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <TextArea
                            value={textareaValue}
                            onChange={(e) => setTextareaValue(e.target.value)}
                            placeholder="Digite aqui o seu Card..."
                            maxLength={5000}
                            rows={isUpdateCard ? 9 : 4}
                            required
                        />
                    </FormGroup>
                    <SubmitButton type="submit">
                        {isUpdateCard ? 'Atualizar Card' : 'Adicionar Card'}
                    </SubmitButton>
                </form>
            </FormContainer>
        </Modal>
    );
};

export default ModalAddCard;
