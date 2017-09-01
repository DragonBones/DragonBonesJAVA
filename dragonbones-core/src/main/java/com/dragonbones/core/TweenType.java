package com.dragonbones.core;

/**
 * @private
 */
public enum TweenType {
    None(0),
    Line(1),
    Curve(2),
    QuadIn(3),
    QuadOut(4),
    QuadInOut(5);

    final public int v;

    TweenType(int v) {
        this.v = v;
    }

    public static TweenType[] values = values();
}
