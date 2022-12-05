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
  const wpScript = document.querySelector("script.wp-playlist-script")!.innerHTML;
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
async function oneline() {
  // 这一行直接拿到命令行运行应该就有了
  // prettier-ignore
  await Promise.all( JSON.parse(document.querySelector("script.wp-playlist-script")!.innerHTML) .tracks.map((item) => `${window.location.origin}/getvddr/video?id=${item.src1}&type=mix`) .map(async (item) => fetch(item).then((rep) => rep.json())), );
}

/** 字幕 */
const downloadVtt = (url, name) => {
  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((arrayBuffer) => {
      let eAB = arrayBuffer,
        wordArray = CryptoJS.lib.WordArray.create(eAB.slice(16)),
        hexStr = Array.prototype.map
          .call(new Uint8Array(eAB.slice(0, 16)), (x) => ("00" + x.toString(16)).slice(-2))
          .join(""),
        wordArray2 = CryptoJS.enc.Hex.parse(hexStr),
        jsdec = CryptoJS.AES.decrypt(
          {
            ciphertext: wordArray,
          },
          wordArray2,
          {
            iv: wordArray2,
            mode: CryptoJS.mode.CBC,
          },
        ),
        binary_string = window.atob(jsdec.toString(CryptoJS.enc.Base64)),
        len = binary_string.length,
        bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
      let blobStr = pako.ungzip(bytes.buffer, {
        to: "string",
      });
      blobStr = blobStr.replaceAll("&lrm;", "");
      console.dir(window.URL.createObjectURL(new Blob([blobStr])));
      return;
      const a = document.createElement("a"),
        objectUrl = window.URL.createObjectURL(new Blob([blobStr]));
      (a.download = name),
        (a.href = objectUrl),
        a.click(),
        window.URL.revokeObjectURL(objectUrl),
        a.remove();
    });
};
const vttUrl = "https://ddys.tv/subddr/v/west_drama/BlackMirror/BlackMirror_s02e01.ddr";
