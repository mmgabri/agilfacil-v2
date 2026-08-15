import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom'
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from '@aws-amplify/auth';
import { getRoom as fetchRoom } from '../../services/pokerService';
import styled from 'styled-components';
import { GiPokerHand } from 'react-icons/gi';
import { FaUserCircle, FaUsers, FaHashtag } from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { emitMessage, onSignOut } from '../../services/utils'
import SuggestionForm from '../components/SuggestionForm'
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
            fetchRoom(id)
                .then((data) => {
                    setRoomData(data)
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
        <PageBackground>
            <AmbientGlow />

            <Header
                isUserLogged={userIsAuthenticated}
                signIn={() => navigate('/login')}
                signOut={onSignOut}
                goHome={() => navigate('/')}
                hasSidebar />

            <Layout>
                <Sidebar onSuggestions={() => setModalOpen(true)} />

                <Content>
                    <GlassCard>
                        <AvatarCircle><GiPokerHand /></AvatarCircle>

                        <ScreenSubtitle>Informe seu nome para entrar na sala de Planning Poker</ScreenSubtitle>

                        <form onSubmit={handleSubmit}>
                            <InputWrap>
                                <FaUserCircle />
                                <LineInput
                                    type="text"
                                    id="nickName"
                                    name="nickName"
                                    value={formData.nickName || ""}
                                    onChange={handleChange}
                                    placeholder="Digite o seu nome"
                                    required
                                    maxLength={55}
                                    autoFocus
                                />
                            </InputWrap>
                            <InputWrap>
                                <FaUsers />
                                <LineInput
                                    type="text"
                                    id="roomName"
                                    name="roomName"
                                    value={roomData.roomName || ""}
                                    readOnly
                                />
                            </InputWrap>
                            <InputWrap>
                                <FaHashtag />
                                <LineInput
                                    type="text"
                                    id="roomId"
                                    name="roomId"
                                    value={roomData.roomId || ""}
                                    readOnly
                                />
                            </InputWrap>
                            <ActionBtn type="submit">Entrar na Sala</ActionBtn>
                        </form>
                    </GlassCard>
                </Content>
            </Layout>

            {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
        </PageBackground>
    );

}

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / CreateAndEnterRoomPage.js / BoardListPage.js.

const TEXT          = 'var(--text)';
const MUTED         = 'var(--muted)';
const MUTED2        = 'var(--muted2)';
const BORDER        = 'var(--border)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT_SOFT   = 'var(--accent-soft)';
const ACCENT_GLOW   = 'var(--accent-glow)';
const ACCENT_BORDER = 'var(--accent-border)';
const ACCENT_GRAD   = 'var(--accent-grad)';

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
  &:read-only { opacity: 0.55; cursor: default; }

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
`;

export default GuestUrlPage
