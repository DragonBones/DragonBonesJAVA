package com.dragonbones.libgdx.compat;

import java.util.function.DoubleConsumer;

public class EgretGlobals {
    public static float getTimer() {
        throw new RuntimeException("Not implemented");
    }

    public static void startTick(DoubleConsumer clockHandler) {
    }
}
