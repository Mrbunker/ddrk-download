import "./style.css";
import { trackItem } from "./type";

async function main() {
  const wpScript = document.querySelector("script.wp-playlist-script")?.innerHTML;
  if (!wpScript) return;

  // polyfillConsole();
  const popup = createPopup();
  createBtn(popup, wpScript);
}

function createPopup() {
  const popup = document.createElement("div");
  document.body.appendChild(popup);
  popup.classList.add("ddd-popup");
  popup.style.display = "none";
  return popup;
}

function createBtn(popup: HTMLDivElement, wpScript: string) {
  const app = document.createElement("span");
  app.classList.add("ddd-btn");
  app.innerHTML = "下载";
  let firtClick = true;
  app.addEventListener("click", async () => {
    popup.style.display = popup.style.display === "none" ? "block" : "none";
    if (!firtClick) return;
    const data = await download(wpScript);
    const popupStr = data
      .map(
        (item) =>
          `<div>
            <span>${item?.ep}</span>
            <a href="${item?.video ? item?.video : "无"}">链接</a>
          </div>`,
      )
      .join("");
    popup.innerHTML = popupStr;
    firtClick = false;
  });

  const appWrap = document.querySelector(`.entry>p [style="float:right;"]:not([class])`);
  appWrap!.innerHTML = "";
  appWrap?.appendChild(app);
}

/** 通过 iframe 补回 console.log */
// function polyfillConsole() {
//   const iframe = document.createElement("iframe") as any;
//   document.body.appendChild(iframe);
//   window.console = iframe.contentWindow?.console;
// }

async function download(wpScript: string) {
  const tracks: trackItem[] = JSON.parse(wpScript).tracks;
  const resources = tracks.map((item) => {
    const regResult = item.src0.match(/^\/v\/((\w*)\/(.*))/);
    const locationOrigin = window.location.origin;
    return {
      name: regResult ? regResult[1] : "匹配失败",
      ep: item.caption,
      catalog: regResult ? regResult[2] : "匹配失败",
      src1: `${locationOrigin}/getvddr/video?id=${item.src1}&type=mix`,
      subtitle: `${locationOrigin}/subddr${item.subsrc}`,
    };
  });
  return await Promise.all(
    resources.map(async (item) => {
      const res = await fetch(item.src1);
      /**  | { error: number } */
      const resJson = (await res.json()) as { url: string; cache: string };
      const video = resJson?.url ? resJson?.url.replace("=1", item.name) : undefined;
      return {
        name: item.name,
        ep: item.ep,
        catalog: item.catalog,
        video,
        cache: resJson?.cache,
      };
    }),
  );
}

main();
