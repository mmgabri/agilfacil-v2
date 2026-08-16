import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import jsPDF from "jspdf";
import { getBoard } from '../../services/boardService';
import "jspdf-autotable";
import { fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom'
import { IoMdDownload } from "react-icons/io";
import styled from "styled-components";
import LoaderPage from '../generic/LoaderPage';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import logo from '../../images/logo.png';
import { emitMessage, formatdateTime, onSignOut } from '../../services/utils'
import { FRONT_BASE_URL } from "../../constants/apiConstants";
import SuggestionForm from '../components/SuggestionForm'
import SupportForm from '../components/SupportForm'

const GeneratePDF = () => {
  const { id } = useParams();
  let navigate = useNavigate();

  const [boardData, setBoardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSupportModalOpen, setSupportModalOpen] = useState(false);
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

    getBoard(id)
      .then(data => {
        setBoardData(data);
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

    // Adiciona o logo
    doc.addImage(logo, 'PNG', 14, 10, logoWidth, logoHeight);  // 14 e 18 são as posições X e Y

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
    <PageBackground>
      <AmbientGlow />

      <Header
        boardName={boardData?.boardName}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')}
        hasSidebar />

      <Layout>
        <Sidebar onSuggestions={() => setModalOpen(true)} onSupport={() => setSupportModalOpen(true)} />

        <Content>
          {isLoading ?
            <LoaderPage />
            :
            <>
              {!boardData ?
                <EmptyMessage>Não foi possível carregar o Board.</EmptyMessage>
                :
                <>
                  <PageHeaderRow>
                    <PageTitle>{boardData.boardName}</PageTitle>
                    <DownloadButton onClick={generatePDF}>
                      <IoMdDownload size={16} /> Baixar PDF
                    </DownloadButton>
                  </PageHeaderRow>

                  <InfoCard>
                    <MetaGrid>
                      <MetaItem>
                        <MetaLabel>Criado em</MetaLabel>
                        <MetaValue>{formatdateTime(boardData.createdAt)}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Criado por</MetaLabel>
                        <MetaValue>{boardData.userName}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Squad</MetaLabel>
                        <MetaValue>{boardData.squadName}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Área</MetaLabel>
                        <MetaValue>{boardData.areaName}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Total de Cards</MetaLabel>
                        <MetaValue>{boardData.columns ? boardData.columns.reduce((acc, col) => acc + col.cards.length, 0) : 0}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Total de Participantes</MetaLabel>
                        <MetaValue>{Array.isArray(boardData.usersOnBoardHistoric) ? boardData.usersOnBoardHistoric.length : 0}</MetaValue>
                      </MetaItem>
                    </MetaGrid>
                    <LinkRow>
                      <MetaLabel>Link</MetaLabel>
                      <LinkValue>{linkUrlBoard}</LinkValue>
                    </LinkRow>
                  </InfoCard>

                  <TableWrapper>
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
                  </TableWrapper>
                </>}
            </>}
        </Content>
      </Layout>

      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
      {isSupportModalOpen && <SupportForm onClose={() => setSupportModalOpen(false)} />}
    </PageBackground>
  );
};

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / BoardPage.js / BoardListPage.js.

const TEXT          = 'var(--text)';
const MUTED         = 'var(--muted)';
const MUTED2        = 'var(--muted2)';
const BORDER        = 'var(--border)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT_SOFT   = 'var(--accent-soft)';
const ACCENT_GLOW   = 'var(--accent-glow)';
const ACCENT_GRAD   = 'var(--accent-grad)';

const PageBackground = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
`;

const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(1100px 480px at 50% -8%, ${ACCENT_GLOW}, transparent 65%);
`;

const Layout = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: ${MUTED};
  font-size: 13px;
`;

const PageHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${TEXT};
  margin: 0;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: ${ACCENT_GRAD};
  color: var(--on-accent);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 18px ${ACCENT_GLOW};
  transition: filter 0.15s ease, transform 0.1s ease;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

const InfoCard = styled.div`
  background: var(--panel);
  border: 1px solid ${BORDER_STRONG};
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: var(--shadow-soft);
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px 24px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${MUTED2};
`;

const MetaValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT};
`;

const LinkRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid ${BORDER};
`;

const LinkValue = styled.span`
  font-size: 13px;
  color: ${ACCENT_SOFT};
  word-break: break-all;
`;

const TableWrapper = styled.div`
  border: 1px solid ${BORDER_STRONG};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  background: var(--panel);
  table-layout: fixed;
`;

const Th = styled.th`
  background: var(--surface-hover);
  color: ${MUTED2};
  padding: 12px 14px;
  text-align: left;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-bottom: 1px solid ${BORDER_STRONG};
  border-right: 1px solid ${BORDER};

  &:last-child {
    border-right: none;
  }
`;

const Td = styled.td`
  padding: 12px 14px;
  border-bottom: 1px solid ${BORDER};
  border-right: 1px solid ${BORDER};
  color: ${TEXT};
  vertical-align: top;

  &:last-child {
    border-right: none;
  }
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: var(--surface);
  }

  &:hover td {
    background: var(--surface-hover);
  }

  &:last-child td {
    border-bottom: none;
  }
`;

export default GeneratePDF;
