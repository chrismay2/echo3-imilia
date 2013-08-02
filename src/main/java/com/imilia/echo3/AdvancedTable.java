/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package com.imilia.echo3;

import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Table;
import nextapp.echo.webcontainer.SynchronizePeerFactory;


/**
 * A component used to display data in a tabular format.
 * 
 * This component may contain child components, but they will be added and removed internally.  
 * Invoking <code>add()</code>/<code>remove()</code> directly on this component is not allowed.
 *
 * @see nextapp.echo.app.table
 */
public class AdvancedTable extends Table {
    
    static {
        SynchronizePeerFactory.registerSynchronizePeer(AdvancedTable.class, new AdvancedTablePeer());   
    }

    public static final String PROPERTY_HEIGHT = "height";
    public static final String PROPERTY_RESIZEHANDLE_BACKGROUND = "resizeHandleBackground"; 
    public static final String PROPERTY_RESIZEHANDLE_FILLIMAGE = "resizeHandleFillImage";     
    public static final String PROPERTY_HEADER_BACKGROUND = "headerBackground";
    public static final String PROPERTY_HEADER_FOREGROUND = "headerForeground";
    public static final String PROPERTY_HEADER_SEPARATOR_LINE = "headerSeparatorLine";
    public static final String PROPERTY_HORIZONTAL_LINE = "horizontalLine";
    public static final String PROPERTY_OUTSETS = "outsets";
    public static final String PROPERTY_VERTICAL_LINE = "verticalLine";
    public static final String PROPERTY_ZEBRA_BACKGROUND = "zebraBackground";

    /**
     * Returns the overall height of the grid.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * 
     * @return the height
     */
    public Extent getHeight() {
        return (Extent) get(PROPERTY_HEIGHT);
    }
    
    
    /**
     * Set the background color of the header
     * 
     * @param newValue The background color of the header
     */
    public void setHeaderBackground(Color newValue) {
        set(PROPERTY_HEADER_BACKGROUND, newValue);
    }

    /**
     * Set the foreground color of the header
     * 
     * @param newValue The foreground color of the header
     */
    public void setHeaderForeground(Color newValue) {
        set(PROPERTY_HEADER_FOREGROUND, newValue);
    }

    /**
     * Set a line separating the header from the body
     * 
     * @param newValue The line separating the header from the body
     */
    public void setHeaderSeparatorLine(Stroke newValue) {
        set(PROPERTY_HEADER_SEPARATOR_LINE, newValue);
    }
    
    /**
     * Sets the overall height of the grid.
     * This property supports <code>Extent</code>s with
     * fixed or percentile units.
     * If the height is null then the table expands automatically
     * to the height of its content
     * 
     * @param newValue the new height
     */
    public void setHeight(Extent newValue) {
        set(PROPERTY_HEIGHT, newValue);
    }

    /**
     * Set a line separating the rows
     * 
     * @param newValue The line separating the rows
     */
    public void setHorizontalLine(Stroke newValue) {
        set(PROPERTY_HORIZONTAL_LINE, newValue);
    }

    /**
     * Sets the margins (spacing) around the table
     * 
     * @param newValue the new component margins
     */
    public void setOutsets(Insets newValue) {
        set(PROPERTY_OUTSETS, newValue);
    }
    /**
     * Set the background color of the resize handles
     * 
     * @param newValue The background color of the resize handles
     */
    public void setResizeHandleBackground(Color newValue) {
        set(PROPERTY_RESIZEHANDLE_BACKGROUND, newValue);
    }

    /**
     * Set the fill image of the resize handles
     * 
     * @param newValue The fill image of the resize handles
     */
    public void setResizeHandleFillImage(FillImage newValue) {
        set(PROPERTY_RESIZEHANDLE_FILLIMAGE, newValue);
    }
    
    /**
     * Set a line separating the columns
     * 
     * @param newValue The line separating the columns
     */
    public void setVerticalLine(Stroke newValue) {
        set(PROPERTY_VERTICAL_LINE, newValue);
    }
    
    /**
     * Set the background color of every 2nd row
     * 
     * @param newValue The background color of every 2nd row
     */
    public void setZebraBackground(Color newValue) {
        set(PROPERTY_ZEBRA_BACKGROUND, newValue);
    }
    
    public Stroke getVerticalLine() {
        return (Stroke)get(PROPERTY_VERTICAL_LINE);
    }

    public Stroke getHorizontalLine() {
        return (Stroke)get(PROPERTY_HORIZONTAL_LINE);
    }

}
