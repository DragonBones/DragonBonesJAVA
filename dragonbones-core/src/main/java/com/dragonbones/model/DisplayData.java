package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.core.DisplayType;
import com.dragonbones.geom.Transform;

/**
 * @private
 */
public abstract class DisplayData extends BaseObject {
    public DisplayType type;
    public String name;
    public String path;
    public final Transform transform = new Transform();
    public ArmatureData parent;

    protected void _onClear() {
        this.name = "";
        this.path = "";
        this.transform.identity();
        this.parent = null; //
    }
}

