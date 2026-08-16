import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchAuthSession } from '@aws-amplify/auth';
import styled from 'styled-components';
import { useSocket } from "../../customHooks/useSocket";
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StatusSection from '../poker/components/StatusSection';
import Users from '../poker/components/Users';
import VotingCards from '../poker/components/VotingCards';
import VotingResults from '../poker/components/VotingResults';
import Progress from '../poker/components/ProgressBar';
import Invite from '../components/Invite';
import SuggestionForm from '../components/SuggestionForm'
import SupportForm from '../components/SupportForm'
import { onSignOut } from '../../services/utils'

export const RoomPage = ({ }) => {
  let navigate = useNavigate();
  const location = useLocation();
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSupportModalOpen, setSupportModalOpen] = useState(false);
  const [nota, setNota] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [roomData, setRoomData] = useState({ users: [] });
  const [userLogged, setUserLogged] = useState({});

  const cards = [1, 2, 3, 5, 8, 13, 21, "?"];

  const { socketResponse, updateStatusRoom, votar } = useSocket(location.state.userLogged.nickName, location.state.userLogged.userId, location.state.roomData.roomId, 'poker')

  useEffect(() => {
    //console.log("useEffect-principal==>", location.state.userLogged);

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

    setRoomData(location.state.roomData);
    setUserLogged(location.state.userLogged);

    checkAuth();
  }, [location.state]);


  useEffect(() => {
    //console.log('useEffect - socketResponse -->', socketResponse)
    if (socketResponse.users) {
      setRoomData(socketResponse)
      if (roomData.status == 'VOTACAO_ENCERRADA')
        setNota("0")
    }
  }, [socketResponse]);

  const onCardClick = (nota) => {
    setNota(nota)
    votar({ vote: nota })
  }

  const handlerUpdateStatusRoom = (status) => {
    updateStatusRoom({ status: status, roomId: roomData.roomId })
  }


  return (
    <PageBackground>
      <AmbientGlow />

      <Header
        boardName={roomData.roomName}
        showInviteModal={() => setShowInvite(true)}
        handleCloseInvite={() => setShowInvite(false)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')}
        hasSidebar />

      <Layout>
        <Sidebar onSuggestions={() => setModalOpen(true)} onSupport={() => setSupportModalOpen(true)} />

        <Content>
          <StatusSection roomData={roomData} isRoomCreator={userLogged.isRoomCreator} handlerupdateStatusRoom={handlerUpdateStatusRoom} />

          {roomData.status == "VOTACAO_EM_ANDAMENTO" || roomData.status == "VOTACAO_FINALIZADA"
            ? <Progress roomData={roomData} />
            : <></>}
          <Users roomData={roomData} />

          {roomData.status == "VOTACAO_EM_ANDAMENTO" || roomData.status == "VOTACAO_FINALIZADA"
            ? <VotingCards onCardClick={onCardClick} cards={cards} nota={nota} />
            : <></>}
        </Content>
      </Layout>

      {roomData.status == "VOTACAO_FINALIZADA" && <VotingResults roomData={roomData} cards={cards} />}

      {showInvite && <Invite id={roomData.roomId} onClose={() => setShowInvite(false)} service={'poker'} />}
      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
      {isSupportModalOpen && <SupportForm onClose={() => setSupportModalOpen(false)} />}
    </PageBackground>
  );
}
export default RoomPage

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / BoardPage.js / BoardListPage.js.

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
  background: radial-gradient(1100px 480px at 50% -8%, var(--accent-glow), transparent 65%);
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
  padding: 24px 24px 40px;
`;