package com.dragonbones.libgdx;

import com.dragonbones.armature.Bone;
import com.dragonbones.armature.Slot;
import com.dragonbones.core.BaseObject;
import com.dragonbones.core.BinaryOffset;
import com.dragonbones.core.BlendMode;
import com.dragonbones.geom.Matrix;
import com.dragonbones.libgdx.compat.*;
import com.dragonbones.model.DragonBonesData;
import com.dragonbones.model.MeshDisplayData;
import com.dragonbones.model.WeightData;
import com.dragonbones.util.Array;
import com.dragonbones.util.FloatArray;
import com.dragonbones.util.IntArray;
import com.dragonbones.util.ShortArray;

/**
 * Egret 插槽。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 */
public class GdxSlot extends Slot {
    /**
     * 是否更新显示对象的变换属性。
     * 为了更好的性能, 并不会更新 display 的变换属性 (x, y, rotation, scaleX, scaleX), 如果需要正确访问这些属性, 则需要设置为 true 。
     *
     * @default false
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public boolean transformUpdateEnabled = false;

    private EgretDisplayObject _renderDisplay = null;
    private EgretColorMatrixFilter _colorFilter = null;

    /**
     * @private
     */
    protected void _onClear() {
        super._onClear();

        this._renderDisplay = null; //
        this._colorFilter = null;
    }

    /**
     * @private
     */
    protected void _initDisplay(Object value) {
        //value;
    }

    /**
     * @private
     */
    protected void _disposeDisplay(Object value) {
        //value;
    }

    /**
     * @private
     */
    protected void _onUpdateDisplay() {
        this._renderDisplay = (EgretDisplayObject) (this._display != null ? this._display : this._rawDisplay);
    }

    /**
     * @private
     */
    protected void _addDisplay() {
        GdxArmatureDisplay container = (GdxArmatureDisplay) this._armature.getDisplay();
        container.addChild(this._renderDisplay);
    }

    /**
     * @private
     */
    protected void _replaceDisplay(Object value) {
        GdxArmatureDisplay container = (GdxArmatureDisplay) this._armature.getDisplay();
        EgretDisplayObject prevDisplay = (EgretDisplayObject) value;
        container.addChild(this._renderDisplay);
        container.swapChildren(this._renderDisplay, prevDisplay);
        container.removeChild(prevDisplay);
    }

    /**
     * @private
     */
    protected void _removeDisplay()

    {
        this._renderDisplay.getParent().removeChild(this._renderDisplay);
    }

    /**
     * @private
     */
    protected void _updateZOrder()

    {
        GdxArmatureDisplay container = (GdxArmatureDisplay) this._armature.getDisplay();
        int index = container.getChildIndex(this._renderDisplay);
        if (index == this._zOrder) {
            return;
        }

        container.addChildAt(this._renderDisplay, this._zOrder);
    }

    /**
     * @internal
     * @private
     */
    public void _updateVisible()

    {
        this._renderDisplay.visible = this._parent.getVisible();
    }

    /**
     * @private
     */
    protected void _updateBlendMode()

    {
        switch (this._blendMode) {
            case Normal:
                this._renderDisplay.blendMode = BlendMode.Normal;
                break;

            case Add:
                this._renderDisplay.blendMode = BlendMode.Add;
                break;

            case Erase:
                this._renderDisplay.blendMode = BlendMode.Erase;
                break;

            default:
                break;
        }
    }

