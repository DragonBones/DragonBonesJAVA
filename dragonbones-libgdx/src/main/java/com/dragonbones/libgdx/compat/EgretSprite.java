package com.dragonbones.libgdx.compat;

public class EgretSprite extends EgretDisplayObjectContainer {
    private EgretGraphics _graphics;

    public EgretGraphics getGraphics() {
        if (_graphics == null) {
            _graphics = new EgretGraphics();
        }
        return _graphics;
    }
}
