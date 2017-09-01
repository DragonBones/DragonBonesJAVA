package com.dragonbones.animation;

import com.dragonbones.armature.Slot;

/**
 * @internal
 * @private
 */
public abstract class SlotTimelineState extends TweenTimelineState {
    public Slot slot;

    protected void _onClear() {
        super._onClear();

        this.slot = null; //
    }
}
