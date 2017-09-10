package com.dragonbones.event;

import java.util.function.Consumer;

/**
 * 事件接口。
 *
 * @version DragonBones 4.5
 * @language zh_CN
 */
public interface IEventDispatcher {
    /**
     * @private
     */
    void _dispatchEvent(EventStringType type, EventObject eventObject);

    /**
     * 是否包含指定类型的事件。
     *
     * @param type 事件类型。
     * @version DragonBones 4.5
     * @language zh_CN
     */
    boolean hasEvent(EventStringType type);

    /**
     * 添加事件。
     *
     * @param type     事件类型。
     * @param listener 事件回调。
     * @version DragonBones 4.5
     * @language zh_CN
     */
    void addEvent(EventStringType type, Consumer<Object> listener, Object target);

    /**
     * 移除事件。
     *
     * @param type     事件类型。
     * @param listener 事件回调。
     * @version DragonBones 4.5
     * @language zh_CN
     */
    void removeEvent(EventStringType type, Consumer<Object> listener, Object target);
}
