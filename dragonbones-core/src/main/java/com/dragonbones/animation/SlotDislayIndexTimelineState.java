package com.dragonbones.animation;

/**
 * @internal
 * @private
 */
public class SlotDislayIndexTimelineState extends SlotTimelineState {
    protected void _onArriveAtFrame() {
        if (this.playState >= 0) {
            int displayIndex = this._timelineData != null ? this._frameArray.get(this._frameOffset + 1) : this.slot.slotData.displayIndex;
            if (this.slot.getDisplayIndex() != displayIndex) {
                this.slot._setDisplayIndex(displayIndex, true);
            }
        }
    }
}
