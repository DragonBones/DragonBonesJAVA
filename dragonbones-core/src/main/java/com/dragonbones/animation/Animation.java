package com.dragonbones.animation;

import com.dragonbones.armature.Armature;
import com.dragonbones.armature.Bone;
import com.dragonbones.armature.Slot;
import com.dragonbones.core.AnimationFadeOutMode;
import com.dragonbones.core.BaseObject;
import com.dragonbones.model.AnimationConfig;
import com.dragonbones.model.AnimationData;
import com.dragonbones.util.Array;
import com.dragonbones.util.Console;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * 动画控制器，用来播放动画数据，管理动画状态。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see AnimationData
 * @see AnimationState
 */
public class Animation extends BaseObject {
    /**
     * 播放速度。 [0: 停止播放, (0~1): 慢速播放, 1: 正常播放, (1~N): 快速播放]
     *
     * @default 1f
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float timeScale;

    private boolean _animationDirty; // Update bones and slots cachedFrameIndices.
    /**
     * @internal
     * @private
     */
    public boolean _timelineDirty; // Updata animationStates timelineStates.
    private final Array<String> _animationNames = new Array<>();
    private final Array<AnimationState> _animationStates = new Array<>();
    private final Map<String, AnimationData> _animations = new HashMap<>();
    private Armature _armature;
    @Nullable
    private AnimationConfig _animationConfig = null; // Initial value.
    @Nullable
    private AnimationState _lastAnimationState;

    /**
     * @private
     */
    protected void _onClear() {
        for (AnimationState animationState : this._animationStates) {
            animationState.returnToPool();
        }

        for (String k : this._animations.keySet()) {
            this._animations.remove(k);
        }

        if (this._animationConfig != null) {
            this._animationConfig.returnToPool();
        }

        this.timeScale = 1f;

        this._animationDirty = false;
        this._timelineDirty = false;
        this._animationNames.clear();
        this._animationStates.clear();
        //this._animations.clear();
        this._armature = null; //
        this._animationConfig = null; //
        this._lastAnimationState = null;
    }

    private void _fadeOut(AnimationConfig animationConfig) {
        switch (animationConfig.fadeOutMode) {
            case SameLayer:
                for (AnimationState animationState : this._animationStates) {
                    if (animationState.layer == animationConfig.layer) {
                        animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                    }
                }
                break;

            case SameGroup:
                for (AnimationState animationState : this._animationStates) {
                    if (Objects.equals(animationState.group, animationConfig.group)) {
                        animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                    }
                }
                break;

            case SameLayerAndGroup:
                for (AnimationState animationState : this._animationStates) {
                    if (
                            animationState.layer == animationConfig.layer &&
                                    Objects.equals(animationState.group, animationConfig.group)
                            ) {
                        animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                    }
                }
                break;

            case All:
                for (AnimationState animationState : this._animationStates) {
                    animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                }
                break;

            case None:
            case Single:
            default:
                break;
        }
    }

    /**
     * @internal
     * @private
     */
    public void init(Armature armature) {
        if (this._armature != null) {
            return;
        }

        this._armature = armature;
        this._animationConfig = BaseObject.borrowObject(AnimationConfig.class);
    }

    /**
     * @internal
     * @private
     */
    public void advanceTime(float passedTime) {
        if (passedTime < 0f) { // Only animationState can reverse play.
            passedTime = -passedTime;
        }

        if (this._armature.inheritAnimation && this._armature._parent != null) { // Inherit parent animation timeScale.
            passedTime *= this._armature._parent._armature.getAnimation().timeScale;
        }

        if (this.timeScale != 1f) {
            passedTime *= this.timeScale;
        }

        int animationStateCount = this._animationStates.size();
        if (animationStateCount == 1) {
            AnimationState animationState = this._animationStates.get(0);
            if (animationState._fadeState > 0 && animationState._subFadeState > 0) {
                this._armature._dragonBones.bufferObject(animationState);
                this._animationStates.clear();
                this._lastAnimationState = null;
            } else {
                AnimationData animationData = animationState.animationData;
                float cacheFrameRate = animationData.cacheFrameRate;
                if (this._animationDirty && cacheFrameRate > 0f) { // Update cachedFrameIndices.
                    this._animationDirty = false;
                    for (Bone bone : this._armature.getBones()) {
                        bone._cachedFrameIndices = animationData.getBoneCachedFrameIndices(bone.name);
                    }

                    for (Slot slot : this._armature.getSlots()) {
                        slot._cachedFrameIndices = animationData.getSlotCachedFrameIndices(slot.name);
                    }
                }

                if (this._timelineDirty) {
                    animationState.updateTimelines();
                }

                animationState.advanceTime(passedTime, cacheFrameRate);
            }
        } else if (animationStateCount > 1) {
            for (int i = 0, r = 0; i < animationStateCount; ++i) {
                AnimationState animationState = this._animationStates.get(i);
                if (animationState._fadeState > 0 && animationState._subFadeState > 0) {
                    r++;
                    this._armature._dragonBones.bufferObject(animationState);
                    this._animationDirty = true;
                    if (this._lastAnimationState == animationState) { // Update last animation state.
                        this._lastAnimationState = null;
                    }
                } else {
                    if (r > 0) {
                        this._animationStates.set(i - r, animationState);
                    }

                    if (this._timelineDirty) {
                        animationState.updateTimelines();
                    }

                    animationState.advanceTime(passedTime, 0f);
                }

                if (i == animationStateCount - 1 && r > 0) { // Modify animation states size.
                    this._animationStates.setLength(this._animationStates.size() - r);
                    if (this._lastAnimationState == null && this._animationStates.size() > 0) {
                        this._lastAnimationState = this._animationStates.get(this._animationStates.size() - 1);
                    }
                }
            }

            this._armature._cacheFrameIndex = -1;
        } else {
            this._armature._cacheFrameIndex = -1;
        }

        this._timelineDirty = false;
    }

