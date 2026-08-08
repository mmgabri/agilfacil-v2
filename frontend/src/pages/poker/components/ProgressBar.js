import React from 'react';
import styled from 'styled-components';

const Progress = ({ roomData }) => {

    const groupedByVote = roomData.users.reduce((acc, user) => {
        if (!acc[user.vote]) {
            acc[user.vote] = [];
        }
        acc[user.vote].push(user);
        return acc;
    }, {});

    const usersWithVote0 = groupedByVote['0'] || [];
    const numberOfUsersWithVote0 = usersWithVote0.length;
    const percent = ((numberOfUsersWithVote0 / roomData.users.length) * 100).toFixed(0);
    const value = 100 - percent


    return (
        <ProgressContainer>
            <ProgressFill style={{ width: `${value}%` }}>
                {value > 12 && <span>{value}%</span>}
            </ProgressFill>
        </ProgressContainer>
    );
};

export default Progress;

const BORDER = 'rgba(255,255,255,0.07)';
const GREEN  = '#4ade80';

export const ProgressContainer = styled.div`
  width: 100%;
  max-width: 600px;
  height: 26px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${BORDER};
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto 20px;
`;

export const ProgressFill = styled.div`
  height: 100%;
  min-width: 0%;
  background: ${GREEN};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  box-sizing: border-box;
  color: #0a0a0d;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px 0 0 8px;
  transition: width 0.4s ease;
`;
