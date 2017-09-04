package com.dragonbones.geom;

public class Point {
    public float x, y;

    public Point() {
        this(0, 0);
    }

    public Point(float x, float y) {
        this.x = x;
        this.y = y;
    }

    public void copyFrom(Point value) {
        this.x = value.x;
        this.y = value.y;
    }

    public void clear() {
        this.x = this.y = 0f;
    }
}
