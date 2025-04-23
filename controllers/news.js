import { summaryNews } from "../services/deepseekApi.js";
import { searchNews } from "../services/newsApi.js";
import { sendEmail } from "../services/nodemailerApi.js";
import { abstractNews } from "../services/extractor.js";
import { sendToTelegram } from "../services/telegramApi.js";
import { validateParams } from "../services/validateParams.js";

/**
 * @description This functions is used to get the news from the API and send it to the user by email and Telegram.
 * Params of req.body:
 * @param {Array} trustSources Your reliable sources. Ex: 'cnn.com'. If the string is null, the search will be extensive. Can be empty.
 * @param {Array} searchTerms A Array of params that you want to search to. The strings inside the array will be searched with a OR operator. Array Ex: ['technology', 'computing',], in URL will be: techonology OR computing. Required in routes that search by one type.
 * @param {String} summaryRig Possible options: 'low', 'medium', 'high'. Default is medium.
 * @param {String} language Possible options:  'pt', 'en'
 * @param {Number} articlesLimit Number of articles.
 * @param {String} articlesDate Possible Options: 'recent', '2days', '3days', 'week', 'month'. Recent means the last day.
 * @param {Boolean} sendSeparately If true, send each article type separately.
 * @param {Array} articles A array of objects containing the articles to be sent. Ex: [{articlesType: "Economy", searchTerms: ["economic, inflation"]}]. Required if geralSearch is true. Required in routes that search by multiple types.
 * @returns {string} Return the filtered news.
 */

// SEARCH A LIST OF NEWS TYPE
export const getNews = async (req, res) => {
    try {
        /* VALIDATE PARAMS OF THE REQUEST*/
        let params = validateParams(req.body, true);
        if (params.error) {
            console.log(params.error);
            return res.status(400).json({ error: params.error });
        }
        /* SET THE ARTICLE LIST */
        const articleList = [];

        /* INSERT THE FILTERED NEWS OF EACH TYPE IN THE ARTICLELIST */
        for (const a of params.articles) {
            /* GET THE NEWS */
            console.log("SEARCHING NEWS FOR TYPE: " + a.articlesType + "...")
            const news = await searchNews(params.trustSources, a.searchTerms, params.language, params.articlesLimit, params.articlesDate);
            // GET FULL CONTENT OF THE NEWS
            console.log("ABSTRACTING NEWS FOR TYPE: " + a.articlesType + "...")
            const updatedNews = await abstractNews(news);
            /* summary, translate (if necessary) and filter the news. If the news is not related to the topic, it is removed */
            console.log(`FOUND ${updatedNews.length} ARTICLES. SUMMARIZING AND FILTERING NEWS OF TYPE: ${a.articlesType} WITH IA...`)
            const summarizedNews = await Promise.all(updatedNews.map((n) => {
                return summaryNews(n, params.summaryRig, params.language, a.articlesType);
            })).then(results => results.filter(element =>
                element && // check if element is not null or undefined
                !(Array.isArray(element) && element.length === 0) // remove empty arrays
            ));

            /* ADD THE NEWS TO LIST */
            articleList.push({ articles: summarizedNews, articlesType: a.articlesType });
        };

        //SEND THE EMAIL
        console.log('SENDING EMAIL...');
        await sendEmail(articleList, params.sendSeparately)

        //SEND THE TELEGRAM MESSAGE
        console.log('SENDING TELEGRAM MESSAGE...');
        await sendToTelegram(articleList, params.sendSeparately)

        console.log("EVERYTHING OK!")
        return res.status(200).json({ message: 'News sent successfully!', ...params, news: articleList });


    } catch (error) {
        console.error('Error in news proccess:', error.message || error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// GET NEWS BY TYPE
export const getNewsByType = async (req, res, type) => {
    try {
        let params = validateParams(req.body, false);
        if (params.error) { // check if the params are valid
            console.log(params.error);
            return res.status(400).json({ error: params.error });
        }

        console.log("SEARCHING NEWS...");
        const news = await searchNews(params.trustSources, params.searchTerms, params.language, params.articlesLimit, params.articlesDate); // GET THE NEWS
        // GET FULL CONTENT OF THE NEWS
        console.log("ABSTRACTING NEWS FOR TYPE: " + type + "...")
        const updatedNews = await abstractNews(news);
        console.log(`FOUND ${updatedNews.length} ARTICLES. SUMMARIZING AND FILTERING NEWS OF TYPE: ${type} WITH IA...`)
        // Summarize, translate (if necessary) and filter the news. If the news is not related to the topic, it is removed
        const summarizedNews = await Promise.all(
            updatedNews.map((n) => summaryNews(n, params.summaryRig, params.language, type))
        ).then(results => results.filter(element =>
            element && // check if element is not null or undefined
            !(Array.isArray(element) && element.length === 0) // remove empty arrays
        ));

        const articleList = [{ articles: summarizedNews, articlesType: type }]; // ADD THE NEWS TO LIST



        console.log('SENDING EMAIL...');
        await sendEmail(articleList, params.sendSeparately); // SEND THE EMAIL

        console.log('SENDING TELEGRAM MESSAGE...');
        await sendToTelegram(articleList, params.sendSeparately); // SEND THE TELEGRAM MESSAGE

        console.log("EVERYTHING OK!")
        return res.status(200).json({ message: 'News sent successfully!', ...params, news: articleList });
    } catch (error) {
        console.error('Error in news proccess:', error.message || error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET ECONOMY NEWS
export const getEconomicNews = (req, res) => getNewsByType(req, res, 'Economy');
// GET POLICY NEWS
export const getPolicyNews = (req, res) => getNewsByType(req, res, 'Policy');
// GET POLITICS NEWS
export const getITNews = (req, res) => getNewsByType(req, res, 'IT');