    /**
     * 清除所有动画状态。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState
     */
    public void reset() {
        for (AnimationState animationState : this._animationStates) {
            animationState.returnToPool();
        }

        this._animationDirty = false;
        this._timelineDirty = false;
        this._animationConfig.clear();
        this._animationStates.clear();
        this._lastAnimationState = null;
    }

    public void stop() {
        stop(null);
    }

    /**
     * 暂停播放动画。
     *
     * @param animationName 动画状态的名称，如果未设置，则暂停所有动画状态。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationState
     */
    public void stop(String animationName) {
        if (animationName != null) {
            AnimationState animationState = this.getState(animationName);
            if (animationState != null) {
                animationState.stop();
            }
        } else {
            for (AnimationState animationState : this._animationStates) {
                animationState.stop();
            }
        }
    }

    /**
     * 通过动画配置来播放动画。
     *
     * @param animationConfig 动画配置。
     * @returns 对应的动画状态。
     * @version DragonBones 5.0
     * @beta
     * @language zh_CN
     * @see AnimationConfig
     * @see AnimationState
     */
    public AnimationState playConfig(AnimationConfig animationConfig) {
        String animationName = animationConfig.animation;
        if (!(this._animations.containsKey(animationName))) {
            Console.warn(
                    "Non-existent animation.\n" +
                            "DragonBones name: " + this._armature.armatureData.parent.name +
                            "Armature name: " + this._armature.getName() +
                            "Animation name: " + animationName
            );

            return null;
        }

        AnimationData animationData = this._animations.get(animationName);

        if (animationConfig.fadeOutMode == AnimationFadeOutMode.Single) {
            for (AnimationState animationState : this._animationStates) {
                if (animationState.animationData == animationData) {
                    return animationState;
                }
            }
        }

        if (this._animationStates.size() == 0) {
            animationConfig.fadeInTime = 0f;
        } else if (animationConfig.fadeInTime < 0f) {
            animationConfig.fadeInTime = animationData.fadeInTime;
        }

        if (animationConfig.fadeOutTime < 0f) {
            animationConfig.fadeOutTime = animationConfig.fadeInTime;
        }

        if (animationConfig.timeScale <= -100.0) {
            animationConfig.timeScale = 1f / animationData.scale;
        }

        if (animationData.frameCount > 1) {
            if (animationConfig.position < 0f) {
                animationConfig.position %= animationData.duration;
                animationConfig.position = animationData.duration - animationConfig.position;
            } else if (animationConfig.position == animationData.duration) {
                animationConfig.position -= 0.000001; // Play a little time before end.
            } else if (animationConfig.position > animationData.duration) {
                animationConfig.position %= animationData.duration;
            }

            if (animationConfig.duration > 0f && animationConfig.position + animationConfig.duration > animationData.duration) {
                animationConfig.duration = animationData.duration - animationConfig.position;
            }

            if (animationConfig.playTimes < 0) {
                animationConfig.playTimes = animationData.playTimes;
            }
        } else {
            animationConfig.playTimes = 1;
            animationConfig.position = 0f;
            if (animationConfig.duration > 0f) {
                animationConfig.duration = 0f;
            }
        }

        if (animationConfig.duration == 0f) {
            animationConfig.duration = -1f;
        }

        this._fadeOut(animationConfig);

        AnimationState animationState = BaseObject.borrowObject(AnimationState.class);
        animationState.init(this._armature, animationData, animationConfig);
        this._animationDirty = true;
        this._armature._cacheFrameIndex = -1;

        if (this._animationStates.size() > 0) {
            boolean added = false;
            for (int i = 0, l = this._animationStates.size(); i < l; ++i) {
                if (animationState.layer >= this._animationStates.get(i).layer) {
                } else {
                    added = true;
                    this._animationStates.splice(i + 1, 0, animationState);
                    break;
                }
            }

            if (!added) {
                this._animationStates.add(animationState);
            }
        } else {
            this._animationStates.add(animationState);
        }

        // Child armature play same name animation.
        for (Slot slot : this._armature.getSlots()) {
            Armature childArmature = slot.getChildArmature();
            if (
                    childArmature != null && childArmature.inheritAnimation &&
                            childArmature.getAnimation().hasAnimation(animationName) &&
                            childArmature.getAnimation().getState(animationName) == null
                    ) {
                childArmature.getAnimation().fadeIn(animationName); //
            }
        }

        if (animationConfig.fadeInTime <= 0f) { // Blend animation state, update armature.
            this._armature.advanceTime(0f);
        }

        this._lastAnimationState = animationState;

        return animationState;
    }

