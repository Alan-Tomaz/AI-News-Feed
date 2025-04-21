import nodemailer from "nodemailer";

/* Send News to Email */
/**
 * 
 * @param {Array} articlesList A array of objects containing the articles to be sent.
 * @param {String} articlesList.articlesType The type of articles (e.g., "Sports", "Technology", etc.)
 * @param {Boolean} sendSeparately if true, send each article type separately.
 */
/* SEND EMAIL FUNCTION */
export const sendEmail = async (articlesList, sendSeparately = false) => {

    try {
        /* PREPARE THE TRANSPORT TO SEND THE EMAIL WITH NODEMAILER */
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SEND_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        // Function to format the date in MM/DD/YYYY HH:mm:ss format
        const formatDate = (isoDate) => {
            const date = new Date(isoDate); // convert ISO string to Date object

            const day = String(date.getDate()).padStart(2, '0'); // Day (1-31)
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-11, so +1)
            const year = date.getFullYear(); // Ano
            const hours = String(date.getHours()).padStart(2, '0'); // Hours
            const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes
            const seconds = String(date.getSeconds()).padStart(2, '0'); // Seconds

            return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`; // Format MM/DD/YYYY HH:mm:ss
        };

        // Send the email separately for each article type
        if (sendSeparately) {
            // Loop through each article type and send an email for each
            for (const a of articlesList) {
                // Check if articles list is empty. If yes, send an error email.
                if (a.articles.length === 0) {
                    nullArticlesSeparatelySend(a);
                } else { // If articlesList is not empty, send the email with articles.
                    const emailHtml = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="text-align: center; color: #007BFF;">Daily News Summary - ${a.articlesType}</h1>
            <hr style="border: 1px solid #007BFF;">
            ${a.articles.map((element, index) => `
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2>Article ${index + 1}</h2>
                    <p><strong>Title:</strong> ${element.title || "No Title"}</p>
                    <p><strong>Description:</strong> ${element.description || "No Description"}</p>
                    <p><strong>Link:</strong> <a href="${element.url || "#"}" target="_blank">${element.url || "No Link"}</a></p>
                    <p><strong>Source:</strong> ${element.source?.name || "No Source"}</p>
                    ${element.urlToImage ? `<img src="${element.urlToImage}" alt="Image" style="width: 100%; max-width: 400px; height: auto; margin-top: 10px;">` : ""}
                    <p><strong>Published At:</strong> ${formatDate(element.publishedAt) || "No Date"} </p>
                    ${element.iaError == true ? `<span style="color: #721c24;">Error In IA API Search</span>` : ""}
                    <p><strong>Content:</strong> ${element.iaError == false ? element.summarizedNews : element.content.slice(0, 850)}${element.iaError == true && element.content.length > 850 ? '...' : ''}</p>
                </div>
            <hr style="border: 1px solid #007BFF;">
            <footer style="text-align: center; margin-top: 20px;">
                <p>News Feed - ${new Date().getFullYear()}</p>
            </footer>
            `).join("<br /><hr style='border: 1px solid #007BFF;'><br />")}
        </body>
        </html>
        `;

                    // Create the email options
                    const mailOptions = {
                        from: `"News Feed" ${process.env.MAIL_ADDRESS}`,
                        to: `${process.env.MAIL_DESTINATION}`,
                        subject: `Daily News Summary of ${a.articlesType}`,
                        html: emailHtml,
                    };

                    // Send the email
                    console.log(`Sending email to ${process.env.MAIL_DESTINATION} for articles type: ${a.articlesType}`);
                    const info = await transporter.sendMail(mailOptions);
                    console.log("Message sent: %s", info.messageId);
                    // Return a success message
                };
            }
            return { isError: false, message: "Emails Sent" };
        } else { // If sendSeparately is false, combine all articles into one email
            // Store if any article has an error
            let hasError = false;
            // Create the email HTML
            const emailHtml = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        ${articlesList.map((a) => {
                if (a.articles.length === 0) {
                    hasError = true;
                    return ` <h1 style="text-align: center; color: #721c24;">⚠️ Error Notification ⚠️ - Daily News Summary ${a.articlesType ? `- ${a.articlesType}` : ''}</h1>
            <hr style="border: 1px solid #721c24;">
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <h3>An error occurred while processing the email service:</h3>
                    </br>
                    <p><strong>No Articles Found</strong></p>
                </div>
            <hr style="border: 1px solid #721c24;">
            <footer style="text-align: center; margin-top: 20px;">
                <p>News Feed - ${new Date().getFullYear()}</p>
            </footer>`
                } else {
                    return `
            <h1 style="text-align: center; color: #007BFF;">Daily News Summary - ${a.articlesType}</h1>
            <hr style="border: 1px solid #007BFF;">
            ${a.articles.map((element, index) => `
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2>Article ${index + 1}</h2>
                    <p><strong>Title:</strong> ${element.title || "No Title"}</p>
                    <p><strong>Description:</strong> ${element.description || "No Description"}</p>
                    <p><strong>Link:</strong> <a href="${element.url || "#"}" target="_blank">${element.url || "No Link"}</a></p>
                    <p><strong>Source:</strong> ${element.source?.name || "No Source"}</p>
                    ${element.urlToImage ? `<img src="${element.urlToImage}" alt="Image" style="width: 100%; max-width: 400px; height: auto; margin-top: 10px;">` : ""}
                    <p><strong>Published At:</strong> ${formatDate(element.publishedAt) || "No Date"} </p>
                    ${element.iaError == true ? `<span style="color: #721c24;">Error In IA API Search</span>` : ""}
                    <p><strong>Content:</strong> ${element.iaError == false ? element.summarizedNews : element.content.slice(0, 850)}${element.iaError == true && element.content.length > 850 ? '...' : ''}</p>
                </div>
            `).join("")}
            <hr style="border: 1px solid #007BFF;">
            <footer style="text-align: center; margin-top: 20px;">
                <p>News Feed - ${new Date().getFullYear()}</p>
            </footer>
            `}
            }).join("<br /><hr style='border: 1px solidrgb(83, 83, 83);'><br />")}
        </body>
        </html>
        `;

            // Create the email options
            const mailOptions = {
                from: `"News Feed ${hasError ? "Error" : ""}" ${process.env.MAIL_ADDRESS}`,
                to: `${process.env.MAIL_DESTINATION}`,
                subject: `Daily News Summary ${hasError ? "- ⚠️ Error Notification" : ""}`,
                html: emailHtml,
            };


            // Send the email
            console.log(`Sending email to ${process.env.MAIL_DESTINATION}...`);
            const info = await transporter.sendMail(mailOptions);
            console.log("Message sent: %s", info.messageId);
            // Return a success message
            return { isError: false, message: "Email Sent" };
        }
    } catch (error) {
        if (error.response) {
            console.error("SMTP Error: ", error.response);
        } else {
            console.error("Unexpected Error: ", error.message);
        }
        throw error;
    }
}

const nullArticlesSeparatelySend = async (article) => {
    try {
        // Prepare the transporter
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SEND_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const emailHtml = `
         <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="text-align: center; color: #721c24;">⚠️ Error Notification ⚠️ - Daily News Summary ${article.articlesType ? `- ${article.articlesType}` : ''}</h1>
            <hr style="border: 1px solid #721c24;">
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <h3>An error occurred while processing the email service:</h3>
                    </br>
                    <p><strong>No Articles Found</strong></p>
                </div>
            <hr style="border: 1px solid #721c24;">
            <footer style="text-align: center; margin-top: 20px;">
                <p>News Feed - ${new Date().getFullYear()}</p>
            </footer>
        </body>
        </html>
        `;

        // Create the email options
        const mailOptions = {
            from: `"News Feed Error" <${process.env.MAIL_ADDRESS}>`,
            to: process.env.ERROR_NOTIFICATION_EMAIL || process.env.MAIL_DESTINATION,
            subject: `⚠️ Error Notification - ${article ? article.articlesType : ''} Summary News Feed`,
            html: emailHtml,
        };

        // Send the error email
        console.log(`Sending error notification email for articles type: ${article.articlesType}`);
        const info = await transporter.sendMail(mailOptions);
        console.log("Error notification sent: %s", info.messageId);

    } catch (error) {
        console.log("Error sending error notification email:", error.message || error);
        throw error
    }
}