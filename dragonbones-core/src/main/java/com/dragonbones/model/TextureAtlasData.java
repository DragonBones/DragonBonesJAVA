package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.util.Console;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;

/**
 * 贴图集数据。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 */
public abstract class TextureAtlasData extends BaseObject {
    /**
     * 是否开启共享搜索。
     *
     * @default false
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public boolean autoSearch;
    /**
     * @private
     */
    public int width;
    /**
     * @private
     */
    public int height;
    /**
     * 贴图集缩放系数。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float scale;
    /**
     * 贴图集名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String name;
    /**
     * 贴图集图片路径。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String imagePath;
    /**
     * @private
     */
    public final Map<String, TextureData> textures = new HashMap<>();

    /**
     * @private
     */
    protected void _onClear() {
        for (String k : this.textures.keySet()) {
            this.textures.get(k).returnToPool();
            this.textures.remove(k);
        }

        this.autoSearch = false;
        this.width = 0;
        this.height = 0;
        this.scale = 1f;
        // this.textures.clear();
        this.name = "";
        this.imagePath = "";
    }

    /**
     * @private
     */
    public void copyFrom(TextureAtlasData value) {
        this.autoSearch = value.autoSearch;
        this.scale = value.scale;
        this.width = value.width;
        this.height = value.height;
        this.name = value.name;
        this.imagePath = value.imagePath;

        for (String k : this.textures.keySet()) {
            this.textures.get(k).returnToPool();
            this.textures.remove(k);
        }

        // this.textures.clear();

        for (String k : value.textures.keySet()) {
            TextureData texture = this.createTexture();
            texture.copyFrom(value.textures.get(k));
            this.textures.put(k, texture);
        }
    }

    /**
     * @private
     */
    public abstract TextureData createTexture();

    /**
     * @private
     */
    public void addTexture(TextureData value) {
        if (this.textures.containsKey(value.name)) {
            Console.warn("Replace texture: " + value.name);
            this.textures.get(value.name).returnToPool();
        }

        value.parent = this;
        this.textures.put(value.name, value);
    }

    /**
     * @private
     */
    @Nullable
    public TextureData getTexture(String name) {
        return this.textures.get(name);
    }
}
