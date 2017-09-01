package com.dragonbones.core;

/**
 * @private
 */
public enum DisplayType {
    Image(0),
    Armature(1),
    Mesh(2),
    BoundingBox(3);

    final public int v;

    DisplayType(int v) {
        this.v = v;
    }

    public static DisplayType[] values = values();
}
