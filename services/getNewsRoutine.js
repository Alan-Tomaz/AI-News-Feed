import { executeGetNews, paramsPT } from "../services/getNewsOfController.js";

const getNewsRoutine = () => {
    executeGetNews(paramsPT);
    return "RUN BOT SUCCESSFULLY";
}

getNewsRoutine();