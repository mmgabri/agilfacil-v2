import React from 'react';
import styled from 'styled-components';

const VotingCards = ({ onCardClick, nota, cards }) => {

    return (
        <Container>
            <CardList>
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        $selected={card === nota}
                        onClick={() => onCardClick(card)}
                    >
                        {card}
                    </Card>
                ))}
            </CardList>
        </Container>
    );
};

const TEXT         = '#f5f5f7';
const BORDER       = 'rgba(255,255,255,0.07)';
const ACCENT       = '#8b7cf6';
const ACCENT_SOFT  = '#a996ff';
const ACCENT_GLOW  = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD  = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  margin-top: 8px;
`;

export const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
`;

export const Card = styled.div`
  background: ${({ $selected }) => ($selected ? ACCENT_GRAD : 'rgba(255,255,255,0.03)')};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid ${({ $selected }) => ($selected ? 'transparent' : BORDER)};
  border-radius: 12px;
  box-shadow: ${({ $selected }) => ($selected ? `0 8px 28px ${ACCENT_GLOW}` : '0 4px 16px rgba(0,0,0,0.3)')};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 92px;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ $selected }) => ($selected ? '#0a0a0d' : TEXT)};
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: ${({ $selected }) => ($selected ? 'transparent' : `${ACCENT}70`)};
    box-shadow: ${({ $selected }) => ($selected ? `0 10px 32px ${ACCENT_GLOW}` : `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${ACCENT_GLOW}`)};
  }

  @media (max-width: 600px) {
    width: 56px;
    height: 78px;
    font-size: 1.15rem;
  }
`;

export const Title = styled.h2`
  margin-bottom: 1.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${ACCENT_SOFT};
  text-align: center;
`;

export default VotingCards;
