import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { FaUsers } from 'react-icons/fa';
import { TbCards } from "react-icons/tb";
import { FaChartLine } from "react-icons/fa6";
import { MdDragIndicator } from "react-icons/md";

const VotingResults = ({ roomData, cards }) => {
  const nodeRef = useRef(null);

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
    <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="body" defaultPosition={{ x: 0, y: 0 }}>
      <FloatingPanel ref={nodeRef}>
        <DragHandle className="drag-handle">
          <MdDragIndicator size={18} />
          <span>Média dos votos</span>
          <MdDragIndicator size={18} />
        </DragHandle>

        <PanelBody>
          <ResultValueAverage>
            <FaChartLine size={15} />
            {averageVotes() || '—'}
          </ResultValueAverage>

          <DetailsHeader>Nota × Votação</DetailsHeader>
          <ResultList>
            {results.map((result) => (
              <ResultItem key={result.label}>
                <ResultLabel>
                  <TbCards size={16} />
                  {result.label}
                </ResultLabel>
                <ResultValue>
                  <FaUsers size={13} />
                  {result.value}
                </ResultValue>
              </ResultItem>
            ))}
          </ResultList>
        </PanelBody>
      </FloatingPanel>
    </Draggable>
  );
};

const TEXT          = '#f5f5f7';
const MUTED2        = 'rgba(245,245,247,0.62)';
const BORDER        = 'rgba(255,255,255,0.07)';
const BORDER_STRONG = 'rgba(255,255,255,0.14)';
const ACCENT_SOFT   = '#a996ff';
const ACCENT_GLOW   = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD   = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';

const FloatingPanel = styled.div`
  position: fixed;
  top: 88px;
  right: 24px;
  z-index: 500;
  width: 260px;
  background: #141418;
  border: 1px solid ${BORDER_STRONG};
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid ${BORDER};
  color: ${MUTED2};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  cursor: grab;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;

  svg {
    color: ${MUTED2};
    flex-shrink: 0;
  }

  &:hover {
    background: ${ACCENT_GLOW};
    color: ${ACCENT_SOFT};
    svg { color: ${ACCENT_SOFT}; }
  }

  &:active {
    cursor: grabbing;
  }
`;

const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px 18px 18px;
`;

const DetailsHeader = styled.h2`
  font-size: 12px;
  color: ${MUTED2};
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin: 14px 0 10px;
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${BORDER};
  border-radius: 10px;
`;

const ResultLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: ${TEXT};
`;

const ResultValue = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${ACCENT_SOFT};
`;

const ResultValueAverage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${ACCENT_GRAD};
  color: #0a0a0d;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 18px ${ACCENT_GLOW};
`;

export default VotingResults;
