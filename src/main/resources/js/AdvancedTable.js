/**
 * Remote Table component.
 */

Echo.AdvancedTable = Core.extend(Echo.Component, {

    
    $static: {
        
        /**
         * Default selection background color. Used only when no selection style properties have been set.
         * 
         * @type Color
         */
        DEFAULT_SELECTION_BACKGROUND: "#00006f",

        /**
         * Default selection foreground color. Used only when no selection style properties have been set.
         * 
         * @type Color
         */
        DEFAULT_SELECTION_FOREGROUND: "#ffffff"
    },

    $load: function() {
        Echo.ComponentFactory.registerType("AdvancedTable", this);
    },

    /** @see Echo.Component#compnoentType */
    componentType: "AdvancedTable",

    $virtual: {
        /**
         * Programmatically performs a button action.
         */
        doAction: function() {
            this.fireEvent({
                type: "action",
                source: this,
                data: this.get("actionCommand")
            });
        }
    }
});

/**
 * Component rendering peer: RemoteTable. This class should not be extended by developers, the implementation is subject
 * to change.
 */
Echo.AdvancedTableSync = Core.extend(Echo.Render.ComponentSync, {

    $static: {

        /**
         * Constant describing header row index.
         * 
         * @type Number
         */
        _HEADER_ROW: -1,

        /**
         * The width of the (invisible) column resize handle
         */
        _RESIZE_HANDLE_WIDTH: 6,

        /**
         * Array of properties which may be updated without full re-render.
         * 
         * @type Array
         */
        _supportedPartialProperties: ["selection"]
    },

    /**
     * workaround for chrome for setting column widths smaller than content
     */
    CSS_COL_STYLE: null,

    /**
     * Have the column widths be changed (by dragging a column)?
     */
    _manualColWidths: false,

    _explicitColWidths: false,

    $load: function() {
        Echo.Render.registerPeer("AdvancedTable", this);
    },
    
    /**
     * Flag indicating that no selection styling attributes have been set, thus default highlight should be used.
     * 
     * @type Boolean
     */
    _useDefaultSelectionStyle: false,

    /** Constructor. */
    $construct: function() {
        this.selectionModel = null;
        this.lastSelectedIndex = null;
        this.CSS_COL_STYLE = [];
    },

    /**
     * Adds event listeners.
     */
    _addEventListeners: function() {
        if (!this.component.isRenderEnabled()) {
            return;
        }
        if (!this._selectionEnabled && !this._rolloverEnabled) {
            return;
        }
        if (this._rowCount === 0) {
            return;
        }

        var mouseEnterLeaveSupport = Core.Web.Env.PROPRIETARY_EVENT_MOUSE_ENTER_LEAVE_SUPPORTED;
        var enterEvent = mouseEnterLeaveSupport ? "mouseenter" : "mouseover";
        var exitEvent = mouseEnterLeaveSupport ? "mouseleave" : "mouseout";
        var rolloverEnterRef = Core.method(this, this._processRolloverEnter);
        var rolloverExitRef = Core.method(this, this._processRolloverExit);
        var clickRef = Core.method(this, this._processClick);

        for (var rowIndex = 0; rowIndex < this._rowCount; ++rowIndex) {
            var tr = this._table.rows[rowIndex];
            if (!tr) {
                return;
            }
            if (this._rolloverEnabled) {
                Core.Web.Event.add(tr, enterEvent, rolloverEnterRef, false);
                Core.Web.Event.add(tr, exitEvent, rolloverExitRef, false);
            }
            if (this._selectionEnabled) {
                Core.Web.Event.add(tr, "click", clickRef, false);
                Core.Web.Event.Selection.disable(tr);
            }
        }
    },

    /**
     * Deselects all selected rows.
     */
    _clearSelected: function() {
        for (var i = 0; i < this._rowCount; ++i) {
            if (this.selectionModel.isSelectedIndex(i)) {
                this._setSelected(i, false);
            }
        }
    },

    /**
     * Returns the table row index of the given TR element
     * 
     * @param {Element} element the TR table row element
     * @return the index of the specified row, or -1 if it cannot be found
     * @type Number
     */
    _getRowIndex: function(element) {
        var testElement = this._tbody.firstChild;
        var index = 0;
        while (testElement) {
            if (testElement == element) {
                return index;
            }
            testElement = testElement.nextSibling;
            ++index;
        }
        return -1;
    },

    /**
     * Processes a mouse click event on the table.
     */
    _processClick: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        var tr = e.registeredTarget;
        var rowIndex = this._getRowIndex(tr);
        if (rowIndex == -1) {
            return;
        }

        Core.Web.DOM.preventEventDefault(e);

        if (this.selectionModel.getSelectionMode() == Echo.AdvancedTable.ListSelectionModel.SINGLE_SELECTION ||
                !(e.shiftKey || e.ctrlKey || e.metaKey || e.altKey)) {
            this._clearSelected();
        }

        if (!this.selectionModel.getSelectionMode() == Echo.AdvancedTable.ListSelectionModel.SINGLE_SELECTION &&
                e.shiftKey && this.lastSelectedIndex != -1) {
            var startIndex;
            var endIndex;
            if (this.lastSelectedIndex < rowIndex) {
                startIndex = this.lastSelectedIndex;
                endIndex = rowIndex;
            } else {
                startIndex = rowIndex;
                endIndex = this.lastSelectedIndex;
            }
            for (var i = startIndex; i <= endIndex; ++i) {
                this._setSelected(i, true);
            }
        } else {
            this.lastSelectedIndex = rowIndex;
            this._setSelected(rowIndex, !this.selectionModel.isSelectedIndex(rowIndex));
        }
        this.component.set("selection", this.selectionModel.getSelectionString());
        this.component.doAction();
    },

    /**
     * Processes a mouse rollover enter event on a table row.
     */
    _processRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        var tr = e.registeredTarget;
        for (var i = 0; i < tr.cells.length; ++i) {
            var cell = tr.cells[i];
            Echo.Sync.Font.renderClear(this.component.render("rolloverFont"), cell);
            Echo.Sync.Color.render(this.component.render("rolloverForeground"), cell, "color");
            Echo.Sync.Color.render(this.component.render("rolloverBackground"), cell, "background");
            Echo.Sync.FillImage.render(this.component.render("rolloverBackgroundImage"), cell);
        }
    },

    /**
     * Processes a mouse rollover exit event on a table row.
     */
    _processRolloverExit: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return true;
        }
        var tr = e.registeredTarget;
        var rowIndex = this._getRowIndex(tr);
        this._renderRowStyle(rowIndex);
    },

    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        this._columnCount = parseInt(this.component.render("columnCount"), 10);
        this._rowCount = parseInt(this.component.render("rowCount"), 10);
        this._height = this.component.render("height");
        this._width = this.component.render("width");
        this._columnWidth = this.component.render("columnWidth");
        this._selectionEnabled = this.component.render("selectionEnabled");
        this._rolloverEnabled = this.component.render("rolloverEnabled");
        this._headerVisible = this.component.render("headerVisible", true);
        this._zebraBackground = this.component.render("zebraBackground");
        this._verticalLine = this.component.render("verticalLine");
        this._verticalOffset = 0;
        if (this._verticalLine) {
            this._verticalOffset = parseInt(this._verticalLine.split(' ')[0], 10);
        } 
        this._horizontalLine = this.component.render("horizontalLine");
        var insets = this.component.render("insets", 0);
        this._defaultPixelInsets = Echo.Sync.Insets.toPixels(insets);
        this._defaultCellPadding = Echo.Sync.Insets.toCssValue(insets);
        this._useDefaultSelectionStyle = this._selectionEnabled && 
            !this.component.render("selectionForeground") &&
            !this.component.render("selectionBackground") && 
            !this.component.render("selectionBackgroundImage") && 
            !this.component.render("selectionFont");

        if (this._selectionEnabled) {
            this.selectionModel = new Echo.AdvancedTable.ListSelectionModel(parseInt(this.component.get("selectionMode"), 10));
        }

        this._htmlHead = document.getElementsByTagName('head')[0];
        for (var i = 0; i < this._columnCount; i++) {
            var style = document.createElement('style');
            style.type = 'text/css';
            this._htmlHead.appendChild(style);
            this.CSS_COL_STYLE[i] = style;
        }

        this._div = document.createElement("div");
        this._div.style.position = "relative";
        this._div.style.overflow = "visible";
        this._div.style.textAlign = "left";
        Echo.Sync.RoundedCorner.render(this.component.render("radius"), this._div);
        Echo.Sync.BoxShadow.render(this.component.render("boxShadow"), this._div);
        Echo.Sync.Border.render(this.component.render("border"), this._div);
        Echo.Sync.Color.render(this.component.render("background"), this._div, "backgroundColor");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._div);

        if (this._width) {
            this._div.style.width = Echo.Sync.Extent.toCssValue(this._width, true, true);
        }

        var outsets = this.component.render("outsets");
        if (outsets) {
            // XXX use box-sizing: border-box;?
            // create an outer div for the outsets
            this._outerDiv = document.createElement("div");
            this._outerDiv.id = this.component.renderId;
            Echo.Sync.Insets.render(outsets, this._outerDiv, "padding");
            if (this._height) {
                this._div.style.height = "100%";
                this._outerDiv.style.height = Echo.Sync.Extent.toCssValue(this._height, false, true);
            }
            this._outerDiv.appendChild(this._div);
            parentElement.appendChild(this._outerDiv);
        } else {
            this._div.id = this.component.renderId;
            if (this._height) {
                this._div.style.height = Echo.Sync.Extent.toCssValue(this._height, false, true);
            }
            parentElement.appendChild(this._div);
        }

        if (this._headerVisible) {
            this._div.style.overflow = "hidden";
            this._divHeader = document.createElement("div");
            this._divHeader.style.overflow = "hidden";
            Echo.Sync.Color.render(this.component.render("headerBackground"), this._divHeader, "backgroundColor");
            Echo.Sync.Color.render(this.component.render("headerForeground"), this._divHeader, "color");
            var separatorLine = this.component.render("headerSeparatorLine");
            if (separatorLine) {
                this._divHeader.style.borderBottom = separatorLine;
            }
            this._div.appendChild(this._divHeader);

            // this intermediate div is needed so the header columns don't get 'squeezed'
            var divHeaderFreeExpand = document.createElement("div");
            divHeaderFreeExpand.style.width = "9999px";
            this._divHeader.appendChild(divHeaderFreeExpand);

            this._tableHeader = document.createElement("table");
            this._tableHeader.style.height = "100%";
            this._tableHeader.style.borderCollapse = "collapse";
            this._tableHeader.style.whiteSpace = "nowrap";
            divHeaderFreeExpand.appendChild(this._tableHeader);

            this._tbodyHeader = document.createElement("tbody");
            this._tbodyHeader.style.display = "table-row-group";
            this._tableHeader.appendChild(this._tbodyHeader);

            // create body div element
            this._divBody = document.createElement("div");
            this._divBody.style.position = "absolute";
            this._divBody.style.bottom = "0px";
            this._divBody.style.left = "0px";
            this._divBody.style.right = "0px";
            this._divBody.style.overflow = "auto";
            this._div.appendChild(this._divBody);

            // sync header and body scrolls
            var that = this;
            this._divBody.onscroll = function(e) {
                that._divHeader.scrollLeft = that._divBody.scrollLeft;
            };
        }

        this._table = document.createElement("table");
        this._table.style.borderSpacing = "0px";
        this._table.style.whiteSpace = "nowrap";
        Echo.Sync.renderComponentDefaults(this.component, this._table);
        if (this._headerVisible) {
            this._divBody.appendChild(this._table);
        } else {
            this._div.appendChild(this._table);
        }
        if (this._width) {
            this._table.style.width = "100%";
        }

        if (this._columnWidth) {
            this._colGroupBody = this._buildColGroup();
            if (this._colGroupBody) {
                this._table.appendChild(this._colGroupBody);
            }
        }

        this._tbody = document.createElement("tbody");
        this._table.appendChild(this._tbody);

        if (this._headerVisible) {
            var trHeaderPrototype = this._createRowPrototype(true);
            this._tbodyHeader.appendChild(this._renderRow(update, Echo.AdvancedTableSync._HEADER_ROW, trHeaderPrototype));
        }

        // add actual rows
        var trPrototype = this._createRowPrototype(false);
        for (var rowIndex = 0; rowIndex < this._rowCount; rowIndex++) {
            var zebra = rowIndex % 2 == 1 ? null : this._zebraBackground;
            this._tbody.appendChild(this._renderRow(update, rowIndex, trPrototype, zebra));
        }

        if (this._selectionEnabled) {
            this._table.style.cursor = "pointer";
            this._setSelectedFromProperty(this.component.get("selection"), false);
        }

        this._addEventListeners();
        this.renderDisplay();
    },

    /** @see Echo.Render.ComponentSync#renderDisplay */
    renderDisplay: function() {
        var headerHeight = 0;
        if (this._headerVisible) {
            headerHeight = this._tableHeader.clientHeight;
        }

        if (this._table.rows.length === 0) {
            return;
        }
        
        var firstBodyRow = this._table.rows[0];

        if (this._headerVisible) {
            this._divHeader.style.height = headerHeight + "px";
            var separatorHeight = this._divHeader.style.borderBottomWidth;
            if (separatorHeight) {
                headerHeight += parseInt(separatorHeight, 10);
            }
            this._divBody.style.top = headerHeight + "px";
    
            // adjust header to body column widths if not already set in method _buildColGroup()
            if (!this._explicitColWidths) {
                for (var j = 0; j < firstBodyRow.cells.length; j++) {
                    if (firstBodyRow.cells[j].style.minWidth) break;
                    var borderWidth = (j === 0 ? 2 : 1) * this._verticalOffset;
                    var w1 = this._tableHeader.rows[0].cells[j].offsetWidth - borderWidth;
                    firstBodyRow.cells[j].style.minWidth = w1 + "px";                    
                }
                for (var j = 0; j < firstBodyRow.cells.length; j++) {
                    var borderWidth = (j === 0 ? 2 : 1) * this._verticalOffset;
                    //var w1 = this._tableHeader.rows[0].cells[j].offsetWidth - borderWidth;
                    var w2 = firstBodyRow.cells[j].offsetWidth - borderWidth;
                    var minWidth = w2;  //Math.max(w1, w2);
                    this._resizeColumn(minWidth, false, j);
                }
            }
        }

        var scrollElement = this._headerVisible ? this._divBody : this._div;
        if (!this._height) {
            // height is not set, so calculate it and adjust outer div accordingly
            var scrollOffsetHeight = scrollElement.scrollWidth > scrollElement.clientWidth ? Core.Web.Measure.SCROLL_WIDTH : 0;
            this._div.style.height = (headerHeight + this._table.clientHeight + scrollOffsetHeight) + "px";
        }

        var scrollOffset = scrollElement.scrollHeight > scrollElement.clientHeight ? Core.Web.Measure.SCROLL_WIDTH : 0;
        if (!this._width) {
            // calculate width if not set
            var totalWidth = 0;
            for (var i = 0; i < firstBodyRow.cells.length; i++) {
                var w = firstBodyRow.cells[i].offsetWidth;
                totalWidth += w;
            }
            this._div.style.width = (totalWidth + scrollOffset) + "px";
            this._table.style.width = "100%";
            if (!this._headerVisible && !this._height && scrollElement.scrollHeight === scrollElement.clientHeight && scrollOffset > 0) {
                // fix when no header, width and height are set
                this._div.style.width = totalWidth + "px";
            }
        }

    },

    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        if (this._rolloverEnabled || this._selectionEnabled) {
            var tr = this._tbody.firstChild;
            while (tr) {
                Core.Web.Event.removeAll(tr);
                tr = tr.nextSibling;
            }
        }
        for (var i = 0; i < this._columnCount; i++) {
            var style = this.CSS_COL_STYLE[i];
            if (!style) {
                continue;
            }
            if (this._htmlHead) {
                this._htmlHead.removeChild(style);
            }    
        }

        this._outerDiv = null;
        this._div = null;
        this._divHeader = null;
        this._divHeader2 = null;
        this._tableHeader = null;
        this._tbodyHeader = null;
        this._divBody = null;
        this._table = null;
        this._tbody = null;
    },

    /**
     * Build a colgroup element in case the column widths are specified in percentages If column widths are specified in
     * pixel then enforce widths directly on the columns (no colgroup is returned) If column widths are not specified
     * then nothing happens here The case of a mixed-up configuration is undefined
     */
    _buildColGroup: function() {
        var colGroupElement = document.createElement("colgroup");
        var totalWidth = 0;
        for (var i = 0; i < this._columnCount; ++i) {
            var width = this.component.renderIndex("columnWidth", i);
            if (width == null) {
                // do nothing
            } else if (Echo.Sync.Extent.isPercent(width)) {
                var colElement = document.createElement("col");
                colElement.style.width = width.toString();
                colGroupElement.appendChild(colElement);
            } else {
                var columnPixels = Echo.Sync.Extent.toPixels(width, true);
                this._resizeColumn(columnPixels, true, i);
                var borderWidth = (i === 0 ? 2 : 1) * this._verticalOffset;
                totalWidth += columnPixels + borderWidth;
            }
        }
        if (totalWidth > 0) {
            this._explicitColWidths = true;
            this._table.style.width = null;
            return null;
        }
        return colGroupElement;
    },

    /**
     * Renders an appropriate style for a row (i.e. selected or deselected).
     * 
     * @param {Number} rowIndex the index of the row
     */
    _renderRowStyle: function(rowIndex) {
        var selected = this._selectionEnabled && this.selectionModel.isSelectedIndex(rowIndex);
        var tr = this._tbody.childNodes[rowIndex];
        var td = tr.firstChild;

        var columnIndex = 0;
        while (td) {
            if (selected) {
                if (this._useDefaultSelectionStyle) {
                    Echo.Sync.Color.render(Echo.AdvancedTable.DEFAULT_SELECTION_FOREGROUND, td, "color");
                    Echo.Sync.Color.render(Echo.AdvancedTable.DEFAULT_SELECTION_BACKGROUND, td, "background");
                } else {
                    Echo.Sync.Font.renderClear(this.component.render("selectionFont"), td);
                    Echo.Sync.Color.render(this.component.render("selectionForeground"), td, "color");
                    Echo.Sync.Color.render(this.component.render("selectionBackground"), td, "background");
                    Echo.Sync.FillImage.render(this.component.render("selectionBackgroundImage"), td);
                }
            } else {
                td.style.color = "";
                td.style.backgroundColor = "";
                td.style.backgroundImage = "";
                Echo.Sync.Font.renderClear(null, td);

                var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) * this._columnCount + columnIndex);
                var layoutData = child.render("layoutData");
                if (layoutData) {
                    Echo.Sync.Color.render(layoutData.background, td, "backgroundColor");
                    Echo.Sync.FillImage.render(layoutData.backgroundImage, td);
                }
            }
            td = td.nextSibling;
            ++columnIndex;
        }
    },

    /**
     * Creates a prototype TR element for the rendered table, containing style information and TD elements representing
     * the table cells. This prototype may be cloned to quickly generate the table DOM.
     * 
     * @return the prototype TR row element hierarchy
     * @type Element
     */
    _createRowPrototype: function(isHeader) {
        var tr = document.createElement("tr");
        tr.style.display = "table-row";

        var tdPrototype = document.createElement(isHeader ? "th" : "td");
        if (this._verticalLine) {
            tdPrototype.style.borderRight = this._verticalLine;
        }
        if (!isHeader && this._horizontalLine) {
            tdPrototype.style.borderBottom = this._horizontalLine;
        }

        tdPrototype.style.display = "table-cell";
        tdPrototype.style.verticalAlign = "middle";
        tdPrototype.style.overflow = "hidden";
        tdPrototype.style.textOverflow = "ellipsis";
        tdPrototype.style.padding = "0px";

        for (var columnIndex = 0; columnIndex < this._columnCount; columnIndex++) {
            var td = tdPrototype.cloneNode(false);
            td.className = (isHeader ? "cssTDClassHeader_" : "cssTDClassBody_") + this._getCssId(columnIndex);
            if (columnIndex === 0 && this._verticalLine) {
                // draw the left-most vertical line
                td.style.borderLeft = this._verticalLine;
            }
            tr.appendChild(td);
        }
        return tr;
    },

    /**
     * Renders a single row.
     * 
     * @param {Echo.Update.ComponentUpdate} update the update
     * @param {Number} rowIndex the index of the row
     * @param {Element} trPrototype a TR element containing the appropriate number of TD elements with default styles
     *                applied (This is created by _renderRowStyle(). Providing this attribute is optional, and is
     *                specified for performance reasons. If omitted one is created automatically.)
     * @return the created row
     * @type Element
     */
    _renderRow: function(update, rowIndex, trPrototype, zebra) {
        var tr = trPrototype.cloneNode(true);
        if (zebra) {
            tr.style.background = zebra;
        }

        var td = tr.firstChild;
        for (var columnIndex = 0; columnIndex < this._columnCount; columnIndex++) {
            var child = this.component.getComponent((rowIndex + (this._headerVisible ? 1 : 0)) * this._columnCount + columnIndex);
            if (!child) {
                break; // XXX ?
            }
            var cellDiv = document.createElement("div");
            if (rowIndex === Echo.AdvancedTableSync._HEADER_ROW) {
                cellDiv.style.styleFloat = "left";
                cellDiv.style.cssFloat = "left";
                cellDiv.style.overflow = "hidden";
                cellDiv.style.textOverflow = "ellipsis";
                cellDiv.className = "cssDivClassHeader_" + this._getCssId(columnIndex);
                cellDiv.style.padding = this._defaultCellPadding;
                cellDiv.style.paddingRight = "0px"; // the resize handle is enough 'padding'...
                td.appendChild(cellDiv);
                Echo.Render.renderComponentAdd(update, child, cellDiv);

                var resizeHandle = document.createElement("div");
                Echo.Sync.FillImage.render(this.component.render("resizeHandleFillImage"), resizeHandle);
                Echo.Sync.Color.render(this.component.render("resizeHandleBackground"), resizeHandle, "backgroundColor");
                resizeHandle.style.cursor = "col-resize";
                resizeHandle.style.styleFloat = "right"; // IE only
                resizeHandle.style.cssFloat = 'right';
                resizeHandle.style.width = Echo.AdvancedTableSync._RESIZE_HANDLE_WIDTH + "px";
                resizeHandle.style.height = "30px"; // XXX
                td.appendChild(resizeHandle);

                // add mouse listener
                var resizeListener = new ColumnResizeListener(columnIndex, this);
                resizeListener.addMoveListener(resizeHandle);
            } else {
                // this div is needed for FF and IE so the columns can get
                // smaller than their content (not actually needed for Chrome)
                // Note: it would work if we would set the table width but this
                // we do not want because otherwise on resize the columns following
                // the resizing column wouldn't move to the right but rather squeeze
                cellDiv.style.overflow = "hidden";
                cellDiv.style.textOverflow = "ellipsis";
                cellDiv.className = "cssDivClassBody_" + this._getCssId(columnIndex);
                cellDiv.style.padding = this._defaultCellPadding;
                td.appendChild(cellDiv);
                Echo.Render.renderComponentAdd(update, child, cellDiv);
            }
            var layoutData = child.render("layoutData");
            if (layoutData) {
                Echo.Sync.Alignment.render(layoutData.alignment, td, true, this.component);
                Echo.Sync.FillImage.render(layoutData.backgroundImage, td);
                Echo.Sync.Color.render(layoutData.background, td, "backgroundColor");
            }
            td = td.nextSibling;
        }
        return tr;
    },

    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        if (!update.hasUpdatedLayoutDataChildren() && !update.getAddedChildren() && !update.getRemovedChildren()) {
            if (Core.Arrays.containsAll(Echo.AdvancedTableSync._supportedPartialProperties, update.getUpdatedPropertyNames(), true)) {
                // partial update
                if (this._selectionEnabled) {
                    var selectionUpdate = update.getUpdatedProperty("selection");
                    if (selectionUpdate) {
                        this._setSelectedFromProperty(selectionUpdate.newValue, true);
                    }
                }
                return false;
            }
        }
        // full update
        var element = this._outerDiv ? this._outerDiv : this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return true;
    },

    _getCssId: function(col) {
        return (this.component.renderId + "").replace('.', '_') + "_" + col;
    },

    _resizeColumn: function(width, resizeBodyCol, col) {
        if (width < 1) {
            return;
        }
        var headerWidth = width - this._defaultPixelInsets.left - Echo.AdvancedTableSync._RESIZE_HANDLE_WIDTH;
        var bodyWidth = width - this._defaultPixelInsets.left - this._defaultPixelInsets.right;
        var id = this._getCssId(col);
        var t = ".cssTDClassHeader_" + id + " {width: " + width + "px;} " + ".cssDivClassHeader_" + id + " {width: " + headerWidth + "px;}";
        if (resizeBodyCol) {
            t += " .cssTDClassBody_" + id + " {width: " + width + "px;} " + ".cssDivClassBody_" + id + " {width: " + bodyWidth + "px;}";
        }
        if (Core.Web.Env.BROWSER_INTERNET_EXPLORER) {
            this.CSS_COL_STYLE[col].styleSheet.cssText = t;
        } else {
            this.CSS_COL_STYLE[col].innerHTML = t;
        }
    },

    /**
     * Sets the selection state based on the given selection property value.
     * 
     * @param {String} value the value of the selection property
     * @param {Boolean} clearPrevious if the previous selection state should be overwritten
     */
    _setSelectedFromProperty: function(value, clearPrevious) {
        if (value == this.selectionModel.getSelectionString()) {
            return;
        }
        if (clearPrevious) {
            this._clearSelected();
        }
        var selectedIndices = value.split(",");
        for (var i = 0; i < selectedIndices.length; i++) {
            if (selectedIndices[i] === "") {
                continue;
            }
            this._setSelected(parseInt(selectedIndices[i], 10), true);
        }
    },

    /**
     * Sets the selection state of a table row.
     * 
     * @param {Number} rowIndex the index of the row
     * @param {Boolean} newValue the new selection state
     */
    _setSelected: function(rowIndex, newValue) {
        this.selectionModel.setSelectedIndex(rowIndex, newValue);
        this._renderRowStyle(rowIndex);
    },

    _onDown: function(listener) {
        listener._startX = 0;
        var borderWidth = (this._col === 0 ? 2 : 1) * this._verticalOffset; 

        if (!this._manualColWidths) {
            this._manualColWidths = true;

            // remove col group - not needed any more
            if (this._colGroupBody) {
                this._table.removeChild(this._colGroupBody);
                this._colGroupBody = null;
            }

            // set column widths to absolute values
            var firstBodyRow = this._table.rows[0];
            for (var i = 0; i < firstBodyRow.cells.length; i++) {
                var w = firstBodyRow.cells[i].offsetWidth - borderWidth;
                this._resizeColumn(w, true, i);
                if (i === listener._col) {
                    this._cellWidth = w;
                }
            }
            if (this._width) {
                // when table width is set then expand columns
                // and add horizontal scrollbar when needed
                // in case width is null then the whole table expands
                this._table.style.width = null;
            }
        } else {
            var headerRow = this._tableHeader.rows[0];
            this._cellWidth = headerRow.cells[listener._col].offsetWidth - borderWidth;
        }
    },

    _onMove: function(listener, delta) {
        listener._startX += delta.x;
        var w = this._cellWidth + listener._startX;
        // respect minimum size
        if (w < 18) {
            return;
        }
        this._resizeColumn(w, true, listener._col);
        if (!this._width) {
            var tableWidth = parseInt(this._div.style.width, 10);
            this._div.style.width = (tableWidth + delta.x) + "px";
        }
    }

});

