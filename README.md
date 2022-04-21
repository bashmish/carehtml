# carehtml (Custom Auto Registered Elements HTML)

Templates with automatic registration of Custom Elements.

```js
const template = html`<${CustomElement}></${CustomElement}>`;
```

Inspired by [JSX](https://reactjs.org/docs/introducing-jsx.html) in general and [htm](https://www.npmjs.com/package/htm) in particular.

## Motivation

There are 2 main reasons Web Components need something like this:

1. Lack of scoping when registering Custom Elements which creates issues in tests and makes it impossible to have 2 different components with the same name.
2. Inability to have 2 different versions of the same Custom Element when refactoring from an old to a new version, especially when having nested node modules.

## Usage with Lit

You need to wrap the Lit `html` tag:

```js
import { LitElement, html as litHtml } from 'lit';
import takeCareOf from 'carehtml';

const html = takeCareOf(litHtml);

class MySearchBar extends LitElement {
  render() {
    return html`
      <${MyInput} name="query"></${MyInput}>
      <${MyButton}>
        <${MyIcon} icon="search"></${MyIcon}>
        Search
      </${MyButton}>
    `;
  }
}
```

> Wrapping is extra work which might seem unnecessary in the user code, but that allows to decouple `carehtml` from `lit`, primarily in terms of npm dependencies.
> This allows to use `carehtml` with any version of `lit` and develop `carehtml` with its independent release cycle.

## Usage with Other Templating Libraries Based on Tagged Templates

In fact it can work with any other templating library which relies on [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates).
For example with `htm` allowing to mix Custom Element classes with Preact components (and any other components supported by `htm` including React ones).

This is an example taken from the `htm` docs with one change: instead of simple `<button>` there is a Custom Element based `Button` from new [Material Web Components](https://github.com/material-components/material-components-web-components).

```js
import htm from 'htm';
import { h, Component, render } from 'preact';
import { Button } from '@material/mwc-button';
import takeCareOf from 'carehtml';

const html = takeCareOf(htm.bind(h));

class App extends Component {
  addTodo() {
    const { todos = [] } = this.state;
    this.setState({ todos: todos.concat(`Item ${todos.length}`) });
  }
  render({ page }, { todos = [] }) {
    return html`
      <div class="app">
        <${Header} name="ToDo's (${page})" />
        <ul>
          ${todos.map((todo) => html`<li>${todo}</li>`)}
        </ul>
        <${Button} onClick=${this.addTodo.bind(this)}>Add Todo</${Button}>
        <${Footer}>footer content here<//>
      </div>
    `;
  }
}

render(html`<${App} page="All" />`, document.body);
```

## Usage in Tests

```js
import { html as litHtml, render } from 'lit';
import takeCareOf from 'carehtml';

const html = takeCareOf(litHtml);

describe('MyMixin', () => {
  it('does something', () => {
    class MyElement extends MyMixin(HTMLElement) {
      // define extra behavior
    }

    // create fixture
    // (html`` in this context returns TemplateResult as if it was Lit itself)
    const element = fixture(html`<${MyElement}></${MyElement}>`);

    // test mixin/element behavior
  });
});

function fixture(litTemplate) {
  // please use smth like this in real life
  // https://open-wc.org/recommendations/testing-helpers.html#test-a-custom-element-with-properties
  const wrapper = document.createElement('div');
  render(litTemplate, wrapper);
  document.body.appendChild(wrapper);
  return wrapper.children[0];
}
```

## Benchmarks

Runtime performance is not the key requirement for `carehtml` since the end goal is to compile the code and have static and still unique tag names in the production code.
But some numbers might be interesting to show the impact of such solution on local development and the potential runtime usage in production for projects that want to stay compilation-free.

There are 2 things which `carehtml` can slow down and which can be measured: creating a template and rendering a template.
Both can be measured together as well.

The original idea was that the benchmarks need to compare the most minimalistic template possible, e.g. `<my-element></my-element>` where `MyElement` does not render any internal template, otherwise the benchmarks will measure the DOM update caused by the internal template instead of the `carehtml` overhead.
It turned out to be quite difficult to see the `carehtml` impact in such benchmarks, because it's insignificant as compared to even rendering such a minimalistic `<my-element></my-element>` template.
You can play around with this by using `yarn bench:create-and-render:chrome` script and alike and modifying the `benchmarks/index.html` to your needs, e.g. by removing the constructors of the measured elements.

The only thing that makes sense to measure in this situation is the rerendering.
The idea is to check if it does not rerender unnecessarily second time when the classes stay the same meaning that the actual template is also the same.
That's what makes Lit so fast after all and `carehml` should not break this essential optimisation.
In such benchmarks the `<my-element></my-element>` should have an internal template which will take most of the time of each render, so that the rerendering (if it happens) is close to being 2 times slower due to that internal template being rendered again.
The end setup has `MyElement` with a shadow root with 100000 divs containing some text.
The script `yarn bench:create-and-render-twice` can be used to measure that.
The goal is to have the same numbers when using Lit `html` directly or wrapped with `carehtml`.

These are the results for Chrome which clearly show no overhead on rerendering when wrapping with `carehtml`:

| Benchmark            |          Avg time |                                vs direct |                               vs wrapped |                  vs wrapped with classes |
| -------------------- | ----------------: | ---------------------------------------: | ---------------------------------------: | ---------------------------------------: |
| direct               | 52.30ms - 53.12ms |                                        - | unsure<br>-2% - +1%<br>-0.99ms - +0.44ms | unsure<br>-2% - +0%<br>-1.08ms - +0.04ms |
| wrapped              | 52.40ms - 53.57ms | unsure<br>-1% - +2%<br>-0.44ms - +0.99ms |                                        - | unsure<br>-2% - +1%<br>-0.94ms - +0.46ms |
| wrapped with classes | 52.85ms - 53.61ms | unsure<br>-0% - +2%<br>-0.04ms - +1.08ms | unsure<br>-1% - +2%<br>-0.46ms - +0.94ms |                                        - |

Measurements in other browsers are similar.

## Special Thanks

[![BrowserStack](./docs/browserstack-logo.svg)](https://www.browserstack.com)

For their awesome cross-browser testing automation solution!
