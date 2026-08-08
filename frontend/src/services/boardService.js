import axios from 'axios';
import { SERVER_BASE_URL } from '../constants/apiConstants';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export const getBoard = (id) =>
  axios.get(`${SERVER_BASE_URL}/board/${id}`).then((r) => r.data);

export const getBoardByUser = (userId, token) =>
  axios.get(`${SERVER_BASE_URL}/board/getBoardByUser/${userId}`, authHeaders(token)).then((r) => r.data);

export const deleteBoard = (id, token) =>
  axios.delete(`${SERVER_BASE_URL}/board/${id}`, authHeaders(token)).then((r) => r.data);

export const createBoard = (data, token) =>
  axios.post(`${SERVER_BASE_URL}/board/createBoard`, data, authHeaders(token)).then((r) => r.data);
