import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom'
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from '@aws-amplify/auth';
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import styled from 'styled-components';
import Header from '../components/Header';
import { emitMessage, formatdateTime, onSignOut } from '../../services/utils'
import SuggestionForm from '../components/SuggestionForm'
import { FormContainer, FormGroup, StyledForm, SubmitButton } from '../../styles/FormStyle'
import localStorageService from "../../services/localStorageService";

export const GuestUrlPage = ({ }) => {
    const { id } = useParams(); // Obtém o ID da URL
    let navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);
    const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
    const [userLogged, setUserLogged] = useState({});
    const [roomData, setRoomData] = useState({ users: [] });
    const [formData, setFormData] = useState({
        nickName: "",
        roomId: "",
        roomName: ""
      });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        //console.log('useEffect')

        const initializeUserData = async () => {
            try {
                const user = await getCurrentUser();
                const attributes = await fetchUserAttributes(user);

                const userData = { userId: attributes.sub, userName: attributes.name, isVerified: true, isRoomCreator: false };
                const userStorage = { userId: attributes.sub, userName: attributes.name };

                localStorageService.removeItem("AGILFACIL_USER_LOGGED");
                localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);
                setUserLogged(userData)

            } catch (error) {
                if (error.toString().includes("UserUnAuthenticatedException")) {
                    const userStorage = localStorageService.getItem("AGILFACIL_USER_LOGGED");

                    if (!userStorage) {
                        const userStorage = { userId: uuidv4() }
                        const userData = { ...userStorage, isVerified: false, isRoomCreator: false };
                        localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);
                        setUserLogged(userData)
                    } else {
                        const userData = { ...userStorage, isVerified: false, isRoomCreator: false };
                        setUserLogged(userData)
                    }
                } else {
                    emitMessage('error', 999)
                }
            }
        };

        const getRoom = async () => {
            axios
                .get(`${SERVER_BASE_URL}/rooms/${id}`)
                .then((response) => {
                    setRoomData(response.data)
                })
                .catch((error) => {
                    navigate('/notification', { state: { statusCode: error.response?.status } });
                });
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
        getRoom();
        checkAuth();

    }, []);


    const handleSubmit = async e => {
        e.preventDefault()

        try {
            const userData = { ...userLogged, nickName: formData.nickName, isRoomCreator: false };
            navigate('/room', { state: { roomData: roomData, userLogged: userData } });

        } catch (error) {
            emitMessage('error', 999)
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

            <FormContainer>
                <Title>Informe seu nome para entrar na sala de Planning Poker</Title>
                <StyledForm onSubmit={handleSubmit}>
                    <FormGroup>
                        <label htmlFor="nickName">Digite seu nome*</label>
                        <input
                            type="text"
                            id="nickName"
                            name="nickName"
                            value={formData.nickName || ""}
                            onChange={handleChange}
                            placeholder="Digite o seu nome"
                            required
                            maxLength={55} />
                    </FormGroup>
                    <FormGroup2>
                        <label htmlFor="roomId">ID da sala</label>
                        <input
                            type="text"
                            id="roomId"
                            name="roomId"
                            value={roomData.roomId || ""}
                            disabled />
                    </FormGroup2>
                    <FormGroup2>
                        <label htmlFor="roomName">Nome da sala</label>
                        <input
                            type="text"
                            id="roomName"
                            name="roomName"
                            value={roomData.roomName || ""}
                            disabled />
                    </FormGroup2>
                    <SubmitButton $marginTop="22px" type="submit">Entrar</SubmitButton>
                </StyledForm>
            </FormContainer>

            {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
        </div>
    );

}

export const Title = styled.h1`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #C0C0C0;
  font-weight: 400;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

export const FormGroup2 = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
    color: #C0C0C0;
    font-size: 14px;
  }

  input {
   background: #B0B0B0;
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


export default GuestUrlPage