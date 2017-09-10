package com.dragonbones.parser;

import com.dragonbones.core.*;
import com.dragonbones.factory.BaseFactory;
import com.dragonbones.geom.ColorTransform;
import com.dragonbones.geom.Matrix;
import com.dragonbones.geom.Point;
import com.dragonbones.geom.Transform;
import com.dragonbones.model.*;
import com.dragonbones.util.*;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.*;

import static com.dragonbones.util.Dynamic.*;

/**
 * @private
 */
public class ObjectDataParser extends DataParser {

    /**
     * @private
     */

    private IntArray _intArrayJson = new IntArray();
    private FloatArray _floatArrayJson = new FloatArray();
    private IntArray _frameIntArrayJson = new IntArray();
    private FloatArray _frameFloatArrayJson = new FloatArray();
    private FloatArray _frameArrayJson = new FloatArray();
    private FloatArray _timelineArrayJson = new FloatArray();

    private ShortArray _intArrayBuffer;
    private FloatArray _floatArrayBuffer;
    private ShortArray _frameIntArrayBuffer;
    private FloatArray _frameFloatArrayBuffer;
    private ShortArray _frameArrayBuffer;
    private CharArray _timelineArrayBuffer;

    public ObjectDataParser() {
    }

    protected int _rawTextureAtlasIndex = 0;
    protected final Array<BoneData> _rawBones = new Array<>();
    protected DragonBonesData _data = null; //
    protected ArmatureData _armature = null; //
    protected BoneData _bone = null; //
    protected SlotData _slot = null; //
    protected SkinData _skin = null; //
    protected MeshDisplayData _mesh = null; //
    protected AnimationData _animation = null; //
    protected TimelineData _timeline = null; //
    protected Array<Object> _rawTextureAtlases = null;

    private int _defalultColorOffset = -1;
    private float _prevTweenRotate = 0;
    private float _prevRotation = 0f;
    private final Matrix _helpMatrixA = new Matrix();

    private final Matrix _helpMatrixB = new Matrix();

    private final Transform _helpTransform = new Transform();

    private final ColorTransform _helpColorTransform = new ColorTransform();

    private final Point _helpPoint = new Point();

    private final FloatArray _helpArray = new FloatArray();
    private final Array<ActionFrame> _actionFrames = new Array<>();
    private final Map<String, FloatArray> _weightSlotPose = new HashMap<>();

    private Map<String, FloatArray> _weightBonePoses = new HashMap<>();
    private final Map<String, IntArray> _weightBoneIndices = new HashMap<>();

    private final Map<String, Array<BoneData>> _cacheBones = new HashMap<>();
    private final Map<String, MeshDisplayData> _meshs = new HashMap<>();
    private final Map<String, Array<ActionData>> _slotChildActions = new HashMap<>();

    // private readonly _intArray: Array<number> = [];
    // private readonly _floatArray: Array<number> = [];
    // private readonly _frameIntArray: Array<number> = [];
    // private readonly _frameFloatArray: Array<number> = [];
    // private readonly _frameArray: Array<number> = [];
    // private readonly _timelineArray: Array<number> = [];

    /**
     * @private
     */
    private void _getCurvePoint(float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4, float t, Point result)

    {
        float l_t = 1f - t;
        float powA = l_t * l_t;
        float powB = t * t;
        float kA = l_t * powA;
        float kB = (float) (3.0 * t * powA);
        float kC = (float) (3.0 * l_t * powB);
        float kD = t * powB;

        result.x = kA * x1 + kB * x2 + kC * x3 + kD * x4;
        result.y = kA * y1 + kB * y2 + kC * y3 + kD * y4;
    }

    /**
     * @private
     */
    private void _samplingEasingCurve(FloatArray curve, FloatArray samples)

    {
        int curveCount = curve.length();
        int stepIndex = -2;
        for (int i = 0, l = samples.length(); i < l; ++i) {
            int t = (i + 1) / (l + 1);
            while ((stepIndex + 6 < curveCount ? curve.get(stepIndex + 6) : 1) < t) { // stepIndex + 3 * 2
                stepIndex += 6;
            }

            boolean isInCurve = stepIndex >= 0 && stepIndex + 6 < curveCount;
            float x1 = isInCurve ? curve.get(stepIndex) : 0f;
            float y1 = isInCurve ? curve.get(stepIndex + 1) : 0f;
            float x2 = curve.get(stepIndex + 2);
            float y2 = curve.get(stepIndex + 3);
            float x3 = curve.get(stepIndex + 4);
            float y3 = curve.get(stepIndex + 5);
            float x4 = isInCurve ? curve.get(stepIndex + 6) : 1f;
            float y4 = isInCurve ? curve.get(stepIndex + 7) : 1f;

            float lower = 0f;
            float higher = 1f;
            while (higher - lower > 0.0001) {
                float percentage = (higher + lower) * 0.5f;
                this._getCurvePoint(x1, y1, x2, y2, x3, y3, x4, y4, percentage, this._helpPoint);
                if (t - this._helpPoint.x > 0f) {
                    lower = percentage;
                } else {
                    higher = percentage;
                }
            }

            samples.set(i, this._helpPoint.y);
        }
    }

    private int _sortActionFrame(ActionFrame a, ActionFrame b)

    {
        return a.frameStart > b.frameStart ? 1 : -1;
    }

    private void _parseActionDataInFrame(Object rawData, int frameStart, @Nullable BoneData bone, @Nullable SlotData slot)

    {
        if (in(rawData, ObjectDataParser.EVENT)) {
            this._mergeActionFrame(get(rawData, ObjectDataParser.EVENT), frameStart, ActionType.Frame, bone, slot);
        }

        if (in(rawData, ObjectDataParser.SOUND)) {
            this._mergeActionFrame(get(rawData, ObjectDataParser.SOUND), frameStart, ActionType.Sound, bone, slot);
        }

        if (in(rawData, ObjectDataParser.ACTION)) {
            this._mergeActionFrame(get(rawData, ObjectDataParser.ACTION), frameStart, ActionType.Play, bone, slot);
        }

        if (in(rawData, ObjectDataParser.EVENTS)) {
            this._mergeActionFrame(get(rawData, ObjectDataParser.EVENTS), frameStart, ActionType.Frame, bone, slot);
        }

        if (in(rawData, ObjectDataParser.ACTIONS)) {
            this._mergeActionFrame(get(rawData, ObjectDataParser.ACTIONS), frameStart, ActionType.Play, bone, slot);
        }
    }

    private void _mergeActionFrame(Object rawData, int frameStart, ActionType type, @Nullable BoneData bone, @Nullable SlotData slot)

    {
        int actionOffset = this._armature.actions.size();
        int actionCount = this._parseActionData(rawData, this._armature.actions, type, bone, slot);
        ActionFrame frame = null;

        if (this._actionFrames.size() == 0) { // First frame.
            frame = new ActionFrame();
            frame.frameStart = 0;
            this._actionFrames.add(frame);
            frame = null;
        }

        for (ActionFrame eachFrame : this._actionFrames) { // Get same frame.
            if (eachFrame.frameStart == frameStart) {
                frame = eachFrame;
                break;
            }
        }

        if (frame == null) { // Create and cache frame.
            frame = new ActionFrame();
            frame.frameStart = frameStart;
            this._actionFrames.add(frame);
        }

        for (int i = 0; i < actionCount; ++i) { // Cache action offsets.
            frame.actions.push(actionOffset + i);
        }
    }

    private int _parseCacheActionFrame(ActionFrame frame)

    {
        ShortArray frameArray = (this._data.frameArray);
        int frameOffset = frameArray.length();
        int actionCount = frame.actions.size();
        frameArray.incrementLength(1 + 1 + actionCount);
        frameArray.set(frameOffset + BinaryOffset.FramePosition.v, frame.frameStart);
        frameArray.set(frameOffset + BinaryOffset.FramePosition.v + 1, actionCount); // Action count.

        for (int i = 0; i < actionCount; ++i) { // Action offsets.
            frameArray.set(frameOffset + BinaryOffset.FramePosition.v + 2 + i, frame.actions.get(i));
        }

        return frameOffset;
    }

    /**
     * @private
     */
    protected ArmatureData _parseArmature(Object rawData, float scale)

