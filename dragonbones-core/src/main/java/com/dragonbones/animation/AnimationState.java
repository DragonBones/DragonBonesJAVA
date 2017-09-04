package com.dragonbones.animation;

import com.dragonbones.armature.Armature;
import com.dragonbones.armature.Bone;
import com.dragonbones.armature.Slot;
import com.dragonbones.core.BaseObject;
import com.dragonbones.core.DisplayType;
import com.dragonbones.event.EventObject;
import com.dragonbones.event.EventStringType;
import com.dragonbones.geom.Transform;
import com.dragonbones.model.*;
import com.dragonbones.util.Array;
import com.dragonbones.util.IntArray;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * 动画状态，播放动画时产生，可以对每个播放的动画进行更细致的控制和调节。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see Animation
 * @see AnimationData
 */
public class AnimationState extends BaseObject {
    /**
     * 是否将骨架的骨骼和插槽重置为绑定姿势（如果骨骼和插槽在这个动画状态中没有动画）。
     *
     * @version DragonBones 5.1
     * @language zh_CN
     */
    public boolean resetToPose;
    /**
     * 是否以增加的方式混合。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public boolean additiveBlending;
    /**
     * 是否对插槽的显示对象有控制权。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Slot#displayController
     */
    public boolean displayControl;
    /**
     * 是否能触发行为。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public boolean actionEnabled;
    /**
     * 混合图层。
     *
     * @version DragonBones 3.0
     * @readonly
     * @language zh_CN
     */
    public float layer;
    /**
     * 播放次数。 [0: 无限循环播放, [1~N]: 循环播放 N 次]
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public int playTimes;
    /**
     * 播放速度。 [(-N~0): 倒转播放, 0: 停止播放, (0~1): 慢速播放, 1: 正常播放, (1~N): 快速播放]
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float timeScale;
    /**
     * 混合权重。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float weight;
    /**
     * 自动淡出时间。 [-1: 不自动淡出, [0~N]: 淡出时间] (以秒为单位)
     * 当设置一个大于等于 0 的值，动画状态将会在播放完成后自动淡出。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float autoFadeOutTime;
    /**
     * @private
     */
    public float fadeTotalTime;
    /**
     * 动画名称。
     *
     * @version DragonBones 3.0
     * @readonly
     * @language zh_CN
     */
    public String name;
    /**
     * 混合组。
     *
     * @version DragonBones 3.0
     * @readonly
     * @language zh_CN
     */
    public String group;
    /**
     * 动画数据。
     *
     * @version DragonBones 3.0
     * @readonly
     * @language zh_CN
     * @see AnimationData
     */
    public AnimationData animationData;

    private boolean _timelineDirty;
    /**
     * @internal
     * @private xx: Play Enabled, Fade Play Enabled
     */
    public int _playheadState;
    /**
     * @internal
     * @private -1: Fade in, 0: Fade complete, 1: Fade out;
     */
    public float _fadeState;
    /**
     * @internal
     * @private -1: Fade start, 0: Fading, 1: Fade complete;
     */
    public float _subFadeState;
    /**
     * @internal
     * @private
     */
    public float _position;
    /**
     * @internal
     * @private
     */
    public float _duration;
    private float _fadeTime;
    private float _time;
    /**
     * @internal
     * @private
     */
    public float _fadeProgress;
    private float _weightResult;
    private Array<String> _boneMask = new Array<>();
    private Array<BoneTimelineState> _boneTimelines = new Array<>();
    private Array<SlotTimelineState> _slotTimelines = new Array<>();
    private Map<String, BonePose> _bonePoses = new HashMap<>();
    private Armature _armature;
    /**
     * @internal
     * @private
     */
    public ActionTimelineState _actionTimeline = null; // Initial value.
    @Nullable
    private ZOrderTimelineState _zOrderTimeline = null; // Initial value.

