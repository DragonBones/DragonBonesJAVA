package com.dragonbones.armature;

import com.dragonbones.animation.Animation;
import com.dragonbones.animation.IAnimatable;
import com.dragonbones.animation.WorldClock;
import com.dragonbones.core.ActionType;
import com.dragonbones.core.BaseObject;
import com.dragonbones.core.DragonBones;
import com.dragonbones.event.EventStringType;
import com.dragonbones.event.IEventDispatcher;
import com.dragonbones.geom.Point;
import com.dragonbones.model.*;
import com.dragonbones.util.Array;
import com.dragonbones.util.Console;
import com.dragonbones.util.Function;
import com.dragonbones.util.ShortArray;
import org.jetbrains.annotations.Nullable;

import java.util.Objects;
import java.util.function.Consumer;

/**
 * 骨架，是骨骼动画系统的核心，由显示容器、骨骼、插槽、动画、事件系统构成。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see ArmatureData
 * @see Bone
 * @see Slot
 * @see Animation
 */
public class Armature extends BaseObject implements IAnimatable {
    private static int _onSortSlots(Slot a, Slot b) {
        return a._zOrder > b._zOrder ? 1 : -1;
    }

    /**
     * 是否继承父骨架的动画状态。
     *
     * @default true
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public boolean inheritAnimation;
    /**
     * @private
     */
    public boolean debugDraw;
    /**
     * 获取骨架数据。
     *
     * @version DragonBones 4.5
     * @readonly
     * @language zh_CN
     * @see ArmatureData
     */
    public ArmatureData armatureData;
    /**
     * 用于存储临时数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Object userData;

    private boolean _debugDraw;
    private boolean _lockUpdate;
    private boolean _bonesDirty;
    private boolean _slotsDirty;
    private boolean _zOrderDirty;
    private boolean _flipX;
    private boolean _flipY;
    /**
     * @internal
     * @private
     */
    public int _cacheFrameIndex;
    private final Array<Bone> _bones = new Array<>();
    private final Array<Slot> _slots = new Array<>();
    private final Array<ActionData> _actions = new Array<>();
    @Nullable
    private Animation _animation = null; // Initial value.
    @Nullable
    private IArmatureProxy _proxy = null; // Initial value.
    private Object _display;
    /**
     * @private
     */
    @Nullable
    public TextureAtlasData _replaceTextureAtlasData = null; // Initial value.
    private Object _replacedTexture;
    /**
     * @internal
     * @private
     */
    public DragonBones _dragonBones;
    @Nullable
    private WorldClock _clock = null; // Initial value.
    /**
     * @internal
     * @private
     */
    @Nullable
    public Slot _parent;

    @Override
    public void setClock(WorldClock value) {
        this._clock = value;
    }

    /**
     * @private
     */
    protected void _onClear() {
        if (this._clock != null) { // Remove clock first.
            this._clock.remove(this);
        }

        for (Bone bone : this._bones) {
            bone.returnToPool();
        }

        for (Slot slot : this._slots) {
            slot.returnToPool();
        }

        for (ActionData action : this._actions) {
            action.returnToPool();
        }

        if (this._animation != null) {
            this._animation.returnToPool();
        }

        if (this._proxy != null) {
            this._proxy.clear();
        }

        if (this._replaceTextureAtlasData != null) {
            this._replaceTextureAtlasData.returnToPool();
        }

        this.inheritAnimation = true;
        this.debugDraw = false;
        this.armatureData = null; //
        this.userData = null;

        this._debugDraw = false;
        this._lockUpdate = false;
        this._bonesDirty = false;
        this._slotsDirty = false;
        this._zOrderDirty = false;
        this._flipX = false;
        this._flipY = false;
        this._cacheFrameIndex = -1;
        this._bones.clear();
        this._slots.clear();
        this._actions.clear();
        this._animation = null; //
        this._proxy = null; //
        this._display = null;
        this._replaceTextureAtlasData = null;
        this._replacedTexture = null;
        this._dragonBones = null; //
        this._clock = null;
        this._parent = null;
    }

