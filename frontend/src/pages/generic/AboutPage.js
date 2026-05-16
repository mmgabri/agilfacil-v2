import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.js';
import SuggestionForm from '../components/SuggestionForm'
import { onSignOut } from '../../services/utils'

function AboutPage() {
  let navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  useEffect(() => {
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

    checkAuth();

  }, []);


  return (
    <div className="bg-black-custom">
      <Header
        showSuggestionsModal={() => setModalOpen(true)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')} />
      <Container>
        <Title>Sobre o AgilFacil</Title>
        <Paragraph>
          O AgilFacil tem o propósito de fornecer ferramentas e recursos que simplificam a implementação de práticas ágeis, como o Planning Poker e Board Interativo.
        </Paragraph>
        <Paragraph>
          Em um ambiente corporativo cada vez mais dinâmico, onde a agilidade e a colaboração são essenciais para o sucesso, as ferramentas Planning Poker e Board Interativo se destacam como uma ferramenta poderosa.
        </Paragraph>
      </Container>
      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
    </div>
  );

}

export const Container = styled.div`
  max-width: 900px;
  margin: 1px auto;
  padding: 30px;
  background-color: #1C1C1C; 
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;


export const Title = styled.h2`
  font-size: 36px;
  text-align: center;
  margin-bottom: 20px;
  color: #C0C0C0;
`;

export const Paragraph = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: #C0C0C0;
  margin-bottom: 20px;
`;

export const List = styled.ul`
  margin-top: 20px;
  padding-left: 20px;
`;

export const ListItem = styled.li`
  margin-bottom: 10px;
  font-size: 18px;
  color: #C0C0C0;
  font-weight: 500;
`;


export default AboutPage