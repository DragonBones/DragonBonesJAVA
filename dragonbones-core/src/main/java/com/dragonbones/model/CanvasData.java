package com.dragonbones.model;

import com.dragonbones.core.BaseObject;

/**
 * @private
 */
public class CanvasData extends BaseObject {
    public boolean hasBackground;
    public int color;
    public float x;
    public float y;
    public float width;
    public float height;

    /**
     * @private
     */
    protected void _onClear() {
        this.hasBackground = false;
        this.color = 0x000000;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
}