    /**
     * @private
     */
    protected void _onClear() {
        for (BoneTimelineState timeline : this._boneTimelines) {
            timeline.returnToPool();
        }

        for (SlotTimelineState timeline : this._slotTimelines) {
            timeline.returnToPool();
        }

        for (String k : this._bonePoses.keySet()) {
            this._bonePoses.get(k).returnToPool();
            this._bonePoses.remove(k);
        }

        if (this._actionTimeline != null) {
            this._actionTimeline.returnToPool();
        }

        if (this._zOrderTimeline != null) {
            this._zOrderTimeline.returnToPool();
        }

        this.resetToPose = false;
        this.additiveBlending = false;
        this.displayControl = false;
        this.actionEnabled = false;
        this.layer = 0;
        this.playTimes = 1;
        this.timeScale = 1f;
        this.weight = 1f;
        this.autoFadeOutTime = 0f;
        this.fadeTotalTime = 0f;
        this.name = "";
        this.group = "";
        this.animationData = null; //

        this._timelineDirty = true;
        this._playheadState = 0;
        this._fadeState = -1;
        this._subFadeState = -1;
        this._position = 0f;
        this._duration = 0f;
        this._fadeTime = 0f;
        this._time = 0f;
        this._fadeProgress = 0f;
        this._weightResult = 0f;
        this._boneMask.clear();
        this._boneTimelines.clear();
        this._slotTimelines.clear();
        // this._bonePoses.clear();
        this._armature = null; //
        this._actionTimeline = null; //
        this._zOrderTimeline = null;
    }

    private boolean _isDisabled(Slot slot) {
        if (this.displayControl) {
            String displayController = slot.displayController;
            if (
                    displayController == null ||
                            Objects.equals(displayController, this.name) ||
                            Objects.equals(displayController, this.group)
                    ) {
                return false;
            }
        }

        return true;
    }

    private void _advanceFadeTime(float passedTime) {
        boolean isFadeOut = this._fadeState > 0;

        if (this._subFadeState < 0) { // Fade start event.
            this._subFadeState = 0;

            EventStringType eventType = isFadeOut ? EventObject.FADE_OUT : EventObject.FADE_IN;
            if (this._armature.getEventDispatcher().hasEvent(eventType)) {
                EventObject eventObject = BaseObject.borrowObject(EventObject.class);
                eventObject.type = eventType;
                eventObject.armature = this._armature;
                eventObject.animationState = this;
                this._armature._dragonBones.bufferEvent(eventObject);
            }
        }

        if (passedTime < 0f) {
            passedTime = -passedTime;
        }

        this._fadeTime += passedTime;

        if (this._fadeTime >= this.fadeTotalTime) { // Fade complete.
            this._subFadeState = 1;
            this._fadeProgress = isFadeOut ? 0f : 1f;
        } else if (this._fadeTime > 0f) { // Fading.
            this._fadeProgress = isFadeOut ? (1f - this._fadeTime / this.fadeTotalTime) : (this._fadeTime / this.fadeTotalTime);
        } else { // Before fade.
            this._fadeProgress = isFadeOut ? 1f : 0f;
        }

        if (this._subFadeState > 0) { // Fade complete event.
            if (!isFadeOut) {
                this._playheadState |= 1; // x1
                this._fadeState = 0;
            }

            EventStringType eventType = isFadeOut ? EventObject.FADE_OUT_COMPLETE : EventObject.FADE_IN_COMPLETE;
            if (this._armature.getEventDispatcher().hasEvent(eventType)) {
                EventObject eventObject = BaseObject.borrowObject(EventObject.class);
                eventObject.type = eventType;
                eventObject.armature = this._armature;
                eventObject.animationState = this;
                this._armature._dragonBones.bufferEvent(eventObject);
            }
        }
    }