    public AnimationState play() {
        return play(null, -1);
    }

    public AnimationState play(String animationName) {
        return play(animationName, -1);
    }

    /**
     * 播放动画。
     *
     * @param animationName 动画数据名称，如果未设置，则播放默认动画，或将暂停状态切换为播放状态，或重新播放上一个正在播放的动画。
     * @param playTimes     播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
     * @returns 对应的动画状态。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationState
     */
    public AnimationState play(String animationName, int playTimes) {
        this._animationConfig.clear();
        this._animationConfig.resetToPose = true;
        this._animationConfig.playTimes = playTimes;
        this._animationConfig.fadeInTime = 0f;
        this._animationConfig.animation = animationName != null ? animationName : "";

        if (animationName != null && animationName.length() > 0) {
            this.playConfig(this._animationConfig);
        } else if (this._lastAnimationState == null) {
            AnimationData defaultAnimation = this._armature.armatureData.defaultAnimation;
            if (defaultAnimation != null) {
                this._animationConfig.animation = defaultAnimation.name;
                this.playConfig(this._animationConfig);
            }
        } else if (!this._lastAnimationState.isPlaying() && !this._lastAnimationState.isCompleted()) {
            this._lastAnimationState.play();
        } else {
            this._animationConfig.animation = this._lastAnimationState.name;
            this.playConfig(this._animationConfig);
        }

        return this._lastAnimationState;
    }

    @Nullable
    public AnimationState fadeIn(String animationName) {
        return fadeIn(animationName, -1f, -1, 0, null, AnimationFadeOutMode.SameLayerAndGroup);
    }

    /**
     * 淡入播放动画。
     *
     * @param animationName 动画数据名称。
     * @param playTimes     播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
     * @param fadeInTime    淡入时间。 [-1: 使用动画数据默认值, [0~N]: 淡入时间] (以秒为单位)
     * @param layer         混合图层，图层高会优先获取混合权重。
     * @param group         混合组，用于动画状态编组，方便控制淡出。
     * @param fadeOutMode   淡出模式。
     * @returns 对应的动画状态。
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationFadeOutMode
     * @see AnimationState
     */
    @Nullable
    public AnimationState fadeIn(
            String animationName, float fadeInTime, int playTimes,
            int layer, @Nullable String group, AnimationFadeOutMode fadeOutMode
    ) {
        this._animationConfig.clear();
        this._animationConfig.fadeOutMode = fadeOutMode;
        this._animationConfig.playTimes = playTimes;
        this._animationConfig.layer = layer;
        this._animationConfig.fadeInTime = fadeInTime;
        this._animationConfig.animation = animationName;
        this._animationConfig.group = group != null ? group : "";

        return this.playConfig(this._animationConfig);
    }

    @Nullable
    public AnimationState gotoAndPlayByTime(String animationName) {
        return gotoAndPlayByTime(animationName, 0f, -1);
    }

