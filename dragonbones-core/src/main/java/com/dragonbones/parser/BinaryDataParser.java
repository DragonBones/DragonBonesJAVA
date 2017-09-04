package com.dragonbones.parser;

import com.dragonbones.core.BaseObject;
import com.dragonbones.core.BinaryOffset;
import com.dragonbones.core.TimelineType;
import com.dragonbones.factory.BaseFactory;
import com.dragonbones.model.*;
import com.dragonbones.util.*;
import com.dragonbones.util.buffer.*;
import com.dragonbones.util.json.JSON;
import org.jetbrains.annotations.Nullable;

import java.nio.charset.StandardCharsets;

import static com.dragonbones.util.Dynamic.*;

/**
 * @private
 */
public class BinaryDataParser extends ObjectDataParser {
    private ArrayBuffer _binary;
    private int _binaryOffset;
    private ShortArray _intArray;
    private FloatArray _floatArray;
    private ShortArray _frameIntArray;
    private FloatArray _frameFloatArray;
    private ShortArray _frameArray;
    private CharArray _timelineArray;

    /*
    private boolean _inRange(float a, float min, float max) {
        return min <= a && a <= max;
    }

    private String _decodeUTF8(Uint8Array data) {
        int EOF_byte = -1;
        int EOF_code_point = -1;
        int FATAL_POINT = 0xFFFD;

        int pos = 0;
        String result = "";
        Integer code_point = null;
        int utf8_code_point = 0;
        int utf8_bytes_needed = 0;
        int utf8_bytes_seen = 0;
        int utf8_lower_boundary = 0;

        while (data.length() > pos) {

            int _byte = data.get(pos++);

            if (_byte == EOF_byte) {
                if (utf8_bytes_needed != 0) {
                    code_point = FATAL_POINT;
                } else {
                    code_point = EOF_code_point;
                }
            } else {
                if (utf8_bytes_needed == 0) {
                    if (this._inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    } else {
                        if (this._inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        } else if (this._inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        } else if (this._inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        } else {

                        }
                        utf8_code_point = utf8_code_point * (int) Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                } else if (!this._inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = _byte;
                } else {

                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * (int) Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

                    if (utf8_bytes_seen != utf8_bytes_needed) {
                        code_point = null;
                    } else {

                        int cp = utf8_code_point;
                        int lower_boundary = utf8_lower_boundary;
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        if (this._inRange(cp, lower_boundary, 0x10FFFF) && !this._inRange(cp, 0xD800, 0xDFFF)) {
                            code_point = cp;
                        } else {
                            code_point = _byte;
                        }
                    }

                }
            }
            //Decode string
            if (code_point != null && code_point != EOF_code_point) {
                if (code_point <= 0xFFFF) {
                    if (code_point > 0) result += StringUtil.fromCodePoint(code_point);
                } else {
                    code_point -= 0x10000;
                    result += StringUtil.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += StringUtil.fromCharCode(0xDC00 + (code_point & 0x3ff));
                }
            }
        }

        return result;
    }

    private String _getUTF16Key(String value) {
        for (int i = 0, l = value.length(); i < l; ++i) {
            if (value.charAt(i) > 255) {
                return encodeURI(value);
            }
        }

        return value;
    }

    private String encodeURI(String value) {
        throw new RuntimeException("encodeURI not implemented");
    }
    */

