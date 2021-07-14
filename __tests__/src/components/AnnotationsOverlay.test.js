import React from 'react';
import { shallow } from 'enzyme';
import OpenSeadragon from 'openseadragon';
import { Utils } from 'manifesto.js';
import { AnnotationsOverlay } from '../../../src/components/AnnotationsOverlay';
import OpenSeadragonCanvasOverlay from '../../../src/lib/OpenSeadragonCanvasOverlay';
import AnnotationList from '../../../src/lib/AnnotationList';
import CanvasWorld from '../../../src/lib/CanvasWorld';
import fixture from '../../fixtures/version-2/019.json';

const canvases = Utils.parseManifest(fixture).getSequences()[0].getCanvases();

jest.mock('react-dom');
jest.mock('openseadragon');
jest.mock('../../../src/lib/OpenSeadragonCanvasOverlay');

describe('AnnotationsOverlay', () => {
  let wrapper;
  let viewer;
  let updateViewport;
  beforeEach(() => {
    OpenSeadragon.mockClear();
    OpenSeadragonCanvasOverlay.mockClear();

    updateViewport = jest.fn();
    viewer = { addHandler: () => {}, forceRedraw: () => {} };

    wrapper = shallow(
      <AnnotationsOverlay
        annotations={[]}
        viewer={viewer}
        classes={{}}
        searchAnnotations={[]}
        windowId="base"
        config={{}}
        updateViewport={updateViewport}
        t={k => k}
        canvasWorld={new CanvasWorld(canvases)}
      />,
    );
  });

  describe('annotationsMatch', () => {
    it('is false if the annotations are a different size', () => {
      const currentAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];
      const previousAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }, { id: 2, resources: [{ id: 'rid2' }] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(false);
    });

    it('is true if the previous annotation\'s resource IDs all match', () => {
      const currentAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];
      const previousAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(true);
    });

    it('is true if both are empty', () => {
      expect(AnnotationsOverlay.annotationsMatch([], [])).toBe(true);
    });

    it('is false if the previous annotation\'s resource IDs do not match', () => {
      const currentAnnotations = [{ id: 1, resources: [{ id: 'rid1' }] }];
      const previousAnnotations = [{ id: 1, resources: [{ id: 'rid2' }] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(false);
    });

    it('returns true if the annotation resources IDs are empty (to prevent unecessary rerender)', () => {
      const currentAnnotations = [{ id: 1, resources: [] }];
      const previousAnnotations = [{ id: 1, resources: [] }];

      expect(
        AnnotationsOverlay.annotationsMatch(currentAnnotations, previousAnnotations),
      ).toBe(true);
    });
  });

  describe('componentDidUpdate', () => {
    it('sets up a OpenSeadragonCanvasOverlay', () => {
      wrapper.instance().componentDidUpdate({});
      expect(OpenSeadragonCanvasOverlay).toHaveBeenCalledTimes(1);
    });

    it('sets up a listener on update-viewport', () => {
      wrapper.instance().osdCanvasOverlay = null;
      const addHandler = jest.fn();
      viewer.addHandler = addHandler;
      wrapper.instance().componentDidUpdate({});
      expect(addHandler).toHaveBeenCalledWith('update-viewport', expect.anything());
    });

    it('sets up canvasUpdate to add annotations to the canvas and forces a redraw', () => {
      const clear = jest.fn();
      const resize = jest.fn();
      const canvasUpdate = jest.fn();
      const forceRedraw = jest.fn();

      wrapper.instance().osdCanvasOverlay = {
        canvasUpdate,
        clear,
        resize,
      };

      viewer.forceRedraw = forceRedraw;

      wrapper.setProps(
        {
          annotations: [
            new AnnotationList(
              { '@id': 'foo', resources: [{ foo: 'bar' }] },
            ),
          ],
        },
      );
      wrapper.setProps(
        {
          annotations: [
            new AnnotationList(
              { '@id': 'foo', resources: [{ foo: 'bar' }] },
            ),
          ],
        },
      );
      wrapper.setProps(
        {
          annotations: [
            new AnnotationList(
              { '@id': 'bar', resources: [{ foo: 'bar' }] },
            ),
          ],
        },
      );
      wrapper.instance().updateCanvas();
      expect(clear).toHaveBeenCalledTimes(1);
      expect(resize).toHaveBeenCalledTimes(1);
      expect(canvasUpdate).toHaveBeenCalledTimes(1);
      expect(forceRedraw).toHaveBeenCalled();
    });
  });

  describe('onUpdateViewport', () => {
    it('fires updateCanvas', () => {
      const updateCanvas = jest.fn();
      wrapper.instance().updateCanvas = updateCanvas;
      wrapper.instance().onUpdateViewport();
      expect(updateCanvas).toHaveBeenCalledTimes(1);
    });
  });

  describe('annotationsToContext', () => {
    it('converts the annotations to canvas and checks that the canvas is displayed', () => {
      const strokeRect = jest.fn();
      wrapper.instance().osdCanvasOverlay = {
        context2d: {
          restore: () => {},
          save: () => {},
          strokeRect,
        },
      };
      viewer.viewport = {
        getMaxZoom: () => (1),
        getZoom: () => (0.05),
      };

      const annotations = [
        new AnnotationList(
          { '@id': 'foo', resources: [{ on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=10,10,100,200' }] },
        ),
      ];

      const palette = {
        default: { strokeStyle: 'yellow' },
      };

      wrapper.instance().annotationsToContext(annotations, palette);
      const context = wrapper.instance().osdCanvasOverlay.context2d;
      expect(context.strokeStyle).toEqual('yellow');
      expect(context.lineWidth).toEqual(20);
      expect(strokeRect.mock.calls[0][0]).toBeCloseTo(24.561);
      expect(strokeRect.mock.calls[0][1]).toBeCloseTo(24.561);
      expect(strokeRect.mock.calls[0][2]).toBeCloseTo(245.61);
      expect(strokeRect.mock.calls[0][3]).toBeCloseTo(491.22);
    });
  });

  describe('onCanvasClick', () => {
    it('triggers a selectAnnotation for the clicked-on annotation', () => {
      const selectAnnotation = jest.fn();

      wrapper.setProps(
        {
          annotations: [
            new AnnotationList(
              {
                '@id': 'foo',
                resources: [{
                  '@id': 'http://example.org/identifier/annotation/anno-line',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
                }],
              },
            ),
          ],
          selectAnnotation,
        },
      );

      wrapper.instance().onCanvasClick({
        eventSource: { viewport: { pointFromPixel: point => ({ x: 101, y: 101 }) } },
        position: { x: 0, y: 0 },
      });

      expect(selectAnnotation).toHaveBeenCalledWith('base', 'http://example.org/identifier/annotation/anno-line');
    });

    it('triggers a deselectAnnotation for an already-selected annotation', () => {
      const deselectAnnotation = jest.fn();

      wrapper.setProps(
        {
          annotations: [
            new AnnotationList(
              {
                '@id': 'foo',
                resources: [{
                  '@id': 'http://example.org/identifier/annotation/anno-line',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
                }],
              },
            ),
          ],
          deselectAnnotation,
          selectedAnnotationId: 'http://example.org/identifier/annotation/anno-line',
        },
      );

      wrapper.instance().onCanvasClick({
        eventSource: { viewport: { pointFromPixel: point => ({ x: 101, y: 101 }) } },
        position: { x: 0, y: 0 },
      });

      expect(deselectAnnotation).toHaveBeenCalledWith('base', 'http://example.org/identifier/annotation/anno-line');
    });

    it('selects the closest annotation', () => {
      const selectAnnotation = jest.fn();

      wrapper.setProps(
        {
          annotations: [
            new AnnotationList(
              {
                '@id': 'foo',
                resources: [{
                  '@id': 'http://example.org/identifier/annotation/anno-line',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
                }, {
                  '@id': 'http://example.org/identifier/annotation/larger-box',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=0,0,250,250',
                }, {
                  '@id': 'http://example.org/identifier/annotation/on-another-canvas',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/some-other-canvas#xywh=101,101,3,3',
                }],
              },
            ),
          ],
          selectAnnotation,
        },
      );

      wrapper.instance().onCanvasClick({
        eventSource: { viewport: { pointFromPixel: point => ({ x: 101, y: 101 }) } },
        position: { x: 0, y: 0 },
      });

      expect(selectAnnotation).toHaveBeenCalledWith('base', 'http://example.org/identifier/annotation/anno-line');
    });
  });

  describe('onCanvasMouseMove', () => {
    it('triggers the hover event for every annotation at that point', () => {
      const hoverAnnotation = jest.fn();
      const forceRedraw = jest.fn();

      viewer.forceRedraw = forceRedraw;
      viewer.viewport = { pointFromPixel: point => ({ x: 101, y: 101 }) };

      wrapper.setProps(
        {
          annotations: [
            new AnnotationList(
              {
                '@id': 'foo',
                resources: [{
                  '@id': 'foo',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=100,100,250,20',
                }, {
                  '@id': 'bar',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=0,0,250,250',
                }, {
                  '@id': 'irrelevant-box',
                  '@type': 'oa:Annotation',
                  motivation: 'sc:painting',
                  on: 'http://iiif.io/api/presentation/2.0/example/fixtures/canvas/24/c1.json#xywh=0,0,50,50',
                }],
              },
            ),
          ],
          hoverAnnotation,
        },
      );

      wrapper.instance().onCanvasMouseMove({
        position: { x: 0, y: 0 },
      });
      wrapper.instance().onCanvasMouseMove.flush();

      expect(hoverAnnotation).toHaveBeenCalledWith('base', ['foo', 'bar']);
    });
  });
});
