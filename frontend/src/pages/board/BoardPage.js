import React, { useState, useEffect } from "react";
import { fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { DragDropContext } from "@hello-pangea/dnd";
import Columns from "./components/Columns";
import { reorderboardData, processCombine } from "./FunctionsBoard";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Invite from '../components/Invite';
import SuggestionForm from '../components/SuggestionForm';
import { FRONT_BASE_URL } from "../../constants/apiConstants";
import { useSocket } from "../../customHooks/useSocket";
import { useTimer } from "../../customHooks/useTimer";
import { useBoardActions } from "./useBoardActions";
import 'react-toastify/dist/ReactToastify.css';
import { onSignOut } from '../../services/utils';

export const BoardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [boardData, setBoardData] = useState({ columns: [] });
  const [userLoggedData, setuserLoggedData] = useState({});

  const socket = useSocket(
    location.state.userAuthenticated.userName,
    location.state.userAuthenticated.userId,
    location.state.boardData.boardId,
    'board'
  );
  const { socketResponse, reorderBoardSocket, combineCardSocket, timerControlSocket } = socket;

  const { timeInput, timer, isRunningTimer, isInvalidFormat, hasTimeEnded, handleInputTimerChange, handleStartTimer, handlePauseTimer, syncFromSocket } =
    useTimer({ timerControlSocket, userId: userLoggedData.userId });

  const actions = useBoardActions({ boardData, setBoardData, socket });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        setUserIsAuthenticated(session.tokens !== undefined);
      } catch {
        setUserIsAuthenticated(false);
      }
    };
    setBoardData(location.state.boardData);
    setuserLoggedData(location.state.userAuthenticated);
    checkAuth();
  }, [location.state.boardData, location.state.userAuthenticated]);

  useEffect(() => {
    if (socketResponse.isTimerControl) {
      if (socketResponse.userId !== userLoggedData.userId) {
        syncFromSocket(socketResponse);
      }
      return;
    }
    if (socketResponse?.boardId) {
      setBoardData(prev => ({ ...prev, ...socketResponse }));
    }
  }, [socketResponse]);

  const onDragEnd = ({ source, destination, combine }) => {
    if (destination) {
      reorderBoardSocket({ source, destination });
      setBoardData(prev => ({ ...prev, columns: reorderboardData(boardData, source, destination) }));
    } else if (combine) {
      if (!window.confirm("Confirma junção dos Cards?")) return;
      combineCardSocket({ source, combine });
      setBoardData(prev => ({ ...prev, columns: processCombine(boardData, source, combine) }));
    }
  };

  const handleExportBoardToPDF = () => {
    window.open(`${FRONT_BASE_URL}/board/export/${boardData.boardId}`, "_blank");
  };

  return (
    <PageBackground>
      <AmbientGlow />

      <Header
        boardName={boardData.boardName}
        showInviteModal={() => setShowInvite(true)}
        handleCloseInvite={() => setShowInvite(false)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')}
        boardControls={{
          countCard: boardData.columns.reduce((acc, col) => acc + col.cards.length, 0),
          countUserLogged: boardData.usersOnBoard?.length || 0,
          countUserWithCard: boardData.cardCreators?.length || 0,
          timeInput,
          isRunningTimer,
          isInvalidFormat,
          hasTimeEnded,
          handleInputTimerChange,
          handleStartTimer,
          handlePauseTimer,
          handleAddColumn: actions.handleAddColumn,
          isObfuscatedBoardLevel: boardData.isObfuscated,
          handleSetIsObfuscatedBoardLevel: actions.handleSetIsObfuscatedBoardLevel,
          isBoardCreator: userLoggedData.isBoardCreator,
          handleExportBoard: handleExportBoardToPDF,
          isObfuscatedCardLevel: boardData.columns.some(col => col.isObfuscated),
        }}
      />

      <Layout>
        <Sidebar onSuggestions={() => setModalOpen(true)} />

        <Content>
          <DragDropContext onDragEnd={onDragEnd}>
            <BoardGrid>
              {boardData.columns.map((column, index) => (
                <ColumnWrapper key={column.id}>
                  <Columns
                    title={column.title}
                    colorCards={column.colorCards}
                    listId={column.id}
                    listType="card"
                    cards={column.cards}
                    isCombineEnabled={true}
                    onSaveCard={actions.onSaveCard}
                    onDeleteCard={actions.onDeleteCard}
                    onDeleteAllCard={actions.onDeleteAllCard}
                    onUpdateLike={actions.onUpdateLike}
                    onUpdateTitleColumn={actions.onUpdateTitleColumn}
                    onDeleteColumn={actions.onDeleteColumn}
                    onAddCard={actions.onAddCard}
                    onUpdatecolorCards={actions.onUpdatecolorCards}
                    indexColumn={index}
                    userLoggedData={userLoggedData}
                    isObfuscatedColumnLevel={column.isObfuscated}
                    isObfuscatedBoardLevel={boardData.isObfuscated}
                    handleSetIsObfuscatedColumnLevel={actions.handleSetIsObfuscatedColumnLevel}
                  />
                </ColumnWrapper>
              ))}
            </BoardGrid>
          </DragDropContext>
        </Content>
      </Layout>

      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
      {showInvite && <Invite id={boardData.boardId} onClose={() => setShowInvite(false)} service="board" />}
    </PageBackground>
  );
};

export default BoardPage;

const BG         = '#0a0a0d';
const ACCENT_GLOW = 'rgba(139,124,246,0.18)';

const PageBackground = styled.div`
  position: relative;
  min-height: 100vh;
  background: ${BG};
`;

const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(1100px 480px at 50% -8%, ${ACCENT_GLOW}, transparent 65%);
`;

const Layout = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding: 12px 20px 24px;
`;

const BoardGrid = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  overflow-x: auto;
  padding-top: 4px;
`;

const ColumnWrapper = styled.div`
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
`;
