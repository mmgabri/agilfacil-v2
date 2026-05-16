import React from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { FaUsers } from 'react-icons/fa';
import { TbCards } from "react-icons/tb";
import { FaChartLine } from "react-icons/fa6";

const VotingResults = ({ roomData, cards }) => {

  const groupedByVote = roomData.users.reduce((acc, user) => {
    if (!acc[user.vote]) {
      acc[user.vote] = [];
    }
    acc[user.vote].push(user);
    return acc;
  }, {});

  const results = [];

  cards.forEach(card => {
    const usersWithVote = groupedByVote[card] || [];
    const numberOfUsersWithVote = usersWithVote.length;

    if (numberOfUsersWithVote !== 0) {
      if (card !== "?") {
        let result = { label: card, value: numberOfUsersWithVote, sumValue: card * numberOfUsersWithVote }
        results.push(result)
      } else {
        let result = { label: card, value: numberOfUsersWithVote, sumValue: 0 }
        results.push(result)
      }
    }

    results.sort((a, b) => b.value - a.value);
  });


  const averageVotes = () => {

    const numberOfUsersWithVoteInterrogacao = totalInterrogacao(results)

    const totalValue = results.reduce((accumulator, item) => accumulator + item.sumValue, 0);
    let totalVotation = (results.reduce((accumulator, item) => accumulator + item.value, 0)) - numberOfUsersWithVoteInterrogacao;

    if (totalValue > 0) {
      return (totalValue / totalVotation).toFixed(2)
    } else {
      return ""
    }
  }

  const totalInterrogacao = (results) => {

    const groupedByVote = roomData.users.reduce((acc, user) => {
      if (!acc[user.vote]) {
        acc[user.vote] = [];
      }
      acc[user.vote].push(user);
      return acc;
    }, {});


    const usersWithVote = groupedByVote["?"] || [];
    return usersWithVote.length;
  }

  return (
    <Draggable>
      <ModalContainer>
        <ModalContent>
          <ResultsContainer>
            <DetailsHeader>Média dos votos:</DetailsHeader>
            <ResultValueAverage>
              <FaChartLine size={17} />
              {averageVotes()}
            </ResultValueAverage>

            <DetailsHeader>Nota x Votação:</DetailsHeader>
            {results.map((result) => (
              <ResultItem key={result.label}>
                <ResultLabel>
                  <TbCards size={20} />
                  {result.label}
                </ResultLabel>
                <ResultValue>
                  <FaUsers size={18} />
                  {result.value}
                </ResultValue>
              </ResultItem>
            ))}
          </ResultsContainer>
        </ModalContent>
      </ModalContainer>
    </Draggable>
  );
};


const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.3rem;
  background: #1E3A5F;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0.5rem;
  border: 1px solid #ddd;
  max-width: 90%;
  box-sizing: border-box;
  flex: 1;
  margin-right: -15px;
`;

const DetailsHeader = styled.h2`
  margin-bottom: 0.rem;
  font-size: 1.0rem;
  color: #FFFFFF;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;


const ResultItem = styled.div`
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.4rem 0.4rem;
  margin: 0.25rem 0;
  justify-items: center; // Centraliza os itens horizontalmente no grid
  width: 80%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  transition: background-color 0.3s, transform 0.2s;

`;

const ResultLabel2 = styled.span`
  font-size: 0.8rem;
  color: #1a56db; // Azul mais escuro
  background-color: #e0e7ff;
  border: 2px solid #1a56db;
  padding: 0.5rem 1.1rem; 
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
  transition: all 0.2s ease;
`;

const ResultLabel = styled.span`
  font-size: 0.8rem;
  color: #1a56db; // Azul mais escuro
  background-color: #e0e7ff;
  border: 2px solid #1a56db;
  padding: 0.5rem 1.1rem; 
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; // Reduzido o gap entre os elementos
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
  transition: all 0.2s ease;
  min-width: 45px; // Reduzido o min-width
  width: fit-content;
`;

const ResultValue = styled.span`
  font-size: 0.8rem;
  color: #1a56db; // Azul mais escuro
  background-color: #e0e7ff;
  border: 2px solid #1a56db;

  padding: 0.5rem 1.1rem; 
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; // Reduzido o gap entre os elementos
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
  transition: all 0.2s ease;
  min-width: 45px; // Reduzido o min-width
  width: fit-content;
`;

const ResultValueAverage = styled.span`
  font-size: 0.9rem;
  color: #047857; 
  background-color: #d1fae5;
  border: 2px solid #047857;
  padding-right: 1rem;
  padding-left: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
  transition: all 0.2s ease;
`;

const ModalContainer = styled.div`
    position: fixed;
    right: 0;
    top: 35px;
    width: 300px;
    height: 500vh;
    background: transparent;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
    padding: 20px;
    z-index: 1000;
    overflow-y: auto;
    align-items: right;
    cursor: move;
`;

const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: right;
    background: transparent;
`;

export default VotingResults;