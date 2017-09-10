package com.dragonbones.libgdx;

import com.dragonbones.core.BaseObject;
import com.dragonbones.factory.BaseFactory;
import com.dragonbones.libgdx.compat.EgretBitmapData;
import com.dragonbones.libgdx.compat.EgretTexture;
import com.dragonbones.model.TextureAtlasData;
import com.dragonbones.model.TextureData;
import com.dragonbones.util.Console;
import org.jetbrains.annotations.Nullable;

/**
 * Egret 贴图集数据。
 * @version DragonBones 3.0
 * @language zh_CN
 */
public class GdxTextureAtlasData extends TextureAtlasData {
    private EgretTexture _renderTexture = null; // Initial value.
    /**
     * @private
     */
    protected void _onClear() {
        super._onClear();

        if (this._renderTexture != null) {
            //this.texture.dispose();
        }

        this._renderTexture = null;
    }
    /**
     * @private
     */
    public TextureData createTexture() {
        return BaseObject.borrowObject(GdxTextureData.class);
    }
    /**
     * Egret 贴图。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    @Nullable
    public EgretTexture getRenderTexture() {
        return this._renderTexture;
    }
    public void setRenderTexture(@Nullable EgretTexture value) {
        if (this._renderTexture == value) {
            return;
        }

        this._renderTexture = value;

        if (this._renderTexture != null) {
            EgretBitmapData bitmapData = this._renderTexture.getBitmapData();
            int textureAtlasWidth = this.width > 0.0 ? this.width : bitmapData.getWidth();
            int textureAtlasHeight = this.height > 0.0 ? this.height : bitmapData.getHeight();

            for (String k : this.textures.keySet()) {
                GdxTextureData textureData = (GdxTextureData)this.textures.get(k);
                    float subTextureWidth = Math.min(textureData.region.width, textureAtlasWidth - textureData.region.x); // TODO need remove
                float subTextureHeight = Math.min(textureData.region.height, textureAtlasHeight - textureData.region.y); // TODO need remove

                if (textureData.renderTexture == null) {
                    textureData.renderTexture = new EgretTexture();
                    if (textureData.rotated) {
                        textureData.renderTexture.$initData(
                                textureData.region.x, textureData.region.y,
                                subTextureHeight, subTextureWidth,
                                0, 0,
                                subTextureHeight, subTextureWidth,
                                textureAtlasWidth, textureAtlasHeight
                        );
                    }
                    else {
                        textureData.renderTexture.$initData(
                                textureData.region.x, textureData.region.y,
                                subTextureWidth, subTextureHeight,
                                0, 0,
                                subTextureWidth, subTextureHeight,
                                textureAtlasWidth, textureAtlasHeight
                        );
                    }
                }

                textureData.renderTexture._bitmapData = bitmapData;
            }
        }
        else {
            for (String k : this.textures.keySet()) {
                GdxTextureData textureData = (GdxTextureData)this.textures.get(k);
                textureData.renderTexture = null;
            }
        }
    }

    /**
     * @deprecated
     * 已废弃，请参考 @see
     * @see BaseFactory#removeTextureAtlasData(String, boolean)
     */
    public void dispose() {
        Console.warn("已废弃，请参考 @see");
        this.returnToPool();
    }
    /**
     * @deprecated
     * 已废弃，请参考 @see
     * @see BaseFactory#removeTextureAtlasData(String, boolean)
     */
    public EgretTexture getTexture() {
        return this.getRenderTexture();
    }
}
