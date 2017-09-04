package com.dragonbones.armature;

import com.dragonbones.animation.AnimationState;
import com.dragonbones.core.BinaryOffset;
import com.dragonbones.core.BlendMode;
import com.dragonbones.core.DisplayType;
import com.dragonbones.geom.ColorTransform;
import com.dragonbones.geom.Matrix;
import com.dragonbones.geom.Point;
import com.dragonbones.geom.Rectangle;
import com.dragonbones.model.*;
import com.dragonbones.util.Array;
import com.dragonbones.util.FloatArray;
import com.dragonbones.util.IntArray;
import org.jetbrains.annotations.Nullable;

/**
 * 插槽，附着在骨骼上，控制显示对象的显示状态和属性。
 * 一个骨骼上可以包含多个插槽。
 * 一个插槽中可以包含多个显示对象，同一时间只能显示其中的一个显示对象，但可以在动画播放的过程中切换显示对象实现帧动画。
 * 显示对象可以是普通的图片纹理，也可以是子骨架的显示容器，网格显示对象，还可以是自定义的其他显示对象。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 * @see Armature
 * @see Bone
 * @see SlotData
 */
public abstract class Slot extends TransformObject {
    /**
     * 显示对象受到控制的动画状态或混合组名称，设置为 null 则表示受所有的动画状态控制。
     *
     * @default null
     * @version DragonBones 4.5
     * @language zh_CN
     * @see AnimationState#displayControl
     * @see AnimationState#name
     * @see AnimationState#group
     */
    @Nullable
    public String displayController;
    /**
     * @readonly
     */
    public SlotData slotData;
    /**
     * @private
     */
    protected boolean _displayDirty;
    /**
     * @private
     */
    protected boolean _zOrderDirty;
    /**
     * @private
     */
    protected boolean _visibleDirty;
    /**
     * @private
     */
    protected boolean _blendModeDirty;
    /**
     * @private
     */
    public boolean _colorDirty;
    /**
     * @private
     */
    public boolean _meshDirty;
    /**
     * @private
     */
    protected boolean _transformDirty;
    /**
     * @private
     */
    protected boolean _visible;
    /**
     * @private
     */
    protected BlendMode _blendMode;
    /**
     * @private
     */
    protected int _displayIndex;
    /**
     * @private
     */
    protected float _animationDisplayIndex;
    /**
     * @private
     */
    public float _zOrder;
    /**
     * @private
     */
    protected int _cachedFrameIndex;
    /**
     * @private
     */
    public float _pivotX;
    /**
     * @private
     */
    public float _pivotY;
    /**
     * @private
     */
    protected final Matrix _localMatrix = new Matrix();
    /**
     * @private
     */
    public final ColorTransform _colorTransform = new ColorTransform();
    /**
     * @private
     */
    public final FloatArray _ffdVertices = new FloatArray();
    /**
     * @private
     */
    public final Array<DisplayData> _displayDatas = new Array<>();
    /**
     * @private
     */
    // ArrayList<Armature | any>
    protected final Array<Object> _displayList = new Array<>();
    /**
     * @private
     */
    protected final Array<Bone> _meshBones = new Array<>();
    /**
     * @internal
     * @private
     */
    public Array<DisplayData> _rawDisplayDatas = new Array<>();
    /**
     * @private
     */
    @Nullable
    protected DisplayData _displayData;
    /**
     * @private
     */
    @Nullable
    protected TextureData _textureData;
    /**
     * @private
     */
    @Nullable
    public MeshDisplayData _meshData;
    /**
     * @private
     */
    @Nullable
    protected BoundingBoxData _boundingBoxData;
    /**
     * @private
     */
    protected Object _rawDisplay = null; // Initial value.
    /**
     * @private
     */
    protected Object _meshDisplay = null; // Initial value.
    /**
     * @private
     */
    protected Object _display;
    /**
     * @private
     */
    @Nullable
    protected Armature _childArmature;
    /**
     * @internal
     * @private
     */
    @Nullable
    public IntArray _cachedFrameIndices;

