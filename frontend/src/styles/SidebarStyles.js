import styled from 'styled-components';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / BoardPageMock.js / BoardListPageMock.js.

const ACCENT_SOFT = '#a996ff';
const ACCENT_GLOW = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';

export const SidebarContainer = styled.aside`
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  width: 64px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 0;
  background: rgba(255, 255, 255, 0.025);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  z-index: 10;
`;

export const NavItemButton = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  background: ${({ $active }) => ($active ? ACCENT_GLOW : 'transparent')};
  color: ${({ $active }) => ($active ? ACCENT_SOFT : 'rgba(245,245,247,0.42)')};
  transition: background 0.18s ease, color 0.18s ease;

  &:disabled {
    cursor: default;
  }
`;

export const NavItemLabel = styled.span`
  font-size: 9px;
  letter-spacing: 0.3px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
`;

export const ActiveIndicator = styled.span`
  position: absolute;
  left: -13px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  border-radius: 0 4px 4px 0;
  background: ${ACCENT_GRAD};
`;

export const SidebarSpacer = styled.div`
  flex: 1;
`;
