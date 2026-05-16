import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import styled from "styled-components";
import { Authenticator, translations, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { I18n } from 'aws-amplify/utils';
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import HomePage from "../pages/generic/HomePage";
import AboutPage from "../pages/generic/AboutPage"
import CreateAndEnterPage from "../pages/poker/CreateAndEnterRoomPage";
import RoomPage from "../pages/poker/RoomPage";
import GuestUrlPage from "../pages/poker/GuestUrlPage";
import NotificationPage from "../pages/poker/NotificationPage"

import BoardPage from "../pages/board/BoardPage"
import CreateBoardPage from "../pages/board/CreateBoardPage"
import BoardListPage from "../pages/board/BoardListPage"
import GuestUrlBoardPage from "../pages/board/GuestUrlBoardPage";
import ExportPDFPage from "../pages/board/ExportPDFPage";
import SolicitaLoginPage from '../pages/generic/SolicitaLoginPage';


I18n.putVocabularies(translations);
I18n.setLanguage('pt');

const StyledToastContainer = styled(ToastContainer)`
  z-index: 9999;
`;

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #1c1c1c;
  color: white;
  font-family: Arial, sans-serif;
`;


const ProtectedRoute = ({ children }) => {
  const { route } = useAuthenticator((context) => [context.route]);

  const navigate = useNavigate();

  useEffect(() => {

    switch (route) {
      case 'signIn': // Salva a URL atual antes de redirecionar para o login
        sessionStorage.setItem('AGILFACIL_redirectAfterLogin', window.location.pathname);
        break;

      case 'authenticated': // Redireciona para a URL salva após o login
        const redirectTo = sessionStorage.getItem('AGILFACIL_redirectAfterLogin');
        sessionStorage.removeItem('AGILFACIL_redirectAfterLogin');

        if (redirectTo == '/login') {
          navigate('/');
        } else {
          navigate(redirectTo);
        }
        break;

      case 'signOut': // Limpa a URL salva ao fazer logout
        sessionStorage.removeItem('AGILFACIL_redirectAfterLogin');
        break;

      default:
        break;
    }
  }, [route, navigate]);

  if (route !== "authenticated") {
    return (
      <AuthContainer>
        <Authenticator
          socialProviders={["google"]}
          formFields={formFields}
          hideSignUp={false}
        />
      </AuthContainer>
    );
  }
  return children;
};


const formFields = {
  signIn: {
    username: {
      placeholder: 'Digite seu e-mail',
      isRequired: true,
      label: 'Email ',
      order: 1,
    },
  },

  signUp: {
    name: {
      label: 'Nome',
      placeholder: 'Digite seu nome',
      isRequired: true,
      order: 1,
    },
    email: {
      placeholder: 'Digite seu e-mail',
      isRequired: true,
      label: 'Email ',
      order: 2,
    },
  },
};

function App() {

  return (
    <>
      <StyledToastContainer pauseOnFocusLoss={false} />
      <Routes>
        <Route path="/login" element={<ProtectedRoute> <SolicitaLoginPage /> </ProtectedRoute>} />
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/about" element={<AboutPage />} />
        <Route path="/room/create" element={<CreateAndEnterPage/>} />
        <Route exact path="room" element={<RoomPage />} />
        <Route path="/room/guest/:id" element={<GuestUrlPage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/board/guest/:id" element={<GuestUrlBoardPage />} />
        <Route path="/board/export/:id" element={<ExportPDFPage />} />
        <Route path="/board/create" element={<ProtectedRoute> <CreateBoardPage /> </ProtectedRoute>} />
        <Route path="/boards" element={<ProtectedRoute> <BoardListPage /> </ProtectedRoute>} />
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