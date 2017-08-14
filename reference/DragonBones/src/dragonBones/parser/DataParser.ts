namespace dragonBones {
    /**
     * @private
     */
    export abstract class DataParser {
        protected static readonly DATA_VERSION_2_3: string = "2.3";
        protected static readonly DATA_VERSION_3_0: string = "3.0";
        protected static readonly DATA_VERSION_4_0: string = "4.0";
        protected static readonly DATA_VERSION_4_5: string = "4.5";
        protected static readonly DATA_VERSION_5_0: string = "5.0";
        protected static readonly DATA_VERSION: string = DataParser.DATA_VERSION_5_0;

        protected static readonly DATA_VERSIONS: Array<string> = [
            DataParser.DATA_VERSION_4_0,
            DataParser.DATA_VERSION_4_5,
            DataParser.DATA_VERSION_5_0
        ];

        protected static readonly TEXTURE_ATLAS: string = "textureAtlas";
        protected static readonly SUB_TEXTURE: string = "SubTexture";
        protected static readonly FORMAT: string = "format";
        protected static readonly IMAGE_PATH: string = "imagePath";
        protected static readonly WIDTH: string = "width";
        protected static readonly HEIGHT: string = "height";
        protected static readonly ROTATED: string = "rotated";
        protected static readonly FRAME_X: string = "frameX";
        protected static readonly FRAME_Y: string = "frameY";
        protected static readonly FRAME_WIDTH: string = "frameWidth";
        protected static readonly FRAME_HEIGHT: string = "frameHeight";

        protected static readonly DRADON_BONES: string = "dragonBones";
        protected static readonly USER_DATA: string = "userData";
        protected static readonly ARMATURE: string = "armature";
        protected static readonly BONE: string = "bone";
        protected static readonly IK: string = "ik";
        protected static readonly SLOT: string = "slot";
        protected static readonly SKIN: string = "skin";
        protected static readonly DISPLAY: string = "display";
        protected static readonly ANIMATION: string = "animation";
        protected static readonly Z_ORDER: string = "zOrder";
        protected static readonly FFD: string = "ffd";
        protected static readonly FRAME: string = "frame";
        protected static readonly TRANSLATE_FRAME: string = "translateFrame";
        protected static readonly ROTATE_FRAME: string = "rotateFrame";
        protected static readonly SCALE_FRAME: string = "scaleFrame";
        protected static readonly VISIBLE_FRAME: string = "visibleFrame";
        protected static readonly DISPLAY_FRAME: string = "displayFrame";
        protected static readonly COLOR_FRAME: string = "colorFrame";
        protected static readonly DEFAULT_ACTIONS: string = "defaultActions";
        protected static readonly ACTIONS: string = "actions";
        protected static readonly EVENTS: string = "events";
        protected static readonly INTS: string = "ints";
        protected static readonly FLOATS: string = "floats";
        protected static readonly STRINGS: string = "strings";
        protected static readonly CANVAS: string = "canvas";

        protected static readonly TRANSFORM: string = "transform";
        protected static readonly PIVOT: string = "pivot";
        protected static readonly AABB: string = "aabb";
        protected static readonly COLOR: string = "color";

        protected static readonly VERSION: string = "version";
        protected static readonly COMPATIBLE_VERSION: string = "compatibleVersion";
        protected static readonly FRAME_RATE: string = "frameRate";
        protected static readonly TYPE: string = "type";
        protected static readonly SUB_TYPE: string = "subType";
        protected static readonly NAME: string = "name";
        protected static readonly PARENT: string = "parent";
        protected static readonly TARGET: string = "target";
        protected static readonly SHARE: string = "share";
        protected static readonly PATH: string = "path";
        protected static readonly LENGTH: string = "length";
        protected static readonly DISPLAY_INDEX: string = "displayIndex";
        protected static readonly BLEND_MODE: string = "blendMode";
        protected static readonly INHERIT_TRANSLATION: string = "inheritTranslation";
        protected static readonly INHERIT_ROTATION: string = "inheritRotation";
        protected static readonly INHERIT_SCALE: string = "inheritScale";
        protected static readonly INHERIT_REFLECTION: string = "inheritReflection";
        protected static readonly INHERIT_ANIMATION: string = "inheritAnimation";
        protected static readonly INHERIT_FFD: string = "inheritFFD";
        protected static readonly BEND_POSITIVE: string = "bendPositive";
        protected static readonly CHAIN: string = "chain";
        protected static readonly WEIGHT: string = "weight";

        protected static readonly FADE_IN_TIME: string = "fadeInTime";
        protected static readonly PLAY_TIMES: string = "playTimes";
        protected static readonly SCALE: string = "scale";
        protected static readonly OFFSET: string = "offset";
        protected static readonly POSITION: string = "position";
        protected static readonly DURATION: string = "duration";
        protected static readonly TWEEN_TYPE: string = "tweenType";
        protected static readonly TWEEN_EASING: string = "tweenEasing";
        protected static readonly TWEEN_ROTATE: string = "tweenRotate";
        protected static readonly TWEEN_SCALE: string = "tweenScale";
        protected static readonly CURVE: string = "curve";
        protected static readonly SOUND: string = "sound";
        protected static readonly EVENT: string = "event";
        protected static readonly ACTION: string = "action";

        protected static readonly X: string = "x";
        protected static readonly Y: string = "y";
        protected static readonly SKEW_X: string = "skX";
        protected static readonly SKEW_Y: string = "skY";
        protected static readonly SCALE_X: string = "scX";
        protected static readonly SCALE_Y: string = "scY";
        protected static readonly VALUE: string = "value";
        protected static readonly ROTATE: string = "rotate";
        protected static readonly SKEW: string = "skew";

        protected static readonly ALPHA_OFFSET: string = "aO";
        protected static readonly RED_OFFSET: string = "rO";
        protected static readonly GREEN_OFFSET: string = "gO";
        protected static readonly BLUE_OFFSET: string = "bO";
        protected static readonly ALPHA_MULTIPLIER: string = "aM";
        protected static readonly RED_MULTIPLIER: string = "rM";
        protected static readonly GREEN_MULTIPLIER: string = "gM";
        protected static readonly BLUE_MULTIPLIER: string = "bM";

        protected static readonly UVS: string = "uvs";
        protected static readonly VERTICES: string = "vertices";
        protected static readonly TRIANGLES: string = "triangles";
        protected static readonly WEIGHTS: string = "weights";
        protected static readonly SLOT_POSE: string = "slotPose";
        protected static readonly BONE_POSE: string = "bonePose";

        protected static readonly GOTO_AND_PLAY: string = "gotoAndPlay";

        protected static readonly DEFAULT_NAME: string = "default";

        protected static _getArmatureType(value: string): ArmatureType {
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

        protected static _getDisplayType(value: string): DisplayType {
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

        protected static _getBoundingBoxType(value: string): BoundingBoxType {
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

        protected static _getActionType(value: string): ActionType {
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

        protected static _getBlendMode(value: string): BlendMode {
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
        public abstract parseDragonBonesData(rawData: any, scale: number): DragonBonesData | null;
        /**
         * @private
         */
        public abstract parseTextureAtlasData(rawData: any, textureAtlasData: TextureAtlasData, scale: number): boolean;

        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.BaseFactory#parseDragonBonesData()
         */
        public static parseDragonBonesData(rawData: any): DragonBonesData | null {
            if (rawData instanceof ArrayBuffer) {
                return BinaryDataParser.getInstance().parseDragonBonesData(rawData);
            }
            else {
                return ObjectDataParser.getInstance().parseDragonBonesData(rawData);
            }
        }
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.BaseFactory#parsetTextureAtlasData()
         */
        public static parseTextureAtlasData(rawData: any, scale: number = 1): any {
            console.warn("已废弃，请参考 @see");
            const textureAtlasData = {} as any;

            const subTextureList = rawData[DataParser.SUB_TEXTURE];
            for (let i = 0, len = subTextureList.length; i < len; i++) {
                const subTextureObject = subTextureList[i];
                const subTextureName = subTextureObject[DataParser.NAME];
                const subTextureRegion = new Rectangle();
                let subTextureFrame: Rectangle | null = null;

                subTextureRegion.x = subTextureObject[DataParser.X] / scale;
                subTextureRegion.y = subTextureObject[DataParser.Y] / scale;
                subTextureRegion.width = subTextureObject[DataParser.WIDTH] / scale;
                subTextureRegion.height = subTextureObject[DataParser.HEIGHT] / scale;

                if (DataParser.FRAME_WIDTH in subTextureObject) {
                    subTextureFrame = new Rectangle();
                    subTextureFrame.x = subTextureObject[DataParser.FRAME_X] / scale;
                    subTextureFrame.y = subTextureObject[DataParser.FRAME_Y] / scale;
                    subTextureFrame.width = subTextureObject[DataParser.FRAME_WIDTH] / scale;
                    subTextureFrame.height = subTextureObject[DataParser.FRAME_HEIGHT] / scale;
                }

                textureAtlasData[subTextureName] = { region: subTextureRegion, frame: subTextureFrame, rotated: false };
            }

            return textureAtlasData;
        }
    }
}
