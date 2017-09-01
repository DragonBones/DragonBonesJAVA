package com.dragonbones.parser;

import com.dragonbones.core.*;
import com.dragonbones.factory.BaseFactory;
import com.dragonbones.geom.Rectangle;
import com.dragonbones.model.DragonBonesData;
import com.dragonbones.model.TextureAtlasData;
import com.dragonbones.util.ArrayBase;
import com.dragonbones.util.Console;
import com.dragonbones.util.buffer.ArrayBuffer;
import com.dragonbones.util.json.JSON;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;

import static com.dragonbones.util.Dynamic.*;

/**
 * @private
 */
public abstract class DataParser {
    protected static final String DATA_VERSION_2_3 = "2.3";
    protected static final String DATA_VERSION_3_0 = "3.0";
    protected static final String DATA_VERSION_4_0 = "4.0";
    protected static final String DATA_VERSION_4_5 = "4.5";
    protected static final String DATA_VERSION_5_0 = "5.0";
    protected static final String DATA_VERSION = DataParser.DATA_VERSION_5_0;

    protected static final String[] DATA_VERSIONS = new String[]{
            DataParser.DATA_VERSION_4_0,
            DataParser.DATA_VERSION_4_5,
            DataParser.DATA_VERSION_5_0
    };

    protected static final String TEXTURE_ATLAS = "textureAtlas";
    protected static final String SUB_TEXTURE = "SubTexture";
    protected static final String FORMAT = "format";
    protected static final String IMAGE_PATH = "imagePath";
    protected static final String WIDTH = "width";
    protected static final String HEIGHT = "height";
    protected static final String ROTATED = "rotated";
    protected static final String FRAME_X = "frameX";
    protected static final String FRAME_Y = "frameY";
    protected static final String FRAME_WIDTH = "frameWidth";
    protected static final String FRAME_HEIGHT = "frameHeight";

    protected static final String DRADON_BONES = "dragonBones";
    protected static final String USER_DATA = "userData";
    protected static final String ARMATURE = "armature";
    protected static final String BONE = "bone";
    protected static final String IK = "ik";
    protected static final String SLOT = "slot";
    protected static final String SKIN = "skin";
    protected static final String DISPLAY = "display";
    protected static final String ANIMATION = "animation";
    protected static final String Z_ORDER = "zOrder";
    protected static final String FFD = "ffd";
    protected static final String FRAME = "frame";
    protected static final String TRANSLATE_FRAME = "translateFrame";
    protected static final String ROTATE_FRAME = "rotateFrame";
    protected static final String SCALE_FRAME = "scaleFrame";
    protected static final String VISIBLE_FRAME = "visibleFrame";
    protected static final String DISPLAY_FRAME = "displayFrame";
    protected static final String COLOR_FRAME = "colorFrame";
    protected static final String DEFAULT_ACTIONS = "defaultActions";
    protected static final String ACTIONS = "actions";
    protected static final String EVENTS = "events";
    protected static final String INTS = "ints";
    protected static final String FLOATS = "floats";
    protected static final String STRINGS = "strings";
    protected static final String CANVAS = "canvas";

    protected static final String TRANSFORM = "transform";
    protected static final String PIVOT = "pivot";
    protected static final String AABB = "aabb";
    protected static final String COLOR = "color";

    protected static final String VERSION = "version";
    protected static final String COMPATIBLE_VERSION = "compatibleVersion";
    protected static final String FRAME_RATE = "frameRate";
    protected static final String TYPE = "type";
    protected static final String SUB_TYPE = "subType";
    protected static final String NAME = "name";
    protected static final String PARENT = "parent";
    protected static final String TARGET = "target";
    protected static final String SHARE = "share";
    protected static final String PATH = "path";
    protected static final String LENGTH = "length";
    protected static final String DISPLAY_INDEX = "displayIndex";
    protected static final String BLEND_MODE = "blendMode";
    protected static final String INHERIT_TRANSLATION = "inheritTranslation";
    protected static final String INHERIT_ROTATION = "inheritRotation";
    protected static final String INHERIT_SCALE = "inheritScale";
    protected static final String INHERIT_REFLECTION = "inheritReflection";
    protected static final String INHERIT_ANIMATION = "inheritAnimation";
    protected static final String INHERIT_FFD = "inheritFFD";
    protected static final String BEND_POSITIVE = "bendPositive";
    protected static final String CHAIN = "chain";
    protected static final String WEIGHT = "weight";