    /**
     * @private
     */
    protected void _onClear() {
        super._onClear();

        Array<Object> disposeDisplayList = new Array<>();
        for (Object eachDisplay : this._displayList) {
            if (
                    eachDisplay != null && eachDisplay != this._rawDisplay && eachDisplay != this._meshDisplay &&
                            disposeDisplayList.indexOf(eachDisplay) < 0
                    ) {
                disposeDisplayList.add(eachDisplay);
            }
        }

        for (Object eachDisplay : disposeDisplayList) {
            if (eachDisplay instanceof Armature) {
                ((Armature) eachDisplay).dispose();
            } else {
                this._disposeDisplay(eachDisplay);
            }
        }

        if (this._meshDisplay != null && this._meshDisplay != this._rawDisplay) { // May be _meshDisplay and _rawDisplay is the same one.
            this._disposeDisplay(this._meshDisplay);
        }

        if (this._rawDisplay != null) {
            this._disposeDisplay(this._rawDisplay);
        }

        this.displayController = null;
        this.slotData = null; //

        this._displayDirty = false;
        this._zOrderDirty = false;
        this._blendModeDirty = false;
        this._colorDirty = false;
        this._meshDirty = false;
        this._transformDirty = false;
        this._visible = true;
        this._blendMode = BlendMode.Normal;
        this._displayIndex = -1;
        this._animationDisplayIndex = -1;
        this._zOrder = 0;
        this._cachedFrameIndex = -1;
        this._pivotX = 0f;
        this._pivotY = 0f;
        this._localMatrix.identity();
        this._colorTransform.identity();
        this._ffdVertices.clear();
        this._displayList.clear();
        this._displayDatas.clear();
        this._meshBones.clear();
        this._rawDisplayDatas = null; //
        this._displayData = null;
        this._textureData = null;
        this._meshData = null;
        this._boundingBoxData = null;
        this._rawDisplay = null;
        this._meshDisplay = null;
        this._display = null;
        this._childArmature = null;
        this._cachedFrameIndices = null;
    }

    /**
     * @private
     */
    protected abstract void _initDisplay(Object value);

    /**
     * @private
     */
    protected abstract void _disposeDisplay(Object value);

    /**
     * @private
     */
    protected abstract void _onUpdateDisplay();

    /**
     * @private
     */
    protected abstract void _addDisplay();

    /**
     * @private
     */
    protected abstract void _replaceDisplay(Object value);

    /**
     * @private
     */
    protected abstract void _removeDisplay();

    /**
     * @private
     */
    protected abstract void _updateZOrder();

    /**
     * @private
     */
    public abstract void _updateVisible();

    /**
     * @private
     */
    protected abstract void _updateBlendMode();

    /**
     * @private
     */
    protected abstract void _updateColor();

    /**
     * @private
     */
    protected abstract void _updateFrame();

    /**
     * @private
     */
    protected abstract void _updateMesh();

    /**
     * @private
     */
    protected abstract void _updateTransform(boolean isSkinnedMesh);