    private void _blendBoneTimline(BoneTimelineState timeline) {
        final Bone bone = timeline.bone;
        final Transform bonePose = timeline.bonePose.result;
        Transform animationPose = bone.animationPose;
        float boneWeight = this._weightResult > 0f ? this._weightResult : -this._weightResult;

        if (!bone._blendDirty) {
            bone._blendDirty = true;
            bone._blendLayer = this.layer;
            bone._blendLayerWeight = boneWeight;
            bone._blendLeftWeight = 1f;

            animationPose.x = bonePose.x * boneWeight;
            animationPose.y = bonePose.y * boneWeight;
            animationPose.rotation = bonePose.rotation * boneWeight;
            animationPose.skew = bonePose.skew * boneWeight;
            animationPose.scaleX = (bonePose.scaleX - 1f) * boneWeight + 1f;
            animationPose.scaleY = (bonePose.scaleY - 1f) * boneWeight + 1f;
        } else {
            boneWeight *= bone._blendLeftWeight;
            bone._blendLayerWeight += boneWeight;

            animationPose.x += bonePose.x * boneWeight;
            animationPose.y += bonePose.y * boneWeight;
            animationPose.rotation += bonePose.rotation * boneWeight;
            animationPose.skew += bonePose.skew * boneWeight;
            animationPose.scaleX += (bonePose.scaleX - 1f) * boneWeight;
            animationPose.scaleY += (bonePose.scaleY - 1f) * boneWeight;
        }

        if (this._fadeState != 0 || this._subFadeState != 0) {
            bone._transformDirty = true;
        }
    }

    /**
     * @private
     * @internal
     */
    public void init(Armature armature, AnimationData animationData, AnimationConfig animationConfig) {
        if (this._armature != null) {
            return;
        }

        this._armature = armature;

        this.animationData = animationData;
        this.resetToPose = animationConfig.resetToPose;
        this.additiveBlending = animationConfig.additiveBlending;
        this.displayControl = animationConfig.displayControl;
        this.actionEnabled = animationConfig.actionEnabled;
        this.layer = animationConfig.layer;
        this.playTimes = animationConfig.playTimes;
        this.timeScale = animationConfig.timeScale;
        this.fadeTotalTime = animationConfig.fadeInTime;
        this.autoFadeOutTime = animationConfig.autoFadeOutTime;
        this.weight = animationConfig.weight;
        this.name = animationConfig.name.length() > 0 ? animationConfig.name : animationConfig.animation;
        this.group = animationConfig.group;

        if (animationConfig.pauseFadeIn) {
            this._playheadState = 2; // 10
        } else {
            this._playheadState = 3; // 11
        }

        if (animationConfig.duration < 0f) {
            this._position = 0f;
            this._duration = this.animationData.duration;
            if (animationConfig.position != 0f) {
                if (this.timeScale >= 0f) {
                    this._time = animationConfig.position;
                } else {
                    this._time = animationConfig.position - this._duration;
                }
            } else {
                this._time = 0f;
            }
        } else {
            this._position = animationConfig.position;
            this._duration = animationConfig.duration;
            this._time = 0f;
        }

        if (this.timeScale < 0f && this._time == 0f) {
            this._time = -0.000001f; // Turn to end.
        }

        if (this.fadeTotalTime <= 0f) {
            this._fadeProgress = 0.999999f; // Make different.
        }

        if (animationConfig.boneMask.size() > 0) {
            this._boneMask.setLength(animationConfig.boneMask.size());
            for (int i = 0, l = this._boneMask.size(); i < l; ++i) {
                this._boneMask.set(i, animationConfig.boneMask.get(i));
            }
        }

        this._actionTimeline = BaseObject.borrowObject(ActionTimelineState.class);
        this._actionTimeline.init(this._armature, this, this.animationData.actionTimeline);
        this._actionTimeline.currentTime = this._time;
        if (this._actionTimeline.currentTime < 0f) {
            this._actionTimeline.currentTime = this._duration - this._actionTimeline.currentTime;
        }

        if (this.animationData.zOrderTimeline != null) {
            this._zOrderTimeline = BaseObject.borrowObject(ZOrderTimelineState.class);
            this._zOrderTimeline.init(this._armature, this, this.animationData.zOrderTimeline);
        }
    }

