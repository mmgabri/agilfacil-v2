import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useLocation } from 'react-router-dom'
import { emitMessage, onSignOut, onGetToken } from '../../services/utils'
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { useAppUser } from '../../context/UserContext';
import 'react-toastify/dist/ReactToastify.css';
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import Header from '../components/Header';
import SuggestionForm from '../components/SuggestionForm'
import { FormContainer, Title, FormGroup, CheckboxLabel, CheckboxWrapper, StyledForm, SubmitButton, RemoveIcon, AddColumnIcon } from '../../styles/FormStyle'
import logger from '../../services/logger';

const CTX = 'CreateBoardPage';

export const CreateBoardPage = ({ }) => {
  let navigate = useNavigate();
  const location = useLocation();
  const { userId: contextUserId, userName: contextUserName } = useAppUser();

  const [board, setBoard] = useState(null);
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  const [formData, setFormData] = useState({
    boardName: "",
    areaName: "",
    squadName: "",
    columns: [{ id: uuidv4(), title: "", colorCards: "#F0E68C", isObfuscated: false, cards: [] }]
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState({});

  useEffect(() => {
    logger.debug(CTX, 'useEffect — location.state', location.state);

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

    const buildUserAuthenticated = async () => {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes(user);
        const effectiveUserId = contextUserId || attributes.sub;
        const effectiveName   = contextUserName || attributes.name;
        const userData = { userId: effectiveUserId, userName: effectiveName, isVerified: true };
        setUserAuthenticated(userData)
      } catch (error) {
        logger.error(CTX, 'Erro ao obter usuário', { message: error.message });
        emitMessage('error', 999)
      }
    }

    if (location.state?.userAuthenticated) {
      setUserAuthenticated(location.state.userAuthenticated)
    } else {
      buildUserAuthenticated()
    }

    if (location.state?.board) {
      setBoard(location.state.board);
      setFormData({
        boardName: location.state.board.boardName,
        areaName: location.state.board.areaName,
        squadName: location.state.board.squadName,
        columns: location.state.board.columns.map(column => ({
          ...column,
          cards: []
        })),
      });
    }

    checkAuth();

  }, [location.state?.board, location.state?.userAuthenticated]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleColumnChange = (e, columnId) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      columns: prevData.columns.map((column) =>
        column.id === columnId ? { ...column, title: value } : column
      )
    }));
  };

  const handleAddColumn = () => {
    const newColumn = {
      id: uuidv4(),
      title: "",
      colorCards: "#F0E68C",
      isObfuscated: false,
      cards: []
    };
    setFormData((prevData) => ({
      ...prevData,
      columns: [...prevData.columns, newColumn]
    }));
  };

  const handleRemoveColumn = (columnId) => {
    setFormData((prevData) => ({
      ...prevData,
      columns: prevData.columns.filter((col) => col.id !== columnId)
    }));
  };


  const handleSubmit = async e => {
    e.preventDefault()

    logger.info(CTX, `Criando board boardName="${formData.boardName}" colunas=${formData.columns.length}`);
    const token = await onGetToken()

    try {
      const response = await axios.post(SERVER_BASE_URL + '/board/createBoard', { creatorId: userAuthenticated.userId, userName: userAuthenticated.userName, boardName: formData.boardName, squadName: formData.squadName, areaName: formData.areaName, columns: formData.columns }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      logger.info(CTX, `Board criado boardId=${response.data?.boardId ?? '?'}`);
      const userData = { ...userAuthenticated, isBoardCreator: true };
      navigate('/board', { state: { boardData: response.data, userAuthenticated: userData } });
    } catch (error) {
      logger.error(CTX, 'Erro ao criar Board', { message: error.message, status: error.response?.status });
      emitMessage('error', 906, 3000)
    }
  }

  const handleKeepCardsChange = (columnId, isChecked) => {

    setFormData((prevFormData) => ({
      ...prevFormData,
      columns: prevFormData.columns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            cards: isChecked
              ? board.columns.find(c => c.id === columnId)?.cards || []
              : []
          };
        }
        return column;
      })
    }));
  };


  return (
    <div className="bg-black-custom">
      <Header
        subText={'Board Interativo'}
        showSuggestionsModal={() => setModalOpen(true)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')} />

      <FormContainer>
        <Title>Preencha os campos abaixo para criar o Board interativo</Title>
        <StyledForm onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="boardName">Nome do Board*</label>
            <input
              type="text"
              id="boardName"
              name="boardName"
              value={formData.boardName}
              onChange={handleFieldChange}
              placeholder="Digite o nome do board"
              required
              maxLength={55}
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="squadName">Squad</label>
            <input
              type="text"
              id="squadName"
              name="squadName"
              value={formData.squadName}
              onChange={handleFieldChange}
              placeholder="Digite o nome da squad"
              maxLength={30}
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="areaName">Área</label>
            <input
              type="text"
              id="areaName"
              name="areaName"
              value={formData.areaName}
              onChange={handleFieldChange}
              placeholder="Digite o nome da área (comunidade, gerência, etc)"
              maxLength={30}
            />
          </FormGroup>
          <FormGroup>
            <label>Colunas do board *</label>
            {formData.columns.map((column, index) => (
              <div key={column.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder={`Título da Coluna ${index + 1}`}
                  value={column.title}
                  onChange={(e) => handleColumnChange(e, column.id)}
                  required
                  style={{ marginRight: 8 }}
                />
                <RemoveIcon onClick={() => handleRemoveColumn(column.id)} />
                {board && (
                  <CheckboxWrapper>
                    <input
                      type="checkbox"
                      onChange={(e) => handleKeepCardsChange(column.id, e.target.checked)}
                    />
                    <CheckboxLabel>Manter cards</CheckboxLabel>
                  </CheckboxWrapper>
                )}
              </div>
            ))}
            <AddColumnIcon onClick={handleAddColumn} />
          </FormGroup>
          <SubmitButton type="submit">Criar Board</SubmitButton>
        </StyledForm>
      </FormContainer>
      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
    </div>

  );
};
export default CreateBoardPage 