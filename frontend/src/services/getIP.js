import axios from "axios";

const getIP = async () => {
    try {
        const response = await axios.get("https://api.ipify.org?format=json");
        return response.data.ip;
    } catch (error) {
        console.error("Erro ao obter o IP:", error);
    }
};

export default getIP;
