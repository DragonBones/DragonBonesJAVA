package com.dragonbones.animation;

import com.dragonbones.armature.Armature;
import com.dragonbones.core.BaseObject;
import com.dragonbones.core.BinaryOffset;
import com.dragonbones.model.AnimationData;
import com.dragonbones.model.DragonBonesData;
import com.dragonbones.model.TimelineData;
import com.dragonbones.util.CharArray;
import com.dragonbones.util.FloatArray;
import com.dragonbones.util.IntArray;
import com.dragonbones.util.ShortArray;
import org.jetbrains.annotations.Nullable;

/**
 * @internal
 * @private
 */
public abstract class TimelineState extends BaseObject {
    public int playState; // -1: start, 0: play, 1: complete;
    public int currentPlayTimes;
    public float currentTime;

    protected TweenState _tweenState;
    protected float _frameRate;
    protected int _frameValueOffset;
    protected int _frameCount;
    protected int _frameOffset;
    protected int _frameIndex;
    protected float _frameRateR;
    protected float _position;
    protected float _duration;
    protected float _timeScale;
    protected float _timeOffset;
    protected DragonBonesData _dragonBonesData;
    protected AnimationData _animationData;
    @Nullable
    protected TimelineData _timelineData;
    protected Armature _armature;
    protected AnimationState _animationState;
    protected TimelineState _actionTimeline;
    protected ShortArray _frameArray;
    protected ShortArray _frameIntArray;
    protected FloatArray _frameFloatArray;
    protected CharArray _timelineArray;
    protected IntArray _frameIndices;

    protected void _onClear() {
        this.playState = -1;
        this.currentPlayTimes = -1;
        this.currentTime = -1f;

        this._tweenState = TweenState.None;
        this._frameRate = 0;
        this._frameValueOffset = 0;
        this._frameCount = 0;
        this._frameOffset = 0;
        this._frameIndex = -1;
        this._frameRateR = 0f;
        this._position = 0f;
        this._duration = 0f;
        this._timeScale = 1f;
        this._timeOffset = 0f;
        this._dragonBonesData = null; //
        this._animationData = null; //
        this._timelineData = null; //
        this._armature = null; //
        this._animationState = null; //
        this._actionTimeline = null; //
        this._frameArray = null; //
        this._frameIntArray = null; //
        this._frameFloatArray = null; //
        this._timelineArray = null; //
        this._frameIndices = null; //
    }

    protected abstract void _onArriveAtFrame();

    protected abstract void _onUpdateFrame();

    protected boolean _setCurrentTime(float passedTime) {
        float prevState = this.playState;
        float prevPlayTimes = this.currentPlayTimes;
        float prevTime = this.currentTime;

        if (this._actionTimeline != null && this._frameCount <= 1) { // No frame or only one frame.
            this.playState = this._actionTimeline.playState >= 0 ? 1 : -1;
            this.currentPlayTimes = 1;
            this.currentTime = this._actionTimeline.currentTime;
        } else if (this._actionTimeline == null || this._timeScale != 1f || this._timeOffset != 0f) { // Action timeline or has scale and offset.
            int playTimes = this._animationState.playTimes;
            float totalTime = playTimes * this._duration;

            passedTime *= this._timeScale;
            if (this._timeOffset != 0f) {
                passedTime += this._timeOffset * this._animationData.duration;
            }

            if (playTimes > 0 && (passedTime >= totalTime || passedTime <= -totalTime)) {
                if (this.playState <= 0 && this._animationState._playheadState == 3) {
                    this.playState = 1;
                }

                this.currentPlayTimes = playTimes;
                if (passedTime < 0f) {
                    this.currentTime = 0f;
                } else {
                    this.currentTime = this._duration;
                }
            } else {
                if (this.playState != 0 && this._animationState._playheadState == 3) {
                    this.playState = 0;
                }

                if (passedTime < 0f) {
                    passedTime = -passedTime;
                    this.currentPlayTimes = (int) Math.floor(passedTime / this._duration);
                    this.currentTime = this._duration - (passedTime % this._duration);
                } else {
                    this.currentPlayTimes = (int) Math.floor(passedTime / this._duration);
                    this.currentTime = passedTime % this._duration;
                }
            }

            this.currentTime += this._position;
        } else { // Multi frames.
            this.playState = this._actionTimeline.playState;
            this.currentPlayTimes = this._actionTimeline.currentPlayTimes;
            this.currentTime = this._actionTimeline.currentTime;
        }

        if (this.currentPlayTimes == prevPlayTimes && this.currentTime == prevTime) {
            return false;
        }

        // Clear frame flag when timeline start or loopComplete.
        if (
                (prevState < 0 && this.playState != prevState) ||
                        (this.playState <= 0 && this.currentPlayTimes != prevPlayTimes)
                ) {
            this._frameIndex = -1;
        }

        return true;
    }

    public void init(Armature armature, AnimationState animationState, @Nullable TimelineData timelineData) {
        this._armature = armature;
        this._animationState = animationState;
        this._timelineData = timelineData;
        this._actionTimeline = this._animationState._actionTimeline;

        if (this == this._actionTimeline) {
            this._actionTimeline = null; //
        }

        this._frameRate = this._armature.armatureData.frameRate;
        this._frameRateR = 1f / this._frameRate;
        this._position = this._animationState._position;
        this._duration = this._animationState._duration;
        this._dragonBonesData = this._armature.armatureData.parent;
        this._animationData = this._animationState.animationData;

        if (this._timelineData != null) {
            this._frameIntArray = this._dragonBonesData.frameIntArray;
            this._frameFloatArray = this._dragonBonesData.frameFloatArray;
            this._frameArray = this._dragonBonesData.frameArray;
            this._timelineArray = this._dragonBonesData.timelineArray;
            this._frameIndices = this._dragonBonesData.frameIndices;

            this._frameCount = this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineKeyFrameCount.v);
            this._frameValueOffset = this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineFrameValueOffset.v);
            this._timeScale = 100f / this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineScale.v);
            this._timeOffset = this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineOffset.v) * 0.01f;
        }
    }

    public void fadeOut() {
    }

    public void update(float passedTime) {
        if (this.playState <= 0 && this._setCurrentTime(passedTime)) {
            if (this._frameCount > 1) {
                int timelineFrameIndex = (int) Math.floor(this.currentTime * this._frameRate); // uint
                int frameIndex = this._frameIndices.get(this._timelineData.frameIndicesOffset + timelineFrameIndex);
                if (this._frameIndex != frameIndex) {
                    this._frameIndex = frameIndex;
                    this._frameOffset = this._animationData.frameOffset + this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineFrameOffset.v + this._frameIndex);

                    this._onArriveAtFrame();
                }
            } else if (this._frameIndex < 0) {
                this._frameIndex = 0;
                if (this._timelineData != null) { // May be pose timeline.
                    this._frameOffset = this._animationData.frameOffset + this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineFrameOffset.v);
                }

                this._onArriveAtFrame();
            }

            if (this._tweenState != TweenState.None) {
                this._onUpdateFrame();
            }
        }
    }
}


