import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchAuthSession } from '@aws-amplify/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSocket } from "../../customHooks/useSocket";
import "../../styles/Room.css"
import Header from '../components/Header';
import StatusSection from '../poker/components/StatusSection';
import Users from '../poker/components/Users';
import VotingCards from '../poker/components/VotingCards';
import VotingResults from '../poker/components/VotingResults';
import Progress from '../poker/components/ProgressBar';
import Invite from '../components/Invite';
import SuggestionForm from '../components/SuggestionForm'
import { onSignOut } from '../../services/utils'

export const RoomPage = ({ }) => {
  let navigate = useNavigate();
  const location = useLocation();
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
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

    <div className="bg-black-custom">
      <Header
        userName={userLogged.nickName}
        roomName={roomData.roomName}
        subText={'Planning Poker'}
        showSuggestionsModal={() => setModalOpen(true)}
        showInviteModal={() => setShowInvite(true)}
        handleCloseInvite={() => setShowInvite(false)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')} />

      <StatusSection roomData={roomData} isRoomCreator={userLogged.isRoomCreator} handlerupdateStatusRoom={handlerUpdateStatusRoom} />
      {showInvite && <Invite id={roomData.roomId} onClose={() => setShowInvite(false)} service={'poker'} />}

      {roomData.status == "VOTACAO_FINALIZADA"
        ?
        <div className="user-box">
          <div style={{ flex: 1, minWidth: '300px' }}>
            <Progress roomData={roomData} />
            <Users roomData={roomData} />
          </div>
          <div>
            <VotingResults roomData={roomData} cards={cards} />
          </div>
        </div>
        : <>
          {roomData.status == "VOTACAO_EM_ANDAMENTO" || roomData.status == "VOTACAO_FINALIZADA"
            ? <Progress roomData={roomData} />
            : <></>}
          <Users roomData={roomData} />
        </>
      }


      {roomData.status == "VOTACAO_EM_ANDAMENTO" || roomData.status == "VOTACAO_FINALIZADA"
        ? <VotingCards onCardClick={onCardClick} cards={cards} nota={nota} />
        : <></>}

      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
    </div>
  );
}
export default RoomPage