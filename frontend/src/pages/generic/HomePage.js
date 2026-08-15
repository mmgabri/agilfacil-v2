import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from '@aws-amplify/auth';
import styled from 'styled-components';
import { GiPokerHand } from 'react-icons/gi';
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import Header from '../components/Header';
import SuggestionForm from '../components/SuggestionForm'
import { onSignOut } from '../../services/utils'

const HomePage = () => {
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
    <PageBackground>
      <AmbientGlow />

      <Header
        goHome={() => navigate("/")}
        goAbout={() => navigate("/about")}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        showSuggestionsModal={() => setModalOpen(true)} />

      <Container>
        <Title>Clique no serviço desejado para acessar:</Title>

        <ServiceList>
          <ServiceItem onClick={() => navigate("/room/create")}>
            <IconBadge>
              <StyledPokerHand />
            </IconBadge>
            <ServiceTitle>Planning Poker</ServiceTitle>
            <ServiceLink>Estime suas histórias de forma colaborativa e eficaz.</ServiceLink>
          </ServiceItem>
          <ServiceItem onClick={() => navigate("/boards")}>
            <IconBadge>
              <IconContainer>
                <StyledAiFillDislike />
                <StyledAiFillLike />
              </IconContainer>
            </IconBadge>
            <ServiceTitle>Board Interativo</ServiceTitle>
            <ServiceLink>Faça Retrospectivas, Inceptions, Brainstorms e muito mais.</ServiceLink>
          </ServiceItem>

        </ServiceList>
      </Container>

      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}

    </PageBackground>
  );
};

// ─── Design tokens ──────────────────────────────────────────────────────────
// As cores vêm das variáveis CSS de src/index.css (tema dark/light).

const ACCENT        = 'var(--accent)';
const ACCENT_SOFT   = 'var(--accent-soft)';
const ACCENT_GLOW   = 'var(--accent-glow)';

export const PageBackground = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  overflow-x: hidden;
`;

export const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(1100px 480px at 50% -8%, ${ACCENT_GLOW}, transparent 65%);
`;

export const Container = styled.div`
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
`;

export const Title = styled.h2`
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.3px;
  text-align: center;
  margin-bottom: 48px;
  margin-top: 56px;
  color: var(--text);
`;

export const Paragraph = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: var(--muted2);
  margin-bottom: 20px;
`;

export const HighlightedText = styled.span`
  font-weight: bold;
  color: ${ACCENT_SOFT};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${ACCENT};
  }
`;

export const ServiceList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
`;

export const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, color-mix(in srgb, ${ACCENT_SOFT} 38%, transparent), color-mix(in srgb, ${ACCENT} 12%, transparent) 70%);
  border: 1px solid color-mix(in srgb, ${ACCENT} 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, ${ACCENT} 12%, transparent), 0 8px 32px color-mix(in srgb, ${ACCENT} 25%, transparent);
  margin-bottom: 22px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
`;

export const ServiceItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background: var(--surface);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px 28px;
  width: 300px;
  text-align: center;
  box-shadow: var(--shadow-soft);
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: var(--surface-hover);
    border-color: var(--border-strong);
    transform: translateY(-4px);
    box-shadow: var(--shadow-strong), 0 0 0 1px ${ACCENT_GLOW};

    ${IconBadge} {
      transform: scale(1.08);
      box-shadow: 0 0 0 1px color-mix(in srgb, ${ACCENT} 25%, transparent), 0 12px 40px color-mix(in srgb, ${ACCENT} 40%, transparent);
    }
  }
`;

export const ServiceTitle = styled.h3`
  font-size: 19px;
  color: var(--text);
  margin: 0 0 8px;
  font-weight: 700;
`;

export const ServiceLink = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted2);
  margin-top: 0;
`;

export const StyledPokerHand = styled(GiPokerHand)`
  width: 48px;
  height: 48px;
  color: ${ACCENT_SOFT};
`;
export const StyledAiFillLike = styled(AiFillLike)`
  width: 34px;
  height: 34px;
  color: ${ACCENT_SOFT};
`;
export const StyledAiFillDislike = styled(AiFillDislike)`
  width: 34px;
  height: 34px;
  color: ${ACCENT_SOFT};
`;
export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;


export default HomePage;
