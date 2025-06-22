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

const getPureTxt = (doc) => {
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

const ai = new GoogleGenAI({
  apiKey: geminikey,
});

const summarize = async (article) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the core point of the following news article in Korean in about 200 characters: ${article} \n If the article wasn't given, please let us know as '추출 잘못된듯? ㅋㅋ'`,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    return response.text;
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
    const article = getPureTxt(doc);
    const summary = await summarize(article);
    return response.status(200).json({ summary: article });
  } catch (error) {
    return response
      .status(500)
      .json({ error: "Failed to summarize" });
  }
}
