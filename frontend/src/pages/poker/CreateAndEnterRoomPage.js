import React, { useState, useEffect } from 'react';
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from '@aws-amplify/auth';
import { useAppUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { emitMessage, onSignOut } from '../../services/utils'
import { getRoom, createRoom } from '../../services/pokerService'
import { v4 as uuidv4 } from 'uuid';
import { GiPokerHand } from 'react-icons/gi';
import { FaUserCircle, FaUsers, FaHashtag } from 'react-icons/fa';
import SuggestionForm from '../components/SuggestionForm'
import SupportForm from '../components/SupportForm'
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LoaderPage from '../generic/LoaderPage';
import styled from "styled-components";
import localStorageService from "../../services/localStorageService";
import logger from '../../services/logger';

const CTX = 'CreateAndEnterRoomPage';


function CreateAndEnterRoomPage() {
    let navigate = useNavigate();
    const { userId: contextUserId, userName: contextUserName } = useAppUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isSupportModalOpen, setSupportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("create");
    const [userAuthenticated, setUserAuthenticated] = useState({});
    const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

    useEffect(() => {
        const initializeUserData = async () => {
            try {
                const user = await getCurrentUser();
                const attributes = await fetchUserAttributes(user);
                const effectiveUserId = contextUserId || attributes.sub;
                const effectiveName   = contextUserName || attributes.name;
                const userData    = { userId: effectiveUserId, userName: effectiveName, isVerified: true };
                const userStorage = { userId: effectiveUserId, userName: effectiveName };
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
    }, [contextUserId]); // re-executa quando o UserContext for populado pelo ProtectedRoute

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
            const roomData = await createRoom({ roomName: formData.roomName, nickName: formData.nickName, userId: userAuthenticated.userId, userName: userAuthenticated.userName })
            setIsLoading(false)
            logger.info(CTX, `Sala criada roomId=${roomData?.roomId ?? '?'}`);
            const userData = { ...userAuthenticated, nickName: formData.nickName, isRoomCreator: true };
            navigate('/room', { state: { roomData, userLogged: userData } });
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
            const roomData = await getRoom(formData.roomId)
            logger.info(CTX, `Sala encontrada roomId=${formData.roomId}`);
            const userData = { ...userAuthenticated, nickName: formData.nickName, isRoomCreator: false };
            setIsLoading(false)
            navigate('/room', { state: { roomData, userLogged: userData } });
        } catch (error) {
            setIsLoading(false)
            logger.warn(CTX, `Sala não encontrada roomId="${formData.roomId}"`, { status: error.response?.status });
            emitMessage('error', error.response?.status, 3000)
        }
    }

    return (
        <PageBackground>
            <AmbientGlow />

            <Header
                isUserLogged={userIsAuthenticated}
                signIn={() => navigate('/login')}
                signOut={onSignOut}
                goHome={() => navigate('/')}
                hasSidebar />

            <Layout>
                <Sidebar onSuggestions={() => setModalOpen(true)} onSupport={() => setSupportModalOpen(true)} />

                {isLoading ?
                    <LoaderPage />
                    :
                    <Content>
                        <GlassCard>
                            <AvatarCircle><GiPokerHand /></AvatarCircle>

                            <TabBar>
                                <TabBtn $active={activeTab === "create"} onClick={() => setActiveTab("create")}>
                                    Nova Sala
                                </TabBtn>
                                <TabBtn $active={activeTab === "join"} onClick={() => setActiveTab("join")}>
                                    Entrar na Sala
                                </TabBtn>
                            </TabBar>

                            {activeTab === "create" ? (
                                <form onSubmit={handleSubmitCreateRoom}>
                                    <ScreenSubtitle>Inicie uma nova sessão de Planning Poker</ScreenSubtitle>
                                    <InputWrap>
                                        <FaUserCircle />
                                        <LineInput
                                            type="text"
                                            id="nickName"
                                            name="nickName"
                                            value={formData.nickName}
                                            onChange={handleFieldChange}
                                            placeholder="Seu nome"
                                            required
                                            maxLength={15}
                                            autoFocus
                                        />
                                    </InputWrap>
                                    <InputWrap>
                                        <FaUsers />
                                        <LineInput
                                            type="text"
                                            id="roomName"
                                            name="roomName"
                                            value={formData.roomName}
                                            onChange={handleFieldChange}
                                            placeholder="Nome da sala"
                                            required
                                            maxLength={30}
                                        />
                                    </InputWrap>
                                    <ActionBtn type="submit">Criar Sala</ActionBtn>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmitJoinRoom}>
                                    <ScreenSubtitle>Junte-se à sala de Planning Poker</ScreenSubtitle>
                                    <InputWrap>
                                        <FaUserCircle />
                                        <LineInput
                                            type="text"
                                            id="nickName"
                                            name="nickName"
                                            value={formData.nickName}
                                            onChange={handleFieldChange}
                                            placeholder="Seu nome"
                                            required
                                            maxLength={15}
                                            autoFocus
                                        />
                                    </InputWrap>
                                    <InputWrap>
                                        <FaHashtag />
                                        <LineInput
                                            type="text"
                                            id="roomId"
                                            name="roomId"
                                            value={formData.roomId}
                                            onChange={handleFieldChange}
                                            placeholder="ID da sala"
                                            required
                                            maxLength={36}
                                        />
                                    </InputWrap>
                                    <ActionBtn type="submit">Entrar na Sala</ActionBtn>
                                </form>
                            )}
                        </GlassCard>
                    </Content>}
            </Layout>

            {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
            {isSupportModalOpen && <SupportForm onClose={() => setSupportModalOpen(false)} />}
        </PageBackground>
    );

}

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / App.js (AuthForm) / BoardListPage.js.

const TEXT          = 'var(--text)';
const MUTED         = 'var(--muted)';
const MUTED2        = 'var(--muted2)';
const BORDER        = 'var(--border)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT        = 'var(--accent)';
const ACCENT_SOFT   = 'var(--accent-soft)';
const ACCENT_GLOW   = 'var(--accent-glow)';
const ACCENT_BORDER = 'var(--accent-border)';
const ACCENT_GRAD   = 'var(--accent-grad)';

const PageBackground = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  overflow-x: hidden;
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
  display: flex;
  justify-content: center;
  padding: 56px 24px;
`;

const GlassCard = styled.div`
  position: relative;
  z-index: 1;
  background: var(--panel);
  border-radius: 20px;
  padding: 36px 40px 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-strong);
  border: 1px solid ${BORDER_STRONG};
