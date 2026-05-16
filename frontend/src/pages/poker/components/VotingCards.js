import { React, useState } from 'react';
import styled from 'styled-components';

const VotingCards = ({ onCardClick, nota, cards }) => {

    return (
        <Container>
            <CardList>
                {cards.map((card, index) => (
                    card === nota
                        ? <CardSelected key={index} onClick={() => onCardClick(card)}>
                            {card}
                        </CardSelected>
                        : <Card key={index} onClick={() => onCardClick(card)}>
                            {card}
                        </Card>
                ))}
            </CardList>
        </Container>
    );
};


export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #1C1C1C;
`;

export const Card = styled.div`
  background-color: #C0C0C0;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 600px) {
    width: 80px;
    height: 80px;
    font-size: 1.2rem;
  }
`;

export const CardSelected = styled.div`
  background-color: #4caf50;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 600px) {
    width: 80px;
    height: 80px;
    font-size: 1.2rem;
  }
`;


export const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #1C1C1C;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  margin: 1rem auto;

  @media (max-width: 600px) {
    max-width: 95vw;
    padding: 1rem;
  }
`;


export const Title = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: #C0C0C0;
  text-align: center;
`;

export default VotingCards;
