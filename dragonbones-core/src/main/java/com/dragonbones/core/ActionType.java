package com.dragonbones.core;

/**
 * @private
 */
public enum ActionType {
    Play(0),
    Frame(10),
    Sound(11);

    public final int v;

    ActionType(int v) {
        this.v = v;
    }

    public static ActionType[] values = values();
}