    /**
     * @private
     */
    protected void _updateDisplayData() {
        final DisplayData prevDisplayData = this._displayData;
        final TextureData prevTextureData = this._textureData;
        final MeshDisplayData prevMeshData = this._meshData;
        final DisplayData rawDisplayData = this._displayIndex >= 0 && this._displayIndex < this._rawDisplayDatas.size() ? this._rawDisplayDatas.get(this._displayIndex) : null;

        if (this._displayIndex >= 0 && this._displayIndex < this._displayDatas.size()) {
            this._displayData = this._displayDatas.get(this._displayIndex);
        } else {
            this._displayData = null;
        }

        // Update texture and mesh data.
        if (this._displayData != null) {
            if (this._displayData.type == DisplayType.Image || this._displayData.type == DisplayType.Mesh) {
                this._textureData = ((ImageDisplayData) this._displayData).texture;
                if (this._displayData.type == DisplayType.Mesh) {
                    this._meshData = (MeshDisplayData) this._displayData;
                } else if (rawDisplayData != null && rawDisplayData.type == DisplayType.Mesh) {
                    this._meshData = (MeshDisplayData) rawDisplayData;
                } else {
                    this._meshData = null;
                }
            } else {
                this._textureData = null;
                this._meshData = null;
            }
        } else {
            this._textureData = null;
            this._meshData = null;
        }

        // Update bounding box data.
        if (this._displayData != null && this._displayData.type == DisplayType.BoundingBox) {
            this._boundingBoxData = ((BoundingBoxDisplayData) this._displayData).boundingBox;
        } else if (rawDisplayData != null && rawDisplayData.type == DisplayType.BoundingBox) {
            this._boundingBoxData = ((BoundingBoxDisplayData) rawDisplayData).boundingBox;
        } else {
            this._boundingBoxData = null;
        }

        if (this._displayData != prevDisplayData || this._textureData != prevTextureData || this._meshData != prevMeshData) {
            // Update pivot offset.
            if (this._meshData != null) {
                this._pivotX = 0f;
                this._pivotY = 0f;
            } else if (this._textureData != null) {
                final ImageDisplayData imageDisplayData = (ImageDisplayData) this._displayData;
                float scale = this._armature.armatureData.scale;
                Rectangle frame = this._textureData.frame;

                this._pivotX = imageDisplayData.pivot.x;
                this._pivotY = imageDisplayData.pivot.y;

                Rectangle rect = frame != null ? frame : this._textureData.region;
                float width = rect.width * scale;
                float height = rect.height * scale;

                if (this._textureData.rotated && frame == null) {
                    width = rect.height;
                    height = rect.width;
                }

                this._pivotX *= width;
                this._pivotY *= height;

                if (frame != null) {
                    this._pivotX += frame.x * scale;
                    this._pivotY += frame.y * scale;
                }
            } else {
                this._pivotX = 0f;
                this._pivotY = 0f;
            }

            // Update mesh bones and ffd vertices.
            if (this._meshData != prevMeshData) {
                if (this._meshData != null) { // && this._meshData == this._displayData
                    if (this._meshData.weight != null) {
                        this._ffdVertices.setLength(this._meshData.weight.count * 2);
                        this._meshBones.setLength(this._meshData.weight.bones.size());

                        for (int i = 0, l = this._meshBones.size(); i < l; ++i) {
                            this._meshBones.set(i, this._armature.getBone(this._meshData.weight.bones.get(i).name));
                        }
                    } else {
                        int vertexCount = this._meshData.parent.parent.intArray.get(this._meshData.offset + BinaryOffset.MeshVertexCount.v);
                        this._ffdVertices.setLength(vertexCount * 2);
                        this._meshBones.clear();
                    }

                    for (int i = 0, l = this._ffdVertices.size(); i < l; ++i) {
                        this._ffdVertices.set(i, 0f);
                    }

                    this._meshDirty = true;
                } else {
                    this._ffdVertices.clear();
                    this._meshBones.clear();
                }
            } else if (this._meshData != null && this._textureData != prevTextureData) { // Update mesh after update frame.
                this._meshDirty = true;
            }

            if (this._displayData != null && rawDisplayData != null && this._displayData != rawDisplayData && this._meshData == null) {
                rawDisplayData.transform.toMatrix(Slot._helpMatrix);
                Slot._helpMatrix.invert();
                Slot._helpMatrix.transformPoint(0f, 0f, Slot._helpPoint);
                this._pivotX -= Slot._helpPoint.x;
                this._pivotY -= Slot._helpPoint.y;

                this._displayData.transform.toMatrix(Slot._helpMatrix);
                Slot._helpMatrix.invert();
                Slot._helpMatrix.transformPoint(0f, 0f, Slot._helpPoint);
                this._pivotX += Slot._helpPoint.x;
                this._pivotY += Slot._helpPoint.y;
            }

            // Update original transform.
            if (rawDisplayData != null) {
                this.origin = rawDisplayData.transform;
            } else if (this._displayData != null) {
                this.origin = this._displayData.transform;
            }

            this._displayDirty = true;
            this._transformDirty = true;
        }
    }

