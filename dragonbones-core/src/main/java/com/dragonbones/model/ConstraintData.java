package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public abstract class ConstraintData extends BaseObject {
    public float order;
    public BoneData target;
    public BoneData bone;
    @Nullable
    public BoneData root;

    protected void _onClear() {
        this.order = 0;
        this.target = null; //
        this.bone = null; //
        this.root = null;
    }
}
