package com.dragonbones.animation;

import com.dragonbones.armature.Bone;

/**
 * @internal
 * @private
 */
public abstract class BoneTimelineState extends TweenTimelineState {
    public Bone bone;
    public BonePose bonePose;

    protected void _onClear() {
        super._onClear();

        this.bone = null; //
        this.bonePose = null; //
    }
}