    /**
     * @private
     */
    protected void _updateDisplay() {
        Object prevDisplay = this._display != null ? this._display : this._rawDisplay;
        Armature prevChildArmature = this._childArmature;

        // Update display and child armature.
        if (this._displayIndex >= 0 && this._displayIndex < this._displayList.size()) {
            this._display = this._displayList.get(this._displayIndex);
            if (this._display != null && this._display instanceof Armature) {
                this._childArmature = (Armature) this._display;
                this._display = this._childArmature.getDisplay();
            } else {
                this._childArmature = null;
            }
        } else {
            this._display = null;
            this._childArmature = null;
        }

        // Update display.
        Object currentDisplay = this._display != null ? this._display : this._rawDisplay;
        if (currentDisplay != prevDisplay) {
            this._onUpdateDisplay();
            this._replaceDisplay(prevDisplay);

            this._visibleDirty = true;
            this._blendModeDirty = true;
            this._colorDirty = true;
        }

        // Update frame.
        if (currentDisplay == this._rawDisplay || currentDisplay == this._meshDisplay) {
            this._updateFrame();
        }

        // Update child armature.
        if (this._childArmature != prevChildArmature) {
            if (prevChildArmature != null) {
                prevChildArmature._parent = null; // Update child armature parent.
                prevChildArmature.setClock(null);
                if (prevChildArmature.inheritAnimation) {
                    prevChildArmature.getAnimation().reset();
                }
            }

            if (this._childArmature != null) {
                this._childArmature._parent = this; // Update child armature parent.
                this._childArmature.setClock(this._armature.getClock());
                if (this._childArmature.inheritAnimation) { // Set child armature cache frameRate.
                    if (this._childArmature.getCacheFrameRate() == 0) {
                        float cacheFrameRate = this._armature.getCacheFrameRate();
                        if (cacheFrameRate != 0) {
                            this._childArmature.setCacheFrameRate(cacheFrameRate);
                        }
                    }

                    // Child armature action.
                    Array<ActionData> actions = null;
                    if (this._displayData != null && this._displayData.type == DisplayType.Armature) {
                        actions = ((ArmatureDisplayData) this._displayData).actions;
                    } else {
                        DisplayData rawDisplayData = this._displayIndex >= 0 && this._displayIndex < this._rawDisplayDatas.size() ? this._rawDisplayDatas.get(this._displayIndex) : null;
                        if (rawDisplayData != null && rawDisplayData.type == DisplayType.Armature) {
                            actions = ((ArmatureDisplayData) rawDisplayData).actions;
                        }
                    }

                    if (actions != null && actions.size() > 0) {
                        for (ActionData action : actions) {
                            this._childArmature._bufferAction(action, false); // Make sure default action at the beginning.
                        }
                    } else {
                        this._childArmature.getAnimation().play();
                    }
                }
            }
        }
    }

    /**
     * @private
     */
    protected void _updateGlobalTransformMatrix(boolean isCache) {
        this.globalTransformMatrix.copyFrom(this._localMatrix);
        this.globalTransformMatrix.concat(this._parent.globalTransformMatrix);
        if (isCache) {
            this.global.fromMatrix(this.globalTransformMatrix);
        } else {
            this._globalDirty = true;
        }
    }

    /**
     * @private
     */
    protected boolean _isMeshBonesUpdate() {
        for (Bone bone : this._meshBones) {
            if (bone != null && bone._childrenTransformDirty) {
                return true;
            }
        }

        return false;
    }

    /**
     * @internal
     * @private
     */
    public void _setArmature(@Nullable Armature value) {
        if (this._armature == value) {
            return;
        }

        if (this._armature != null) {
            this._armature._removeSlotFromSlotList(this);
        }

        this._armature = value; //

        this._onUpdateDisplay();

        if (this._armature != null) {
            this._armature._addSlotToSlotList(this);
            this._addDisplay();
        } else {
            this._removeDisplay();
        }
    }

    public boolean _setDisplayIndex(int value) {
        return _setDisplayIndex(value, false);
    }

    /**
     * @internal
     * @private
     */
    public boolean _setDisplayIndex(int value, boolean isAnimation) {
        if (isAnimation) {
            if (this._animationDisplayIndex == value) {
                return false;
            }

            this._animationDisplayIndex = value;
        }

        if (this._displayIndex == value) {
            return false;
        }

        this._displayIndex = value;
        this._displayDirty = true;

        this._updateDisplayData();

        return this._displayDirty;
    }

    /**
     * @internal
     * @private
     */
    public boolean _setZorder(float value) {
        if (this._zOrder == value) {
            //return false;
        }

        this._zOrder = value;
        this._zOrderDirty = true;

        return this._zOrderDirty;
    }

    /**
     * @internal
     * @private
     */
    public boolean _setColor(ColorTransform value) {
        this._colorTransform.copyFrom(value);
        this._colorDirty = true;

        return this._colorDirty;
    }

