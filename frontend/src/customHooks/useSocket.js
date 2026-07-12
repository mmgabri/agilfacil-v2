import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BOARD_URL, WS_POKER_URL } from "../constants/apiConstants";
import logger from "../services/logger";

const CTX = 'useSocket';

export const useSocket = (userName, userId, idSession, service) => {
  const wsRef = useRef(null);
  const [socketResponse, setSocketResponse] = useState({ userId, userName, idSession, service });
  const [isConnected, setConnected] = useState(false);

  // Envia qualquer mensagem JSON pelo WebSocket nativo
  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      logger.debug(CTX, `→ send action=${payload.action} comand=${payload.comand}`, payload);
      wsRef.current.send(JSON.stringify(payload));
    } else {
      logger.warn(CTX, `send ignorado — WS não está OPEN (readyState=${wsRef.current?.readyState})`, { payload });
    }
  }, []);

  // ── Poker ──────────────────────────────────────────────────────────────────

  const updateStatusRoom = useCallback((payload) => {
    send({ action: 'comand_socket_poker', comand: 'update_status_room', roomId: idSession, status: payload.status });
  }, [send, idSession]);

  const votar = useCallback((payload) => {
    send({ action: 'comand_socket_poker', comand: 'votar', roomId: idSession, userId, userName, vote: payload.vote });
  }, [send, idSession, userId, userName]);

  // ── Board ──────────────────────────────────────────────────────────────────

  const addCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'add_card_board', boardId: idSession, newCard: payload.newCard, indexColumn: payload.indexColumn });
  }, [send, idSession]);

  const reorderBoardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'reorder_board', boardId: idSession, source: payload.source, destination: payload.destination });
  }, [send, idSession]);

  const combineCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'combine_card', boardId: idSession, source: payload.source, combine: payload.combine });
  }, [send, idSession]);

  const deleteColumnSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'delete_column', boardId: idSession, index: payload.index });
  }, [send, idSession]);

  const setIsObfuscatedBoardLevelSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'set_is_obfuscated_board_level', boardId: idSession, isObfuscated: payload.isObfuscated });
  }, [send, idSession]);

  const setIsObfuscatedColumnLevelSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'set_is_obfuscated_column_level', boardId: idSession, isObfuscated: payload.isObfuscated, index: payload.index });
  }, [send, idSession]);

  const addColumnSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'add_column', boardId: idSession, newColumn: payload.newColumn });
  }, [send, idSession]);

  const updateTitleColumnSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'update_title_column', boardId: idSession, content: payload.content, index: payload.index });
  }, [send, idSession]);

  const updatecolorCardsSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'update_color_cards', boardId: idSession, colorCards: payload.colorCards, index: payload.index });
  }, [send, idSession]);

  const updateLikeSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'update_like', boardId: idSession, isIncrement: payload.isIncrement, indexCard: payload.indexCard, indexColumn: payload.indexColumn });
  }, [send, idSession]);

  const deleteCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'delete_card', boardId: idSession, indexCard: payload.indexCard, indexColumn: payload.indexColumn });
  }, [send, idSession]);

  const deleteAllCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'delete_all_card', boardId: idSession, indexColumn: payload.indexColumn });
  }, [send, idSession]);

  const saveCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'save_card', boardId: idSession, content: payload.content, indexCard: payload.indexCard, indexColumn: payload.indexColumn });
  }, [send, idSession]);

  const timerControlSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'timer_control_board', boardId: idSession, timeInput: payload.timeInput, timer: payload.timer, isRunningTimer: payload.isRunningTimer, userId: payload.userId });
  }, [send, idSession]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || !idSession) {
      logger.warn(CTX, `Conexão ignorada — parâmetros incompletos`, { userId, idSession, service });
      return;
    }

    const wsUrl = service === 'board' ? WS_BOARD_URL : WS_POKER_URL;
    const url = `${wsUrl}?userName=${encodeURIComponent(userName || '')}&userId=${encodeURIComponent(userId)}&idSession=${encodeURIComponent(idSession)}&service=${service}`;
    logger.debug(CTX, `Conectando WebSocket service=${service} idSession=${idSession} userName=${userName}`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      logger.info(CTX, `WebSocket conectado service=${service} idSession=${idSession}`);
      setConnected(true);
    };
    ws.onclose = (ev) => {
      logger.info(CTX, `WebSocket desconectado service=${service} code=${ev.code} reason=${ev.reason || '—'}`);
      setConnected(false);
    };
    ws.onerror = (err) => {
      logger.error(CTX, 'WebSocket error', err);
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // O servidor envia { type: 'data_board'|'data_room', data: {...} }
        logger.debug(CTX, `← mensagem recebida type=${msg.type}`, msg.data);
        setSocketResponse(msg.data);
      } catch (err) {
        logger.error(CTX, 'Erro ao parsear mensagem WebSocket', { raw: event.data, error: err.message });
      }
    };

    return () => {
      logger.debug(CTX, `Fechando WebSocket service=${service} idSession=${idSession}`);
      ws.close();
    };
  }, [idSession, userId]);

  return {
    socketResponse,
    isConnected,
    updateStatusRoom,
    votar,
    addCardSocket,
    reorderBoardSocket,
    combineCardSocket,
    deleteColumnSocket,
    updateTitleColumnSocket,
    updateLikeSocket,
    deleteCardSocket,
    addColumnSocket,
    saveCardSocket,
    updatecolorCardsSocket,
    deleteAllCardSocket,
    timerControlSocket,
    setIsObfuscatedBoardLevelSocket,
    setIsObfuscatedColumnLevelSocket,
  };
};