    {
        ArmatureData armature = BaseObject.borrowObject(ArmatureData.class);
        armature.name = getString(rawData, ObjectDataParser.NAME, "");
        armature.frameRate = getFloat(rawData, ObjectDataParser.FRAME_RATE, this._data.frameRate);
        armature.scale = scale;

        if (in(rawData, ObjectDataParser.TYPE) && get(rawData, ObjectDataParser.TYPE) instanceof String) {
            armature.type = ObjectDataParser._getArmatureType(Objects.toString(get(rawData, ObjectDataParser.TYPE)));
        } else {
            armature.type = ArmatureType.values[getInt(rawData, ObjectDataParser.TYPE, ArmatureType.Armature.v)];
        }

        if (armature.frameRate == 0) { // Data error.
            armature.frameRate = 24;
        }

        this._armature = armature;

        if (in(rawData, ObjectDataParser.AABB)) {
            Object rawAABB = get(rawData, ObjectDataParser.AABB);
            armature.aabb.x = getFloat(rawAABB, ObjectDataParser.X, 0f);
            armature.aabb.y = getFloat(rawAABB, ObjectDataParser.Y, 0f);
            armature.aabb.width = getFloat(rawAABB, ObjectDataParser.WIDTH, 0f);
            armature.aabb.height = getFloat(rawAABB, ObjectDataParser.HEIGHT, 0f);
        }

        if (in(rawData, ObjectDataParser.CANVAS)) {
            Object rawCanvas = get(rawData, ObjectDataParser.CANVAS);
            CanvasData canvas = BaseObject.borrowObject(CanvasData.class);

            if (in(rawCanvas, ObjectDataParser.COLOR)) {
                getFloat(rawCanvas, ObjectDataParser.COLOR, 0);
                canvas.hasBackground = true;
            } else {
                canvas.hasBackground = false;
            }

            canvas.color = getInt(rawCanvas, ObjectDataParser.COLOR, 0);
            canvas.x = getFloat(rawCanvas, ObjectDataParser.X, 0);
            canvas.y = getFloat(rawCanvas, ObjectDataParser.Y, 0);
            canvas.width = getFloat(rawCanvas, ObjectDataParser.WIDTH, 0);
            canvas.height = getFloat(rawCanvas, ObjectDataParser.HEIGHT, 0);

            armature.canvas = canvas;
        }

        if (in(rawData, ObjectDataParser.BONE)) {
            Array<Object> rawBones = getArray(rawData, ObjectDataParser.BONE);
            for (Object rawBone : rawBones) {
                String parentName = getString(rawBone, ObjectDataParser.PARENT, "");
                BoneData bone = this._parseBone(rawBone);

                if (parentName.length() > 0) { // Get bone parent.
                    BoneData parent = armature.getBone(parentName);
                    if (parent != null) {
                        bone.parent = parent;
                    } else { // Cache.
                        if (!this._cacheBones.containsKey(parentName)) {
                            this._cacheBones.put(parentName, new Array<>());
                        }
                        this._cacheBones.get(parentName).push(bone);
                    }
                }

                if (in(this._cacheBones, bone.name)) {
                    for (BoneData child : this._cacheBones.get(bone.name)) {
                        child.parent = bone;
                    }

                    this._cacheBones.remove(bone.name);
                }

                armature.addBone(bone);

                this._rawBones.add(bone); // Raw bone sort.
            }
        }

        if (in(rawData, ObjectDataParser.IK)) {
            Array<Object> rawIKS = getArray(rawData, ObjectDataParser.IK);
            for (Object rawIK : rawIKS) {
                this._parseIKConstraint(rawIK);
            }
        }

        armature.sortBones();

        if (in(rawData, ObjectDataParser.SLOT)) {
            Array<Object> rawSlots = getArray(rawData, ObjectDataParser.SLOT);
            for (Object rawSlot : rawSlots) {
                armature.addSlot(this._parseSlot(rawSlot));
            }
        }

        if (in(rawData, ObjectDataParser.SKIN)) {
            Array<Object> rawSkins = getArray(rawData, ObjectDataParser.SKIN);
            for (Object rawSkin : rawSkins) {
                armature.addSkin(this._parseSkin(rawSkin));
            }
        }

        if (in(rawData, ObjectDataParser.ANIMATION)) {
            Array<Object> rawAnimations = getArray(rawData, ObjectDataParser.ANIMATION);
            for (Object rawAnimation : rawAnimations) {
                AnimationData animation = this._parseAnimation(rawAnimation);
                armature.addAnimation(animation);
            }
        }

        if (in(rawData, ObjectDataParser.DEFAULT_ACTIONS)) {
            this._parseActionData(get(rawData, ObjectDataParser.DEFAULT_ACTIONS), armature.defaultActions, ActionType.Play, null, null);
        }

        if (in(rawData, ObjectDataParser.ACTIONS)) {
            this._parseActionData(get(rawData, ObjectDataParser.ACTIONS), armature.actions, ActionType.Play, null, null);
        }

        for (int i = 0; i < armature.defaultActions.size(); ++i) {
            ActionData action = armature.defaultActions.get(i);
            if (action.type == ActionType.Play) {
                AnimationData animation = armature.getAnimation(action.name);
                if (animation != null) {
                    armature.defaultAnimation = animation;
                }
                break;
            }
        }

        // Clear helper.
        this._rawBones.clear();
        this._armature = null;
        this._meshs.clear();
        this._cacheBones.clear();
        this._slotChildActions.clear();
        this._weightSlotPose.clear();
        this._weightBonePoses.clear();
        this._weightBoneIndices.clear();
        return armature;
    }

    /**
     * @private
     */
    protected BoneData _parseBone(Object rawData) {
        BoneData bone = BaseObject.borrowObject(BoneData.class);
        bone.inheritTranslation = getBool(rawData, ObjectDataParser.INHERIT_TRANSLATION, true);
        bone.inheritRotation = getBool(rawData, ObjectDataParser.INHERIT_ROTATION, true);
        bone.inheritScale = getBool(rawData, ObjectDataParser.INHERIT_SCALE, true);
        bone.inheritReflection = getBool(rawData, ObjectDataParser.INHERIT_REFLECTION, true);
        bone.length = getFloat(rawData, ObjectDataParser.LENGTH, 0) * this._armature.scale;
        bone.name = getString(rawData, ObjectDataParser.NAME, "");

        if (in(rawData, ObjectDataParser.TRANSFORM)) {
            this._parseTransform(get(rawData, ObjectDataParser.TRANSFORM), bone.transform, this._armature.scale);
        }

        return bone;
    }

    /**
     * @private
     */
    protected void _parseIKConstraint(Object rawData) {
        BoneData bone = this._armature.getBone(getString(rawData, (in(rawData, ObjectDataParser.BONE)) ? ObjectDataParser.BONE : ObjectDataParser.NAME, ""));
        if (bone == null) {
            return;
        }

        BoneData target = this._armature.getBone(getString(rawData, ObjectDataParser.TARGET, ""));
        if (target == null) {
            return;
        }

        IKConstraintData constraint = BaseObject.borrowObject(IKConstraintData.class);
        constraint.bendPositive = getBool(rawData, ObjectDataParser.BEND_POSITIVE, true);
        constraint.scaleEnabled = getBool(rawData, ObjectDataParser.SCALE, false);
        constraint.weight = getFloat(rawData, ObjectDataParser.WEIGHT, 1f);
        constraint.bone = bone;
        constraint.target = target;

        float chain = getFloat(rawData, ObjectDataParser.CHAIN, 0);
        if (chain > 0) {
            constraint.root = bone.parent;
        }
        bone.constraints.add(constraint);
    }

    /**
     * @private
     */
    protected SlotData _parseSlot(Object rawData)

    {
        SlotData slot = BaseObject.borrowObject(SlotData.class);
        slot.displayIndex = getInt(rawData, ObjectDataParser.DISPLAY_INDEX, 0);
        slot.zOrder = this._armature.sortedSlots.size();
        slot.name = getString(rawData, ObjectDataParser.NAME, "");
        slot.parent = this._armature.getBone(getString(rawData, ObjectDataParser.PARENT, "")); //

        if (in(rawData, ObjectDataParser.BLEND_MODE) && get(rawData, ObjectDataParser.BLEND_MODE) instanceof String) {
            slot.blendMode = ObjectDataParser._getBlendMode(Objects.toString(get(rawData, ObjectDataParser.BLEND_MODE)));
        } else {
            slot.blendMode = BlendMode.values[getInt(rawData, ObjectDataParser.BLEND_MODE, BlendMode.Normal.v)];
        }

        if (in(rawData, ObjectDataParser.COLOR)) {
            // slot.color = SlotData.createColor();
            slot.color = SlotData.createColor();
            this._parseColorTransform(get(rawData, ObjectDataParser.COLOR), slot.color);
        } else {
            // slot.color = SlotData.DEFAULT_COLOR;
            slot.color = SlotData.DEFAULT_COLOR;
        }

        if (in(rawData, ObjectDataParser.ACTIONS)) {
            Array<ActionData> actions = new Array<>();
            this._slotChildActions.put(slot.name, actions);
            this._parseActionData(get(rawData, ObjectDataParser.ACTIONS), actions, ActionType.Play, null, null);
        }

        return slot;
    }

