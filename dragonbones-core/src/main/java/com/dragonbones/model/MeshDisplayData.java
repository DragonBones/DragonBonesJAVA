package com.dragonbones.model;

import com.dragonbones.core.DisplayType;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public class MeshDisplayData extends ImageDisplayData {
    public boolean inheritAnimation;
    public int offset; // IntArray.
    @Nullable
    public WeightData weight = null; // Initial value.

    protected void _onClear() {
        super._onClear();

        if (this.weight != null) {
            this.weight.returnToPool();
        }

        this.type = DisplayType.Mesh;
        this.inheritAnimation = false;
        this.offset = 0;
        this.weight = null;
    }
}
