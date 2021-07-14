import React from 'react';
import { shallow } from 'enzyme';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/AddSharp';
import CloseIcon from '@material-ui/icons/CloseSharp';
import { WorkspaceAddButton } from '../../../src/components/WorkspaceAddButton';

/** create wrapper */
function createWrapper(props) {
  return shallow(
    <WorkspaceAddButton
      classes={{}}
      setWorkspaceAddVisibility={() => {}}
      t={str => str}
      useExtendedFab
      {...props}
    />,
  );
}

describe('WorkspaceAddButton', () => {
  it('renders a button to open the load window area', () => {
    const setWorkspaceAddVisibility = jest.fn();
    const wrapper = createWrapper({ isWorkspaceAddVisible: false, setWorkspaceAddVisibility });

    expect(wrapper.find(AddIcon).length).toBe(1);

    wrapper.find(Fab).simulate('click');
    expect(setWorkspaceAddVisibility).toHaveBeenCalledWith(true);
  });

  it('renders additional text for an empty workspace', () => {
    const wrapper = createWrapper({ emptyWorkspace: true, isWorkspaceAddVisible: false });
    expect(wrapper.find(Fab).matchesElement(
      <Fab>
        <AddIcon />
        startHere
      </Fab>,
    )).toBe(true);
    expect(wrapper.find(Fab).prop('aria-label')).toMatch('startHere');
  });

  it('renders a button to close the load window area', () => {
    const setWorkspaceAddVisibility = jest.fn();
    const wrapper = createWrapper({ isWorkspaceAddVisible: true, setWorkspaceAddVisibility });

    expect(wrapper.find(CloseIcon).length).toBe(1);

    wrapper.find(Fab).simulate('click');
    expect(setWorkspaceAddVisibility).toHaveBeenCalledWith(false);
    expect(wrapper.find(Fab).prop('aria-label')).toMatch('closeAddResourceMenu');
  });

  describe('when the useExtendedFab prop is false', () => {
    it('does not have the startHere Typography ', () => {
      const wrapper = createWrapper({ useExtendedFab: false });

      expect(wrapper.find(Typography).length).toEqual(0);
      expect(wrapper.find(Fab).prop('aria-label')).toMatch('addResource');
    });

    it('the Fab does not have extended variant prop', () => {
      const extendedWrapper = createWrapper({ useExtendedFab: true });
      const wrapper = createWrapper({ useExtendedFab: false });

      expect(extendedWrapper.find(Fab).props().variant).toBe('extended');
      expect(wrapper.find(Fab).props().variant).toEqual('circular');
    });
  });
});
