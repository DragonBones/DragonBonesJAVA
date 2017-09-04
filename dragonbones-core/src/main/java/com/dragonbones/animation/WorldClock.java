package com.dragonbones.animation;

import com.dragonbones.armature.Armature;
import com.dragonbones.util.Array;
import org.jetbrains.annotations.Nullable;

/**
 * WorldClock 提供时钟支持，为每个加入到时钟的 IAnimatable 对象更新时间。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see IAnimatable
 * @see Armature
 */
public class WorldClock implements IAnimatable {
    /**
     * 一个可以直接使用的全局 WorldClock 实例.
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public static final WorldClock clock = new WorldClock();
    /**
     * 当前时间。 (以秒为单位)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float time = 0f;
    /**
     * 时间流逝速度，用于控制动画变速播放。 [0: 停止播放, (0~1): 慢速播放, 1: 正常播放, (1~N): 快速播放]
     *
     * @default 1f
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float timeScale = 1f;
    private final Array<IAnimatable> _animatebles = new Array<>();
    @Nullable
    private WorldClock _clock = null;

    /**
     * 创建一个新的 WorldClock 实例。
     * 通常并不需要单独创建 WorldClock 实例，可以直接使用 WorldClock.clock 静态实例。
     * (创建更多独立的 WorldClock 实例可以更灵活的为需要更新的 IAnimateble 实例分组，用于控制不同组不同的播放速度)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public WorldClock() {
        this(-1f);
    }

    /**
     * 创建一个新的 WorldClock 实例。
     * 通常并不需要单独创建 WorldClock 实例，可以直接使用 WorldClock.clock 静态实例。
     * (创建更多独立的 WorldClock 实例可以更灵活的为需要更新的 IAnimateble 实例分组，用于控制不同组不同的播放速度)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public WorldClock(float time) {
        if (time < 0f) {
            this.time = System.currentTimeMillis() * 0.001f;
        } else {
            this.time = time;
        }
    }

    /**
     * 为所有的 IAnimatable 实例更新时间。
     *
     * @param passedTime 前进的时间。 (以秒为单位，当设置为 -1 时将自动计算当前帧与上一帧的时间差)
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void advanceTime(float passedTime) {
        if (passedTime != passedTime) { // isNaN
            passedTime = 0f;
        }

        if (passedTime < 0f) {
            passedTime = System.currentTimeMillis() * 0.001f - this.time;
        }

        if (this.timeScale != 1f) {
            passedTime *= this.timeScale;
        }

        if (passedTime < 0f) {
            this.time -= passedTime;
        } else {
            this.time += passedTime;
        }

        if (passedTime == 0f) {
            return;
        }

        int i = 0, r = 0, l = this._animatebles.size();
        for (; i < l; ++i) {
            IAnimatable animatable = this._animatebles.get(i);
            if (animatable != null) {
                if (r > 0) {
                    this._animatebles.set(i - r, animatable);
                    this._animatebles.set(i, null);
                }

                animatable.advanceTime(passedTime);
            } else {
                r++;
            }
        }

        if (r > 0) {
            l = this._animatebles.size();
            for (; i < l; ++i) {
                IAnimatable animateble = this._animatebles.get(i);
                if (animateble != null) {
                    this._animatebles.set(i - r, animateble);
                } else {
                    r++;
                }
            }

            this._animatebles.setLength(this._animatebles.size() - r);
        }
    }

    /**
     * 是否包含 IAnimatable 实例
     *
     * @param value IAnimatable 实例。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public boolean contains(IAnimatable value) {
        return this._animatebles.indexOf(value) >= 0;
    }

    /**
     * 添加 IAnimatable 实例。
     *
     * @param value IAnimatable 实例。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void add(IAnimatable value) {
        if (this._animatebles.indexOf(value) < 0) {
            this._animatebles.add(value);
            value.setClock(this);
        }
    }

    /**
     * 移除 IAnimatable 实例。
     *
     * @param value IAnimatable 实例。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void remove(IAnimatable value) {
        int index = this._animatebles.indexOf(value);
        if (index >= 0) {
            this._animatebles.set(index, null);
            value.setClock(null);
        }
    }

    /**
     * 清除所有的 IAnimatable 实例。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void clear() {
        for (IAnimatable animatable : this._animatebles) {
            if (animatable != null) {
                animatable.setClock(null);
            }
        }
    }

    /**
     * @inheritDoc
     */
    public WorldClock getClock() {
        return this._clock;
    }

    public void setClock(WorldClock value) {
        if (this._clock == value) {
            return;
        }

        if (this._clock != null) {
            this._clock.remove(this);
        }

        this._clock = value;

        if (this._clock != null) {
            this._clock.add(this);
        }
    }
}
