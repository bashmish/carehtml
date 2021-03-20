export default function wrap<T>(
  html: (strings: TemplateStringsArray, ...values: unknown[]) => T,
): (strings: TemplateStringsArray, ...values: unknown[]) => T;
