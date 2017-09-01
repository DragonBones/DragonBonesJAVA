package com.dragonbones.core;

import com.dragonbones.util.Array;
import com.dragonbones.util.Console;
import org.jetbrains.annotations.NotNull;

import java.util.HashMap;
import java.util.Map;

/**
 * 基础对象。
 *
 * @version DragonBones 4.5
 * @language zh_CN
 */
public abstract class BaseObject {
    private static int _hashCode = 0;
    private static int _defaultMaxCount = 1000;
    private static final Map<Class<? extends BaseObject>, Integer> _maxCountMap = new HashMap<>();
    private static final Map<Class<? extends BaseObject>, Array<BaseObject>> _poolsMap = new HashMap<>();

    private static void _returnObject(BaseObject object) {
        Class<? extends BaseObject> classType = object.getClass();
        int maxCount = BaseObject._maxCountMap.containsKey(classType) ? BaseObject._defaultMaxCount : BaseObject._maxCountMap.get(classType);
        if (!BaseObject._poolsMap.containsKey(classType)) {
            BaseObject._poolsMap.put(classType, new Array<>());
        }
        Array<BaseObject> pool = BaseObject._poolsMap.get(classType);
        if (pool.size() < maxCount) {
            if (!object._isInPool) {
                object._isInPool = true;
                pool.add(object);
            } else {
                Console._assert(false, "The object is already in the pool.");
            }
        } else {
        }
    }

    /**
     * 设置每种对象池的最大缓存数量。
     *
     * @param classType 对象类。
     * @param maxCount  最大缓存数量。 (设置为 0 则不缓存)
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static void setMaxCount(Class<BaseObject> classType, int maxCount) {
        if (maxCount < 0) { // isNaN
            maxCount = 0;
        }

        if (classType != null) {
            Array<BaseObject> pool = BaseObject._poolsMap.get(classType);
            if (pool != null && pool.size() > maxCount) {
                pool.setLength(maxCount);
            }

            BaseObject._maxCountMap.put(classType, maxCount);
        } else {
            BaseObject._defaultMaxCount = maxCount;
            for (Class<? extends BaseObject> classType2 : BaseObject._poolsMap.keySet()) {
                if (BaseObject._maxCountMap.containsKey(classType2)) {
                    continue;
                }

                Array<BaseObject> pool = BaseObject._poolsMap.get(classType2);
                if (pool.size() > maxCount) {
                    pool.setLength(maxCount);
                }

                BaseObject._maxCountMap.put(classType2, maxCount);
            }
        }
    }

    public static void clearPool() {
        for (Array<BaseObject> pool : BaseObject._poolsMap.values()) {
            pool.clear();
        }
    }

    /**
     * 清除对象池缓存的对象。
     *
     * @param classType 对象类。 (不设置则清除所有缓存)
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public static void clearPool(@NotNull Class<BaseObject> classType) {
        Array<BaseObject> pool = BaseObject._poolsMap.get(classType);
        if (pool != null && pool.size() > 0) {
            pool.clear();
        }
    }

    /**
     * 从对象池中创建指定对象。
     *
     * @param classType 对象类。
     * @version DragonBones 4.5
     * @language zh_CN
     */

    public static <T extends BaseObject> T borrowObject(Class<T> classType) {
        Array<BaseObject> pool = BaseObject._poolsMap.get(classType);
        if (pool != null && pool.size() > 0) {
            T object = (T) pool.popObject();
            object._isInPool = false;
            return object;
        }

        try {
            final T object = classType.newInstance();
            object._onClear();
            return object;
        } catch (InstantiationException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    /**
     * 对象的唯一标识。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public final int hashCode = BaseObject._hashCode++;
    boolean _isInPool = false;

    /**
     * @private
     */
    protected abstract void _onClear();

    /**
     * 清除数据并返还对象池。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public void returnToPool() {
        this._onClear();
        BaseObject._returnObject(this);
    }
}
