import axios from 'axios';

/**
 * Search for news
 * @param {Array} trustSources Your reliable sources. Ex: 'cnn.com'. If the string is null, the search will be extensive.
 * @param {Array} searchTerms A Array of params that you want to search to. The strings inside the array will be searched with a OR operator. Array Ex: ['technology', 'computing',], in URL will be: techonology OR computing.
 * @param {String} language Possible options: 'ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'ud', 'zh'
 * @param {Number} pageSize Number of articles. Max: 10. Default is 5.
 * @param {String} date Possible Options: 'recent', 'week', 'month'. Recent means last two days.
 * @returns {string} Return the filtered news.
 */

export const searchNews = async (trustSources = [], searchTerms = ['technology', 'computing', 'IT', 'computers', 'artificial intelligence', 'AI'], language = 'en', pageSize = 5, date = 'recent') => {

    //URL to get the news.

    const baseUrl = 'https://newsapi.org/v2/everything';
    const apiKey = process.env.NEWS_API_KEY; //API KEY from newsapi.org

    const params = new URLSearchParams();

    /* Insert the news searchTerms in the request */
    if (searchTerms.length > 0) {
        const query = searchTerms.map(keyword => (keyword.includes(' ') ? `"${keyword}"` : keyword)).join(' OR ');
        params.append('q', query);
    }

    /* Insert the language in the request */
    params.append('language', language);

    /* Insert the pagesize in the request */
    params.append('pageSize', pageSize);

    /* Insert the trusted in request */
    if (trustSources.length > 0) {
        params.append('sources', trustSources.join(','));
    }

    /* Insert the date filter in the request */
    const currentDate = new Date();
    let startDate;

    /* Get the date */
    switch (date) {
        case 'recent':
            startDate = new Date();
            startDate.setDate(currentDate.getDate() - 1);
            break;
        case '2days':
            startDate = new Date();
            startDate.setDate(currentDate.getDate() - 2);
            break;
        case '3days':
            startDate = new Date();
            startDate.setDate(currentDate.getDate() - 3);
            break;
        case 'week':
            startDate = new Date();
            startDate.setDate(currentDate.getDate() - 7);
            break;
        case 'month':
            startDate = new Date();
            startDate.setDate(currentDate.getDate() - 30);
            break;
        default:
            startDate = null;
    }

    if (startDate) {
        const formattedStartDate = startDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const formattedEndDate = currentDate.toISOString().split('T')[0]; // Data atual no mesmo formato
        params.append('from', formattedStartDate);
        params.append('to', formattedEndDate);
    }

    /* Insert the sort by filter in the request */
    params.append('sortBy', 'popularity');


    /* Insert the API KEY in the request */
    params.append('apiKey', apiKey);

    try {
        const response = await axios.get(`${baseUrl}?${params.toString()}`);
        return response.data.articles; // Return the news
    } catch (error) {
        console.log("Error searching news: ", error);
        throw new Error("Error searching news");
    }
};