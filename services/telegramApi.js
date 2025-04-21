import axios from "axios";

/* Send News to Telegram */
/**
 * 
 * @param {Array} articlesList A array of objects containing the articles to be sent.
 * @param {String} articlesList.articlesType The type of articles (e.g., "Sports", "Technology", etc.)
 * @param {Boolean} sendSeparately if true, send each article type separately.
 */
export const sendToTelegram = async (articlesList, sendSeparately = false) => {

    try {
        /* Article Format */
        const formatArticle = (article, index) => `
*Article ${index + 1}* \n
*Title:* ${article.title || "No Title"} \n
*Description:*  ${article.description || "No Description"} \n
*Link:*  ${article.url || "#"} \n
*Source:*  ${article.source?.name || "No Source"} \n
*Published At:*  ${article.publishedAt || "No Date"} \n
${article.iaError == true ? '❗ Error In IA API Search \n' : ''}
*Content:*  

${article.iaError == false ? article.summarizedNews : article.content.slice(0, 850)}${article.iaError == true && article.content.length > 500 ? '...' : ''}
    `;

        if (sendSeparately) {
            // Send each article list as a separate message
            for (const a of articlesList) {
                if (a.articles.length === 0) {
                    sendToTelegramErrMsg(a);
                } else {
                    const message = `
*Daily News Summary of ${a.articlesType}*\n\n
${a.articles.map(formatArticle).join("\n\n")}
            `;
                    const sectionMediaUrls = a.articles
                        .filter(article => article.urlToImage)
                        .map(article => article.urlToImage);

                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: "Markdown", // Use Markdown for formatting
                        photo: sectionMediaUrls.length > 0 ? sectionMediaUrls : undefined, // Include images if available
                    })
                }
            }
        } else {
            // Send all articles in one message
            let message = '';
            let mediaUrls = []; // Array to store media URLs for the current message

            for (const a of articlesList) {
                const section = a.articles.length === 0 ?
                    /* Error Message */
                    `*⚠️ Error Ocurred - ${a.articlesType} Summary News *

No Articles Found`
                    /* Normal Message */
                    : `
*Daily News Summary of ${a.articlesType}*\n\n
${a.articles.map(formatArticle).join("\n\n")}
            `;

                // Collect media URLs for articles with images
                const sectionMediaUrls = a.articles
                    .filter(article => article.urlToImage)
                    .map(article => article.urlToImage);

                if ((message + section).length > 4096 || mediaUrls.length + sectionMediaUrls.length > 10) {
                    // Send the current message if it exceeds the limit
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: "Markdown", // Use Markdown for formatting
                        photo: mediaUrls.length > 0 ? mediaUrls : undefined, // Include images if available
                    })
                    message = ''; // Reset the message
                    mediaUrls = []; // Reset media URLs
                }

                message += section + '\n\n ------------------------------------------------ \n\n';
                mediaUrls = mediaUrls.concat(sectionMediaUrls); // Add new media URLs
            }

            // Send any remaining message
            if (message.trim()) {
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: "Markdown", // Use Markdown for formatting
                    photo: mediaUrls.length > 0 ? mediaUrls : undefined,
                })
            }
        }
    } catch (error) {
        console.error("Error sending Telegram message:", error);
        throw error;
    }
};

const sendToTelegramErrMsg = async (a) => {

    try {
        /* Article Format */
        const formatArticle = () => `
*⚠️ Error Ocurred - ${a.articlesType} Summary News*

No Articles Found`;

        const message = formatArticle();

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown", // Use Markdown for formatting
        })
    }
    catch (error) {
        console.error("Error sending Telegram message:", error);
        throw error;
    }
};