import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdSpaceDashboard, MdStyle, MdSettings, MdOutlineFeedback } from 'react-icons/md';
import {
  SidebarContainer,
  NavItemButton,
  NavItemLabel,
  ActiveIndicator,
  SidebarSpacer,
} from '../../styles/SidebarStyles';

const NAV_ITEMS = [
  { icon: MdHome, label: 'Início', path: '/', activeMatch: '/' },
  { icon: MdSpaceDashboard, label: 'Boards', path: '/boards', activeMatch: '/board' },
  { icon: MdStyle, label: 'Poker', path: '/room/create', activeMatch: '/room' },
];

const Sidebar = ({ onSuggestions }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

      <NavItemButton title="Configurações" disabled>
        <MdSettings size={17} />
        <NavItemLabel>Config</NavItemLabel>
      </NavItemButton>
    </SidebarContainer>
  );
};

export default Sidebar;
