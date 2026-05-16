import React, { useState, useEffect } from 'react';
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from '@aws-amplify/auth';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { emitMessage, onSignOut, onGetToken } from '../../services/utils'
import { v4 as uuidv4 } from 'uuid';
import SuggestionForm from '../components/SuggestionForm'
import Header from '../components/Header';
import LoaderPage from '../generic/LoaderPage';
import styled from "styled-components";
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import { FormGroup, SubmitButton } from '../../styles/FormStyle'
import localStorageService from "../../services/localStorageService";
import logger from '../../services/logger';

const CTX = 'CreateAndEnterRoomPage';


function CreateAndEnterRoomPage() {
    let navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("create");
    const [userAuthenticated, setUserAuthenticated] = useState({});
    const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

    useEffect(() => {
        const initializeUserData = async () => {
            try {
                const user = await getCurrentUser();
                const attributes = await fetchUserAttributes(user);
                const userData = { userId: attributes.sub, userName: attributes.name, isVerified: true };
                const userStorage = { userId: attributes.sub, userName: attributes.name };
                setUserAuthenticated(userData)

                localStorageService.removeItem("AGILFACIL_USER_LOGGED");
                localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);

            } catch (error) {
                const user = localStorageService.getItem("AGILFACIL_USER_LOGGED");
                if (user === null) {
                    const userStorage = { userId: uuidv4() , userName: "Visitante", isVerified: true };
                    localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);
                    setUserAuthenticated(userStorage)
                    logger.info(CTX, `Usuário visitante criado userId=${userStorage.userId}`);
                } else {
                    logger.debug(CTX, `Usuário recuperado do localStorage userId=${user.userId}`);
                    setUserAuthenticated(user)
                }
            }
        }


        const checkAuth = async () => {
            try {
                const session = await fetchAuthSession();
                if (session.tokens == undefined) {
                    setUserIsAuthenticated(false)
                } else {
                    setUserIsAuthenticated(true)
                }
            } catch (error) {
                setUserIsAuthenticated(false)
            }
        }

        initializeUserData();
        checkAuth();
    }, []);

    const [formData, setFormData] = useState({
        nickName: "",
        roomName: "",
        roomId: ""
    });    

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmitCreateRoom = async e => {
        e.preventDefault()

        logger.info(CTX, `Criando sala roomName="${formData.roomName}" nickName="${formData.nickName}"`);

        try {
            setIsLoading(true)
            const response = await axios.post(SERVER_BASE_URL + '/poker/createRoom', { roomName: formData.roomName, nickName: formData.nickName, userId: userAuthenticated.userId, userName: userAuthenticated.userName })
            setIsLoading(false)
            logger.info(CTX, `Sala criada roomId=${response.data?.roomId ?? '?'}`);
            const userData = { ...userAuthenticated, nickName: formData.nickName, isRoomCreator: true };
            navigate('/room', { state: { roomData: response.data, userLogged: userData } });
        } catch (error) {
            setIsLoading(false)
            logger.error(CTX, 'Erro ao criar sala', { message: error.message, status: error.response?.status });
            emitMessage('error', 905, 3000)
        }
    }

    const handleSubmitJoinRoom = async e => {
        e.preventDefault()

        logger.info(CTX, `Entrando na sala roomId="${formData.roomId}" nickName="${formData.nickName}"`);

        try {
            setIsLoading(true)
            const response = await axios.get(`${SERVER_BASE_URL}/rooms/${formData.roomId}`)
            logger.info(CTX, `Sala encontrada roomId=${formData.roomId}`);
            const userData = { ...userAuthenticated, nickName: formData.nickName, isRoomCreator: false };
            setIsLoading(false)
            navigate('/room', { state: { roomData: response.data, userLogged: userData } });
        } catch (error) {
            setIsLoading(false)
            logger.warn(CTX, `Sala não encontrada roomId="${formData.roomId}"`, { status: error.response?.status });
            emitMessage('error', error.response?.status, 3000)
        }
    }

    return (
        <div className="bg-black-custom">
            <Header
                subText={'Planning Poker'}
                showSuggestionsModal={() => setModalOpen(true)}
                isUserLogged={userIsAuthenticated}
                signIn={() => navigate('/login')}
                signOut={onSignOut}
                goHome={() => navigate('/')} />

            {isLoading ?
                <LoaderPage />
                :
                <Container>
                    <TabsContainer>
                        <Tab $isActive={activeTab === "create"} onClick={() => setActiveTab("create")}>
                            Nova Sala
                        </Tab>
                        <Tab $isActive={activeTab === "join"} onClick={() => setActiveTab("join")}>
                            Entrar na Sala
                        </Tab>
                    </TabsContainer>

                    <FormContainer>
                        {activeTab === "create" ? (
                            <StyledForm onSubmit={handleSubmitCreateRoom}>
                                <Title>Inicie uma nova sessão de Planning Poker</Title>
                                <FormGroup>
                                    <label htmlFor="nickName">Seu nome*</label>
                                    <input
                                        type="text"
                                        id="nickName"
                                        name="nickName"
                                        value={formData.nickName}
                                        onChange={handleFieldChange}
                                        placeholder="Digite seu nome"
                                        required
                                        maxLength={15}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <label htmlFor="roomName">Nome da sala*</label>
                                    <input
                                        type="text"
                                        id="roomName"
                                        name="roomName"
                                        value={formData.roomName}
                                        onChange={handleFieldChange}
                                        placeholder="Digite o nome da sala"
                                        required
                                        maxLength={30}
                                    />
                                </FormGroup>
                                <SubmitButton $marginTop="22px" type="submit">Criar Sala</SubmitButton>
                            </StyledForm>
                        ) : (
                            <StyledForm onSubmit={handleSubmitJoinRoom}>
                                <Title>Junte-se à sala de Planning Poker</Title>
                                <FormGroup>
                                    <label htmlFor="nickName">Seu nome*</label>
                                    <input
                                        type="text"
                                        id="nickName"
                                        name="nickName"
                                        value={formData.nickName}
                                        onChange={handleFieldChange}
                                        placeholder="Digite seu nome"
                                        required
                                        maxLength={15}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <label htmlFor="roomId">ID da sala*</label>
                                    <input
                                        type="text"
                                        id="roomId"
                                        name="roomId"
                                        value={formData.roomId}
                                        onChange={handleFieldChange}
                                        placeholder="Digite o o id da sala"
                                        required
                                        maxLength={36}
                                    />
                                </FormGroup>
                                <SubmitButton $marginTop="22px" type="submit">Entrar na sala</SubmitButton>
                            </StyledForm>
                        )}
                    </FormContainer>
                </Container>}

            {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
        </div>
    );

}

