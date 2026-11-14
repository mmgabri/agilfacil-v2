import { useCallback, useEffect, useRef, useState } from "react";
import { WS_BOARD_URL, WS_POKER_URL } from "../constants/apiConstants";
import logger from "../services/logger";

const CTX = 'useSocket';

// API Gateway WebSocket encerra conexões ociosas após 10 min.
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const MAX_QUEUE = 200;
// Comandos efêmeros que não faz sentido reenviar após reconectar.
const NON_QUEUEABLE = new Set(['timer_control_board', 'ping']);

// connectionStatus: 'connecting' (primeira conexão) | 'open' | 'reconnecting'
export const useSocket = (userName, userId, idSession, service) => {
  const wsRef = useRef(null);
  const queueRef = useRef([]);
  const [socketResponse, setSocketResponse] = useState({ userId, userName, idSession, service });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const isConnected = connectionStatus === 'open';

  // Envia qualquer mensagem JSON pelo WebSocket. Se a conexão estiver fechada,
  // guarda na fila para envio assim que reconectar (em vez de descartar).
  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      logger.debug(CTX, `→ send action=${payload.action} comand=${payload.comand}`, payload);
      wsRef.current.send(JSON.stringify(payload));
      return;
    }
    if (NON_QUEUEABLE.has(payload.comand)) {
      logger.warn(CTX, `send ignorado (efêmero) — WS não está OPEN (readyState=${wsRef.current?.readyState})`, { payload });
      return;
    }
    if (queueRef.current.length >= MAX_QUEUE) queueRef.current.shift();
    queueRef.current.push(payload);
    logger.warn(CTX, `WS não está OPEN — comando enfileirado (fila=${queueRef.current.length})`, { payload });
  }, []);

  // ── Poker ──────────────────────────────────────────────────────────────────

  const updateStatusRoom = useCallback((payload) => {
    send({ action: 'comand_socket_poker', comand: 'update_status_room', roomId: idSession, status: payload.status });
  }, [send, idSession]);

  const votar = useCallback((payload) => {
    send({ action: 'comand_socket_poker', comand: 'votar', roomId: idSession, userId, userName, vote: payload.vote });
  }, [send, idSession, userId, userName]);

  // ── Board ──────────────────────────────────────────────────────────────────

  // Comandos de card enviam também columnId/cardId: se a mensagem ficou na fila
  // e o board mudou nesse meio tempo, o backend localiza o card pelo id em vez
  // de confiar no índice (que pode apontar para outro card).
  const addCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'add_card_board', boardId: idSession, newCard: payload.newCard, indexColumn: payload.indexColumn, columnId: payload.columnId });
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
    send({ action: 'comand_socket_board', comand: 'update_like', boardId: idSession, isIncrement: payload.isIncrement, indexCard: payload.indexCard, indexColumn: payload.indexColumn, columnId: payload.columnId, cardId: payload.cardId });
  }, [send, idSession]);

  const deleteCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'delete_card', boardId: idSession, indexCard: payload.indexCard, indexColumn: payload.indexColumn, columnId: payload.columnId, cardId: payload.cardId });
  }, [send, idSession]);

  const deleteAllCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'delete_all_card', boardId: idSession, indexColumn: payload.indexColumn });
  }, [send, idSession]);

  const saveCardSocket = useCallback((payload) => {
    send({ action: 'comand_socket_board', comand: 'save_card', boardId: idSession, content: payload.content, indexCard: payload.indexCard, indexColumn: payload.indexColumn, columnId: payload.columnId, cardId: payload.cardId });
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
    const action = service === 'poker' ? 'comand_socket_poker' : 'comand_socket_board';
    // O broadcast do $connect no backend exclui a própria conexão (limitação
    // da AWS: PostToConnection não funciona para a conexão ainda em $connect),
    // então o cliente recém-conectado pede o estado atual explicitamente.
    const syncPayload = service === 'poker'
      ? { action, comand: 'sync_room', roomId: idSession }
      : { action, comand: 'sync_board', boardId: idSession };
    const pingPayload = service === 'poker'
      ? { action, comand: 'ping', roomId: idSession }
      : { action, comand: 'ping', boardId: idSession };

    let disposed = false;      // true quando o componente desmontou (fechamento intencional)
    let attempt = 0;
    let reconnectTimer = null;
    let heartbeatTimer = null;

    const rawSend = (ws, payload) => {
      logger.debug(CTX, `→ send action=${payload.action} comand=${payload.comand}`, payload);
      ws.send(JSON.stringify(payload));
    };

    const scheduleReconnect = () => {
      if (disposed || reconnectTimer) return;
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
      attempt += 1;
      logger.info(CTX, `Reconectando em ${delay}ms (tentativa ${attempt}) service=${service}`);
      reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, delay);
    };

    const connect = () => {
      if (disposed) return;
      logger.debug(CTX, `Conectando WebSocket service=${service} idSession=${idSession} userName=${userName}`);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed) return;
        logger.info(CTX, `WebSocket conectado service=${service} idSession=${idSession}`);
        attempt = 0;
        setConnectionStatus('open');

        // Reenvia o que o usuário fez enquanto estava desconectado, na ordem.
        const pending = queueRef.current;
        queueRef.current = [];
        if (pending.length) logger.info(CTX, `Reenviando ${pending.length} comando(s) da fila`);
        pending.forEach(p => rawSend(ws, p));

        rawSend(ws, syncPayload);

        clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) rawSend(ws, pingPayload);
        }, HEARTBEAT_INTERVAL_MS);
      };
      ws.onclose = (ev) => {
        clearInterval(heartbeatTimer);
        if (disposed || wsRef.current !== ws) return;
        logger.info(CTX, `WebSocket desconectado service=${service} code=${ev.code} reason=${ev.reason || '—'}`);
        setConnectionStatus('reconnecting');
        scheduleReconnect();
      };
      ws.onerror = (err) => {
        logger.error(CTX, 'WebSocket error', err);
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // O servidor envia { type: 'data_board'|'data_room', data: {...} }
          logger.debug(CTX, `← mensagem recebida type=${msg.type}`, msg.data);
          if (msg.data) setSocketResponse(msg.data);
        } catch (err) {
          logger.error(CTX, 'Erro ao parsear mensagem WebSocket', { raw: event.data, error: err.message });
        }
      };
    };

    // Ao voltar a rede ou a aba ficar visível, tenta reconectar na hora
    // em vez de esperar o backoff.
    const reconnectNow = () => {
      if (disposed) return;
      const state = wsRef.current?.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
      attempt = 0;
      connect();
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') reconnectNow(); };
    window.addEventListener('online', reconnectNow);
    document.addEventListener('visibilitychange', onVisibility);

    connect();

    return () => {
      logger.debug(CTX, `Fechando WebSocket service=${service} idSession=${idSession}`);
      disposed = true;
      clearTimeout(reconnectTimer);
      clearInterval(heartbeatTimer);
      window.removeEventListener('online', reconnectNow);
      document.removeEventListener('visibilitychange', onVisibility);
      wsRef.current?.close();
    };
  }, [idSession, userId]);

  return {
    socketResponse,
    isConnected,
    connectionStatus,
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
