import React from 'react';
import styled from 'styled-components';
import { FaCircle } from 'react-icons/fa';

const STATUS_META = {
    NOVA_VOTACAO:        { label: 'Aguardando liberação da votação', tone: 'idle' },
    VOTACAO_EM_ANDAMENTO: { label: 'Votação em andamento',           tone: 'live' },
    VOTACAO_FINALIZADA:  { label: 'Votação finalizada',              tone: 'done' },
    VOTACAO_ENCERRADA:   { label: 'Aguardando nova votação',         tone: 'idle' },
};

const ACTION_LABEL = {
    NOVA_VOTACAO: 'Liberar Votação',
    VOTACAO_EM_ANDAMENTO: 'Finalizar Votação',
    VOTACAO_FINALIZADA: 'Encerrar Votação',
    VOTACAO_ENCERRADA: 'Nova Votação',
};

const NEXT_STATUS = {
    NOVA_VOTACAO: 'VOTACAO_EM_ANDAMENTO',
    VOTACAO_EM_ANDAMENTO: 'VOTACAO_FINALIZADA',
    VOTACAO_FINALIZADA: 'VOTACAO_ENCERRADA',
    VOTACAO_ENCERRADA: 'VOTACAO_EM_ANDAMENTO',
};

const StatusSection = ({ roomData, isRoomCreator, handlerupdateStatusRoom }) => {
    const meta = STATUS_META[roomData.status];
    if (!meta) return null;

    return (
        <Wrapper>
            <StatusPill $tone={meta.tone}>
                <FaCircle size={7} />
                {meta.label}
            </StatusPill>
            {isRoomCreator && (
                <ActionBtn onClick={() => handlerupdateStatusRoom(NEXT_STATUS[roomData.status])}>
                    {ACTION_LABEL[roomData.status]}
                </ActionBtn>
            )}
        </Wrapper>
    );
};

const TEXT        = '#f5f5f7';
const MUTED2       = 'rgba(245,245,247,0.62)';
const BORDER       = 'rgba(255,255,255,0.07)';
const ACCENT       = '#8b7cf6';
const ACCENT_GLOW  = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD  = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';
const GREEN        = '#4ade80';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 20px 0 24px;
`;

const StatusPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${BORDER};
  color: ${TEXT};
  font-size: 13px;
  font-weight: 600;

  svg {
    color: ${({ $tone }) => ($tone === 'live' ? GREEN : $tone === 'done' ? ACCENT : MUTED2)};
    ${({ $tone }) => $tone === 'live' && 'filter: drop-shadow(0 0 4px rgba(74,222,128,0.7));'}
  }
`;

const ActionBtn = styled.button`
  padding: 9px 18px;
  border: none;
  border-radius: 10px;
  background: ${ACCENT_GRAD};
  color: #0a0a0d;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 18px ${ACCENT_GLOW};
  transition: filter 0.15s ease, transform 0.1s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

export default StatusSection;