`;

const AvatarCircle = styled.div`
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: ${ACCENT_GLOW};
  border: 1.5px solid ${ACCENT_BORDER};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  svg { color: ${ACCENT_SOFT}; font-size: 2.4rem; }
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid ${BORDER_STRONG};
  margin-bottom: 22px;
`;

const TabBtn = styled.button`
  flex: 1;
  background: none;
  border: none;
  border-bottom: 2px solid ${p => p.$active ? ACCENT : 'transparent'};
  margin-bottom: -1px;
  color: ${p => p.$active ? ACCENT_SOFT : MUTED};
  font-size: 0.80rem;
  font-weight: ${p => p.$active ? '700' : '400'};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 7px 0 10px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { color: ${p => p.$active ? ACCENT_SOFT : MUTED2}; }
`;

const ScreenSubtitle = styled.p`
  text-align: center;
  font-size: 0.82rem;
  color: ${MUTED2};
  margin: 0 0 22px;
  line-height: 1.5;
`;

const InputWrap = styled.div`
  position: relative;
  margin-bottom: 16px;
  & > svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${MUTED};
    font-size: 0.82rem;
    pointer-events: none;
  }
`;

const LineInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid ${BORDER};
  border-radius: 10px;
  color: ${TEXT};
  font-size: 0.9rem;
  padding: 11px 14px 11px 38px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  &::placeholder { color: ${MUTED}; }
  &:focus { border-color: ${ACCENT_BORDER}; box-shadow: 0 0 0 3px ${ACCENT_GLOW}; }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0px 1000px var(--panel) inset !important;
    box-shadow:         0 0 0px 1000px var(--panel) inset !important;
    -webkit-text-fill-color: ${TEXT} !important;
    caret-color: ${TEXT};
    border: 1px solid ${BORDER} !important;
    border-radius: 10px !important;
    outline: none !important;
    transition: background-color 9999s ease-in-out 0s;
  }
`;

const ActionBtn = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  background: ${ACCENT_GRAD};
  border: none;
  border-radius: 10px;
  color: var(--on-accent);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow: 0 4px 18px ${ACCENT_GLOW};
  transition: filter 0.15s ease, transform 0.1s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
    transform: none;
  }
`;

export default CreateAndEnterRoomPage
