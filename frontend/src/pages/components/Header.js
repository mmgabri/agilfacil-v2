import React, { useState, useEffect, useRef } from 'react';
import { MdPersonAdd, MdLogin, MdLogout } from 'react-icons/md';
import { FaClock, FaPlay, FaStop, FaPlus } from 'react-icons/fa';
import { AiOutlineExport } from 'react-icons/ai';
import { LiaEyeSlashSolid, LiaEyeSolid } from 'react-icons/lia';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import favicon from '../../images/favicon.ico';
import ModalAddColumn from '../board/modals/ModalAddColumn';
import {
  HeaderContainer,
  LeftCluster,
  LogoGroup,
  LogoButton,
  LogoImage,
  LogoText,
  SubTextBadge,
  ContextChip,
  ContextText,
  ContextDot,
  NavGroup,
  NavButton,
  NavDivider,
  SignInButton,
  InviteButton,
  AvatarWrapper,
  AvatarButton,
  OnlineDot,
  AvatarMenu,
  AvatarMenuHeader,
  AvatarMenuName,
  AvatarMenuEmail,
  AvatarMenuSignOut,
  StatsMeta,
  OnlineGroup,
  Dim,
  Sep,
  PulseDot,
  CenterCluster,
  TimerBox,
  TimerIconWrapper,
  TimerLiveDot,
  TimerInputStyled,
  TimerBtn,
  BoardActionButton,
} from '../../styles/HeaderStyles';

