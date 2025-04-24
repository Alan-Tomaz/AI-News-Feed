# **Automatic News Feed Generator**

## An automatic news feed generator that sends news daily via email and Telegram.

![illustrative](./public/assets/auto-news-feed-generator.png)

This project allows us to automatically search for news, translate it (if necessary), summarize it using DeepSeek's AI and finally send it via email and Telegram. It is also possible to run a daily routine to get news and receive it via email and Telegram through this project and the GitHub actions.

I will soon explain the details of how you can adapt this project for your use.

This project was developed with a node.js server, using the **[News API](https://newsapi.org)**, deepseek AI through the **[OpenRouter API](https://openrouter.ai)**, **[Nodemailer](https://www.nodemailer.com)** and the Telegram API

## Project details

This node server accepts requests on some routes so that it can respond with a list of one type of news or so that it can send a list with several types of news.

When one of these routes is triggered, they execute one of the controllers, which in turn execute the following chain of actions:
- Check the parameters, and if everything is correct, proceed to the next step
- Search for news based on the parameters sent through the NewsAPI
- Search for the full content of the news through the Cheerio, Readability and Puppeteer libs, since the NewsAPI does not return the full news.
- Send the content of the news to the Deepseek AI (through the OpenRouter API) which in turn summarizes the articles. AI will also remove news that does not address the reported topic.
- Send the articles by email.
- Send the articles via Telegram

### Server Routes

/news/economy/get - Especific Route
/news/IT/get - Especific Route
/news/policy/get - Especific

Params:

```
{Array} trustSources - A list of reliable sources. Max: 20. Default: empty
{Array} searchTerms - A list of search Terms. For an accurate search, they should suit the type of route you are running (Ex: Economy). Required.
{String} summaryRig - The level of demand of the summary. Must be 'low', 'medium', 'high'. Default is medium.
{String} language -  Possible options: Language of articles. Options: 'pt', 'en'
{Number} articlesLimit - Number of articles per type. Max: 10. Default: 5
{String} articlesDate - Dates to Search. Possible options: 'recent', '2days', '3days', 'week' and 'month'. Recent means the last day. Default: 'recent'.
{Boolean} sendSeparately If true, send each article type separately. if false, try to send all of them together.
```

Returns a list of news items of the type you chose

/news/get
```
{Array} trustSources - A list of reliable sources. Max: 20. Default: empty
{Array} articles - A array of objects containing the articles to be sent. Ex: [{articlesType: "Economy", searchTerms: ["economic, inflation"]}]. Required. The array allows multiple objects with news types.
{String} summaryRig - The level of demand of the summary. Must be 'low', 'medium', 'high'. Default is medium.
{String} language -  Possible options: Language of articles. Options: 'pt', 'en'
{Number} articlesLimit - Number of articles per type. Max: 10. Default: 5
{String} articlesDate - Dates to Search. Possible options: 'recent', '2days', '3days', 'week' and 'month'. Recent means the last day. Default: 'recent'.
{Boolean} sendSeparately If true, send each article type separately. if false, try to send all of them together.
```

Returns a list of the news that you choose.

### Execution functions

If you do not want to trigger the execution of the news routine through routes, you can use one of the created functions. They will perform the same steps as the route controllers.

```executeGetEconomicNews, executeGetITNews, executeGetPolicyNews```

These functions already have a predetermined list of news types and search terms. In this case, the only parameter it expects is an object with some parameters.

Params:

```
{Array} trustSources - A list of reliable sources. Max: 20. Default: empty
{String} summaryRig - The level of demand of the summary. Must be 'low', 'medium', 'high'. Default is medium.
{String} language -  Possible options: Language of articles. Options: 'pt', 'en'
{Number} articlesLimit - Number of articles per type. Max: 10. Default: 5
{String} articlesDate - Dates to Search. Possible options: 'recent', '2days', '3days', 'week' and 'month'. Recent means the last day. Default: 'recent'.
{Boolean} sendSeparately If true, send each article type separately. if false, try to send all of them together.
```

```executeGetNews```

Expects an object with the following parameters.

```
{Array} trustSources - A list of reliable sources. Max: 20. Default: empty
{Array} articles - A array of objects containing the articles to be sent. Ex: [{articlesType: "Economy", searchTerms: ["economic, inflation"]}]. Required. The array allows multiple objects with news types.
{String} summaryRig - The level of demand of the summary. Must be 'low', 'medium', 'high'. Default is medium.
{String} language -  Possible options: Language of articles. Options: 'pt', 'en'
{Number} articlesLimit - Number of articles per type. Max: 10. Default: 5
{String} articlesDate - Dates to Search. Possible options: 'recent', '2days', '3days', 'week' and 'month'. Recent means the last day. Default: 'recent'.
{Boolean} sendSeparately If true, send each article type separately. if false, try to send all of them together.
```

This function will fetch a list of news of various types, following the parameters provided and send them to the configured email and telegram.

If you plan to run the node server locally or on a personal server, you can set up a daily routine to run one of these functions using the cron lib.

```
// GET NEWS EVERY DAY AT 11:00 AM UTC AUTOMATICALLY.
cron.schedule('* 11 * * *', () => executeGetNews(params)) 
```

## Usage requirements

You need some API keys and some data to use this project.

You need an API key from NewsAPI and OpenRouter.

You also need a Telegram bot token, which can be created with the BotFather bot. You also need to get your chat ID.

Finally, you need your sending settings from your preferred email server (for sending only, I recommend ZohoMail).

Here are the required env variables

```
# TELEGRAM
TELEGRAM_BOT_TOKEN="" # Your Bot Token
TELEGRAM_DESTINATION="" # Your Phonenumber
TELEGRAM_CHAT_ID="" # Your Telegram Chat ID
# DEEPSEEK AI MODEL API    
DEEPSEEK_API_KEY="" # Your OpenRouter API Key
# NEWS API  
NEWS_API_KEY="" # Your News API key
# NODEMAILER  
MAIL_ADDRESS="" # Your sending email account
MAIL_PASS="" # The password of your sending email account
MAIL_DESTINATION="" # Your destination email
HOST="smtp.zoho.com" # You can change your sending server
SEND_PORT=465 # The same
# SERVER CONFIG
PORT=3000  # The port that the node server will run on
```

## Vercel Host

During development, Vercel was designated to host our server. Through it, the script would be executed daily through a GitHub action, but I was successful. However, it was precisely through GitHub actions that it was possible to find a better, faster, more efficient and practical way.

## Automatic script execution (Daily)

In order to run these scripts daily, without the need for a local or cloud server, it is necessary to configure a github action. To do this, create a .yml file in the .github\workflows path that will be at the root of the project.

The yml file should be configured like this:

```
# Script to run a news routine job using GitHub Actions
name: News Routine Trigger

on:
  schedule:
    - cron: "0 10 * * *" # Runs every day at 10:00 AM UTC. Change if you think it is necessary
  workflow_dispatch:

jobs:
  run-news-script:
    runs-on: ubuntu-latest

    steps:
      - name: Clone Repository
        uses: actions/checkout@v3

      - name: Install Dependencies
        run: npm install

      - name: Run news script
        run: node services/getNewsRoutine.js 
        env:
          # Your ENV variables must be here

          # TELEGRAM
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_DESTINATION: ${{ secrets.TELEGRAM_DESTINATION }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
          # DEEPSEEK
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          # NEWS API
          NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
          # EMAIL
          MAIL_ADDRESS: ${{ secrets.MAIL_ADDRESS }}
          MAIL_PASS: ${{ secrets.MAIL_PASS }}
          MAIL_DESTINATION: ${{ secrets.MAIL_DESTINATION }}
          HOST: ${{ secrets.HOST }}
          SEND_PORT: ${{ secrets.SEND_PORT }}
          # SERVER CONFIG
          PORT: ${{ secrets.PORT }}
          # VERCEL SCRIPT
          GITHUB_ACTIONS_SECRET_TOKEN: ${{ secrets.GITHUB_ACTIONS_SECRET_TOKEN }}

```

In order for the environment variables to be recognized, you must configure them as a GitHub repository secret.

This script is executed every day at UTC time by the getNewsRoutine script, which executes the executeGetNews function.

There are two preconfigured parameters that can be used, which are ParamsPT and ParamsEn, which will search for economic, political and IT news in their respective languages. These parameters must be imported from the services\getNewsOfController.js file

If you want to configure this parameter directly to display a list of news items of your choice, simply go to the services\getNewsRoutine.js file and change the parameter passed in the executeGetNews function call. The parameter must be in this format:

```
{
    trustSources: [],
    articles: [
        { searchTerms: ["economy", "finance", "business", "stock market", "investment", "real estate", "interest rates", "inflation", "GDP", "economic growth", "unemployment", "trade", "currency exchange", "financial markets", "economic indicators", "stoch exchange", "financial analysis", "economic policy", "central banks", "monetary policy", "fiscal policy"], 
        articlesType: "Economy" 
        }, 
        { searchTerms: ['policy', 'government', 'tax', 'elections', 'politics', 'political parties', 'corruption', 'human rights', 'freedom of speech', 'justice', 'foreign policy', 'diplomacy', 'international conflicts', 'international organizations', 'UN', 'NATO', 'EU', 'geopolitics'], 
        articlesType: "Policy" 
        }, 
        { searchTerms: ["IT", "technology", "computing", "software", "hardware", "internet", "AI", "artificial intelligence", "machine learning", "ML", "deep learning", "DL", "data science", "big data", "cloud computing", "cybersecurity", "blockchain", "cryptocurrency"], 
        articlesType: "IT" 
        }],
    summaryRig: 'medium',
    language: 'en',
    articlesLimit: 5,
    articlesDate: 'recent',
}
```

The object parameters are the same as those mentioned previously

## ⚠️ Attention

The free plans for the NewsAPI API and the OpenRouter API have daily request limits, but these limits should not be a problem if you only perform daily routines.