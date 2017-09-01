package com.dragonbones.armature;

import com.dragonbones.core.DragonBones;
import com.dragonbones.core.OffsetMode;
import com.dragonbones.geom.Matrix;
import com.dragonbones.geom.Transform;
import com.dragonbones.model.BoneData;
import com.dragonbones.util.Array;
import com.dragonbones.util.IntArray;
import org.jetbrains.annotations.Nullable;

/**
 * 骨骼，一个骨架中可以包含多个骨骼，骨骼以树状结构组成骨架。
 * 骨骼在骨骼动画体系中是最重要的逻辑单元之一，负责动画中的平移旋转缩放的实现。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see BoneData
 * @see Armature
 * @see Slot
 */
public class Bone extends TransformObject {
    /**
     * @private
     */
    public OffsetMode offsetMode;
    /**
     * @internal
     * @private
     */
    public final Transform animationPose = new Transform();
    /**
     * @internal
     * @private
     */
    public final Array<Constraint> constraints = new Array<>();
    /**
     * @readonly
     */
    public BoneData boneData;
    /**
     * @internal
     * @private
     */
    public boolean _transformDirty;
    /**
     * @internal
     * @private
     */
    public boolean _childrenTransformDirty;
    /**
     * @internal
     * @private
     */
    public boolean _blendDirty;
    private boolean _localDirty;
    private boolean _visible;
    private int _cachedFrameIndex;
    /**
     * @internal
     * @private
     */
    public float _blendLayer;
    /**
     * @internal
     * @private
     */
    public float _blendLeftWeight;
    /**
     * @internal
     * @private
     */
    public float _blendLayerWeight;
    private final Array<Bone> _bones = new Array<>();
    private final Array<Slot> _slots = new Array<>();
    /**
     * @internal
     * @private
     */
    @Nullable
    public IntArray _cachedFrameIndices = new IntArray();

    /**
     * @private
     */
    protected void _onClear() {
        super._onClear();

        for (Constraint constraint : this.constraints) {
            constraint.returnToPool();
        }

        this.offsetMode = OffsetMode.Additive;
        this.animationPose.identity();
        this.constraints.clear();
        this.boneData = null; //

        this._transformDirty = false;
        this._childrenTransformDirty = false;
        this._blendDirty = false;
        this._localDirty = true;
        this._visible = true;
        this._cachedFrameIndex = -1;
        this._blendLayer = 0;
        this._blendLeftWeight = 1f;
        this._blendLayerWeight = 0f;
        this._bones.clear();
        this._slots.clear();
        this._cachedFrameIndices = null;
    }