    /**
     * @private
     */
    protected SkinData _parseSkin(Object rawData)

    {
        SkinData skin = BaseObject.borrowObject(SkinData.class);
        skin.name = getString(rawData, ObjectDataParser.NAME, ObjectDataParser.DEFAULT_NAME);
        if (skin.name.length() == 0) {
            skin.name = ObjectDataParser.DEFAULT_NAME;
        }

        if (in(rawData, ObjectDataParser.SLOT)) {
            this._skin = skin;

            Array<Object> rawSlots = getArray(rawData, ObjectDataParser.SLOT);
            for (Object rawSlot : rawSlots) {
                String slotName = getString(rawSlot, ObjectDataParser.NAME, "");
                SlotData slot = this._armature.getSlot(slotName);
                if (slot != null) {
                    this._slot = slot;

                    if (in(rawSlot, ObjectDataParser.DISPLAY)) {
                        Array<Object> rawDisplays = getArray(rawSlot, ObjectDataParser.DISPLAY);
                        for (Object rawDisplay : rawDisplays) {
                            skin.addDisplay(slotName, this._parseDisplay(rawDisplay));
                        }
                    }

                    this._slot = null; //
                }
            }

            this._skin = null; //
        }

        return skin;
    }

    /**
     * @private
     */
    @Nullable
    protected DisplayData _parseDisplay(Object rawData) {
        DisplayData display = null;
        String name = getString(rawData, ObjectDataParser.NAME, "");
        String path = getString(rawData, ObjectDataParser.PATH, "");
        DisplayType type = DisplayType.Image;
        if (in(rawData, ObjectDataParser.TYPE) && get(rawData, ObjectDataParser.TYPE) instanceof String) {
            type = ObjectDataParser._getDisplayType(getString(rawData, ObjectDataParser.TYPE, ""));
        } else {
            type = DisplayType.values[getInt(rawData, ObjectDataParser.TYPE, type.v)];
        }

        switch (type) {
            case Image:
                ImageDisplayData imageDisplay = BaseObject.borrowObject(ImageDisplayData.class);
                display = imageDisplay;
                imageDisplay.name = name;
                imageDisplay.path = path.length() > 0 ? path : name;
                this._parsePivot(rawData, imageDisplay);
                break;

            case Armature:
                ArmatureDisplayData armatureDisplay = BaseObject.borrowObject(ArmatureDisplayData.class);
                display = armatureDisplay;
                armatureDisplay.name = name;
                armatureDisplay.path = path.length() > 0 ? path : name;
                armatureDisplay.inheritAnimation = true;

                if (in(rawData, ObjectDataParser.ACTIONS)) {
                    this._parseActionData(get(rawData, ObjectDataParser.ACTIONS), armatureDisplay.actions, ActionType.Play, null, null);
                } else if (in(this._slotChildActions, this._slot.name)) {
                    Array<DisplayData> displays = this._skin.getDisplays(this._slot.name);
                    if (displays == null ? this._slot.displayIndex == 0 : this._slot.displayIndex == displays.getLength()) {
                        for (ActionData action : this._slotChildActions.get(this._slot.name)) {
                            armatureDisplay.actions.push(action);
                        }

                        this._slotChildActions.remove(this._slot.name);
                    }
                }
                break;

            case Mesh:
                MeshDisplayData meshDisplay = BaseObject.borrowObject(MeshDisplayData.class);
                display = meshDisplay;
                meshDisplay.name = name;
                meshDisplay.path = path.length() > 0 ? path : name;
                meshDisplay.inheritAnimation = getBool(rawData, ObjectDataParser.INHERIT_FFD, true);
                this._parsePivot(rawData, meshDisplay);

                String shareName = getString(rawData, ObjectDataParser.SHARE, "");
                if (shareName.length() > 0) {
                    MeshDisplayData shareMesh = this._meshs.get(shareName);
                    meshDisplay.offset = shareMesh.offset;
                    meshDisplay.weight = shareMesh.weight;
                } else {
                    this._parseMesh(rawData, meshDisplay);
                    this._meshs.put(meshDisplay.name, meshDisplay);
                }
                break;

            case BoundingBox:
                BoundingBoxData boundingBox = this._parseBoundingBox(rawData);
                if (boundingBox != null) {
                    BoundingBoxDisplayData boundingBoxDisplay = BaseObject.borrowObject(BoundingBoxDisplayData.class);
                    display = boundingBoxDisplay;
                    boundingBoxDisplay.name = name;
                    boundingBoxDisplay.path = path.length() > 0 ? path : name;
                    boundingBoxDisplay.boundingBox = boundingBox;
                }
                break;
        }

        if (display != null) {
            display.parent = this._armature;
            if (in(rawData, ObjectDataParser.TRANSFORM)) {
                this._parseTransform(get(rawData, ObjectDataParser.TRANSFORM), display.transform, this._armature.scale);
            }
        }

        return display;
    }

    /**
     * @private
     */
    protected void _parsePivot(Object rawData, ImageDisplayData display) {
        if (in(rawData, ObjectDataParser.PIVOT)) {
            Object rawPivot = get(rawData, ObjectDataParser.PIVOT);
            display.pivot.x = getFloat(rawPivot, ObjectDataParser.X, 0f);
            display.pivot.y = getFloat(rawPivot, ObjectDataParser.Y, 0f);
        } else {
            display.pivot.x = 0.5f;
            display.pivot.y = 0.5f;
        }
    }

