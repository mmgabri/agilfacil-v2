import { toast } from 'react-toastify';
import { DateTime } from 'luxon';
import { signOut, fetchAuthSession } from '@aws-amplify/auth';

const errorMessages = {
    0: 'Sua ação foi concluída com sucesso!',
    1: 'Board deletado com sucesso!',
    404: 'Sala inexistente. Por favor, peça um novo ID e tente novamente.',
    401: 'Acesso negado. Faça um novo login e tente novamente.',
    901: 'Não foi possível deletar o Board. Por favor, tente novamente.',
    902: 'Não foi possível abrir o Board. Por favor, tente novamente.',
    903: 'Erro ao clonar Board. Por favor, tente novamente.',
    904: 'Não foi possível carregar o Board. Por favor, tente novamente.',
    905: 'Não foi possível criar a Sala. Por favor, tente novamente.',
    906: 'Não foi possível criar o Bord. Por favor, tente novamente.',
    default: 'Ocorreu um erro inesperado. Por favor, tente novamente.'
};

export const emitMessage = (type, statusCode, autoClose) => {
    // Obtém a mensagem de erro ou a mensagem padrão
    const message = errorMessages[statusCode] || errorMessages.default;

    let autoClosedefault = 4000

    if (autoClose) {
        autoClosedefault = autoClose
    }

    if (type == 'error') {
        toast.error(message, {
            position: 'top-center',
            autoClose: autoClosedefault,
            hideProgressBar: false,
            closeButton: true,
            draggable: true, // Permite arrastar a notificação
            pauseOnHover: true, // Pausa o fechamento automático ao passar o mouse
        });
    } else {
        toast.success(message, {
            position: 'top-center',
            autoClose: autoClosedefault,
            hideProgressBar: false,
            closeButton: true,
            draggable: true, // Permite arrastar a notificação
            pauseOnHover: true, // Pausa o fechamento automático ao passar o mouse
        });
    }

};

export const formatdateTime = (dateTime) => {

    return DateTime.fromISO(dateTime).toFormat("dd/MM/yyyy HH:mm:ss");

};

export async function onGetToken() {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens.idToken.toString();
        return token;
    } catch (error) {
        throw error;
    }
}

export const onSignOut = async () => {
    try {
        await signOut(); // Faz o logout no Cognito
        localStorage.clear(); // Limpa o localStorage
        sessionStorage.clear(); // Limpa o sessionStorage
    } catch (error) {
        emitMessage('error', 999)
    }
};