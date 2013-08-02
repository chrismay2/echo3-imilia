init = function() {
    Core.Debug.consoleElement = document.getElementById("debugconsole");
    Core.Web.init();

    var app = new TestApp();
    var client = new Echo.FreeClient(app, document.getElementById("rootArea"));
    client.loadStyleSheet("Default.stylesheet.xml");
    client.init();
};

TestApp = Core.extend(Echo.Application, {

    _contentPane: null,
    _mainSplitPane: null,
    _chkBigData: null,
    _chkHeader: null,
    _cboStyle: null,
    _cboWidth: null,
    _cboHeight: null,
    _cboCols: null,
    _chkRadius: null,
    _chkShadow: null,
    _chkExtraCols: null,
    _cboContainer: null,

    $construct: function() {
        Echo.Application.call(this);
        
        this._contentPane = new Echo.ContentPane();
        this.rootComponent.add(this._contentPane);

        this._mainSplitPane = new Echo.SplitPane({
             orientation: Echo.SplitPane.ORIENTATION_HORIZONTAL_LEFT_RIGHT,
             resizable: true,
             separatorPosition: "220px"
        });
        this._contentPane.add(this._mainSplitPane);
        
        var controlsColumn = new Echo.Column();
        this._mainSplitPane.add(controlsColumn);
        
        var that = this;
        var doAction = function(e) {
            that._showTable();
        };

        this._chkHeader = new Echo.CheckBox({
            selected: true,
            text: "Header",
            events: {
                action: doAction
            }
        });
        controlsColumn.add(this._chkHeader);

        this._chkOutsets = new Echo.CheckBox({
            selected: true,
            text: "Outsets",
            events: {
                action: doAction
            }
        });
        controlsColumn.add(this._chkOutsets);

        this._chkRadius = new Echo.CheckBox({
            selected: false,
            text: "Radius",
            events: {
                action: doAction
            }
        });
        controlsColumn.add(this._chkRadius);

        this._chkShadow = new Echo.CheckBox({
            selected: false,
            text: "Box Shadow",
            events: {
                action: doAction
            }
        });
        controlsColumn.add(this._chkShadow);

        this._chkBigData = new Echo.CheckBox({
            selected: true,
            text: "Extra Rows",
            events: {
                action: doAction
            }
        });
        controlsColumn.add(this._chkBigData);

        this._chkExtraCols = new Echo.CheckBox({
            selected: false,
            text: "Extra Columns",
            events: {
                action: doAction
            }
        });
        controlsColumn.add(this._chkExtraCols);

        var cboStyleAttr = {};
        cboStyleAttr.items = [{
            text: "Default",
            id: "default"
        }, {
            text: "Horizontal Minimalist",
            id: "horizontal_minimalist"
        }, {
            text: "Box",
            id: "box"
        }, {
            text: "Zebra",
            id: "zebra"
        }, {
            text: "Horizontal Emphasis",
            id: "horizontal_emphasis"
        }, {
            text: "Verticals Bars",
            id: "verticals"
        }];
        cboStyleAttr.selectedId = "verticals";
        cboStyleAttr.events = {
            action: doAction
        };
        controlsColumn.add(this._cboStyle = new Echo.SelectField(cboStyleAttr));

        var cboWidthAttr = {};
        cboWidthAttr.items = [{
            text: "Width = 500px",
            id: "500px"
        }, {
            text: "Width = 100%",
            id: "100pc"
        }, {
            text: "Width = null",
            id: "null"
        }];
        cboWidthAttr.selectedId = "100pc";
        cboWidthAttr.events = {
            action: doAction
        };
        controlsColumn.add(this._cboWidth = new Echo.SelectField(cboWidthAttr));

        var cboHeightAttr = {};
        cboHeightAttr.items = [{
            text: "Height = 320px",
            id: "320px"
        }, {
            text: "Height = 80%",
            id: "80%"
        }, {
            text: "Height = null",
            id: null
        }];
        cboHeightAttr.selectedId = "80%";
        cboHeightAttr.events = {
            action: doAction
        };
        controlsColumn.add(this._cboHeight = new Echo.SelectField(cboHeightAttr));

        var cboContainerAttr = {};
        cboContainerAttr.items = [{
            text: "Simple",
            id: "simple"
        }, {
            text: "Split panes",
            id: "split"
        }, {
            text: "Window",
            id: "window"
        }];
        cboContainerAttr.selectedId = "window";
        cboContainerAttr.events = {
            action: doAction
        };
        controlsColumn.add(this._cboContainer = new Echo.SelectField(cboContainerAttr));

        var cboColsAttr = {};
        cboColsAttr.items = [{
            text: "Columns = null",
            id: null
        }, {
            text: "Columns = 20/40/40/20%",
            id: "percent"
        }, {
            text: "Columns = 80/80/140/50px",
            id: "pixel1"
        }, {
            text: "Columns = 80/80/300/80px",
            id: "pixel2"
        }];
        cboColsAttr.selectedId = "null";
        cboColsAttr.events = {
            action: doAction
        };
        controlsColumn.add(this._cboCols = new Echo.SelectField(cboColsAttr));
        
        this._showTable();
    },

    
    _showTable: function() {
        if  (this._mainSplitPane.children.length > 1) {
            this._mainSplitPane.remove(1);
        }

        var tableContainer = null;
        switch (this._cboContainer.get("selectedId")) {
        case "simple":
            tableContainer = new Echo.Row({});
            this._mainSplitPane.add(tableContainer);
            break;
        case "split":
            var splitPane = new Echo.SplitPane({
                orientation: Echo.SplitPane.ORIENTATION_VERTICAL_TOP_BOTTOM,
                resizable: true
            });
            this._mainSplitPane.add(splitPane);
            tableContainer = new Echo.SplitPane({
                orientation: Echo.SplitPane.ORIENTATION_HORIZONTAL_RIGHT_LEFT,
                resizable: true,
                separatorPosition: "50px"
            });
            splitPane.add(tableContainer);
            tableContainer.add(new Echo.Label());
            break;
        case "window":
            tableContainer = new Echo.WindowPane({
                styleName: "Default",
                title: "This is a Window",
                background: "#ddafdd",
                width: "400px",
                height: "300px",
                positionY: "80px",
                border: null
            });
            this._contentPane.add(tableContainer);
        }

        var tableWidth = null;
        switch (this._cboWidth.get("selectedId")) {
        case "100pc":
            tableWidth = "100%";
            break;
        case "500px":
            tableWidth = "500px";
        default:
            break;
        }

        var columnWidths = null;
        switch (this._cboCols.get("selectedId")) {
        case "pixel1":
            columnWidths = ["80px", "80px", "140px", "50px"];
            break;
        case "pixel2":
            columnWidths = ["80px", "80px", "300px", "80px"];
            break;
        case "percent":
            columnWidths = ["20%", "40%", "40%", "20%"];
            break;
        }

        var colCount = this._chkExtraCols.get("selected") ? 12 : 4;

        var childrenTexts = ["Employee", "Net Salary Gain", "Bonus", "Supervisor", "Stephen C. Cox", "$300", "$50", "Bob", "Josephin Tan", "$150", "-", "Annie",
                "Joyce Ming", "$200", "$35", "Andy", "James Albert Pentel", "$175", "$25", "Annie"];
        var children = [];
        var z = 0;
        for ( var i = 0; i < childrenTexts.length; i++) {
            if (i < 4) {
                children[z++] = new Echo.Button({
                    text: childrenTexts[i],
                    border: "1px solid #665566",
                    icon: "img/test.png"
                });
            } else if (i === 12) {
                children[z++] = new Echo.CheckBox({
                    text: childrenTexts[i],
                    border: "1px solid #665566",
                    icon: "img/test.png",
                    layoutData: {
                        insets: "20px"
                    }
                });
            } else {
                children[z++] = new Echo.Label({
                    text: childrenTexts[i]
                });
            }
            if ((i + 1) % 4 === 0) {
                for ( var j = 4; j < colCount; j++) {
                    children[z++] = new Echo.Label({
                        text: "Extra_" + j
                    });
                }
            }
        }

        if (this._chkBigData.get("selected")) {
            for ( var k = 0; k < 240; k++) {
                children[z++] = new Echo.Label({
                    text: "Data_" + k
                });
            }
        }

        var attr = {
            columnCount: colCount,
            rowCount: z / colCount,
            width: tableWidth,
            height: this._cboHeight.get("selectedId"),
            selection: "2",
            outsets: this._chkOutsets.get("selected") ? "15px" : null,
            columnWidth: columnWidths,
            headerVisible: this._chkHeader.get("selected"),
            radius: this._chkRadius.get("selected") ? "20px" : null,
            boxShadow: this._chkShadow.get("selected") ? "3px 3px 12px 2px black" : null,
            selectionEnabled: true,
            selectionBackground: "#ffccaa",
            children: children
        }
        
        var style = this._cboStyle.get("selectedId");
        if (style === "default") {
            // nothing!
        } else if (style === "horizontal_minimalist") {
            attr.insets = "10px 5px";
            attr.horizontalLine = "1px solid #dddddd";
            attr.headerSeparatorLine = "3px solid #778899";
            attr.rolloverBackground = "#f0f0FD";
            attr.rolloverEnabled = true;
            attr.foreground = "gray";
            attr.headerForeground = "gray";
        } else if (style === "box") {
            attr.background = "#E8EDFF";
            attr.headerBackground = "#B9C9FE";
            attr.rolloverBackground = "#D0DAFD";
            attr.rolloverEnabled = true;
            attr.foreground = "#555555";
            attr.insets = "10px 5px";
            attr.horizontalLine = "2px solid #ffffff";
        } else if (style === "zebra") {
            attr.insets = "10px 5px";
            attr.zebraBackground = "#E8EDFF";
        } else if (style === "horizontal_emphasis") {
            attr.insets = "10px 5px";
            attr.foreground = "#555555";
            attr.rolloverBackground = "#ffffff";
            attr.rolloverForeground = "#770077";
            attr.background = "#f3f3f3";
            attr.rolloverEnabled = true;
            attr.headerSeparatorLine = "6px solid #ffffff";
            attr.horizontalLine = "4px solid #ffffff";
        } else if (style === "rounded_corner") {
            attr.background = "#E8EDFF";
            attr.headerBackground = "#B9C9FE";
            attr.foreground = "#555555";
            attr.rolloverBackground = "#D0DAFD";
            attr.rolloverEnabled = true;
            attr.insets = "12px 8px";
            attr.horizontalLine = "2px solid #ffffff";
        } else if (style === "verticals") {
            attr.insets = "10px 5px";
            attr.verticalLine = "3px solid #dddddd";
            attr.headerSeparatorLine = "8px solid #ff55ff";
            attr.foreground = "gray";
            attr.background = "#f4f4f4";
            attr.headerForeground = "gray";
        } else if (style === "xxxx") {
            // "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;
            attr.boxShadow = "3px 3px 12px 2px black";
            attr.background = "#ffffff";
            attr.border = "3px solid #778899";
            attr.headerBackground = "#778899";
            attr.headerForeground = "#f6f6f6";
            attr.horizontalLine = "2px dotted #778899";
            attr.insets = "3px";
            attr.radius = "20px";
            attr.rolloverBackground = "#333333";
            attr.rolloverEnabled = true;
            attr.selectionEnabled = true;
            attr.verticalLine = "2px dotted #778899";
            attr.zebraBackground = "#eeeeee";
        }

        var table = new Echo.AdvancedTable(attr);
        tableContainer.add(table);
    }
});
