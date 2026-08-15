import styled from 'styled-components';

// ─── Design tokens ──────────────────────────────────────────────────────────
// As cores vêm das variáveis CSS de src/index.css (tema dark/light).

const TEXT   = 'var(--text)';
const MUTED  = 'var(--muted)';
const MUTED2 = 'var(--muted2)';
const BORDER = 'var(--border)';
const ACCENT       = 'var(--accent)';
const ACCENT_GLOW  = 'var(--accent-glow)';
const ACCENT_GRAD  = 'var(--accent-grad)';

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
  background: var(--surface);
  color: ${TEXT};
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: ${MUTED};
  }

  &:focus {
    border-color: color-mix(in srgb, ${ACCENT} 70%, transparent);
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
  background: var(--surface);
  color: ${TEXT};
  outline: none;
  resize: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: ${MUTED};
  }

  &:focus {
    border-color: color-mix(in srgb, ${ACCENT} 70%, transparent);
    box-shadow: 0 0 0 3px ${ACCENT_GLOW};
  }
`;

export const SubmitButton = styled.button`
  display: inline-block;
  width: 100%;
  padding: 11px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--on-accent);
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
