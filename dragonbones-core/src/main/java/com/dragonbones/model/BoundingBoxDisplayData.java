package com.dragonbones.model;

import com.dragonbones.core.DisplayType;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public class BoundingBoxDisplayData extends DisplayData {
    @Nullable
    public BoundingBoxData boundingBox = null; // Initial value.

    protected void _onClear() {
        super._onClear();

        if (this.boundingBox != null) {
            this.boundingBox.returnToPool();
        }

        this.type = DisplayType.BoundingBox;
        this.boundingBox = null;
    }
}
