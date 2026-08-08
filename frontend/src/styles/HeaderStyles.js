import styled, { css, keyframes } from 'styled-components';
import InputMask from 'react-input-mask';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do BoardPageMock.js / BoardListPageMock.js.

const ACCENT       = '#8b7cf6';
const ACCENT_SOFT  = '#a996ff';
const ACCENT_GLOW  = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD  = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';
const RED   = '#fb7185';
const GREEN = '#34d399';

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: rgba(13, 15, 22, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
`;

export const LeftCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

export const LogoButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: ${ACCENT_GLOW};
  }
`;

export const LogoImage = styled.img`
  width: 24px;
  height: 24px;
  filter: hue-rotate(30deg) saturate(1.2);
`;

export const LogoText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
  white-space: nowrap;
`;

export const SubTextBadge = styled.span`
  font-size: 12px;
  font-weight: 400;
  padding: 4px 15px;
  border-radius: 20px;
  letter-spacing: 0.3px;
  white-space: nowrap;
  background: ${ACCENT_GLOW};
  color: ${ACCENT_SOFT};
  border: 1px solid rgba(139, 124, 246, 0.3);
`;

export const ContextChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 280px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ContextText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ContextDot = styled.span`
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
`;

export const NavGroup = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13.5px;
  font-weight: 450;
  padding: 6px 10px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;

  &:hover {
    color: ${ACCENT_SOFT};
    background: ${ACCENT_GLOW};
  }
`;

export const NavDivider = styled.div`
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 4px;
  flex-shrink: 0;
`;

export const SignInButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(139, 124, 246, 0.20);
  border: 1.5px solid rgba(139, 124, 246, 0.35);
  cursor: pointer;
  color: ${ACCENT_SOFT};
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
  margin-left: 4px;

  &:hover {
    background: rgba(139, 124, 246, 0.28);
    border-color: rgba(139, 124, 246, 0.5);
  }
`;

export const InviteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  height: 37px;
  padding: 0 16px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.035);
  color: rgba(245, 245, 247, 0.62);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  margin: 0 4px;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${ACCENT_GLOW};
    border-color: ${ACCENT}50;
    color: ${ACCENT_SOFT};
  }
`;

export const AvatarWrapper = styled.div`
  position: relative;
  margin-left: 4px;
`;

export const AvatarButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(139, 124, 246, 0.20);
  border: 1.5px solid ${({ $open }) => ($open ? ACCENT_SOFT : `${ACCENT}55`)};
  color: ${ACCENT_SOFT};
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  transition: border-color 0.18s ease;
`;

export const OnlineDot = styled.span`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${GREEN};
  border: 1.5px solid #0d0f16;
`;

export const AvatarMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  background: #141418;
  border: 1px solid rgba(255, 255, 255, 0.14);
  min-width: 180px;
  z-index: 50;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
`;

export const AvatarMenuHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

export const AvatarMenuName = styled.div`
  color: #fff;
  font-size: 13px;
  font-weight: 600;
`;

export const AvatarMenuEmail = styled.div`
  color: rgba(255, 255, 255, 0.42);
  font-size: 11px;
  margin-top: 2px;
`;

export const AvatarMenuSignOut = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${RED};
  font-size: 13px;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

// ─── Controles de board (stats, timer, ações) — mesclados no header ───────────

export const StatsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: rgba(245, 245, 247, 0.62);
  flex-shrink: 0;

  b {
    color: #fff;
    font-weight: 700;
  }
`;

export const OnlineGroup = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const Dim = styled.span`
  color: rgba(245, 245, 247, 0.42);
  font-weight: 400;
`;

export const Sep = styled.span`
  color: rgba(245, 245, 247, 0.42);
`;

export const PulseDot = styled.span`
  position: relative;
  display: inline-flex;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${GREEN};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: ${GREEN};
    opacity: 0.75;
    animation: header-pulse 1.6s ease-out infinite;
  }

  @keyframes header-pulse {
    0% { transform: scale(1); opacity: 0.75; }
    100% { transform: scale(2.4); opacity: 0; }
  }
`;

const timerAlarmPulse = keyframes`
  0%, 100% { background: rgba(255, 255, 255, 0.035); box-shadow: none; }
  50% { background: rgba(251, 113, 133, 0.25); box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.25); }
`;

export const CenterCluster = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const timerLivePulse = keyframes`
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.6); }
`;

export const TimerBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 6px 14px;
  border-radius: 24px;
  background: ${({ $running }) => ($running ? 'rgba(139,124,246,0.10)' : 'rgba(255,255,255,0.035)')};
  border: 1px solid ${({ $running }) => ($running ? 'rgba(139,124,246,0.4)' : 'rgba(255,255,255,0.08)')};
  box-shadow: ${({ $running }) => ($running ? `0 4px 20px ${ACCENT_GLOW}` : 'none')};
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  ${({ $alarm }) => $alarm && css`
    animation: ${timerAlarmPulse} 0.9s ease-in-out 4;
  `}
`;

export const TimerIconWrapper = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const TimerLiveDot = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${ACCENT_SOFT};
  animation: ${timerLivePulse} 1.4s ease-in-out infinite;
`;

export const TimerInputStyled = styled(InputMask)`
  width: 60px;
  background: none;
  border: none;
  outline: none;
  text-align: center;
  font-family: 'SF Mono', 'Roboto Mono', ui-monospace, monospace;
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  color: ${({ $isInvalid }) => ($isInvalid ? RED : '#f5f5f7')};

  &:disabled {
    color: #f5f5f7;
    opacity: 0.95;
  }

  &::placeholder {
    color: rgba(245, 245, 247, 0.3);
  }
`;

export const TimerBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  background: ${({ $running }) => ($running ? 'rgba(251,113,133,0.18)' : ACCENT_GRAD)};
  color: ${({ $running }) => ($running ? RED : '#0a0a0d')};
  box-shadow: ${({ $running }) => ($running ? 'none' : `0 3px 12px ${ACCENT_GLOW}`)};
  transition: transform 0.12s ease, background 0.15s ease;

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.96);
  }
`;

export const BoardActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 37px;
  height: 37px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? `${ACCENT}50` : 'rgba(255,255,255,0.07)')};
  background: ${({ $active }) => ($active ? ACCENT_GLOW : 'rgba(255,255,255,0.035)')};
  color: ${({ $active }) => ($active ? ACCENT_SOFT : 'rgba(245,245,247,0.62)')};
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: ${ACCENT_GLOW};
    border-color: ${ACCENT}50;
    color: ${ACCENT_SOFT};
  }
`;
