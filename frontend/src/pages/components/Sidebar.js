import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdSpaceDashboard, MdStyle, MdOutlineFeedback, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useAppTheme } from '../../context/ThemeContext';
import {
  SidebarContainer,
  NavItemButton,
  NavItemLabel,
  ActiveIndicator,
  SidebarSpacer,
  ThemeSwitchTrack,
  ThemeSwitchIcons,
  ThemeSwitchKnob,
} from '../../styles/SidebarStyles';

const NAV_ITEMS = [
  { icon: MdHome, label: 'Início', path: '/', activeMatch: '/' },
  { icon: MdSpaceDashboard, label: 'Boards', path: '/boards', activeMatch: '/board' },
  { icon: MdStyle, label: 'Poker', path: '/room/create', activeMatch: '/room' },
];

const Sidebar = ({ onSuggestions }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAppTheme();

  const isActive = (activeMatch) =>
    activeMatch === '/' ? location.pathname === '/' : location.pathname.startsWith(activeMatch);

  return (
    <SidebarContainer>
      {NAV_ITEMS.map(({ icon: Icon, label, path, activeMatch }) => {
        const active = isActive(activeMatch);
        return (
          <NavItemButton key={label} $active={active} title={label} onClick={() => navigate(path)}>
            {active && <ActiveIndicator />}
            <Icon size={17} />
            <NavItemLabel $active={active}>{label}</NavItemLabel>
          </NavItemButton>
        );
      })}

      <SidebarSpacer />

      {onSuggestions && (
        <NavItemButton title="Sugestões" onClick={onSuggestions}>
          <MdOutlineFeedback size={17} />
          <NavItemLabel>Sugestões</NavItemLabel>
        </NavItemButton>
      )}

      <ThemeSwitchTrack
        title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        onClick={toggleTheme}
      >
        <ThemeSwitchIcons>
          <MdDarkMode />
          <MdLightMode />
        </ThemeSwitchIcons>
        <ThemeSwitchKnob $theme={theme}>
          {theme === 'dark' ? <MdDarkMode /> : <MdLightMode />}
        </ThemeSwitchKnob>
      </ThemeSwitchTrack>
    </SidebarContainer>
  );
};

export default Sidebar;