    protected static final String FADE_IN_TIME = "fadeInTime";
    protected static final String PLAY_TIMES = "playTimes";
    protected static final String SCALE = "scale";
    protected static final String OFFSET = "offset";
    protected static final String POSITION = "position";
    protected static final String DURATION = "duration";
    protected static final String TWEEN_TYPE = "tweenType";
    protected static final String TWEEN_EASING = "tweenEasing";
    protected static final String TWEEN_ROTATE = "tweenRotate";
    protected static final String TWEEN_SCALE = "tweenScale";
    protected static final String CURVE = "curve";
    protected static final String SOUND = "sound";
    protected static final String EVENT = "event";
    protected static final String ACTION = "action";

    protected static final String X = "x";
    protected static final String Y = "y";
    protected static final String SKEW_X = "skX";
    protected static final String SKEW_Y = "skY";
    protected static final String SCALE_X = "scX";
    protected static final String SCALE_Y = "scY";
    protected static final String VALUE = "value";
    protected static final String ROTATE = "rotate";
    protected static final String SKEW = "skew";

    protected static final String ALPHA_OFFSET = "aO";
    protected static final String RED_OFFSET = "rO";
    protected static final String GREEN_OFFSET = "gO";
    protected static final String BLUE_OFFSET = "bO";
    protected static final String ALPHA_MULTIPLIER = "aM";
    protected static final String RED_MULTIPLIER = "rM";
    protected static final String GREEN_MULTIPLIER = "gM";
    protected static final String BLUE_MULTIPLIER = "bM";

    protected static final String UVS = "uvs";
    protected static final String VERTICES = "vertices";
    protected static final String TRIANGLES = "triangles";
    protected static final String WEIGHTS = "weights";
    protected static final String SLOT_POSE = "slotPose";
    protected static final String BONE_POSE = "bonePose";

    protected static final String GOTO_AND_PLAY = "gotoAndPlay";

    protected static final String DEFAULT_NAME = "default";

    protected static ArmatureType _getArmatureType(String value) {
        switch (value.toLowerCase()) {
            case "stage":
                return ArmatureType.Stage;

            case "armature":
                return ArmatureType.Armature;

            case "movieclip":
                return ArmatureType.MovieClip;

            default:
                return ArmatureType.Armature;
        }
    }

    protected static DisplayType _getDisplayType(String value) {
        switch (value.toLowerCase()) {
            case "image":
                return DisplayType.Image;

            case "mesh":
                return DisplayType.Mesh;

            case "armature":
                return DisplayType.Armature;

            case "boundingbox":
                return DisplayType.BoundingBox;

            default:
                return DisplayType.Image;
        }
    }

    protected static BoundingBoxType _getBoundingBoxType(String value) {
        switch (value.toLowerCase()) {
            case "rectangle":
                return BoundingBoxType.Rectangle;

            case "ellipse":
                return BoundingBoxType.Ellipse;

            case "polygon":
                return BoundingBoxType.Polygon;

            default:
                return BoundingBoxType.Rectangle;
        }
    }

    protected static ActionType _getActionType(String value) {
        switch (value.toLowerCase()) {
            case "play":
                return ActionType.Play;

            case "frame":
                return ActionType.Frame;

            case "sound":
                return ActionType.Sound;

            default:
                return ActionType.Play;
        }
    }

