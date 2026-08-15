import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components';
import { emitMessage, onSignOut } from '../../services/utils'
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { useAppUser } from '../../context/UserContext';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import SuggestionForm from '../components/SuggestionForm'
import { CreateBoardForm } from './CreateBoardModal';
import logger from '../../services/logger';

const CTX = 'CreateBoardPage';

const TEXT        = 'var(--text)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT_GLOW = 'var(--accent-glow)';

export const CreateBoardPage = ({ }) => {
  let navigate = useNavigate();
  const location = useLocation();
  const { userId: contextUserId, userName: contextUserName } = useAppUser();

  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState({});

  useEffect(() => {
    logger.debug(CTX, 'useEffect — location.state', location.state);

    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        setUserIsAuthenticated(session.tokens !== undefined);
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
        setUserAuthenticated({ userId: effectiveUserId, userName: effectiveName, isVerified: true })
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

    checkAuth();
  }, [location.state?.userAuthenticated]);

  const handleCreated = (boardData) => {
    const userData = { ...userAuthenticated, isBoardCreator: true };
    navigate('/board', { state: { boardData, userAuthenticated: userData } });
  };

  return (
    <PageBackground>
      <AmbientGlow />

      <Header
        subText={'Board Interativo'}
        showSuggestionsModal={() => setModalOpen(true)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')} />

      <Centered>
        <Panel>
          <PanelTitle>{location.state?.board ? 'Clonar board' : 'Criar novo board'}</PanelTitle>
          <CreateBoardForm
            initialBoard={location.state?.board}
            userAuthenticated={userAuthenticated}
            onCreated={handleCreated}
          />
        </Panel>
      </Centered>

      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
    </PageBackground>
  );
};

const PageBackground = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
`;

const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(1100px 480px at 50% -8%, ${ACCENT_GLOW}, transparent 65%);
`;

const Centered = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: 48px 20px;
`;

const Panel = styled.div`
  width: 100%;
  max-width: 480px;
  background: var(--surface);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid ${BORDER_STRONG};
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-soft);
`;

const PanelTitle = styled.h1`
  margin: 0 0 18px;
  font-size: 16px;
  font-weight: 700;
  color: ${TEXT};
`;

export default CreateBoardPage
