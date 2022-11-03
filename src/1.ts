const https = require("https");
const cheerio = require("cheerio");

function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let html = "";
      res.on("data", (chunk) => {
        html += chunk;
      });
      res.on("end", () => {
        resolve(html);
      });
    });
  });
}

/** node脚本 */
async function main() {
  const target = {
    name: "peaky-blinders",
    season: 1,
    origin: "https://ddys.tv",
  };
  const targetUrl = `${target.origin}/${target.name}/${target.season === 1 ? "" : target.season}`;
  const ddrkHtml = await request(targetUrl);
  const $ = cheerio.load(ddrkHtml);
  const wpScript = $("script.wp-playlist-script").text();
  const tracks = JSON.parse(wpScript).tracks;
  const resUrls = tracks.map((item) => `${target.origin}/getvddr/video?id=${item.src1}&type=mix`);
  const videoUrls = resUrls.map((url) => {
    return request(url);
  });
  const result = await Promise.all(videoUrls);
  console.log("| ", result);
}

main();

/** 控制台使用 */
async function consoleDown() {
  const wpScript = document.querySelector("script.wp-playlist-script").innerHTML;
  const resources = JSON.parse(wpScript).tracks.map((item) => {
    const regResult = item.src0.match(/^\/v\/(\w*)\/(\w*)/);
    return {
      name: regResult[2],
      ep: item.caption,
      catalog: regResult[1],
      src1: `${window.location.origin}/getvddr/video?id=${item.src1}&type=mix`,
    };
  });
  const result = await Promise.all(
    resources.map(async (item) => {
      const res = await fetch(item.src1);
      const resJson = await res.json();
      return {
        name: item.name,
        ep: item.ep,
        catalog: item.catalog,
        video: resJson?.url.replace("=1", `=${item.name}[${item.ep}]`),
        cache: resJson?.cache,
      };
    }),
  );

  // result.forEach((item) => {
  //   console.dir(item.ep);
  //   console.dir(item.video);
  // });
}

// 命令行压缩版本
async function console() {
  // 这一行直接拿到命令行运行应该就有了
  // prettier-ignore
  await Promise.all( JSON.parse(document.querySelector("script.wp-playlist-script").innerHTML) .tracks.map((item) => `${window.location.origin}/getvddr/video?id=${item.src1}&type=mix`) .map(async (item) => fetch(item).then((rep) => rep.json())), );
}
