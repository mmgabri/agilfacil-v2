import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import styled from "styled-components";
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { signUp, confirmSignUp, signIn, signInWithRedirect, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { FaEnvelope, FaLock, FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppUser } from '../context/UserContext';
import { getAuthStatus, setNewPassword } from '../services/authService';

// Carregamento síncrono — usados no fluxo de auth (precisam estar prontos imediatamente)
import LoaderPage       from '../pages/generic/LoaderPage';
import SolicitaLoginPage from '../pages/generic/SolicitaLoginPage';
import ConfirmDialogHost from '../pages/components/ConfirmDialog';

// Carregamento lazy — só baixa o código quando a rota for acessada
const HomePage           = lazy(() => import('../pages/generic/HomePage'));
const AboutPage          = lazy(() => import('../pages/generic/AboutPage'));
const BoardPage          = lazy(() => import('../pages/board/BoardPage'));
const BoardListPage      = lazy(() => import('../pages/board/BoardListPage'));
const CreateBoardPage    = lazy(() => import('../pages/board/CreateBoardPage'));
const GuestUrlBoardPage  = lazy(() => import('../pages/board/GuestUrlBoardPage'));
const ExportPDFPage      = lazy(() => import('../pages/board/ExportPDFPage'));
const BoardPageMock      = lazy(() => import('../pages/board/BoardPageMock'));
const BoardListPageMock  = lazy(() => import('../pages/board/BoardListPageMock'));
const CreateAndEnterPage = lazy(() => import('../pages/poker/CreateAndEnterRoomPage'));
const RoomPage           = lazy(() => import('../pages/poker/RoomPage'));
const GuestUrlPage       = lazy(() => import('../pages/poker/GuestUrlPage'));
const NotificationPage   = lazy(() => import('../pages/poker/NotificationPage'));

// ─────────────────────────────────────────────────────────────────────────────
// Styled components
// ─────────────────────────────────────────────────────────────────────────────

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / BoardPage / CreateBoardModal.

const TEXT         = 'var(--text)';
const MUTED        = 'var(--muted)';
const MUTED2       = 'var(--muted2)';
const BORDER       = 'var(--border)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT        = 'var(--accent)';
const ACCENT_SOFT   = 'var(--accent-soft)';
const ACCENT_GLOW   = 'var(--accent-glow)';
const ACCENT_BORDER = 'var(--accent-border)';
const ACCENT_GRAD   = 'var(--accent-grad)';
const RED           = 'var(--red)';

const StyledToastContainer = styled(ToastContainer)`z-index: 9999;`;

const AuthContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: Arial, sans-serif;
  overflow: hidden;
`;

const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(1100px 480px at 50% -8%, ${ACCENT_GLOW}, transparent 65%);
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
  margin: 0 auto 28px;
  svg { color: ${ACCENT_SOFT}; font-size: 2.6rem; }
`;

const ScreenTitle = styled.h2`
  text-align: center;
  letter-spacing: 4px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${TEXT};
  margin: 0 0 24px 0;
  text-transform: uppercase;
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid ${BORDER_STRONG};
  margin-bottom: 26px;
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

const InputWrap = styled.div`
  position: relative;
  margin-bottom: 16px;
  /* > svg: apenas filhos diretos (ícone da esquerda) — não afeta o EyeBtn */
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

  /* ── Neutraliza o fundo branco/colorido do autofill do browser ── */
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
  &:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const GoogleBtn = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background: var(--surface);
  border: 1px solid ${BORDER};
  border-radius: 10px;
  color: ${MUTED2};
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s ease, border-color 0.15s ease;
  &:hover { background: var(--surface-hover); border-color: ${BORDER_STRONG}; }
`;

const AuthDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${MUTED};
  font-size: 0.75rem;
  margin-top: 16px;
  &::before, &::after { content: ''; flex: 1; border-top: 1px solid ${BORDER}; }
`;

const AuthSubtitle = styled.p`
  margin: 0 0 6px 0;
  color: ${MUTED2};
  font-size: 0.85rem;
`;

const AuthErrorMsg = styled.p`
  color: ${RED};
  font-size: 0.82rem;
  margin: 4px 0 0 0;
`;

/* ── Botão olhinho (toggle senha) ────────────────────────────────────────────── */
const EyeBtn = styled.button`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${MUTED};
  cursor: pointer;
  padding: 4px 6px;
  line-height: 1;
  &:hover { color: ${MUTED2}; }
  svg { font-size: 1rem; display: block; }
`;

/* ── Modal de aviso para usuários migrados ───────────────────────────────────── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`;

const ModalCard = styled.div`
  background: var(--panel);
  border: 1px solid ${BORDER_STRONG};
  border-radius: 20px;
  padding: 36px 32px 28px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-strong);
`;

const ModalTitle = styled.h3`
  color: ${TEXT};
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 14px;
  letter-spacing: 0.5px;
`;

const ModalText = styled.p`
  color: ${MUTED2};
  font-size: 0.88rem;
  line-height: 1.6;
  margin: 0 0 28px;
`;

const ModalBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: ${ACCENT_GRAD};
  border: none;
  border-radius: 10px;
  color: var(--on-accent);
  font-size: 0.80rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 18px ${ACCENT_GLOW};
  transition: filter 0.15s ease, transform 0.1s ease;
  &:hover { filter: brightness(1.08); transform: translateY(-1px); }
`;

const ModalCancelBtn = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: none;
  border: none;
  color: ${MUTED};
  font-size: 0.80rem;
  cursor: pointer;
  &:hover { color: ${MUTED2}; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Valida email exigindo TLD (ex: mar@gmail falha; mar@gmail.com passa) */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

// ─────────────────────────────────────────────────────────────────────────────
// AuthForm — formulário unificado de login / cadastro
// ─────────────────────────────────────────────────────────────────────────────

const AuthForm = ({ onSignedIn }) => {
  const [tab, setTab] = useState('entrar'); // 'entrar' | 'cadastrar'

  // ── Campos Entrar ─────────────────────────────────────────────────────────
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ── Campos Cadastrar ──────────────────────────────────────────────────────
  const [signupName,         setSignupName]         = useState('');
  const [signupEmail,        setSignupEmail]        = useState('');
  const [signupEmailConfirm, setSignupEmailConfirm] = useState('');
  const [signupPassword,     setSignupPassword]     = useState('');
  const [signupConfirm,      setSignupConfirm]      = useState('');

  // ── Controle migração ─────────────────────────────────────────────────────
  const [isMigrated,       setIsMigrated]       = useState(false);
  // pendingMigration: { email, name } — preenchido ao detectar usuário migrado;
  // exibe o popup de aviso antes de trocar de aba
  const [pendingMigration, setPendingMigration] = useState(null);

  // ── Visibilidade de senha ─────────────────────────────────────────────────
  const [showLoginPass,   setShowLoginPass]   = useState(false);
  const [showSignupPass,  setShowSignupPass]  = useState(false);
  const [showSignupConf,  setShowSignupConf]  = useState(false);

  // ── Confirmação de código (signup novo) ───────────────────────────────────
  const [phase, setPhase] = useState('form'); // 'form' | 'confirm'
  const [code,  setCode]  = useState('');

  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');

  const switchTab = (t) => { setTab(t); setError(''); setIsMigrated(false); };

  // ── Confirma popup e entra na aba Cadastrar com campos pré-preenchidos ────
  const confirmMigration = () => {
    setSignupEmail(pendingMigration.email);
    setSignupName(pendingMigration.name || '');
    setIsMigrated(true);
    setTab('cadastrar');
    setPendingMigration(null);
  };

  // ── Aba Entrar: verifica migração antes de validar senha ──────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(loginEmail)) return setError('Informe um e-mail válido (ex: nome@dominio.com)');
    setBusy(true);
    try {
      const result = await getAuthStatus(loginEmail);
      console.log('[AuthForm] getAuthStatus result:', result);

      if (result.exists && result.status === 'FORCE_CHANGE_PASSWORD') {
        // Usuário migrado → mostra popup de aviso antes de trocar de aba
        setPendingMigration({ email: loginEmail, name: result.name || '' });
        setBusy(false);
        return;
      }

      // Usuário normal → tenta sign-in
      const { nextStep } = await signIn({ username: loginEmail, password: loginPassword });
      if (nextStep.signInStep === 'DONE') {
        await onSignedIn();
      } else {
        setError('Etapa adicional de autenticação necessária. Tente novamente.');
      }
    } catch (err) {
      setError(err.message || 'Email ou senha incorretos');
    } finally {
      setBusy(false);
    }
  };

  // ── Aba Cadastrar: migrado (cria senha) ou novo (cria conta) ──────────────
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(signupEmail)) return setError('Informe um e-mail válido (ex: nome@dominio.com)');
    if (!isMigrated && signupEmail !== signupEmailConfirm) return setError('Os e-mails não coincidem');
    if (signupPassword.length < 8) return setError('Senha deve ter no mínimo 8 caracteres');
    if (signupPassword !== signupConfirm) return setError('As senhas não coincidem');
    setBusy(true);
    try {
      if (isMigrated) {
        await setNewPassword(signupEmail, signupPassword);
        await signIn({ username: signupEmail, password: signupPassword });
        await onSignedIn();
      } else {
        const { nextStep } = await signUp({
          username: signupEmail,
          password: signupPassword,
          options: { userAttributes: { name: signupName, email: signupEmail } },
        });
        if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setPhase('confirm');
        } else {
          await signIn({ username: signupEmail, password: signupPassword });
          await onSignedIn();
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  // ── Confirmação do código enviado por email ───────────────────────────────
  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await confirmSignUp({ username: signupEmail, confirmationCode: code });
      await signIn({ username: signupEmail, password: signupPassword });
      await onSignedIn();
    } catch (err) {
      setError(err.message || 'Código inválido');
      setBusy(false);
    }
  };

  // ── Popup de aviso para usuário migrado ───────────────────────────────────
  const migrationPopup = pendingMigration && (
    <ModalOverlay>
      <ModalCard>
        <AvatarCircle style={{ marginBottom: 20 }}><FaUserCircle /></AvatarCircle>
        <ModalTitle>Que bom ver você de novo!</ModalTitle>
        <ModalText>
          Para continuar acessando sua conta, é necessário cadastrar uma nova senha. Clique em <strong>Continuar</strong> para continuar.
        </ModalText>
        <ModalBtn onClick={confirmMigration}>Continuar</ModalBtn>
        <ModalCancelBtn onClick={() => setPendingMigration(null)}>Cancelar</ModalCancelBtn>
      </ModalCard>
    </ModalOverlay>
  );

  // ── Fase: confirmação de código ───────────────────────────────────────────
  if (phase === 'confirm') {
    return (
      <>
        {migrationPopup}
        <GlassCard>
          <AvatarCircle><FaUserCircle /></AvatarCircle>
          <ScreenTitle>Confirmar Email</ScreenTitle>
          <AuthSubtitle style={{ marginBottom: 24 }}>
            Código enviado para <strong>{signupEmail}</strong>
          </AuthSubtitle>
          <form onSubmit={handleConfirmSubmit}>
            <InputWrap>
              <LineInput
                type="text"
                placeholder="Código de confirmação"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
              />
            </InputWrap>
            {error && <AuthErrorMsg>{error}</AuthErrorMsg>}
            <ActionBtn type="submit" disabled={busy}>
              {busy ? 'Confirmando...' : 'Confirmar'}
            </ActionBtn>
          </form>
        </GlassCard>
      </>
    );
  }

  // ── Fase: formulário principal ─────────────────────────────────────────────
  return (
    <>
      {migrationPopup}
      <GlassCard>
        <AvatarCircle><FaUserCircle /></AvatarCircle>

        <TabBar>
          <TabBtn $active={tab === 'entrar'}    onClick={() => switchTab('entrar')}>Entrar</TabBtn>
          <TabBtn $active={tab === 'cadastrar'} onClick={() => switchTab('cadastrar')}>Cadastrar</TabBtn>
        </TabBar>

        {tab === 'entrar' ? (
          /* ── Entrar ────────────────────────────────────────────────────────── */
          <form onSubmit={handleLoginSubmit} autoComplete="off">
            <InputWrap>
              <FaEnvelope />
              <LineInput
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="username"
                required
                autoFocus
              />
            </InputWrap>
            <InputWrap>
              <FaLock />
              <LineInput
                type={showLoginPass ? 'text' : 'password'}
                placeholder="Senha"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 30 }}
                required
              />
              <EyeBtn type="button" tabIndex={-1} onClick={() => setShowLoginPass(v => !v)}>
                {showLoginPass ? <FaEyeSlash /> : <FaEye />}
              </EyeBtn>
            </InputWrap>
            {error && <AuthErrorMsg>{error}</AuthErrorMsg>}
            <ActionBtn type="submit" disabled={busy}>
              {busy ? 'Entrando...' : 'Entrar'}
            </ActionBtn>
          </form>
        ) : (
          /* ── Cadastrar ─────────────────────────────────────────────────────── */
          <form onSubmit={handleSignupSubmit}>
            <InputWrap>
              <FaUserCircle />
              <LineInput
                type="text"
                placeholder="Nome"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                readOnly={isMigrated}
                autoFocus={!isMigrated}
              />
            </InputWrap>
            <InputWrap>
              <FaEnvelope />
              <LineInput
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                readOnly={isMigrated}
              />
            </InputWrap>
            {!isMigrated && (
              <InputWrap>
                <FaEnvelope />
                <LineInput
                  type="email"
                  placeholder="Confirme o e-mail"
                  value={signupEmailConfirm}
                  onChange={(e) => setSignupEmailConfirm(e.target.value)}
                  required
                />
              </InputWrap>
            )}
            <InputWrap>
              <FaLock />
              <LineInput
                type={showSignupPass ? 'text' : 'password'}
                placeholder={isMigrated ? 'Crie sua senha (mín. 8 caracteres)' : 'Senha (mín. 8 caracteres)'}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                style={{ paddingRight: 30 }}
                required
                autoFocus={isMigrated}
              />
              <EyeBtn type="button" tabIndex={-1} onClick={() => setShowSignupPass(v => !v)}>
                {showSignupPass ? <FaEyeSlash /> : <FaEye />}
              </EyeBtn>
            </InputWrap>
            <InputWrap>
              <FaLock />
              <LineInput
                type={showSignupConf ? 'text' : 'password'}
                placeholder="Confirme a senha"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                style={{ paddingRight: 30 }}
                required
              />
              <EyeBtn type="button" tabIndex={-1} onClick={() => setShowSignupConf(v => !v)}>
                {showSignupConf ? <FaEyeSlash /> : <FaEye />}
              </EyeBtn>
            </InputWrap>
            {error && <AuthErrorMsg>{error}</AuthErrorMsg>}
            <ActionBtn type="submit" disabled={busy}>
              {busy
                ? (isMigrated ? 'Salvando...'   : 'Criando conta...')
                : (isMigrated ? 'Criar Senha'   : 'Criar Conta')}
            </ActionBtn>
          </form>
        )}

        <AuthDivider>ou</AuthDivider>
        <GoogleBtn onClick={() => signInWithRedirect({ provider: 'Google' })}>
          <FcGoogle style={{ fontSize: '1.2rem' }} />
          Entrar com Google
        </GoogleBtn>
      </GlassCard>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute
