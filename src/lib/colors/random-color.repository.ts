import randomcolor from "randomcolor";
import type { ColorRepository, GenerateColorOptions, Luminosity } from "./types";

const DEFAULT_LUMINOSITY: Luminosity = "light";

export class RandomColorRepository implements ColorRepository {
  private readonly defaultLuminosity: Luminosity;

  constructor(defaultLuminosity: Luminosity = DEFAULT_LUMINOSITY) {
    this.defaultLuminosity = defaultLuminosity;
  }

  generate(options?: GenerateColorOptions): string {
    return this.generateCore({ ...options, count: 1 })[0];
  }

  generateMany(count: number, options?: GenerateColorOptions): string[] {
    return this.generateCore({ ...options, count });
  }

  private generateCore(options: GenerateColorOptions & { count: number }): string[] {
    return randomcolor({
      format: "hex",
      luminosity: options.luminosity ?? this.defaultLuminosity,
      hue: options.hue,
      seed: options.seed,
      count: options.count,
    });
  }
}