    /**
     * @private
     * @internal
     */
    public void updateTimelines() {
        Map<String, Array<BoneTimelineState>> boneTimelines = new HashMap<>();
        for (BoneTimelineState timeline : this._boneTimelines) { // Create bone timelines map.
            String timelineName = timeline.bone.name;
            if (!(boneTimelines.containsKey(timelineName))) {
                boneTimelines.put(timelineName, new Array<>());
            }

            boneTimelines.get(timelineName).add(timeline);
        }

        for (Bone bone : this._armature.getBones()) {
            String timelineName = bone.name;
            if (!this.containsBoneMask(timelineName)) {
                continue;
            }

            Array<TimelineData> timelineDatas = this.animationData.getBoneTimelines(timelineName);
            if (boneTimelines.containsKey(timelineName)) { // Remove bone timeline from map.
                boneTimelines.remove(timelineName);
            } else { // Create new bone timeline.
                if (!this._bonePoses.containsKey(timelineName)) {
                    this._bonePoses.put(timelineName, BaseObject.borrowObject(BonePose.class));
                }
                BonePose bonePose = this._bonePoses.get(timelineName);
                if (timelineDatas != null) {
                    for (TimelineData timelineData : timelineDatas) {
                        switch (timelineData.type) {
                            case BoneAll:
                                BoneAllTimelineState timeline = BaseObject.borrowObject(BoneAllTimelineState.class);
                                timeline.bone = bone;
                                timeline.bonePose = bonePose;
                                timeline.init(this._armature, this, timelineData);
                                this._boneTimelines.push(timeline);
                                break;

                            case BoneT:
                            case BoneR:
                            case BoneS:
                                // TODO
                                break;

                            case BoneX:
                            case BoneY:
                            case BoneRotate:
                            case BoneSkew:
                            case BoneScaleX:
                            case BoneScaleY:
                                // TODO
                                break;
                        }
                    }
                } else if (this.resetToPose) { // Pose timeline.
                    BoneAllTimelineState timeline = BaseObject.borrowObject(BoneAllTimelineState.class);
                    timeline.bone = bone;
                    timeline.bonePose = bonePose;
                    timeline.init(this._armature, this, null);
                    this._boneTimelines.push(timeline);
                }
            }
        }

        for (String k : boneTimelines.keySet()) { // Remove bone timelines.
            for (BoneTimelineState timeline : boneTimelines.get(k)) {
                this._boneTimelines.splice(this._boneTimelines.indexOfObject(timeline), 1);
                timeline.returnToPool();
            }
        }

        Map<String, Array<SlotTimelineState>> slotTimelines = new HashMap<>();
        IntArray ffdFlags = new IntArray();
        for (SlotTimelineState timeline : this._slotTimelines) { // Create slot timelines map.
            String timelineName = timeline.slot.name;
            if (!(slotTimelines.containsKey(timelineName))) {
                slotTimelines.put(timelineName, new Array<>());
            }

            slotTimelines.get(timelineName).add(timeline);
        }

        for (Slot slot : this._armature.getSlots()) {
            String boneName = slot.getParent().name;
            if (!this.containsBoneMask(boneName)) {
                continue;
            }

            String timelineName = slot.name;
            Array<TimelineData> timelineDatas = this.animationData.getSlotTimeline(timelineName);
            if (slotTimelines.containsKey(timelineName)) {
                slotTimelines.remove(timelineName);
            } else { // Create new slot timeline.
                boolean displayIndexFlag = false;
                boolean colorFlag = false;
                ffdFlags.clear();

                if (timelineDatas != null) {
                    for (TimelineData timelineData : timelineDatas) {
                        switch (timelineData.type) {
                            case SlotDisplay: {
                                SlotDislayIndexTimelineState timeline = BaseObject.borrowObject(SlotDislayIndexTimelineState.class);
                                timeline.slot = slot;
                                timeline.init(this._armature, this, timelineData);
                                this._slotTimelines.push(timeline);
                                displayIndexFlag = true;
                                break;
                            }

                            case SlotColor: {
                                SlotColorTimelineState timeline = BaseObject.borrowObject(SlotColorTimelineState.class);
                                timeline.slot = slot;
                                timeline.init(this._armature, this, timelineData);
                                this._slotTimelines.push(timeline);
                                colorFlag = true;
                                break;
                            }

                            case SlotFFD: {
                                SlotFFDTimelineState timeline = BaseObject.borrowObject(SlotFFDTimelineState.class);
                                timeline.slot = slot;
                                timeline.init(this._armature, this, timelineData);
                                this._slotTimelines.push(timeline);
                                ffdFlags.push(timeline.meshOffset);
                                break;
                            }
                        }
                    }
                }

                if (this.resetToPose) { // Pose timeline.
                    if (!displayIndexFlag) {
                        SlotDislayIndexTimelineState timeline = BaseObject.borrowObject(SlotDislayIndexTimelineState.class);
                        timeline.slot = slot;
                        timeline.init(this._armature, this, null);
                        this._slotTimelines.push(timeline);
                    }

                    if (!colorFlag) {
                        SlotColorTimelineState timeline = BaseObject.borrowObject(SlotColorTimelineState.class);
                        timeline.slot = slot;
                        timeline.init(this._armature, this, null);
                        this._slotTimelines.push(timeline);
                    }

                    for (DisplayData displayData : slot._rawDisplayDatas) {
                        if (displayData != null && displayData.type == DisplayType.Mesh && ffdFlags.indexOfObject(((MeshDisplayData) displayData).offset) < 0) {
                            SlotFFDTimelineState timeline = BaseObject.borrowObject(SlotFFDTimelineState.class);
                            timeline.slot = slot;
                            timeline.init(this._armature, this, null);
                            this._slotTimelines.push(timeline);
                        }
                    }
                }
            }
        }

        for (String k : slotTimelines.keySet()) { // Remove slot timelines.
            for (SlotTimelineState timeline : slotTimelines.get(k)) {
                this._slotTimelines.splice(this._slotTimelines.indexOfObject(timeline), 1);
                timeline.returnToPool();
            }
        }
    }

