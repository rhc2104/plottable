///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export type HoverData = {
    data: any[];
    pixelPositions: Point[];
    selection: D3.Selection;
  }

  export interface Hoverable extends Component.AbstractComponent {
    /**
     * Called when the user first mouses over the Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     */
    _hoverOverComponent(p: Point): void;
    /**
     * Called when the user mouses out of the Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     */
    _hoverOutComponent(p: Point): void;
    /**
     * Returns the HoverData associated with the given position, and performs
     * any visual changes associated with hovering inside a Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     * @return {HoverData} The HoverData associated with the given position.
     */
    _doHover(p: Point): HoverData;
  }

  export class Hover extends Interaction.AbstractInteraction {

    private static warned = false;

    public _componentToListenTo: Hoverable;
    private _mouseDispatcher: Dispatcher.Mouse;
    private _touchDispatcher: Dispatcher.Touch;
    private _hoverOverCallback: (hoverData: HoverData) => any;
    private _hoverOutCallback: (hoverData: HoverData) => any;
    private _overComponent = false;

    constructor() {
      super();
      if (!Hover.warned) {
        Hover.warned = true;
        _Util.Methods.warn("Interaction.Hover is deprecated; use Interaction.Pointer in conjunction with getClosestPlotData() instead.");
      }
    }

    private _currentHoverData: HoverData = {
      data: null,
      pixelPositions: null,
      selection: null
    };

    public _anchor(component: Hoverable, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> (<any> this._componentToListenTo)._element.node());
      this._mouseDispatcher.onMouseMove("hover" + this.getID(), (p: Point) => this._handlePointerEvent(p));

      this._touchDispatcher = Dispatcher.Touch.getDispatcher(<SVGElement> (<any> this._componentToListenTo)._element.node());

      this._touchDispatcher.onTouchStart("hover" + this.getID(), (ids, idToPoint) =>
                                                                   this._handlePointerEvent(idToPoint[ids[0]]));
    }

    private _handlePointerEvent(p: Point) {
      p = this._translateToComponentSpace(p);
      if (this._isInsideComponent(p)) {
        if (!this._overComponent) {
          this._componentToListenTo._hoverOverComponent(p);
        }
        this.handleHoverOver(p);
        this._overComponent = true;
      } else {
        this._componentToListenTo._hoverOutComponent(p);
        this.safeHoverOut(this._currentHoverData);
        this._currentHoverData = {
          data: null,
          pixelPositions: null,
          selection: null
        };
        this._overComponent = false;
      }
    }

    /**
     * Returns a HoverData consisting of all data and selections in a but not in b.
     */
    private static diffHoverData(a: HoverData, b: HoverData): HoverData {
      if (a.data == null || b.data == null) {
        return a;
      }

      var diffData: any[] = [];
      var diffPoints: Point[] = [];
      var diffElements: Element[] = [];
      a.data.forEach((d: any, i: number) => {
        if (b.data.indexOf(d) === -1) {
          diffData.push(d);
          diffPoints.push(a.pixelPositions[i]);
          diffElements.push(a.selection[0][i]);
        }
      });

      if (diffData.length === 0) {
        return {
          data: null,
          pixelPositions: null,
          selection: null
        };
      }

      return {
        data: diffData,
        pixelPositions: diffPoints,
        selection: d3.selectAll(diffElements)
      };
    }

    private handleHoverOver(p: Point) {
      var lastHoverData = this._currentHoverData;
      var newHoverData = this._componentToListenTo._doHover(p);

      this._currentHoverData = newHoverData;

      var outData = Hover.diffHoverData(lastHoverData, newHoverData);
      this.safeHoverOut(outData);

      var overData = Hover.diffHoverData(newHoverData, lastHoverData);
      this.safeHoverOver(overData);
    }

    private safeHoverOut(outData: HoverData) {
      if (this._hoverOutCallback && outData.data) {
        this._hoverOutCallback(outData);
      }
    }

    private safeHoverOver(overData: HoverData) {
      if (this._hoverOverCallback && overData.data) {
        this._hoverOverCallback(overData);
      }
    }

    /**
     * Attaches an callback to be called when the user mouses over an element.
     *
     * @param {(hoverData: HoverData) => any} callback The callback to be called.
     *      The callback will be passed data for newly hovered-over elements.
     * @return {Interaction.Hover} The calling Interaction.Hover.
     */
    public onHoverOver(callback: (hoverData: HoverData) => any) {
      this._hoverOverCallback = callback;
      return this;
    }

    /**
     * Attaches a callback to be called when the user mouses off of an element.
     *
     * @param {(hoverData: HoverData) => any} callback The callback to be called.
     *      The callback will be passed data from the hovered-out elements.
     * @return {Interaction.Hover} The calling Interaction.Hover.
     */
    public onHoverOut(callback: (hoverData: HoverData) => any) {
      this._hoverOutCallback = callback;
      return this;
    }

    /**
     * Retrieves the HoverData associated with the elements the user is currently hovering over.
     *
     * @return {HoverData} The data and selection corresponding to the elements
     *                     the user is currently hovering over.
     */
    public getCurrentHoverData(): HoverData {
      return this._currentHoverData;
    }
  }
}
}
