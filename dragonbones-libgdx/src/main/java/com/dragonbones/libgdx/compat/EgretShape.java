package com.dragonbones.libgdx.compat;

public class EgretShape extends EgretDisplayObject {
    private EgretGraphics _graphics;

    public EgretGraphics getGraphics() {
        if (_graphics == null) {
            _graphics = new EgretGraphics();
        }
        return _graphics;
    }
}
