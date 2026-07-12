import styled from 'styled-components';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / BoardListPage.js / BoardPageMock.js.

const TEXT   = '#f5f5f7';
const MUTED  = 'rgba(245,245,247,0.42)';
const MUTED2 = 'rgba(245,245,247,0.62)';
const BORDER = 'rgba(255,255,255,0.07)';
const ACCENT       = '#8b7cf6';
const ACCENT_GLOW  = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD  = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';

export const Title = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${TEXT};
  text-align: center;
  margin: 0 0 20px;
`;

export const TitleAddCard = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${TEXT};
  text-align: center;
  margin: 0 0 20px;
`;

export const FormContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 4px;
  color: ${TEXT};
`;

export const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
    color: ${MUTED2};
    font-size: 12px;
  }
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid ${BORDER};
  border-radius: 10px;
  font-size: 13.5px;
  background: rgba(255, 255, 255, 0.045);
  color: ${TEXT};
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: ${MUTED};
  }

  &:focus {
    border-color: ${ACCENT}70;
    box-shadow: 0 0 0 3px ${ACCENT_GLOW};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid ${BORDER};
  border-radius: 10px;
  font-size: 13.5px;
  background: rgba(255, 255, 255, 0.045);
  color: ${TEXT};
  outline: none;
  resize: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: ${MUTED};
  }

  &:focus {
    border-color: ${ACCENT}70;
    box-shadow: 0 0 0 3px ${ACCENT_GLOW};
  }
`;

export const SubmitButton = styled.button`
  display: inline-block;
  width: 100%;
  padding: 11px;
  font-size: 13.5px;
  font-weight: 700;
  color: #0a0a0d;
  background: ${ACCENT_GRAD};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 4px;
  box-shadow: 0 4px 18px ${ACCENT_GLOW};
  transition: filter 0.15s ease, transform 0.1s ease;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
 `;
