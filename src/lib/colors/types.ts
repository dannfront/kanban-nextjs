export type Luminosity = "bright" | "light" | "dark" | "random";

export type Hue =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "monochrome"
  | "random";

export interface GenerateColorOptions {
  hue?: Hue;
  luminosity?: Luminosity;
  seed?: string | number;
  count?: number;
}

export interface ColorRepository {
  generate(options?: GenerateColorOptions): string;
  generateMany(count: number, options?: GenerateColorOptions): string[];
}
