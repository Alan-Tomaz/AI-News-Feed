import { getNews, getNewsByType } from '../controllers/news.js';

// Simulated request and response objects for testing
// Params in English
export const paramsEn = {
    trustSources: [],
    articles: [{ searchTerms: ["economy", "finance", "business", "stock market", "investment", "real estate", "interest rates", "inflation", "GDP", "economic growth", "unemployment", "trade", "currency exchange", "financial markets", "economic indicators", "stoch exchange", "financial analysis", "economic policy", "central banks", "monetary policy", "fiscal policy"], articlesType: "Economy" }, { searchTerms: ['policy', 'government', 'tax', 'elections', 'politics', 'political parties', 'corruption', 'human rights', 'freedom of speech', 'justice', 'foreign policy', 'diplomacy', 'international conflicts', 'international organizations', 'UN', 'NATO', 'EU', 'geopolitics'], articlesType: "Policy" }, { searchTerms: ["IT", "technology", "computing", "software", "hardware", "internet", "AI", "artificial intelligence", "machine learning", "ML", "deep learning", "DL", "data science", "big data", "cloud computing", "cybersecurity", "blockchain", "cryptocurrency"], articlesType: "IT" }],
    summaryRig: 'medium',
    language: 'en',
    articlesLimit: 5,
    articlesDate: 'recent',
};

// Params in Portuguese
export const paramsPT = {
    articles: [{ searchTerms: ["econômia", "finanças", "negócios", "mercado de ações", "investimento", "imóveis", "taxas de juros", "inflação", "PIB", "crescimento econômico", "desemprego", "comércio", "câmbio", "mercados financeiros", "indicadores econômicos", "análise financeira", "política econômica", "bancos centrais", "política monetária", "política fiscal", "bolsa de valores", "Bovespa"], articlesType: "Econômia" }, { searchTerms: ['politica', 'impostos', 'presidência', 'congresso', 'governo', 'eleições', 'partidos políticos', 'corrupção', 'direitos humanos', 'liberdade de expressão', 'justiça', 'política externa', 'diplomacia', 'conflitos internacionais', 'organizações internacionais', 'ONU', 'OTAN', 'União Europeia', 'geopolítica'], articlesType: "Politica" }, { searchTerms: ['tecnologia', 'IA', 'internet', 'computação', 'software', 'hardware', 'inteligência artificial', 'aprendizado de máquina', 'ciência de dados', 'big data', 'computação em nuvem', 'cibersegurança', 'blockchain', 'criptomoeda'], articlesType: "TI" }],
    trustSources: [],
    summaryRig: 'medium',
    language: 'pt',
    articlesLimit: 5,
    articlesDate: 'recent',
};

// Function to execute getNews with simulated request and response
export const executeGetNews = async (params) => {
    params.sendSeparately = false;
    try {
        const req = { body: params }; // Simulate req.body
        const res = {
            status: (code) => ({
                json: (data) => console.log(`Status: ${code}`, data)
            })
        };

        await getNews(req, res);
    } catch (error) {
        console.error('Error in Get News Exec:', error);
        throw error;
    }
};

export const executeGetNewsType = async (params, searchTerms, type) => {
    params.sendSeparately = true;
    params.searchTerms = searchTerms;
    try {
        const req = { body: params }; // Simulating req.body
        const res = {
            status: (code) => ({
                json: (data) => console.log(`Status: ${code}`, data)
            })
        };

        await getNewsByType(req, res, type);
    } catch (error) {
        console.error('Error in Get News Exec:', error);
        throw error;
    }
};

// GET ECONOMY NEWS IN ENGLISH
export const executeGetEconomicNews = () => executeGetNewsType(paramsEn, ["economy", "finance", "business", "stock market", "investment", "real estate", "interest rates", "inflation", "GDP", "economic growth", "unemployment", "trade", "currency exchange", "financial markets", "economic indicators", "stoch exchange", "financial analysis", "economic policy", "central banks", "monetary policy", "fiscal policy"], 'Economy');
// GET POLICY NEWS IN ENGLISH
export const executeGetPolicyNews = () => getNewsByType(paramsEn, ['policy', 'government', 'tax', 'elections', 'politics', 'political parties', 'corruption', 'human rights', 'freedom of speech', 'justice', 'foreign policy', 'diplomacy', 'international conflicts', 'international organizations', 'UN', 'NATO', 'EU', 'geopolitics'], 'Policy');
// GET IT NEWS IN ENGLISH
export const executeGetITNews = (req, res) => getNewsByType(paramsEn, ["IT", "technology", "computing", "software", "hardware", "internet", "AI", "artificial intelligence", "machine learning", "ML", "deep learning", "DL", "data science", "big data", "cloud computing", "cybersecurity", "blockchain", "cryptocurrency"], 'IT');