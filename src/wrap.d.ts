declare const wrap: <T>(html: (strings: TemplateStringsArray, ...values: unknown[]) => T) => (strings: TemplateStringsArray, ...values: unknown[]) => T;

export default wrap;
