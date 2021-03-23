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

## Usage with lit-html and LitElement

You need to wrap the lit-html:

```js
import { LitElement, html as litHtml } from '@polymer/lit-element';
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

> Wrapping the lit-html function is extra work which might seem unnecessary in the user code, but that allows to decouple `carehtml` from `lit-html`, primarily in terms of npm dependencies.
> This allows to use `carehtml` with any version of `lit-html` and develop `carehtml` with its independent release cycle.

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
import { html as litHtml, render } from 'lit-html';
import takeCareOf from 'carehtml';

const html = takeCareOf(litHtml);

describe('MyMixin', () => {
  it('does something', () => {
    class MyElement extends MyMixin(HTMLElement) {
      // define extra behavior
    }

    // create fixture
    // (html`` in this context returns a lit-html TemplateResult as if it was lit-html itself)
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

Test configuration:

- MacBook Pro (15-inch, 2016)
- Mac OS X 10.14.6

First numbers show the difference in creating a template between using `lit-html` directly, doing same via `carehtml` wrapper, and most importantly, using Custom Element classes in place of tag names.

| create template for lit-html            |      ops/sec |
| --------------------------------------- | -----------: |
| Chrome 79.0.3945                        |              |
| clean html\`\<el-name>\</el-name>\`     |  `149575145` |
| care(html)\`\<el-name>\</el-name>\`     |   `30728712` |
| care(html)\`<${ElClass}></${ElClass}>\` |    `4654638` |
| Firefox 71.0.0                          |              |
| clean html\`\<el-name>\</el-name>\`     | `1268411403` |
| care(html)\`\<el-name>\</el-name>\`     |    `7112878` |
| care(html)\`<${ElClass}></${ElClass}>\` |    `1551298` |
| Safari 13.0.3                           |              |
| clean html\`\<el-name>\</el-name>\`     |   `29071424` |
| care(html)\`\<el-name>\</el-name>\`     |    `7572036` |
| care(html)\`<${ElClass}></${ElClass}>\` |    `1800394` |

Next numbers show the rendering times of those from above.

| render template for lit-html            |    ops/sec |
| --------------------------------------- | ---------: |
| Chrome 79.0.3945                        |            |
| clean html\`\<el-name>\</el-name>\`     | `20270378` |
| care(html)\`\<el-name>\</el-name>\`     | `20915893` |
| care(html)\`<${ElClass}></${ElClass}>\` | `20682304` |
| Firefox 71.0.0                          |            |
| clean html\`\<el-name>\</el-name>\`     |  `3252965` |
| care(html)\`\<el-name>\</el-name>\`     |  `3418368` |
| care(html)\`<${ElClass}></${ElClass}>\` |  `3228236` |
| Safari 13.0.3                           |            |
| clean html\`\<el-name>\</el-name>\`     | `10930284` |
| care(html)\`\<el-name>\</el-name>\`     | `10873434` |
| care(html)\`<${ElClass}></${ElClass}>\` | `10822978` |

Next numbers show the combination of both.

| create and render template for lit-html |    ops/sec |
| --------------------------------------- | ---------: |
| Chrome 79.0.3945                        |            |
| clean html\`\<el-name>\</el-name>\`     | `13208368` |
| care(html)\`\<el-name>\</el-name>\`     |  `8984663` |
| care(html)\`<${ElClass}></${ElClass}>\` |   `559925` |
| Firefox 71.0.0                          |            |
| clean html\`\<el-name>\</el-name>\`     |  `3237455` |
| care(html)\`\<el-name>\</el-name>\`     |  `2107983` |
| care(html)\`<${ElClass}></${ElClass}>\` |   `279335` |
| Safari 13.0.3                           |            |
| clean html\`\<el-name>\</el-name>\`     |  `8824180` |
| care(html)\`\<el-name>\</el-name>\`     |  `5019988` |
| care(html)\`<${ElClass}></${ElClass}>\` |   `777846` |

## Special Thanks

[![BrowserStack](./docs/browserstack-logo.svg)](https://www.browserstack.com)

For their awesome cross-browser testing automation solution!