    /**
     * @private
     */
    protected void _updateColor() {
        if (
                this._colorTransform.redMultiplier != 1.0 ||
                        this._colorTransform.greenMultiplier != 1.0 ||
                        this._colorTransform.blueMultiplier != 1.0 ||
                        this._colorTransform.redOffset != 0 ||
                        this._colorTransform.greenOffset != 0 ||
                        this._colorTransform.blueOffset != 0 ||
                        this._colorTransform.alphaOffset != 0
                ) {
            if (this._colorFilter == null) {
                this._colorFilter = new EgretColorMatrixFilter();
            }

            float[] colorMatrix = this._colorFilter.matrix;
            colorMatrix[0] = this._colorTransform.redMultiplier;
            colorMatrix[6] = this._colorTransform.greenMultiplier;
            colorMatrix[12] = this._colorTransform.blueMultiplier;
            colorMatrix[18] = this._colorTransform.alphaMultiplier;
            colorMatrix[4] = this._colorTransform.redOffset;
            colorMatrix[9] = this._colorTransform.greenOffset;
            colorMatrix[14] = this._colorTransform.blueOffset;
            colorMatrix[19] = this._colorTransform.alphaOffset;
            this._colorFilter.matrix = colorMatrix;

            Array<EgretFilter> filters = this._renderDisplay.filters;
            if (filters == null) { // null or undefined?
                filters = new Array<>();
            }

            if (filters.indexOf(this._colorFilter) < 0) {
                filters.push(this._colorFilter);
            }

            this._renderDisplay.$setAlpha(1.0);
            this._renderDisplay.filters = filters;
        } else {
            if (this._colorFilter != null) {
                this._colorFilter = null;
                this._renderDisplay.filters = null;
            }

            this._renderDisplay.$setAlpha(this._colorTransform.alphaMultiplier);
        }
    }

    /**
     * @private
     */
    protected void _updateFrame() {
        MeshDisplayData meshData = this._display == this._meshDisplay ? this._meshData : null;
        GdxTextureData currentTextureData = (GdxTextureData) this._textureData;

        if (this._displayIndex >= 0 && this._display != null && currentTextureData != null) {
            if (this._armature.getReplacedTexture() != null && this._rawDisplayDatas.indexOf(this._displayData) >= 0) { // Update replaced texture atlas.
                GdxTextureAtlasData currentTextureAtlasData = (GdxTextureAtlasData) currentTextureData.parent;
                if (this._armature._replaceTextureAtlasData == null) {
                    currentTextureAtlasData = BaseObject.borrowObject(GdxTextureAtlasData.class);
                    currentTextureAtlasData.copyFrom(currentTextureData.parent);
                    currentTextureAtlasData.setRenderTexture((EgretTexture) this._armature.getReplacedTexture());
                    this._armature._replaceTextureAtlasData = currentTextureAtlasData;
                } else {
                    currentTextureAtlasData = (GdxTextureAtlasData) this._armature._replaceTextureAtlasData;
                }

                currentTextureData = (GdxTextureData) currentTextureAtlasData.getTexture(currentTextureData.name);
            }

            if (currentTextureData.renderTexture != null) {
                if (meshData != null) { // Mesh.
                    DragonBonesData data = meshData.parent.parent;
                    ShortArray intArray = data.intArray;
                    FloatArray floatArray = data.floatArray;
                    int vertexCount = intArray.get(meshData.offset + BinaryOffset.MeshVertexCount.v);
                    int triangleCount = intArray.get(meshData.offset + BinaryOffset.MeshTriangleCount.v);
                    int verticesOffset = intArray.get(meshData.offset + BinaryOffset.MeshFloatOffset.v);
                    int uvOffset = verticesOffset + vertexCount * 2;

                    EgretMesh meshDisplay = (EgretMesh) this._renderDisplay;
                    EgretSysMeshNode meshNode = meshDisplay.$renderNode;

                    meshNode.uvs.setLength(vertexCount * 2);
                    meshNode.vertices.setLength(vertexCount * 2);
                    meshNode.indices.setLength(triangleCount * 3);

                    for (int i = 0, l = vertexCount * 2; i < l; ++i) {
                        meshNode.vertices.set(i, floatArray.get(verticesOffset + i));
                        meshNode.uvs.set(i, floatArray.get(uvOffset + i));
                    }

                    for (int i = 0; i < triangleCount * 3; ++i) {
                        meshNode.indices.set(i, intArray.get(meshData.offset + BinaryOffset.MeshVertexIndices.v + i));
                    }

                    meshDisplay.texture = currentTextureData.renderTexture;
                    meshDisplay.$setAnchorOffsetX(this._pivotX);
                    meshDisplay.$setAnchorOffsetY(this._pivotY);
                    meshDisplay.$updateVertices();
                } else { // Normal texture.
                    EgretBitmap normalDisplay = (EgretBitmap) this._renderDisplay;
                    normalDisplay.texture = currentTextureData.renderTexture;
                    normalDisplay.$setAnchorOffsetX(this._pivotX);
                    normalDisplay.$setAnchorOffsetY(this._pivotY);
                }

                return;
            }
        }

        if (meshData != null) {
            EgretMesh meshDisplay = (EgretMesh) this._renderDisplay;
            meshDisplay.texture = null;
            meshDisplay.x = 0.0;
            meshDisplay.y = 0.0;
        } else {
            EgretBitmap normalDisplay = (EgretBitmap) this._renderDisplay;
            normalDisplay.texture = null;
            normalDisplay.x = 0.0;
            normalDisplay.y = 0.0;
        }
    }

