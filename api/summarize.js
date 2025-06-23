import axios from "axios";
import * as cheerio from "cheerio";
import iconv from 'iconv-lite';
import chardet from 'chardet';
import { GoogleGenAI } from "@google/genai";

const geminikey = process.env.VITE_GEM_APIKEY;

const getDoc = async (link) => {
  try {
    const resp = await axios.get(link, {
      headers: {
        "User-Agent": "Chrome/137.0.7151.69",
      },
      responseType: "arraybuffer",
      timeout: 5000,
    });
    const encoding = chardet.detect(resp.data);
    const decodedHtml = iconv.decode(resp.data, encoding || "utf-8");

    return decodedHtml;
  } catch (error) {
    console.error(`HTML 문서 가져오기 실패: ${link}`);
    return null;
  }
};

const getNews = (doc) => {
  try {
    const $ = cheerio.load(doc);
    const articleBody = $('div[itemprop="articleBody"]');
    let textArray;
    if (articleBody.length > 0) {
      textArray = articleBody
        .find("p")
        .map((index, element) => {
          return $(element).text().trim();
        })
        .get();
    } else {
      textArray = $("p:not([class]):not([id])")
        .map((index, element) => {
          return $(element).text().trim();
        })
        .get();
    }
    const fullText = textArray.join("\n");
    return fullText;
  } catch (error) {
    return "기사 추출 실패";
  }
};

const getNaver = (doc) => {
  try{
    const $ = cheerio.load(doc);
    const pureTxtArr = $('div#newsct_article');
    const textArray = pureTxtArr.map((index, element) => $(element).text().trim()).get();
    const fullText = textArray.join("\n");
    return fullText;
  } catch (error) {
    return "네이버 기사 추출 실패"
  }
}

const ai = new GoogleGenAI({
  apiKey: geminikey,
});

const summarize = async (article) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: `Summarize the core point of the following news article in Korean in about 200 characters: ${article} \n If the article wasn't given, please let us know by returning 'SomethingsGoneWrongException'`,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    const sum = response.text;
    if(sum === 'SomethingsGoneWrongException') throw new Error();
    else return sum;
  } catch (error) {
    return "요약에 실패했습니다.";
  }
};

export default async function summaryHandler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", ["POST"]);
    return response.status(405).end("Method Not Allowed");
  }
  const { link } = request.body;
  try {
    const doc = await getDoc(link);
    let article;
    if(link.includes('news.naver.com')) {
      article = getNaver(doc);
    } else {
      article = getNews(doc);
    }
    if(article.trim() === '') throw new Error();
    const summary = await summarize(article);
    return response.status(200).json({ summary: summary });
  } catch (error) {
    return response
      .status(500)
      .json({ error: "Failed to summarize" });
  }
}
