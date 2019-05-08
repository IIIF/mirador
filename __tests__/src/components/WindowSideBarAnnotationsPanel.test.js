import React from 'react';
import { shallow } from 'enzyme';
import CanvasAnnotations from '../../../src/containers/CanvasAnnotations';
import { WindowSideBarAnnotationsPanel } from '../../../src/components/WindowSideBarAnnotationsPanel';

/** */
function createWrapper(props) {
  return shallow(
    <WindowSideBarAnnotationsPanel
      annotationCount={4}
      classes={{}}
      id="xyz"
      t={(key, args) => ({ args, key })}
      windowId="abc"
      {...props}
    />,
  );
}

describe('WindowSideBarAnnotationsPanel', () => {
  let wrapper;

  it('has a header', () => {
    wrapper = createWrapper();

    expect(
      wrapper.props().title.key,
    ).toBe('annotations');
  });

  it('has the AnnotationSettings component', () => {
    const titleControls = createWrapper().prop('titleControls');
    expect(titleControls.type.WrappedComponent.type.displayName).toEqual('WithPlugins(AnnotationSettings)');
  });

  it('renders the annotationsCount', () => {
    wrapper = createWrapper();
    const translatedCount = wrapper.find('WithStyles(Typography)').props().children;

    expect(translatedCount.key).toEqual('showingNumAnnotations');
    expect(translatedCount.args.number).toEqual(4);
  });

  it('renders a CanvasAnnotations for every selected canvas', () => {
    wrapper = createWrapper({
      selectedCanvases: [
        { id: 'abc', index: 0 },
        { id: 'xyz', index: 1 },
      ],
    });

    expect(wrapper.find(CanvasAnnotations).length).toBe(2);
  });
});
