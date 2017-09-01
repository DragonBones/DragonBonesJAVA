package com.dragonbones.animation;

import com.dragonbones.core.BinaryOffset;
import com.dragonbones.core.TweenType;
import com.dragonbones.util.ShortArray;

/**
 * @internal
 * @private
 */
public abstract class TweenTimelineState extends TimelineState {
    private static float _getEasingValue(TweenType tweenType, float progress, float easing) {
        float value = progress;

        switch (tweenType) {
            case QuadIn:
                value = (float) Math.pow(progress, 2f);
                break;

            case QuadOut:
                value = (float) (1f - Math.pow(1f - progress, 2f));
                break;

            case QuadInOut:
                value = (float) (0.5 * (1f - Math.cos(progress * Math.PI)));
                break;
        }

        return (value - progress) * easing + progress;
    }

    private static float _getEasingCurveValue(float progress, ShortArray samples, float count, int offset) {
        if (progress <= 0f) {
            return 0f;
        } else if (progress >= 1f) {
            return 1f;
        }

        float segmentCount = count + 1; // + 2 - 1
        int valueIndex = (int) Math.floor(progress * segmentCount);
        float fromValue = valueIndex == 0 ? 0f : samples.get(offset + valueIndex - 1);
        float toValue = (valueIndex == segmentCount - 1) ? 10000f : samples.get(offset + valueIndex);

        return (fromValue + (toValue - fromValue) * (progress * segmentCount - valueIndex)) * 0.0001f;
    }

    protected TweenType _tweenType;
    protected float _curveCount;
    protected float _framePosition;
    protected float _frameDurationR;
    protected float _tweenProgress;
    protected float _tweenEasing;

    protected void _onClear() {
        super._onClear();

        this._tweenType = TweenType.None;
        this._curveCount = 0;
        this._framePosition = 0f;
        this._frameDurationR = 0f;
        this._tweenProgress = 0f;
        this._tweenEasing = 0f;
    }

    protected void _onArriveAtFrame() {
        if (
                this._frameCount > 1 &&
                        (
                                this._frameIndex != this._frameCount - 1 ||
                                        this._animationState.playTimes == 0 ||
                                        this._animationState.getCurrentPlayTimes() < this._animationState.playTimes - 1
                        )
                ) {
            this._tweenType = TweenType.values[this._frameArray.get(this._frameOffset + BinaryOffset.FrameTweenType.v)]; // TODO recode ture tween type.
            this._tweenState = this._tweenType == TweenType.None ? TweenState.Once : TweenState.Always;
            if (this._tweenType == TweenType.Curve) {
                this._curveCount = this._frameArray.get(this._frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount.v);
            } else if (this._tweenType != TweenType.None && this._tweenType != TweenType.Line) {
                this._tweenEasing = this._frameArray.get(this._frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount.v) * 0.01f;
            }

            this._framePosition = this._frameArray.get(this._frameOffset) * this._frameRateR;
            if (this._frameIndex == this._frameCount - 1) {
                this._frameDurationR = 1f / (this._animationData.duration - this._framePosition);
            } else {
                int nextFrameOffset = this._animationData.frameOffset + (int) this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineFrameOffset.v + this._frameIndex + 1);
                this._frameDurationR = 1f / (this._frameArray.get(nextFrameOffset) * this._frameRateR - this._framePosition);
            }
        } else {
            this._tweenState = TweenState.Once;
        }
    }

    protected void _onUpdateFrame() {
        if (this._tweenState == TweenState.Always) {
            this._tweenProgress = (this.currentTime - this._framePosition) * this._frameDurationR;
            if (this._tweenType == TweenType.Curve) {
                this._tweenProgress = TweenTimelineState._getEasingCurveValue(this._tweenProgress, this._frameArray, this._curveCount, this._frameOffset + BinaryOffset.FrameCurveSamples.v);
            } else if (this._tweenType != TweenType.Line) {
                this._tweenProgress = TweenTimelineState._getEasingValue(this._tweenType, this._tweenProgress, this._tweenEasing);
            }
        } else {
            this._tweenProgress = 0f;
        }
    }
}
