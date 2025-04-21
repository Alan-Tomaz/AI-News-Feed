import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import striptags from 'striptags';

async function extractWithCheerio(url) {
    try {
        const { data: html } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 10000
        });
        const $ = cheerio.load(html);
        const main = $("article").text() || $("main").text() || $("body").text();
        /* return main.trim().slice(0, 5000).replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' '); */ // With Limit
        return main.trim().replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');  // Without Limit
    } catch (err) {
        console.warn("[Cheerio] Failed:", err.message);
        return null;
    }
}

async function extractWithReadability(url) {
    try {
        const { data: html } = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 10000
        });
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        if (article?.textContent) {
            // With Limit
            /*             return `${article.excerpt?.trim().slice(0, 5000).replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ') || ""}\n${article.textContent.trim().replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ')}`;
             */            // Without Limit
            return `${article.excerpt?.trim().replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ') || ""}\n${article.textContent.trim().replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ')}`;
        }

        return null
    } catch (err) {
        console.warn("[Readability] Failed:", err.message);
        return null;
    }
}

async function extractWithPuppeteer(url) {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
        const content = await page.evaluate(() => {
            const article = document.querySelector("article") || document.body;
            /*             return article.innerText.trim().slice(0, 5000).replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' '); */ // With Limit
            return article.innerText.trim().replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');  // Without Limit
        });
        await browser.close();
        return content;
    } catch (err) {
        console.warn("[Puppeteer] Failed:", err.message);
        return null;
    }
}

// Function to extract the complete content of a news article. The news API only returns an abstracted version of the article, so we need to use the Mercury Parser to get the full content.
export const abstractNews = async (news) => {
    try {
        if (news.length == 0) {
            return news; // If there are no news articles, return an empty array
        }

        const methods = [extractWithCheerio, extractWithReadability, extractWithPuppeteer];


        for (const a of news) {
            const url = a.url; // URL of the news article

            console.log("➡️ Extracting:", url);

            // Loop through each method and try to extract the content. If one succeeds, break the loop.
            for (const method of methods) {
                const result = await method(url);
                if (result && result.length > 800) { // Check if the result is valid
                    console.log(`✅ Success with ${method.name}`);
                    const newResult = striptags(result); // remove HTML tags
                    a.completeContent = newResult
                    break;
                }
                console.error(`❌ Error with ${method.name}:`, url);
            }
        }
        return news

    } catch (error) {
        console.error('Error in news Abstract:', error);
        throw error
    }
}