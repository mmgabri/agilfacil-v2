import React from 'react';
import { HeaderContainer, LogoContainer, LogoTop, LogoText, LogoImage, SubText, Nav, NavItem, Label } from '../../styles/HeaderStyles';
import favicon from '../../images/favicon.ico';

const Header = ({ subText, userName, roomName, boardName, showInviteModal, showSuggestionsModal, goHome, goAbout, isUserLogged, signOut, signIn, }) => {
  return (
    <HeaderContainer>
      <LogoContainer>
        <LogoTop onClick={goHome}>
          <LogoImage src={favicon} alt="Logo" />
          <LogoText>AgilFacil</LogoText>
        </LogoTop>
        {subText !== undefined && <SubText>{subText}</SubText>}
      </LogoContainer>
      {boardName !== undefined && <Label>{boardName}</Label>}
      {(roomName !== undefined && userName !== undefined) &&
        <div>
          <Label>Apelido: {userName}</Label>
          <Label>Sala: {roomName}</Label>
        </div>}

      <Nav>
        {showSuggestionsModal !== undefined && <NavItem onClick={showSuggestionsModal}>Sugestões</NavItem>}
        {showInviteModal !== undefined && <NavItem onClick={showInviteModal}>Convidar</NavItem>}
        {goAbout !== undefined && <NavItem onClick={goAbout}>Sobre</NavItem>}

        {isUserLogged !== undefined &&
          <>
            {isUserLogged ?
              <NavItem onClick={signOut}>Sign out</NavItem>
              :
              <NavItem onClick={signIn}>Sign in</NavItem>
            }
          </>}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;