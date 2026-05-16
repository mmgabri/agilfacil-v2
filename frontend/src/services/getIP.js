import axios from "axios";
import logger from "./logger";

const getIP = async () => {
    try {
        const response = await axios.get("https://api.ipify.org?format=json");
        logger.debug('getIP', `IP obtido: ${response.data.ip}`);
        return response.data.ip;
    } catch (error) {
        logger.error('getIP', 'Erro ao obter o IP', { message: error.message });
    }
};

export default getIP;
