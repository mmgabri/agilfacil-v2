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

const TEXT          = 'var(--text)';
const MUTED2        = 'var(--muted2)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT        = 'var(--accent)';
const ACCENT_GLOW   = 'var(--accent-glow)';
const ACCENT_GRAD   = 'var(--accent-grad)';
const RED           = 'var(--red)';
const RED_GLOW      = 'color-mix(in srgb, var(--red) 18%, transparent)';
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
  background: var(--panel);
  border: 1px solid ${BORDER_STRONG};
  box-shadow: var(--shadow-strong);
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
  border: 1.5px solid color-mix(in srgb, ${({ $tone }) => ($tone === 'danger' ? RED : ACCENT)} 55%, transparent);
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
  border: 1px solid var(--border);
  background: var(--surface);
  color: ${MUTED2};
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--surface-hover);
    color: ${TEXT};
  }
`;

const ConfirmBtn = styled.button`
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: ${({ $tone }) => ($tone === 'danger' ? RED_GRAD : ACCENT_GRAD)};
  color: var(--on-accent);
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
