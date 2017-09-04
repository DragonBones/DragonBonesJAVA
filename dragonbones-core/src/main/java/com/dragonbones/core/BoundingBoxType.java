package com.dragonbones.core;

/**
 * @version DragonBones 5.0
 * @language zh_CN
 * 包围盒类型。
 */
public enum BoundingBoxType {
    Rectangle(0),
    Ellipse(1),
    Polygon(2);

    public final int v;

    BoundingBoxType(int v) {
        this.v = v;
    }

    public static BoundingBoxType[] values = values();
}