    /**
     * 从指定时间开始播放动画。
     *
     * @param animationName 动画数据的名称。
     * @param time          开始时间。 (以秒为单位)
     * @param playTimes     播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
     * @returns 对应的动画状态。
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState
     */
    @Nullable
    public AnimationState gotoAndPlayByTime(String animationName, float time, int playTimes) {
        this._animationConfig.clear();
        this._animationConfig.resetToPose = true;
        this._animationConfig.playTimes = playTimes;
        this._animationConfig.position = time;
        this._animationConfig.fadeInTime = 0f;
        this._animationConfig.animation = animationName;

        return this.playConfig(this._animationConfig);
    }

    @Nullable
    public AnimationState gotoAndPlayByFrame(String animationName) {
        return gotoAndPlayByFrame(animationName, 0, -1);
    }

    /**
     * 从指定帧开始播放动画。
     *
     * @param animationName 动画数据的名称。
     * @param frame         帧。
     * @param playTimes     播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
     * @returns 对应的动画状态。
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState
     */
    @Nullable
    public AnimationState gotoAndPlayByFrame(String animationName, int frame, int playTimes) {
        this._animationConfig.clear();
        this._animationConfig.resetToPose = true;
        this._animationConfig.playTimes = playTimes;
        this._animationConfig.fadeInTime = 0f;
        this._animationConfig.animation = animationName;

        AnimationData animationData = this._animations.get(animationName);
        if (animationData != null) {
            this._animationConfig.position = animationData.duration * frame / animationData.frameCount;
        }

        return this.playConfig(this._animationConfig);
    }

    @Nullable
    public AnimationState gotoAndPlayByProgress(String animationName) {
        return gotoAndPlayByProgress(animationName, 0f, -1);
    }

    /**
     * 从指定进度开始播放动画。
     *
     * @param animationName 动画数据的名称。
     * @param progress      进度。 [0~1]
     * @param playTimes     播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
     * @returns 对应的动画状态。
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState
     */
    @Nullable
    public AnimationState gotoAndPlayByProgress(String animationName, float progress, int playTimes) {
        this._animationConfig.clear();
        this._animationConfig.resetToPose = true;
        this._animationConfig.playTimes = playTimes;
        this._animationConfig.fadeInTime = 0f;
        this._animationConfig.animation = animationName;

        AnimationData animationData = this._animations.get(animationName);
        if (animationData != null) {
            this._animationConfig.position = animationData.duration * (progress > 0f ? progress : 0f);
        }

        return this.playConfig(this._animationConfig);
    }

    public AnimationState gotoAndStopByTime(String animationName) {
        return gotoAndStopByTime(animationName, 0f);
    }

    /**
     * 将动画停止到指定的时间。
     *
     * @param animationName 动画数据的名称。
     * @param time          时间。 (以秒为单位)
     * @returns 对应的动画状态。
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState
     */
    @Nullable
    public AnimationState gotoAndStopByTime(String animationName, float time) {
        AnimationState animationState = this.gotoAndPlayByTime(animationName, time, 1);
        if (animationState != null) {
            animationState.stop();
        }

        return animationState;
    }

    public @Nullable
    AnimationState gotoAndStopByFrame(String animationName) {
        return gotoAndStopByFrame(animationName, 0);
    }

    /**
     * 将动画停止到指定的帧。
     *
     * @param animationName 动画数据的名称。
     * @param frame         帧。
     * @returns 对应的动画状态。
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState
     */
    public @Nullable
    AnimationState gotoAndStopByFrame(String animationName, int frame) {
        AnimationState animationState = this.gotoAndPlayByFrame(animationName, frame, 1);
        if (animationState != null) {
            animationState.stop();
        }

        return animationState;
    }

    @Nullable
    public AnimationState gotoAndStopByProgress(String animationName) {
        return gotoAndStopByProgress(animationName, 0f);
    }

    /**
     * 将动画停止到指定的进度。
     *
     * @param animationName 动画数据的名称。
     * @param progress      进度。 [0 ~ 1]
     * @returns 对应的动画状态。
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState
     */
    @Nullable
    public AnimationState gotoAndStopByProgress(String animationName, float progress) {
        AnimationState animationState = this.gotoAndPlayByProgress(animationName, progress, 1);
        if (animationState != null) {
            animationState.stop();
        }

        return animationState;
    }

    /**
     * 获取动画状态。
     *
     * @param animationName 动画状态的名称。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationState
     */
    public @Nullable
    AnimationState getState(String animationName) {
        int i = this._animationStates.size();
        while (i-- != 0) {
            AnimationState animationState = this._animationStates.get(i);
            if (Objects.equals(animationState.name, animationName)) {
                return animationState;
            }
        }

        return null;
    }

    /**
     * 是否包含动画数据。
     *
     * @param animationName 动画数据的名称。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationData
     */
    public boolean hasAnimation(String animationName) {
        return this._animations.containsKey(animationName);
    }

