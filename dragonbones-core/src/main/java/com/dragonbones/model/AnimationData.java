package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.util.Array;
import com.dragonbones.util.BoolArray;
import com.dragonbones.util.IntArray;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;

/**
 * 动画数据。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 */
public class AnimationData extends BaseObject {
    /**
     * @private
     */
    public int frameIntOffset; // FrameIntArray.
    /**
     * @private
     */
    public int frameFloatOffset; // FrameFloatArray.
    /**
     * @private
     */
    public int frameOffset; // FrameArray.
    /**
     * 持续的帧数。 ([1~N])
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public int frameCount;
    /**
     * 播放次数。 [0: 无限循环播放, [1~N]: 循环播放 N 次]
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public int playTimes;
    /**
     * 持续时间。 (以秒为单位)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float duration;
    /**
     * @private
     */
    public float scale;
    /**
     * 淡入时间。 (以秒为单位)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float fadeInTime;
    /**
     * @private
     */
    public float cacheFrameRate;
    /**
     * 数据名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String name;
    /**
     * @private
     */
    public BoolArray cachedFrames = new BoolArray();
    /**
     * @private
     */
    public final Map<String, Array<TimelineData>> boneTimelines = new HashMap<>();
    /**
     * @private
     */
    public final Map<String, Array<TimelineData>> slotTimelines = new HashMap<>();
    /**
     * @private
     */
    public final Map<String, IntArray> boneCachedFrameIndices = new HashMap<>();
    /**
     * @private
     */
    public final Map<String, IntArray> slotCachedFrameIndices = new HashMap<>();
    /**
     * @private
     */
    @Nullable
    public TimelineData actionTimeline = null; // Initial value.
    /**
     * @private
     */
    @Nullable
    public TimelineData zOrderTimeline = null; // Initial value.
    /**
     * @private
     */
    public ArmatureData parent;

    /**
     * @private
     */
    protected void _onClear() {
        for (String k : this.boneTimelines.keySet()) {
            Array<TimelineData> timelineData = this.boneTimelines.get(k);
            for (int kA = 0; kA < timelineData.size(); kA++) {
                timelineData.get(kA).returnToPool();
            }

            this.boneTimelines.remove(k);
        }

        for (String k : this.slotTimelines.keySet()) {
            for (int kA = 0; kA < this.slotTimelines.size(); kA++) {
                this.slotTimelines.get(k).get(kA).returnToPool();
            }

            this.slotTimelines.remove(k);
        }

        this.boneCachedFrameIndices.clear();
        this.slotCachedFrameIndices.clear();

        if (this.actionTimeline != null) {
            this.actionTimeline.returnToPool();
        }

        if (this.zOrderTimeline != null) {
            this.zOrderTimeline.returnToPool();
        }

        this.frameIntOffset = 0;
        this.frameFloatOffset = 0;
        this.frameOffset = 0;
        this.frameCount = 0;
        this.playTimes = 0;
        this.duration = 0f;
        this.scale = 1f;
        this.fadeInTime = 0f;
        this.cacheFrameRate = 0f;
        this.name = "";
        this.cachedFrames.clear();
        //this.boneTimelines.clear();
        //this.slotTimelines.clear();
        //this.boneCachedFrameIndices.clear();
        //this.slotCachedFrameIndices.clear();
        this.actionTimeline = null;
        this.zOrderTimeline = null;
        this.parent = null; //
    }

    /**
     * @private
     */
    public void cacheFrames(float frameRate) {
        if (this.cacheFrameRate > 0f) { // TODO clear cache.
            return;
        }

        this.cacheFrameRate = (float) Math.max(Math.ceil(frameRate * this.scale), 1f);
        int cacheFrameCount = (int) (Math.ceil(this.cacheFrameRate * this.duration) + 1); // Cache one more frame.

        this.cachedFrames.setLength(cacheFrameCount);
        for (int i = 0, l = this.cachedFrames.size(); i < l; ++i) {
            this.cachedFrames.setBool(i, false);
        }

        for (BoneData bone : this.parent.sortedBones) {
            IntArray indices = new IntArray(cacheFrameCount);
            for (int i = 0, l = indices.size(); i < l; ++i) {
                indices.set(i, -1);
            }

            this.boneCachedFrameIndices.put(bone.name, indices);
        }

        for (SlotData slot : this.parent.sortedSlots) {
            IntArray indices = new IntArray(cacheFrameCount);
            for (int i = 0, l = indices.size(); i < l; ++i) {
                indices.set(i, -1);
            }

            this.slotCachedFrameIndices.put(slot.name, indices);
        }
    }

    /**
     * @private
     */
    public void addBoneTimeline(BoneData bone, TimelineData timeline) {
        if (!this.boneTimelines.containsKey(bone.name)) {
            this.boneTimelines.put(bone.name, new Array<>());
        }
        Array<TimelineData> timelines = this.boneTimelines.get(bone.name);
        if (timelines.indexOf(timeline) < 0) {
            timelines.add(timeline);
        }
    }

    /**
     * @private
     */
    public void addSlotTimeline(SlotData slot, TimelineData timeline) {
        if (!this.slotTimelines.containsKey(slot.name)) {
            this.slotTimelines.put(slot.name, new Array<>());
        }
        Array<TimelineData> timelines = this.slotTimelines.get(slot.name);
        if (timelines.indexOf(timeline) < 0) {
            timelines.add(timeline);
        }
    }

    /**
     * @private
     */
    public Array<TimelineData> getBoneTimelines(String name) {
        return this.boneTimelines.get(name);
    }

    /**
     * @private
     */
    public Array<TimelineData> getSlotTimeline(String name) {
        return this.slotTimelines.get(name);
    }

    /**
     * @private
     */
    public IntArray getBoneCachedFrameIndices(String name) {
        return this.boneCachedFrameIndices.get(name);
    }

    /**
     * @private
     */
    public IntArray getSlotCachedFrameIndices(String name) {
        return this.slotCachedFrameIndices.get(name);
    }
}
