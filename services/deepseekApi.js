
import axios from "axios";

/**
 * 
 * @param {Array} news News articles to be summarized
 * @param {String} summaryRig Summary rigorous to be used for summarization
 * @param {String} language Language of summary
 */
export const summaryNews = async (news, summaryRig, language) => {

    try {

        let phraseLimit;
        let message;


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

        switch (language) {
            case 'pt':
                message = [
                    { role: 'system', content: 'Você é um assistente que resume notícias em português.' },
                    {
                        role: 'user', content: `Resuma esta notícia em até ${phraseLimit} frases e me diga o seu tipo de notícia (Ex: Política, Econômia...): ${news.title}. Conteúdo: ${noticia.description}. 
                Siga este template de resposta: 
                
                Tipo de Notícia: Política

                Notícia resumida: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                ` }
                ]
                break;
            case 'en':
                message = [
                    { role: 'system', content: 'You are an assistant who summarizes news in English.' },
                    {
                        role: 'user', content: `Summarize this news in up to ${phraseLimit} sentences and tell me what type of news it is (Ex: Politics, Economy...): ${news.title}. Content: ${noticia.description}. 
                Follow this response template:

                News Type: Politics

                Summary news: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            `}
                ]
                break;
            default:
                message = [
                    { role: 'system', content: 'You are an assistant who summarizes news in English.' },
                    {
                        role: 'user', content: `Summarize this news in up to ${phraseLimit} sentences and tell me what type of news it is (Ex: Politics, Economy...): ${news.title}. Content: ${noticia.description}. 
                Follow this response template:

                News Type: Politics

                Summary news: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            `}
                ]
                break;
        }

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'Você é um assistente que resume notícias em português.' },
                { role: 'user', content: `Resuma esta notícia em 3 frases: ${news.title}. Conteúdo: ${noticia.description}` }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error in AI summaryNews:", error.message);
        return { isError: true, message: error.message };
    }
}