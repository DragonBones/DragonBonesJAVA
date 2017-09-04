package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.core.BoundingBoxType;
import com.dragonbones.geom.Point;
import org.jetbrains.annotations.Nullable;

/**
 * 边界框数据基类。
 *
 * @version DragonBones 5.0
 * @language zh_CN
 */
public abstract class BoundingBoxData extends BaseObject {
    /**
     * 边界框类型。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public BoundingBoxType type;
    /**
     * 边界框颜色。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public int color;
    /**
     * 边界框宽。（本地坐标系）
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public float width;
    /**
     * 边界框高。（本地坐标系）
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public float height;

    /**
     * @private
     */
    protected void _onClear() {
        this.color = 0x000000;
        this.width = 0f;
        this.height = 0f;
    }

    /**
     * 是否包含点。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public abstract boolean containsPoint(float pX, float pY);

    /**
     * 是否与线段相交。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public abstract int intersectsSegment(
            float xA, float yA, float xB, float yB,
            @Nullable Point intersectionPointA,
            @Nullable Point intersectionPointB,
            @Nullable Point normalRadians
    );
}

