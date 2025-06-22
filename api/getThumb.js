import axios from "axios";
import * as cheerio from "cheerio";

/*const apikey = import.meta.env.VITE_APP_APIKEY;

const getLinks = async (query) => {
  try {
    const resp = await axios.get(
      `/v1/search/news.json?query=${encodeURIComponent(query)}&display=12`,
      {
        headers: {
          "X-Naver-Client-Id": "qQ0rDJDLUQdGBC0U6Ndl",
          "X-Naver-Client-Secret": apikey,
        },
        transformResponse: [
          (data) => {
            const parsedData = JSON.parse(data);
            const items = parsedData.items;
            const links = items.map((item) => item.originallink);
            return links;
          },
        ],
      }
    );
    const data = await resp.data;
    return data;
  } catch (error) {
    console.error(error);
  }
};*/

const getDoc = async (link) => {
  try {
    const resp = await axios.get(link, {
      headers: {
        "User-Agent": "Chrome/137.0.7151.69",
      },
      responseType: "document",
    });
    return resp.data;
  } catch (error) {
    console.error(error);
  }
};

const getOGimg = (doc) => {
  try {
    const $ = cheerio.load(doc);
    const ogImg = $('meta[property="og:image"]').attr("content");
    return ogImg;
  } catch (error) {
    console.error(error);
  }
};

// const func = async (query) => {
//   const links = await getLinks(query);
//   const docs = await Promise.all(links.map((link) => getDoc(link)));
//   const ogImgs = docs.map((doc) => getOGimg(doc));
//   return ogImgs;
// };

export default async function thumbHandler(request, response) {
  if (request.method !== 'POST'){
    response.setHeader('Allow', ['POST']);
    return response.status(405).end('Method Not Allowed');
  }

  const { links } = request.body;

  if (!links||links.length===0) return response.status(400).json({
    error: 'An Array of Links Required'
  })

  try {
    const docsProms = links.map((link) => getDoc(link));
    const docs = await Promise.all(docsProms);
    const ogImgs = docs.map((doc) => getOGimg(doc));
    return response.status(200).json({thumbs:ogImgs});
  } catch (error) {
    return response.status(500).json({error: 'Failed to Extract Thumbnail Links'});
  }
}
