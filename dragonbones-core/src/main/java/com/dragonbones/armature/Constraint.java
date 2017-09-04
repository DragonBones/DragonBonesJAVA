package com.dragonbones.armature;

import com.dragonbones.core.BaseObject;
import com.dragonbones.geom.Matrix;
import com.dragonbones.geom.Point;
import com.dragonbones.geom.Transform;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 * @internal
 */
public abstract class Constraint extends BaseObject {
    protected static final Matrix _helpMatrix = new Matrix();
    protected static final Transform _helpTransform = new Transform();
    protected static final Point _helpPoint = new Point();

    public Bone target;
    public Bone bone;
    @Nullable
    public Bone root;

    protected void _onClear() {
        this.target = null; //
        this.bone = null; //
        this.root = null; //
    }

    public abstract void update();
}
