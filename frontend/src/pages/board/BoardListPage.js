import React, { useEffect, useState } from 'react';
import axios from "axios";
import { emitMessage, formatdateTime, onSignOut, onGetToken } from '../../services/utils'
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom'
import { FaRegTrashAlt, FaRegFolderOpen, FaRegClone } from 'react-icons/fa';
import { AiOutlineExport } from "react-icons/ai";
import styled from 'styled-components';
import Header from '../components/Header';
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import { FRONT_BASE_URL } from "../../constants/apiConstants";
import LoaderPage from '../generic/LoaderPage';
import SuggestionForm from '../components/SuggestionForm'
import localStorageService from "../../services/localStorageService";

const BoardListPage = () => {
  let navigate = useNavigate();
  const [boards, setBoards] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState({});
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  useEffect(() => {

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

    const fetchBoards = async () => {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes(user);
        const userData = { userId: attributes.sub, userName: attributes.name, isVerified: true };
        const userStorage = { userId: attributes.sub, userName: attributes.name };
        setUserAuthenticated(userData)

        localStorageService.removeItem("AGILFACIL_USER_LOGGED");
        localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);

        // Obtem Board do Usuário Logado     
        const token = await onGetToken()

        axios
          .get(`${SERVER_BASE_URL}/board/getBoardByUser/${attributes.sub}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
          .then(response => {
            setBoards(response.data);
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
            emitMessage('error', 999, 3000)
          });
      } catch (error) {
        emitMessage('error', 999, 4000)
      }
    };

    fetchBoards();
    checkAuth();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Confirma exclusão do Board?");
    if (!isConfirmed) {
      return
    }
    const token = await onGetToken()
    setIsLoading(true)
    try {
      const response = await axios.delete(`${SERVER_BASE_URL}/board/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      emitMessage('success', 1, 1500)
      setIsLoading(false)
      setBoards((prevBoards) => prevBoards.filter(board => board.boardId !== id));
    } catch (error) {
      emitMessage('error', 901, 3000)
      setIsLoading(false)
    }
  };

  const handleOpenBoard = async (boardId) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${SERVER_BASE_URL}/board/${boardId}`)
      setIsLoading(false)
      const userData = { ...userAuthenticated, isBoardCreator: true };
      navigate('/board', { state: { boardData: response.data, userAuthenticated: userData } });
    } catch (error) {
      setIsLoading(false)
      emitMessage('error', 902, 3000)
    }
  }

  const handleCreateBoard = () => {
    navigate('/board/create', { state: { userAuthenticated: userAuthenticated } });
  };

  const handleCloneBoard = async (boardId) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${SERVER_BASE_URL}/board/${boardId}`)
      setIsLoading(false)
      navigate('/board/create', { state: { userAuthenticated: userAuthenticated, board: response.data } });
    } catch (error) {
      emitMessage('error', 903, 3000)
      setIsLoading(false)
    }
  }

  const handleExportBoardToPDF = async (boardId) => {
    const url = `${FRONT_BASE_URL}/board/export/${boardId}`;
    window.open(url, "_blank");

  }

  return (
    <div className="bg-black-custom">
      <Header
        subText={'Board Interativo'}
        showSuggestionsModal={() => setModalOpen(true)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')} />
      
      {isLoading ?
        <LoaderPage />
        :
        <>
          {!boards ?
            <AlignedContainer>
              <p>Não foi possível carregar os seus Boards.</p>
            </AlignedContainer>
            :
            <Container>
              <Button onClick={handleCreateBoard}>Adicionar Board</Button>
              {isLoading ? (
                <LoaderPage />
              ) : (
                <BoardList>
                  {boards.length === 0 ? (
                    <p>Você ainda não possui Boards.</p>
                  ) : (
                    boards.map((board) => (
                      <BoardBox key={board.boardId}>
                        <h6>{board.boardName}</h6>
                        <p>Criado em: {formatdateTime(board.createdAt)}</p>
                        <p>Squad: {board.squadName}</p>
                        <p>Área: {board.areaName}</p>
                        <Actions>
                          <FaRegTrashAlt
                            data-tooltip-id="tooltip-trash"
                            data-tooltip-content="Excluir"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(board.boardId);
                            }} />
                          <Tooltip id="tooltip-trash" style={{ fontSize: "12px", padding: "4px 8px" }} />
                          <FaRegClone
                            data-tooltip-id="tooltip-clone"
                            data-tooltip-content="Clonar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloneBoard(board.boardId);
                            }}
                          />
                          <Tooltip id="tooltip-clone" style={{ fontSize: "12px", padding: "4px 8px" }} />
                          <AiOutlineExport
                            data-tooltip-id="tooltip-export"
                            data-tooltip-content="Exportar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportBoardToPDF(board.boardId);
                            }}
                          />
                          <Tooltip id="tooltip-export" style={{ fontSize: "12px", padding: "4px 8px" }} />
                          <FaRegFolderOpen
                            data-tooltip-id="tooltip-open"
                            data-tooltip-content="Abrir"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBoard(board.boardId);
                            }}
                          />
                          <Tooltip id="tooltip-open" style={{ fontSize: "12px", padding: "4px 8px" }} />
                        </Actions>
                      </BoardBox>
                    ))
                  )}
                </BoardList>
              )}
            </Container>}
        </>}
      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
    </div>
  );
};

// Estilização com Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4caf50; 
  color: #fff;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
`;

const BoardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-evenly;
  align-items: center;
`;

const BoardBox = styled.div`
  background-color: #1E3A5F; /* Azul escuro para o fundo do box */
  color: #FFFFFF; /* Cor do texto branca para contraste */
  padding: 20px;
  border-radius: 12px; /* Bordas mais suaves */
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Sombra mais sutil */
  transition: transform 0.2s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  cursor: pointer; /* Garante que o cursor mude para a mãozinha */
  width: 350px; /* Largura fixa definida */
  height: 199px; 

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); /* Aumenta a sombra ao passar o mouse */
    background-color: #27496D; /* Tom de azul ligeiramente mais claro no hover */
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Reduz a sombra ao clicar */
  }

  h3 {
    font-size: 1.5em;
    font-weight: 600; /* Texto principal mais destacado */
    margin-bottom: 10px;
    color: #FFFFFF; /* Mantém o texto principal branco */
  }

  p {
    font-size: 1em;
    margin: 5px 0;
    color: #B0C4DE; /* Azul claro para texto secundário */
    line-height: 1.4; /* Melhor espaçamento entre linhas */
  }

  @media (max-width: 768px) {
    /* Estilo para dispositivos menores */
    padding: 15px;
    width: 250px; 
    h3 {
      font-size: 1.3em;
    }
    p {
      font-size: 0.9em;
    }
  }
`;


const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 21px;
  cursor: pointer;

  svg {
    color: #A9A9A9;

   &:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(0, 0, 1, 0.9);
    }
  }
`;

const AlignedContainer = styled.div`
  display: flex;
  flex-direction: column;  /* Alinha os itens em uma coluna */
  margin-top: 30px;
  justify-content: top; /* Centraliza verticalmente */
  align-items: center;     /* Centraliza o conteúdo horizontalmente */
  height: 100vh;           /* Faz o contêiner ocupar toda a altura da tela */
`;


export default BoardListPage;