    /**
     * @private
     */
    private void _updateGlobalTransformMatrix(boolean isCache) {
        boolean flipX = this._armature.getFlipX();
        boolean flipY = this._armature.getFlipY() == DragonBones.yDown;
        Transform global = this.global;
        Matrix globalTransformMatrix = this.globalTransformMatrix;
        boolean inherit = this._parent != null;
        float dR = 0f;

        if (this.offsetMode == OffsetMode.Additive) {
            // global.copyFrom(this.origin).add(this.offset).add(this.animationPose);
            global.x = this.origin.x + this.offset.x + this.animationPose.x;
            global.y = this.origin.y + this.offset.y + this.animationPose.y;
            global.skew = this.origin.skew + this.offset.skew + this.animationPose.skew;
            global.rotation = this.origin.rotation + this.offset.rotation + this.animationPose.rotation;
            global.scaleX = this.origin.scaleX * this.offset.scaleX * this.animationPose.scaleX;
            global.scaleY = this.origin.scaleY * this.offset.scaleY * this.animationPose.scaleY;
        } else if (this.offsetMode == OffsetMode.None) {
            global.copyFrom(this.origin).add(this.animationPose);
        } else {
            inherit = false;
            global.copyFrom(this.offset);
        }

        if (inherit) {
            Matrix parentMatrix = this._parent.globalTransformMatrix;

            if (this.boneData.inheritScale) {
                if (!this.boneData.inheritRotation) {
                    this._parent.updateGlobalTransform();

                    dR = this._parent.global.rotation; //
                    global.rotation -= dR;
                }

                global.toMatrix(globalTransformMatrix);
                globalTransformMatrix.concat(parentMatrix);

                if (this.boneData.inheritTranslation) {
                    global.x = globalTransformMatrix.tx;
                    global.y = globalTransformMatrix.ty;
                } else {
                    globalTransformMatrix.tx = global.x;
                    globalTransformMatrix.ty = global.y;
                }

                if (isCache) {
                    global.fromMatrix(globalTransformMatrix);
                } else {
                    this._globalDirty = true;
                }
            } else {
                if (this.boneData.inheritTranslation) {
                    float x = global.x;
                    float y = global.y;
                    global.x = parentMatrix.a * x + parentMatrix.c * y + parentMatrix.tx;
                    global.y = parentMatrix.d * y + parentMatrix.b * x + parentMatrix.ty;
                } else {
                    if (flipX) {
                        global.x = -global.x;
                    }

                    if (flipY) {
                        global.y = -global.y;
                    }
                }

                if (this.boneData.inheritRotation) {
                    this._parent.updateGlobalTransform();
                    dR = this._parent.global.rotation;

                    if (this._parent.global.scaleX < 0f) {
                        dR += Math.PI;
                    }

                    if (parentMatrix.a * parentMatrix.d - parentMatrix.b * parentMatrix.c < 0f) {
                        dR -= global.rotation * 2.0;

                        if (flipX != flipY || this.boneData.inheritReflection) {
                            global.skew += Math.PI;
                        }
                    }

                    global.rotation += dR;
                } else if (flipX || flipY) {
                    if (flipX && flipY) {
                        dR = (float)Math.PI;
                    } else {
                        dR = -global.rotation * 2.0f;
                        if (flipX) {
                            dR += Math.PI;
                        }

                        global.skew += Math.PI;
                    }

                    global.rotation += dR;
                }

                global.toMatrix(globalTransformMatrix);
            }
        } else {
            if (flipX || flipY) {
                if (flipX) {
                    global.x = -global.x;
                }

                if (flipY) {
                    global.y = -global.y;
                }

                if (flipX && flipY) {
                    dR = (float)Math.PI;
                } else {
                    dR = -global.rotation * 2.0f;
                    if (flipX) {
                        dR += Math.PI;
                    }

                    global.skew += Math.PI;
                }

                global.rotation += dR;
            }

            global.toMatrix(globalTransformMatrix);
        }
    }

    /**
     * @internal
     * @private
     */
    public void _setArmature(@Nullable Armature value) {
        if (this._armature == value) {
            return;
        }

        Array<Slot> oldSlots = null;
        Array<Bone> oldBones = null;

        if (this._armature != null) {
            oldSlots = this.getSlots();
            oldBones = this.getBones();
            this._armature._removeBoneFromBoneList(this);
        }

        this._armature = value; //

        if (this._armature != null) {
            this._armature._addBoneToBoneList(this);
        }

        if (oldSlots != null) {
            for (Slot slot : oldSlots) {
                if (slot.getParent() == this) {
                    slot._setArmature(this._armature);
                }
            }
        }

        if (oldBones != null) {
            for (Bone bone : oldBones) {
                if (bone.getParent() == this) {
                    bone._setArmature(this._armature);
                }
            }
        }
    }

    /**
     * @internal
     * @private
     */
    public void init(BoneData boneData) {
        if (this.boneData != null) {
            return;
        }

        this.boneData = boneData;
        this.name = this.boneData.name;
        this.origin = this.boneData.transform;
    }

