package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.geom.Rectangle;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public abstract class TextureData extends BaseObject {
    public static Rectangle createRectangle() {
        return new Rectangle();
    }

    public boolean rotated;
    public String name;
    public final Rectangle region = new Rectangle();
    public TextureAtlasData parent;
    @Nullable
    public Rectangle frame = null; // Initial value.

    protected void _onClear() {
        this.rotated = false;
        this.name = "";
        this.region.clear();
        this.parent = null; //
        this.frame = null;
    }

    public void copyFrom(TextureData value) {
        this.rotated = value.rotated;
        this.name = value.name;
        this.region.copyFrom(value.region);
        this.parent = value.parent;

        if (this.frame == null && value.frame != null) {
            this.frame = TextureData.createRectangle();
        } else if (this.frame != null && value.frame == null) {
            this.frame = null;
        }

        if (this.frame != null && value.frame != null) {
            this.frame.copyFrom(value.frame);
        }
    }
}
