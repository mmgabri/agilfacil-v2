import React from 'react';
import styled from 'styled-components';
import { FaUserCheck, FaUserClock } from 'react-icons/fa';

const Users = ({ roomData }) => {
  const isHidden = roomData.status === 'VOTACAO_EM_ANDAMENTO' || roomData.status === 'VOTACAO_ENCERRADA';

  return (
    <UserList>
      {roomData.users.map((user, index) => {
        const hasVoted = user.vote != 0;
        return (
          <UserItem key={index} $voted={hasVoted}>
            <UserName>{user.nickName}</UserName>
            {hasVoted ? <FaUserCheck size={28} /> : <FaUserClock size={28} />}
            <VoteBadge $filled={hasVoted && !isHidden}>
              {hasVoted && !isHidden ? user.vote : ''}
            </VoteBadge>
          </UserItem>
        );
      })}
    </UserList>
  );
};

const TEXT   = '#f5f5f7';
const MUTED  = 'rgba(245,245,247,0.42)';
const BORDER = 'rgba(255,255,255,0.07)';
const ACCENT_SOFT = '#a996ff';
const ACCENT_GLOW = 'rgba(139,124,246,0.18)';
const GREEN  = '#4ade80';

const UserList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  padding: 8px 0 24px;
`;

const UserItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 14px;
  width: 130px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid ${({ $voted }) => ($voted ? `${ACCENT_SOFT}40` : BORDER)};
  border-radius: 16px;
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  svg {
    color: ${({ $voted }) => ($voted ? GREEN : MUTED)};
  }

  ${({ $voted }) => $voted && `box-shadow: 0 0 0 1px ${ACCENT_GLOW};`}
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 13px;
  color: ${TEXT};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const VoteBadge = styled.div`
  min-width: 36px;
  height: 30px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ $filled }) => ($filled ? '#0a0a0d' : 'transparent')};
  background: ${({ $filled }) => ($filled ? ACCENT_SOFT : 'rgba(255,255,255,0.04)')};
  border: 1px solid ${({ $filled }) => ($filled ? 'transparent' : BORDER)};
`;

export default Users;
