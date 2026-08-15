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

const TEXT         = 'var(--text)';
const BORDER       = 'var(--border)';
const ACCENT_BORDER = 'var(--accent-border)';
const ACCENT_SOFT  = 'var(--accent-soft)';
const ACCENT_GLOW  = 'var(--accent-glow)';
const ACCENT_GRAD  = 'var(--accent-grad)';

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
  background: ${({ $selected }) => ($selected ? ACCENT_GRAD : 'var(--surface)')};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid ${({ $selected }) => ($selected ? 'transparent' : BORDER)};
  border-radius: 12px;
  box-shadow: ${({ $selected }) => ($selected ? `0 8px 28px ${ACCENT_GLOW}` : 'var(--shadow-soft)')};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 92px;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ $selected }) => ($selected ? 'var(--on-accent)' : TEXT)};
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: ${({ $selected }) => ($selected ? 'transparent' : ACCENT_BORDER)};
    box-shadow: ${({ $selected }) => ($selected ? `0 10px 32px ${ACCENT_GLOW}` : `var(--shadow-strong), 0 0 0 1px ${ACCENT_GLOW}`)};
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