    private void _sortBones() {
        int total = this._bones.size();
        if (total <= 0) {
            return;
        }

        Array<Bone> sortHelper = this._bones.copy();
        int index = 0;
        int count = 0;

        this._bones.clear();
        while (count < total) {
            Bone bone = sortHelper.get(index++);
            if (index >= total) {
                index = 0;
            }

            if (this._bones.indexOf(bone) >= 0) {
                continue;
            }

            if (bone.constraints.size() > 0) { // Wait constraint.
                boolean flag = false;
                for (Constraint constraint : bone.constraints) {
                    if (this._bones.indexOf(constraint.target) < 0) {
                        flag = true;
                        break;
                    }
                }

                if (flag) {
                    continue;
                }
            }

            if (bone.getParent() != null && this._bones.indexOf(bone.getParent()) < 0) { // Wait parent.
                continue;
            }

            this._bones.add(bone);
            count++;
        }
    }

    private void _sortSlots() {
        this._slots.sort(Armature::_onSortSlots);
    }

    /**
     * @internal
     * @private
     */
    public void _sortZOrder(@Nullable ShortArray slotIndices, int offset) {
        Array<SlotData> slotDatas = this.armatureData.sortedSlots;
        boolean isOriginal = slotIndices == null;

        if (this._zOrderDirty || !isOriginal) {
            for (int i = 0, l = slotDatas.size(); i < l; ++i) {
                int slotIndex = isOriginal ? i : slotIndices.get(offset + i);
                if (slotIndex < 0 || slotIndex >= l) {
                    continue;
                }

                SlotData slotData = slotDatas.get(slotIndex);
                Slot slot = this.getSlot(slotData.name);
                if (slot != null) {
                    slot._setZorder(i);
                }
            }

            this._slotsDirty = true;
            this._zOrderDirty = !isOriginal;
        }
    }

    /**
     * @internal
     * @private
     */
    public void _addBoneToBoneList(Bone value) {
        if (this._bones.indexOf(value) < 0) {
            this._bonesDirty = true;
            this._bones.add(value);
            this._animation._timelineDirty = true;
        }
    }

    /**
     * @internal
     * @private
     */
    public void _removeBoneFromBoneList(Bone value) {
        int index = this._bones.indexOf(value);
        if (index >= 0) {
            this._bones.splice(index, 1);
            this._animation._timelineDirty = true;
        }
    }

    /**
     * @internal
     * @private
     */
    public void _addSlotToSlotList(Slot value) {
        if (this._slots.indexOf(value) < 0) {
            this._slotsDirty = true;
            this._slots.add(value);
            this._animation._timelineDirty = true;
        }
    }

    /**
     * @internal
     * @private
     */
    public void _removeSlotFromSlotList(Slot value) {
        int index = this._slots.indexOf(value);
        if (index >= 0) {
            this._slots.splice(index, 1);
            this._animation._timelineDirty = true;
        }
    }

    /**
     * @internal
     * @private
     */
    public void _bufferAction(ActionData action, boolean append) {
        if (this._actions.indexOf(action) < 0) {
            if (append) {
                this._actions.add(action);
            } else {
                this._actions.unshiftObject(action);
            }
        }
    }

    /**
     * 释放骨架。 (回收到对象池)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void dispose() {
        if (this.armatureData != null) {
            this._lockUpdate = true;
            this._dragonBones.bufferObject(this);
        }
    }

    /**
     * @private
     */
    public void init(
            ArmatureData armatureData,
            IArmatureProxy proxy, Object display, DragonBones dragonBones
    ) {
        if (this.armatureData != null) {
            return;
        }

        this.armatureData = armatureData;
        this._animation = BaseObject.borrowObject(Animation.class);
        this._proxy = proxy;
        this._display = display;
        this._dragonBones = dragonBones;

        this._proxy.init(this);
        this._animation.init(this);
        this._animation.setAnimations(this.armatureData.animations);
    }

