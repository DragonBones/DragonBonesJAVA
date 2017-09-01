package com.dragonbones.model;

import com.dragonbones.core.DisplayType;
import com.dragonbones.geom.Point;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public class ImageDisplayData extends DisplayData {
    public final Point pivot = new Point();
    @Nullable
    public TextureData texture;

    protected void _onClear() {
        super._onClear();

        this.type = DisplayType.Image;
        this.pivot.clear();
        this.texture = null;
    }
}
