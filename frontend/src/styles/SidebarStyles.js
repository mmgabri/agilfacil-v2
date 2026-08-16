import styled from 'styled-components';

export const SidebarContainer = styled.aside`
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  width: 56px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  z-index: 10;
`;

export const NavItemButton = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: ${({ $active }) => ($active ? 'var(--accent-soft)' : 'var(--muted2)')};
  transition: color 0.18s ease, background 0.18s ease;

  &:hover {
    background: var(--surface-hover);
  }

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
  left: -11px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  border-radius: 0 4px 4px 0;
  background: var(--accent-grad);
`;

export const SidebarSpacer = styled.div`
  flex: 1;
`;

export const ThemeSwitchTrack = styled.button`
  position: relative;
  width: 50px;
  height: 28px;
  margin: 8px 0 4px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface-hover);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: border-color 0.18s ease;

  &:hover {
    border-color: var(--accent-border);
  }
`;

export const ThemeSwitchIcons = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  color: var(--muted2);
  pointer-events: none;

  svg {
    font-size: 13px;
  }
`;

export const ThemeSwitchKnob = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $theme }) => ($theme === 'light' ? '25px' : '3px')};
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-grad);
  color: var(--on-accent);
  box-shadow: var(--shadow-soft);
  transition: left 0.2s ease;

  svg {
    font-size: 13px;
  }
`;
