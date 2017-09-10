package com.dragonbones.libgdx.compat;

public class EgretBitmap extends EgretDisplayObject {
    public EgretTexture texture;

    public EgretBitmap() {

    }

    public EgretBitmap(EgretTexture renderTexture) {
        this.texture = renderTexture;
        throw new RuntimeException("Not implemented");
    }
}