    /**
     * @private
     */
    protected void _updateMesh() {
        boolean hasFFD = this._ffdVertices.size() > 0;
        MeshDisplayData meshData = (MeshDisplayData) this._meshData;
        WeightData weightData = meshData.weight;
        EgretMesh meshDisplay = (EgretMesh) this._renderDisplay;
        EgretSysMeshNode meshNode = meshDisplay.$renderNode;

        if (weightData != null) {
            DragonBonesData data = meshData.parent.parent;
            ShortArray intArray = data.intArray;
            FloatArray floatArray = data.floatArray;
            int vertexCount = intArray.get(meshData.offset + BinaryOffset.MeshVertexCount.v);
            int weightFloatOffset = intArray.get(weightData.offset + BinaryOffset.WeigthFloatOffset.v);

            for (
                    int i = 0, iD = 0, iB = weightData.offset + BinaryOffset.WeigthBoneIndices.v + weightData.bones.size(), iV = weightFloatOffset, iF = 0;
                    i < vertexCount;
                    ++i
                    ) {
                int boneCount = intArray.get(iB++);
                float xG = 0.0f, yG = 0.0f;
                for (int j = 0; j < boneCount; ++j) {
                    int boneIndex = intArray.get(iB++);
                    Bone bone = this._meshBones.get(boneIndex);
                    if (bone != null) {
                        Matrix matrix = bone.globalTransformMatrix;
                        float weight = floatArray.get(iV++);
                        float xL = floatArray.get(iV++);
                        float yL = floatArray.get(iV++);

                        if (hasFFD) {
                            xL += this._ffdVertices.get(iF++);
                            yL += this._ffdVertices.get(iF++);
                        }

                        xG += (matrix.a * xL + matrix.c * yL + matrix.tx) * weight;
                        yG += (matrix.b * xL + matrix.d * yL + matrix.ty) * weight;
                    }
                }

                meshNode.vertices.set(iD++, xG);
                meshNode.vertices.set(iD++, yG);
            }

            meshDisplay.$updateVertices();
        } else if (hasFFD) {
            DragonBonesData data = meshData.parent.parent;
            IntArray intArray = data.intArray;
            FloatArray floatArray = data.floatArray;
            int vertexCount = intArray.get(meshData.offset + BinaryOffset.MeshVertexCount.v);
            int vertexOffset = intArray.get(meshData.offset + BinaryOffset.MeshFloatOffset.v);

            for (int i = 0, l = vertexCount * 2; i < l; ++i) {
                meshNode.vertices.set(i, floatArray.get(vertexOffset + i) + this._ffdVertices.get(i));
            }

            meshDisplay.$updateVertices();
        }
    }

    /**
     * @private
     */
    protected void _updateTransform(boolean isSkinnedMesh) {
        if (isSkinnedMesh) { // Identity transform.
            Matrix transformationMatrix = this._renderDisplay.getMatrix();
            transformationMatrix.identity();
            this._renderDisplay.$setMatrix(transformationMatrix, this.transformUpdateEnabled);
        } else {
            Matrix globalTransformMatrix = this.globalTransformMatrix;
            this._renderDisplay.$setMatrix(globalTransformMatrix, this.transformUpdateEnabled);
        }
    }
}