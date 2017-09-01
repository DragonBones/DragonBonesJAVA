package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.util.*;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;

/**
 * 龙骨数据。
 * 一个龙骨数据包含多个骨架数据。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see ArmatureData
 */
public class DragonBonesData extends BaseObject {
    /**
     * 是否开启共享搜索。
     *
     * @default false
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public boolean autoSearch;
    /**
     * 动画帧频。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float frameRate;
    /**
     * 数据版本。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String version;
    /**
     * 数据名称。(该名称与龙骨项目名保持一致)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String name;
    /**
     * @private
     */
    public final IntArray frameIndices = new IntArray();
    /**
     * @private
     */
    public final FloatArray cachedFrames = new FloatArray();
    /**
     * 所有骨架数据名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see #armatures
     */
    public final Array<String> armatureNames = new Array<>();
    /**
     * 所有骨架数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see ArmatureData
     */
    public final Map<String, ArmatureData> armatures = new HashMap<>();
    /**
     * @private
     */
    public ShortArray intArray;
    /**
     * @private
     */
    public FloatArray floatArray;
    /**
     * @private
     */
    public ShortArray frameIntArray;
    /**
     * @private
     */
    public FloatArray frameFloatArray;
    /**
     * @private
     */
    public ShortArray frameArray;
    /**
     * @private
     */
    public CharArray timelineArray;
    /**
     * @private
     */
    @Nullable
    public UserData userData = null; // Initial value.

    /**
     * @private
     */
    protected void _onClear() {
        for (String k : this.armatures.keySet()) {
            this.armatures.get(k).returnToPool();
            this.armatures.remove(k);
        }

        if (this.userData != null) {
            this.userData.returnToPool();
        }

        this.autoSearch = false;
        this.frameRate = 0;
        this.version = "";
        this.name = "";
        this.frameIndices.clear();
        this.cachedFrames.clear();
        this.armatureNames.clear();
        //this.armatures.clear();
        this.intArray = null; //
        this.floatArray = null; //
        this.frameIntArray = null; //
        this.frameFloatArray = null; //
        this.frameArray = null; //
        this.timelineArray = null; //
        this.userData = null;
    }

    /**
     * @private
     */
    public void addArmature(ArmatureData value) {
        if (this.armatures.containsKey(value.name)) {
            Console.warn("Replace armature: " + value.name);
            this.armatures.get(value.name).returnToPool();
        }

        value.parent = this;
        this.armatures.put(value.name, value);
        this.armatureNames.add(value.name);
    }

    /**
     * 获取骨架数据。
     *
     * @param name 骨架数据名称。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see ArmatureData
     */
    @Nullable
    public ArmatureData getArmature(String name) {
        return this.armatures.get(name);
    }

    /**
     * @deprecated 已废弃，请参考 @see
     */
    public void dispose() {
        Console.warn("已废弃，请参考 @see");
        this.returnToPool();
    }
}
