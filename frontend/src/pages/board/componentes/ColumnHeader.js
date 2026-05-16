import React, { useState, useEffect } from 'react';
import styled from "@emotion/styled";
import { Dropdown } from 'react-bootstrap';
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { v4 as uuidv4 } from 'uuid';
import { MdMoreVert, MdEdit, MdCheck, MdDeblur } from 'react-icons/md';
import { FaNoteSticky } from "react-icons/fa6";
import { IoIosAddCircleOutline } from 'react-icons/io';
import { FaRegTrashAlt, FaPalette } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { LiaEyeSlashSolid, LiaEyeSolid } from "react-icons/lia";
import './../../../styles/board.css';
import ModalAddCard from '../modals/ModalAddCard';

const ColumnHeader = ({ columnTitle, countCards, onAddCard, index, onUpdateTitleColumn, onDeleteColumn, onDeleteAllCard, onUpdatecolorCards, userLoggedData, isObfuscatedColumnLevel, handleSetIsObfuscatedColumnLevel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(columnTitle || 'Título da Coluna');
  const [isModalOpen, setModalOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#F0E68C');
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setTitle(columnTitle);
  }, [columnTitle]);

  const colorList = [
    { name: 'Yellow1', color: '#F0E68C' },
    { name: 'Pink', color: '#D8968C' },
    { name: 'Green', color: '#98FB98' },
    { name: 'Blue', color: '#BFEFFF' },
    { name: 'Yellow2', color: '#DDBB66' }
  ];

  const getDropdownItemStyle = (index) => ({
    fontSize: '12px',
    color: hoverIndex === index ? '#ffffff' : '#c0c0c0',
    backgroundColor: hoverIndex === index ? '#404040' : '#2f2f2f',
    borderRadius: '5px',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s, color 0.3s',
    cursor: 'pointer',
  });

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSaveTitle = () => {
    setIsEditing(false);
    onUpdateTitleColumn(title, index)
  };

  const handleDeleteColumn = () => {
    onDeleteColumn(index)
  };

  const handleDeleteAllCards = () => {
    onDeleteAllCard(index)
  };

  const onSetIsObfuscatedColumnLevel = (value) => {
    handleSetIsObfuscatedColumnLevel(value, index)
  };

  const handleModalAddCardSubmit = (value) => {

    const newCard = {
      id: uuidv4(),
      content: value,
      createdBy: "",
      userId: userLoggedData.userId,
      likeCount: 0
    }
    onAddCard(newCard, index)
  };


  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setShowColorOptions(false);
    setIsDropdownOpen(false);
    onUpdatecolorCards(color, index)
  };


  return (
    <ColumnHeaderContainer>
      <ModalAddCard
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalAddCardSubmit}
        title={title}
      />

      <TitleContainer>
        <Title>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleSaveTitle}
              autoFocus
            />
          ) : (
            title
          )}
        </Title>

        <Dropdown
          align="end"
          show={isDropdownOpen} // Controle explícito do estado de abertura do menu
          onToggle={(isOpen) => setIsDropdownOpen(isOpen)} // Atualiza o estado ao abrir/fechar o menu
        >
          <Dropdown.Toggle
            variant="link"
            id="dropdown-custom-components"
            as="div"
            style={dropdownToggleStyle}
          >
            <IconContainer>
              {isEditing ? <StyledMdCheck /> : <StyledMdMoreVert />}
            </IconContainer>
          </Dropdown.Toggle>

          <Dropdown.Menu style={dropdownMenuStyle}>
            <Dropdown.Item
              onClick={() => setIsEditing(true)}
              style={getDropdownItemStyle(0)}
              onMouseEnter={() => setHoverIndex(0)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <MdEdit style={iconMarginStyle} />
              Editar Título
            </Dropdown.Item>
            <Dropdown.Item
              onClick={handleDeleteColumn}
              style={getDropdownItemStyle(1)}
              onMouseEnter={() => setHoverIndex(1)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <FaRegTrashAlt style={iconMarginStyle} />
              Excluir coluna
            </Dropdown.Item>
            <Dropdown.Item
              onClick={handleDeleteAllCards}
              style={getDropdownItemStyle(2)}
              onMouseEnter={() => setHoverIndex(2)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <FaTrashAlt style={iconMarginStyle} />
              Excluir todos os Cards
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(e) => {
                e.stopPropagation(); // Impede o fechamento do menu ao clicar nesse item
                setShowColorOptions(!showColorOptions); // Alterna a visibilidade da lista de cores
              }}
              style={getDropdownItemStyle(3)}
              onMouseEnter={() => setHoverIndex(3)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <FaPalette style={iconMarginStyle} />
              Cor dos Cards
            </Dropdown.Item>

            {showColorOptions && (
              <>
                <Dropdown.Divider />
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {colorList.map((colorItem, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        handleColorSelect(colorItem.color);
                        setShowColorOptions(false); // Fecha a lista de cores
                        setIsDropdownOpen(false); // Fecha o menu principal
                      }}
                      onMouseEnter={() => setHoveredColor(colorItem.color)}
                      onMouseLeave={() => setHoveredColor(null)}
                      style={{
                        width: colorItem.color === selectedColor ? '50px' : '40px', // Tamanho maior para a cor selecionada
                        height: colorItem.color === selectedColor ? '50px' : '40px',
                        backgroundColor: colorItem.color,
                        borderRadius: '50%', // Transformar em uma bola
                        border:
                          colorItem.color === selectedColor
                            ? '3px solid #000'
                            : '2px solid #ccc', // Destaque para a cor selecionada
                        transform:
                          hoveredColor === colorItem.color ? 'scale(1.2)' : 'scale(1)', // Efeito de zoom no hover
                        transition: 'transform 0.2s ease-in-out, border 0.2s ease-in-out', // Transições suaves
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>

      </TitleContainer>
      <ContainerIcons isBoardCreator={userLoggedData.isBoardCreator}>
        {/** 
        <IconsContainer data-tooltip-id={`tooltip-qtd-cards-${index}`} data-tooltip-content='Quantidade de Cards na coluna' >
        <Tooltip id={`tooltip-qtd-cards-${index}`} style={{ fontSize: "12px", padding: "4px 8px" }} />
          <FaNoteSticky />
          <CardBadge>{countCards}</CardBadge>
        </IconsContainer>
        */}
        <IconsContainer data-tooltip-id={`tooltip-add-cards-${index}`} data-tooltip-content='Criar card'>
          <Tooltip id={`tooltip-add-cards-${index}`} style={{ fontSize: "12px", padding: "4px 8px" }} />
          <StyledIoIosAddCircleOutline onClick={() => setModalOpen(true)} />
        </IconsContainer>
        {userLoggedData.isBoardCreator &&
          <>
            {!isObfuscatedColumnLevel ?
              (<IconsContainer data-tooltip-id={`tooltip-ocultar-cards-${index}`} data-tooltip-content='Ocultar Cards'>
                <Tooltip id={`tooltip-ocultar-cards-${index}`} style={{ fontSize: "12px", padding: "4px 8px" }} />
                <StyledLiaEyeSlashSolid onClick={() => onSetIsObfuscatedColumnLevel(true)} />
              </IconsContainer>)
              :
              (<IconsContainer data-tooltip-id={`tooltip-revelar-cards-${index}`} data-tooltip-content='Revelar Cards'>
                <Tooltip id={`tooltip-revelar-cards-${index}`} style={{ fontSize: "12px", padding: "4px 8px" }} />
                <StyledLiaEyeSolid onClick={() => onSetIsObfuscatedColumnLevel(false)} />
              </IconsContainer>)
            }
          </>}

      </ContainerIcons>
    </ColumnHeaderContainer>
  );
};

export default ColumnHeader;


// Estilizações
const ColumnHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  background-color: #1E3A5F;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;
  width: 100%;
  margin-bottom: 7px;
  padding: 2px;
`;

const TitleContainer = styled.div`
  margin-left: 15px;
  margin-: 0px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const Title = styled.div`
  font-size: 17px;
  color: #c0c0c0;
  margin-top: 5px;
  margin-bottom: 0px;
`;

const IconContainer = styled.div`
  margin-right: 15px;
  color: #c0c0c0;
  cursor: pointer;
  transition: color 0.2s ease;
`;

const StyledIoIosAddCircleOutline = styled(IoIosAddCircleOutline)`
  color: #10b981;  // Cor do ícone 
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;  
  font-size: 22px;  
  
  &:hover {
    transform: scale(1.4); 
  }
`;


const StyledLiaEyeSlashSolid = styled(LiaEyeSlashSolid)`
  color: #10b981;  // Cor do ícone 
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;  
  font-size: 22px;  
  
  &:hover {
    transform: scale(1.4); 
  }
`;

const StyledLiaEyeSolid = styled(LiaEyeSolid)`
  color: #10b981;  // Cor do ícone 
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;  
  font-size: 22px;  
  
  &:hover {
    transform: scale(1.4); 
  }
`;

const StyledMdMoreVert = styled(MdMoreVert)`
  color: #4169E1;  // Cor do ícone 
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;  
  font-size: 17px;  
  
  &:hover {
    transform: scale(1.4); 
  }
`;

const StyledMdCheck = styled(MdCheck)`
  color: white;  // Cor do ícone
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;
  font-size: 30px;

  // Adicionando fundo verde e tornando o ícone circular
  background-color: #10b981;  // Cor do fundo (verde)
  border-radius: 50%;  // Tornar o fundo circular
  padding: 8px;  // Espaçamento interno para o ícone
  display: inline-flex;  // Manter o ícone alinhado
  justify-content: center;
  align-items: center;

  &:hover {
    color: #ffffff;  // Cor do ícone ao passar o mouse
    transform: scale(1.1);  // Aumentar o tamanho do ícone ao passar o mouse
    background-color: #1c8e61;  // Cor de fundo ao passar o mouse (um tom mais escuro de verde)
  }
`;

const dropdownToggleStyle = {
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  boxShadow: 'none',
};

const dropdownMenuStyle = {
  backgroundColor: '#2f2f2f',
  borderRadius: '8px',
  padding: '10px',
};


const iconMarginStyle = {
  marginRight: 8,
};


const ContainerIcons = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isBoardCreator ? 'space-around' : 'center')};
  align-items: center; /* Centraliza verticalmente */
  width: 100%; /* Ocupa toda a largura disponível */
  max-width: 1200px; /* Define uma largura máxima para o container */
  margin-top: 4px; /* Centraliza o container dentro do seu pai */
  padding: 0 70px; /* Margem interna nas laterais (ajuste conforme necessário) */
  box-sizing: border-box; /* Garante que o padding seja incluído no cálculo da largura */
`;

const IconsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  font-size: 20px;
  color: #D0D0D0;
`;


const CardBadge = styled.span`
  position: absolute;
  top: -7px;
  right: -5px;
  background-color: #DDBB66     ;
  color: black;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
`;