import Module from "node:module";

type LoadFn = (
  request: string,
  parent: object,
  isMain: boolean
) => unknown;

interface ModuleWithLoad {
  _load: LoadFn;
}

const moduleWithLoad = Module as unknown as ModuleWithLoad;
const originalLoad = moduleWithLoad._load;

moduleWithLoad._load = function (
  request: string,
  parent: object,
  isMain: boolean
): unknown {
  if (request === "server-only") {
    return {};
  }

  if (request === "next/cache") {
    return {
      revalidatePath: () => undefined,
      revalidateTag: () => undefined,
    };
  }

  return originalLoad(request, parent, isMain);
};