    /**
     * @private
     * @internal
     */
    public void advanceTime(float passedTime, float cacheFrameRate) {
        // Update fade time.
        if (this._fadeState != 0 || this._subFadeState != 0) {
            this._advanceFadeTime(passedTime);
        }

        // Update time.
        if (this._playheadState == 3) { // 11
            if (this.timeScale != 1f) {
                passedTime *= this.timeScale;
            }

            this._time += passedTime;
        }

        if (this._timelineDirty) {
            this._timelineDirty = false;
            this.updateTimelines();
        }

        if (this.weight == 0f) {
            return;
        }

        boolean isCacheEnabled = this._fadeState == 0 && cacheFrameRate > 0f;
        boolean isUpdateTimeline = true;
        boolean isUpdateBoneTimeline = true;
        float time = this._time;
        this._weightResult = this.weight * this._fadeProgress;

        this._actionTimeline.update(time); // Update main timeline.

        if (isCacheEnabled) { // Cache time internval.
            float internval = cacheFrameRate * 2.0f;
            this._actionTimeline.currentTime = (float) (Math.floor(this._actionTimeline.currentTime * internval) / internval);
        }

        if (this._zOrderTimeline != null) { // Update zOrder timeline.
            this._zOrderTimeline.update(time);
        }

        if (isCacheEnabled) { // Update cache.
            int cacheFrameIndex = (int) Math.floor(this._actionTimeline.currentTime * cacheFrameRate); // uint
            if (this._armature._cacheFrameIndex == cacheFrameIndex) { // Same cache.
                isUpdateTimeline = false;
                isUpdateBoneTimeline = false;
            } else {
                this._armature._cacheFrameIndex = cacheFrameIndex;
                if (this.animationData.cachedFrames.getBool(cacheFrameIndex)) { // Cached.
                    isUpdateBoneTimeline = false;
                } else { // Cache.
                    this.animationData.cachedFrames.setBool(cacheFrameIndex, true);
                }
            }
        }

        if (isUpdateTimeline) {
            if (isUpdateBoneTimeline) { // Update bone timelines.
                Bone bone = null;
                BoneTimelineState prevTimeline = null; //
                for (int i = 0, l = this._boneTimelines.size(); i < l; ++i) {
                    BoneTimelineState timeline = this._boneTimelines.get(i);
                    if (bone != timeline.bone) { // Blend bone pose.
                        if (bone != null) {
                            this._blendBoneTimline(prevTimeline);

                            if (bone._blendDirty) {
                                if (bone._blendLeftWeight > 0f) {
                                    if (bone._blendLayer != this.layer) {
                                        if (bone._blendLayerWeight >= bone._blendLeftWeight) {
                                            bone._blendLeftWeight = 0f;
                                            bone = null;
                                        } else {
                                            bone._blendLayer = this.layer;
                                            bone._blendLeftWeight -= bone._blendLayerWeight;
                                            bone._blendLayerWeight = 0f;
                                        }
                                    }
                                } else {
                                    bone = null;
                                }
                            }
                        }

                        bone = timeline.bone;
                    }

                    if (bone != null) {
                        timeline.update(time);
                        if (i == l - 1) {
                            this._blendBoneTimline(timeline);
                        } else {
                            prevTimeline = timeline;
                        }
                    }
                }
            }

            for (int i = 0, l = this._slotTimelines.size(); i < l; ++i) {
                SlotTimelineState timeline = this._slotTimelines.get(i);
                if (this._isDisabled(timeline.slot)) {
                    continue;
                }

                timeline.update(time);
            }
        }

        if (this._fadeState == 0) {
            if (this._subFadeState > 0) {
                this._subFadeState = 0;
            }

            if (this._actionTimeline.playState > 0) {
                if (this.autoFadeOutTime >= 0f) { // Auto fade out.
                    this.fadeOut(this.autoFadeOutTime);
                }
            }
        }
    }

