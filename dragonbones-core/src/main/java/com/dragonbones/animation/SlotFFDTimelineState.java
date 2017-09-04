package com.dragonbones.animation;

import com.dragonbones.armature.Armature;
import com.dragonbones.core.BinaryOffset;
import com.dragonbones.model.TimelineData;
import com.dragonbones.util.FloatArray;
import com.dragonbones.util.ShortArray;
import org.jetbrains.annotations.Nullable;

/**
 * @internal
 * @private
 */
public class SlotFFDTimelineState extends SlotTimelineState {
    public int meshOffset;

    private boolean _dirty;
    private int _frameFloatOffset;
    private int _valueCount;
    private float _ffdCount;
    private int _valueOffset;
    private final FloatArray _current = new FloatArray();
    private final FloatArray _delta = new FloatArray();
    private final FloatArray _result = new FloatArray();

    protected void _onClear() {
        super._onClear();

        this.meshOffset = 0;

        this._dirty = false;
        this._frameFloatOffset = 0;
        this._valueCount = 0;
        this._ffdCount = 0;
        this._valueOffset = 0;
        this._current.clear();
        this._delta.clear();
        this._result.clear();
    }

    protected void _onArriveAtFrame() {
        super._onArriveAtFrame();

        if (this._timelineData != null) {
            boolean isTween = this._tweenState == TweenState.Always;
            FloatArray frameFloatArray = this._dragonBonesData.frameFloatArray;
            int valueOffset = this._animationData.frameFloatOffset + this._frameValueOffset + this._frameIndex * this._valueCount;

            if (isTween) {
                int nextValueOffset = valueOffset + this._valueCount;
                if (this._frameIndex == this._frameCount - 1) {
                    nextValueOffset = this._animationData.frameFloatOffset + this._frameValueOffset;
                }

                for (int i = 0; i < this._valueCount; ++i) {
                    float v = frameFloatArray.get(valueOffset + i);
                    this._current.set(i, v);
                    this._delta.set(i, frameFloatArray.get(nextValueOffset + i) - v);
                }
            } else {
                for (int i = 0; i < this._valueCount; ++i) {
                    this._current.set(i, frameFloatArray.get(valueOffset + i));
                }
            }
        } else {
            for (int i = 0; i < this._valueCount; ++i) {
                this._current.set(i, 0f);
            }
        }
    }

    protected void _onUpdateFrame() {
        super._onUpdateFrame();

        this._dirty = true;
        if (this._tweenState != TweenState.Always) {
            this._tweenState = TweenState.None;
        }

        for (int i = 0; i < this._valueCount; ++i) {
            this._result.set(i, this._current.get(i) + this._delta.get(i) * this._tweenProgress);
        }
    }

    public void init(Armature armature, AnimationState animationState, @Nullable TimelineData timelineData) {
        super.init(armature, animationState, timelineData);

        if (this._timelineData != null) {
            ShortArray frameIntArray = this._dragonBonesData.frameIntArray;
            int frameIntOffset = this._animationData.frameIntOffset + this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineFrameValueCount.v);
            this.meshOffset = frameIntArray.get(frameIntOffset + BinaryOffset.FFDTimelineMeshOffset.v);
            this._ffdCount = frameIntArray.get(frameIntOffset + BinaryOffset.FFDTimelineFFDCount.v);
            this._valueCount = frameIntArray.get(frameIntOffset + BinaryOffset.FFDTimelineValueCount.v);
            this._valueOffset = frameIntArray.get(frameIntOffset + BinaryOffset.FFDTimelineValueOffset.v);
            this._frameFloatOffset = frameIntArray.get(frameIntOffset + BinaryOffset.FFDTimelineFloatOffset.v) + this._animationData.frameFloatOffset;
        } else {
            this._valueCount = 0;
        }

        this._current.setLength(this._valueCount);
        this._delta.setLength(this._valueCount);
        this._result.setLength(this._valueCount);

        for (int i = 0; i < this._valueCount; ++i) {
            this._delta.set(i, 0f);
        }
    }

    public void fadeOut() {
        this._tweenState = TweenState.None;
        this._dirty = false;
    }

    public void update(float passedTime) {
        if (this.slot._meshData == null || (this._timelineData != null && this.slot._meshData.offset != this.meshOffset)) {
            return;
        }

        super.update(passedTime);

        // Fade animation.
        if (this._tweenState != TweenState.None || this._dirty) {
            FloatArray result = this.slot._ffdVertices;
            if (this._timelineData != null) {
                FloatArray frameFloatArray = this._dragonBonesData.frameFloatArray;
                if (this._animationState._fadeState != 0 || this._animationState._subFadeState != 0) {
                    float fadeProgress = (float) Math.pow(this._animationState._fadeProgress, 2);

                    for (int i = 0; i < this._ffdCount; ++i) {
                        if (i < this._valueOffset) {
                            result.set(i, result.get(i) + (frameFloatArray.get(this._frameFloatOffset + i) - result.get(i)) * fadeProgress);
                        } else if (i < this._valueOffset + this._valueCount) {
                            result.set(i, result.get(i) + (this._result.get(i - this._valueOffset) - result.get(i)) * fadeProgress);
                        } else {
                            result.set(i, result.get(i) + (frameFloatArray.get(this._frameFloatOffset + i - this._valueCount) - result.get(i)) * fadeProgress);
                        }
                    }

                    this.slot._meshDirty = true;
                } else if (this._dirty) {
                    this._dirty = false;

                    for (int i = 0; i < this._ffdCount; ++i) {
                        if (i < this._valueOffset) {
                            result.set(i, frameFloatArray.get(this._frameFloatOffset + i));
                        } else if (i < this._valueOffset + this._valueCount) {
                            result.set(i, this._result.get(i - this._valueOffset));
                        } else {
                            result.set(i, frameFloatArray.get(this._frameFloatOffset + i - this._valueCount));
                        }
                    }

                    this.slot._meshDirty = true;
                }
            } else {
                this._ffdCount = result.size(); //
                if (this._animationState._fadeState != 0 || this._animationState._subFadeState != 0) {
                    float fadeProgress = (float) Math.pow(this._animationState._fadeProgress, 2);
                    for (int i = 0; i < this._ffdCount; ++i) {
                        result.set(i, result.get(i) + (0f - result.get(i)) * fadeProgress);
                    }

                    this.slot._meshDirty = true;
                } else if (this._dirty) {
                    this._dirty = false;

                    for (int i = 0; i < this._ffdCount; ++i) {
                        result.set(i, 0f);
                    }

                    this.slot._meshDirty = true;
                }
            }
        }
    }
}
