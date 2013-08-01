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

import java.util.NoSuchElementException;
import java.util.StringTokenizer;

import nextapp.echo.app.Color;
import nextapp.echo.app.Extent;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.serial.property.ColorPeer;
import nextapp.echo.app.serial.property.ExtentPeer;
import nextapp.echo.app.util.ConstantMap;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Element;

/**
 * <code>SerialPropertyPeer</code> for <code>Color</code> properties.
 */
public class StrokePeer implements SerialPropertyPeer {

    private static final ConstantMap STYLE_CONSTANT_MAP = new ConstantMap();
    static {
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_NONE, "none");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_SOLID, "solid");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_INSET, "inset");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_OUTSET, "outset");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_GROOVE, "groove");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_RIDGE, "ridge");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_DOTTED, "dotted");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_DASHED, "dashed");
        STYLE_CONSTANT_MAP.add(Stroke.STYLE_DOUBLE, "double");
    }

    /**
     * Generates a <code>Stroke</code> from a string representation.
     * To create a non-multisided border from a string, simply pass the returned
     * <code>Side</code> to the constructor of a new <code>Border</code>.
     * 
     * @param value the string representation
     * @return the generated <code>Side</code>
     * @throws SerialException if the string is not a valid representation of a <code>Side</code>
     */
    public static final Stroke fromString(String value) throws SerialException {
        try {
            StringTokenizer st = new StringTokenizer(value, " ");
            String sizeString = st.nextToken();
            String styleString = st.nextToken();
            String colorString = st.nextToken();
            Extent size = ExtentPeer.fromString(sizeString);
            int style = STYLE_CONSTANT_MAP.get(styleString, Stroke.STYLE_SOLID);
            Color color = ColorPeer.fromString(colorString);
            return new Stroke(size, color, style);
        } catch (NoSuchElementException ex) {
            throw new SerialException("Unable to parse border stroke value: " + value, ex);
        }
    }

    /**
     * Generates a string representation of a <code>Stroke</code>
     * 
     * @param stroke the border side
     * @return the string representation
     * @throws SerialException
     */
    public static final String toString(Stroke stroke) {
        StringBuffer out = new StringBuffer();
        try {
            out.append(ExtentPeer.toString(stroke.getSize()));
            out.append(" ");
            out.append(STYLE_CONSTANT_MAP.get(stroke.getStyle()));
            out.append(" ");
            out.append(ColorPeer.toString(stroke.getColor()));
        } catch (SerialException e) {
            out.append(e.toString());
        }
        return out.toString();
    }


    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) throws SerialException {
        SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
        propertyElement.appendChild(serialContext.getDocument().createTextNode(toString((Stroke) propertyValue)));
    }

    @Override
    public Object toProperty(Context context, Class objectClass, Element propertyElement) throws SerialException {
        String value = DomUtil.getElementText(propertyElement);
        if (value == null) {
            return null;
        }
        return fromString(value.trim());
    }
}
