import { expect } from '@bundled-es-modules/chai';
import transform from './transform.js';

const testhtml = (strings, ...values) => [strings, values];
const getNameForCEClass = (klass) => transform(['', ''], [klass])[0][0];

describe('transform', () => {
  it('registers names for Custom Element classes in values and concatenates strings with those names', () => {
    class MyTulip extends HTMLElement {}
    const [strings, ...values] = transform(...testhtml`<${MyTulip} id="${'my-id'}">${'my text'}</${MyTulip}>`);
    expect(strings).to.deep.equal(['<my-tulip id="', '">', '</my-tulip>']);
    expect(values).to.deep.equal(['my-id', 'my text']);
    expect(customElements.get('my-tulip')).to.equal(MyTulip);
  });

  it('does not throw on nullish values', () => {
    class MyHops extends HTMLElement {}
    expect(transform(...testhtml`<${MyHops} attribute=${null}></${MyHops}>`)).to.not.throw;
    expect(transform(...testhtml`<${MyHops} attribute=${undefined}></${MyHops}>`)).to.not.throw;
    expect(transform(...testhtml`<${MyHops}>${null}</${MyHops}>`)).to.not.throw;
    expect(transform(...testhtml`<${MyHops}>${undefined}</${MyHops}>`)).to.not.throw;
  });

  describe('concatenation', () => {
    it('concatenates element names with no other expressions', () => {
      class MyViolet extends HTMLElement {}
      const [strings, ...values] = transform(...testhtml`<${MyViolet}></${MyViolet}>`);
      expect(strings).to.deep.equal(['<my-violet></my-violet>']);
      expect(values).to.deep.equal([]);
      expect(customElements.get('my-violet')).to.equal(MyViolet);
    });

    it('concatenates element names with a text node expression', () => {
      class MyDaisy extends HTMLElement {}
      const [strings, ...values] = transform(...testhtml`<${MyDaisy}>${'my text'}</${MyDaisy}>`);
      expect(strings).to.deep.equal(['<my-daisy>', '</my-daisy>']);
      expect(values).to.deep.equal(['my text']);
      expect(customElements.get('my-daisy')).to.equal(MyDaisy);
      const [strings2, ...values2] = transform(...testhtml`<${MyDaisy}>my text</${MyDaisy}>`);
      expect(strings2).to.deep.equal(['<my-daisy>my text</my-daisy>']);
      expect(values2).to.deep.equal([]);
    });

    it('concatenates element names with an attribute value expression', () => {
      class MySunflower extends HTMLElement {}
      const [strings, ...values] = transform(...testhtml`<${MySunflower} id="${'my-id'}"></${MySunflower}>`);
      expect(strings).to.deep.equal(['<my-sunflower id="', '"></my-sunflower>']);
      expect(values).to.deep.equal(['my-id']);
      expect(customElements.get('my-sunflower')).to.equal(MySunflower);
      const [strings2, ...values2] = transform(...testhtml`<${MySunflower} id="my-id"></${MySunflower}>`);
      expect(strings2).to.deep.equal(['<my-sunflower id="my-id"></my-sunflower>']);
      expect(values2).to.deep.equal([]);
    });

    it('keeps untouched when there are no expressions', () => {
      class MyRose extends HTMLElement {}
      const [strings, ...values] = transform(...testhtml`<my-rose></my-rose>`);
      expect(strings).to.deep.equal(['<my-rose></my-rose>']);
      expect(values).to.deep.equal([]);
      expect(customElements.get('my-rose')).to.not.equal(MyRose);
    });

    it('ignores unrelated classes', () => {
      class MyMagnolia {}
      const [strings, ...values] = transform(...testhtml`<${MyMagnolia}></${MyMagnolia}>`);
      expect(strings).to.deep.equal(['<', '></', '>']);
      expect(values).to.deep.equal([MyMagnolia, MyMagnolia]);
      expect(customElements.get('my-magnolia')).to.not.exist;
      const [strings2, ...values2] = transform(...testhtml`<${MyMagnolia}/>`);
      expect(strings2).to.deep.equal(['<', '/>']);
      expect(values2).to.deep.equal([MyMagnolia]);
    });
  });

  describe('name generator', () => {
    it('derives a name from the constructor by transforming it to dash-case', () => {
      class MyCrocus extends HTMLElement {}
      expect(getNameForCEClass(MyCrocus)).to.equal('my-crocus');
      expect(customElements.get('my-crocus')).to.equal(MyCrocus);
    });

    it('does not register the same class twice', () => {
      class MyIris extends HTMLElement {}
      expect(getNameForCEClass(MyIris)).to.equal('my-iris');
      expect(getNameForCEClass(MyIris)).to.equal('my-iris');
      expect(customElements.get('my-iris')).to.equal(MyIris);
    });

    it('adds an incremented index to the name if the same constructor name is encountered', () => {
      const name1 = (() => {
        class MyPrimrose extends HTMLElement {}
        return getNameForCEClass(MyPrimrose);
      })();
      const name2 = (() => {
        class MyPrimrose extends HTMLElement {}
        return getNameForCEClass(MyPrimrose);
      })();
      expect(name1).to.equal('my-primrose');
      expect(name2).to.equal('my-primrose-2');
    });

    it('adds an incremented index to the name if the same name was registered natively before', () => {
      customElements.define('my-hibiscus', class extends HTMLElement {});
      const name2 = (() => {
        class MyHibiscus extends HTMLElement {}
        return getNameForCEClass(MyHibiscus);
      })();
      expect(name2).to.equal('my-hibiscus-2');
      customElements.define('my-hibiscus-3', class extends HTMLElement {});
      const name4 = (() => {
        class MyHibiscus extends HTMLElement {}
        return getNameForCEClass(MyHibiscus);
      })();
      expect(name4).to.equal('my-hibiscus-4');
    });

    it('adds a prefix "c-" if constructor name in dash-case has no dash', () => {
      const name1 = (() => {
        class Moonflower extends HTMLElement {}
        return getNameForCEClass(Moonflower);
      })();
      const name2 = (() => {
        class Moonflower extends HTMLElement {}
        return getNameForCEClass(Moonflower);
      })();
      expect(name1).to.equal('c-moonflower');
      expect(name2).to.equal('c-moonflower-2');
      customElements.define('c-moonflower-3', class extends HTMLElement {});
      const name4 = (() => {
        class Moonflower extends HTMLElement {}
        return getNameForCEClass(Moonflower);
      })();
      expect(name4).to.equal('c-moonflower-4');
    });

    it('fallbacks to a name "c-%index%" if constructor has no name', () => {
      const createAnonymousCEClass = () => eval('(() => class extends HTMLElement {})()'); // eslint-disable-line no-eval
      const name1 = (() => {
        const MyOrchid = createAnonymousCEClass();
        return getNameForCEClass(MyOrchid);
      })();
      const name2 = (() => {
        const MyOrchid = createAnonymousCEClass();
        return getNameForCEClass(MyOrchid);
      })();
      expect(name1).to.equal('c-1');
      expect(name2).to.equal('c-2');
      customElements.define('c-3', class extends HTMLElement {});
      const name4 = (() => {
        const MyOrchid = createAnonymousCEClass();
        return getNameForCEClass(MyOrchid);
      })();
      expect(name4).to.equal('c-4');
    });
  });
});
