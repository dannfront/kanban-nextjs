declare module "*.svg" {
  const content: { src: string; width: number; height: number };
  export default content;
}

declare module "*.png" {
  const content: { src: string; width: number; height: number };
  export default content;
}
