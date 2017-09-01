package com.dragonbones.animation;

import com.dragonbones.core.BaseObject;
import com.dragonbones.geom.Transform;

/**
 * @internal
 * @private
 */
public class BonePose extends BaseObject {
    public final Transform current = new Transform();
    public final Transform delta = new Transform();
    public final Transform result = new Transform();

    protected void _onClear() {
        this.current.identity();
        this.delta.identity();
        this.result.identity();
    }
}
