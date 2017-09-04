package com.dragonbones.armature;

import com.dragonbones.core.BaseObject;
import com.dragonbones.geom.Matrix;
import com.dragonbones.geom.Point;
import com.dragonbones.geom.Transform;
import org.jetbrains.annotations.Nullable;

/**
 * 基础变换对象。
 *
 * @version DragonBones 4.5
 * @language zh_CN
 */
public abstract class TransformObject extends BaseObject {
    /**
     * @private
     */
    protected static final Matrix _helpMatrix = new Matrix();
    /**
     * @private
     */
    protected static final Transform _helpTransform = new Transform();
    /**
     * @private
     */
    protected static final Point _helpPoint = new Point();
    /**
     * 对象的名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String name;
    /**
     * 相对于骨架坐标系的矩阵。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public final Matrix globalTransformMatrix = new Matrix();
    /**
     * 相对于骨架坐标系的变换。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Transform
     */
    public final Transform global = new Transform();
    /**
     * 相对于骨架或父骨骼坐标系的偏移变换。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Transform
     */
    public final Transform offset = new Transform();
    /**
     * 相对于骨架或父骨骼坐标系的绑定变换。
     *
     * @version DragonBones 3.0
     * @readOnly
     * @language zh_CN
     * @see Transform
     */
    public Transform origin;
    /**
     * 可以用于存储临时数据。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Object userData;
    /**
     * @private
     */
    protected boolean _globalDirty;
    /**
     * @private
     */
    public Armature _armature;
    /**
     * @private
     */
    public Bone _parent;

    /**
     * @private
     */
    protected void _onClear() {
        this.name = "";
        this.globalTransformMatrix.identity();
        this.global.identity();
        this.offset.identity();
        this.origin = null; //
        this.userData = null;

        this._globalDirty = false;
        this._armature = null; //
        this._parent = null; //
    }

    /**
     * @internal
     * @private
     */
    public void _setArmature(@Nullable Armature value) {
        this._armature = value;
    }

    /**
     * @internal
     * @private
     */
    public void _setParent(@Nullable Bone value) {
        this._parent = value;
    }

    /**
     * @private
     */
    public void updateGlobalTransform() {
        if (this._globalDirty) {
            this._globalDirty = false;
            this.global.fromMatrix(this.globalTransformMatrix);
        }
    }

    /**
     * 所属的骨架。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Armature
     */
    public Armature getArmature() {
        return this._armature;
    }

    /**
     * 所属的父骨骼。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Bone
     */
    public Bone getParent() {
        return this._parent;
    }
}
