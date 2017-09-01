package com.dragonbones.model;

import com.dragonbones.core.ArmatureType;
import com.dragonbones.core.BaseObject;
import com.dragonbones.geom.Matrix;
import com.dragonbones.geom.Rectangle;
import com.dragonbones.geom.Transform;
import com.dragonbones.util.Array;
import com.dragonbones.util.Console;
import com.dragonbones.util.FloatArray;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;

/**
 * 骨架数据。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 */
public class ArmatureData extends BaseObject {
    /**
     * @private
     */
    public ArmatureType type;
    /**
     * 动画帧率。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float frameRate;
    /**
     * @private
     */
    public float cacheFrameRate;
    /**
     * @private
     */
    public float scale;
    /**
     * 数据名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String name;
    /**
     * @private
     */
    public final Rectangle aabb = new Rectangle();
    /**
     * 所有动画数据名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public final Array<String> animationNames = new Array<>();
    /**
     * @private
     */
    public final Array<BoneData> sortedBones = new Array<>();
    /**
     * @private
     */
    public final Array<SlotData> sortedSlots = new Array<>();
    /**
     * @private
     */
    public final Array<ActionData> defaultActions = new Array<>();
    /**
     * @private
     */
    public final Array<ActionData> actions = new Array<>();
    /**
     * 所有骨骼数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see BoneData
     */
    public final Map<String, BoneData> bones = new HashMap<>();
    /**
     * 所有插槽数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see SlotData
     */
    public final Map<String, SlotData> slots = new HashMap<>();
    /**
     * 所有皮肤数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see SkinData
     */
    public final Map<String, SkinData> skins = new HashMap<>();
    /**
     * 所有动画数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationData
     */
    public final Map<String, AnimationData> animations = new HashMap<>();
    /**
     * 获取默认皮肤数据。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see SkinData
     */
    @Nullable
    public SkinData defaultSkin;
    /**
     * 获取默认动画数据。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationData
     */
    @Nullable
    public AnimationData defaultAnimation;
    /**
     * @private
     */
    @Nullable
    public CanvasData canvas = null; // Initial value.
    /**
     * @private
     */
    @Nullable
    public UserData userData = null; // Initial value.
    /**
     * 所属的龙骨数据。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     * @see DragonBonesData
     */
    public DragonBonesData parent;

    /**
     * @private
     */
    protected void _onClear() {
        for (ActionData action : this.defaultActions) {
            action.returnToPool();
        }

        for (ActionData action : this.actions) {
            action.returnToPool();
        }

        for (String k : this.bones.keySet()) {
            this.bones.get(k).returnToPool();
            this.bones.remove(k);
        }

        for (String k : this.slots.keySet()) {
            this.slots.get(k).returnToPool();
            this.slots.remove(k);
        }

        for (String k : this.skins.keySet()) {
            this.skins.get(k).returnToPool();
            this.skins.remove(k);
        }

        for (String k : this.animations.keySet()) {
            this.animations.get(k).returnToPool();
            this.animations.remove(k);
        }

        if (this.canvas != null) {
            this.canvas.returnToPool();
        }

        if (this.userData != null) {
            this.userData.returnToPool();
        }

        this.type = ArmatureType.Armature;
        this.frameRate = 0;
        this.cacheFrameRate = 0;
        this.scale = 1f;
        this.name = "";
        this.aabb.clear();
        this.animationNames.clear();
        this.sortedBones.clear();
        this.sortedSlots.clear();
        this.defaultActions.clear();
        this.actions.clear();
        //this.bones.clear();
        //this.slots.clear();
        //this.skins.clear();
        //this.animations.clear();
        this.defaultSkin = null;
        this.defaultAnimation = null;
        this.canvas = null;
        this.userData = null;
        this.parent = null; //
    }

    /**
     * @private
     */
    public void sortBones() {
        int total = this.sortedBones.size();
        if (total <= 0) {
            return;
        }

        Array<BoneData> sortHelper = this.sortedBones.copy();
        int index = 0;
        int count = 0;
        this.sortedBones.clear();
        while (count < total) {
            BoneData bone = sortHelper.get(index++);
            if (index >= total) {
                index = 0;
            }

            if (this.sortedBones.indexOfObject(bone) >= 0) {
                continue;
            }

            if (bone.constraints.size() > 0) { // Wait constraint.
                boolean flag = false;
                for (ConstraintData constraint : bone.constraints) {
                    if (this.sortedBones.indexOf(constraint.target) < 0) {
                        flag = true;
                    }
                }

                if (flag) {
                    continue;
                }
            }

            if (bone.parent != null && this.sortedBones.indexOf(bone.parent) < 0) { // Wait parent.
                continue;
            }

            this.sortedBones.add(bone);
            count++;
        }
    }

