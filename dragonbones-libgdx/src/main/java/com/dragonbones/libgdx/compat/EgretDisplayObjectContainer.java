package com.dragonbones.libgdx.compat;

public class EgretDisplayObjectContainer extends EgretDisplayObject {
    public EgretDisplayObject getChildByName(String name) {
        throw new RuntimeException("Not implemented");
    }

    public void removeChild(EgretDisplayObject child) {
        throw new RuntimeException("Not implemented");
    }

    public void addChild(EgretDisplayObject child) {
        throw new RuntimeException("Not implemented");
    }

    public int getChildIndex(EgretDisplayObject child) {
        throw new RuntimeException("Not implemented");
    }

    public void addChildAt(EgretDisplayObject child, float index) {
        throw new RuntimeException("Not implemented");
    }

    public void swapChildren(EgretDisplayObject l, EgretDisplayObject r) {
        throw new RuntimeException("Not implemented");
    }
}