    /**
     * @private
     */
    public boolean _setDisplayList(@Nullable Array<Object> value) {
        if (value != null && value.size() > 0) {
            if (this._displayList.size() != value.size()) {
                this._displayList.setLength(value.size());
            }

            for (int i = 0, l = value.size(); i < l; ++i) { // Retain input render displays.
                Object eachDisplay = value.get(i);
                if (
                        eachDisplay != null && eachDisplay != this._rawDisplay && eachDisplay != this._meshDisplay &&
                                !(eachDisplay instanceof Armature) && this._displayList.indexOf(eachDisplay) < 0
                        ) {
                    this._initDisplay(eachDisplay);
                }

                this._displayList.set(i, eachDisplay);
            }
        } else if (this._displayList.size() > 0) {
            this._displayList.clear();
        }

        if (this._displayIndex >= 0 && this._displayIndex < this._displayList.size()) {
            this._displayDirty = this._display != this._displayList.get(this._displayIndex);
        } else {
            this._displayDirty = this._display != null;
        }

        this._updateDisplayData();

        return this._displayDirty;
    }

    /**
     * @private
     */
    public void init(SlotData slotData, @Nullable Array<DisplayData> displayDatas, Object rawDisplay, Object meshDisplay) {
        if (this.slotData != null) {
            return;
        }

        this.slotData = slotData;
        this.name = this.slotData.name;

        this._visibleDirty = true;
        this._blendModeDirty = true;
        this._colorDirty = true;
        this._blendMode = this.slotData.blendMode;
        this._zOrder = this.slotData.zOrder;
        this._colorTransform.copyFrom(this.slotData.color);
        this._rawDisplayDatas = displayDatas;
        this._rawDisplay = rawDisplay;
        this._meshDisplay = meshDisplay;

        this._displayDatas.setLength(this._rawDisplayDatas.size());
        for (int i = 0, l = this._displayDatas.size(); i < l; ++i) {
            this._displayDatas.set(i, this._rawDisplayDatas.get(i));
        }
    }

    /**
     * @internal
     * @private
     */
    public void update(int cacheFrameIndex) {
        if (this._displayDirty) {
            this._displayDirty = false;
            this._updateDisplay();

            if (this._transformDirty) { // Update local matrix. (Only updated when both display and transform are dirty.)
                if (this.origin != null) {
                    this.global.copyFrom(this.origin).add(this.offset).toMatrix(this._localMatrix);
                } else {
                    this.global.copyFrom(this.offset).toMatrix(this._localMatrix);
                }
            }
        }

        if (this._zOrderDirty) {
            this._zOrderDirty = false;
            this._updateZOrder();
        }

        if (cacheFrameIndex >= 0 && this._cachedFrameIndices != null) {
            int cachedFrameIndex = this._cachedFrameIndices.get(cacheFrameIndex);
            if (cachedFrameIndex >= 0 && this._cachedFrameIndex == cachedFrameIndex) { // Same cache.
                this._transformDirty = false;
            } else if (cachedFrameIndex >= 0) { // Has been Cached.
                this._transformDirty = true;
                this._cachedFrameIndex = cachedFrameIndex;
            } else if (this._transformDirty || this._parent._childrenTransformDirty) { // Dirty.
                this._transformDirty = true;
                this._cachedFrameIndex = -1;
            } else if (this._cachedFrameIndex >= 0) { // Same cache, but not set index yet.
                this._transformDirty = false;
                this._cachedFrameIndices.set(cacheFrameIndex, this._cachedFrameIndex);
            } else { // Dirty.
                this._transformDirty = true;
                this._cachedFrameIndex = -1;
            }
        } else if (this._transformDirty || this._parent._childrenTransformDirty) { // Dirty.
            cacheFrameIndex = -1;
            this._transformDirty = true;
            this._cachedFrameIndex = -1;
        }

        if (this._display == null) {
            return;
        }

        if (this._blendModeDirty) {
            this._blendModeDirty = false;
            this._updateBlendMode();
        }

        if (this._colorDirty) {
            this._colorDirty = false;
            this._updateColor();
        }

        if (this._meshData != null && this._display == this._meshDisplay) {
            boolean isSkinned = this._meshData.weight != null;
            if (this._meshDirty || (isSkinned && this._isMeshBonesUpdate())) {
                this._meshDirty = false;
                this._updateMesh();
            }

            if (isSkinned) {
                if (this._transformDirty) {
                    this._transformDirty = false;
                    this._updateTransform(true);
                }

                return;
            }
        }

        if (this._transformDirty) {
            this._transformDirty = false;

            if (this._cachedFrameIndex < 0) {
                boolean isCache = cacheFrameIndex >= 0;
                this._updateGlobalTransformMatrix(isCache);

                if (isCache && this._cachedFrameIndices != null) {
                    int vv = this._armature.armatureData.setCacheFrame(this.globalTransformMatrix, this.global);
                    this._cachedFrameIndices.set(cacheFrameIndex, vv);
                    this._cachedFrameIndex = vv;
                }
            } else {
                this._armature.armatureData.getCacheFrame(this.globalTransformMatrix, this.global, this._cachedFrameIndex);
            }

            this._updateTransform(false);
        }
    }