    private TimelineData _parseBinaryTimeline(TimelineType type, int offset, @Nullable TimelineData timelineData) {
        TimelineData timeline = timelineData != null ? timelineData : BaseObject.borrowObject(TimelineData.class);
        timeline.type = type;
        timeline.offset = offset;

        this._timeline = timeline;

        int keyFrameCount = this._timelineArray.get(timeline.offset + BinaryOffset.TimelineKeyFrameCount.v);
        if (keyFrameCount == 1) {
            timeline.frameIndicesOffset = -1;
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
                    frameStart = this._frameArray.get(this._animation.frameOffset + this._timelineArray.get(timeline.offset + BinaryOffset.TimelineFrameOffset.v + iK));
                    if (iK == keyFrameCount - 1) {
                        frameCount = this._animation.frameCount - frameStart;
                    } else {
                        frameCount = this._frameArray.get(this._animation.frameOffset + this._timelineArray.get(timeline.offset + BinaryOffset.TimelineFrameOffset.v + iK + 1)) - frameStart;
                    }

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
    protected void _parseMesh(Object rawData, MeshDisplayData mesh) {
        mesh.offset = getInt(rawData, ObjectDataParser.OFFSET);

        int weightOffset = this._intArray.get(mesh.offset + BinaryOffset.MeshWeightOffset.v);
        if (weightOffset >= 0) {
            WeightData weight = BaseObject.borrowObject(WeightData.class);
            int vertexCount = this._intArray.get(mesh.offset + BinaryOffset.MeshVertexCount.v);
            int boneCount = this._intArray.get(weightOffset + BinaryOffset.WeigthBoneCount.v);
            weight.offset = weightOffset;
            weight.bones.setLength(boneCount);

            for (int i = 0; i < boneCount; ++i) {
                int boneIndex = this._intArray.get(weightOffset + BinaryOffset.WeigthBoneIndices.v + i);
                weight.bones.set(i, this._rawBones.get(boneIndex));
            }

            int boneIndicesOffset = weightOffset + BinaryOffset.WeigthBoneIndices.v + boneCount;
            for (int i = 0, l = vertexCount; i < l; ++i) {
                int vertexBoneCount = this._intArray.get(boneIndicesOffset++);
                weight.count += vertexBoneCount;
                boneIndicesOffset += vertexBoneCount;
            }

            mesh.weight = weight;
        }
    }

    /**
     * @private
     */
    protected PolygonBoundingBoxData _parsePolygonBoundingBox(Object rawData) {
        PolygonBoundingBoxData polygonBoundingBox = BaseObject.borrowObject(PolygonBoundingBoxData.class);
        polygonBoundingBox.offset = getInt(rawData, ObjectDataParser.OFFSET);
        polygonBoundingBox.vertices = this._floatArray;

        return polygonBoundingBox;
    }

    /**
     * @private
     */
    protected AnimationData _parseAnimation(Object rawData) {
        AnimationData animation = BaseObject.borrowObject(AnimationData.class);
        animation.frameCount = Math.max(getInt(rawData, ObjectDataParser.DURATION, 1), 1);
        animation.playTimes = getInt(rawData, ObjectDataParser.PLAY_TIMES, 1);
        animation.duration = animation.frameCount / this._armature.frameRate;
        animation.fadeInTime = getFloat(rawData, ObjectDataParser.FADE_IN_TIME, 0f);
        animation.scale = getFloat(rawData, ObjectDataParser.SCALE, 1f);
        animation.name = getString(rawData, ObjectDataParser.NAME, ObjectDataParser.DEFAULT_NAME);
        if (animation.name.length() == 0) {
            animation.name = ObjectDataParser.DEFAULT_NAME;
        }

        // Offsets.
        IntArray offsets = getIntArray(rawData, ObjectDataParser.OFFSET);
        animation.frameIntOffset = offsets.get(0);
        animation.frameFloatOffset = offsets.get(1);
        animation.frameOffset = offsets.get(2);

        this._animation = animation;

        if (in(rawData, ObjectDataParser.ACTION)) {
            animation.actionTimeline = this._parseBinaryTimeline(TimelineType.Action, getInt(rawData, ObjectDataParser.ACTION), null);
        }

        if (in(rawData, ObjectDataParser.Z_ORDER)) {
            animation.zOrderTimeline = this._parseBinaryTimeline(TimelineType.ZOrder, getInt(rawData, ObjectDataParser.Z_ORDER), null);
        }

        if (in(rawData, ObjectDataParser.BONE)) {
            ArrayBase<Object> rawTimeliness = getArray(rawData, ObjectDataParser.BONE);
            for (int k = 0; k < rawTimeliness.length(); k++) {
                ArrayBase<Object> rawTimelines = (ArrayBase<Object>) rawTimeliness.getObject(k);
                BoneData bone = this._armature.getBone("" + k);
                if (bone == null) {
                    continue;
                }

                for (int i = 0, l = rawTimelines.size(); i < l; i += 2) {
                    int timelineType = (int) rawTimelines.getObject(i);
                    int timelineOffset = (int) rawTimelines.getObject(i + 1);
                    TimelineData timeline = this._parseBinaryTimeline(TimelineType.values[timelineType], timelineOffset, null);
                    this._animation.addBoneTimeline(bone, timeline);
                }
            }
        }

        if (in(rawData, ObjectDataParser.SLOT)) {
            ArrayBase rawTimeliness = getArray(rawData, ObjectDataParser.SLOT);
            for (int k = 0; k < rawTimeliness.size(); k++) {
                ArrayBase rawTimelines = (ArrayBase) rawTimeliness.getObject(k);

                SlotData slot = this._armature.getSlot("" + k);
                if (slot == null) {
                    continue;
                }

                for (int i = 0, l = rawTimelines.size(); i < l; i += 2) {
                    int timelineType = (int) rawTimelines.getObject(i);
                    int timelineOffset = (int) rawTimelines.getObject(i + 1);
                    TimelineData timeline = this._parseBinaryTimeline(TimelineType.values[timelineType], timelineOffset, null);
                    this._animation.addSlotTimeline(slot, timeline);
                }
            }
        }

        this._animation = null;

        return animation;
    }

    /**
     * @private
     */
    protected void _parseArray(Object rawData) {
        IntArray offsets = getIntArray(rawData, ObjectDataParser.OFFSET);

        this._data.intArray = this._intArray = new Int16Array(this._binary, this._binaryOffset + offsets.get(0), offsets.get(1) / Int16Array.BYTES_PER_ELEMENT);
        this._data.floatArray = this._floatArray = new Float32Array(this._binary, this._binaryOffset + offsets.get(2), offsets.get(3) / Float32Array.BYTES_PER_ELEMENT);
        this._data.frameIntArray = this._frameIntArray = new Int16Array(this._binary, this._binaryOffset + offsets.get(4), offsets.get(5) / Int16Array.BYTES_PER_ELEMENT);
        this._data.frameFloatArray = this._frameFloatArray = new Float32Array(this._binary, this._binaryOffset + offsets.get(6), offsets.get(7) / Float32Array.BYTES_PER_ELEMENT);
        this._data.frameArray = this._frameArray = new Int16Array(this._binary, this._binaryOffset + offsets.get(8), offsets.get(9) / Int16Array.BYTES_PER_ELEMENT);
        this._data.timelineArray = this._timelineArray = new Uint16Array(this._binary, this._binaryOffset + offsets.get(10), offsets.get(11) / Uint16Array.BYTES_PER_ELEMENT);
    }

    @Nullable
    public DragonBonesData parseDragonBonesDataInstance(Object rawData) {
        return parseDragonBonesData(rawData, 1f);
    }

    /**
     * @inheritDoc
     */
    @Nullable
    public DragonBonesData parseDragonBonesData(Object rawData, float scale) {
        Console._assert(rawData != null && rawData instanceof ArrayBuffer);
        ArrayBuffer buffer = (ArrayBuffer) rawData;

        Uint8Array tag = new Uint8Array(buffer, 0, 8);
        if (tag.get(0) != 'D' || tag.get(1) != 'B' || tag.get(2) != 'D' || tag.get(3) != 'T') {
            Console._assert(false, "Nonsupport data.");
            return null;
        }

        int headerLength = new Uint32Array(buffer, 8, 1).get(0);

        //String headerString = this._decodeUTF8(new Uint8Array(buffer, 8 + 4, headerLength));
        String headerString = new String(buffer.getBytes(8 + 4, headerLength), StandardCharsets.UTF_8);

        Object header = JSON.parse(headerString);

        this._binary = buffer;
        this._binaryOffset = 8 + 4 + headerLength;

        return super.parseDragonBonesData(header, scale);
    }

    /**
     * @private
     */
    private static BinaryDataParser _binaryDataParserInstance = null;

    /**
     * @see BaseFactory#parseDragonBonesData(Object, String, float)
     * @deprecated 已废弃，请参考 @see
     */
    public static BinaryDataParser getInstance() {
        if (BinaryDataParser._binaryDataParserInstance == null) {
            BinaryDataParser._binaryDataParserInstance = new BinaryDataParser();
        }

        return BinaryDataParser._binaryDataParserInstance;
    }
}
