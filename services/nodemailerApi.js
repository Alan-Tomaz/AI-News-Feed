import nodemailer from "nodemailer";

/* SEND EMAIL FUNCTION */
export const sendEmail = async (articles, articlesType) => {

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

        // Create the email HTML
        const emailHtml = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="text-align: center; color: #007BFF;">Daily News Summary - ${articlesType}</h1>
            <hr style="border: 1px solid #007BFF;">
            ${articles.map((element, index) => `
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2>Article ${index + 1}</h2>
                    <p><strong>Title:</strong> ${element.title || "No Title"}</p>
                    <p><strong>Description:</strong> ${element.description || "No Description"}</p>
                    <p><strong>Link:</strong> <a href="${element.url || "#"}" target="_blank">${element.url || "No Link"}</a></p>
                    <p><strong>Source:</strong> ${element.source?.name || "No Source"}</p>
                    ${element.urlToImage ? `<img src="${element.urlToImage}" alt="Image" style="width: 100%; max-width: 400px; height: auto; margin-top: 10px;">` : ""}
                    <p><strong>Published At:</strong> ${formatDate(element.publishedAt) || "No Date"} </p>
                    <p><strong>Content:</strong> ${element.content || "No Content"}</p>
                </div>
            `).join("")}
            <hr style="border: 1px solid #007BFF;">
            <footer style="text-align: center; margin-top: 20px;">
                <p>News Feed - ${new Date().getFullYear()}</p>
            </footer>
        </body>
        </html>
        `;

        // Create the email options
        const mailOptions = {
            from: `"News Feed" ${process.env.MAIL_ADDRESS}`,
            to: `${process.env.MAIL_DESTINATION}`,
            subject: `Daily News Summary of ${articlesType}`,
            html: emailHtml,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return { isError: false, message: "Email Sent" };
        ;
    } catch (error) {
        console.error("Error to Send Email: ", error);
        return { isError: true, message: "Internal Mail Error" };
    }
}