    /**
     * @private
     */
    public void cacheFrames(float frameRate) {
        if (this.cacheFrameRate > 0) { // TODO clear cache.
            return;
        }

        this.cacheFrameRate = frameRate;
        for (String k : this.animations.keySet()) {
            this.animations.get(k).cacheFrames(this.cacheFrameRate);
        }
    }

    /**
     * @private
     */
    public int setCacheFrame(Matrix globalTransformMatrix, Transform transform) {
        FloatArray dataArray = this.parent.cachedFrames;
        int arrayOffset = dataArray.size();

        dataArray.setLength(dataArray.size() + 10);
        dataArray.set(arrayOffset + 0, globalTransformMatrix.a);
        dataArray.set(arrayOffset + 1, globalTransformMatrix.b);
        dataArray.set(arrayOffset + 2, globalTransformMatrix.c);
        dataArray.set(arrayOffset + 3, globalTransformMatrix.d);
        dataArray.set(arrayOffset + 4, globalTransformMatrix.tx);
        dataArray.set(arrayOffset + 5, globalTransformMatrix.ty);
        dataArray.set(arrayOffset + 6, transform.rotation);
        dataArray.set(arrayOffset + 7, transform.skew);
        dataArray.set(arrayOffset + 8, transform.scaleX);
        dataArray.set(arrayOffset + 9, transform.scaleY);

        return arrayOffset;
    }

    /**
     * @private
     */
    public void getCacheFrame(Matrix globalTransformMatrix, Transform transform, int arrayOffset) {
        FloatArray dataArray = this.parent.cachedFrames;
        globalTransformMatrix.a = dataArray.get(arrayOffset);
        globalTransformMatrix.b = dataArray.get(arrayOffset + 1);
        globalTransformMatrix.c = dataArray.get(arrayOffset + 2);
        globalTransformMatrix.d = dataArray.get(arrayOffset + 3);
        globalTransformMatrix.tx = dataArray.get(arrayOffset + 4);
        globalTransformMatrix.ty = dataArray.get(arrayOffset + 5);
        transform.rotation = dataArray.get(arrayOffset + 6);
        transform.skew = dataArray.get(arrayOffset + 7);
        transform.scaleX = dataArray.get(arrayOffset + 8);
        transform.scaleY = dataArray.get(arrayOffset + 9);
        transform.x = globalTransformMatrix.tx;
        transform.y = globalTransformMatrix.ty;
    }

    /**
     * @private
     */
    public void addBone(BoneData value) {
        if (this.bones.containsKey(value.name)) {
            Console.warn("Replace bone: " + value.name);
            this.bones.get(value.name).returnToPool();
        }

        this.bones.put(value.name, value);
        this.sortedBones.add(value);
    }

    /**
     * @private
     */
    public void addSlot(SlotData value) {
        if (this.slots.containsKey(value.name)) {
            Console.warn("Replace slot: " + value.name);
            this.slots.get(value.name).returnToPool();
        }

        this.slots.put(value.name, value);
        this.sortedSlots.add(value);
    }

    /**
     * @private
     */
    public void addSkin(SkinData value) {
        if (this.skins.containsKey(value.name)) {
            Console.warn("Replace skin: " + value.name);
            this.skins.get(value.name).returnToPool();
        }

        this.skins.put(value.name, value);
        if (this.defaultSkin == null) {
            this.defaultSkin = value;
        }
    }

    /**
     * @private
     */
    public void addAnimation(AnimationData value) {
        if (this.animations.containsKey(value.name)) {
            Console.warn("Replace animation: " + value.name);
            this.animations.get(value.name).returnToPool();
        }

        value.parent = this;
        this.animations.put(value.name, value);
        this.animationNames.add(value.name);
        if (this.defaultAnimation == null) {
            this.defaultAnimation = value;
        }
    }

    /**
     * 获取骨骼数据。
     *
     * @param name 数据名称。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see BoneData
     */
    @Nullable
    public BoneData getBone(String name) {
        return this.bones.get(name);
    }

    /**
     * 获取插槽数据。
     *
     * @param name 数据名称。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see SlotData
     */
    @Nullable
    public SlotData getSlot(String name) {
        return this.slots.get(name);
    }

    /**
     * 获取皮肤数据。
     *
     * @param name 数据名称。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see SkinData
     */
    @Nullable
    public SkinData getSkin(String name) {
        return this.skins.get(name);
    }

    /**
     * 获取动画数据。
     *
     * @param name 数据名称。
     * @version DragonBones 3.0
     * @language zh_CN
     * @see AnimationData
     */
    @Nullable
    public AnimationData getAnimation(String name) {
        return this.animations.get(name);
    }
}