// ─────────────────────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { route } = useAuthenticator((context) => [context.route]);
  const navigate  = useNavigate();
  const { setUser, clearUser, userId: contextUserId } = useAppUser();

  const [isPostAuthDone, setIsPostAuthDone] = useState(() => Boolean(contextUserId));
  const [isInitializing, setIsInitializing] = useState(true);
  const postAuthRunning = useRef(false);

  // ── Lê atributos do Cognito e popula o UserContext ────────────────────────
  const handlePostAuth = async () => {
    if (postAuthRunning.current) return;
    postAuthRunning.current = true;
    try {
      const cognito = await getCurrentUser();
      const attrs   = await fetchUserAttributes(cognito);
      // Usuários migrados têm custom:legacy_id com o sub do pool antigo.
      // Novos usuários usam o sub do Cognito atual.
      const userId   = attrs['custom:legacy_id'] || attrs.sub;
      const userName = attrs.name || '';
      setUser({ userId, userName, email: attrs.email });
    } catch (err) {
      console.error('[ProtectedRoute] handlePostAuth error:', err);
    } finally {
      postAuthRunning.current = false;
      setIsPostAuthDone(true);
    }
  };

  // ── Verifica sessão existente no mount ────────────────────────────────────
  useEffect(() => {
    if (contextUserId) {
      setIsPostAuthDone(true);
      setIsInitializing(false);
      return;
    }
    getCurrentUser()
      .then(() => handlePostAuth())
      .catch(() => { /* sem sessão — mostra formulário */ })
      .finally(() => setIsInitializing(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Detecta autenticação via Google OAuth (Amplify gerencia o redirect) ───
  useEffect(() => {
    switch (route) {
      case 'authenticated':
        handlePostAuth().then(() => {
          const redirectTo = sessionStorage.getItem('AGILFACIL_redirectAfterLogin');
          sessionStorage.removeItem('AGILFACIL_redirectAfterLogin');
          if (redirectTo && redirectTo !== '/login') navigate(redirectTo);
        });
        break;
      case 'signIn':
        clearUser();
        break;
      default:
        break;
    }
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Salva URL antes do redirect para login ────────────────────────────────
  useEffect(() => {
    if (route === 'signIn') {
      sessionStorage.setItem('AGILFACIL_redirectAfterLogin', window.location.pathname);
    }
  }, [route]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (isInitializing)  return <LoaderPage />;
  if (isPostAuthDone)  return children;

  return (
    <AuthContainer>
      <AmbientGlow />
      <AuthForm onSignedIn={handlePostAuth} />
    </AuthContainer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App e AppWrapper
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <>
      <StyledToastContainer pauseOnFocusLoss={false} />
      <ConfirmDialogHost />
      <Suspense fallback={<LoaderPage />}>
        <Routes>
          <Route path="/login"             element={<ProtectedRoute><SolicitaLoginPage /></ProtectedRoute>} />
          <Route exact path="/"            element={<HomePage />} />
          <Route exact path="/about"       element={<AboutPage />} />
          <Route path="/room/create"       element={<CreateAndEnterPage />} />
          <Route exact path="room"         element={<RoomPage />} />
          <Route path="/room/guest/:id"    element={<GuestUrlPage />} />
          <Route path="/notification"      element={<NotificationPage />} />
          <Route path="/board/mock"         element={<BoardPageMock />} />
          <Route path="/boards/mock"        element={<BoardListPageMock />} />
          <Route path="/board"             element={<BoardPage />} />
          <Route path="/board/guest/:id"   element={<GuestUrlBoardPage />} />
          <Route path="/board/export/:id"  element={<ExportPDFPage />} />
          <Route path="/board/create"      element={<ProtectedRoute><CreateBoardPage /></ProtectedRoute>} />
          <Route path="/boards"            element={<ProtectedRoute><BoardListPage /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Authenticator.Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Authenticator.Provider>
  );
}