    /**
     * 继续播放。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void play() {
        this._playheadState = 3; // 11
    }

    /**
     * 暂停播放。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void stop() {
        this._playheadState &= 1; // 0x
    }

    public void fadeOut(float fadeOutTime) {
        fadeOut(fadeOutTime, true);
    }

    /**
     * 淡出动画。
     *
     * @param fadeOutTime   淡出时间。 (以秒为单位)
     * @param pausePlayhead 淡出时是否暂停动画。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void fadeOut(float fadeOutTime, boolean pausePlayhead) {
        if (fadeOutTime < 0f) {
            fadeOutTime = 0f;
        }

        if (pausePlayhead) {
            this._playheadState &= 2; // x0
        }

        if (this._fadeState > 0) {
            if (fadeOutTime > this.fadeTotalTime - this._fadeTime) { // If the animation is already in fade out, the new fade out will be ignored.
                return;
            }
        } else {
            this._fadeState = 1;
            this._subFadeState = -1;

            if (fadeOutTime <= 0f || this._fadeProgress <= 0f) {
                this._fadeProgress = 0.000001f; // Modify fade progress to different value.
            }

            for (BoneTimelineState timeline : this._boneTimelines) {
                timeline.fadeOut();
            }

            for (SlotTimelineState timeline : this._slotTimelines) {
                timeline.fadeOut();
            }
        }

        this.displayControl = false; //
        this.fadeTotalTime = this._fadeProgress > 0.000001 ? fadeOutTime / this._fadeProgress : 0f;
        this._fadeTime = this.fadeTotalTime * (1f - this._fadeProgress);
    }

    /**
     * 是否包含骨骼遮罩。
     *
     * @param name 指定的骨骼名称。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public boolean containsBoneMask(String name) {
        return this._boneMask.size() == 0 || this._boneMask.indexOf(name) >= 0;
    }

    public void addBoneMask(String name) {
        addBoneMask(name, true);
    }

    /**
     * 添加骨骼遮罩。
     *
     * @param name      指定的骨骼名称。
     * @param recursive 是否为该骨骼的子骨骼添加遮罩。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void addBoneMask(String name, boolean recursive) {
        Bone currentBone = this._armature.getBone(name);
        if (currentBone == null) {
            return;
        }

        if (this._boneMask.indexOf(name) < 0) { // Add mixing
            this._boneMask.add(name);
        }

        if (recursive) { // Add recursive mixing.
            for (Bone bone : this._armature.getBones()) {
                if (this._boneMask.indexOf(bone.name) < 0 && currentBone.contains(bone)) {
                    this._boneMask.add(bone.name);
                }
            }
        }

        this._timelineDirty = true;
    }

    public void removeBoneMask(String name) {
        removeBoneMask(name, true);
    }

    /**
     * 删除骨骼遮罩。
     *
     * @param name      指定的骨骼名称。
     * @param recursive 是否删除该骨骼的子骨骼遮罩。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void removeBoneMask(String name, boolean recursive) {
        int index = this._boneMask.indexOf(name);
        if (index >= 0) { // Remove mixing.
            this._boneMask.splice(index, 1);
        }

        if (recursive) {
            Bone currentBone = this._armature.getBone(name);
            if (currentBone != null) {
                Array<Bone> bones = this._armature.getBones();
                if (this._boneMask.size() > 0) { // Remove recursive mixing.
                    for (Bone bone : bones) {
                        int index2 = this._boneMask.indexOf(bone.name);
                        if (index2 >= 0 && currentBone.contains(bone)) {
                            this._boneMask.splice(index2, 1);
                        }
                    }
                } else { // Add unrecursive mixing.
                    for (Bone bone : bones) {
                        if (bone == currentBone) {
                            continue;
                        }

                        if (!currentBone.contains(bone)) {
                            this._boneMask.add(bone.name);
                        }
                    }
                }
            }
        }

        this._timelineDirty = true;
    }

    /**
     * 删除所有骨骼遮罩。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void removeAllBoneMask() {
        this._boneMask.clear();
        this._timelineDirty = true;
    }

    /**
     * 是否正在淡入。
     *
     * @version DragonBones 5.1
     * @language zh_CN
     */
    public boolean isFadeIn() {
        return this._fadeState < 0;
    }