    /**
     * 获取所有的动画状态。
     *
     * @version DragonBones 5.1
     * @language zh_CN
     * @see AnimationState
     */
    public Array<AnimationState> getStates() {
        return this._animationStates;
    }

    /**
     * 动画是否处于播放状态。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public boolean isPlaying() {
        for (AnimationState animationState : this._animationStates) {
            if (animationState.isPlaying()) {
                return true;
            }
        }

        return false;
    }

    /**
     * 所有动画状态是否均已播放完毕。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationState
     */
    public boolean isCompleted() {
        for (AnimationState animationState : this._animationStates) {
            if (!animationState.isCompleted()) {
                return false;
            }
        }

        return this._animationStates.size() > 0;
    }

    /**
     * 上一个正在播放的动画状态名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see #getLastAnimationState()
     */
    public String getLastAnimationName() {
        return this._lastAnimationState != null ? this._lastAnimationState.name : "";
    }

    /**
     * 所有动画数据名称。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see #getAnimations()
     */
    public Array<String> getAnimationNames() {
        return this._animationNames;
    }

    /**
     * 所有动画数据。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationData
     */
    public Map<String, AnimationData> getAnimations() {
        return this._animations;
    }

    public void setAnimations(Map<String, AnimationData> value) {
        if (this._animations == value) {
            return;
        }

        this._animationNames.clear();
        this._animations.clear();

        for (String k : value.keySet()) {
            this._animations.put(k, value.get(k));
            this._animationNames.add(k);
        }
    }

    /**
     * 一个可以快速使用的动画配置实例。
     *
     * @version DragonBones 5.0
     * @language zh_CN
     * @see AnimationConfig
     */
    public AnimationConfig getAnimationConfig() {
        this._animationConfig.clear();
        return this._animationConfig;
    }

    /**
     * 上一个正在播放的动画状态。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationState
     */
    public @Nullable
    AnimationState getLastAnimationState() {
        return this._lastAnimationState;
    }

    public AnimationState gotoAndPlay(String animationName) {
        return gotoAndPlay(animationName, -1, -1, -1, 0, null, AnimationFadeOutMode.SameLayerAndGroup, true, true);
    }

    /**
     * @see #play()
     * @see #fadeIn(String)
     * @see #gotoAndPlayByTime(String, float, int)
     * @see #gotoAndPlayByFrame(String, int, int)
     * @see #gotoAndPlayByProgress(String, float, int)
     * @deprecated 已废弃，请参考 @see
     */
    @Nullable
    public AnimationState gotoAndPlay(
            String animationName, float fadeInTime, float duration, int playTimes,
            int layer, @Nullable String group, AnimationFadeOutMode fadeOutMode,
            boolean pauseFadeOut, boolean pauseFadeIn
    ) {
        //pauseFadeOut;
        //pauseFadeIn;
        this._animationConfig.clear();
        this._animationConfig.resetToPose = true;
        this._animationConfig.fadeOutMode = fadeOutMode;
        this._animationConfig.playTimes = playTimes;
        this._animationConfig.layer = layer;
        this._animationConfig.fadeInTime = fadeInTime;
        this._animationConfig.animation = animationName;
        this._animationConfig.group = group != null ? group : "";

        AnimationData animationData = this._animations.get(animationName);
        if (animationData != null && duration > 0f) {
            this._animationConfig.timeScale = animationData.duration / duration;
        }

        return this.playConfig(this._animationConfig);
    }

    public @Nullable
    AnimationState gotoAndStop(String animationName) {
        return gotoAndStop(animationName, 0f);
    }

    /**
     * @see #gotoAndStopByTime(String, float)
     * @see #gotoAndStopByFrame(String)
     * @see #gotoAndStopByProgress(String, float)
     * @deprecated 已废弃，请参考 @see
     */
    public @Nullable
    AnimationState gotoAndStop(String animationName, float time) {
        return this.gotoAndStopByTime(animationName, time);
    }

    /**
     * @see #getAnimationNames()
     * @see #getAnimations()
     * @deprecated 已废弃，请参考 @see
     */
    public Array<String> getAnimationList() {
        return this._animationNames;
    }

    /**
     * @see #getAnimationNames()
     * @see #getAnimations()
     * @deprecated 已废弃，请参考 @see
     */
    public Array<AnimationData> getAnimationDataList() {
        Array<AnimationData> list = new Array<>();
        for (int i = 0, l = this._animationNames.size(); i < l; ++i) {
            list.push(this._animations.get(this._animationNames.get(i)));
        }

        return list;
    }
}
