package com.dragonbones.event;

import com.dragonbones.animation.AnimationState;
import com.dragonbones.armature.Armature;
import com.dragonbones.armature.Bone;
import com.dragonbones.armature.Slot;
import com.dragonbones.core.BaseObject;
import com.dragonbones.model.UserData;
import org.jetbrains.annotations.Nullable;

/**
 * 事件数据。
 *
 * @version DragonBones 4.5
 * @language zh_CN
 */
public class EventObject extends BaseObject {
    /**
     * 动画开始。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType START = EventStringType.start;
    /**
     * 动画循环播放一次完成。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType LOOP_COMPLETE = EventStringType.loopComplete;
    /**
     * 动画播放完成。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType COMPLETE = EventStringType.complete;
    /**
     * 动画淡入开始。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType FADE_IN = EventStringType.fadeIn;
    /**
     * 动画淡入完成。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType FADE_IN_COMPLETE = EventStringType.fadeInComplete;
    /**
     * 动画淡出开始。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType FADE_OUT = EventStringType.fadeOut;
    /**
     * 动画淡出完成。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType FADE_OUT_COMPLETE = EventStringType.fadeOutComplete;
    /**
     * 动画帧事件。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType FRAME_EVENT = EventStringType.frameEvent;
    /**
     * 动画声音事件。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static final EventStringType SOUND_EVENT = EventStringType.soundEvent;
    /**
     * @private
     */
    public float time;
    /**
     * 事件类型。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public EventStringType type;
    /**
     * 事件名称。 (帧标签的名称或声音的名称)
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public String name;
    /**
     * 发出事件的骨架。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public Armature armature;
    /**
     * 发出事件的骨骼。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    @Nullable
    public Bone bone;
    /**
     * 发出事件的插槽。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    @Nullable
    public Slot slot;
    /**
     * 发出事件的动画状态。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public AnimationState animationState;
    /**
     * 自定义数据
     *
     * @version DragonBones 5.0
     * @language zh_CN
     * @see UserData
     */
    @Nullable
    public UserData data;

    /**
     * @private
     */
    protected void _onClear() {
        this.time = 0f;
        this.type = EventStringType.start;
        this.name = "";
        this.armature = null;
        this.bone = null;
        this.slot = null;
        this.animationState = null;
        this.data = null;
    }
}