/**
 * @class Minimalistic representation of ListSelectionModel.
 */
Echo.AdvancedTable.ListSelectionModel = Core.extend({

    $static: {

        /**
         * Value for selection mode setting indicating single selection.
         * 
         * @type Number
         * @final
         */
        SINGLE_SELECTION: 0,

        /**
         * Value for selection mode setting indicating multiple selection.
         * 
         * @type Number
         * @final
         */
        MULTIPLE_SELECTION: 2
    },

    /**
     * Property class name.
     * 
     * @type String
     * @final
     */
    className: "ListSelectionModel",

    /**
     * Creates a ListSelectionModel.
     * 
     * @param {Number} selectionMode the selectionMode
     * @constructor
     * 
     */
    $construct: function(selectionMode) {
        this._selectionState = [];
        this._selectionMode = selectionMode;
    },

    /**
     * Returns the selection mode.
     * 
     * @return the selection mode
     * @type Number
     */
    getSelectionMode: function() {
        return this._selectionMode;
    },

    /**
     * Gets a comma-delimited list containing the selected indices.
     * 
     * @return the list
     * @type String
     */
    getSelectionString: function() {
        var selection = "";
        for (var i = 0; i < this._selectionState.length; i++) {
            if (this._selectionState[i]) {
                if (selection.length > 0) {
                    selection += ",";
                }
                selection += i;
            }
        }
        return selection;
    },

    /**
     * Determines whether an index is selected.
     * 
     * @param {Number} index the index
     * @return true if the index is selected
     * @type Boolean
     */
    isSelectedIndex: function(index) {
        if (this._selectionState.length <= index) {
            return false;
        } else {
            return this._selectionState[index];
        }
    },

    /**
     * Sets the selection state of the given index.
     * 
     * @param {Number} index the index
     * @param {Boolean} selected the new selection state
     */
    setSelectedIndex: function(index, selected) {
        this._selectionState[index] = selected;
    }
});


