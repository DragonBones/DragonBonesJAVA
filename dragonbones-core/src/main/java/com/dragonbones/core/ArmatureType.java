package com.dragonbones.core;

/**
 * @private
 */
public enum ArmatureType {
    Armature(0),
    MovieClip(1),
    Stage(2);

    final public int v;

    ArmatureType(int v) {
        this.v = v;
    }

    public static ArmatureType[] values = values();
}
