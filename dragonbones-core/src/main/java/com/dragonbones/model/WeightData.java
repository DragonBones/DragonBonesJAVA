package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.util.Array;

/**
 * @private
 */
public class WeightData extends BaseObject {
    public int count;
    public int offset; // IntArray.
    public final Array<BoneData> bones = new Array<>();

    protected void _onClear() {
        this.count = 0;
        this.offset = 0;
        this.bones.clear();
    }
}