    /**
     * @private
     */
    public void updateTransformAndMatrix() {
        if (this._transformDirty) {
            this._transformDirty = false;
            this._updateGlobalTransformMatrix(false);
        }
    }

    /**
     * 判断指定的点是否在插槽的自定义包围盒内。
     *
     * @param x 点的水平坐标。（骨架内坐标系）
     * @param y 点的垂直坐标。（骨架内坐标系）
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public boolean containsPoint(float x, float y) {
        if (this._boundingBoxData == null) {
            return false;
        }

        this.updateTransformAndMatrix();

        Slot._helpMatrix.copyFrom(this.globalTransformMatrix);
        Slot._helpMatrix.invert();
        Slot._helpMatrix.transformPoint(x, y, Slot._helpPoint);

        return this._boundingBoxData.containsPoint(Slot._helpPoint.x, Slot._helpPoint.y);
    }

    public float intersectsSegment(
            float xA, float yA, float xB, float yB
    ) {
        return intersectsSegment(xA, yA, xB, yB, null, null, null);
    }

    /**
     * 判断指定的线段与插槽的自定义包围盒是否相交。
     *
     * @param xA                 线段起点的水平坐标。（骨架内坐标系）
     * @param yA                 线段起点的垂直坐标。（骨架内坐标系）
     * @param xB                 线段终点的水平坐标。（骨架内坐标系）
     * @param yB                 线段终点的垂直坐标。（骨架内坐标系）
     * @param intersectionPointA 线段从起点到终点与包围盒相交的第一个交点。（骨架内坐标系）
     * @param intersectionPointB 线段从终点到起点与包围盒相交的第一个交点。（骨架内坐标系）
     * @param normalRadians      碰撞点处包围盒切线的法线弧度。 [x: 第一个碰撞点处切线的法线弧度, y: 第二个碰撞点处切线的法线弧度]
     * @returns 相交的情况。 [-1: 不相交且线段在包围盒内, 0: 不相交, 1: 相交且有一个交点且终点在包围盒内, 2: 相交且有一个交点且起点在包围盒内, 3: 相交且有两个交点, N: 相交且有 N 个交点]
     * @version DragonBones 5.0
     * @language zh_CN
     */
    public int intersectsSegment(
            float xA, float yA, float xB, float yB,
            @Nullable Point intersectionPointA,
            @Nullable Point intersectionPointB,
            @Nullable Point normalRadians
    ) {
        if (this._boundingBoxData == null) {
            return 0;
        }

        this.updateTransformAndMatrix();
        Slot._helpMatrix.copyFrom(this.globalTransformMatrix);
        Slot._helpMatrix.invert();
        Slot._helpMatrix.transformPoint(xA, yA, Slot._helpPoint);
        xA = Slot._helpPoint.x;
        yA = Slot._helpPoint.y;
        Slot._helpMatrix.transformPoint(xB, yB, Slot._helpPoint);
        xB = Slot._helpPoint.x;
        yB = Slot._helpPoint.y;

        int intersectionCount = this._boundingBoxData.intersectsSegment(xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians);
        if (intersectionCount > 0) {
            if (intersectionCount == 1 || intersectionCount == 2) {
                if (intersectionPointA != null) {
                    this.globalTransformMatrix.transformPoint(intersectionPointA.x, intersectionPointA.y, intersectionPointA);
                    if (intersectionPointB != null) {
                        intersectionPointB.x = intersectionPointA.x;
                        intersectionPointB.y = intersectionPointA.y;
                    }
                } else if (intersectionPointB != null) {
                    this.globalTransformMatrix.transformPoint(intersectionPointB.x, intersectionPointB.y, intersectionPointB);
                }
            } else {
                if (intersectionPointA != null) {
                    this.globalTransformMatrix.transformPoint(intersectionPointA.x, intersectionPointA.y, intersectionPointA);
                }

                if (intersectionPointB != null) {
                    this.globalTransformMatrix.transformPoint(intersectionPointB.x, intersectionPointB.y, intersectionPointB);
                }
            }

            if (normalRadians != null) {
                this.globalTransformMatrix.transformPoint((float)Math.cos(normalRadians.x), (float)Math.sin(normalRadians.x), Slot._helpPoint, true);
                normalRadians.x = (float)Math.atan2(Slot._helpPoint.y, Slot._helpPoint.x);

                this.globalTransformMatrix.transformPoint((float)Math.cos(normalRadians.y), (float)Math.sin(normalRadians.y), Slot._helpPoint, true);
                normalRadians.y = (float)Math.atan2(Slot._helpPoint.y, Slot._helpPoint.x);
            }
        }

        return intersectionCount;
    }

