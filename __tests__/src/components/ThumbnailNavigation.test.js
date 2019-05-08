import React from 'react';
import { shallow } from 'enzyme';
import manifesto from 'manifesto.js';
import { ThumbnailNavigation } from '../../../src/components/ThumbnailNavigation';
import CanvasGroupings from '../../../src/lib/CanvasGroupings';
import manifestJson from '../../fixtures/version-2/019.json';

/** create wrapper */
function createWrapper(props) {
  return shallow(
    <ThumbnailNavigation
      canvasGroupings={
        new CanvasGroupings(manifesto.create(manifestJson).getSequences()[0].getCanvases())
      }
      canvasIndex={1}
      classes={{}}
      windowId="foobar"
      config={{ thumbnailNavigation: { height: 150, width: 100 } }}
      position="far-bottom"
      t={k => k}
      {...props}
    />,
  );
}

describe('ThumbnailNavigation', () => {
  let wrapper;
  let rightWrapper;
  let setCanvas;
  beforeEach(() => {
    setCanvas = jest.fn();
    wrapper = createWrapper({ setCanvas });
  });
  it('renders the component', () => {
    expect(wrapper.find('.mirador-thumb-navigation').length).toBe(1);
  });
  it('renders containers based off of number of canvases', () => {
    expect(wrapper
      .find('AutoSizer').dive().find('List').dive()
      .find('WithStyles(Connect(Component))').length).toEqual(3);
  });
  it('has a ref set used to reset on view change', () => {
    expect(wrapper.instance().gridRef).not.toBe(null);
  });
  it('triggers a resetAfterIndex on view change', () => {
    const mockReset = jest.fn();
    wrapper.instance().gridRef = { current: { resetAfterIndex: mockReset } };
    wrapper.setProps({
      canvasIndex: 1,
      view: 'book',
    });
    expect(mockReset).toHaveBeenCalled();
  });
  it('triggers a scrollToItem on canvasIndex change', () => {
    const mockScroll = jest.fn();
    wrapper.instance().gridRef = { current: { scrollToItem: mockScroll } };
    wrapper.setProps({
      canvasIndex: 3,
    });
    expect(mockScroll).toHaveBeenCalled();
  });
  describe('calculating instance methods', () => {
    beforeEach(() => {
      rightWrapper = createWrapper({
        position: 'far-right',
        setCanvas,
      });
    });
    it('style', () => {
      expect(wrapper.instance().style()).toMatchObject({ height: '150px', width: '100%' });
      expect(rightWrapper.instance().style()).toMatchObject({ height: '100%', minHeight: 0, width: '123px' });
    });
    it('rightWidth', () => {
      expect(wrapper.instance().rightWidth()).toEqual(100);
      const mockReset = jest.fn();
      wrapper.instance().gridRef = { current: { resetAfterIndex: mockReset } };
      wrapper.setProps({
        canvasIndex: 1,
        view: 'book',
      });
      expect(wrapper.instance().rightWidth()).toEqual(200);
    });
    it('item count is based off of number of canvases', () => {
      expect(wrapper.instance().itemCount()).toEqual(3);
    });
    it('calculateScaledSize', () => {
      expect(wrapper.instance().calculateScaledSize(0)).toEqual(82);
      expect(rightWrapper.instance().calculateScaledSize(0)).toEqual(158);
    });
    it('calculatingWidth', () => {
      expect(wrapper.instance().calculatingWidth(1)).toEqual(100);
      expect(wrapper.instance().calculatingWidth(2)).toEqual(200);
    });
    it('areaHeight', () => {
      expect(wrapper.instance().areaHeight()).toEqual(150);
      expect(rightWrapper.instance().areaHeight(99)).toEqual(99);
    });
  });
  describe('keyboard navigation', () => {
    const rightSetCanvas = jest.fn();
    beforeEach(() => {
      rightWrapper = createWrapper({
        canvasIndex: 1,
        position: 'far-right',
        setCanvas: rightSetCanvas,
      });
    });
    describe('handleKeyUp', () => {
      it('next', () => {
        wrapper.instance().handleKeyUp({ key: 'ArrowRight' });
        expect(setCanvas).toHaveBeenCalledWith(2);
        rightWrapper.instance().handleKeyUp({ key: 'ArrowDown' });
        expect(rightSetCanvas).toHaveBeenCalledWith(2);
      });
      it('previous', () => {
        wrapper.instance().handleKeyUp({ key: 'ArrowLeft' });
        expect(setCanvas).toHaveBeenCalledWith(0);
        rightWrapper.instance().handleKeyUp({ key: 'ArrowUp' });
        expect(rightSetCanvas).toHaveBeenCalledWith(0);
      });
    });
  });
});
