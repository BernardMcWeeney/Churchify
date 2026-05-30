export const imageMeta = {
  "/logo.png": { width: 500, height: 500, type: "image/png" },
  "/parishes/donore-church.webp": { width: 1739, height: 835, type: "image/webp" },
  "/parishes/duleek-aerial.webp": { width: 1024, height: 682, type: "image/webp" },
  "/parishes/holy-family-church.webp": { width: 960, height: 960, type: "image/webp" },
  "/parishes/st-marys-altar.jpg": { width: 1024, height: 573, type: "image/jpeg" },
  "/parishes/drumconrath-home.webp": { width: 1024, height: 683, type: "image/webp" },
  "/parishes/bohermeen-church.webp": { width: 1400, height: 934, type: "image/webp" },
  "/parishes/ballivor-church.jpg": { width: 1801, height: 949, type: "image/jpeg" },
  "/parishes/oldcastle-church.avif": { width: 1663, height: 2560, type: "image/avif" },
  "/parishes/screenshots/donore-rossnaree-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parishes/screenshots/drumconrath-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parishes/screenshots/bohermeen-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parishes/screenshots/holy-family-drogheda-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parishes/screenshots/ballivor-kildalkey-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parishes/screenshots/oldcastle-moylagh-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parishes/screenshots/duleek-bellewstown-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parishes/screenshots/st-marys-drogheda-parish.webp": { width: 1600, height: 1000, type: "image/webp" },
  "/parish-digital.jpg": { width: 900, height: 500, type: "image/jpeg" },
  "/st-patricks-cathedral.webp": { width: 1000, height: 668, type: "image/webp" },
  "/St-Patrick-Cathedral.avif": { width: 3840, height: 1280, type: "image/avif" },
  "/cat1-st-fin-barre-cork.webp": { width: 819, height: 545, type: "image/webp" },
  "/cat2-christ-church-cathedral.webp": { width: 819, height: 548, type: "image/webp" },
  "/john-s-lane-church-inside-st-augustine-st-catholic-popularly-known-as-dublin-ireland-35101065.webp": {
    width: 800,
    height: 534,
    type: "image/webp"
  }
} as const;

export const getImageMeta = (src: string) => imageMeta[src as keyof typeof imageMeta];
