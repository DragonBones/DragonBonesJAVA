package com.dragonbones.geom;

public class Rectangle {
    public float x, y, width, height;

    public Rectangle() {
        this(0, 0, 0, 0);
    }

    public Rectangle(float x, float y, float width, float height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public void copyFrom(Rectangle value) {
        this.x = value.x;
        this.y = value.y;
        this.width = value.width;
        this.height = value.height;
    }

    public void clear() {
        this.x = this.y = 0f;
        this.width = this.height = 0f;
    }
}
