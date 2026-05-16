import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import jsPDF from "jspdf";
import axios from "axios";
import "jspdf-autotable";
import { fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom'
import { IoMdDownload } from "react-icons/io";
import styled from "styled-components";
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import LoaderPage from '../generic/LoaderPage';
import Header from '../components/Header';
import favicon from '../../images/favicon.ico';
import { emitMessage, formatdateTime, onSignOut } from '../../services/utils'
import { FRONT_BASE_URL } from "../../constants/apiConstants";
import SuggestionForm from '../components/SuggestionForm'

const GeneratePDF = () => {
  const { id } = useParams();
  let navigate = useNavigate();

  const [boardData, setBoardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  const linkUrlBoard = `${FRONT_BASE_URL}/board/guest/${id}`;

  useEffect(() => {
    setIsLoading(true);

    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens == undefined) {
          setUserIsAuthenticated(false)
        } else {
          setUserIsAuthenticated(true)
        }
      } catch (error) {
        setUserIsAuthenticated(false)
      }
    }

    axios.get(`${SERVER_BASE_URL}/board/${id}`)
      .then(response => {
        setBoardData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        emitMessage('error', 904, 2000)
        setIsLoading(false);
      });

    checkAuth();

  }, []);


  const generatePDF = () => {
    const doc = new jsPDF();

    // Fundo escuro da página
    doc.setFillColor(44, 44, 44); // Cinza mais claro (#485460)

    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, "F");

    //------- Logo do Site (LogoContainer)
    const logoWidth = 6;  // Largura do logo
    const logoHeight = 6; // Altura do logo

    // Adiciona o logo (supondo que favicon seja a URL ou base64 da imagem)
    doc.addImage(favicon, 'PNG', 14, 10, logoWidth, logoHeight);  // 14 e 18 são as posições X e Y

    // Nome da Marca (AgilFacil) na mesma linha do logo
    const logoTextX = 14 + logoWidth + 3; // X da logo + largura do logo + margem de 5
    doc.setFont("helvetica");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // Branco
    doc.text("AgilFacil - Board Interativo", logoTextX, 14);


    //-------Título do documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);

    // Calcular a posição X para centralizar
    const pageWidth0 = doc.internal.pageSize.getWidth(); // Largura total da página (uso de getWidth())
    const textWidth0 = doc.getTextWidth(`${boardData.boardName}`); // Largura do texto
    const xPosition0 = (pageWidth0 - textWidth0) / 2; // Posição X centralizada

    const yPosition0 = 32;

    doc.text(`${boardData.boardName}`, xPosition0, yPosition0); // Texto centralizado


    //------- Informações do Board (InfoSection) - Seguindo o padrão da tabela
    const infoLines = [
      {
        leftText: `Criado em: ${formatdateTime(boardData.createdAt)}`,
        rightText: `Criado por: ${boardData.userName}`
      },
      {
        leftText: `Squad: ${boardData.squadName}`,
        rightText: `Área: ${boardData.areaName}`
      },
      {
        leftText: `Total de Cards: ${boardData.columns.reduce((acc, col) => acc + col.cards.length, 0)}`,
        rightText: `Total de Participantes: ${Array.isArray(boardData.usersOnBoardHistoric) ? boardData.usersOnBoardHistoric.length : 0}`
      },
      {
        leftText: '',
        rightText: ''
      },
      {
        leftText: `Link: ${linkUrlBoard}`,
        rightText: ''
      },
    ];

    // Posição inicial para as informações
    let currentY = 45;

    // Adicionando as informações no PDF
    infoLines.forEach((line) => {

      const pageWidthI = doc.internal.pageSize.getWidth();
      const leftX = 14;

      // Adicionar os textos ao PDF
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(236, 240, 241); // Cor do texto (branco suave)

      // Texto à esquerda
      doc.text(line.leftText, leftX, currentY);
      // Texto à direita
      doc.text(line.rightText, pageWidthI - 14, currentY, { align: "right" });

      currentY += 6;
    });


    //-------- Cabeçalhos e Linhas (Tabela)
    const columns = boardData.columns.map(col => col.title);
    const maxRows = Math.max(...boardData.columns.map(col => col.cards.length));
    const rows = Array.from({ length: maxRows }).map((_, rowIndex) =>
      boardData.columns.map(column => column.cards[rowIndex]?.content || "")
    );

    // Estilo uniforme e largura das colunas igual
    const columnCount = columns.length;
    const pageWidth = doc.internal.pageSize.width; // Largura total da página
    const tableWidth = pageWidth - 15; // Largura da tabela (margem de 20px em cada lado)

    // Calcular largura das colunas (dividindo a largura total pela quantidade de colunas)
    const columnWidth = tableWidth / columnCount;

    // Calcular a posição horizontal para centralizar
    const startX = (pageWidth - tableWidth) / 2;

    // Gerar a tabela
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: currentY + 3, // Começa após as informações
      theme: "grid",
      styles: {
        fontSize: 12,
        cellPadding: 3,
        textColor: [236, 240, 241], // #ECF0F1 - Texto branco suave
        lineColor: [122, 122, 122],  // #4B6584 - Bordas suaves
        lineWidth: 0.3,
        fillColor: [59, 59, 59], // #1C2833 - Fundo uniforme da tabela
      },
      headStyles: {
        fillColor: [30, 58, 95], // #142D4B - Azul escuro no cabeçalho
        textColor: [255, 255, 255], // Branco
        fontSize: 14,
      },
      columnStyles: columns.reduce((acc, col, index) => {
        acc[index] = { cellWidth: columnWidth }; // Aplica largura fixa a cada coluna
        return acc;
      }, {}),
      margin: { left: startX }, // Aplica a margem para centralizar
    });

    // Salvar PDF
    doc.save("AgilFacil_Board-interativo.pdf");
  };

  return (
    <div className="bg-black-custom">
      <Header
        subText={'Board Interativo'}
        showSuggestionsModal={() => setModalOpen(true)}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')} />
        
      {isLoading ?
        <LoaderPage />
        :
        <>

          {!boardData ?
            <AlignedContainer>
              <p>Não foi possível carregar o Board.</p>
            </AlignedContainer>
            :
            <Container>

              {/* Botão de download */}
              <ButtonWrapper>
                <Button onClick={generatePDF}>
                  <IoMdDownload /> Baixar PDF
                </Button>
              </ButtonWrapper>

              {/* Seção de informações */}
              <InfoSection>
                <Title>{boardData.boardName}</Title>

                <InfoRow>
                  <InfoItem><strong>Criado em:</strong>{formatdateTime(boardData.createdAt)}</InfoItem>
                  <InfoItem><strong>Criado por:</strong>{boardData.userName}</InfoItem>
                  <InfoItem><strong>Squad:</strong> {boardData.squadName}</InfoItem>
                  <InfoItem><strong>Área:</strong>{boardData.areaName}</InfoItem>
                </InfoRow>

                <InfoRow2>
                  <InfoItem><strong>Total de Cards:</strong> {boardData.columns ? boardData.columns.reduce((acc, col) => acc + col.cards.length, 0) : 0}</InfoItem>
                  <InfoItem><strong>Total de Participantes:</strong>{Array.isArray(boardData.usersOnBoardHistoric) ? boardData.usersOnBoardHistoric.length : 0}</InfoItem>
                </InfoRow2>

                <InfoRow2>
                  <InfoItem><strong>Link: </strong>{linkUrlBoard}</InfoItem>
                </InfoRow2>
              </InfoSection>


              <Table>
                <thead>
                  <tr>
                    {boardData.columns.map((column, index) => (
                      <Th key={index}>{column.title}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.max(...boardData.columns.map(col => col.cards.length)) }).map((_, rowIndex) => (
                    <Tr key={rowIndex}>
                      {boardData.columns.map((column, colIndex) => (
                        <Td key={colIndex}>
                          {column.cards[rowIndex] ? column.cards[rowIndex].content : ""}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </tbody>
              </Table>
              {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
            </Container>}

        </>}



    </div>

  );
};


const Container = styled.div`
  width: 90%;
  max-width: 1300px;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoSection = styled.div`
  background: #2c2c2c ;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #E1E1E1 ;
  text-align: center;
  margin-bottom: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 14px;
  color: #E1E1E1  ;
`;

const InfoRow2 = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  font-size: 14px;
  color: #E1E1E1 ;
  gap: 50px;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 6px;
  font-weight: 500;
  color: #E1E1E1  ;

`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;


const Table = styled.table`
  width: 100%;
  margin: 1px auto;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
  background-color: #1E272E;
  border: 1px solid #7A7A7A ;
  table-layout: fixed;
`;

const Th = styled.th`
  background-color: #1E3A5F      ;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  color: #BEBEBE;
  text-transform: uppercase;
  border-bottom: 2px solid #7A7A7A ;
  border-right: 1px solid #7A7A7A ;

  &:last-child {
    border-right: none; /* Remove borda do último item */
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #7A7A7A ;
  border-right: 1px solid #7A7A7A ;
  color: #E1E1E1 ;

  &:last-child {
    border-right: none; /* Remove borda do último item */
  }
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #2c2c2c;
  }

  &:nth-child(odd) {
    background-color: #2c2c2c;
  }

`;


const Button = styled.button`
  display: flex;
  gap: 5px;
  margin-top: 1px;
  padding: 10px 7px;
  background-color: #1E3A5F; 
  color: #fff;
  font-size: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    transform: scale(1.1); /* Efeito de hover */
  }

  span {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    margin-bottom: 10px;
  }
`;

const AlignedContainer = styled.div`
  display: flex;
  flex-direction: column;  /* Alinha os itens em uma coluna */
  margin-top: 30px;
  justify-content: top; /* Centraliza verticalmente */
  align-items: center;     /* Centraliza o conteúdo horizontalmente */
  height: 100vh;           /* Faz o contêiner ocupar toda a altura da tela */
`;



export default GeneratePDF;
