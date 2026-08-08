import axios from 'axios';
import { SERVER_BASE_URL } from '../constants/apiConstants';

export const getRoom = (id) =>
  axios.get(`${SERVER_BASE_URL}/rooms/${id}`).then((r) => r.data);

export const createRoom = (data) =>
  axios.post(`${SERVER_BASE_URL}/poker/createRoom`, data).then((r) => r.data);
