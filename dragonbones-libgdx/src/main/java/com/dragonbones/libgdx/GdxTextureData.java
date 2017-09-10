package com.dragonbones.libgdx;

import com.dragonbones.libgdx.compat.EgretTexture;
import com.dragonbones.model.TextureData;

/**
 * @private
 */
public class GdxTextureData extends TextureData {
    public EgretTexture renderTexture = null; // Initial value.

    protected void _onClear() {
        super._onClear();

        if (this.renderTexture != null) {
            //this.texture.dispose();
        }

        this.renderTexture = null;
    }
}