    /**
     * 更新骨架和动画。
     *
     * @param passedTime 两帧之间的时间间隔。 (以秒为单位)
     * @version DragonBones 3.0
     * @language zh_CN
     * @see IAnimatable
     * @see WorldClock
     */
    public void advanceTime(float passedTime) {
        if (this._lockUpdate) {
            return;
        }

        if (this.armatureData == null) {
            Console._assert(false, "The armature has been disposed.");
            return;
        } else if (this.armatureData.parent == null) {
            Console._assert(false, "The armature data has been disposed.");
            return;
        }

        int prevCacheFrameIndex = this._cacheFrameIndex;

        // Update nimation.
        this._animation.advanceTime(passedTime);

        // Sort bones and slots.
        if (this._bonesDirty) {
            this._bonesDirty = false;
            this._sortBones();
        }

        if (this._slotsDirty) {
            this._slotsDirty = false;
            this._sortSlots();
        }

        // Update bones and slots.
        if (this._cacheFrameIndex < 0 || this._cacheFrameIndex != prevCacheFrameIndex) {
            int i = 0, l = 0;
            for (i = 0, l = this._bones.size(); i < l; ++i) {
                this._bones.get(i).update(this._cacheFrameIndex);
            }

            for (i = 0, l = this._slots.size(); i < l; ++i) {
                this._slots.get(i).update(this._cacheFrameIndex);
            }
        }

        if (this._actions.size() > 0) {
            this._lockUpdate = true;
            for (ActionData action : this._actions) {
                if (action.type == ActionType.Play) {
                    this._animation.fadeIn(action.name);
                }
            }

            this._actions.clear();
            this._lockUpdate = false;
        }

        //
        boolean drawed = this.debugDraw || DragonBones.debugDraw;
        if (drawed || this._debugDraw) {
            this._debugDraw = drawed;
            this._proxy.debugUpdate(this._debugDraw);
        }
    }

    public void invalidUpdate() {
        invalidUpdate(null, false);
    }

    public void invalidUpdate(@Nullable String boneName) {
        invalidUpdate(boneName, false);
    }

    /**
     * 更新骨骼和插槽。 (当骨骼没有动画状态或动画状态播放完成时，骨骼将不在更新)
     *
     * @param boneName          指定的骨骼名称，如果未设置，将更新所有骨骼。
     * @param updateSlotDisplay 是否更新插槽的显示对象。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Bone
     * @see Slot
     */
    public void invalidUpdate(@Nullable String boneName, boolean updateSlotDisplay) {
        if (boneName != null && boneName.length() > 0) {
            Bone bone = this.getBone(boneName);
            if (bone != null) {
                bone.invalidUpdate();

                if (updateSlotDisplay) {
                    for (Slot slot : this._slots) {
                        if (slot.getParent() == bone) {
                            slot.invalidUpdate();
                        }
                    }
                }
            }
        } else {
            for (Bone bone : this._bones) {
                bone.invalidUpdate();
            }

            if (updateSlotDisplay) {
                for (Slot slot : this._slots) {
                    slot.invalidUpdate();
                }
            }
        }
    }

    /**
     * 判断点是否在所有插槽的自定义包围盒内。
     *
     * @param x 点的水平坐标。（骨架内坐标系）
     * @param y 点的垂直坐标。（骨架内坐标系）
     * @version DragonBones 5.0
     * @language zh_CN
     */
    @Nullable
    public Slot containsPoint(float x, float y) {
        for (Slot slot : this._slots) {
            if (slot.containsPoint(x, y)) {
                return slot;
            }
        }

        return null;
    }

    @Nullable
    public Slot intersectsSegment(
            float xA, float yA, float xB, float yB
    ) {
        return intersectsSegment(xA, yA, xB, yB, null, null, null);
    }

    /**
     * 判断线段是否与骨架的所有插槽的自定义包围盒相交。
     *
     * @param xA                 线段起点的水平坐标。（骨架内坐标系）
     * @param yA                 线段起点的垂直坐标。（骨架内坐标系）
     * @param xB                 线段终点的水平坐标。（骨架内坐标系）
     * @param yB                 线段终点的垂直坐标。（骨架内坐标系）
     * @param intersectionPointA 线段从起点到终点与包围盒相交的第一个交点。（骨架内坐标系）
     * @param intersectionPointB 线段从终点到起点与包围盒相交的第一个交点。（骨架内坐标系）
     * @param normalRadians      碰撞点处包围盒切线的法线弧度。 [x: 第一个碰撞点处切线的法线弧度, y: 第二个碰撞点处切线的法线弧度]
     * @returns 线段从起点到终点相交的第一个自定义包围盒的插槽。
     * @version DragonBones 5.0
     * @language zh_CN
     */
    @Nullable
    public Slot intersectsSegment(
            float xA, float yA, float xB, float yB,
            @Nullable Point intersectionPointA,
            @Nullable Point intersectionPointB,
            @Nullable Point normalRadians
    )

