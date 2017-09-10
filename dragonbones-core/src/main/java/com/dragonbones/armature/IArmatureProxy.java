package com.dragonbones.armature;

import com.dragonbones.animation.Animation;
import com.dragonbones.event.IEventDispatcher;

/**
 * @version DragonBones 5.0
 * @language zh_CN
 * 骨架代理接口。
 */
public interface IArmatureProxy extends IEventDispatcher {
    /**
     * @private
     */
    void init(Armature armature);

    /**
     * @private
     */
    void clear();

    /**
     * @language zh_CN
     * 释放代理和骨架。 (骨架会回收到对象池)
     * @version DragonBones 4.5
     */
    void dispose(boolean disposeProxy);

    /**
     * @private
     */
    void debugUpdate(boolean isEnabled);

    /**
     * @language zh_CN
     * 获取骨架。
     * @version DragonBones 4.5
     * @see Armature
     */
    Armature getArmature();

    /**
     * @language zh_CN
     * 获取动画控制器。
     * @version DragonBones 4.5
     * @see Animation
     */
    Animation getAnimation();
}