import { expect } from 'chai';
import wrap from '../src/wrap.js';

describe('wrap', () => {
  it('passes strings and values as tagged templates expect', () => {
    let calledCount = 0;
    let calledArgs;
    const html = wrap((...args) => { calledCount += 1; calledArgs = args; });
    class MyLily extends HTMLElement {}

    html`<${MyLily} id="${'my-id'}">${'my text'}</${MyLily}>`;
    expect(calledCount).to.equal(1);
    expect(calledArgs).to.deep.equal([['<my-lily id="', '">', '</my-lily>'], 'my-id', 'my text']);
  });

  it('integrates with lit-html', async () => {
    const { html: litHtml, TemplateResult, render } = await import('lit-html');

    const html = wrap(litHtml);
    class MyAzalea extends HTMLElement {}

    const template = html`<${MyAzalea} id="${'my-id'}">${'my text'}</${MyAzalea}>`;
    expect(template).to.be.instanceof(TemplateResult);

    const fixture = document.createElement('div');
    document.body.appendChild(fixture);
    render(template, fixture);

    const el = fixture.children[0];

    expect(el).to.be.instanceof(MyAzalea);
    expect(el.getAttribute('id')).to.equal('my-id');
    expect(el.textContent).to.equal('my text');

    document.body.removeChild(fixture);
  });

  it('integrates with htm', async () => {
    const { default: htm } = await import('htm');
    const { h, Component: PreactComponent, render } = await import('preact');

    const html = wrap(htm.bind(h));

    const PreactButton = (props) => html`<button ...${props}>${props.children}</button>`;

    class CustomHello extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = this.render();
      }

      static get observedAttributes() { return ['name']; }

      attributeChangedCallback() {
        this.shadowRoot.innerHTML = this.render();
      }

      render() {
        return `<p>Hello, ${this.nameValue}!</p>`;
      }

      get nameValue() {
        return this.getAttribute('name') || 'unknown';
      }
    }

    class PreactApp extends PreactComponent {
      // eslint-disable-next-line class-methods-use-this
      render() {
        const clickHandler = () => {
          document.querySelector('#hello').setAttribute('name', 'world');
        };
        return html`
          <div class="app">
            <${PreactButton} onClick="${clickHandler}">Say hello to the world!<//>
            <${CustomHello} id="hello"></${CustomHello}>
          </div>
        `;
      }
    }

    const fixture = document.createElement('div');
    document.body.appendChild(fixture);

    render(html`<${PreactApp} />`, fixture);

    expect(fixture.children.length).to.equal(1);

    const appElement = fixture.children[0];
    expect(appElement.tagName).to.equal('DIV');
    expect(appElement.className).to.equal('app');
    expect(appElement.children.length).to.equal(2);

    const buttonElement = appElement.children[0];
    expect(buttonElement.tagName).to.equal('BUTTON');
    expect(buttonElement.innerText).to.equal('Say hello to the world!');

    const helloElement = appElement.children[1];
    expect(helloElement.tagName).to.equal('CUSTOM-HELLO');
    expect(helloElement.id).to.equal('hello');
    expect(helloElement.shadowRoot.children.length).to.equal(1);

    expect(helloElement.shadowRoot.children[0].tagName).to.equal('P');
    expect(helloElement.shadowRoot.children[0].innerText).to.equal('Hello, unknown!');

    buttonElement.click();
    expect(helloElement.shadowRoot.children[0].innerText).to.equal('Hello, world!');

    document.body.removeChild(fixture);
  });
});
