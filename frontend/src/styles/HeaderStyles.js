import styled from 'styled-components';

// Cabeçalho
export const HeaderContainer = styled.header`
display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #282c34;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
   height: 55px; 
`;

export const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
  }
`;

export const LogoTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: #61dafb;
    color: #282c34;
  }
`;

export const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;


export const LogoText = styled.span`
  font-weight: 500; /* Medium equivalente */
  margin-right: 5px;
`;

export const SubText = styled.span`
  font-size: 17px;
  color: #aaa;
  margin-top: 5px;

  @media (min-width: 768px) {
    margin-top: 0;
    margin-left: 10px;
  }
`;


export const Nav = styled.nav`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const NavItem = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: white;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;

  &:hover {
    background-color: #61dafb;
    color: #282c34;
  }
`;

export const Label = styled.div`
  font-size: 0.9rem;
  margin-left: 1rem;
  color: #61dafb;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #20232a;
  border-radius: 4px;
`;