const getInitials = (value) => {
  if (!value) return '';
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const tooltipStyle = { fontSize: '12px', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', zIndex: 1001 };

const Header = ({
  subText,
  badgeCount,
  userName,
  roomName,
  boardName,
  showInviteModal,
  showSuggestionsModal,
  goHome,
  goAbout,
  isUserLogged,
  signOut,
  signIn,
  boardControls,
}) => {
  const isPoker = subText === 'Planning Poker';
  const hasBoardContext = boardName !== undefined;
  const hasRoomContext = roomName !== undefined && userName !== undefined;
  const hasNavItems = showSuggestionsModal || showInviteModal || goAbout || !!boardControls;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [account, setAccount] = useState({ name: '', email: '' });
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const menuRef = useRef(null);

  // Busca nome/email do usuário logado para exibir no avatar — não depende do
  // UserContext (que só é populado em rotas protegidas), então funciona em
  // qualquer página que use este Header.
  useEffect(() => {
    if (!isUserLogged) {
      setAccount({ name: '', email: '' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const user = await getCurrentUser();
        const attrs = await fetchUserAttributes(user);
        if (!cancelled) setAccount({ name: attrs.name || '', email: attrs.email || '' });
      } catch {
        // sessão inválida — mantém avatar vazio
      }
    })();
    return () => { cancelled = true; };
  }, [isUserLogged]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = getInitials(account.name || account.email);

  return (
    <HeaderContainer>

      <LeftCluster>
        <LogoGroup>
          <LogoButton onClick={goHome}>
            <LogoImage src={favicon} alt="Logo" />
            <LogoText>AgilFacil</LogoText>
          </LogoButton>
          {subText && (
            <SubTextBadge $variant={isPoker ? 'poker' : 'board'}>
              {subText}{typeof badgeCount === 'number' && ` · ${badgeCount}`}
            </SubTextBadge>
          )}
          {hasBoardContext && (
            <SubTextBadge $variant="board">{boardName}</SubTextBadge>
          )}
        </LogoGroup>

        {hasRoomContext && (
          <ContextChip>
            <ContextText>👤 {userName}</ContextText>
            <ContextDot>·</ContextDot>
            <ContextText>🎯 {roomName}</ContextText>
          </ContextChip>
        )}

        {boardControls && (
          <StatsMeta>
            <OnlineGroup title="Participantes no board">
              <PulseDot />
              <span>
                <b>{boardControls.countUserLogged}</b> online
                <Dim> ({boardControls.countUserWithCard} com card)</Dim>
              </span>
            </OnlineGroup>
            <Sep>·</Sep>
            <span title="Total de cards no board"><b>{boardControls.countCard}</b> cards</span>
          </StatsMeta>
        )}
      </LeftCluster>

      {boardControls && (
        <CenterCluster>
          <TimerBox $running={boardControls.isRunningTimer} $alarm={boardControls.hasTimeEnded}>
            <TimerIconWrapper>
              <FaClock size={11} style={{ color: boardControls.isRunningTimer ? '#a996ff' : 'rgba(245,245,247,0.42)' }} />
              {boardControls.isRunningTimer && <TimerLiveDot />}
            </TimerIconWrapper>
            <TimerInputStyled
              mask="99:99"
              maskChar="_"
              value={boardControls.timeInput}
              onChange={boardControls.handleInputTimerChange}
              disabled={boardControls.isRunningTimer}
              placeholder="MM:SS"
              $isInvalid={boardControls.isInvalidFormat}
            />
            {!boardControls.isRunningTimer ? (
              <TimerBtn onClick={boardControls.handleStartTimer}><FaPlay size={8} /></TimerBtn>
            ) : (
              <TimerBtn $running onClick={boardControls.handlePauseTimer}><FaStop size={8} /></TimerBtn>
            )}
          </TimerBox>
        </CenterCluster>
      )}

      <NavGroup>
        {boardControls && (
          <>
            <ModalAddColumn
              isOpen={isAddColumnOpen}
              onClose={() => setIsAddColumnOpen(false)}
              onSubmit={(columnName) => boardControls.handleAddColumn(columnName)}
            />

            {(!boardControls.isObfuscatedBoardLevel && !boardControls.isObfuscatedCardLevel) && (
              <>
                <BoardActionButton
                  data-tooltip-id="tooltip-exportar-board"
                  data-tooltip-content="Exportar board"
                  onClick={() => boardControls.handleExportBoard()}
                >
                  <AiOutlineExport size={16} />
                </BoardActionButton>
                <Tooltip id="tooltip-exportar-board" style={tooltipStyle} />
              </>
            )}
            <BoardActionButton
              data-tooltip-id="tooltip-incluir-coluna"
              data-tooltip-content="Incluir coluna"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <FaPlus size={13} />
            </BoardActionButton>
            <Tooltip id="tooltip-incluir-coluna" style={tooltipStyle} />
            {boardControls.isBoardCreator && (
              boardControls.isObfuscatedBoardLevel ? (
                <>
                  <BoardActionButton
                    $active
                    data-tooltip-id="tooltip-revelar-cards"
                    data-tooltip-content="Revelar cards"
                    onClick={() => boardControls.handleSetIsObfuscatedBoardLevel(false)}
                  >
                    <LiaEyeSolid size={16} />
                  </BoardActionButton>
                  <Tooltip id="tooltip-revelar-cards" style={tooltipStyle} />
                </>
              ) : (
                <>
                  <BoardActionButton
                    data-tooltip-id="tooltip-ocultar-cards"
                    data-tooltip-content="Ocultar cards"
                    onClick={() => boardControls.handleSetIsObfuscatedBoardLevel(true)}
                  >
                    <LiaEyeSlashSolid size={16} />
                  </BoardActionButton>
                  <Tooltip id="tooltip-ocultar-cards" style={tooltipStyle} />
                </>
              )
            )}
          </>
        )}

        {showSuggestionsModal && (
          <NavButton onClick={showSuggestionsModal}>Sugestões</NavButton>
        )}
        {showInviteModal && (
          <InviteButton onClick={showInviteModal}>
            <MdPersonAdd size={15} />
            Convidar
          </InviteButton>
        )}
        {goAbout && (
          <NavButton onClick={goAbout}>Sobre</NavButton>
        )}

        {isUserLogged !== undefined && (
          <>
            {hasNavItems && <NavDivider />}
            {isUserLogged ? (
              <AvatarWrapper ref={menuRef}>
                <AvatarButton $open={showUserMenu} onClick={() => setShowUserMenu(v => !v)}>
                  {initials}
                  <OnlineDot />
                </AvatarButton>

                {showUserMenu && (
                  <AvatarMenu>
                    <AvatarMenuHeader>
                      <AvatarMenuName>{account.name || 'Usuário'}</AvatarMenuName>
                      {account.email && <AvatarMenuEmail>{account.email}</AvatarMenuEmail>}
                    </AvatarMenuHeader>
                    <AvatarMenuSignOut onClick={() => { setShowUserMenu(false); signOut(); }}>
                      <MdLogout size={15} />
                      Sair
                    </AvatarMenuSignOut>
                  </AvatarMenu>
                )}
              </AvatarWrapper>
            ) : (
              <SignInButton onClick={signIn}>
                <MdLogin size={14} />
                Entrar
              </SignInButton>
            )}
          </>
        )}
      </NavGroup>

    </HeaderContainer>
  );
};

export default Header;