Echo.MouseListener = Core.extend({

    $abstract: true,

    DOWN: null,
    MOVE: null,
    UP: null,
    CLICK: null,
    _methodMoveRef: null,
    _methodUpRef: null,

    init2: function() {
        var isIPad = navigator.userAgent.match(/iPad/i) != null;
        var isAndroid = navigator.userAgent.match(/Android/i) != null;
        var isTouch = isIPad || isAndroid;
        this.DOWN = isTouch ? 'touchstart' : 'mousedown';
        this.MOVE = isTouch ? 'touchmove' : 'mousemove';
        this.UP = isTouch ? 'touchend' : 'mouseup';
        this.CLICK = isTouch ? 'touchstart' : 'click';
        this._methodMoveRef = Core.method(this, this._onMove);
        this._methodUpRef = Core.method(this, this._onUp);
    },

    $virtual: {
        onDown: function() {
        },
        onMove: function() {
        },
        onUp: function() {
        }
    },

    getX: function(event, absolute) {
        if (event.touches) {
            if (absolute) {
                return event.targetTouches[0].pageX;
            } else {
                var totalOffsetX = 0;
                var curElement = this._targetNode;
                do {
                    totalOffsetX += curElement.offsetLeft;
                    curElement = curElement.offsetParent;
                } while (curElement);
                return event.targetTouches[0].pageX - totalOffsetX;
            }
        } else {
            if (absolute) {
                return event.screenX;
            } else {
                return event.offsetX;
            }
        }
    },

    getY: function(event, absolute) {
        if (event.touches) {
            if (absolute) {
                return event.targetTouches[0].pageY;
            } else {
                var totalOffsetY = 0;
                var curElement = this;
                do {
                    totalOffsetY += curElement.offsetTop;
                    curElement = curElement.offsetParent;
                } while (curElement);
                return event.targetTouches[0].pageY - totalOffsetY;
            }
        } else {
            return event.offsetY;
        }
    },

    addMoveListener: function(targetNode) {
        if (!this.CLICK) {
            this.init2();
        }

        // this._targetNode = targetNode;
        this._previousX = 0;
        this._previousY = 0;
        Core.Web.Event.add(targetNode, this.DOWN, Core.method(this, this._onDown), false);
    },

    _onDown: function(event) {
        var posAbs = {
            x: this.getX(event, true),
            y: this.getY(event, true)
        };
        var posRel = {
            x: this.getX(event, false),
            y: this.getY(event, false)
        };
        this._previousX = posAbs.x;
        this._previousY = posAbs.y;

        // Prevent selections.
        Core.Web.dragInProgress = true;
        Core.Web.DOM.preventEventDefault(event);
        Core.Web.Event.add(document.body, this.MOVE, this._methodMoveRef, true);
        Core.Web.Event.add(document.body, this.UP, this._methodUpRef, true);
        this.onDown(event);
    },

    _onMove: function(event) {
        var x = this.getX(event, true);
        var y = this.getY(event, true);
        var delta = {
            x: x - this._previousX,
            y: y - this._previousY
        };
        this.onMove(delta);
        this._previousX = x;
        this._previousY = y;
    },

    _onUp: function(event) {
        Core.Web.DOM.preventEventDefault(event);
        Core.Web.dragInProgress = false;
        Core.Web.Event.remove(document.body, this.MOVE, this._methodMoveRef, true);
        Core.Web.Event.remove(document.body, this.UP, this._methodUpRef, true);
        this.onUp();
    }
});


ColumnResizeListener = Core.extend(Echo.MouseListener, {

    $construct: function(col, tableRef) {
        this._col = col;
        this._tableRef = tableRef;
    },

    _startX: 0,

    onDown: function(e) {
        this._tableRef._onDown(this);
    },

    onMove: function(delta) {
        this._tableRef._onMove(this, delta);
    }
});