    {
        boolean isV = xA == xB;
        float dMin = 0f;
        float dMax = 0f;
        float intXA = 0f;
        float intYA = 0f;
        float intXB = 0f;
        float intYB = 0f;
        float intAN = 0f;
        float intBN = 0f;
        Slot intSlotA = null;
        Slot intSlotB = null;

        for (Slot slot : this._slots) {
            int intersectionCount = slot.intersectsSegment(xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians);
            if (intersectionCount > 0) {
                if (intersectionPointA != null || intersectionPointB != null) {
                    if (intersectionPointA != null) {
                        float d = isV ? intersectionPointA.y - yA : intersectionPointA.x - xA;
                        if (d < 0f) {
                            d = -d;
                        }

                        if (intSlotA == null || d < dMin) {
                            dMin = d;
                            intXA = intersectionPointA.x;
                            intYA = intersectionPointA.y;
                            intSlotA = slot;

                            if (normalRadians != null) {
                                intAN = normalRadians.x;
                            }
                        }
                    }

                    if (intersectionPointB != null) {
                        float d = intersectionPointB.x - xA;
                        if (d < 0f) {
                            d = -d;
                        }

                        if (intSlotB == null || d > dMax) {
                            dMax = d;
                            intXB = intersectionPointB.x;
                            intYB = intersectionPointB.y;
                            intSlotB = slot;

                            if (normalRadians != null) {
                                intBN = normalRadians.y;
                            }
                        }
                    }
                } else {
                    intSlotA = slot;
                    break;
                }
            }
        }

        if (intSlotA != null && intersectionPointA != null) {
            intersectionPointA.x = intXA;
            intersectionPointA.y = intYA;

            if (normalRadians != null) {
                normalRadians.x = intAN;
            }
        }

        if (intSlotB != null && intersectionPointB != null) {
            intersectionPointB.x = intXB;
            intersectionPointB.y = intYB;

            if (normalRadians != null) {
                normalRadians.y = intBN;
            }
        }

        return intSlotA;
    }

    /**
     * 获取指定名称的骨骼。
     *
     * @param name 骨骼的名称。
     * @returns 骨骼。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Bone
     */
    @Nullable
    public Bone getBone(String name) {
        for (Bone bone : this._bones) {
            if (Objects.equals(bone.name, name)) {
                return bone;
            }
        }

        return null;
    }

    /**
     * 通过显示对象获取骨骼。
     *
     * @param display 显示对象。
     * @returns 包含这个显示对象的骨骼。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Bone
     */
    @Nullable
    public Bone getBoneByDisplay(Object display) {
        Slot slot = this.getSlotByDisplay(display);
        return slot != null ? slot.getParent() : null;
    }

    /**
     * 获取插槽。
     *
     * @param name 插槽的名称。
     * @returns 插槽。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Slot
     */
    @Nullable
    public Slot getSlot(String name) {
        for (Slot slot : this._slots) {
            if (Objects.equals(slot.name, name)) {
                return slot;
            }
        }

        return null;
    }

    /**
     * 通过显示对象获取插槽。
     *
     * @param display 显示对象。
     * @returns 包含这个显示对象的插槽。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Slot
     */
    @Nullable
    public Slot getSlotByDisplay(Object display) {
        if (display != null) {
            for (Slot slot : this._slots) {
                if (slot.getDisplay() == display) {
                    return slot;
                }
            }
        }

        return null;
    }

    public void addBone(Bone value) {
        addBone(value, null);
    }

    /**
     * @deprecated
     */
    public void addBone(Bone value, @Nullable String parentName) {
        Console._assert(value != null);

        value._setArmature(this);
        value._setParent(parentName != null ? this.getBone(parentName) : null);
    }

    /**
     * @deprecated
     */
    public void removeBone(Bone value) {
        Console._assert(value != null && value.getArmature() == this);

        value._setParent(null);
        value._setArmature(null);
    }

    /**
     * @deprecated
     */
    public void addSlot(Slot value, String parentName) {
        Bone bone = this.getBone(parentName);

        Console._assert(value != null && bone != null);

        value._setArmature(this);
        value._setParent(bone);
    }

    /**
     * @deprecated
     */
    public void removeSlot(Slot value) {
        Console._assert(value != null && value.getArmature() == this);

        value._setParent(null);
        value._setArmature(null);
    }

    /**
     * 获取所有骨骼。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Bone
     */
    public Array<Bone> getBones() {
        return this._bones;
    }

    /**
     * 获取所有插槽。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Slot
     */
    public Array<Slot> getSlots() {
        return this._slots;
    }

    public boolean getFlipX() {
        return this._flipX;
    }

    public void setFlipX(boolean value) {
        if (this._flipX == value) {
            return;
        }

        this._flipX = value;
        this.invalidUpdate();
    }

    public boolean getFlipY() {
        return this._flipY;
    }

