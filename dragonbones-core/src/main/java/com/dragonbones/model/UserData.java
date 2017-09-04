package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.util.Array;
import com.dragonbones.util.FloatArray;
import com.dragonbones.util.IntArray;

/**
 * 自定义数据。
 *
 * @version DragonBones 5.0
 * @language zh_CN
 */
public class UserData extends BaseObject {
    /**
     * 自定义整数。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public final IntArray ints = new IntArray();
    /**
     * 自定义浮点数。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public final FloatArray floats = new FloatArray();
    /**
     * 自定义字符串。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public final Array<String> strings = new Array<>();

    /**
     * @private
     */
    protected void _onClear() {
        this.ints.clear();
        this.floats.clear();
        this.strings.clear();
    }

    /**
     * 获取自定义整数。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public int getInt() {
        return getInt(0);
    }

    /**
     * 获取自定义整数。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public int getInt(int index) {
        return index >= 0 && index < this.ints.size() ? this.ints.get(index) : 0;
    }

    /**
     * 获取自定义浮点数。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public float getFloat() {
        return getFloat(0);
    }

    /**
     * 获取自定义浮点数。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public float getFloat(int index) {
        return index >= 0 && index < this.floats.size() ? this.floats.get(index) : 0f;
    }

    /**
     * 获取自定义字符串。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public String getString() {
        return getString(0);
    }

    /**
     * 获取自定义字符串。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public String getString(int index) {
        return index >= 0 && index < this.strings.size() ? this.strings.get(index) : "";
    }
}