    protected static BlendMode _getBlendMode(String value) {
        switch (value.toLowerCase()) {
            case "normal":
                return BlendMode.Normal;

            case "add":
                return BlendMode.Add;

            case "alpha":
                return BlendMode.Alpha;

            case "darken":
                return BlendMode.Darken;

            case "difference":
                return BlendMode.Difference;

            case "erase":
                return BlendMode.Erase;

            case "hardlight":
                return BlendMode.HardLight;

            case "invert":
                return BlendMode.Invert;

            case "layer":
                return BlendMode.Layer;

            case "lighten":
                return BlendMode.Lighten;

            case "multiply":
                return BlendMode.Multiply;

            case "overlay":
                return BlendMode.Overlay;

            case "screen":
                return BlendMode.Screen;

            case "subtract":
                return BlendMode.Subtract;

            default:
                return BlendMode.Normal;
        }
    }

    /**
     * @private
     */
    public abstract @Nullable
    DragonBonesData parseDragonBonesData(Object rawData, float scale);

    /**
     * @private
     */
    public abstract boolean parseTextureAtlasData(Object rawData, TextureAtlasData textureAtlasData, float scale);

    /**
     * @see BaseFactory#parseDragonBonesData(Object, String, float)
     * @deprecated 已废弃，请参考 @see
     */
    @Nullable
    public static DragonBonesData parseDragonBonesData(Object rawData) {
        if (rawData instanceof ArrayBuffer) {
            return parseDragonBonesDataBinary((ArrayBuffer)rawData);
        } else {
            return parseDragonBonesDataObject(rawData);
        }
    }

    @Nullable
    public static DragonBonesData parseDragonBonesDataBinary(ArrayBuffer arrayBuffer) {
        return BinaryDataParser.getInstance().parseDragonBonesData(arrayBuffer, 0f);
    }

    @Nullable
    public static DragonBonesData parseDragonBonesDataObject(Object obj) {
        return ObjectDataParser.getInstance().parseDragonBonesData(obj, 0f);
    }

    @Nullable
    public static DragonBonesData parseDragonBonesDataJson(String json) {
        return ObjectDataParser.getInstance().parseDragonBonesData(JSON.parse(json), 0f);
    }

    public static Map<String, Object> parseTextureAtlasData(Object rawData) {
        return parseTextureAtlasData(rawData, 1f);
    }

    /**
     * @see BaseFactory#parseTextureAtlasData(Object, Object, String, float)
     * @deprecated 已废弃，请参考 @see
     */
    public static Map<String, Object> parseTextureAtlasData(Object rawData, float scale) {
        Console.warn("已废弃，请参考 @see");
        Map<String, Object> textureAtlasData = new HashMap<String, Object>();

        ArrayBase<Object> subTextureList = getArray(rawData, DataParser.SUB_TEXTURE);
        for (int i = 0, len = subTextureList.length(); i < len; i++) {
            Object subTextureObject = subTextureList.getObject(i);
            String subTextureName = getString(subTextureObject, DataParser.NAME);
            Rectangle subTextureRegion = new Rectangle();
            Rectangle subTextureFrame = null;

            subTextureRegion.x = getFloat(subTextureObject, DataParser.X) / scale;
            subTextureRegion.y = getFloat(subTextureObject, DataParser.Y) / scale;
            subTextureRegion.width = getFloat(subTextureObject, DataParser.WIDTH) / scale;
            subTextureRegion.height = getFloat(subTextureObject, DataParser.HEIGHT) / scale;

            if (in(subTextureObject, DataParser.FRAME_WIDTH)) {
                subTextureFrame = new Rectangle();
                subTextureFrame.x = getFloat(subTextureObject, DataParser.FRAME_X) / scale;
                subTextureFrame.y = getFloat(subTextureObject, DataParser.FRAME_Y) / scale;
                subTextureFrame.width = getFloat(subTextureObject, DataParser.FRAME_WIDTH) / scale;
                subTextureFrame.height = getFloat(subTextureObject, DataParser.FRAME_HEIGHT) / scale;
            }

            Rectangle finalSubTextureFrame = subTextureFrame;
            textureAtlasData.put(subTextureName,
                    new HashMap<String, Object>() {
                        {
                            put("region", subTextureRegion);
                            put("frame", finalSubTextureFrame);
                            put("rotated", false);
                        }
                    }
            );
        }

        return textureAtlasData;
    }
}

