import twilio from 'twilio';

/* Send News to Whatsapp */
/**
 * 
 * @param {Array} articlesList A array of objects containing the articles to be sent.
 * @param {String} articlesList.articlesType The type of articles (e.g., "Sports", "Technology", etc.)
 * @param {Boolean} sendSeparately if true, send each article separately.
 */
export const sendToWhatsApp = async (articlesList, sendSeparately = false) => {

    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        /* Article Format */
        const formatArticle = (article, index) => `
        *Article ${index + 1}* \n
        *Title:* ${article.title || "No Title"} \n
        *Description:* ${article.description || "No Description"} \n
        *Link:* ${article.url || "#"} \n
        *Source:* ${article.source?.name || "No Source"} \n
        *Published At:* ${article.publishedAt || "No Date"} \n
        *Content:* ${article.content || "No Content"}
    `;

        if (sendSeparately) {
            // Send each article list as a separate message
            for (const a of articlesList) {
                const message = `
                *Daily News Summary of ${a.articlesType}*\n\n
                ${a.articles.map(formatArticle).join("\n\n")}
            `;
                const sectionMediaUrls = a.articles
                    .filter(article => article.urlToImage)
                    .map(article => article.urlToImage);

                await client.messages.create({
                    from: process.env.TWILIO_WHATSAPP_FROM,
                    to: process.env.WHATSAPP_DESTINATION,
                    body: message,
                    mediaUrl: sectionMediaUrls.length > 0 ? sectionMediaUrls : undefined, // Include images if available
                });
            }
        } else {
            // Send all articles in one message
            let message = '';
            let mediaUrls = []; // Array to store media URLs for the current message

            for (const a of articlesList) {
                const section = `
                *Daily News Summary of ${a.articlesType}*\n\n
                ${a.articles.map(formatArticle).join("\n\n")}
            `;

                // Collect media URLs for articles with images
                const sectionMediaUrls = a.articles
                    .filter(article => article.urlToImage)
                    .map(article => article.urlToImage);

                if ((message + section).length > 1600 || mediaUrls.length + sectionMediaUrls.length > 10) {
                    // Send the current message if it exceeds the limit
                    await client.messages.create({
                        from: process.env.TWILIO_WHATSAPP_FROM,
                        to: process.env.WHATSAPP_DESTINATION,
                        body: message,
                        mediaUrl: mediaUrls.length > 0 ? mediaUrls : undefined,
                    });
                    message = ''; // Reset the message
                    mediaUrls = []; // Reset media URLs
                }

                message += section + '\n\n ------------------------------------- \n\n';
                mediaUrls = mediaUrls.concat(sectionMediaUrls); // Add new media URLs
            }

            // Send any remaining message
            if (message.trim()) {
                await client.messages.create({
                    from: process.env.TWILIO_WHATSAPP_FROM,
                    to: process.env.WHATSAPP_DESTINATION,
                    body: message,
                    mediaUrl: mediaUrls.length > 0 ? mediaUrls : undefined,
                });
            }
        }
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        return { isError: true, message: "Error sending WhatsApp message" };
    }
};