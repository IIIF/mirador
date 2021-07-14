import React from 'react';
import { shallow } from 'enzyme';
import Menu from '@material-ui/core/Menu';
import WindowThumbnailSettings from '../../../src/containers/WindowThumbnailSettings';
import WindowViewSettings from '../../../src/containers/WindowViewSettings';
import { WindowTopMenu } from '../../../src/components/WindowTopMenu';

/** create wrapper */
function createWrapper(props) {
  return shallow(
    <WindowTopMenu
      containerId="mirador"
      windowId="xyz"
      handleClose={() => {}}
      anchorEl={null}
      toggleDraggingEnabled={() => {}}
      {...props}
    />,
  );
}

describe('WindowTopMenu', () => {
  it('renders all needed elements', () => {
    const wrapper = createWrapper();

    expect(wrapper.find(Menu).length).toBe(1);
    expect(wrapper.find(WindowThumbnailSettings).length).toBe(1);
    expect(wrapper.find(WindowViewSettings).length).toBe(1);
    expect(wrapper.find('PluginHookWithHeader').length).toBe(1);
  });

  it('passes windowId to <WindowThumbnailSettings/>', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(WindowThumbnailSettings)
      .first().props().windowId).toBe('xyz');
  });

  it('passses correct props to <Menu/> when no achor element given', () => {
    const handleClose = jest.fn();
    const toggleDraggingEnabled = jest.fn();
    const wrapper = createWrapper({ handleClose, toggleDraggingEnabled });
    expect(wrapper.find(Menu).first().props().anchorEl).toBe(null);
    expect(wrapper.find(Menu).first().props().open).toBe(false);
    expect(wrapper.find(Menu).first().props().onClose).toBe(handleClose);
    expect(wrapper.find(Menu).first().props().TransitionProps.onEntering)
      .toBe(toggleDraggingEnabled);
    expect(wrapper.find(Menu).first().props().TransitionProps.onExit)
      .toBe(toggleDraggingEnabled);
  });

  it('passses correct props to <Menu/> when achor element given', () => {
    const handleClose = jest.fn();
    const toggleDraggingEnabled = jest.fn();
    const anchorEl = {};
    const wrapper = createWrapper({ anchorEl, handleClose, toggleDraggingEnabled });
    expect(wrapper.find(Menu).first().props().anchorEl).toBe(anchorEl);
    expect(wrapper.find(Menu).first().props().open).toBe(true);
    expect(wrapper.find(Menu).first().props().onClose).toBe(handleClose);
    expect(wrapper.find(Menu).first().props().TransitionProps.onEntering)
      .toBe(toggleDraggingEnabled);
    expect(wrapper.find(Menu).first().props().TransitionProps.onExit)
      .toBe(toggleDraggingEnabled);
  });
});
