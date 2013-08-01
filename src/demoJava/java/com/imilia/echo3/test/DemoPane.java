package com.imilia.echo3.test;

import nextapp.echo.app.Border;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Extent;
import nextapp.echo.app.WindowPane;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.table.DefaultTableModel;

import com.imilia.echo3.AdvancedTable;
import com.imilia.echo3.Stroke;

public class DemoPane extends ContentPane {

    public DemoPane() {
        
        Button btn = new Button("Hello World!");
        btn.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                addWindow();                
            }
        });
        add(btn);
        
        addWindow();
    }
    

    private void addWindow() {
        WindowPane w = new WindowPane();
        w.setTitle("Test Window");
        w.setWidth(new Extent(400));
        w.setHeight(new Extent(300));
        add(w);
        
        DefaultTableModel tm = new DefaultTableModel(4, 10);
        tm.addRow(new Object[]{"AAA", "BBBB", "CCCC", "DDDD"});
        for (int i = 0; i < 9; i++) {
            tm.addRow(new Object[]{"a" + i, "bbbbbbbbbbbbbbbbb" + i, "c" + i, "d" + i});
        }
        AdvancedTable table = new AdvancedTable();
        table.setModel(tm);
        table.setWidth(new Extent(100, Extent.PERCENT));
        table.setHeight(new Extent(100, Extent.PERCENT));
        table.setZebraBackground(new Color(222, 222, 222));
        table.setVerticalLine(new Stroke(3, Color.ORANGE, Border.STYLE_SOLID));
        table.setResizeHandleBackground(Color.DARKGRAY);
        w.add(table);

    }
    

}
