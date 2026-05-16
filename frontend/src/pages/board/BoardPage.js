import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate, useLocation } from 'react-router-dom'
import { createUseStyles } from "react-jss";
import { DragDropContext } from "react-beautiful-dnd";
import { toast } from 'react-toastify';
import Columns from "./componentes/Columns";
import { reorderboardData, processCombine, saveCard, deleteCard, updateLike, updateTitleColumn, deleteColumn, addCard, updatecolorCards, deleteAllCards, addCollumn, setIsObfuscatedBoardLevel, setIsObfuscatedColumnLevel } from "./FunctionsBoard";
import Header from '../components/Header';
import Invite from '../components/Invite';
import SuggestionForm from '../components/SuggestionForm'
import BoardControls from "./componentes/BoardControls";
import { FRONT_BASE_URL } from "../../constants/apiConstants";
import { useSocket } from "../../customHooks/useSocket";
import 'react-toastify/dist/ReactToastify.css';
import { emitMessage, onSignOut } from '../../services/utils'


export const BoardPage = ({ }) => {
  let navigate = useNavigate();
  const location = useLocation();

  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [timeInput, setTimeInput] = useState("00:00"); // Tempo digitado pelo usuário
  const [timer, setTimer] = useState(0); // Tempo em segundos
  const [isRunningTimer, setIsRunningTimer] = useState(false); // Status do cronômetro
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [boardData, setBoardData] = useState({ columns: [] });
  const cl = useStyles();
  const [userLoggedData, setuserLoggedData] = useState({});

  const {
    socketResponse,
    addCardSocket,
    reorderBoardSocket,
    combineCardSocket,
    updateTitleColumnSocket,
    updateLikeSocket,
    deleteCardSocket,
    saveCardSocket,
    deleteColumnSocket,
    addCollumnSocket,
    updatecolorCardsSocket,
    deleteAllCardSocket,
    timerControlSocket,
    setIsObfuscatedBoardLevelSocket,
    setIsObfuscatedColumnLevelSocket } = useSocket(location.state.userAuthenticated.userName, location.state.userAuthenticated.userId, location.state.boardData.boardId, 'board')


  useEffect(() => {
     //console.log('useEffect-principal - userAuthenticated -> ', location.state.userAuthenticated)

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

    setBoardData(location.state.boardData);
    setuserLoggedData(location.state.userAuthenticated);
    checkAuth();

  }, [location.state.boardData, location.state.userAuthenticated]);

  useEffect(() => {
    if (socketResponse.isTimerControl) {
      if (socketResponse.userId == userLoggedData.userId) return;

      setIsRunningTimer(socketResponse.isRunningTimer)
      setTimeInput(socketResponse.timeInput)
      setTimer(socketResponse.timer)
    }

    if (socketResponse && socketResponse.boardId) {
      setBoardData(prevBoardData => ({
        ...prevBoardData,
        ...socketResponse,
      }));
    }
  }, [socketResponse]);

  useEffect(() => {
    if (!isRunningTimer) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) {
          const minutes = String(Math.floor((prev - 1) / 60)).padStart(2, "0");
          const seconds = String((prev - 1) % 60).padStart(2, "0");
          setTimeInput(`${minutes}:${seconds}`);
          return prev - 1;
        } else {
          setIsRunningTimer(false);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunningTimer]);

  const handleInputTimerChange = (e) => {
    if (isRunningTimer) return;

    if (!validateTimeFormat) {
      setIsInvalidFormat(false);
    }

    const value = e.target.value;
    if (!validateTimeFormat(value)) {
      setIsInvalidFormat(true);
      setTimeInput(value);
      return;
    }

    setIsInvalidFormat(false);
    setTimeInput(value);
    const [minutes, seconds] = value.split(":").map(Number);
    setTimer((minutes || 0) * 60 + (seconds || 0));

  };

  // Função para validar o formato MM:SS
  const validateTimeFormat = (value) => {
    const regex = /^([0-5]?[0-9]):([0-5]?[0-9])$/; // Formato MM:SS
    return regex.test(value);
  };

  const onDragEnd = (result) => {
    const { source, destination, combine } = result;

    if (destination) {
      reorderBoardSocket({ source, destination })
      const updatedColumns = reorderboardData(boardData, source, destination);
      setBoardData({ ...boardData, columns: updatedColumns });
    } else if (combine) {
      const isConfirmed = window.confirm("Confirma junção dos Cards?");
      if (!isConfirmed) {
        return
      }
      combineCardSocket({ source, combine })
      const updatedColumns = processCombine(boardData, source, combine);
      setBoardData({ ...boardData, columns: updatedColumns });
    }

  };

  const onSaveCard = (content, indexCard, indexColumn) => {
    const updatedColumns = saveCard(boardData, content, indexCard, indexColumn);
    setBoardData({ ...boardData, updatedColumns });
    saveCardSocket({ content: content, indexCard: indexCard, indexColumn: indexColumn })
  };

  const onDeleteCard = (indexCard, indexColumn) => {
    const isConfirmed = window.confirm("Confirma exclusão do Card?");
    if (!isConfirmed) {
      return
    }
    const updatedColumns = deleteCard(boardData, indexCard, indexColumn);
    setBoardData({ ...boardData, updatedColumns });
    deleteCardSocket({ indexCard: indexCard, indexColumn: indexColumn })
  };

  const onDeleteAllCard = (indexColumn) => {
    const isConfirmed = window.confirm("Confirma exclusão de todos os Cards da Coluna?");
    if (!isConfirmed) {
      return
    }
    const updatedColumns = deleteAllCards(boardData, indexColumn);
    setBoardData({ ...boardData, updatedColumns });
    deleteAllCardSocket({ indexColumn: indexColumn })
  };

  const onUpdateLike = (isIncrement, indexCard, indexColumn) => {
    const updatedColumns = updateLike(boardData, isIncrement, indexCard, indexColumn);
    setBoardData({ ...boardData, updatedColumns });
    updateLikeSocket({ isIncrement: isIncrement, indexCard: indexCard, indexColumn: indexColumn })
  };

  const onUpdateTitleColumn = (content, index) => {
    const updatedColumns = updateTitleColumn(boardData, content, index);
    setBoardData({ ...boardData, updatedColumns });
    updateTitleColumnSocket({ content: content, index: index })
  };

  const onUpdatecolorCards = (colorCards, index) => {
    const updatedColumns = updatecolorCards(boardData, colorCards, index);
    setBoardData({ ...boardData, updatedColumns });
    updatecolorCardsSocket({ colorCards: colorCards, index: index })
  };

  const onDeleteColumn = (index) => {
    const isConfirmed = window.confirm("Confirma exclusão da Coluna?");
    if (!isConfirmed) {
      return
    }
    const updatedColumns = deleteColumn(boardData, index);
    setBoardData({ ...boardData, updatedColumns });
    deleteColumnSocket({ index: index })
  };

  const onAddCard = (newCard, indexColumn) => {
    const updatedColumns = addCard(boardData, newCard, indexColumn);
    setBoardData({ ...boardData, updatedColumns });
    addCardSocket({ newCard: newCard, indexColumn: indexColumn })
  };


  const handleAddColumn = (collunName) => {
    const newCollumn = {
      id: uuidv4(),
      title: collunName,
      colorCards: "#F0E68C",
      isObfuscated: false,
      cards: []
    };
    const updatedColumns = addCollumn(boardData, newCollumn);
    setBoardData({ ...boardData, updatedColumns });
    addCollumnSocket({ newCollumn: newCollumn })
  };

  const handleSetIsObfuscatedBoardLevel = (value) => {
    const updatedBoardData = setIsObfuscatedBoardLevel(boardData, value);
    setBoardData(updatedBoardData);
    setIsObfuscatedBoardLevelSocket({ isObfuscated: value })
  };

  const handleSetIsObfuscatedColumnLevel = (value, index) => {
    const updatedBoardData = setIsObfuscatedColumnLevel(boardData, value, index);
    setBoardData(updatedBoardData);
    setIsObfuscatedColumnLevelSocket({ isObfuscated: value, index: index })
  };

  const handleStartTimer = () => {
    if (isInvalidFormat) {
      toast.error("Informe o tempo no formato MM:SS", {
        position: 'top-center',
        autoClose: 1000,
        hideProgressBar: false,
        closeButton: false,
        draggable: true,
        pauseOnHover: true,
      });
      return
    };

    timerControlSocket({ timeInput: timeInput, timer: timer, isRunningTimer: true, userId: userLoggedData.userId })
    setIsRunningTimer(true)
  };

  const handlePauseTimer = () => {
    timerControlSocket({ timeInput: timeInput, timer: timer, isRunningTimer: false, userId: userLoggedData.userId })
    setIsRunningTimer(false)
  };

  const onCountCards = () => {
    const totalCards = boardData.columns.reduce((acc, column) => acc + column.cards.length, 0);
    return totalCards;
  };

  const onCountUserLogged = () => {
    const count = boardData.usersOnBoard?.length || 0;
    return count;
  };

  const onCountUserWithCard = () => {
    const count = boardData.cardCreators?.length || 0;
    return count;
  };


  const handleExportBoardToPDF = () => {
    const url = `${FRONT_BASE_URL}/board/export/${boardData.boardId}`;
    window.open(url, "_blank");
  }

  const verifyObfuscatedCardLevel = () => {
    return boardData.columns.some(column => column.isObfuscated);
  };

  return (
    <div className="bg-black-custom">
      <Header
        subText={'Board Interativo'}
        showSuggestionsModal={() => setModalOpen(true)}
        boardName={boardData.boardName}
        showInviteModal={() => setShowInvite(true)}
        handleCloseInvite={() => setShowInvite(false)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')}
      />

      <BoardControls
        countCard={onCountCards()}
        countUserLogged={onCountUserLogged()}
        countUserWithCard={onCountUserWithCard()}
        timeInput={timeInput}
        isRunningTimer={isRunningTimer}
        isInvalidFormat={isInvalidFormat}
        handleInputTimerChange={handleInputTimerChange}
        handleStartTimer={handleStartTimer}
        handlePauseTimer={handlePauseTimer}
        handleAddColumn={handleAddColumn}
        isObfuscatedBoardLevel={boardData.isObfuscated}
        handleSetIsObfuscatedBoardLevel={handleSetIsObfuscatedBoardLevel}
        isBoardCreator={userLoggedData.isBoardCreator}
        handleExportBoard={handleExportBoardToPDF} 
        isObfuscatedCardLevel={verifyObfuscatedCardLevel()}/>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={cl.root}>
          {boardData.columns.map((column, index) => (
            <div key={column.id} className={cl.column}>
              <Columns
                title={column.title}
                colorCards={column.colorCards}
                listId={column.id}
                listType="card"
                cards={column.cards}
                isCombineEnabled={true}
                onSaveCard={onSaveCard}
                onDeleteCard={onDeleteCard}
                onDeleteAllCard={onDeleteAllCard}
                onUpdateLike={onUpdateLike}
                onUpdateTitleColumn={onUpdateTitleColumn}
                onDeleteColumn={onDeleteColumn}
                onAddCard={onAddCard}
                onUpdatecolorCards={onUpdatecolorCards}
                indexColumn={index}
                userLoggedData={userLoggedData}
                isObfuscatedColumnLevel={column.isObfuscated}
                isObfuscatedBoardLevel={boardData.isObfuscated}
                handleSetIsObfuscatedColumnLevel={handleSetIsObfuscatedColumnLevel}
              />
            </div>
          ))}
        </div>
      </DragDropContext>

      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
      {showInvite && <Invite id={boardData.boardId} onClose={() => setShowInvite(false)} service={'board'} />}
    </div>
  );
}

export default BoardPage;


// Estilizações

const useStyles = createUseStyles({
  root: {
    backgroundColor: "#1C1C1C",
    boxSizing: "border-box",
    padding: 5,
    height: "auto", // Ajusta automaticamente a altura conforme o conteúdo
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "1fr",
    gap: "10px",
    width: "100%",
    overflowX: "auto", // Pode ser necessário manter a rolagem horizontal, dependendo da largura
  },

  column: {
    minWidth: "250px",
    minHeight: "400px", // Altura mínima para evitar que a coluna encolha demais
    height: "auto", // Permite que a coluna se ajuste conforme o conteúdo
    backgroundColor: '#2c2c2c',  //"#282c34",#backgound_coluna1
    border: "1px solid #444",

    boxSizing: "border-box",
    padding: "0px",
    transition: "width 0.3s ease, height 0.3s ease", // Animação também para a altura
    display: "flex",
    flexDirection: "column",
    //   overflow: "auto", // Faz com que a altura da coluna se ajuste conforme o conteúdo
  }

}

);