    public void setFlipY(boolean value) {
        if (this._flipY == value) {
            return;
        }

        this._flipY = value;
        this.invalidUpdate();
    }

    /**
     * 动画缓存帧率，当设置的值大于 0 的时，将会开启动画缓存。
     * 通过将动画数据缓存在内存中来提高运行性能，会有一定的内存开销。
     * 帧率不宜设置的过高，通常跟动画的帧率相当且低于程序运行的帧率。
     * 开启动画缓存后，某些功能将会失效，比如 Bone 和 Slot 的 offset 属性等。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see DragonBonesData#frameRate
     * @see ArmatureData#frameRate
     */
    public float getCacheFrameRate() {
        return this.armatureData.cacheFrameRate;
    }

    public void setCacheFrameRate(float value) {
        if (this.armatureData.cacheFrameRate != value) {
            this.armatureData.cacheFrames(value);

            // Set child armature frameRate.
            for (Slot slot : this._slots) {
                Armature childArmature = slot.getChildArmature();
                if (childArmature != null) {
                    childArmature.setCacheFrameRate(value);
                }
            }
        }
    }

    /**
     * 骨架名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see ArmatureData#name
     */
    public String getName() {
        return this.armatureData.name;
    }

    /**
     * 获得动画控制器。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Animation
     */
    public Animation getAnimation() {
        return this._animation;
    }

    /**
     * @pivate
     */
    public IArmatureProxy getProxy() {
        return this._proxy;
    }

    /**
     * @pivate
     */
    public IEventDispatcher getEventDispatcher() {
        return this._proxy;
    }

    /**
     * @language zh_CN
     * 替换骨架的主贴图，根据渲染引擎的不同，提供不同的贴图数据。
     * @version DragonBones 4.5
     */
    public Object getReplacedTexture() {
        return this._replacedTexture;
    }

    public void setReplacedTexture(Object value) {
        if (this._replacedTexture == value) {
            return;
        }

        if (this._replaceTextureAtlasData != null) {
            this._replaceTextureAtlasData.returnToPool();
            this._replaceTextureAtlasData = null;
        }

        this._replacedTexture = value;

        for (Slot slot : this._slots) {
            slot.invalidUpdate();
            slot.update(-1);
        }
    }

    /**
     * @inheritDoc
     */
    @Nullable
    public WorldClock getClock() {
        return this._clock;
    }

    public void clock(@Nullable WorldClock value) {
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

        // Update childArmature clock.
        for (Slot slot : this._slots) {
            Armature childArmature = slot.getChildArmature();
            if (childArmature != null) {
                childArmature.setClock(this._clock);
            }
        }
    }

    /**
     * 获取父插槽。 (当此骨架是某个骨架的子骨架时，可以通过此属性向上查找从属关系)
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see Slot
     */
    @Nullable
    public Slot getParent() {
        return this._parent;
    }

    /**
     * @see Armature#setReplacedTexture(Object)
     * @deprecated 已废弃，请参考 @see
     */
    public void replaceTexture(Object texture) {
        this.setReplacedTexture(texture);
    }

    /**
     * @see Armature#getEventDispatcher()
     * @deprecated 已废弃，请参考 @see
     */
    public boolean hasEventListener(EventStringType type) {
        return this._proxy.hasEvent(type);
    }

    /**
     * @see Armature#getEventDispatcher()
     * @deprecated 已废弃，请参考 @see
     */
    public void addEventListener(EventStringType type, Consumer<Object> listener, Object target) {
        this._proxy.addEvent(type, listener, target);
    }

    /**
     * @see Armature#getEventDispatcher()
     * @deprecated 已废弃，请参考 @see
     */
    public void removeEventListener(EventStringType type, Consumer<Object> listener, Object target) {
        this._proxy.removeEvent(type, listener, target);
    }

    /**
     * @see #setCacheFrameRate(float)
     * @deprecated 已废弃，请参考 @see
     */
    public void enableAnimationCache(float frameRate) {
        this.setCacheFrameRate(frameRate);
    }

    ///**
    // * @deprecated
    // * 已废弃，请参考 @see
    // * @see #_display
    // */
    //@Override
    //public Object getDisplay() {
    //    return this._display;
    //}

    /**
     * 获取显示容器，插槽的显示对象都会以此显示容器为父级，根据渲染平台的不同，类型会不同，通常是 DisplayObjectContainer 类型。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Object getDisplay() {
        return this._display;
    }

}
