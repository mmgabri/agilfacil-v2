import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import styled from "styled-components";
import { Authenticator, translations, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { I18n } from 'aws-amplify/utils';
import { signUp, signIn, signOut, signInWithRedirect, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/generic/HomePage";
import AboutPage from "../pages/generic/AboutPage";
import CreateAndEnterPage from "../pages/poker/CreateAndEnterRoomPage";
import RoomPage from "../pages/poker/RoomPage";
import GuestUrlPage from "../pages/poker/GuestUrlPage";
import NotificationPage from "../pages/poker/NotificationPage";
import BoardPage from "../pages/board/BoardPage";
import CreateBoardPage from "../pages/board/CreateBoardPage";
import BoardListPage from "../pages/board/BoardListPage";
import GuestUrlBoardPage from "../pages/board/GuestUrlBoardPage";
import ExportPDFPage from "../pages/board/ExportPDFPage";
import SolicitaLoginPage from '../pages/generic/SolicitaLoginPage';
import LoaderPage from '../pages/generic/LoaderPage';

import { useAppUser } from '../context/UserContext';
import { checkUserMigration, registerUserMigration } from '../services/userService';

I18n.putVocabularies(translations);
I18n.setLanguage('pt');

// ─────────────────────────────────────────────────────────────────────────────
// Styled components compartilhados
// ─────────────────────────────────────────────────────────────────────────────

const StyledToastContainer = styled(ToastContainer)`z-index: 9999;`;

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1c1c1c;
  color: white;
  font-family: Arial, sans-serif;
  padding: 24px;
`;

const Card = styled.div`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  color: #fff;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #aaa;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #444;
  background: #1c1c1c;
  color: #fff;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #0095f6; }
`;

const PrimaryButton = styled.button`
  padding: 10px;
  border-radius: 6px;
  border: none;
  background: #0095f6;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  &:hover { background: #007acc; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const SecondaryButton = styled.button`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #444;
  background: transparent;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  &:hover { background: #333; }
`;

const ErrorMsg = styled.p`
  color: #f44;
  font-size: 0.85rem;
  margin: 0;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.8rem;
  &::before, &::after { content: ''; flex: 1; border-top: 1px solid #444; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Passo 1 — coleta só o email e verifica status de migração
// ─────────────────────────────────────────────────────────────────────────────

const EmailStep = ({ onContinue, isLoading }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) onContinue(email.trim());
  };

  return (
    <Card>
      <Title>Entrar ou cadastrar</Title>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? 'Verificando...' : 'Continuar'}
        </PrimaryButton>
      </form>
      <Divider>ou</Divider>
      <SecondaryButton onClick={() => signInWithRedirect({ provider: 'Google' })}>
        🔵 Entrar com Google
      </SecondaryButton>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Passo 2b — usuário migrado ainda sem senha no novo sistema
// ─────────────────────────────────────────────────────────────────────────────

const MigratedSetupForm = ({ email, userName, onSuccess }) => {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres'); return; }
    if (password !== confirm) { setError('As senhas não coincidem'); return; }

    setIsLoading(true);
    try {
      // Cria conta no novo Cognito (ignora se já existir — retry seguro)
      try {
        await signUp({
          username: email,
          password,
          options: { userAttributes: { email, name: userName } },
        });
      } catch (signUpErr) {
        if (signUpErr.name !== 'UsernameExistsException') throw signUpErr;
      }

      // Garante que não há sessão ativa antes de autenticar
      try { await signOut(); } catch { /* ignora se não havia sessão */ }

      // Autentica
      await signIn({ username: email, password });

      // Marca migração como concluída e obtém userId efetivo
      const cognito = await getCurrentUser();
      const attrs   = await fetchUserAttributes(cognito);
      const result  = await registerUserMigration({
        email:      attrs.email,
        cognitoSub: attrs.sub,
        userName:   attrs.name || userName,
      });

      // Notifica o ProtectedRoute com os dados completos — não depende de route mudar
      onSuccess({ userId: result.userId, userName: attrs.name || userName, email: attrs.email });
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Title>Olá, {userName}!</Title>
      <Subtitle>Por favor cadastre sua senha novamente para continuar.</Subtitle>
      <Subtitle style={{ color: '#888' }}>E-mail: {email}</Subtitle>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          type="password"
          placeholder="Nova senha (mín. 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
        <Input
          type="password"
          placeholder="Confirme a nova senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar Senha'}
        </PrimaryButton>
      </form>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Configuração estática do Amplify Authenticator
// ─────────────────────────────────────────────────────────────────────────────

const BASE_FORM_FIELDS = {
  signUp: {
    name:  { label: 'Nome', placeholder: 'Digite seu nome', isRequired: true, order: 1 },
    email: { placeholder: 'Digite seu e-mail', isRequired: true, label: 'Email', order: 2 },
    confirm_email: {
      label: 'Confirmar Email',
      placeholder: 'Digite seu e-mail novamente',
      isRequired: true,
      type: 'email',
      order: 3,
    },
  },
};

const services = {
  async validateCustomSignUp(formData) {
    if (!formData.confirm_email) return { confirm_email: 'Por favor confirme seu e-mail' };
    if (formData.email !== formData.confirm_email) return { confirm_email: 'Os e-mails não coincidem' };
  },
  async handleSignUp(input) {
    const { confirm_email, ...userAttributes } = input.options?.userAttributes ?? {};
    return signUp({
      username: input.username,
      password: input.password,
      options: { ...input.options, userAttributes },
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — máquina de estados de autenticação
// ─────────────────────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { route } = useAuthenticator((context) => [context.route]);
  const navigate = useNavigate();
  const { setUser, clearUser, userId: contextUserId } = useAppUser();

  // Etapas: 'email' | 'checking' | 'normalAuth' | 'migratedSetup'
  const [authStep, setAuthStep]           = useState('email');
  const [checkedEmail, setCheckedEmail]   = useState('');
  const [migrationUser, setMigrationUser] = useState(null); // { userName }
  const [forceAuth, setForceAuth]         = useState(false); // true após migração concluída
  // isPostAuthDone: garante que children só renderizam após o userId estar no contexto.
  // Inicia true se o contexto já tem userId (navegação entre rotas protegidas).
  const [isPostAuthDone, setIsPostAuthDone] = useState(() => Boolean(contextUserId));
  const postAuthRunning = useRef(false);

  // ── formFields com email pré-preenchido (useMemo evita nova referência a cada render) ──
  const formFields = React.useMemo(() => ({
    signIn: {
      username: { placeholder: 'Digite seu e-mail', isRequired: true, label: 'Email', order: 1, defaultValue: checkedEmail },
    },
    ...BASE_FORM_FIELDS,
  }), [checkedEmail]);

  // ── Pós-autenticação: registrar na tabela e popular UserContext ─────────────
  const handlePostAuth = async () => {
    if (postAuthRunning.current) return;
    postAuthRunning.current = true;
    try {
      const cognito  = await getCurrentUser();
      const attrs    = await fetchUserAttributes(cognito);
      const result   = await registerUserMigration({
        email:      attrs.email,
        cognitoSub: attrs.sub,
        userName:   attrs.name || '',
      });
      setUser({ userId: result.userId, userName: attrs.name || '', email: attrs.email });
    } catch (err) {
      console.error('[ProtectedRoute] handlePostAuth error:', err);
    } finally {
      postAuthRunning.current = false;
      setIsPostAuthDone(true); // libera o render de children independente de sucesso/erro
    }
  };

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
        // onSignOut já faz window.location.replace('/') — não precisa resetar authStep aqui
        clearUser();
        break;

      default:
        break;
    }
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Salva URL antes de redirecionar para login ──────────────────────────────
  useEffect(() => {
    if (route === 'signIn') {
      sessionStorage.setItem('AGILFACIL_redirectAfterLogin', window.location.pathname);
    }
  }, [route]);

  // ── Step 1: passo inicial de e-mail ─────────────────────────────────────────
  const handleEmailStep = async (email) => {
    setCheckedEmail(email);
    setAuthStep('checking');
    try {
      const result = await checkUserMigration(email);
      if (result.found && result.migrated === false) {
        // Usuário do sistema antigo ainda sem senha → tela de boas-vindas
        setMigrationUser({ userName: result.userName });
        setAuthStep('migratedSetup');
      } else {
        // 404 (novo usuário) OU migrado concluído → fluxo normal do Amplify
        setAuthStep('normalAuth');
      }
    } catch {
      setAuthStep('normalAuth'); // fallback em caso de erro na API
    }
  };

  if (route !== 'authenticated' && !forceAuth) {
    if (authStep === 'email' || authStep === 'checking') {
      return (
        <AuthContainer>
          <EmailStep onContinue={handleEmailStep} isLoading={authStep === 'checking'} />
        </AuthContainer>
      );
    }

    if (authStep === 'migratedSetup') {
      return (
        <AuthContainer>
          <MigratedSetupForm
            email={checkedEmail}
            userName={migrationUser.userName}
            onSuccess={({ userId, userName: uName, email: uEmail }) => {
              setUser({ userId, userName: uName, email: uEmail });
              setIsPostAuthDone(true);
              setForceAuth(true);
            }}
          />
        </AuthContainer>
      );
    }

    // authStep === 'normalAuth'
    return (
      <AuthContainer>
        <Authenticator
          socialProviders={["google"]}
          formFields={formFields}
          services={services}
          hideSignUp={false}
        />
      </AuthContainer>
    );
  }

  // Autenticado mas handlePostAuth ainda não concluiu — aguarda userId no contexto
  if (!isPostAuthDone) return <LoaderPage />;

  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
// App e AppWrapper
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <>
      <StyledToastContainer pauseOnFocusLoss={false} />
      <Routes>
        <Route path="/login"          element={<ProtectedRoute><SolicitaLoginPage /></ProtectedRoute>} />
        <Route exact path="/"         element={<HomePage />} />
        <Route exact path="/about"    element={<AboutPage />} />
        <Route path="/room/create"    element={<CreateAndEnterPage />} />
        <Route exact path="room"      element={<RoomPage />} />
        <Route path="/room/guest/:id" element={<GuestUrlPage />} />
        <Route path="/notification"   element={<NotificationPage />} />
        <Route path="/board"          element={<BoardPage />} />
        <Route path="/board/guest/:id"   element={<GuestUrlBoardPage />} />
        <Route path="/board/export/:id"  element={<ExportPDFPage />} />
        <Route path="/board/create"  element={<ProtectedRoute><CreateBoardPage /></ProtectedRoute>} />
        <Route path="/boards"        element={<ProtectedRoute><BoardListPage /></ProtectedRoute>} />
      </Routes>
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
