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

${article.iaError == false ? article.summarizedNews : article.content.slice(0, 850)}${article.iaError == true && article.content.length > 850 ? '...' : ''}
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

                    // Check if the message exceeds the limit and split if necessary
                    if (message.length > 4000) {
                        console.log('MESSAGE TOO LONG, SPLITTING INTO CHUNKS...');
                        // Split the message into chunks of 4000 characters
                        const chunks = splitMessage(message, 4000);

                        // Send each chunk separately
                        for (const chunk of chunks) {
                            const index = chunks.indexOf(chunk);

                            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                chat_id: process.env.TELEGRAM_CHAT_ID,
                                text: escapeMarkdown(chunk),
                                parse_mode: "Markdown", // Use Markdown for formatting
                                photo: sectionMediaUrls.length > 0 && index == 0 ? sectionMediaUrls : undefined, // Include images if available
                            })
                        }
                    }
                    else {
                        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                            chat_id: process.env.TELEGRAM_CHAT_ID,
                            text: escapeMarkdown(message),
                            parse_mode: "Markdown", // Use Markdown for formatting
                            photo: sectionMediaUrls.length > 0 ? sectionMediaUrls : undefined, // Include images if available
                        })
                    }
                }
            }
        } else {
            // Try to Send all articles type in one message. If exceeds the limit, send separately
            let message = '';
            let mediaUrls = []; // Array to store media URLs for the current message
            let hasSendedMedia = false;

            for (const a of articlesList) {
                // Create The template message for the article type. If empty create a error template, if not a normal template
                let section = a.articles.length == 0 ?
                    /* Error Message */
                    `*⚠️ Error Ocurred - ${a.articlesType} Summary News *

No Articles Found`
                    /* Normal Message */
                    : `
*Daily News Summary of ${a.articlesType}*\n\n
${a.articles.map((elem, index) => formatArticle(elem, index)).join("\n\n")}
            `;

                // Collect media URLs for articles with images
                const sectionMediaUrls = a.articles
                    .filter(article => article.urlToImage)
                    .map(article => article.urlToImage);

                // Check if the message exceeds the limit and send separately if necessary
                if ((message + section).length > 4000 || mediaUrls.length + sectionMediaUrls.length > 10) {

                    // If has a message, send it before sending the next one
                    if (message.trim()) {
                        // Check if the message will exceed the limit and send the current message
                        if (message.length == 4000) {

                            mediaUrls = mediaUrls.concat(sectionMediaUrls); // Add new media URLs
                            hasSendedMedia = true; // Set the flag to true

                            // Send the current message before sending the next one
                            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                chat_id: process.env.TELEGRAM_CHAT_ID,
                                text: escapeMarkdown(message),
                                parse_mode: "Markdown",
                                photo: mediaUrls.length > 0 ? mediaUrls : undefined, // Include images if available
                            });
                            message = ''; // Reset the message
                            mediaUrls = []; // Reset the midia URLs
                        } else {
                            mediaUrls = mediaUrls.concat(sectionMediaUrls); // Add new media URLs
                            hasSendedMedia = true; // Set the flag to true

                            message = message + section; // Add the remaining section to the message
                            const chunks = splitMessage(message, 4000);
                            for (const chunk of chunks) {
                                if (chunk.length >= 4000) {
                                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                        chat_id: process.env.TELEGRAM_CHAT_ID,
                                        text: escapeMarkdown(chunk),
                                        parse_mode: "Markdown",
                                        photo: mediaUrls.length > 0 ? mediaUrls : undefined, // Include images if available
                                    });
                                } else {
                                    message = ''; // Reset the message
                                    section = chunk;
                                }
                                mediaUrls = []; // Reset the midia URLs
                            }
                        }
                    }


                    // Split the section into chunks if it exceeds the limit and send
                    if (section.length > 4000) {
                        const chunks = splitMessage(section, 4000);
                        for (const chunk of chunks) {
                            if (chunk.length >= 4000) {
                                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                    chat_id: process.env.TELEGRAM_CHAT_ID,
                                    text: escapeMarkdown(chunk),
                                    parse_mode: "Markdown",
                                });
                            } else {
                                section = chunk;
                            }
                        }
                    }
                }

                message = message + section; // Add the remaining section to the message
                if (hasSendedMedia) { // if the is not sended yet, add the media URLs to the next message
                    mediaUrls = mediaUrls.concat(sectionMediaUrls); // Add new media URLs
                }
            }

            // Send any remaining message
            if (message.trim()) {
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: escapeMarkdown(message),
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

// Helper function to split messages into chunks
const splitMessage = (message, maxLength) => {
    const parts = [];
    while (message.length > maxLength) {
        let chunk = message.slice(0, maxLength);
        parts.push(chunk);
        message = message.slice(chunk.length);
    }
    parts.push(message);
    return parts;
};

// Helper function to escape special characters in Markdown
const escapeMarkdown = (text) => {
    return text
        /*   .replace(/_/g, '\\_') */
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
    /*  .replace(/\(/g, '\\(')
     .replace(/\)/g, '\\)')
     .replace(/~/g, '\\~')
     .replace(/`/g, '\\`')
     .replace(/>/g, '\\>')
     .replace(/#/g, '\\#')
     .replace(/\+/g, '\\+')
     .replace(/-/g, '\\-')
     .replace(/=/g, '\\=')
     .replace(/\|/g, '\\|')
     .replace(/{/g, '\\{')
     .replace(/}/g, '\\}')
     .replace(/\./g, '\\.')
     .replace(/!/g, '\\!'); */
}
