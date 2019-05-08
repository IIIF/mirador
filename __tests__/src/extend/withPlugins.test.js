import React from 'react';
import { mount } from 'enzyme';
import { withPlugins } from '../../../src/extend/withPlugins';
import PluginContext from '../../../src/extend/PluginContext';


/** Mock target component */
const Target = props => <div>Hello</div>;

/** create wrapper  */
function createPluginHoc(pluginMap) {
  const props = { bar: 2, foo: 1 };
  const PluginHoc = withPlugins('Target', Target);
  return mount(
    <PluginContext.Provider value={pluginMap}>
      <PluginHoc {...props} />
    </PluginContext.Provider>,
  );
}

describe('withPlugins', () => {
  it('should return a React.memo object (normal function call)', () => {
    expect(withPlugins('Target', Target)).toBeInstanceOf(Object);
    expect(withPlugins('Target', Target).type).toBeInstanceOf(Function);
  });

  it('should return a React.memo object (curry function call)', () => {
    expect(withPlugins('Target')(Target)).toBeInstanceOf(Object);
    expect(withPlugins('Target')(Target).type).toBeInstanceOf(Function);
  });

  xit('displayName prop of returned function is based on target name argument', () => {
    expect(withPlugins('Bubu', Target).displayName)
      .toBe('WithPlugins(Bubu)');
  });
});

describe('PluginHoc: if no plugin exists for the target', () => {
  it('renders the target component', () => {
    const hoc = createPluginHoc({});
    expect(hoc.find(Target).length).toBe(1);
    expect(hoc.find(Target).props().foo).toBe(1);
    expect(hoc.find(Target).props().bar).toBe(2);
  });
});

describe('PluginHoc: if wrap plugins exist for target', () => {
  it('renders the first wrap plugin and passes the target component and the target props to it', () => {
    /** */ const WrapPluginComponentA = props => <div>look i am a plugin</div>;
    /** */ const WrapPluginComponentB = props => <div>look i am a plugin</div>;
    const pluginMap = {
      Target: {
        wrap: [
          { component: WrapPluginComponentA, mode: 'wrap', target: 'Target' },
          { component: WrapPluginComponentB, mode: 'wrap', target: 'Target' },
        ],
      },
    };
    const hoc = createPluginHoc(pluginMap);
    const selector = 'WrapPluginComponentA';
    expect(hoc.find(selector).length).toBe(1);
    expect(hoc.find(selector).props().TargetComponent).toBe(Target);
    expect(hoc.find(selector).props().targetProps).toEqual({ bar: 2, foo: 1 });
  });
});

describe('PluginHoc: if add plugins exist but no wrap plugin', () => {
  it('renders the target component and passes all add plugin components as a prop', () => {
    /** */ const AddPluginComponentA = props => <div>look i am a plugin</div>;
    /** */ const AddPluginComponentB = props => <div>look i am a plugin</div>;
    const plugins = {
      Target: {
        add: [
          { component: AddPluginComponentA, mode: 'add', target: 'Target' },
          { component: AddPluginComponentB, mode: 'add', target: 'Target' },
        ],
      },
    };
    const hoc = createPluginHoc(plugins);
    const selector = Target;
    expect(hoc.find(selector).length).toBe(1);
    expect(hoc.find(selector).props().foo).toBe(1);
    expect(hoc.find(selector).props().bar).toBe(2);
    expect(hoc.find(selector).props().PluginComponents[0]).toBe(AddPluginComponentA);
    expect(hoc.find(selector).props().PluginComponents[1]).toBe(AddPluginComponentB);
  });
});

describe('PluginHoc: if wrap plugins AND add plugins exist for target', () => {
  it('renders the first wrap plugin, ignores add plugins', () => {
    /** */ const WrapPluginComponentA = props => <div>look i am a plugin</div>;
    /** */ const WrapPluginComponentB = props => <div>look i am a plugin</div>;
    /** */ const AddPluginComponentA = props => <div>look i am a plugin</div>;
    /** */ const AddPluginComponentB = props => <div>look i am a plugin</div>;
    const plugins = {
      Target: {
        add: [
          { component: AddPluginComponentA, mode: 'add', target: 'Target' },
          { component: AddPluginComponentB, mode: 'add', target: 'Target' },
        ],
        wrap: [
          { component: WrapPluginComponentA, mode: 'wrap', target: 'Target' },
          { component: WrapPluginComponentB, mode: 'wrap', target: 'Target' },
        ],
      },
    };
    const hoc = createPluginHoc(plugins);
    expect(hoc.find(WrapPluginComponentA).length).toBe(1);
    expect(hoc.find(Target).length).toBe(0);
  });
});