    /**
     * 是否正在淡出。
     *
     * @version DragonBones 5.1
     * @language zh_CN
     */
    public boolean isFadeOut() {
        return this._fadeState > 0;
    }

    /**
     * 是否淡入完毕。
     *
     * @version DragonBones 5.1
     * @language zh_CN
     */
    public boolean isFadeComplete() {
        return this._fadeState == 0;
    }

    /**
     * 是否正在播放。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public boolean isPlaying() {
        return (this._playheadState & 2) != 0 && this._actionTimeline.playState <= 0;
    }

    /**
     * 是否播放完毕。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public boolean isCompleted() {
        return this._actionTimeline.playState > 0;
    }

    /**
     * 当前播放次数。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public int getCurrentPlayTimes() {
        return this._actionTimeline.currentPlayTimes;
    }

    /**
     * 总时间。 (以秒为单位)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float getTotalTime() {
        return this._duration;
    }

    /**
     * 当前播放的时间。 (以秒为单位)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float getCurrentTime() {
        return this._actionTimeline.currentTime;
    }

    public void setCurrentTime(float value) {
        int currentPlayTimes = this._actionTimeline.currentPlayTimes - (this._actionTimeline.playState > 0 ? 1 : 0);
        if (value < 0 || this._duration < value) {
            value = (value % this._duration) + currentPlayTimes * this._duration;
            if (value < 0) {
                value += this._duration;
            }
        }

        if (this.playTimes > 0 && currentPlayTimes == this.playTimes - 1 && value == this._duration) {
            value = this._duration - 0.000001f;
        }

        if (this._time == value) {
            return;
        }

        this._time = value;
        this._actionTimeline.setCurrentTime(this._time);

        if (this._zOrderTimeline != null) {
            this._zOrderTimeline.playState = -1;
        }

        for (BoneTimelineState timeline : this._boneTimelines) {
            timeline.playState = -1;
        }

        for (SlotTimelineState timeline : this._slotTimelines) {
            timeline.playState = -1;
        }
    }

    /**
     * @see #animationData
     * @deprecated 已废弃，请参考 @see
     */
    public AnimationData getClip() {
        return this.animationData;
    }
}
