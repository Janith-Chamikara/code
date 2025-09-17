"use client";

// Lazy-load to keep your initial bundle small
let modelPromise: Promise<any> | null = null;

async function loadModel() {
  const tf = await import("@tensorflow/tfjs"); // required on client
  const nsfw = await import("nsfwjs");
  modelPromise ??= nsfw.load(); // downloads default hosted model
  return modelPromise;
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function dataURLToImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Returns { decision: 'allow' | 'review' | 'block', scores, preds } */
export async function nsfwCheckFile(file: File) {
  const dataUrl = await fileToDataURL(file);
  const img = await dataURLToImage(dataUrl);

  const model = await loadModel();
  const preds: { className: string; probability: number }[] =
    await model.classify(img);

  const score = (name: string) =>
    preds.find((p) => p.className === name)?.probability ?? 0;
  const scores = {
    Neutral: score("Neutral"),
    Drawing: score("Drawing"),
    Sexy: score("Sexy"),
    Porn: score("Porn"),
    Hentai: score("Hentai"),
  };

  // 🔧 Policy (tune as you like)
  const decision =
    scores.Porn >= 0.85 || scores.Hentai >= 0.85
      ? "block"
      : scores.Sexy >= 0.6
      ? "review"
      : "allow";

  return { decision, scores, preds };
}