    /**
     * @private
     */
    protected void _parseMesh(Object rawData, MeshDisplayData mesh) {
        FloatArray rawVertices = getFloatArray(rawData, ObjectDataParser.VERTICES);
        FloatArray rawUVs = getFloatArray(rawData, ObjectDataParser.UVS);
        IntArray rawTriangles = getIntArray(rawData, ObjectDataParser.TRIANGLES);
        ShortArray intArray = this._data.intArray;
        FloatArray floatArray = this._data.floatArray;
        int vertexCount = (int) Math.floor(rawVertices.size() / 2); // uint
        int triangleCount = (int) Math.floor(rawTriangles.size() / 3); // uint
        int vertexOffset = floatArray.length();
        int uvOffset = vertexOffset + vertexCount * 2;

        mesh.offset = intArray.length();
        intArray.incrementLength(1 + 1 + 1 + 1 + triangleCount * 3);
        intArray.set(mesh.offset + BinaryOffset.MeshVertexCount.v, vertexCount);
        intArray.set(mesh.offset + BinaryOffset.MeshTriangleCount.v, triangleCount);
        intArray.set(mesh.offset + BinaryOffset.MeshFloatOffset.v, vertexOffset);
        for (int i = 0, l = triangleCount * 3; i < l; ++i) {
            intArray.set(mesh.offset + BinaryOffset.MeshVertexIndices.v + i, rawTriangles.get(i));
        }

        floatArray.incrementLength(vertexCount * 2 + vertexCount * 2);
        for (int i = 0, l = vertexCount * 2; i < l; ++i) {
            floatArray.set(vertexOffset + i, rawVertices.get(i));
            floatArray.set(uvOffset + i, rawUVs.get(i));
        }

        if (in(rawData, ObjectDataParser.WEIGHTS)) {

            IntArray rawWeights = getIntArray(rawData, ObjectDataParser.WEIGHTS);
            FloatArray rawSlotPose = getFloatArray(rawData, ObjectDataParser.SLOT_POSE);
            // @TODO: Java: Used as int and as float?
            FloatArray rawBonePoses = getFloatArray(rawData, ObjectDataParser.BONE_POSE);
            IntArray weightBoneIndices = new IntArray();
            int weightBoneCount = (int) Math.floor(rawBonePoses.size() / 7); // uint
            int floatOffset = floatArray.length();
            WeightData weight = BaseObject.borrowObject(WeightData.class);

            weight.count = (rawWeights.size() - vertexCount) / 2;
            weight.offset = intArray.length();
            weight.bones.setLength(weightBoneCount);
            weightBoneIndices.setLength(weightBoneCount);
            intArray.incrementLength(1 + 1 + weightBoneCount + vertexCount + weight.count);
            intArray.set(weight.offset + BinaryOffset.WeigthFloatOffset.v, floatOffset);

            for (int i = 0; i < weightBoneCount; ++i) {
                int rawBoneIndex = (int) rawBonePoses.get(i * 7); // uint
                BoneData bone = this._rawBones.get(rawBoneIndex);
                weight.bones.set(i, bone);
                weightBoneIndices.set(i, rawBoneIndex);

                intArray.set(weight.offset + BinaryOffset.WeigthBoneIndices.v + i, this._armature.sortedBones.indexOf(bone));
            }

            floatArray.incrementLength(weight.count * 3);
            this._helpMatrixA.copyFromArray(rawSlotPose, 0);

            for (int i = 0, iW = 0, iB = weight.offset + BinaryOffset.WeigthBoneIndices.v + weightBoneCount, iV = floatOffset; i < vertexCount; ++i) {
                int iD = i * 2;
                int vertexBoneCount = rawWeights.get(iW++); // uint
                intArray.set(iB++, vertexBoneCount);

                float x = floatArray.get(vertexOffset + iD);
                float y = floatArray.get(vertexOffset + iD + 1);
                this._helpMatrixA.transformPoint(x, y, this._helpPoint);
                x = this._helpPoint.x;
                y = this._helpPoint.y;

                for (int j = 0; j < vertexBoneCount; ++j) {
                    int rawBoneIndex = rawWeights.get(iW++); // uint
                    BoneData bone = this._rawBones.get(rawBoneIndex);
                    this._helpMatrixB.copyFromArray(rawBonePoses, weightBoneIndices.indexOf(rawBoneIndex) * 7 + 1);
                    this._helpMatrixB.invert();
                    this._helpMatrixB.transformPoint(x, y, this._helpPoint);
                    intArray.set(iB++, weight.bones.indexOf(bone));
                    floatArray.set(iV++, rawWeights.get(iW++));
                    floatArray.set(iV++, this._helpPoint.x);
                    floatArray.set(iV++, this._helpPoint.y);
                }
            }

            mesh.weight = weight;

            //
            this._weightSlotPose.put(mesh.name, rawSlotPose);
            this._weightBonePoses.put(mesh.name, rawBonePoses);
            this._weightBoneIndices.put(mesh.name, weightBoneIndices);
        }
    }

    /**
     * @private
     */
    @Nullable
    protected BoundingBoxData _parseBoundingBox(Object rawData) {
        BoundingBoxData boundingBox = null;
        BoundingBoxType type = BoundingBoxType.Rectangle;
        if (in(rawData, ObjectDataParser.SUB_TYPE) && get(rawData, ObjectDataParser.SUB_TYPE) instanceof String) {
            type = ObjectDataParser._getBoundingBoxType(getString(rawData, ObjectDataParser.SUB_TYPE));
        } else {
            type = BoundingBoxType.values[getInt(rawData, ObjectDataParser.SUB_TYPE, type.v)];
        }

        switch (type) {
            case Rectangle:
                // boundingBox = BaseObject.borrowObject(RectangleBoundingBoxData);
                boundingBox = BaseObject.borrowObject(RectangleBoundingBoxData.class);
                break;

            case Ellipse:
                // boundingBox = BaseObject.borrowObject(EllipseBoundingBoxData);
                boundingBox = BaseObject.borrowObject(EllipseBoundingBoxData.class);
                break;

            case Polygon:
                boundingBox = this._parsePolygonBoundingBox(rawData);
                break;
        }

        if (boundingBox != null) {
            boundingBox.color = getInt(rawData, ObjectDataParser.COLOR, 0x000000);
            if (boundingBox.type == BoundingBoxType.Rectangle || boundingBox.type == BoundingBoxType.Ellipse) {
                boundingBox.width = getFloat(rawData, ObjectDataParser.WIDTH, 0f);
                boundingBox.height = getFloat(rawData, ObjectDataParser.HEIGHT, 0f);
            }
        }

        return boundingBox;
    }

    /**
     * @private
     */
    protected PolygonBoundingBoxData _parsePolygonBoundingBox(Object rawData)

    {
        FloatArray rawVertices = getFloatArray(rawData, ObjectDataParser.VERTICES);
        FloatArray floatArray = this._data.floatArray;
        PolygonBoundingBoxData polygonBoundingBox = BaseObject.borrowObject(PolygonBoundingBoxData.class);

        polygonBoundingBox.offset = floatArray.length();
        polygonBoundingBox.count = rawVertices.size();
        polygonBoundingBox.vertices = floatArray;
        floatArray.incrementLength(polygonBoundingBox.count);

        for (int i = 0, l = polygonBoundingBox.count; i < l; i += 2) {
            int iN = i + 1;
            float x = rawVertices.get(i);
            float y = rawVertices.get(iN);
            floatArray.set(polygonBoundingBox.offset + i, x);
            floatArray.set(polygonBoundingBox.offset + iN, y);

            // AABB.
            if (i == 0) {
                polygonBoundingBox.x = x;
                polygonBoundingBox.y = y;
                polygonBoundingBox.width = x;
                polygonBoundingBox.height = y;
            } else {
                if (x < polygonBoundingBox.x) {
                    polygonBoundingBox.x = x;
                } else if (x > polygonBoundingBox.width) {
                    polygonBoundingBox.width = x;
                }

                if (y < polygonBoundingBox.y) {
                    polygonBoundingBox.y = y;
                } else if (y > polygonBoundingBox.height) {
                    polygonBoundingBox.height = y;
                }
            }
        }

        return polygonBoundingBox;
    }

    /**
     * @private
     */
    protected AnimationData _parseAnimation(Object rawData)

    {
        // const animation = BaseObject.borrowObject(AnimationData);
        AnimationData animation = BaseObject.borrowObject(AnimationData.class);
        animation.frameCount = Math.max(getInt(rawData, ObjectDataParser.DURATION, 1), 1);
        animation.playTimes = getInt(rawData, ObjectDataParser.PLAY_TIMES, 1);
        animation.duration = animation.frameCount / this._armature.frameRate;
        animation.fadeInTime = getFloat(rawData, ObjectDataParser.FADE_IN_TIME, 0f);
        animation.scale = getFloat(rawData, ObjectDataParser.SCALE, 1f);
        animation.name = getString(rawData, ObjectDataParser.NAME, ObjectDataParser.DEFAULT_NAME);
        // TDOO Check std::string length
        if (animation.name.length() < 1) {
            animation.name = ObjectDataParser.DEFAULT_NAME;
        }
        animation.frameIntOffset = this._data.frameIntArray.length();
        animation.frameFloatOffset = this._data.frameFloatArray.length();
        animation.frameOffset = this._data.frameArray.length();

        this._animation = animation;

        if (in(rawData, ObjectDataParser.FRAME)) {
            Array<Object> rawFrames = getArray(rawData, ObjectDataParser.FRAME);
            int keyFrameCount = rawFrames.size();
            if (keyFrameCount > 0) {
                for (int i = 0, frameStart = 0; i < keyFrameCount; ++i) {
                    Object rawFrame = rawFrames.get(i);
                    this._parseActionDataInFrame(rawFrame, frameStart, null, null);
                    frameStart += getFloat(rawFrame, ObjectDataParser.DURATION, 1);
                }
            }
        }

        if (in(rawData, ObjectDataParser.Z_ORDER)) {
            this._animation.zOrderTimeline = this._parseTimeline(
                    get(rawData, ObjectDataParser.Z_ORDER), TimelineType.ZOrder,
                    false, false, 0,
                    this::_parseZOrderFrame
            );
        }

        if (in(rawData, ObjectDataParser.BONE)) {
            Array<Object> rawTimelines = getArray(rawData, ObjectDataParser.BONE);
            for (Object rawTimeline : rawTimelines) {
                this._parseBoneTimeline(rawTimeline);
            }
        }

        if (in(rawData, ObjectDataParser.SLOT)) {
            Array<Object> rawTimelines = getArray(rawData, ObjectDataParser.SLOT);
            for (Object rawTimeline : rawTimelines) {
                this._parseSlotTimeline(rawTimeline);
            }
        }

        if (in(rawData, ObjectDataParser.FFD)) {
            Array<Object> rawTimelines = getArray(rawData, ObjectDataParser.FFD);
            for (Object rawTimeline : rawTimelines) {
                String slotName = getString(rawTimeline, ObjectDataParser.SLOT, "");
                String displayName = getString(rawTimeline, ObjectDataParser.NAME, "");
                SlotData slot = this._armature.getSlot(slotName);
                if (slot == null) {
                    continue;
                }

                this._slot = slot;
                this._mesh = this._meshs.get(displayName);

                TimelineData timelineFFD = this._parseTimeline(rawTimeline, TimelineType.SlotFFD, false, true, 0, this::_parseSlotFFDFrame);
                if (timelineFFD != null) {
                    this._animation.addSlotTimeline(slot, timelineFFD);
                }

                this._slot = null; //
                this._mesh = null; //
            }
        }

        if (this._actionFrames.size() > 0) {
            this._actionFrames.sort(this::_sortActionFrame);

            TimelineData timeline = this._animation.actionTimeline = BaseObject.borrowObject(TimelineData.class);
            CharArray timelineArray = this._data.timelineArray;
            int keyFrameCount = this._actionFrames.size();
            timeline.type = TimelineType.Action;
            timeline.offset = timelineArray.length();
            timelineArray.incrementLength(1 + 1 + 1 + 1 + 1 + keyFrameCount);
            timelineArray.set(timeline.offset + BinaryOffset.TimelineScale.v, 100);
            timelineArray.set(timeline.offset + BinaryOffset.TimelineOffset.v, 0);
            timelineArray.set(timeline.offset + BinaryOffset.TimelineKeyFrameCount.v, keyFrameCount);
            timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameValueCount.v, 0);
            timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameValueOffset.v, 0);

