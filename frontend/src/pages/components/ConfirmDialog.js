import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { MdWarningAmber } from 'react-icons/md';

// Substitui window.confirm() por um modal no padrão visual do app.
// Uso: const ok = await confirmDialog("Confirma exclusão do Card?");
//      if (!ok) return;
// Aceita opções: { title, confirmLabel, cancelLabel, tone: 'danger' | 'default' }

let showHandler = null;

export const confirmDialog = (message, options = {}) => {
  return new Promise((resolve) => {
    if (!showHandler) {
      // Fallback defensivo — ConfirmDialogHost não montado ainda.
      resolve(window.confirm(message));
      return;
    }
    showHandler({ message, ...options, resolve });
  });
};

const ConfirmDialogHost = () => {
  const [request, setRequest] = useState(null);

  useEffect(() => {
    showHandler = (req) => setRequest(req);
    return () => { showHandler = null; };
  }, []);

  useEffect(() => {
    if (!request) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handle(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const handle = (result) => {
    request?.resolve(result);
    setRequest(null);
  };

  if (!request) return null;

  const {
    message,
    title = 'Confirmar ação',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    tone = 'danger',
  } = request;

  return createPortal(
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) handle(false); }}>
      <Dialog>
        <IconBadge $tone={tone}><MdWarningAmber size={22} /></IconBadge>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <Actions>
          <CancelBtn onClick={() => handle(false)}>{cancelLabel}</CancelBtn>
          <ConfirmBtn $tone={tone} onClick={() => handle(true)} autoFocus>{confirmLabel}</ConfirmBtn>
        </Actions>
      </Dialog>
    </Overlay>,
    document.body
  );
};

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────

const TEXT          = '#f5f5f7';
const MUTED2        = 'rgba(245,245,247,0.62)';
const BORDER_STRONG = 'rgba(255,255,255,0.14)';
const ACCENT        = '#8b7cf6';
const ACCENT_GLOW   = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD   = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';
const RED           = '#fb7185';
const RED_GLOW      = 'rgba(251,113,133,0.18)';
const RED_GRAD      = 'linear-gradient(135deg, #fb7185 0%, #e35d72 100%)';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
`;

const Dialog = styled.div`
  background: #141418;
  border: 1px solid ${BORDER_STRONG};
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
  padding: 28px 28px 24px;
  border-radius: 20px;
  width: 360px;
  max-width: 90%;
  text-align: center;
`;

const IconBadge = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $tone }) => ($tone === 'danger' ? RED_GLOW : ACCENT_GLOW)};
  border: 1.5px solid ${({ $tone }) => ($tone === 'danger' ? RED : ACCENT)}55;
  svg { color: ${({ $tone }) => ($tone === 'danger' ? RED : ACCENT)}; }
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${TEXT};
  margin: 0 0 8px;
`;

const Message = styled.p`
  font-size: 13.5px;
  line-height: 1.5;
  color: ${MUTED2};
  margin: 0 0 24px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 11px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.035);
  color: ${MUTED2};
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: ${TEXT};
  }
`;

const ConfirmBtn = styled.button`
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: ${({ $tone }) => ($tone === 'danger' ? RED_GRAD : ACCENT_GRAD)};
  color: #0a0a0d;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 18px ${({ $tone }) => ($tone === 'danger' ? RED_GLOW : ACCENT_GLOW)};
  transition: filter 0.15s ease, transform 0.1s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
`;

export default ConfirmDialogHost;
