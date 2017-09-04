package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.core.TimelineType;

/**
 * @private
 */
public class TimelineData extends BaseObject {
    public TimelineType type;
    public int offset; // TimelineArray.
    public int frameIndicesOffset; // FrameIndices.

    protected void _onClear() {
        this.type = TimelineType.BoneAll;
        this.offset = 0;
        this.frameIndicesOffset = -1;
    }
}
