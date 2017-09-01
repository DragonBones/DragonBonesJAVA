package com.dragonbones.core;

/**
 * @private
 */
public enum BlendMode {
    Normal(0),
    Add(1),
    Alpha(2),
    Darken(3),
    Difference(4),
    Erase(5),
    HardLight(6),
    Invert(7),
    Layer(8),
    Lighten(9),
    Multiply(10),
    Overlay(11),
    Screen(12),
    Subtract(13);

    final public int v;

    BlendMode(int v) {
        this.v = v;
    }

    public static BlendMode[] values = values();
}
