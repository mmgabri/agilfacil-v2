import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BOARD_URL, WS_POKER_URL } from "../constants/apiConstants";

export const useSocket = (userName, userId, idSession, service) => {
  const wsRef = useRef(null);
  const [socketResponse, setSocketResponse] = useState({ userId, userName, idSession, service });
  const [isConnected, setConnected] = useState(false);

  // Envia qualquer mensagem JSON pelo WebSocket nativo
  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
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

  const addCollumnSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'add_collumn', boardId: idSession, newCollumn: payload.newCollumn });
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
    const wsUrl = service === 'board' ? WS_BOARD_URL : WS_POKER_URL;
    const url = `${wsUrl}?userName=${encodeURIComponent(userName || '')}&userId=${encodeURIComponent(userId || '')}&idSession=${encodeURIComponent(idSession || '')}&service=${service}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // O servidor envia { type: 'data_board'|'data_room', data: {...} }
        setSocketResponse(msg.data);
      } catch (err) {
        console.error('Erro ao parsear mensagem WebSocket:', err);
      }
    };

    return () => ws.close();
  }, [idSession]);

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
    addCollumnSocket,
    saveCardSocket,
    updatecolorCardsSocket,
    deleteAllCardSocket,
    timerControlSocket,
    setIsObfuscatedBoardLevelSocket,
    setIsObfuscatedColumnLevelSocket,
  };
};