            this._timeline = timeline;

            if (keyFrameCount == 1) {
                timeline.frameIndicesOffset = -1;
                timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameOffset.v + 0, this._parseCacheActionFrame(this._actionFrames.get(0)) - this._animation.frameOffset);
            } else {
                int totalFrameCount = this._animation.frameCount + 1; // One more frame than animation.
                IntArray frameIndices = this._data.frameIndices;
                timeline.frameIndicesOffset = frameIndices.length();
                frameIndices.incrementLength(totalFrameCount);

                for (
                        int i = 0, iK = 0, frameStart = 0, frameCount = 0;
                        i < totalFrameCount;
                        ++i
                        ) {
                    if (frameStart + frameCount <= i && iK < keyFrameCount) {
                        ActionFrame frame = this._actionFrames.get(iK);
                        frameStart = frame.frameStart;
                        if (iK == keyFrameCount - 1) {
                            frameCount = this._animation.frameCount - frameStart;
                        } else {
                            frameCount = this._actionFrames.get(iK + 1).frameStart - frameStart;
                        }

                        timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameOffset.v + iK, this._parseCacheActionFrame(frame) - this._animation.frameOffset);
                        iK++;
                    }

                    frameIndices.set(timeline.frameIndicesOffset + i, iK - 1);
                }
            }

            this._timeline = null; //
            this._actionFrames.clear();
        }

        this._animation = null; //

        return animation;
    }

    interface FrameParser {
        int parse(Object rawData, int frameStart, int frameCount);
    }

    /**
     * @private
     */
    @Nullable
    protected TimelineData _parseTimeline(
            Object rawData, TimelineType type,
            boolean addIntOffset, boolean addFloatOffset, int frameValueCount,
            FrameParser frameParser
    )

    {
        if (!(in(rawData, ObjectDataParser.FRAME))) {
            return null;
        }

        Array<Object> rawFrames = getArray(rawData, ObjectDataParser.FRAME);
        int keyFrameCount = rawFrames.size();
        if (keyFrameCount == 0) {
            return null;
        }

        CharArray timelineArray = this._data.timelineArray;
        int frameIntArrayLength = this._data.frameIntArray.length();
        int frameFloatArrayLength = this._data.frameFloatArray.length();
        TimelineData timeline = BaseObject.borrowObject(TimelineData.class);
        timeline.type = type;
        timeline.offset = timelineArray.length();
        timelineArray.incrementLength(1 + 1 + 1 + 1 + 1 + keyFrameCount);
        timelineArray.set(timeline.offset + BinaryOffset.TimelineScale.v, (int) Math.round(getFloat(rawData, ObjectDataParser.SCALE, 1f) * 100));
        timelineArray.set(timeline.offset + BinaryOffset.TimelineOffset.v, (int) Math.round(getFloat(rawData, ObjectDataParser.OFFSET, 0f) * 100));
        timelineArray.set(timeline.offset + BinaryOffset.TimelineKeyFrameCount.v, keyFrameCount);
        timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameValueCount.v, frameValueCount);
        if (addIntOffset) {
            timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameValueOffset.v, frameIntArrayLength - this._animation.frameIntOffset);
        } else if (addFloatOffset) {
            timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameValueOffset.v, frameFloatArrayLength - this._animation.frameFloatOffset);
        } else {
            timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameValueOffset.v, 0);
        }

        this._timeline = timeline;

        if (keyFrameCount == 1) { // Only one frame.
            timeline.frameIndicesOffset = -1;
            timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameOffset.v + 0, frameParser.parse(rawFrames.get(0), 0, 0) - this._animation.frameOffset);
        } else {
            IntArray frameIndices = this._data.frameIndices;
            int totalFrameCount = this._animation.frameCount + 1; // One more frame than animation.
            timeline.frameIndicesOffset = frameIndices.size();
            frameIndices.incrementLength(totalFrameCount);

            for (int i = 0, iK = 0, frameStart = 0, frameCount = 0; i < totalFrameCount; ++i) {
                if (frameStart + frameCount <= i && iK < keyFrameCount) {
                    Object rawFrame = rawFrames.get(iK);
                    frameStart = i;
                    frameCount = getInt(rawFrame, ObjectDataParser.DURATION, 1);
                    if (iK == keyFrameCount - 1) {
                        frameCount = this._animation.frameCount - frameStart;
                    }

                    timelineArray.set(timeline.offset + BinaryOffset.TimelineFrameOffset.v + iK, frameParser.parse(rawFrame, frameStart, frameCount) - this._animation.frameOffset);
                    iK++;
                }

                frameIndices.set(timeline.frameIndicesOffset + i, iK - 1);
            }
        }

        this._timeline = null; //

        return timeline;
    }

    /**
     * @private
     */
    protected void _parseBoneTimeline(Object rawData)

    {
        BoneData bone = this._armature.getBone(getString(rawData, ObjectDataParser.NAME, ""));
        if (bone == null) {
            return;
        }

        this._bone = bone;
        this._slot = this._armature.getSlot(this._bone.name);

        TimelineData timeline = this._parseTimeline(
                rawData, TimelineType.BoneAll,
                false, true, 6,
                this::_parseBoneFrame
        );
        if (timeline != null) {
            this._animation.addBoneTimeline(bone, timeline);
        }

        this._bone = null; //
        this._slot = null; //
    }

    /**
     * @private
     */
    protected void _parseSlotTimeline(Object rawData)

    {
        SlotData slot = this._armature.getSlot(getString(rawData, ObjectDataParser.NAME, ""));
        if (slot == null) {
            return;
        }

        this._slot = slot;

        TimelineData displayIndexTimeline = this._parseTimeline(rawData, TimelineType.SlotDisplay, false, false, 0, this::_parseSlotDisplayIndexFrame);
        if (displayIndexTimeline != null) {
            this._animation.addSlotTimeline(slot, displayIndexTimeline);
        }

        TimelineData colorTimeline = this._parseTimeline(rawData, TimelineType.SlotColor, true, false, 1, this::_parseSlotColorFrame);
        if (colorTimeline != null) {
            this._animation.addSlotTimeline(slot, colorTimeline);
        }

        this._slot = null; //
    }

    /**
     * @private
     */
    protected int _parseFrame(Object rawData, int frameStart, int frameCount, IntArray frameArray)

    {
        int frameOffset = frameArray.size();
        frameArray.incrementLength(1);
        frameArray.set(frameOffset + BinaryOffset.FramePosition.v, frameStart);

        return frameOffset;
    }

    /**
     * @private
     */
    protected int _parseTweenFrame(Object rawData, int frameStart, int frameCount, IntArray frameArray)

    {
        int frameOffset = this._parseFrame(rawData, frameStart, frameCount, frameArray);

        if (frameCount > 0) {
            if (in(rawData, ObjectDataParser.CURVE)) {
                int sampleCount = frameCount + 1;
                this._helpArray.setLength(sampleCount);
                this._samplingEasingCurve(getFloatArray(rawData, ObjectDataParser.CURVE), this._helpArray);

                frameArray.incrementLength(1 + 1 + this._helpArray.getLength());
                frameArray.set(frameOffset + BinaryOffset.FrameTweenType.v, TweenType.Curve.v);
                frameArray.set(frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount.v, sampleCount);
                for (int i = 0; i < sampleCount; ++i) {
                    frameArray.set(frameOffset + BinaryOffset.FrameCurveSamples.v + i, (int) Math.round(this._helpArray.get(i) * 10000.0));
                }
            } else {
                float noTween = -2.0f;
                float tweenEasing = noTween;
                if (in(rawData, ObjectDataParser.TWEEN_EASING)) {
                    tweenEasing = getFloat(rawData, ObjectDataParser.TWEEN_EASING, noTween);
                }

                if (tweenEasing == noTween) {
                    frameArray.incrementLength(1);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenType.v, TweenType.None.v);
                } else if (tweenEasing == 0f) {
                    frameArray.incrementLength(1);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenType.v, TweenType.Line.v);
                } else if (tweenEasing < 0f) {
                    frameArray.incrementLength(1 + 1);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenType.v, TweenType.QuadIn.v);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount.v, (int) Math.round(-tweenEasing * 100.0));
                } else if (tweenEasing <= 1f) {
                    frameArray.incrementLength(1 + 1);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenType.v, TweenType.QuadOut.v);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount.v, (int) Math.round(tweenEasing * 100.0));
                } else {
                    frameArray.incrementLength(1 + 1);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenType.v, TweenType.QuadInOut.v);
                    frameArray.set(frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount.v, (int) Math.round(tweenEasing * 100.0 - 100.0));
                }
            }
        } else {
            frameArray.incrementLength(1);
            frameArray.set(frameOffset + BinaryOffset.FrameTweenType.v, TweenType.None.v);
        }

        return frameOffset;
    }

    /**
     * @private
     */
    protected int _parseZOrderFrame(Object rawData, int frameStart, int frameCount)

    {
        ShortArray frameArray = this._data.frameArray;
        int frameOffset = this._parseFrame(rawData, frameStart, frameCount, frameArray);

        if (in(rawData, ObjectDataParser.Z_ORDER)) {
            IntArray rawZOrder = getIntArray(rawData, ObjectDataParser.Z_ORDER);
            if (rawZOrder.length() > 0) {
                int slotCount = this._armature.sortedSlots.length();
                IntArray unchanged = new IntArray(slotCount - rawZOrder.length() / 2);
                IntArray zOrders = new IntArray(slotCount);

                for (int i = 0; i < slotCount; ++i) {
                    zOrders.set(i, -1);
                }

                int originalIndex = 0;
                int unchangedIndex = 0;
                for (int i = 0, l = rawZOrder.length(); i < l; i += 2) {
                    int slotIndex = rawZOrder.get(i);
                    int zOrderOffset = rawZOrder.get(i + 1);

                    while (originalIndex != slotIndex) {
                        unchanged.set(unchangedIndex++, originalIndex++);
                    }

                    zOrders.set(originalIndex + zOrderOffset, originalIndex++);
                }

                while (originalIndex < slotCount) {
                    unchanged.set(unchangedIndex++, originalIndex++);
                }

                frameArray.incrementLength(1 + slotCount);
                frameArray.set(frameOffset + 1, slotCount);

                int i = slotCount;
                while (i-- > 0) {
                    if (zOrders.get(i) == -1) {
                        frameArray.set(frameOffset + 2 + i, unchanged.get(--unchangedIndex));
                    } else {
                        frameArray.set(frameOffset + 2 + i, zOrders.get(i));
                    }
                }

                return frameOffset;
            }
        }

        frameArray.incrementLength(1);
        frameArray.set(frameOffset + 1, 0);

        return frameOffset;
    }

    /**
     * @private
     */
    protected int _parseBoneFrame(Object rawData, int frameStart, int frameCount)

    {
        FloatArray frameFloatArray = this._data.frameFloatArray;
        ShortArray frameArray = this._data.frameArray;
        int frameOffset = this._parseTweenFrame(rawData, frameStart, frameCount, frameArray);

        this._helpTransform.identity();
        if (in(rawData, ObjectDataParser.TRANSFORM)) {
            this._parseTransform(get(rawData, ObjectDataParser.TRANSFORM), this._helpTransform, 1f);
        }

        // Modify rotation.
        float rotation = this._helpTransform.rotation;
        if (frameStart != 0) {
            if (this._prevTweenRotate == 0) {
                rotation = this._prevRotation + Transform.normalizeRadian(rotation - this._prevRotation);
            } else {
                if (this._prevTweenRotate > 0 ? rotation >= this._prevRotation : rotation <= this._prevRotation) {
                    this._prevTweenRotate = this._prevTweenRotate > 0 ? this._prevTweenRotate - 1 : this._prevTweenRotate + 1;
                }

                rotation = this._prevRotation + rotation - this._prevRotation + Transform.PI_D * this._prevTweenRotate;
            }
        }

        this._prevTweenRotate = getFloat(rawData, ObjectDataParser.TWEEN_ROTATE, 0f);
        this._prevRotation = rotation;

        int frameFloatOffset = frameFloatArray.length();
        frameFloatArray.incrementLength(6);
        frameFloatArray.set(frameFloatOffset++, this._helpTransform.x);
        frameFloatArray.set(frameFloatOffset++, this._helpTransform.y);
        frameFloatArray.set(frameFloatOffset++, rotation);
        frameFloatArray.set(frameFloatOffset++, this._helpTransform.skew);
        frameFloatArray.set(frameFloatOffset++, this._helpTransform.scaleX);
        frameFloatArray.set(frameFloatOffset++, this._helpTransform.scaleY);

        this._parseActionDataInFrame(rawData, frameStart, this._bone, this._slot);

        return frameOffset;
    }

    /**
     * @private
     */
    protected int _parseSlotDisplayIndexFrame(Object rawData, int frameStart, int frameCount)

    {
        ShortArray frameArray = this._data.frameArray;
        int frameOffset = this._parseFrame(rawData, frameStart, frameCount, frameArray);

        frameArray.incrementLength(1);
        frameArray.set(frameOffset + 1, getInt(rawData, ObjectDataParser.DISPLAY_INDEX, 0));

        this._parseActionDataInFrame(rawData, frameStart, this._slot.parent, this._slot);

        return frameOffset;
    }

    /**
     * @private
     */
    protected int _parseSlotColorFrame(Object rawData, int frameStart, int frameCount)

    {
        ShortArray intArray = this._data.intArray;
        ShortArray frameIntArray = this._data.frameIntArray;
        ShortArray frameArray = this._data.frameArray;
        int frameOffset = this._parseTweenFrame(rawData, frameStart, frameCount, frameArray);

        int colorOffset = -1;
        if (in(rawData, ObjectDataParser.COLOR)) {
            Array rawColor = getArray(rawData, ObjectDataParser.COLOR);
            for (int k = 0; k < rawColor.length(); k++) {
                this._parseColorTransform(rawColor, this._helpColorTransform);
                colorOffset = intArray.length();
                intArray.incrementLength(8);
                intArray.set(colorOffset++, (int) Math.round(this._helpColorTransform.alphaMultiplier * 100));
                intArray.set(colorOffset++, (int) Math.round(this._helpColorTransform.redMultiplier * 100));
                intArray.set(colorOffset++, (int) Math.round(this._helpColorTransform.greenMultiplier * 100));
                intArray.set(colorOffset++, (int) Math.round(this._helpColorTransform.blueMultiplier * 100));
                intArray.set(colorOffset++, Math.round(this._helpColorTransform.alphaOffset));
                intArray.set(colorOffset++, Math.round(this._helpColorTransform.redOffset));
                intArray.set(colorOffset++, Math.round(this._helpColorTransform.greenOffset));
                intArray.set(colorOffset++, Math.round(this._helpColorTransform.blueOffset));
                colorOffset -= 8;
                break;
            }
        }

        if (colorOffset < 0) {
            if (this._defalultColorOffset < 0) {
                this._defalultColorOffset = colorOffset = intArray.length();
                intArray.incrementLength(8);
                intArray.set(colorOffset++, 100);
                intArray.set(colorOffset++, 100);
                intArray.set(colorOffset++, 100);
                intArray.set(colorOffset++, 100);
                intArray.set(colorOffset++, 0);
                intArray.set(colorOffset++, 0);
                intArray.set(colorOffset++, 0);
                intArray.set(colorOffset++, 0);
            }

            colorOffset = this._defalultColorOffset;
        }

        int frameIntOffset = frameIntArray.length();
        frameIntArray.incrementLength(1);
        frameIntArray.set(frameIntOffset, colorOffset);

        return frameOffset;
    }

    /**
     * @private
     */
    protected int _parseSlotFFDFrame(Object rawData, int frameStart, int frameCount)

    {
        IntArray intArray = this._data.intArray;
        FloatArray frameFloatArray = this._data.frameFloatArray;
        ShortArray frameArray = this._data.frameArray;
        int frameFloatOffset = frameFloatArray.length();
        int frameOffset = this._parseTweenFrame(rawData, frameStart, frameCount, frameArray);
        FloatArray rawVertices = in(rawData, ObjectDataParser.VERTICES) ? getFloatArray(rawData, ObjectDataParser.VERTICES) : null;
        int offset = getInt(rawData, ObjectDataParser.OFFSET, 0); // uint
        int vertexCount = intArray.get(this._mesh.offset + BinaryOffset.MeshVertexCount.v);

        float x = 0f;
        float y = 0f;
        int iB = 0;
        int iV = 0;
        if (this._mesh.weight != null) {
            FloatArray rawSlotPose = this._weightSlotPose.get(this._mesh.name);
            this._helpMatrixA.copyFromArray(rawSlotPose, 0);
            frameFloatArray.incrementLength(this._mesh.weight.count * 2);
            iB = this._mesh.weight.offset + BinaryOffset.WeigthBoneIndices.v + this._mesh.weight.bones.length();
        } else {
            frameFloatArray.incrementLength(vertexCount * 2);
        }

        for (
                int i = 0;
                i < vertexCount * 2;
                i += 2
                ) {
            if (rawVertices == null) { // Fill 0.
                x = 0f;
                y = 0f;
            } else {
                if (i < offset || i - offset >= rawVertices.length()) {
                    x = 0f;
                } else {
                    x = rawVertices.get(i - offset);
                }

                if (i + 1 < offset || i + 1 - offset >= rawVertices.length()) {
                    y = 0f;
                } else {
                    y = rawVertices.get(i + 1 - offset);
                }
            }

            if (this._mesh.weight != null) { // If mesh is skinned, transform point by bone bind pose.
                FloatArray rawBonePoses = this._weightBonePoses.get(this._mesh.name);
                IntArray weightBoneIndices = this._weightBoneIndices.get(this._mesh.name);
                int vertexBoneCount = intArray.get(iB++);

                this._helpMatrixA.transformPoint(x, y, this._helpPoint, true);
                x = this._helpPoint.x;
                y = this._helpPoint.y;

                for (int j = 0; j < vertexBoneCount; ++j) {
                    int boneIndex = intArray.get(iB++);
                    BoneData bone = this._mesh.weight.bones.get(boneIndex);
                    int rawBoneIndex = this._rawBones.indexOf(bone);

                    this._helpMatrixB.copyFromArray(rawBonePoses, weightBoneIndices.indexOf(rawBoneIndex) * 7 + 1);
                    this._helpMatrixB.invert();
                    this._helpMatrixB.transformPoint(x, y, this._helpPoint, true);

                    frameFloatArray.set(frameFloatOffset + iV++, this._helpPoint.x);
                    frameFloatArray.set(frameFloatOffset + iV++, this._helpPoint.y);
                }
            } else {
                frameFloatArray.set(frameFloatOffset + i, x);
                frameFloatArray.set(frameFloatOffset + i + 1, y);
            }
        }

        if (frameStart == 0) {
            ShortArray frameIntArray = this._data.frameIntArray;
            CharArray timelineArray = this._data.timelineArray;
            int frameIntOffset = frameIntArray.length();
            frameIntArray.incrementLength(1 + 1 + 1 + 1 + 1);
            frameIntArray.set(frameIntOffset + BinaryOffset.FFDTimelineMeshOffset.v, this._mesh.offset);
            frameIntArray.set(frameIntOffset + BinaryOffset.FFDTimelineFFDCount.v, frameFloatArray.length() - frameFloatOffset);
            frameIntArray.set(frameIntOffset + BinaryOffset.FFDTimelineValueCount.v, frameFloatArray.length() - frameFloatOffset);
            frameIntArray.set(frameIntOffset + BinaryOffset.FFDTimelineValueOffset.v, 0);
            frameIntArray.set(frameIntOffset + BinaryOffset.FFDTimelineFloatOffset.v, frameFloatOffset);
            timelineArray.set(this._timeline.offset + BinaryOffset.TimelineFrameValueCount.v, frameIntOffset - this._animation.frameIntOffset);
        }

        return frameOffset;
    }

    /**
     * @private
     */
    protected int _parseActionData(Object rawData, Array<ActionData> actions, ActionType type, @Nullable BoneData bone, @Nullable SlotData slot)

    {
        int actionCount = 0;

        if (rawData instanceof String) {
            ActionData action = BaseObject.borrowObject(ActionData.class);
            action.type = type;
            action.name = (String) rawData;
            action.bone = bone;
            action.slot = slot;
            actions.push(action);
            actionCount++;
        } else if (rawData instanceof ArrayBase) {
            for (Object rawAction : (ArrayBase) rawData) {
                ActionData action = BaseObject.borrowObject(ActionData.class);
                if (in(rawAction, ObjectDataParser.GOTO_AND_PLAY)) {
                    action.type = ActionType.Play;
                    action.name = getString(rawAction, ObjectDataParser.GOTO_AND_PLAY, "");
                } else {
                    if (in(rawAction, ObjectDataParser.TYPE) && get(rawAction, ObjectDataParser.TYPE) instanceof String) {
                        action.type = ObjectDataParser._getActionType(getString(rawAction, ObjectDataParser.TYPE));
                    } else {
                        action.type = ActionType.values[getInt(rawAction, ObjectDataParser.TYPE, type.v)];
                    }

                    action.name = getString(rawAction, ObjectDataParser.NAME, "");
                }

                if (in(rawAction, ObjectDataParser.BONE)) {
                    String boneName = getString(rawAction, ObjectDataParser.BONE, "");
                    action.bone = this._armature.getBone(boneName);
                } else {
                    action.bone = bone;
                }

                if (in(rawAction, ObjectDataParser.SLOT)) {
                    String slotName = getString(rawAction, ObjectDataParser.SLOT, "");
                    action.slot = this._armature.getSlot(slotName);
                } else {
                    action.slot = slot;
                }

                if (in(rawAction, ObjectDataParser.INTS)) {
                    if (action.data == null) {
                        action.data = BaseObject.borrowObject(UserData.class);
                    }

                    IntArray rawInts = getIntArray(rawAction, ObjectDataParser.INTS);
                    for (int rawValue : rawInts) {
                        action.data.ints.push(rawValue);
                    }
                }

                if (in(rawAction, ObjectDataParser.FLOATS)) {
                    if (action.data == null) {
                        action.data = BaseObject.borrowObject(UserData.class);
                    }

                    FloatArray rawFloats = getFloatArray(rawAction, ObjectDataParser.FLOATS);
                    for (float rawValue : rawFloats) {
                        action.data.floats.push(rawValue);
                    }
                }

                if (in(rawAction, ObjectDataParser.STRINGS)) {
                    if (action.data == null) {
                        action.data = BaseObject.borrowObject(UserData.class);
                    }

                    Array<String> rawStrings = getArray(rawAction, ObjectDataParser.STRINGS);
                    for (String rawValue : rawStrings) {
                        action.data.strings.push(rawValue);
                    }
                }

                actions.push(action);
                actionCount++;
            }
        }

        return actionCount;
    }

    /**
     * @private
     */
    protected void _parseTransform(Object rawData, Transform transform, float scale)

    {
        transform.x = getFloat(rawData, ObjectDataParser.X, 0f) * scale;
        transform.y = getFloat(rawData, ObjectDataParser.Y, 0f) * scale;

        if (in(rawData, ObjectDataParser.ROTATE) || in(rawData, ObjectDataParser.SKEW)) {
            transform.rotation = Transform.normalizeRadian(getFloat(rawData, ObjectDataParser.ROTATE, 0f) * Transform.DEG_RAD);
            transform.skew = Transform.normalizeRadian(getFloat(rawData, ObjectDataParser.SKEW, 0f) * Transform.DEG_RAD);
        } else if (in(rawData, ObjectDataParser.SKEW_X) || in(rawData, ObjectDataParser.SKEW_Y)) {
            transform.rotation = Transform.normalizeRadian(getFloat(rawData, ObjectDataParser.SKEW_Y, 0f) * Transform.DEG_RAD);
            transform.skew = Transform.normalizeRadian(getFloat(rawData, ObjectDataParser.SKEW_X, 0f) * Transform.DEG_RAD) - transform.rotation;
        }

        transform.scaleX = getFloat(rawData, ObjectDataParser.SCALE_X, 1f);
        transform.scaleY = getFloat(rawData, ObjectDataParser.SCALE_Y, 1f);
    }

    /**
     * @private
     */
    protected void _parseColorTransform(Object rawData, ColorTransform color)

    {
        color.alphaMultiplier = getFloat(rawData, ObjectDataParser.ALPHA_MULTIPLIER, 100) * 0.01f;
        color.redMultiplier = getFloat(rawData, ObjectDataParser.RED_MULTIPLIER, 100) * 0.01f;
        color.greenMultiplier = getFloat(rawData, ObjectDataParser.GREEN_MULTIPLIER, 100) * 0.01f;
        color.blueMultiplier = getFloat(rawData, ObjectDataParser.BLUE_MULTIPLIER, 100) * 0.01f;
        color.alphaOffset = getInt(rawData, ObjectDataParser.ALPHA_OFFSET, 0);
        color.redOffset = getInt(rawData, ObjectDataParser.RED_OFFSET, 0);
        color.greenOffset = getInt(rawData, ObjectDataParser.GREEN_OFFSET, 0);
        color.blueOffset = getInt(rawData, ObjectDataParser.BLUE_OFFSET, 0);
    }

    /**
     * @private
     */
    protected void _parseArray(Object rawData) {
        this._data.intArray = new ShortArray();
        this._data.floatArray = new FloatArray();
        this._data.frameIntArray = new ShortArray();
        this._data.frameFloatArray = new FloatArray();
        this._data.frameArray = new ShortArray();
        this._data.timelineArray = new CharArray();
    }

    @Nullable
    public DragonBonesData parseDragonBonesDataInstance(@NotNull Object rawData) {
        return parseDragonBonesData(rawData, 1f);
    }

    /**
     * @inheritDoc
     */
    @Nullable
    public DragonBonesData parseDragonBonesData(@NotNull Object rawData, float scale) {
        String version = getString(rawData, ObjectDataParser.VERSION, "");
        String compatibleVersion = getString(rawData, ObjectDataParser.COMPATIBLE_VERSION, "");

        if (
                Arrays.asList(ObjectDataParser.DATA_VERSIONS).indexOf(version) >= 0 ||
                        Arrays.asList(ObjectDataParser.DATA_VERSIONS).indexOf(compatibleVersion) >= 0
                ) {
            DragonBonesData data = BaseObject.borrowObject(DragonBonesData.class);
            data.version = version;
            data.name = getString(rawData, ObjectDataParser.NAME, "");
            data.frameRate = getFloat(rawData, ObjectDataParser.FRAME_RATE, 24);

            if (data.frameRate == 0) { // Data error.
                data.frameRate = 24;
            }

            if (in(rawData, ObjectDataParser.ARMATURE)) {
                this._defalultColorOffset = -1;
                this._data = data;

                this._parseArray(rawData);

                Array<Object> rawArmatures = getArray(rawData, ObjectDataParser.ARMATURE);
                for (Object rawArmature : rawArmatures) {
                    data.addArmature(this._parseArmature(rawArmature, scale));
                }

                if (this._intArrayJson.length() > 0) {
                    //this._parseWASMArray();
                    throw new RuntimeException("this._parseWASMArray() not ported");
                }

                this._data = null;
            }

            this._rawTextureAtlasIndex = 0;
            if (in(rawData, ObjectDataParser.TEXTURE_ATLAS)) {
                this._rawTextureAtlases = getArray(rawData, ObjectDataParser.TEXTURE_ATLAS);
            } else {
                this._rawTextureAtlases = null;
            }

            return data;
        } else {
            Console._assert(false, "Nonsupport data version.");
        }

        return null;
    }

    public boolean parseTextureAtlasData(Object rawData, TextureAtlasData textureAtlasData) {
        return parseTextureAtlasData(rawData, textureAtlasData, 0f);
    }

    /**
     * @inheritDoc
     */
    public boolean parseTextureAtlasData(Object rawData, TextureAtlasData textureAtlasData, float scale) {
        if (rawData == null) {
            if (this._rawTextureAtlases == null) {
                return false;
            }

            Object rawTextureAtlas = this._rawTextureAtlases.get(this._rawTextureAtlasIndex++);
            this.parseTextureAtlasData(rawTextureAtlas, textureAtlasData, scale);
            if (this._rawTextureAtlasIndex >= this._rawTextureAtlases.length()) {
                this._rawTextureAtlasIndex = 0;
                this._rawTextureAtlases = null;
            }

            return true;
        }

        // Texture format.
        textureAtlasData.width = getInt(rawData, ObjectDataParser.WIDTH, 0);
        textureAtlasData.height = getInt(rawData, ObjectDataParser.HEIGHT, 0);
        textureAtlasData.name = getString(rawData, ObjectDataParser.NAME, "");
        textureAtlasData.imagePath = getString(rawData, ObjectDataParser.IMAGE_PATH, "");

        if (scale > 0f) { // Use params scale.
            textureAtlasData.scale = scale;
        } else { // Use data scale.
            scale = textureAtlasData.scale = getFloat(rawData, ObjectDataParser.SCALE, textureAtlasData.scale);
        }

        scale = 1f / scale; //

        if (in(rawData, ObjectDataParser.SUB_TEXTURE)) {
            ArrayBase rawTextures = getArray(rawData, ObjectDataParser.SUB_TEXTURE);
            for (int i = 0, l = rawTextures.length(); i < l; ++i) {
                Object rawTexture = rawTextures.getObject(i);
                TextureData textureData = textureAtlasData.createTexture();
                textureData.rotated = getBool(rawTexture, ObjectDataParser.ROTATED, false);
                textureData.name = getString(rawTexture, ObjectDataParser.NAME, "");
                textureData.region.x = getFloat(rawTexture, ObjectDataParser.X, 0f) * scale;
                textureData.region.y = getFloat(rawTexture, ObjectDataParser.Y, 0f) * scale;
                textureData.region.width = getFloat(rawTexture, ObjectDataParser.WIDTH, 0f) * scale;
                textureData.region.height = getFloat(rawTexture, ObjectDataParser.HEIGHT, 0f) * scale;

                float frameWidth = getFloat(rawTexture, ObjectDataParser.FRAME_WIDTH, -1f);
                float frameHeight = getFloat(rawTexture, ObjectDataParser.FRAME_HEIGHT, -1f);
                if (frameWidth > 0f && frameHeight > 0f) {
                    textureData.frame = TextureData.createRectangle();
                    textureData.frame.x = getFloat(rawTexture, ObjectDataParser.FRAME_X, 0f) * scale;
                    textureData.frame.y = getFloat(rawTexture, ObjectDataParser.FRAME_Y, 0f) * scale;
                    textureData.frame.width = frameWidth * scale;
                    textureData.frame.height = frameHeight * scale;
                }

                textureAtlasData.addTexture(textureData);
            }
        }

        return true;
    }

    /**
     * @private
     */
    private static ObjectDataParser _objectDataParserInstance = null;

    /**
     * @see BaseFactory#parseDragonBonesData(Object, String, float)
     * @deprecated 已废弃，请参考 @see
     */
    public static ObjectDataParser getInstance() {
        if (ObjectDataParser._objectDataParserInstance == null) {
            ObjectDataParser._objectDataParserInstance = new ObjectDataParser();
        }

        return ObjectDataParser._objectDataParserInstance;
    }
}
