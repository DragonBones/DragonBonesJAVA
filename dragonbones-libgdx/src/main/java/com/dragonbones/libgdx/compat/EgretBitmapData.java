package com.dragonbones.libgdx.compat;

public class EgretBitmapData {
    private final int width;
    private final int height;

    public EgretBitmapData(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }
}
