import "./style.css";

async function main() {
  polyfillConsole();
  createBtn();
  // const data = await download();
}

function showPopup() {
  // const popup = document.createElement("div");
  // document.body.appendChild(popup);
  // popup.classList.add("ddd-popup");
}

function createBtn() {
  const app = document.createElement("span");
  app.classList.add("ddd-btn");
  app.innerHTML = "下载";
  app.addEventListener("click", download);

  const appWrap = document.querySelector(`.entry>p [style="float:right;"]:not([class])`);
  appWrap!.innerHTML = "";
  appWrap?.appendChild(app);
}

/** 通过 iframe 补回 console.log */
function polyfillConsole() {
  const iframe = document.createElement("iframe") as any;
  document.body.appendChild(iframe);
  window.console = iframe.contentWindow?.console;
}

async function download() {
  const wpScript = document.querySelector("script.wp-playlist-script")?.innerHTML;
  if (!wpScript) return;
  const tracks: trackItem[] = JSON.parse(wpScript).tracks;
  // console.log("| ", tracks);
  const resources = tracks.map((item) => {
    const regResult = item.src0.match(/^\/v\/((\w*)\/(.*))/);
    return {
      name: regResult ? regResult[1] : "匹配失败",
      ep: item.caption,
      catalog: regResult ? regResult[2] : "匹配失败",
      src1: `${window.location.origin}/getvddr/video?id=${item.src1}&type=mix`,
    };
  });
  const result = await Promise.all(
    resources.map(async (item) => {
      const res = await fetch(item.src1);
      /**  | { error: number } */
      const resJson = (await res.json()) as { url: string; cache: string };
      if (resJson.url === undefined) return;
      return {
        name: item.name,
        ep: item.ep,
        catalog: item.catalog,
        video: resJson?.url.replace("=1", item.name),
        cache: resJson?.cache,
      };
    }),
  );
  console.log(result);
}

main();
