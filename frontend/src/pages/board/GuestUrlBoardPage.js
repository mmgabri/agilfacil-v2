import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { emitMessage } from '../../services/utils'
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom'
import { SERVER_BASE_URL } from "../../constants/apiConstants";
import LoaderPage from "../generic/LoaderPage"
import localStorageService from "../../services/localStorageService";
import { v4 as uuidv4 } from 'uuid';


export const GuestUrlBoardPage = ({ }) => {
  const { id } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
   // console.log('useEffect')

    const initializeUserData = async () => {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes(user);

        const userData = { userId: attributes.sub, userName: attributes.name, isVerified: true, isBoardCreator: false };
        const userStorage = { userId: attributes.sub, userName: attributes.name };

        localStorageService.removeItem("AGILFACIL_USER_LOGGED");
        localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);
        directsBoard(userData)

      } catch (error) {
        if (error.toString().includes("UserUnAuthenticatedException")) {
          const userStorage = localStorageService.getItem("AGILFACIL_USER_LOGGED");

          if (!userStorage) {
            const userStorage = { userId: uuidv4() }
            const userData = { ...userStorage, isVerified: false, isBoardCreator: false };
            localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);
            directsBoard(userData)
          } else {
            const userData = { ...userStorage, isVerified: false, isBoardCreator: false };
            directsBoard(userData)
          }
        } else {
          emitMessage('error', 999)
        }
      }
    };

    initializeUserData();

  }, []);


  const directsBoard = async (userAuthenticated) => {
    try {
      const response = await axios.get(`${SERVER_BASE_URL}/board/${id}`)
      navigate('/board', { state: { boardData: response.data, userAuthenticated: userAuthenticated } });
    } catch (error) {
      emitMessage('error', 999)
    }
  };

  return (
    <LoaderPage />
  );
}
export default GuestUrlBoardPage