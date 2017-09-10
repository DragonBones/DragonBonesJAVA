package com.dragonbones.libgdx.compat;

import com.dragonbones.event.EventObject;
import com.dragonbones.event.EventStringType;

public class EgretEvent {
    public EventObject data;

    public static void release(EgretEvent event) {
        throw new RuntimeException("Not implemented");
    }

    public static <T extends EgretEvent> T create(Class<T> egretEventClass, EventStringType type) {
        throw new RuntimeException("Not implemented");
    }
}