    /**
     * @internal
     * @private
     */
    public void update(int cacheFrameIndex) {
        this._blendDirty = false;

        if (cacheFrameIndex >= 0 && this._cachedFrameIndices != null) {
            int cachedFrameIndex = this._cachedFrameIndices.get(cacheFrameIndex);
            if (cachedFrameIndex >= 0 && this._cachedFrameIndex == cachedFrameIndex) { // Same cache.
                this._transformDirty = false;
            } else if (cachedFrameIndex >= 0) { // Has been Cached.
                this._transformDirty = true;
                this._cachedFrameIndex = cachedFrameIndex;
            } else {
                if (this.constraints.size() > 0) { // Update constraints.
                    for (Constraint constraint : this.constraints) {
                        constraint.update();
                    }
                }

                if (
                        this._transformDirty ||
                                (this._parent != null && this._parent._childrenTransformDirty)
                        ) { // Dirty.
                    this._transformDirty = true;
                    this._cachedFrameIndex = -1;
                } else if (this._cachedFrameIndex >= 0) { // Same cache, but not set index yet.
                    this._transformDirty = false;
                    this._cachedFrameIndices.set(cacheFrameIndex, this._cachedFrameIndex);
                } else { // Dirty.
                    this._transformDirty = true;
                    this._cachedFrameIndex = -1;
                }
            }
        } else {
            if (this.constraints.size() > 0) { // Update constraints.
                for (Constraint constraint : this.constraints) {
                    constraint.update();
                }
            }

            if (this._transformDirty || (this._parent != null && this._parent._childrenTransformDirty)) { // Dirty.
                cacheFrameIndex = -1;
                this._transformDirty = true;
                this._cachedFrameIndex = -1;
            }
        }

        if (this._transformDirty) {
            this._transformDirty = false;
            this._childrenTransformDirty = true;

            if (this._cachedFrameIndex < 0) {
                boolean isCache = cacheFrameIndex >= 0;
                if (this._localDirty) {
                    this._updateGlobalTransformMatrix(isCache);
                }

                if (isCache && this._cachedFrameIndices != null) {
                    int vv = this._armature.armatureData.setCacheFrame(this.globalTransformMatrix, this.global);
                    this._cachedFrameIndices.set(cacheFrameIndex, vv);
                    this._cachedFrameIndex = vv;
                }
            } else {
                this._armature.armatureData.getCacheFrame(this.globalTransformMatrix, this.global, this._cachedFrameIndex);
            }
        } else if (this._childrenTransformDirty) {
            this._childrenTransformDirty = false;
        }

        this._localDirty = true;
    }

    /**
     * @internal
     * @private
     */
    public void updateByConstraint() {
        if (this._localDirty) {
            this._localDirty = false;
            if (this._transformDirty || (this._parent != null && this._parent._childrenTransformDirty)) {
                this._updateGlobalTransformMatrix(true);
            }

            this._transformDirty = true;
        }
    }

    /**
     * @internal
     * @private
     */
    public void addConstraint(Constraint constraint) {
        if (this.constraints.indexOf(constraint) < 0) {
            this.constraints.add(constraint);
        }
    }

    /**
     * 下一帧更新变换。 (当骨骼没有动画状态或动画状态播放完成时，骨骼将不在更新)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void invalidUpdate() {
        this._transformDirty = true;
    }

    /**
     * 是否包含骨骼或插槽。
     *
     * @returns
     * @version DragonBones 3.0
     * @language zh_CN
     * @see TransformObject
     */
    public boolean contains(TransformObject child) {
        if (child == this) {
            return false;
        }

        TransformObject ancestor = child;
        while (ancestor != this && ancestor != null) {
            ancestor = ancestor.getParent();
        }

        return ancestor == this;
    }

    /**
     * 所有的子骨骼。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Array<Bone> getBones() {
        this._bones.clear();

        for (Bone bone : this._armature.getBones()) {
            if (bone.getParent() == this) {
                this._bones.add(bone);
            }
        }

        return this._bones;
    }

    /**
     * 所有的插槽。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Slot
     */
    public Array<Slot> getSlots() {
        this._slots.clear();

        for (Slot slot : this._armature.getSlots()) {
            if (slot.getParent() == this) {
                this._slots.add(slot);
            }
        }

        return this._slots;
    }

    /**
     * 控制此骨骼所有插槽的可见。
     *
     * @default true
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Slot
     */
    public boolean getVisible() {
        return this._visible;
    }

    public void setVisible(boolean value) {
        if (this._visible == value) {
            return;
        }

        this._visible = value;

        for (Slot slot : this._armature.getSlots()) {
            if (slot._parent == this) {
                slot._updateVisible();
            }
        }
    }

    /**
     * @see #boneData
     * @see BoneData#length
     * @deprecated 已废弃，请参考 @see
     */
    public float getLength() {
        return this.boneData.length;
    }

    /**
     * @see Armature#getSlot(String)
     * @deprecated 已废弃，请参考 @see
     */
    @Nullable
    public Slot getSlot() {
        for (Slot slot : this._armature.getSlots()) {
            if (slot.getParent() == this) {
                return slot;
            }
        }

        return null;
    }
}
