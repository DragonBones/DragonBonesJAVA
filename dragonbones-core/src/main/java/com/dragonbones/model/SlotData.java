package com.dragonbones.model;

import com.dragonbones.armature.Slot;
import com.dragonbones.core.BaseObject;
import com.dragonbones.core.BlendMode;
import com.dragonbones.geom.ColorTransform;
import org.jetbrains.annotations.Nullable;

/**
 * 插槽数据。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see Slot
 */
public class SlotData extends BaseObject {
    /**
     * @private
     */
    public static final ColorTransform DEFAULT_COLOR = new ColorTransform();

    /**
     * @private
     */
    public static ColorTransform createColor() {
        return new ColorTransform();
    }

    /**
     * @private
     */
    public BlendMode blendMode;
    /**
     * @private
     */
    public int displayIndex;
    /**
     * @private
     */
    public float zOrder;
    /**
     * 数据名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String name;
    /**
     * @private
     */
    @Nullable
    public ColorTransform color = null; // Initial value.
    /**
     * @private
     */
    @Nullable
    public UserData userData = null; // Initial value.
    /**
     * 所属的父骨骼数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see BoneData
     */
    public BoneData parent;

    /**
     * @private
     */
    protected void _onClear() {
        if (this.userData != null) {
            this.userData.returnToPool();
        }

        this.blendMode = BlendMode.Normal;
        this.displayIndex = 0;
        this.zOrder = 0;
        this.name = "";
        this.color = null; //
        this.userData = null;
        this.parent = null; //
    }
}
