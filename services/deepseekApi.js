
import axios from "axios";

/**
 * 
 * @param {Array} news News articles to be summarized
 * @param {String} summaryRig Summary rigorous to be used for summarization
 * @param {String} language Language of summary. Two Availales: 'pt' and 'en'.
 * @param {String} newsType Type of the news to be filtered
 */
export const summaryNews = async (news, summaryRig, language, newsType) => {

    try {

        if (news.length == 0) {
            return news;
        }

        // PHRASES LIMIT
        let phraseLimit;

        // MESSAGE TEMPLATE
        let message;


        // Set the phrase limit based on the summaryRig
        switch (summaryRig) {
            case 'low':
                phraseLimit = 10;
                break;
            case 'medium':
                phraseLimit = 5;
                break;
            case 'high':
                phraseLimit = 3;
                break;
            default:
                phraseLimit = 5;
                break;
        }

        // Set the message template based on the language
        message = buildMessage(language, news, newsType, phraseLimit);

        // Make the API request to DeepSeek with the template message
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'deepseek/deepseek-r1:free',
            messages: message
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });


        // Check if the response contains an error message
        if (response.data.error) {
            news.iaError = true;
            return news;
        };

        const data = response.data.choices[0].message.content

        if (data == 'NOT') {
            // If the response is "NOT" (news invalid), return an empty array
            return []
        } else {
            // If the response is valid, return the summarized news
            const summarizedNews = escapeMarkdown(data)
            news.summarizedNews = summarizedNews;
            news.iaError = false;
            return news;
        }
    } catch (error) {
        console.error("Error in DeepSeek AI Search:", error);
        throw error;
    }
}

/// Function to build the message template based on language and news type
const buildMessage = (language, news, newsType, phraseLimit) => {
    const templates = {
        pt: [
            { role: 'system', content: 'Você é um assistente que analisa, resume notícias e as traduz para português.' },
            {
                role: 'user',
                content: `Analise esta notícia. Caso ela atenda ao tema ${newsType}, resuma em português esta notícia em até ${phraseLimit} frases.
                Título: ${news.title}. 
                Conteúdo: ${news.completeContent}. 
                
                Siga este template de resposta: 

                Lorem ipsum dolor sit amet, consectetur adipiscing elit.

                Caso ela não atenda ao tema ${newsType}, responda apenas "NOT".`
            }
        ],
        en: [
            { role: 'system', content: 'You are an assistant who analyzes, summarizes news and translates it into English.' },
            {
                role: 'user',
                content: `Analyze this news story. If it fits the ${newsType} theme, summarize this news story in English in up to ${phraseLimit} sentences. 
                Title: ${news.title}. 
                Content: ${news.completeContent}.

                Follow this response template:

                Lorem ipsum dolor sit amet, consectetur adipiscing elit.

                If it does not fit the ${newsType} theme, just answer "NOT".`
            }
        ]
    };

    return templates[language] || templates['en'];
};

// Helper function to escape special characters in Markdown
const escapeMarkdown = (text) => {
    return text
        /*  .replace(/_/g, '\\_')
         .replace(/\[/g, '\\[')
         .replace(/\]/g, '\\]')
         .replace(/\(/g, '\\(')
         .replace(/\)/g, '\\)')
         .replace(/~/g, '\\~') */
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>')
    /*   .replace(/#/g, '\\#')
      .replace(/\+/g, '\\+')
        .replace(/-/g, '\\-') 
      .replace(/=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/!/g, '\\!'); */
}
