package com.dragonbones.animation;

import com.dragonbones.geom.Transform;
import com.dragonbones.util.FloatArray;

/**
 * @internal
 * @private
 */
public class BoneAllTimelineState extends BoneTimelineState {
    protected void _onArriveAtFrame() {
        super._onArriveAtFrame();

        if (this._timelineData != null) {
            FloatArray frameFloatArray = this._dragonBonesData.frameFloatArray;
            Transform current = this.bonePose.current;
            Transform delta = this.bonePose.delta;
            int valueOffset = this._animationData.frameFloatOffset + this._frameValueOffset + this._frameIndex * 6; // ...(timeline value offset)|xxxxxx|xxxxxx|(Value offset)xxxxx|(Next offset)xxxxx|xxxxxx|xxxxxx|...

            current.x = frameFloatArray.get(valueOffset++);
            current.y = frameFloatArray.get(valueOffset++);
            current.rotation = frameFloatArray.get(valueOffset++);
            current.skew = frameFloatArray.get(valueOffset++);
            current.scaleX = frameFloatArray.get(valueOffset++);
            current.scaleY = frameFloatArray.get(valueOffset++);

            if (this._tweenState == TweenState.Always) {
                if (this._frameIndex == this._frameCount - 1) {
                    valueOffset = this._animationData.frameFloatOffset + this._frameValueOffset;
                }

                delta.x = frameFloatArray.get(valueOffset++) - current.x;
                delta.y = frameFloatArray.get(valueOffset++) - current.y;
                delta.rotation = frameFloatArray.get(valueOffset++) - current.rotation;
                delta.skew = frameFloatArray.get(valueOffset++) - current.skew;
                delta.scaleX = frameFloatArray.get(valueOffset++) - current.scaleX;
                delta.scaleY = frameFloatArray.get(valueOffset++) - current.scaleY;
            }
            // else {
            //     delta.x = 0f;
            //     delta.y = 0f;
            //     delta.rotation = 0f;
            //     delta.skew = 0f;
            //     delta.scaleX = 0f;
            //     delta.scaleY = 0f;
            // }
        } else { // Pose.
            Transform current = this.bonePose.current;
            current.x = 0f;
            current.y = 0f;
            current.rotation = 0f;
            current.skew = 0f;
            current.scaleX = 1f;
            current.scaleY = 1f;
        }
    }

    protected void _onUpdateFrame() {
        super._onUpdateFrame();

        Transform current = this.bonePose.current;
        Transform delta = this.bonePose.delta;
        Transform result = this.bonePose.result;

        this.bone._transformDirty = true;
        if (this._tweenState != TweenState.Always) {
            this._tweenState = TweenState.None;
        }

        float scale = this._armature.armatureData.scale;
        result.x = (current.x + delta.x * this._tweenProgress) * scale;
        result.y = (current.y + delta.y * this._tweenProgress) * scale;
        result.rotation = current.rotation + delta.rotation * this._tweenProgress;
        result.skew = current.skew + delta.skew * this._tweenProgress;
        result.scaleX = current.scaleX + delta.scaleX * this._tweenProgress;
        result.scaleY = current.scaleY + delta.scaleY * this._tweenProgress;
    }

    public void fadeOut() {
        Transform result = this.bonePose.result;
        result.rotation = Transform.normalizeRadian(result.rotation);
        result.skew = Transform.normalizeRadian(result.skew);
    }
}