    /**
     * 在下一帧更新显示对象的状态。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public void invalidUpdate() {
        this._displayDirty = true;
        this._transformDirty = true;
    }

    /**
     * 此时显示的显示对象在显示列表中的索引。
     *
     * @version DragonBones 4.5
     * @language zh_CN
     */
    public int getDisplayIndex() {
        return this._displayIndex;
    }

    public void setDisplayIndex(int value) {
        if (this._setDisplayIndex(value)) {
            this.update(-1);
        }
    }

    /**
     * 包含显示对象或子骨架的显示列表。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Array<Object> getDisplayList() {
        return this._displayList.copy();
    }

    public void setDisplayList(Array<Object> value) {
        Array<Object> backupDisplayList = this._displayList.copy(); // Copy.
        Array<Object> disposeDisplayList = new Array<Object>();

        if (this._setDisplayList(value)) {
            this.update(-1);
        }

        // Release replaced displays.
        for (Object eachDisplay : backupDisplayList) {
            if (
                    eachDisplay != null && eachDisplay != this._rawDisplay && eachDisplay != this._meshDisplay &&
                            this._displayList.indexOf(eachDisplay) < 0 &&
                            disposeDisplayList.indexOf(eachDisplay) < 0
                    ) {
                disposeDisplayList.add(eachDisplay);
            }
        }

        for (Object eachDisplay : disposeDisplayList) {
            if (eachDisplay instanceof Armature) {
                ((Armature) eachDisplay).dispose();
            } else {
                this._disposeDisplay(eachDisplay);
            }
        }
    }

    /**
     * @language zh_CN
     * 插槽此时的自定义包围盒数据。
     * @version DragonBones 3.0
     * @see Armature
     */
    @Nullable
    public BoundingBoxData getBoundingBoxData() {
        return this._boundingBoxData;
    }

    /**
     * @private
     */
    public Object getRawDisplay() {
        return this._rawDisplay;
    }

    /**
     * @private
     */
    public Object getMeshDisplay() {
        return this._meshDisplay;
    }

    public void setDisplay(Object value) {
        if (this._display == value) {
            return;
        }

        int displayListLength = this._displayList.size();
        if (this._displayIndex < 0 && displayListLength == 0) {  // Emprty.
            this._displayIndex = 0;
        }

        if (this._displayIndex < 0) {
            return;
        } else {
            Array<Object> replaceDisplayList = this.getDisplayList(); // Copy.
            if (displayListLength <= this._displayIndex) {
                replaceDisplayList.setLength(this._displayIndex + 1);
            }

            replaceDisplayList.set(this._displayIndex, value);
            this.setDisplayList(replaceDisplayList);
        }
    }

    /**
     * 此时显示的子骨架。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     * @see Armature
     */
    @Nullable
    public Armature getChildArmature() {
        return this._childArmature;
    }

    public void setChildArmature(@Nullable Armature value) {
        if (this._childArmature == value) {
            return;
        }

        this.setDisplay(value);
    }

    /**
     * 此时显示的显示对象。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    //@Override
    public Object getDisplay() {
        return this._display;
    }

    ///**
    // * @see #display
    // * @deprecated 已废弃，请参考 @see
    // */
    //public Object getDisplay() {
    //    return this._display;
    //}

    ///**
    // * @see #display
    // * @deprecated 已废弃，请参考 @see
    // */
    //public void setDisplay(Object value) {
    //   this._display = value;
    //
}
