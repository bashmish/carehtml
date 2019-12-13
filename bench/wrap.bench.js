import { html as litHtml, render } from 'lit-html';
import wrap from '../src/wrap.js';

class DefinedElement extends HTMLElement {}
window.customElements.define('defined-element', DefinedElement);

class StaticClass extends HTMLElement {}

const careHtml = wrap(litHtml);

// this ugly hack is needed to work around benchmark.js compilation issues
window.litHtml = litHtml;
window.careHtml = careHtml;
window.StaticClass = StaticClass;

suite('create template for lit-html', () => {
  benchmark('clean html`<el-name></el-name>`', () => {
    litHtml`<defined-element></defined-element>`;
  });

  benchmark('care(html)`<el-name></el-name>`', () => {
    careHtml`<defined-element></defined-element>`;
  });

  // eslint-disable-next-line no-template-curly-in-string
  benchmark('care(html)`<${ElClass}></${ElClass}>`', () => {
    careHtml`<${StaticClass}></${StaticClass}>`;
  });
});

suite('render template for lit-html', () => {
  benchmark('clean html`<el-name></el-name>`', function () {
    render(this.template, this.wrapper);
  }, {
    setup() {
      const div = document.createElement('div');
      document.body.appendChild(div);
      this.wrapper = div;
      this.template = litHtml`<defined-element></defined-element>`;
    },
    teardown() {
      document.body.removeChild(this.wrapper);
    },
  });

  benchmark('care(html)`<el-name></el-name>`', function () {
    render(this.template, this.wrapper);
  }, {
    setup() {
      const div = document.createElement('div');
      document.body.appendChild(div);
      this.wrapper = div;
      this.template = careHtml`<defined-element></defined-element>`;
    },
    teardown() {
      document.body.removeChild(this.wrapper);
    },
  });

  // eslint-disable-next-line no-template-curly-in-string
  benchmark('care(html)`<${ElClass}></${ElClass}>`', function () {
    render(this.template, this.wrapper);
  }, {
    setup() {
      const div = document.createElement('div');
      document.body.appendChild(div);
      this.wrapper = div;
      this.template = careHtml`<${StaticClass}></${StaticClass}>`;
    },
    teardown() {
      document.body.removeChild(this.wrapper);
    },
  });
});

suite('create and render template for lit-html', () => {
  benchmark('clean html`<el-name></el-name>`', function () {
    render(litHtml`<defined-element></defined-element>`, this.wrapper);
  }, {
    setup() {
      const div = document.createElement('div');
      document.body.appendChild(div);
      this.wrapper = div;
    },
    teardown() {
      document.body.removeChild(this.wrapper);
    },
  });

  benchmark('care(html)`<el-name></el-name>`', function () {
    render(careHtml`<defined-element></defined-element>`, this.wrapper);
  }, {
    setup() {
      const div = document.createElement('div');
      document.body.appendChild(div);
      this.wrapper = div;
    },
    teardown() {
      document.body.removeChild(this.wrapper);
    },
  });

  // eslint-disable-next-line no-template-curly-in-string
  benchmark('care(html)`<${ElClass}></${ElClass}>`', function () {
    render(careHtml`<${StaticClass}></${StaticClass}>`, this.wrapper);
  }, {
    setup() {
      const div = document.createElement('div');
      document.body.appendChild(div);
      this.wrapper = div;
    },
    teardown() {
      document.body.removeChild(this.wrapper);
    },
  });
});
