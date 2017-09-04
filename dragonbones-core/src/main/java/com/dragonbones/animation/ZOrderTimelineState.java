package com.dragonbones.animation;

/**
 * @internal
 * @private
 */
public class ZOrderTimelineState extends TimelineState {
    protected void _onArriveAtFrame() {
        if (this.playState >= 0) {
            int count = this._frameArray.get(this._frameOffset + 1);
            if (count > 0) {
                this._armature._sortZOrder(this._frameArray, this._frameOffset + 2);
            } else {
                this._armature._sortZOrder(null, 0);
            }
        }
    }

    protected void _onUpdateFrame() {
    }
}
