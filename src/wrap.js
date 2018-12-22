import transform from './transform.js';

export default function wrap(html) {
  // eslint-disable-next-line prefer-spread
  return (strings, ...values) => html.apply(null, transform(strings, values));
}