const Container = styled.div`
  width: 100%;
  max-width: 500px; /* Largura máxima */
  margin: 0 auto; /* Centraliza horizontalmente */
  margin-top: 40px;
  height: 100%; /* Preenche a altura disponível */
  padding: 0; /* Remove qualquer espaçamento interno */
  background: transparent;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: white;
`;


export const StyledForm = styled.form`
  background: #2c2c2c;
  border-radius: 0px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 27px;
  width: 100%; 
  max-width: 550px; /* Máximo permitido */
  
`;

export const FormContainer = styled.div`
  display: flex;
  background: blue;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%; /* Ocupa toda a largura disponível */
  height: 100%; /* Ocupa toda a altura do Container */
  padding: 0; /* Remove qualquer espaçamento interno */
  margin: 0; /* Remove qualquer margem */
`;


const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #bbb;
`;

const Tab = styled.div`
  flex: 1;
  margin-top: 0px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  background: ${({ $isActive }) => ($isActive ? "#1E3A5F" : "#2c2c2c")};
  color: ${({ $isActive }) => ($isActive ? "white" : "#bbb")};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  transition: 0.3s;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? "#1E3A5F" : "#444")};
  }
`;

export const Title = styled.h1`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #C0C0C0;
  font-weight: 400;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;



export default CreateAndEnterRoomPage