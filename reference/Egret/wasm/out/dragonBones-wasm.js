"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var DragonBones = (function () {
        function DragonBones(eventManager) {
            this._clock = new dragonBones.WorldClock();
            this._events = [];
            this._objects = [];
            this._eventManager = null;
            this._eventManager = eventManager;
        }
        DragonBones.prototype.advanceTime = function (passedTime) {
            if (this._objects.length > 0) {
                for (var _i = 0, _a = this._objects; _i < _a.length; _i++) {
                    var object = _a[_i];
                    object.returnToPool();
                }
                this._objects.length = 0;
            }
            this._clock.advanceTime(passedTime);
            if (this._events.length > 0) {
                for (var i = 0; i < this._events.length; ++i) {
                    var eventObject = this._events[i];
                    var armature = eventObject.armature;
                    armature.eventDispatcher._dispatchEvent(eventObject.type, eventObject);
                    if (eventObject.type === dragonBones.EventObject.SOUND_EVENT) {
                        this._eventManager._dispatchEvent(eventObject.type, eventObject);
                    }
                    this.bufferObject(eventObject);
                }
                this._events.length = 0;
            }
        };
        DragonBones.prototype.bufferEvent = function (value) {
            if (this._events.indexOf(value) < 0) {
                this._events.push(value);
            }
        };
        DragonBones.prototype.bufferObject = function (object) {
            if (this._objects.indexOf(object) < 0) {
                this._objects.push(object);
            }
        };
        Object.defineProperty(DragonBones.prototype, "clock", {
            get: function () {
                return this._clock;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DragonBones.prototype, "eventManager", {
            get: function () {
                return this._eventManager;
            },
            enumerable: true,
            configurable: true
        });
        DragonBones.yDown = true;
        DragonBones.debug = false;
        DragonBones.debugDraw = false;
        DragonBones.webAssembly = false;
        DragonBones.VERSION = "5.1.0";
        return DragonBones;
    }());
    dragonBones.DragonBones = DragonBones;
    if (!console.warn) {
        console.warn = function () { };
    }
    if (!console.assert) {
        console.assert = function () { };
    }
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 基础对象。
     * @version DragonBones 4.5
     * @language zh_CN
     */
    var BaseObject = (function () {
        function BaseObject() {
            /**
             * 对象的唯一标识。
             * @version DragonBones 4.5
             * @language zh_CN
             */
            this.hashCode = BaseObject._hashCode++;
            this._isInPool = false;
        }
        BaseObject._returnObject = function (object) {
            var classType = String(object.constructor);
            var maxCount = classType in BaseObject._maxCountMap ? BaseObject._defaultMaxCount : BaseObject._maxCountMap[classType];
            var pool = BaseObject._poolsMap[classType] = BaseObject._poolsMap[classType] || [];
            if (pool.length < maxCount) {
                if (!object._isInPool) {
                    object._isInPool = true;
                    pool.push(object);
                }
                else {
                    console.assert(false, "The object is already in the pool.");
                }
            }
            else {
            }
        };
        /**
         * @private
         */
        BaseObject.toString = function () {
            throw new Error();
        };
        /**
         * 设置每种对象池的最大缓存数量。
         * @param objectConstructor 对象类。
         * @param maxCount 最大缓存数量。 (设置为 0 则不缓存)
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseObject.setMaxCount = function (objectConstructor, maxCount) {
            if (maxCount < 0 || maxCount !== maxCount) {
                maxCount = 0;
            }
            if (objectConstructor !== null) {
                var classType = String(objectConstructor);
                var pool = classType in BaseObject._poolsMap ? BaseObject._poolsMap[classType] : null;
                if (pool !== null && pool.length > maxCount) {
                    pool.length = maxCount;
                }
                BaseObject._maxCountMap[classType] = maxCount;
            }
            else {
                BaseObject._defaultMaxCount = maxCount;
                for (var classType in BaseObject._poolsMap) {
                    if (classType in BaseObject._maxCountMap) {
                        continue;
                    }
                    var pool = BaseObject._poolsMap[classType];
                    if (pool.length > maxCount) {
                        pool.length = maxCount;
                    }
                    BaseObject._maxCountMap[classType] = maxCount;
                }
            }
        };
        /**
         * 清除对象池缓存的对象。
         * @param objectConstructor 对象类。 (不设置则清除所有缓存)
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseObject.clearPool = function (objectConstructor) {
            if (objectConstructor === void 0) { objectConstructor = null; }
            if (objectConstructor !== null) {
                var classType = String(objectConstructor);
                var pool = classType in BaseObject._poolsMap ? BaseObject._poolsMap[classType] : null;
                if (pool !== null && pool.length > 0) {
                    pool.length = 0;
                }
            }
            else {
                for (var k in BaseObject._poolsMap) {
                    var pool = BaseObject._poolsMap[k];
                    pool.length = 0;
                }
            }
        };
        /**
         * 从对象池中创建指定对象。
         * @param objectConstructor 对象类。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseObject.borrowObject = function (objectConstructor) {
            var classType = String(objectConstructor);
            var pool = classType in BaseObject._poolsMap ? BaseObject._poolsMap[classType] : null;
            if (pool !== null && pool.length > 0) {
                var object_1 = pool.pop();
                object_1._isInPool = false;
                return object_1;
            }
            var object = new objectConstructor();
            object._onClear();
            return object;
        };
        /**
         * 清除数据并返还对象池。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseObject.prototype.returnToPool = function () {
            this._onClear();
            BaseObject._returnObject(this);
        };
        BaseObject._hashCode = 0;
        BaseObject._defaultMaxCount = 1000;
        BaseObject._maxCountMap = {};
        BaseObject._poolsMap = {};
        return BaseObject;
    }());
    dragonBones.BaseObject = BaseObject;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 2D 矩阵。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var Matrix = (function () {
        function Matrix(a, b, c, d, tx, ty) {
            if (a === void 0) { a = 1.0; }
            if (b === void 0) { b = 0.0; }
            if (c === void 0) { c = 0.0; }
            if (d === void 0) { d = 1.0; }
            if (tx === void 0) { tx = 0.0; }
            if (ty === void 0) { ty = 0.0; }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        /**
         * @private
         */
        Matrix.prototype.toString = function () {
            return "[object dragonBones.Matrix] a:" + this.a + " b:" + this.b + " c:" + this.c + " d:" + this.d + " tx:" + this.tx + " ty:" + this.ty;
        };
        /**
         * @private
         */
        Matrix.prototype.copyFrom = function (value) {
            this.a = value.a;
            this.b = value.b;
            this.c = value.c;
            this.d = value.d;
            this.tx = value.tx;
            this.ty = value.ty;
            return this;
        };
        /**
         * @private
         */
        Matrix.prototype.copyFromArray = function (value, offset) {
            if (offset === void 0) { offset = 0; }
            this.a = value[offset];
            this.b = value[offset + 1];
            this.c = value[offset + 2];
            this.d = value[offset + 3];
            this.tx = value[offset + 4];
            this.ty = value[offset + 5];
            return this;
        };
        /**
         * 转换为单位矩阵。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Matrix.prototype.identity = function () {
            this.a = this.d = 1.0;
            this.b = this.c = 0.0;
            this.tx = this.ty = 0.0;
            return this;
        };
        /**
         * 将当前矩阵与另一个矩阵相乘。
         * @param value 需要相乘的矩阵。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Matrix.prototype.concat = function (value) {
            var aA = this.a * value.a;
            var bA = 0.0;
            var cA = 0.0;
            var dA = this.d * value.d;
            var txA = this.tx * value.a + value.tx;
            var tyA = this.ty * value.d + value.ty;
            if (this.b !== 0.0 || this.c !== 0.0) {
                aA += this.b * value.c;
                bA += this.b * value.d;
                cA += this.c * value.a;
                dA += this.c * value.b;
            }
            if (value.b !== 0.0 || value.c !== 0.0) {
                bA += this.a * value.b;
                cA += this.d * value.c;
                txA += this.ty * value.c;
                tyA += this.tx * value.b;
            }
            this.a = aA;
            this.b = bA;
            this.c = cA;
            this.d = dA;
            this.tx = txA;
            this.ty = tyA;
            return this;
        };
        /**
         * 转换为逆矩阵。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Matrix.prototype.invert = function () {
            var aA = this.a;
            var bA = this.b;
            var cA = this.c;
            var dA = this.d;
            var txA = this.tx;
            var tyA = this.ty;
            if (bA === 0.0 && cA === 0.0) {
                this.b = this.c = 0.0;
                if (aA === 0.0 || dA === 0.0) {
                    this.a = this.b = this.tx = this.ty = 0.0;
                }
                else {
                    aA = this.a = 1.0 / aA;
                    dA = this.d = 1.0 / dA;
                    this.tx = -aA * txA;
                    this.ty = -dA * tyA;
                }
                return this;
            }
            var determinant = aA * dA - bA * cA;
            if (determinant === 0.0) {
                this.a = this.d = 1.0;
                this.b = this.c = 0.0;
                this.tx = this.ty = 0.0;
                return this;
            }
            determinant = 1.0 / determinant;
            var k = this.a = dA * determinant;
            bA = this.b = -bA * determinant;
            cA = this.c = -cA * determinant;
            dA = this.d = aA * determinant;
            this.tx = -(k * txA + cA * tyA);
            this.ty = -(bA * txA + dA * tyA);
            return this;
        };
        /**
         * 将矩阵转换应用于指定点。
         * @param x 横坐标。
         * @param y 纵坐标。
         * @param result 应用转换之后的坐标。
         * @params delta 是否忽略 tx，ty 对坐标的转换。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Matrix.prototype.transformPoint = function (x, y, result, delta) {
            if (delta === void 0) { delta = false; }
            result.x = this.a * x + this.c * y;
            result.y = this.b * x + this.d * y;
            if (!delta) {
                result.x += this.tx;
                result.y += this.ty;
            }
        };
        return Matrix;
    }());
    dragonBones.Matrix = Matrix;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 2D 变换。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var Transform = (function () {
        function Transform(
            /**
             * 水平位移。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            x, 
            /**
             * 垂直位移。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            y, 
            /**
             * 倾斜。 (以弧度为单位)
             * @version DragonBones 3.0
             * @language zh_CN
             */
            skew, 
            /**
             * 旋转。 (以弧度为单位)
             * @version DragonBones 3.0
             * @language zh_CN
             */
            rotation, 
            /**
             * 水平缩放。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            scaleX, 
            /**
             * 垂直缩放。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            scaleY) {
            if (x === void 0) { x = 0.0; }
            if (y === void 0) { y = 0.0; }
            if (skew === void 0) { skew = 0.0; }
            if (rotation === void 0) { rotation = 0.0; }
            if (scaleX === void 0) { scaleX = 1.0; }
            if (scaleY === void 0) { scaleY = 1.0; }
            this.x = x;
            this.y = y;
            this.skew = skew;
            this.rotation = rotation;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }
        /**
         * @private
         */
        Transform.normalizeRadian = function (value) {
            value = (value + Math.PI) % (Math.PI * 2.0);
            value += value > 0.0 ? -Math.PI : Math.PI;
            return value;
        };
        /**
         * @private
         */
        Transform.prototype.toString = function () {
            return "[object dragonBones.Transform] x:" + this.x + " y:" + this.y + " skewX:" + this.skew * 180.0 / Math.PI + " skewY:" + this.rotation * 180.0 / Math.PI + " scaleX:" + this.scaleX + " scaleY:" + this.scaleY;
        };
        /**
         * @private
         */
        Transform.prototype.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
            this.skew = value.skew;
            this.rotation = value.rotation;
            this.scaleX = value.scaleX;
            this.scaleY = value.scaleY;
            return this;
        };
        /**
         * @private
         */
        Transform.prototype.identity = function () {
            this.x = this.y = 0.0;
            this.skew = this.rotation = 0.0;
            this.scaleX = this.scaleY = 1.0;
            return this;
        };
        /**
         * @private
         */
        Transform.prototype.add = function (value) {
            this.x += value.x;
            this.y += value.y;
            this.skew += value.skew;
            this.rotation += value.rotation;
            this.scaleX *= value.scaleX;
            this.scaleY *= value.scaleY;
            return this;
        };
        /**
         * @private
         */
        Transform.prototype.minus = function (value) {
            this.x -= value.x;
            this.y -= value.y;
            this.skew -= value.skew;
            this.rotation -= value.rotation;
            this.scaleX /= value.scaleX;
            this.scaleY /= value.scaleY;
            return this;
        };
        /**
         * 矩阵转换为变换。
         * @param matrix 矩阵。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Transform.prototype.fromMatrix = function (matrix) {
            var backupScaleX = this.scaleX, backupScaleY = this.scaleY;
            var PI_Q = Transform.PI_Q;
            this.x = matrix.tx;
            this.y = matrix.ty;
            this.rotation = Math.atan(matrix.b / matrix.a);
            var skewX = Math.atan(-matrix.c / matrix.d);
            this.scaleX = (this.rotation > -PI_Q && this.rotation < PI_Q) ? matrix.a / Math.cos(this.rotation) : matrix.b / Math.sin(this.rotation);
            this.scaleY = (skewX > -PI_Q && skewX < PI_Q) ? matrix.d / Math.cos(skewX) : -matrix.c / Math.sin(skewX);
            if (backupScaleX >= 0.0 && this.scaleX < 0.0) {
                this.scaleX = -this.scaleX;
                this.rotation = this.rotation - Math.PI;
            }
            if (backupScaleY >= 0.0 && this.scaleY < 0.0) {
                this.scaleY = -this.scaleY;
                skewX = skewX - Math.PI;
            }
            this.skew = skewX - this.rotation;
            return this;
        };
        /**
         * 转换为矩阵。
         * @param matrix 矩阵。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Transform.prototype.toMatrix = function (matrix) {
            if (this.skew !== 0.0 || this.rotation !== 0.0) {
                matrix.a = Math.cos(this.rotation);
                matrix.b = Math.sin(this.rotation);
                if (this.skew === 0.0) {
                    matrix.c = -matrix.b;
                    matrix.d = matrix.a;
                }
                else {
                    matrix.c = -Math.sin(this.skew + this.rotation);
                    matrix.d = Math.cos(this.skew + this.rotation);
                }
                if (this.scaleX !== 1.0) {
                    matrix.a *= this.scaleX;
                    matrix.b *= this.scaleX;
                }
                if (this.scaleY !== 1.0) {
                    matrix.c *= this.scaleY;
                    matrix.d *= this.scaleY;
                }
            }
            else {
                matrix.a = this.scaleX;
                matrix.b = 0.0;
                matrix.c = 0.0;
                matrix.d = this.scaleY;
            }
            matrix.tx = this.x;
            matrix.ty = this.y;
            return this;
        };
        /**
         * @private
         */
        Transform.PI_D = Math.PI * 2.0;
        /**
         * @private
         */
        Transform.PI_H = Math.PI / 2.0;
        /**
         * @private
         */
        Transform.PI_Q = Math.PI / 4.0;
        /**
         * @private
         */
        Transform.RAD_DEG = 180.0 / Math.PI;
        /**
         * @private
         */
        Transform.DEG_RAD = Math.PI / 180.0;
        return Transform;
    }());
    dragonBones.Transform = Transform;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var ColorTransform = (function () {
        function ColorTransform(alphaMultiplier, redMultiplier, greenMultiplier, blueMultiplier, alphaOffset, redOffset, greenOffset, blueOffset) {
            if (alphaMultiplier === void 0) { alphaMultiplier = 1.0; }
            if (redMultiplier === void 0) { redMultiplier = 1.0; }
            if (greenMultiplier === void 0) { greenMultiplier = 1.0; }
            if (blueMultiplier === void 0) { blueMultiplier = 1.0; }
            if (alphaOffset === void 0) { alphaOffset = 0; }
            if (redOffset === void 0) { redOffset = 0; }
            if (greenOffset === void 0) { greenOffset = 0; }
            if (blueOffset === void 0) { blueOffset = 0; }
            this.alphaMultiplier = alphaMultiplier;
            this.redMultiplier = redMultiplier;
            this.greenMultiplier = greenMultiplier;
            this.blueMultiplier = blueMultiplier;
            this.alphaOffset = alphaOffset;
            this.redOffset = redOffset;
            this.greenOffset = greenOffset;
            this.blueOffset = blueOffset;
        }
        ColorTransform.prototype.copyFrom = function (value) {
            this.alphaMultiplier = value.alphaMultiplier;
            this.redMultiplier = value.redMultiplier;
            this.greenMultiplier = value.greenMultiplier;
            this.blueMultiplier = value.blueMultiplier;
            this.alphaOffset = value.alphaOffset;
            this.redOffset = value.redOffset;
            this.greenOffset = value.greenOffset;
            this.blueOffset = value.blueOffset;
        };
        ColorTransform.prototype.identity = function () {
            this.alphaMultiplier = this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 1.0;
            this.alphaOffset = this.redOffset = this.greenOffset = this.blueOffset = 0;
        };
        return ColorTransform;
    }());
    dragonBones.ColorTransform = ColorTransform;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    var Point = (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0.0; }
            if (y === void 0) { y = 0.0; }
            this.x = x;
            this.y = y;
        }
        Point.prototype.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
        };
        Point.prototype.clear = function () {
            this.x = this.y = 0.0;
        };
        return Point;
    }());
    dragonBones.Point = Point;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    var Rectangle = (function () {
        function Rectangle(x, y, width, height) {
            if (x === void 0) { x = 0.0; }
            if (y === void 0) { y = 0.0; }
            if (width === void 0) { width = 0.0; }
            if (height === void 0) { height = 0.0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Rectangle.prototype.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
            this.width = value.width;
            this.height = value.height;
        };
        Rectangle.prototype.clear = function () {
            this.x = this.y = 0.0;
            this.width = this.height = 0.0;
        };
        return Rectangle;
    }());
    dragonBones.Rectangle = Rectangle;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 自定义数据。
     * @version DragonBones 5.0
     * @language zh_CN
     */
    var UserData = (function (_super) {
        __extends(UserData, _super);
        function UserData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * 自定义整数。
             * @version DragonBones 5.0
             * @language zh_CN
             */
            _this.ints = [];
            /**
             * 自定义浮点数。
             * @version DragonBones 5.0
             * @language zh_CN
             */
            _this.floats = [];
            /**
             * 自定义字符串。
             * @version DragonBones 5.0
             * @language zh_CN
             */
            _this.strings = [];
            return _this;
        }
        /**
         * @private
         */
        UserData.toString = function () {
            return "[class dragonBones.UserData]";
        };
        /**
         * @private
         */
        UserData.prototype._onClear = function () {
            this.ints.length = 0;
            this.floats.length = 0;
            this.strings.length = 0;
        };
        /**
         * 获取自定义整数。
         * @version DragonBones 5.0
         * @language zh_CN
         */
        UserData.prototype.getInt = function (index) {
            if (index === void 0) { index = 0; }
            return index >= 0 && index < this.ints.length ? this.ints[index] : 0;
        };
        /**
         * 获取自定义浮点数。
         * @version DragonBones 5.0
         * @language zh_CN
         */
        UserData.prototype.getFloat = function (index) {
            if (index === void 0) { index = 0; }
            return index >= 0 && index < this.floats.length ? this.floats[index] : 0.0;
        };
        /**
         * 获取自定义字符串。
         * @version DragonBones 5.0
         * @language zh_CN
         */
        UserData.prototype.getString = function (index) {
            if (index === void 0) { index = 0; }
            return index >= 0 && index < this.strings.length ? this.strings[index] : "";
        };
        return UserData;
    }(dragonBones.BaseObject));
    dragonBones.UserData = UserData;
    /**
     * @private
     */
    var ActionData = (function (_super) {
        __extends(ActionData, _super);
        function ActionData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.data = null; //
            return _this;
        }
        ActionData.toString = function () {
            return "[class dragonBones.ActionData]";
        };
        ActionData.prototype._onClear = function () {
            if (this.data !== null) {
                this.data.returnToPool();
            }
            this.type = 0 /* Play */;
            this.name = "";
            this.bone = null;
            this.slot = null;
            this.data = null;
        };
        return ActionData;
    }(dragonBones.BaseObject));
    dragonBones.ActionData = ActionData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 龙骨数据。
     * 一个龙骨数据包含多个骨架数据。
     * @see dragonBones.ArmatureData
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var DragonBonesData = (function (_super) {
        __extends(DragonBonesData, _super);
        function DragonBonesData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.frameIndices = [];
            /**
             * @private
             */
            _this.cachedFrames = [];
            /**
             * 所有骨架数据名称。
             * @see #armatures
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.armatureNames = [];
            /**
             * 所有骨架数据。
             * @see dragonBones.ArmatureData
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.armatures = {};
            /**
             * @private
             */
            _this.userData = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        DragonBonesData.toString = function () {
            return "[class dragonBones.DragonBonesData]";
        };
        /**
         * @private
         */
        DragonBonesData.prototype._onClear = function () {
            for (var k in this.armatures) {
                this.armatures[k].returnToPool();
                delete this.armatures[k];
            }
            if (this.userData !== null) {
                this.userData.returnToPool();
            }
            this.autoSearch = false;
            this.frameRate = 0;
            this.version = "";
            this.name = "";
            this.frameIndices.length = 0;
            this.cachedFrames.length = 0;
            this.armatureNames.length = 0;
            //this.armatures.clear();
            this.intArray = null; //
            this.floatArray = null; //
            this.frameIntArray = null; //
            this.frameFloatArray = null; //
            this.frameArray = null; //
            this.timelineArray = null; //
            this.userData = null;
        };
        /**
         * @private
         */
        DragonBonesData.prototype.addArmature = function (value) {
            if (value.name in this.armatures) {
                console.warn("Replace armature: " + value.name);
                this.armatures[value.name].returnToPool();
            }
            value.parent = this;
            this.armatures[value.name] = value;
            this.armatureNames.push(value.name);
        };
        /**
         * 获取骨架数据。
         * @param name 骨架数据名称。
         * @see dragonBones.ArmatureData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        DragonBonesData.prototype.getArmature = function (name) {
            return name in this.armatures ? this.armatures[name] : null;
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.BaseFactory#removeDragonBonesData()
         */
        DragonBonesData.prototype.dispose = function () {
            console.warn("已废弃，请参考 @see");
            this.returnToPool();
        };
        return DragonBonesData;
    }(dragonBones.BaseObject));
    dragonBones.DragonBonesData = DragonBonesData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var CanvasData = (function (_super) {
        __extends(CanvasData, _super);
        function CanvasData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * @private
         */
        CanvasData.toString = function () {
            return "[class dragonBones.CanvasData]";
        };
        /**
         * @private
         */
        CanvasData.prototype._onClear = function () {
            this.hasBackground = false;
            this.color = 0x000000;
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        };
        return CanvasData;
    }(dragonBones.BaseObject));
    dragonBones.CanvasData = CanvasData;
    /**
     * 骨架数据。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var ArmatureData = (function (_super) {
        __extends(ArmatureData, _super);
        function ArmatureData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.aabb = new dragonBones.Rectangle();
            /**
             * 所有动画数据名称。
             * @see #armatures
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.animationNames = [];
            /**
             * @private
             */
            _this.sortedBones = [];
            /**
             * @private
             */
            _this.sortedSlots = [];
            /**
             * @private
             */
            _this.defaultActions = [];
            /**
             * @private
             */
            _this.actions = [];
            /**
             * 所有骨骼数据。
             * @see dragonBones.BoneData
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.bones = {};
            /**
             * 所有插槽数据。
             * @see dragonBones.SlotData
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.slots = {};
            /**
             * 所有皮肤数据。
             * @see dragonBones.SkinData
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.skins = {};
            /**
             * 所有动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.animations = {};
            /**
             * @private
             */
            _this.canvas = null; // Initial value.
            /**
             * @private
             */
            _this.userData = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        ArmatureData.toString = function () {
            return "[class dragonBones.ArmatureData]";
        };
        /**
         * @private
         */
        ArmatureData.prototype._onClear = function () {
            for (var _i = 0, _a = this.defaultActions; _i < _a.length; _i++) {
                var action = _a[_i];
                action.returnToPool();
            }
            for (var _b = 0, _c = this.actions; _b < _c.length; _b++) {
                var action = _c[_b];
                action.returnToPool();
            }
            for (var k in this.bones) {
                this.bones[k].returnToPool();
                delete this.bones[k];
            }
            for (var k in this.slots) {
                this.slots[k].returnToPool();
                delete this.slots[k];
            }
            for (var k in this.skins) {
                this.skins[k].returnToPool();
                delete this.skins[k];
            }
            for (var k in this.animations) {
                this.animations[k].returnToPool();
                delete this.animations[k];
            }
            if (this.canvas !== null) {
                this.canvas.returnToPool();
            }
            if (this.userData !== null) {
                this.userData.returnToPool();
            }
            this.type = 0 /* Armature */;
            this.frameRate = 0;
            this.cacheFrameRate = 0;
            this.scale = 1.0;
            this.name = "";
            this.aabb.clear();
            this.animationNames.length = 0;
            this.sortedBones.length = 0;
            this.sortedSlots.length = 0;
            this.defaultActions.length = 0;
            this.actions.length = 0;
            //this.bones.clear();
            //this.slots.clear();
            //this.skins.clear();
            //this.animations.clear();
            this.defaultSkin = null;
            this.defaultAnimation = null;
            this.canvas = null;
            this.userData = null;
            this.parent = null; //
        };
        /**
         * @private
         */
        ArmatureData.prototype.sortBones = function () {
            var total = this.sortedBones.length;
            if (total <= 0) {
                return;
            }
            var sortHelper = this.sortedBones.concat();
            var index = 0;
            var count = 0;
            this.sortedBones.length = 0;
            while (count < total) {
                var bone = sortHelper[index++];
                if (index >= total) {
                    index = 0;
                }
                if (this.sortedBones.indexOf(bone) >= 0) {
                    continue;
                }
                if (bone.constraints.length > 0) {
                    var flag = false;
                    for (var _i = 0, _a = bone.constraints; _i < _a.length; _i++) {
                        var constraint = _a[_i];
                        if (this.sortedBones.indexOf(constraint.target) < 0) {
                            flag = true;
                        }
                    }
                    if (flag) {
                        continue;
                    }
                }
                if (bone.parent !== null && this.sortedBones.indexOf(bone.parent) < 0) {
                    continue;
                }
                this.sortedBones.push(bone);
                count++;
            }
        };
        /**
         * @private
         */
        ArmatureData.prototype.cacheFrames = function (frameRate) {
            if (this.cacheFrameRate > 0) {
                return;
            }
            this.cacheFrameRate = frameRate;
            for (var k in this.animations) {
                this.animations[k].cacheFrames(this.cacheFrameRate);
            }
        };
        /**
         * @private
         */
        ArmatureData.prototype.setCacheFrame = function (globalTransformMatrix, transform) {
            var dataArray = this.parent.cachedFrames;
            var arrayOffset = dataArray.length;
            dataArray.length += 10;
            dataArray[arrayOffset] = globalTransformMatrix.a;
            dataArray[arrayOffset + 1] = globalTransformMatrix.b;
            dataArray[arrayOffset + 2] = globalTransformMatrix.c;
            dataArray[arrayOffset + 3] = globalTransformMatrix.d;
            dataArray[arrayOffset + 4] = globalTransformMatrix.tx;
            dataArray[arrayOffset + 5] = globalTransformMatrix.ty;
            dataArray[arrayOffset + 6] = transform.rotation;
            dataArray[arrayOffset + 7] = transform.skew;
            dataArray[arrayOffset + 8] = transform.scaleX;
            dataArray[arrayOffset + 9] = transform.scaleY;
            return arrayOffset;
        };
        /**
         * @private
         */
        ArmatureData.prototype.getCacheFrame = function (globalTransformMatrix, transform, arrayOffset) {
            var dataArray = this.parent.cachedFrames;
            globalTransformMatrix.a = dataArray[arrayOffset];
            globalTransformMatrix.b = dataArray[arrayOffset + 1];
            globalTransformMatrix.c = dataArray[arrayOffset + 2];
            globalTransformMatrix.d = dataArray[arrayOffset + 3];
            globalTransformMatrix.tx = dataArray[arrayOffset + 4];
            globalTransformMatrix.ty = dataArray[arrayOffset + 5];
            transform.rotation = dataArray[arrayOffset + 6];
            transform.skew = dataArray[arrayOffset + 7];
            transform.scaleX = dataArray[arrayOffset + 8];
            transform.scaleY = dataArray[arrayOffset + 9];
            transform.x = globalTransformMatrix.tx;
            transform.y = globalTransformMatrix.ty;
        };
        /**
         * @private
         */
        ArmatureData.prototype.addBone = function (value) {
            if (value.name in this.bones) {
                console.warn("Replace bone: " + value.name);
                this.bones[value.name].returnToPool();
            }
            this.bones[value.name] = value;
            this.sortedBones.push(value);
        };
        /**
         * @private
         */
        ArmatureData.prototype.addSlot = function (value) {
            if (value.name in this.slots) {
                console.warn("Replace slot: " + value.name);
                this.slots[value.name].returnToPool();
            }
            this.slots[value.name] = value;
            this.sortedSlots.push(value);
        };
        /**
         * @private
         */
        ArmatureData.prototype.addSkin = function (value) {
            if (value.name in this.skins) {
                console.warn("Replace skin: " + value.name);
                this.skins[value.name].returnToPool();
            }
            this.skins[value.name] = value;
            if (this.defaultSkin === null) {
                this.defaultSkin = value;
            }
        };
        /**
         * @private
         */
        ArmatureData.prototype.addAnimation = function (value) {
            if (value.name in this.animations) {
                console.warn("Replace animation: " + value.name);
                this.animations[value.name].returnToPool();
            }
            value.parent = this;
            this.animations[value.name] = value;
            this.animationNames.push(value.name);
            if (this.defaultAnimation === null) {
                this.defaultAnimation = value;
            }
        };
        /**
         * 获取骨骼数据。
         * @param name 数据名称。
         * @version DragonBones 3.0
         * @see dragonBones.BoneData
         * @language zh_CN
         */
        ArmatureData.prototype.getBone = function (name) {
            return name in this.bones ? this.bones[name] : null;
        };
        /**
         * 获取插槽数据。
         * @param name 数据名称。
         * @version DragonBones 3.0
         * @see dragonBones.SlotData
         * @language zh_CN
         */
        ArmatureData.prototype.getSlot = function (name) {
            return name in this.slots ? this.slots[name] : null;
        };
        /**
         * 获取皮肤数据。
         * @param name 数据名称。
         * @version DragonBones 3.0
         * @see dragonBones.SkinData
         * @language zh_CN
         */
        ArmatureData.prototype.getSkin = function (name) {
            return name in this.skins ? this.skins[name] : null;
        };
        /**
         * 获取动画数据。
         * @param name 数据名称。
         * @version DragonBones 3.0
         * @see dragonBones.AnimationData
         * @language zh_CN
         */
        ArmatureData.prototype.getAnimation = function (name) {
            return name in this.animations ? this.animations[name] : null;
        };
        return ArmatureData;
    }(dragonBones.BaseObject));
    dragonBones.ArmatureData = ArmatureData;
    /**
     * 骨骼数据。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var BoneData = (function (_super) {
        __extends(BoneData, _super);
        function BoneData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.transform = new dragonBones.Transform();
            /**
             * @private
             */
            _this.constraints = [];
            /**
             * @private
             */
            _this.userData = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        BoneData.toString = function () {
            return "[class dragonBones.BoneData]";
        };
        /**
         * @private
         */
        BoneData.prototype._onClear = function () {
            for (var _i = 0, _a = this.constraints; _i < _a.length; _i++) {
                var constraint = _a[_i];
                constraint.returnToPool();
            }
            if (this.userData !== null) {
                this.userData.returnToPool();
            }
            this.inheritTranslation = false;
            this.inheritRotation = false;
            this.inheritScale = false;
            this.inheritReflection = false;
            this.length = 0.0;
            this.name = "";
            this.transform.identity();
            this.constraints.length = 0;
            this.userData = null;
            this.parent = null;
        };
        return BoneData;
    }(dragonBones.BaseObject));
    dragonBones.BoneData = BoneData;
    /**
     * 插槽数据。
     * @see dragonBones.Slot
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var SlotData = (function (_super) {
        __extends(SlotData, _super);
        function SlotData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.color = null; // Initial value.
            /**
             * @private
             */
            _this.userData = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        SlotData.createColor = function () {
            return new dragonBones.ColorTransform();
        };
        /**
         * @private
         */
        SlotData.toString = function () {
            return "[class dragonBones.SlotData]";
        };
        /**
         * @private
         */
        SlotData.prototype._onClear = function () {
            if (this.userData !== null) {
                this.userData.returnToPool();
            }
            this.blendMode = 0 /* Normal */;
            this.displayIndex = 0;
            this.zOrder = 0;
            this.name = "";
            this.color = null; //
            this.userData = null;
            this.parent = null; //
        };
        /**
         * @private
         */
        SlotData.DEFAULT_COLOR = new dragonBones.ColorTransform();
        return SlotData;
    }(dragonBones.BaseObject));
    dragonBones.SlotData = SlotData;
    /**
     * 皮肤数据。（通常一个骨架数据至少包含一个皮肤数据）
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var SkinData = (function (_super) {
        __extends(SkinData, _super);
        function SkinData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.displays = {};
            return _this;
        }
        SkinData.toString = function () {
            return "[class dragonBones.SkinData]";
        };
        /**
         * @private
         */
        SkinData.prototype._onClear = function () {
            for (var k in this.displays) {
                var slotDisplays = this.displays[k];
                for (var _i = 0, slotDisplays_1 = slotDisplays; _i < slotDisplays_1.length; _i++) {
                    var display = slotDisplays_1[_i];
                    if (display !== null) {
                        display.returnToPool();
                    }
                }
                delete this.displays[k];
            }
            this.name = "";
            // this.displays.clear();
        };
        /**
         * @private
         */
        SkinData.prototype.addDisplay = function (slotName, value) {
            if (!(slotName in this.displays)) {
                this.displays[slotName] = [];
            }
            var slotDisplays = this.displays[slotName]; // TODO clear prev
            slotDisplays.push(value);
        };
        /**
         * @private
         */
        SkinData.prototype.getDisplay = function (slotName, displayName) {
            var slotDisplays = this.getDisplays(slotName);
            if (slotDisplays !== null) {
                for (var _i = 0, slotDisplays_2 = slotDisplays; _i < slotDisplays_2.length; _i++) {
                    var display = slotDisplays_2[_i];
                    if (display !== null && display.name === displayName) {
                        return display;
                    }
                }
            }
            return null;
        };
        /**
         * @private
         */
        SkinData.prototype.getDisplays = function (slotName) {
            if (!(slotName in this.displays)) {
                return null;
            }
            return this.displays[slotName];
        };
        return SkinData;
    }(dragonBones.BaseObject));
    dragonBones.SkinData = SkinData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var ConstraintData = (function (_super) {
        __extends(ConstraintData, _super);
        function ConstraintData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ConstraintData.prototype._onClear = function () {
            this.order = 0;
            this.target = null; //
            this.bone = null; //
            this.root = null;
        };
        return ConstraintData;
    }(dragonBones.BaseObject));
    dragonBones.ConstraintData = ConstraintData;
    /**
     * @private
     */
    var IKConstraintData = (function (_super) {
        __extends(IKConstraintData, _super);
        function IKConstraintData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        IKConstraintData.toString = function () {
            return "[class dragonBones.IKConstraintData]";
        };
        IKConstraintData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.bendPositive = false;
            this.scaleEnabled = false;
            this.weight = 1.0;
        };
        return IKConstraintData;
    }(ConstraintData));
    dragonBones.IKConstraintData = IKConstraintData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var DisplayData = (function (_super) {
        __extends(DisplayData, _super);
        function DisplayData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.transform = new dragonBones.Transform();
            return _this;
        }
        DisplayData.prototype._onClear = function () {
            this.name = "";
            this.path = "";
            this.transform.identity();
            this.parent = null; //
        };
        return DisplayData;
    }(dragonBones.BaseObject));
    dragonBones.DisplayData = DisplayData;
    /**
     * @private
     */
    var ImageDisplayData = (function (_super) {
        __extends(ImageDisplayData, _super);
        function ImageDisplayData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.pivot = new dragonBones.Point();
            return _this;
        }
        ImageDisplayData.toString = function () {
            return "[class dragonBones.ImageDisplayData]";
        };
        ImageDisplayData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.type = 0 /* Image */;
            this.pivot.clear();
            this.texture = null;
        };
        return ImageDisplayData;
    }(DisplayData));
    dragonBones.ImageDisplayData = ImageDisplayData;
    /**
     * @private
     */
    var ArmatureDisplayData = (function (_super) {
        __extends(ArmatureDisplayData, _super);
        function ArmatureDisplayData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.actions = [];
            return _this;
        }
        ArmatureDisplayData.toString = function () {
            return "[class dragonBones.ArmatureDisplayData]";
        };
        ArmatureDisplayData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
                var action = _a[_i];
                action.returnToPool();
            }
            this.type = 1 /* Armature */;
            this.inheritAnimation = false;
            this.actions.length = 0;
            this.armature = null;
        };
        return ArmatureDisplayData;
    }(DisplayData));
    dragonBones.ArmatureDisplayData = ArmatureDisplayData;
    /**
     * @private
     */
    var MeshDisplayData = (function (_super) {
        __extends(MeshDisplayData, _super);
        function MeshDisplayData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.weight = null; // Initial value.
            return _this;
        }
        MeshDisplayData.toString = function () {
            return "[class dragonBones.MeshDisplayData]";
        };
        MeshDisplayData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.weight !== null) {
                this.weight.returnToPool();
            }
            this.type = 2 /* Mesh */;
            this.inheritAnimation = false;
            this.offset = 0;
            this.weight = null;
        };
        return MeshDisplayData;
    }(ImageDisplayData));
    dragonBones.MeshDisplayData = MeshDisplayData;
    /**
     * @private
     */
    var BoundingBoxDisplayData = (function (_super) {
        __extends(BoundingBoxDisplayData, _super);
        function BoundingBoxDisplayData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.boundingBox = null; // Initial value.
            return _this;
        }
        BoundingBoxDisplayData.toString = function () {
            return "[class dragonBones.BoundingBoxDisplayData]";
        };
        BoundingBoxDisplayData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.boundingBox !== null) {
                this.boundingBox.returnToPool();
            }
            this.type = 3 /* BoundingBox */;
            this.boundingBox = null;
        };
        return BoundingBoxDisplayData;
    }(DisplayData));
    dragonBones.BoundingBoxDisplayData = BoundingBoxDisplayData;
    /**
     * @private
     */
    var WeightData = (function (_super) {
        __extends(WeightData, _super);
        function WeightData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.bones = [];
            return _this;
        }
        WeightData.toString = function () {
            return "[class dragonBones.WeightData]";
        };
        WeightData.prototype._onClear = function () {
            this.count = 0;
            this.offset = 0;
            this.bones.length = 0;
        };
        return WeightData;
    }(dragonBones.BaseObject));
    dragonBones.WeightData = WeightData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 边界框数据基类。
     * @see dragonBones.RectangleData
     * @see dragonBones.EllipseData
     * @see dragonBones.PolygonData
     * @version DragonBones 5.0
     * @language zh_CN
     */
    var BoundingBoxData = (function (_super) {
        __extends(BoundingBoxData, _super);
        function BoundingBoxData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * @private
         */
        BoundingBoxData.prototype._onClear = function () {
            this.color = 0x000000;
            this.width = 0.0;
            this.height = 0.0;
        };
        return BoundingBoxData;
    }(dragonBones.BaseObject));
    dragonBones.BoundingBoxData = BoundingBoxData;
    /**
     * 矩形边界框。
     * @version DragonBones 5.1
     * @language zh_CN
     */
    var RectangleBoundingBoxData = (function (_super) {
        __extends(RectangleBoundingBoxData, _super);
        function RectangleBoundingBoxData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * @private
         */
        RectangleBoundingBoxData.toString = function () {
            return "[class dragonBones.RectangleBoundingBoxData]";
        };
        /**
         * Compute the bit code for a point (x, y) using the clip rectangle
         */
        RectangleBoundingBoxData._computeOutCode = function (x, y, xMin, yMin, xMax, yMax) {
            var code = 0 /* InSide */; // initialised as being inside of [[clip window]]
            if (x < xMin) {
                code |= 1 /* Left */;
            }
            else if (x > xMax) {
                code |= 2 /* Right */;
            }
            if (y < yMin) {
                code |= 4 /* Top */;
            }
            else if (y > yMax) {
                code |= 8 /* Bottom */;
            }
            return code;
        };
        /**
         * @private
         */
        RectangleBoundingBoxData.rectangleIntersectsSegment = function (xA, yA, xB, yB, xMin, yMin, xMax, yMax, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var inSideA = xA > xMin && xA < xMax && yA > yMin && yA < yMax;
            var inSideB = xB > xMin && xB < xMax && yB > yMin && yB < yMax;
            if (inSideA && inSideB) {
                return -1;
            }
            var intersectionCount = 0;
            var outcode0 = RectangleBoundingBoxData._computeOutCode(xA, yA, xMin, yMin, xMax, yMax);
            var outcode1 = RectangleBoundingBoxData._computeOutCode(xB, yB, xMin, yMin, xMax, yMax);
            while (true) {
                if ((outcode0 | outcode1) === 0) {
                    intersectionCount = 2;
                    break;
                }
                else if ((outcode0 & outcode1) !== 0) {
                    break;
                }
                // failed both tests, so calculate the line segment to clip
                // from an outside point to an intersection with clip edge
                var x = 0.0;
                var y = 0.0;
                var normalRadian = 0.0;
                // At least one endpoint is outside the clip rectangle; pick it.
                var outcodeOut = outcode0 !== 0 ? outcode0 : outcode1;
                // Now find the intersection point;
                if ((outcodeOut & 4 /* Top */) !== 0) {
                    x = xA + (xB - xA) * (yMin - yA) / (yB - yA);
                    y = yMin;
                    if (normalRadians !== null) {
                        normalRadian = -Math.PI * 0.5;
                    }
                }
                else if ((outcodeOut & 8 /* Bottom */) !== 0) {
                    x = xA + (xB - xA) * (yMax - yA) / (yB - yA);
                    y = yMax;
                    if (normalRadians !== null) {
                        normalRadian = Math.PI * 0.5;
                    }
                }
                else if ((outcodeOut & 2 /* Right */) !== 0) {
                    y = yA + (yB - yA) * (xMax - xA) / (xB - xA);
                    x = xMax;
                    if (normalRadians !== null) {
                        normalRadian = 0;
                    }
                }
                else if ((outcodeOut & 1 /* Left */) !== 0) {
                    y = yA + (yB - yA) * (xMin - xA) / (xB - xA);
                    x = xMin;
                    if (normalRadians !== null) {
                        normalRadian = Math.PI;
                    }
                }
                // Now we move outside point to intersection point to clip
                // and get ready for next pass.
                if (outcodeOut === outcode0) {
                    xA = x;
                    yA = y;
                    outcode0 = RectangleBoundingBoxData._computeOutCode(xA, yA, xMin, yMin, xMax, yMax);
                    if (normalRadians !== null) {
                        normalRadians.x = normalRadian;
                    }
                }
                else {
                    xB = x;
                    yB = y;
                    outcode1 = RectangleBoundingBoxData._computeOutCode(xB, yB, xMin, yMin, xMax, yMax);
                    if (normalRadians !== null) {
                        normalRadians.y = normalRadian;
                    }
                }
            }
            if (intersectionCount) {
                if (inSideA) {
                    intersectionCount = 2; // 10
                    if (intersectionPointA !== null) {
                        intersectionPointA.x = xB;
                        intersectionPointA.y = yB;
                    }
                    if (intersectionPointB !== null) {
                        intersectionPointB.x = xB;
                        intersectionPointB.y = xB;
                    }
                    if (normalRadians !== null) {
                        normalRadians.x = normalRadians.y + Math.PI;
                    }
                }
                else if (inSideB) {
                    intersectionCount = 1; // 01
                    if (intersectionPointA !== null) {
                        intersectionPointA.x = xA;
                        intersectionPointA.y = yA;
                    }
                    if (intersectionPointB !== null) {
                        intersectionPointB.x = xA;
                        intersectionPointB.y = yA;
                    }
                    if (normalRadians !== null) {
                        normalRadians.y = normalRadians.x + Math.PI;
                    }
                }
                else {
                    intersectionCount = 3; // 11
                    if (intersectionPointA !== null) {
                        intersectionPointA.x = xA;
                        intersectionPointA.y = yA;
                    }
                    if (intersectionPointB !== null) {
                        intersectionPointB.x = xB;
                        intersectionPointB.y = yB;
                    }
                }
            }
            return intersectionCount;
        };
        /**
         * @private
         */
        RectangleBoundingBoxData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.type = 0 /* Rectangle */;
        };
        /**
         * @inherDoc
         */
        RectangleBoundingBoxData.prototype.containsPoint = function (pX, pY) {
            var widthH = this.width * 0.5;
            if (pX >= -widthH && pX <= widthH) {
                var heightH = this.height * 0.5;
                if (pY >= -heightH && pY <= heightH) {
                    return true;
                }
            }
            return false;
        };
        /**
         * @inherDoc
         */
        RectangleBoundingBoxData.prototype.intersectsSegment = function (xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var widthH = this.width * 0.5;
            var heightH = this.height * 0.5;
            var intersectionCount = RectangleBoundingBoxData.rectangleIntersectsSegment(xA, yA, xB, yB, -widthH, -heightH, widthH, heightH, intersectionPointA, intersectionPointB, normalRadians);
            return intersectionCount;
        };
        return RectangleBoundingBoxData;
    }(BoundingBoxData));
    dragonBones.RectangleBoundingBoxData = RectangleBoundingBoxData;
    /**
     * 椭圆边界框。
     * @version DragonBones 5.1
     * @language zh_CN
     */
    var EllipseBoundingBoxData = (function (_super) {
        __extends(EllipseBoundingBoxData, _super);
        function EllipseBoundingBoxData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * @private
         */
        EllipseBoundingBoxData.toString = function () {
            return "[class dragonBones.EllipseData]";
        };
        /**
         * @private
         */
        EllipseBoundingBoxData.ellipseIntersectsSegment = function (xA, yA, xB, yB, xC, yC, widthH, heightH, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var d = widthH / heightH;
            var dd = d * d;
            yA *= d;
            yB *= d;
            var dX = xB - xA;
            var dY = yB - yA;
            var lAB = Math.sqrt(dX * dX + dY * dY);
            var xD = dX / lAB;
            var yD = dY / lAB;
            var a = (xC - xA) * xD + (yC - yA) * yD;
            var aa = a * a;
            var ee = xA * xA + yA * yA;
            var rr = widthH * widthH;
            var dR = rr - ee + aa;
            var intersectionCount = 0;
            if (dR >= 0.0) {
                var dT = Math.sqrt(dR);
                var sA = a - dT;
                var sB = a + dT;
                var inSideA = sA < 0.0 ? -1 : (sA <= lAB ? 0 : 1);
                var inSideB = sB < 0.0 ? -1 : (sB <= lAB ? 0 : 1);
                var sideAB = inSideA * inSideB;
                if (sideAB < 0) {
                    return -1;
                }
                else if (sideAB === 0) {
                    if (inSideA === -1) {
                        intersectionCount = 2; // 10
                        xB = xA + sB * xD;
                        yB = (yA + sB * yD) / d;
                        if (intersectionPointA !== null) {
                            intersectionPointA.x = xB;
                            intersectionPointA.y = yB;
                        }
                        if (intersectionPointB !== null) {
                            intersectionPointB.x = xB;
                            intersectionPointB.y = yB;
                        }
                        if (normalRadians !== null) {
                            normalRadians.x = Math.atan2(yB / rr * dd, xB / rr);
                            normalRadians.y = normalRadians.x + Math.PI;
                        }
                    }
                    else if (inSideB === 1) {
                        intersectionCount = 1; // 01
                        xA = xA + sA * xD;
                        yA = (yA + sA * yD) / d;
                        if (intersectionPointA !== null) {
                            intersectionPointA.x = xA;
                            intersectionPointA.y = yA;
                        }
                        if (intersectionPointB !== null) {
                            intersectionPointB.x = xA;
                            intersectionPointB.y = yA;
                        }
                        if (normalRadians !== null) {
                            normalRadians.x = Math.atan2(yA / rr * dd, xA / rr);
                            normalRadians.y = normalRadians.x + Math.PI;
                        }
                    }
                    else {
                        intersectionCount = 3; // 11
                        if (intersectionPointA !== null) {
                            intersectionPointA.x = xA + sA * xD;
                            intersectionPointA.y = (yA + sA * yD) / d;
                            if (normalRadians !== null) {
                                normalRadians.x = Math.atan2(intersectionPointA.y / rr * dd, intersectionPointA.x / rr);
                            }
                        }
                        if (intersectionPointB !== null) {
                            intersectionPointB.x = xA + sB * xD;
                            intersectionPointB.y = (yA + sB * yD) / d;
                            if (normalRadians !== null) {
                                normalRadians.y = Math.atan2(intersectionPointB.y / rr * dd, intersectionPointB.x / rr);
                            }
                        }
                    }
                }
            }
            return intersectionCount;
        };
        /**
         * @private
         */
        EllipseBoundingBoxData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.type = 1 /* Ellipse */;
        };
        /**
         * @inherDoc
         */
        EllipseBoundingBoxData.prototype.containsPoint = function (pX, pY) {
            var widthH = this.width * 0.5;
            if (pX >= -widthH && pX <= widthH) {
                var heightH = this.height * 0.5;
                if (pY >= -heightH && pY <= heightH) {
                    pY *= widthH / heightH;
                    return Math.sqrt(pX * pX + pY * pY) <= widthH;
                }
            }
            return false;
        };
        /**
         * @inherDoc
         */
        EllipseBoundingBoxData.prototype.intersectsSegment = function (xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var intersectionCount = EllipseBoundingBoxData.ellipseIntersectsSegment(xA, yA, xB, yB, 0.0, 0.0, this.width * 0.5, this.height * 0.5, intersectionPointA, intersectionPointB, normalRadians);
            return intersectionCount;
        };
        return EllipseBoundingBoxData;
    }(BoundingBoxData));
    dragonBones.EllipseBoundingBoxData = EllipseBoundingBoxData;
    /**
     * 多边形边界框。
     * @version DragonBones 5.1
     * @language zh_CN
     */
    var PolygonBoundingBoxData = (function (_super) {
        __extends(PolygonBoundingBoxData, _super);
        function PolygonBoundingBoxData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.weight = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        PolygonBoundingBoxData.toString = function () {
            return "[class dragonBones.PolygonBoundingBoxData]";
        };
        /**
         * @private
         */
        PolygonBoundingBoxData.polygonIntersectsSegment = function (xA, yA, xB, yB, vertices, offset, count, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            if (xA === xB) {
                xA = xB + 0.000001;
            }
            if (yA === yB) {
                yA = yB + 0.000001;
            }
            var dXAB = xA - xB;
            var dYAB = yA - yB;
            var llAB = xA * yB - yA * xB;
            var intersectionCount = 0;
            var xC = vertices[offset + count - 2];
            var yC = vertices[offset + count - 1];
            var dMin = 0.0;
            var dMax = 0.0;
            var xMin = 0.0;
            var yMin = 0.0;
            var xMax = 0.0;
            var yMax = 0.0;
            for (var i = 0; i < count; i += 2) {
                var xD = vertices[offset + i];
                var yD = vertices[offset + i + 1];
                if (xC === xD) {
                    xC = xD + 0.0001;
                }
                if (yC === yD) {
                    yC = yD + 0.0001;
                }
                var dXCD = xC - xD;
                var dYCD = yC - yD;
                var llCD = xC * yD - yC * xD;
                var ll = dXAB * dYCD - dYAB * dXCD;
                var x = (llAB * dXCD - dXAB * llCD) / ll;
                if (((x >= xC && x <= xD) || (x >= xD && x <= xC)) && (dXAB === 0.0 || (x >= xA && x <= xB) || (x >= xB && x <= xA))) {
                    var y = (llAB * dYCD - dYAB * llCD) / ll;
                    if (((y >= yC && y <= yD) || (y >= yD && y <= yC)) && (dYAB === 0.0 || (y >= yA && y <= yB) || (y >= yB && y <= yA))) {
                        if (intersectionPointB !== null) {
                            var d = x - xA;
                            if (d < 0.0) {
                                d = -d;
                            }
                            if (intersectionCount === 0) {
                                dMin = d;
                                dMax = d;
                                xMin = x;
                                yMin = y;
                                xMax = x;
                                yMax = y;
                                if (normalRadians !== null) {
                                    normalRadians.x = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                    normalRadians.y = normalRadians.x;
                                }
                            }
                            else {
                                if (d < dMin) {
                                    dMin = d;
                                    xMin = x;
                                    yMin = y;
                                    if (normalRadians !== null) {
                                        normalRadians.x = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                    }
                                }
                                if (d > dMax) {
                                    dMax = d;
                                    xMax = x;
                                    yMax = y;
                                    if (normalRadians !== null) {
                                        normalRadians.y = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                    }
                                }
                            }
                            intersectionCount++;
                        }
                        else {
                            xMin = x;
                            yMin = y;
                            xMax = x;
                            yMax = y;
                            intersectionCount++;
                            if (normalRadians !== null) {
                                normalRadians.x = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                normalRadians.y = normalRadians.x;
                            }
                            break;
                        }
                    }
                }
                xC = xD;
                yC = yD;
            }
            if (intersectionCount === 1) {
                if (intersectionPointA !== null) {
                    intersectionPointA.x = xMin;
                    intersectionPointA.y = yMin;
                }
                if (intersectionPointB !== null) {
                    intersectionPointB.x = xMin;
                    intersectionPointB.y = yMin;
                }
                if (normalRadians !== null) {
                    normalRadians.y = normalRadians.x + Math.PI;
                }
            }
            else if (intersectionCount > 1) {
                intersectionCount++;
                if (intersectionPointA !== null) {
                    intersectionPointA.x = xMin;
                    intersectionPointA.y = yMin;
                }
                if (intersectionPointB !== null) {
                    intersectionPointB.x = xMax;
                    intersectionPointB.y = yMax;
                }
            }
            return intersectionCount;
        };
        /**
         * @private
         */
        PolygonBoundingBoxData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.weight !== null) {
                this.weight.returnToPool();
            }
            this.type = 2 /* Polygon */;
            this.count = 0;
            this.offset = 0;
            this.x = 0.0;
            this.y = 0.0;
            this.vertices = null; //
            this.weight = null;
        };
        /**
         * @inherDoc
         */
        PolygonBoundingBoxData.prototype.containsPoint = function (pX, pY) {
            var isInSide = false;
            if (pX >= this.x && pX <= this.width && pY >= this.y && pY <= this.height) {
                for (var i = 0, l = this.count, iP = l - 2; i < l; i += 2) {
                    var yA = this.vertices[this.offset + iP + 1];
                    var yB = this.vertices[this.offset + i + 1];
                    if ((yB < pY && yA >= pY) || (yA < pY && yB >= pY)) {
                        var xA = this.vertices[this.offset + iP];
                        var xB = this.vertices[this.offset + i];
                        if ((pY - yB) * (xA - xB) / (yA - yB) + xB < pX) {
                            isInSide = !isInSide;
                        }
                    }
                    iP = i;
                }
            }
            return isInSide;
        };
        /**
         * @inherDoc
         */
        PolygonBoundingBoxData.prototype.intersectsSegment = function (xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var intersectionCount = 0;
            if (RectangleBoundingBoxData.rectangleIntersectsSegment(xA, yA, xB, yB, this.x, this.y, this.width, this.height, null, null, null) !== 0) {
                intersectionCount = PolygonBoundingBoxData.polygonIntersectsSegment(xA, yA, xB, yB, this.vertices, this.offset, this.count, intersectionPointA, intersectionPointB, normalRadians);
            }
            return intersectionCount;
        };
        return PolygonBoundingBoxData;
    }(BoundingBoxData));
    dragonBones.PolygonBoundingBoxData = PolygonBoundingBoxData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 动画数据。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var AnimationData = (function (_super) {
        __extends(AnimationData, _super);
        function AnimationData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.cachedFrames = [];
            /**
             * @private
             */
            _this.boneTimelines = {};
            /**
             * @private
             */
            _this.slotTimelines = {};
            /**
             * @private
             */
            _this.boneCachedFrameIndices = {};
            /**
             * @private
             */
            _this.slotCachedFrameIndices = {};
            /**
             * @private
             */
            _this.actionTimeline = null; // Initial value.
            /**
             * @private
             */
            _this.zOrderTimeline = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        AnimationData.toString = function () {
            return "[class dragonBones.AnimationData]";
        };
        /**
         * @private
         */
        AnimationData.prototype._onClear = function () {
            for (var k in this.boneTimelines) {
                for (var kA in this.boneTimelines[k]) {
                    this.boneTimelines[k][kA].returnToPool();
                }
                delete this.boneTimelines[k];
            }
            for (var k in this.slotTimelines) {
                for (var kA in this.slotTimelines[k]) {
                    this.slotTimelines[k][kA].returnToPool();
                }
                delete this.slotTimelines[k];
            }
            for (var k in this.boneCachedFrameIndices) {
                delete this.boneCachedFrameIndices[k];
            }
            for (var k in this.slotCachedFrameIndices) {
                delete this.slotCachedFrameIndices[k];
            }
            if (this.actionTimeline !== null) {
                this.actionTimeline.returnToPool();
            }
            if (this.zOrderTimeline !== null) {
                this.zOrderTimeline.returnToPool();
            }
            this.frameIntOffset = 0;
            this.frameFloatOffset = 0;
            this.frameOffset = 0;
            this.frameCount = 0;
            this.playTimes = 0;
            this.duration = 0.0;
            this.scale = 1.0;
            this.fadeInTime = 0.0;
            this.cacheFrameRate = 0.0;
            this.name = "";
            this.cachedFrames.length = 0;
            //this.boneTimelines.clear();
            //this.slotTimelines.clear();
            //this.boneCachedFrameIndices.clear();
            //this.slotCachedFrameIndices.clear();
            this.actionTimeline = null;
            this.zOrderTimeline = null;
            this.parent = null; //
        };
        /**
         * @private
         */
        AnimationData.prototype.cacheFrames = function (frameRate) {
            if (this.cacheFrameRate > 0.0) {
                return;
            }
            this.cacheFrameRate = Math.max(Math.ceil(frameRate * this.scale), 1.0);
            var cacheFrameCount = Math.ceil(this.cacheFrameRate * this.duration) + 1; // Cache one more frame.
            this.cachedFrames.length = cacheFrameCount;
            for (var i = 0, l = this.cacheFrames.length; i < l; ++i) {
                this.cachedFrames[i] = false;
            }
            for (var _i = 0, _a = this.parent.sortedBones; _i < _a.length; _i++) {
                var bone = _a[_i];
                var indices = new Array(cacheFrameCount);
                for (var i = 0, l = indices.length; i < l; ++i) {
                    indices[i] = -1;
                }
                this.boneCachedFrameIndices[bone.name] = indices;
            }
            for (var _b = 0, _c = this.parent.sortedSlots; _b < _c.length; _b++) {
                var slot = _c[_b];
                var indices = new Array(cacheFrameCount);
                for (var i = 0, l = indices.length; i < l; ++i) {
                    indices[i] = -1;
                }
                this.slotCachedFrameIndices[slot.name] = indices;
            }
        };
        /**
         * @private
         */
        AnimationData.prototype.addBoneTimeline = function (bone, timeline) {
            var timelines = bone.name in this.boneTimelines ? this.boneTimelines[bone.name] : (this.boneTimelines[bone.name] = []);
            if (timelines.indexOf(timeline) < 0) {
                timelines.push(timeline);
            }
        };
        /**
         * @private
         */
        AnimationData.prototype.addSlotTimeline = function (slot, timeline) {
            var timelines = slot.name in this.slotTimelines ? this.slotTimelines[slot.name] : (this.slotTimelines[slot.name] = []);
            if (timelines.indexOf(timeline) < 0) {
                timelines.push(timeline);
            }
        };
        /**
         * @private
         */
        AnimationData.prototype.getBoneTimelines = function (name) {
            return name in this.boneTimelines ? this.boneTimelines[name] : null;
        };
        /**
         * @private
         */
        AnimationData.prototype.getSlotTimeline = function (name) {
            return name in this.slotTimelines ? this.slotTimelines[name] : null;
        };
        /**
         * @private
         */
        AnimationData.prototype.getBoneCachedFrameIndices = function (name) {
            return name in this.boneCachedFrameIndices ? this.boneCachedFrameIndices[name] : null;
        };
        /**
         * @private
         */
        AnimationData.prototype.getSlotCachedFrameIndices = function (name) {
            return name in this.slotCachedFrameIndices ? this.slotCachedFrameIndices[name] : null;
        };
        return AnimationData;
    }(dragonBones.BaseObject));
    dragonBones.AnimationData = AnimationData;
    /**
     * @private
     */
    var TimelineData = (function (_super) {
        __extends(TimelineData, _super);
        function TimelineData() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TimelineData.toString = function () {
            return "[class dragonBones.TimelineData]";
        };
        TimelineData.prototype._onClear = function () {
            this.type = 10 /* BoneAll */;
            this.offset = 0;
            this.frameIndicesOffset = -1;
        };
        return TimelineData;
    }(dragonBones.BaseObject));
    dragonBones.TimelineData = TimelineData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 动画配置，描述播放一个动画所需要的全部信息。
     * @see dragonBones.AnimationState
     * @version DragonBones 5.0
     * @beta
     * @language zh_CN
     */
    var AnimationConfig = (function (_super) {
        __extends(AnimationConfig, _super);
        function AnimationConfig() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * 骨骼遮罩。
             * @version DragonBones 5.0
             * @language zh_CN
             */
            _this.boneMask = [];
            return _this;
        }
        AnimationConfig.toString = function () {
            return "[class dragonBones.AnimationConfig]";
        };
        /**
         * @private
         */
        AnimationConfig.prototype._onClear = function () {
            this.pauseFadeOut = true;
            this.fadeOutMode = 4 /* All */;
            this.fadeOutTweenType = 1 /* Line */;
            this.fadeOutTime = -1.0;
            this.actionEnabled = true;
            this.additiveBlending = false;
            this.displayControl = true;
            this.pauseFadeIn = true;
            this.resetToPose = true;
            this.fadeInTweenType = 1 /* Line */;
            this.playTimes = -1;
            this.layer = 0;
            this.position = 0.0;
            this.duration = -1.0;
            this.timeScale = -100.0;
            this.fadeInTime = -1.0;
            this.autoFadeOutTime = -1.0;
            this.weight = 1.0;
            this.name = "";
            this.animation = "";
            this.group = "";
            this.boneMask.length = 0;
        };
        AnimationConfig.prototype.clear = function () {
            this._onClear();
        };
        AnimationConfig.prototype.copyFrom = function (value) {
            this.pauseFadeOut = value.pauseFadeOut;
            this.fadeOutMode = value.fadeOutMode;
            this.autoFadeOutTime = value.autoFadeOutTime;
            this.fadeOutTweenType = value.fadeOutTweenType;
            this.actionEnabled = value.actionEnabled;
            this.additiveBlending = value.additiveBlending;
            this.displayControl = value.displayControl;
            this.pauseFadeIn = value.pauseFadeIn;
            this.resetToPose = value.resetToPose;
            this.playTimes = value.playTimes;
            this.layer = value.layer;
            this.position = value.position;
            this.duration = value.duration;
            this.timeScale = value.timeScale;
            this.fadeInTime = value.fadeInTime;
            this.fadeOutTime = value.fadeOutTime;
            this.fadeInTweenType = value.fadeInTweenType;
            this.weight = value.weight;
            this.name = value.name;
            this.animation = value.animation;
            this.group = value.group;
            this.boneMask.length = value.boneMask.length;
            for (var i = 0, l = this.boneMask.length; i < l; ++i) {
                this.boneMask[i] = value.boneMask[i];
            }
        };
        AnimationConfig.prototype.containsBoneMask = function (name) {
            return this.boneMask.length === 0 || this.boneMask.indexOf(name) >= 0;
        };
        AnimationConfig.prototype.addBoneMask = function (armature, name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var currentBone = armature.getBone(name);
            if (currentBone === null) {
                return;
            }
            if (this.boneMask.indexOf(name) < 0) {
                this.boneMask.push(name);
            }
            if (recursive) {
                for (var _i = 0, _a = armature.getBones(); _i < _a.length; _i++) {
                    var bone = _a[_i];
                    if (this.boneMask.indexOf(bone.name) < 0 && currentBone.contains(bone)) {
                        this.boneMask.push(bone.name);
                    }
                }
            }
        };
        AnimationConfig.prototype.removeBoneMask = function (armature, name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var index = this.boneMask.indexOf(name);
            if (index >= 0) {
                this.boneMask.splice(index, 1);
            }
            if (recursive) {
                var currentBone = armature.getBone(name);
                if (currentBone !== null) {
                    if (this.boneMask.length > 0) {
                        for (var _i = 0, _a = armature.getBones(); _i < _a.length; _i++) {
                            var bone = _a[_i];
                            var index_1 = this.boneMask.indexOf(bone.name);
                            if (index_1 >= 0 && currentBone.contains(bone)) {
                                this.boneMask.splice(index_1, 1);
                            }
                        }
                    }
                    else {
                        for (var _b = 0, _c = armature.getBones(); _b < _c.length; _b++) {
                            var bone = _c[_b];
                            if (bone === currentBone) {
                                continue;
                            }
                            if (!currentBone.contains(bone)) {
                                this.boneMask.push(bone.name);
                            }
                        }
                    }
                }
            }
        };
        return AnimationConfig;
    }(dragonBones.BaseObject));
    dragonBones.AnimationConfig = AnimationConfig;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 贴图集数据。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var TextureAtlasData = (function (_super) {
        __extends(TextureAtlasData, _super);
        function TextureAtlasData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this.textures = {};
            return _this;
        }
        /**
         * @private
         */
        TextureAtlasData.prototype._onClear = function () {
            for (var k in this.textures) {
                this.textures[k].returnToPool();
                delete this.textures[k];
            }
            this.autoSearch = false;
            this.width = 0;
            this.height = 0;
            this.scale = 1.0;
            // this.textures.clear();
            this.name = "";
            this.imagePath = "";
        };
        /**
         * @private
         */
        TextureAtlasData.prototype.copyFrom = function (value) {
            this.autoSearch = value.autoSearch;
            this.scale = value.scale;
            this.width = value.width;
            this.height = value.height;
            this.name = value.name;
            this.imagePath = value.imagePath;
            for (var k in this.textures) {
                this.textures[k].returnToPool();
                delete this.textures[k];
            }
            // this.textures.clear();
            for (var k in value.textures) {
                var texture = this.createTexture();
                texture.copyFrom(value.textures[k]);
                this.textures[k] = texture;
            }
        };
        /**
         * @private
         */
        TextureAtlasData.prototype.addTexture = function (value) {
            if (value.name in this.textures) {
                console.warn("Replace texture: " + value.name);
                this.textures[value.name].returnToPool();
            }
            value.parent = this;
            this.textures[value.name] = value;
        };
        /**
         * @private
         */
        TextureAtlasData.prototype.getTexture = function (name) {
            return name in this.textures ? this.textures[name] : null;
        };
        return TextureAtlasData;
    }(dragonBones.BaseObject));
    dragonBones.TextureAtlasData = TextureAtlasData;
    /**
     * @private
     */
    var TextureData = (function (_super) {
        __extends(TextureData, _super);
        function TextureData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.region = new dragonBones.Rectangle();
            _this.frame = null; // Initial value.
            return _this;
        }
        TextureData.createRectangle = function () {
            return new dragonBones.Rectangle();
        };
        TextureData.prototype._onClear = function () {
            this.rotated = false;
            this.name = "";
            this.region.clear();
            this.parent = null; //
            this.frame = null;
        };
        TextureData.prototype.copyFrom = function (value) {
            this.rotated = value.rotated;
            this.name = value.name;
            this.region.copyFrom(value.region);
            this.parent = value.parent;
            if (this.frame === null && value.frame !== null) {
                this.frame = TextureData.createRectangle();
            }
            else if (this.frame !== null && value.frame === null) {
                this.frame = null;
            }
            if (this.frame !== null && value.frame !== null) {
                this.frame.copyFrom(value.frame);
            }
        };
        return TextureData;
    }(dragonBones.BaseObject));
    dragonBones.TextureData = TextureData;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones_1) {
    /**
     * 骨架，是骨骼动画系统的核心，由显示容器、骨骼、插槽、动画、事件系统构成。
     * @see dragonBones.ArmatureData
     * @see dragonBones.Bone
     * @see dragonBones.Slot
     * @see dragonBones.Animation
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var Armature = (function (_super) {
        __extends(Armature, _super);
        function Armature() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._bones = [];
            _this._slots = [];
            _this._actions = [];
            _this._animation = null; // Initial value.
            _this._proxy = null; // Initial value.
            /**
             * @private
             */
            _this._replaceTextureAtlasData = null; // Initial value.
            _this._clock = null; // Initial value.
            return _this;
        }
        Armature.toString = function () {
            return "[class dragonBones.Armature]";
        };
        Armature._onSortSlots = function (a, b) {
            return a._zOrder > b._zOrder ? 1 : -1;
        };
        /**
         * @private
         */
        Armature.prototype._onClear = function () {
            if (this._clock !== null) {
                this._clock.remove(this);
            }
            for (var _i = 0, _a = this._bones; _i < _a.length; _i++) {
                var bone = _a[_i];
                bone.returnToPool();
            }
            for (var _b = 0, _c = this._slots; _b < _c.length; _b++) {
                var slot = _c[_b];
                slot.returnToPool();
            }
            for (var _d = 0, _e = this._actions; _d < _e.length; _d++) {
                var action = _e[_d];
                action.returnToPool();
            }
            if (this._animation !== null) {
                this._animation.returnToPool();
            }
            if (this._proxy !== null) {
                this._proxy.clear();
            }
            if (this._replaceTextureAtlasData !== null) {
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
            this._bones.length = 0;
            this._slots.length = 0;
            this._actions.length = 0;
            this._animation = null; //
            this._proxy = null; //
            this._display = null;
            this._replaceTextureAtlasData = null;
            this._replacedTexture = null;
            this._dragonBones = null; //
            this._clock = null;
            this._parent = null;
        };
        Armature.prototype._sortBones = function () {
            var total = this._bones.length;
            if (total <= 0) {
                return;
            }
            var sortHelper = this._bones.concat();
            var index = 0;
            var count = 0;
            this._bones.length = 0;
            while (count < total) {
                var bone = sortHelper[index++];
                if (index >= total) {
                    index = 0;
                }
                if (this._bones.indexOf(bone) >= 0) {
                    continue;
                }
                if (bone.constraints.length > 0) {
                    var flag = false;
                    for (var _i = 0, _a = bone.constraints; _i < _a.length; _i++) {
                        var constraint = _a[_i];
                        if (this._bones.indexOf(constraint.target) < 0) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
                        continue;
                    }
                }
                if (bone.parent !== null && this._bones.indexOf(bone.parent) < 0) {
                    continue;
                }
                this._bones.push(bone);
                count++;
            }
        };
        Armature.prototype._sortSlots = function () {
            this._slots.sort(Armature._onSortSlots);
        };
        /**
         * @internal
         * @private
         */
        Armature.prototype._sortZOrder = function (slotIndices, offset) {
            var slotDatas = this.armatureData.sortedSlots;
            var isOriginal = slotIndices === null;
            if (this._zOrderDirty || !isOriginal) {
                for (var i = 0, l = slotDatas.length; i < l; ++i) {
                    var slotIndex = isOriginal ? i : slotIndices[offset + i];
                    if (slotIndex < 0 || slotIndex >= l) {
                        continue;
                    }
                    var slotData = slotDatas[slotIndex];
                    var slot = this.getSlot(slotData.name);
                    if (slot !== null) {
                        slot._setZorder(i);
                    }
                }
                this._slotsDirty = true;
                this._zOrderDirty = !isOriginal;
            }
        };
        /**
         * @internal
         * @private
         */
        Armature.prototype._addBoneToBoneList = function (value) {
            if (this._bones.indexOf(value) < 0) {
                this._bonesDirty = true;
                this._bones.push(value);
                this._animation._timelineDirty = true;
            }
        };
        /**
         * @internal
         * @private
         */
        Armature.prototype._removeBoneFromBoneList = function (value) {
            var index = this._bones.indexOf(value);
            if (index >= 0) {
                this._bones.splice(index, 1);
                this._animation._timelineDirty = true;
            }
        };
        /**
         * @internal
         * @private
         */
        Armature.prototype._addSlotToSlotList = function (value) {
            if (this._slots.indexOf(value) < 0) {
                this._slotsDirty = true;
                this._slots.push(value);
                this._animation._timelineDirty = true;
            }
        };
        /**
         * @internal
         * @private
         */
        Armature.prototype._removeSlotFromSlotList = function (value) {
            var index = this._slots.indexOf(value);
            if (index >= 0) {
                this._slots.splice(index, 1);
                this._animation._timelineDirty = true;
            }
        };
        /**
         * @internal
         * @private
         */
        Armature.prototype._bufferAction = function (action, append) {
            if (this._actions.indexOf(action) < 0) {
                if (append) {
                    this._actions.push(action);
                }
                else {
                    this._actions.unshift(action);
                }
            }
        };
        /**
         * 释放骨架。 (回收到对象池)
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.dispose = function () {
            if (this.armatureData !== null) {
                this._lockUpdate = true;
                this._dragonBones.bufferObject(this);
            }
        };
        /**
         * @private
         */
        Armature.prototype.init = function (armatureData, proxy, display, dragonBones) {
            if (this.armatureData !== null) {
                return;
            }
            this.armatureData = armatureData;
            this._animation = dragonBones_1.BaseObject.borrowObject(dragonBones_1.Animation);
            this._proxy = proxy;
            this._display = display;
            this._dragonBones = dragonBones;
            this._proxy.init(this);
            this._animation.init(this);
            this._animation.animations = this.armatureData.animations;
        };
        /**
         * 更新骨架和动画。
         * @param passedTime 两帧之间的时间间隔。 (以秒为单位)
         * @see dragonBones.IAnimateble
         * @see dragonBones.WorldClock
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.advanceTime = function (passedTime) {
            if (this._lockUpdate) {
                return;
            }
            if (this.armatureData === null) {
                console.assert(false, "The armature has been disposed.");
                return;
            }
            else if (this.armatureData.parent === null) {
                console.assert(false, "The armature data has been disposed.");
                return;
            }
            var prevCacheFrameIndex = this._cacheFrameIndex;
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
            if (this._cacheFrameIndex < 0 || this._cacheFrameIndex !== prevCacheFrameIndex) {
                var i = 0, l = 0;
                for (i = 0, l = this._bones.length; i < l; ++i) {
                    this._bones[i].update(this._cacheFrameIndex);
                }
                for (i = 0, l = this._slots.length; i < l; ++i) {
                    this._slots[i].update(this._cacheFrameIndex);
                }
            }
            if (this._actions.length > 0) {
                this._lockUpdate = true;
                for (var _i = 0, _a = this._actions; _i < _a.length; _i++) {
                    var action = _a[_i];
                    if (action.type === 0 /* Play */) {
                        this._animation.fadeIn(action.name);
                    }
                }
                this._actions.length = 0;
                this._lockUpdate = false;
            }
            //
            var drawed = this.debugDraw || dragonBones_1.DragonBones.debugDraw;
            if (drawed || this._debugDraw) {
                this._debugDraw = drawed;
                this._proxy.debugUpdate(this._debugDraw);
            }
        };
        /**
         * 更新骨骼和插槽。 (当骨骼没有动画状态或动画状态播放完成时，骨骼将不在更新)
         * @param boneName 指定的骨骼名称，如果未设置，将更新所有骨骼。
         * @param updateSlotDisplay 是否更新插槽的显示对象。
         * @see dragonBones.Bone
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.invalidUpdate = function (boneName, updateSlotDisplay) {
            if (boneName === void 0) { boneName = null; }
            if (updateSlotDisplay === void 0) { updateSlotDisplay = false; }
            if (boneName !== null && boneName.length > 0) {
                var bone = this.getBone(boneName);
                if (bone !== null) {
                    bone.invalidUpdate();
                    if (updateSlotDisplay) {
                        for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                            var slot = _a[_i];
                            if (slot.parent === bone) {
                                slot.invalidUpdate();
                            }
                        }
                    }
                }
            }
            else {
                for (var _b = 0, _c = this._bones; _b < _c.length; _b++) {
                    var bone = _c[_b];
                    bone.invalidUpdate();
                }
                if (updateSlotDisplay) {
                    for (var _d = 0, _e = this._slots; _d < _e.length; _d++) {
                        var slot = _e[_d];
                        slot.invalidUpdate();
                    }
                }
            }
        };
        /**
         * 判断点是否在所有插槽的自定义包围盒内。
         * @param x 点的水平坐标。（骨架内坐标系）
         * @param y 点的垂直坐标。（骨架内坐标系）
         * @version DragonBones 5.0
         * @language zh_CN
         */
        Armature.prototype.containsPoint = function (x, y) {
            for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                var slot = _a[_i];
                if (slot.containsPoint(x, y)) {
                    return slot;
                }
            }
            return null;
        };
        /**
         * 判断线段是否与骨架的所有插槽的自定义包围盒相交。
         * @param xA 线段起点的水平坐标。（骨架内坐标系）
         * @param yA 线段起点的垂直坐标。（骨架内坐标系）
         * @param xB 线段终点的水平坐标。（骨架内坐标系）
         * @param yB 线段终点的垂直坐标。（骨架内坐标系）
         * @param intersectionPointA 线段从起点到终点与包围盒相交的第一个交点。（骨架内坐标系）
         * @param intersectionPointB 线段从终点到起点与包围盒相交的第一个交点。（骨架内坐标系）
         * @param normalRadians 碰撞点处包围盒切线的法线弧度。 [x: 第一个碰撞点处切线的法线弧度, y: 第二个碰撞点处切线的法线弧度]
         * @returns 线段从起点到终点相交的第一个自定义包围盒的插槽。
         * @version DragonBones 5.0
         * @language zh_CN
         */
        Armature.prototype.intersectsSegment = function (xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var isV = xA === xB;
            var dMin = 0.0;
            var dMax = 0.0;
            var intXA = 0.0;
            var intYA = 0.0;
            var intXB = 0.0;
            var intYB = 0.0;
            var intAN = 0.0;
            var intBN = 0.0;
            var intSlotA = null;
            var intSlotB = null;
            for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                var slot = _a[_i];
                var intersectionCount = slot.intersectsSegment(xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians);
                if (intersectionCount > 0) {
                    if (intersectionPointA !== null || intersectionPointB !== null) {
                        if (intersectionPointA !== null) {
                            var d = isV ? intersectionPointA.y - yA : intersectionPointA.x - xA;
                            if (d < 0.0) {
                                d = -d;
                            }
                            if (intSlotA === null || d < dMin) {
                                dMin = d;
                                intXA = intersectionPointA.x;
                                intYA = intersectionPointA.y;
                                intSlotA = slot;
                                if (normalRadians) {
                                    intAN = normalRadians.x;
                                }
                            }
                        }
                        if (intersectionPointB !== null) {
                            var d = intersectionPointB.x - xA;
                            if (d < 0.0) {
                                d = -d;
                            }
                            if (intSlotB === null || d > dMax) {
                                dMax = d;
                                intXB = intersectionPointB.x;
                                intYB = intersectionPointB.y;
                                intSlotB = slot;
                                if (normalRadians !== null) {
                                    intBN = normalRadians.y;
                                }
                            }
                        }
                    }
                    else {
                        intSlotA = slot;
                        break;
                    }
                }
            }
            if (intSlotA !== null && intersectionPointA !== null) {
                intersectionPointA.x = intXA;
                intersectionPointA.y = intYA;
                if (normalRadians !== null) {
                    normalRadians.x = intAN;
                }
            }
            if (intSlotB !== null && intersectionPointB !== null) {
                intersectionPointB.x = intXB;
                intersectionPointB.y = intYB;
                if (normalRadians !== null) {
                    normalRadians.y = intBN;
                }
            }
            return intSlotA;
        };
        /**
         * 获取指定名称的骨骼。
         * @param name 骨骼的名称。
         * @returns 骨骼。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.getBone = function (name) {
            for (var _i = 0, _a = this._bones; _i < _a.length; _i++) {
                var bone = _a[_i];
                if (bone.name === name) {
                    return bone;
                }
            }
            return null;
        };
        /**
         * 通过显示对象获取骨骼。
         * @param display 显示对象。
         * @returns 包含这个显示对象的骨骼。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.getBoneByDisplay = function (display) {
            var slot = this.getSlotByDisplay(display);
            return slot !== null ? slot.parent : null;
        };
        /**
         * 获取插槽。
         * @param name 插槽的名称。
         * @returns 插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.getSlot = function (name) {
            for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                var slot = _a[_i];
                if (slot.name === name) {
                    return slot;
                }
            }
            return null;
        };
        /**
         * 通过显示对象获取插槽。
         * @param display 显示对象。
         * @returns 包含这个显示对象的插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.getSlotByDisplay = function (display) {
            if (display !== null) {
                for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                    var slot = _a[_i];
                    if (slot.display === display) {
                        return slot;
                    }
                }
            }
            return null;
        };
        /**
         * @deprecated
         */
        Armature.prototype.addBone = function (value, parentName) {
            if (parentName === void 0) { parentName = null; }
            console.assert(value !== null);
            value._setArmature(this);
            value._setParent(parentName !== null ? this.getBone(parentName) : null);
        };
        /**
         * @deprecated
         */
        Armature.prototype.removeBone = function (value) {
            console.assert(value !== null && value.armature === this);
            value._setParent(null);
            value._setArmature(null);
        };
        /**
         * @deprecated
         */
        Armature.prototype.addSlot = function (value, parentName) {
            var bone = this.getBone(parentName);
            console.assert(value !== null && bone !== null);
            value._setArmature(this);
            value._setParent(bone);
        };
        /**
         * @deprecated
         */
        Armature.prototype.removeSlot = function (value) {
            console.assert(value !== null && value.armature === this);
            value._setParent(null);
            value._setArmature(null);
        };
        /**
         * 获取所有骨骼。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.getBones = function () {
            return this._bones;
        };
        /**
         * 获取所有插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Armature.prototype.getSlots = function () {
            return this._slots;
        };
        Object.defineProperty(Armature.prototype, "flipX", {
            get: function () {
                return this._flipX;
            },
            set: function (value) {
                if (this._flipX === value) {
                    return;
                }
                this._flipX = value;
                this.invalidUpdate();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "flipY", {
            get: function () {
                return this._flipY;
            },
            set: function (value) {
                if (this._flipY === value) {
                    return;
                }
                this._flipY = value;
                this.invalidUpdate();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "cacheFrameRate", {
            /**
             * 动画缓存帧率，当设置的值大于 0 的时，将会开启动画缓存。
             * 通过将动画数据缓存在内存中来提高运行性能，会有一定的内存开销。
             * 帧率不宜设置的过高，通常跟动画的帧率相当且低于程序运行的帧率。
             * 开启动画缓存后，某些功能将会失效，比如 Bone 和 Slot 的 offset 属性等。
             * @see dragonBones.DragonBonesData#frameRate
             * @see dragonBones.ArmatureData#frameRate
             * @version DragonBones 4.5
             * @language zh_CN
             */
            get: function () {
                return this.armatureData.cacheFrameRate;
            },
            set: function (value) {
                if (this.armatureData.cacheFrameRate !== value) {
                    this.armatureData.cacheFrames(value);
                    // Set child armature frameRate.
                    for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                        var slot = _a[_i];
                        var childArmature = slot.childArmature;
                        if (childArmature !== null) {
                            childArmature.cacheFrameRate = value;
                        }
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "name", {
            /**
             * 骨架名称。
             * @see dragonBones.ArmatureData#name
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this.armatureData.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "animation", {
            /**
             * 获得动画控制器。
             * @see dragonBones.Animation
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._animation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "proxy", {
            /**
             * @pivate
             */
            get: function () {
                return this._proxy;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "eventDispatcher", {
            /**
             * @pivate
             */
            get: function () {
                return this._proxy;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "display", {
            /**
             * 获取显示容器，插槽的显示对象都会以此显示容器为父级，根据渲染平台的不同，类型会不同，通常是 DisplayObjectContainer 类型。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._display;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "replacedTexture", {
            /**
             * @language zh_CN
             * 替换骨架的主贴图，根据渲染引擎的不同，提供不同的贴图数据。
             * @version DragonBones 4.5
             */
            get: function () {
                return this._replacedTexture;
            },
            set: function (value) {
                if (this._replacedTexture === value) {
                    return;
                }
                if (this._replaceTextureAtlasData !== null) {
                    this._replaceTextureAtlasData.returnToPool();
                    this._replaceTextureAtlasData = null;
                }
                this._replacedTexture = value;
                for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                    var slot = _a[_i];
                    slot.invalidUpdate();
                    slot.update(-1);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "clock", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._clock;
            },
            set: function (value) {
                if (this._clock === value) {
                    return;
                }
                if (this._clock !== null) {
                    this._clock.remove(this);
                }
                this._clock = value;
                if (this._clock) {
                    this._clock.add(this);
                }
                // Update childArmature clock.
                for (var _i = 0, _a = this._slots; _i < _a.length; _i++) {
                    var slot = _a[_i];
                    var childArmature = slot.childArmature;
                    if (childArmature !== null) {
                        childArmature.clock = this._clock;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Armature.prototype, "parent", {
            /**
             * 获取父插槽。 (当此骨架是某个骨架的子骨架时，可以通过此属性向上查找从属关系)
             * @see dragonBones.Slot
             * @version DragonBones 4.5
             * @language zh_CN
             */
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.Armature#replacedTexture
         */
        Armature.prototype.replaceTexture = function (texture) {
            this.replacedTexture = texture;
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.Armature#eventDispatcher
         */
        Armature.prototype.hasEventListener = function (type) {
            return this._proxy.hasEvent(type);
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.Armature#eventDispatcher
         */
        Armature.prototype.addEventListener = function (type, listener, target) {
            this._proxy.addEvent(type, listener, target);
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.Armature#eventDispatcher
         */
        Armature.prototype.removeEventListener = function (type, listener, target) {
            this._proxy.removeEvent(type, listener, target);
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see #cacheFrameRate
         */
        Armature.prototype.enableAnimationCache = function (frameRate) {
            this.cacheFrameRate = frameRate;
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see #display
         */
        Armature.prototype.getDisplay = function () {
            return this._display;
        };
        return Armature;
    }(dragonBones_1.BaseObject));
    dragonBones_1.Armature = Armature;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 基础变换对象。
     * @version DragonBones 4.5
     * @language zh_CN
     */
    var TransformObject = (function (_super) {
        __extends(TransformObject, _super);
        function TransformObject() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * 相对于骨架坐标系的矩阵。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.globalTransformMatrix = new dragonBones.Matrix();
            /**
             * 相对于骨架坐标系的变换。
             * @see dragonBones.Transform
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.global = new dragonBones.Transform();
            /**
             * 相对于骨架或父骨骼坐标系的偏移变换。
             * @see dragonBones.Transform
             * @version DragonBones 3.0
             * @language zh_CN
             */
            _this.offset = new dragonBones.Transform();
            return _this;
        }
        /**
         * @private
         */
        TransformObject.prototype._onClear = function () {
            this.name = "";
            this.globalTransformMatrix.identity();
            this.global.identity();
            this.offset.identity();
            this.origin = null; //
            this.userData = null;
            this._globalDirty = false;
            this._armature = null; //
            this._parent = null; //
        };
        /**
         * @internal
         * @private
         */
        TransformObject.prototype._setArmature = function (value) {
            this._armature = value;
        };
        /**
         * @internal
         * @private
         */
        TransformObject.prototype._setParent = function (value) {
            this._parent = value;
        };
        /**
         * @private
         */
        TransformObject.prototype.updateGlobalTransform = function () {
            if (this._globalDirty) {
                this._globalDirty = false;
                this.global.fromMatrix(this.globalTransformMatrix);
            }
        };
        Object.defineProperty(TransformObject.prototype, "armature", {
            /**
             * 所属的骨架。
             * @see dragonBones.Armature
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._armature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TransformObject.prototype, "parent", {
            /**
             * 所属的父骨骼。
             * @see dragonBones.Bone
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @private
         */
        TransformObject._helpMatrix = new dragonBones.Matrix();
        /**
         * @private
         */
        TransformObject._helpTransform = new dragonBones.Transform();
        /**
         * @private
         */
        TransformObject._helpPoint = new dragonBones.Point();
        return TransformObject;
    }(dragonBones.BaseObject));
    dragonBones.TransformObject = TransformObject;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 骨骼，一个骨架中可以包含多个骨骼，骨骼以树状结构组成骨架。
     * 骨骼在骨骼动画体系中是最重要的逻辑单元之一，负责动画中的平移旋转缩放的实现。
     * @see dragonBones.BoneData
     * @see dragonBones.Armature
     * @see dragonBones.Slot
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var Bone = (function (_super) {
        __extends(Bone, _super);
        function Bone() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @internal
             * @private
             */
            _this.animationPose = new dragonBones.Transform();
            /**
             * @internal
             * @private
             */
            _this.constraints = [];
            _this._bones = [];
            _this._slots = [];
            return _this;
        }
        Bone.toString = function () {
            return "[class dragonBones.Bone]";
        };
        /**
         * @private
         */
        Bone.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            for (var _i = 0, _a = this.constraints; _i < _a.length; _i++) {
                var constraint = _a[_i];
                constraint.returnToPool();
            }
            this.offsetMode = 1 /* Additive */;
            this.animationPose.identity();
            this.constraints.length = 0;
            this.boneData = null; //
            this._transformDirty = false;
            this._childrenTransformDirty = false;
            this._blendDirty = false;
            this._localDirty = true;
            this._visible = true;
            this._cachedFrameIndex = -1;
            this._blendLayer = 0;
            this._blendLeftWeight = 1.0;
            this._blendLayerWeight = 0.0;
            this._bones.length = 0;
            this._slots.length = 0;
            this._cachedFrameIndices = null;
        };
        /**
         * @private
         */
        Bone.prototype._updateGlobalTransformMatrix = function (isCache) {
            var flipX = this._armature.flipX;
            var flipY = this._armature.flipY === dragonBones.DragonBones.yDown;
            var global = this.global;
            var globalTransformMatrix = this.globalTransformMatrix;
            var inherit = this._parent !== null;
            var dR = 0.0;
            if (this.offsetMode === 1 /* Additive */) {
                // global.copyFrom(this.origin).add(this.offset).add(this.animationPose);
                global.x = this.origin.x + this.offset.x + this.animationPose.x;
                global.y = this.origin.y + this.offset.y + this.animationPose.y;
                global.skew = this.origin.skew + this.offset.skew + this.animationPose.skew;
                global.rotation = this.origin.rotation + this.offset.rotation + this.animationPose.rotation;
                global.scaleX = this.origin.scaleX * this.offset.scaleX * this.animationPose.scaleX;
                global.scaleY = this.origin.scaleY * this.offset.scaleY * this.animationPose.scaleY;
            }
            else if (this.offsetMode === 0 /* None */) {
                global.copyFrom(this.origin).add(this.animationPose);
            }
            else {
                inherit = false;
                global.copyFrom(this.offset);
            }
            if (inherit) {
                var parentMatrix = this._parent.globalTransformMatrix;
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
                    }
                    else {
                        globalTransformMatrix.tx = global.x;
                        globalTransformMatrix.ty = global.y;
                    }
                    if (isCache) {
                        global.fromMatrix(globalTransformMatrix);
                    }
                    else {
                        this._globalDirty = true;
                    }
                }
                else {
                    if (this.boneData.inheritTranslation) {
                        var x = global.x;
                        var y = global.y;
                        global.x = parentMatrix.a * x + parentMatrix.c * y + parentMatrix.tx;
                        global.y = parentMatrix.d * y + parentMatrix.b * x + parentMatrix.ty;
                    }
                    else {
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
                        if (this._parent.global.scaleX < 0.0) {
                            dR += Math.PI;
                        }
                        if (parentMatrix.a * parentMatrix.d - parentMatrix.b * parentMatrix.c < 0.0) {
                            dR -= global.rotation * 2.0;
                            if (flipX !== flipY || this.boneData.inheritReflection) {
                                global.skew += Math.PI;
                            }
                        }
                        global.rotation += dR;
                    }
                    else if (flipX || flipY) {
                        if (flipX && flipY) {
                            dR = Math.PI;
                        }
                        else {
                            dR = -global.rotation * 2.0;
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
            else {
                if (flipX || flipY) {
                    if (flipX) {
                        global.x = -global.x;
                    }
                    if (flipY) {
                        global.y = -global.y;
                    }
                    if (flipX && flipY) {
                        dR = Math.PI;
                    }
                    else {
                        dR = -global.rotation * 2.0;
                        if (flipX) {
                            dR += Math.PI;
                        }
                        global.skew += Math.PI;
                    }
                    global.rotation += dR;
                }
                global.toMatrix(globalTransformMatrix);
            }
        };
        /**
         * @internal
         * @private
         */
        Bone.prototype._setArmature = function (value) {
            if (this._armature === value) {
                return;
            }
            var oldSlots = null;
            var oldBones = null;
            if (this._armature !== null) {
                oldSlots = this.getSlots();
                oldBones = this.getBones();
                this._armature._removeBoneFromBoneList(this);
            }
            this._armature = value; //
            if (this._armature !== null) {
                this._armature._addBoneToBoneList(this);
            }
            if (oldSlots !== null) {
                for (var _i = 0, oldSlots_1 = oldSlots; _i < oldSlots_1.length; _i++) {
                    var slot = oldSlots_1[_i];
                    if (slot.parent === this) {
                        slot._setArmature(this._armature);
                    }
                }
            }
            if (oldBones !== null) {
                for (var _a = 0, oldBones_1 = oldBones; _a < oldBones_1.length; _a++) {
                    var bone = oldBones_1[_a];
                    if (bone.parent === this) {
                        bone._setArmature(this._armature);
                    }
                }
            }
        };
        /**
         * @internal
         * @private
         */
        Bone.prototype.init = function (boneData) {
            if (this.boneData !== null) {
                return;
            }
            this.boneData = boneData;
            this.name = this.boneData.name;
            this.origin = this.boneData.transform;
        };
        /**
         * @internal
         * @private
         */
        Bone.prototype.update = function (cacheFrameIndex) {
            this._blendDirty = false;
            if (cacheFrameIndex >= 0 && this._cachedFrameIndices !== null) {
                var cachedFrameIndex = this._cachedFrameIndices[cacheFrameIndex];
                if (cachedFrameIndex >= 0 && this._cachedFrameIndex === cachedFrameIndex) {
                    this._transformDirty = false;
                }
                else if (cachedFrameIndex >= 0) {
                    this._transformDirty = true;
                    this._cachedFrameIndex = cachedFrameIndex;
                }
                else {
                    if (this.constraints.length > 0) {
                        for (var _i = 0, _a = this.constraints; _i < _a.length; _i++) {
                            var constraint = _a[_i];
                            constraint.update();
                        }
                    }
                    if (this._transformDirty ||
                        (this._parent !== null && this._parent._childrenTransformDirty)) {
                        this._transformDirty = true;
                        this._cachedFrameIndex = -1;
                    }
                    else if (this._cachedFrameIndex >= 0) {
                        this._transformDirty = false;
                        this._cachedFrameIndices[cacheFrameIndex] = this._cachedFrameIndex;
                    }
                    else {
                        this._transformDirty = true;
                        this._cachedFrameIndex = -1;
                    }
                }
            }
            else {
                if (this.constraints.length > 0) {
                    for (var _b = 0, _c = this.constraints; _b < _c.length; _b++) {
                        var constraint = _c[_b];
                        constraint.update();
                    }
                }
                if (this._transformDirty || (this._parent !== null && this._parent._childrenTransformDirty)) {
                    cacheFrameIndex = -1;
                    this._transformDirty = true;
                    this._cachedFrameIndex = -1;
                }
            }
            if (this._transformDirty) {
                this._transformDirty = false;
                this._childrenTransformDirty = true;
                if (this._cachedFrameIndex < 0) {
                    var isCache = cacheFrameIndex >= 0;
                    if (this._localDirty) {
                        this._updateGlobalTransformMatrix(isCache);
                    }
                    if (isCache && this._cachedFrameIndices !== null) {
                        this._cachedFrameIndex = this._cachedFrameIndices[cacheFrameIndex] = this._armature.armatureData.setCacheFrame(this.globalTransformMatrix, this.global);
                    }
                }
                else {
                    this._armature.armatureData.getCacheFrame(this.globalTransformMatrix, this.global, this._cachedFrameIndex);
                }
            }
            else if (this._childrenTransformDirty) {
                this._childrenTransformDirty = false;
            }
            this._localDirty = true;
        };
        /**
         * @internal
         * @private
         */
        Bone.prototype.updateByConstraint = function () {
            if (this._localDirty) {
                this._localDirty = false;
                if (this._transformDirty || (this._parent !== null && this._parent._childrenTransformDirty)) {
                    this._updateGlobalTransformMatrix(true);
                }
                this._transformDirty = true;
            }
        };
        /**
         * @internal
         * @private
         */
        Bone.prototype.addConstraint = function (constraint) {
            if (this.constraints.indexOf(constraint) < 0) {
                this.constraints.push(constraint);
            }
        };
        /**
         * 下一帧更新变换。 (当骨骼没有动画状态或动画状态播放完成时，骨骼将不在更新)
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Bone.prototype.invalidUpdate = function () {
            this._transformDirty = true;
        };
        /**
         * 是否包含骨骼或插槽。
         * @returns
         * @see dragonBones.TransformObject
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Bone.prototype.contains = function (child) {
            if (child === this) {
                return false;
            }
            var ancestor = child;
            while (ancestor !== this && ancestor !== null) {
                ancestor = ancestor.parent;
            }
            return ancestor === this;
        };
        /**
         * 所有的子骨骼。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Bone.prototype.getBones = function () {
            this._bones.length = 0;
            for (var _i = 0, _a = this._armature.getBones(); _i < _a.length; _i++) {
                var bone = _a[_i];
                if (bone.parent === this) {
                    this._bones.push(bone);
                }
            }
            return this._bones;
        };
        /**
         * 所有的插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Bone.prototype.getSlots = function () {
            this._slots.length = 0;
            for (var _i = 0, _a = this._armature.getSlots(); _i < _a.length; _i++) {
                var slot = _a[_i];
                if (slot.parent === this) {
                    this._slots.push(slot);
                }
            }
            return this._slots;
        };
        Object.defineProperty(Bone.prototype, "visible", {
            /**
             * 控制此骨骼所有插槽的可见。
             * @default true
             * @see dragonBones.Slot
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._visible;
            },
            set: function (value) {
                if (this._visible === value) {
                    return;
                }
                this._visible = value;
                for (var _i = 0, _a = this._armature.getSlots(); _i < _a.length; _i++) {
                    var slot = _a[_i];
                    if (slot._parent === this) {
                        slot._updateVisible();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bone.prototype, "length", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #boneData
             * @see #dragonBones.BoneData#length
             */
            get: function () {
                return this.boneData.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bone.prototype, "slot", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see dragonBones.Armature#getSlot()
             */
            get: function () {
                for (var _i = 0, _a = this._armature.getSlots(); _i < _a.length; _i++) {
                    var slot = _a[_i];
                    if (slot.parent === this) {
                        return slot;
                    }
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        return Bone;
    }(dragonBones.TransformObject));
    dragonBones.Bone = Bone;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 插槽，附着在骨骼上，控制显示对象的显示状态和属性。
     * 一个骨骼上可以包含多个插槽。
     * 一个插槽中可以包含多个显示对象，同一时间只能显示其中的一个显示对象，但可以在动画播放的过程中切换显示对象实现帧动画。
     * 显示对象可以是普通的图片纹理，也可以是子骨架的显示容器，网格显示对象，还可以是自定义的其他显示对象。
     * @see dragonBones.Armature
     * @see dragonBones.Bone
     * @see dragonBones.SlotData
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var Slot = (function (_super) {
        __extends(Slot, _super);
        function Slot() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * @private
             */
            _this._localMatrix = new dragonBones.Matrix();
            /**
             * @private
             */
            _this._colorTransform = new dragonBones.ColorTransform();
            /**
             * @private
             */
            _this._ffdVertices = [];
            /**
             * @private
             */
            _this._displayDatas = [];
            /**
             * @private
             */
            _this._displayList = [];
            /**
             * @private
             */
            _this._meshBones = [];
            /**
             * @private
             */
            _this._rawDisplay = null; // Initial value.
            /**
             * @private
             */
            _this._meshDisplay = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        Slot.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            var disposeDisplayList = [];
            for (var _i = 0, _a = this._displayList; _i < _a.length; _i++) {
                var eachDisplay = _a[_i];
                if (eachDisplay !== null && eachDisplay !== this._rawDisplay && eachDisplay !== this._meshDisplay &&
                    disposeDisplayList.indexOf(eachDisplay) < 0) {
                    disposeDisplayList.push(eachDisplay);
                }
            }
            for (var _b = 0, disposeDisplayList_1 = disposeDisplayList; _b < disposeDisplayList_1.length; _b++) {
                var eachDisplay = disposeDisplayList_1[_b];
                if (eachDisplay instanceof dragonBones.Armature) {
                    eachDisplay.dispose();
                }
                else {
                    this._disposeDisplay(eachDisplay);
                }
            }
            if (this._meshDisplay !== null && this._meshDisplay !== this._rawDisplay) {
                this._disposeDisplay(this._meshDisplay);
            }
            if (this._rawDisplay !== null) {
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
            this._blendMode = 0 /* Normal */;
            this._displayIndex = -1;
            this._animationDisplayIndex = -1;
            this._zOrder = 0;
            this._cachedFrameIndex = -1;
            this._pivotX = 0.0;
            this._pivotY = 0.0;
            this._localMatrix.identity();
            this._colorTransform.identity();
            this._ffdVertices.length = 0;
            this._displayList.length = 0;
            this._displayDatas.length = 0;
            this._meshBones.length = 0;
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
        };
        /**
         * @private
         */
        Slot.prototype._updateDisplayData = function () {
            var prevDisplayData = this._displayData;
            var prevTextureData = this._textureData;
            var prevMeshData = this._meshData;
            var rawDisplayData = this._displayIndex >= 0 && this._displayIndex < this._rawDisplayDatas.length ? this._rawDisplayDatas[this._displayIndex] : null;
            if (this._displayIndex >= 0 && this._displayIndex < this._displayDatas.length) {
                this._displayData = this._displayDatas[this._displayIndex];
            }
            else {
                this._displayData = null;
            }
            // Update texture and mesh data.
            if (this._displayData !== null) {
                if (this._displayData.type === 0 /* Image */ || this._displayData.type === 2 /* Mesh */) {
                    this._textureData = this._displayData.texture;
                    if (this._displayData.type === 2 /* Mesh */) {
                        this._meshData = this._displayData;
                    }
                    else if (rawDisplayData !== null && rawDisplayData.type === 2 /* Mesh */) {
                        this._meshData = rawDisplayData;
                    }
                    else {
                        this._meshData = null;
                    }
                }
                else {
                    this._textureData = null;
                    this._meshData = null;
                }
            }
            else {
                this._textureData = null;
                this._meshData = null;
            }
            // Update bounding box data.
            if (this._displayData !== null && this._displayData.type === 3 /* BoundingBox */) {
                this._boundingBoxData = this._displayData.boundingBox;
            }
            else if (rawDisplayData !== null && rawDisplayData.type === 3 /* BoundingBox */) {
                this._boundingBoxData = rawDisplayData.boundingBox;
            }
            else {
                this._boundingBoxData = null;
            }
            if (this._displayData !== prevDisplayData || this._textureData !== prevTextureData || this._meshData !== prevMeshData) {
                // Update pivot offset.
                if (this._meshData !== null) {
                    this._pivotX = 0.0;
                    this._pivotY = 0.0;
                }
                else if (this._textureData !== null) {
                    var imageDisplayData = this._displayData;
                    var scale = this._armature.armatureData.scale;
                    var frame = this._textureData.frame;
                    this._pivotX = imageDisplayData.pivot.x;
                    this._pivotY = imageDisplayData.pivot.y;
                    var rect = frame !== null ? frame : this._textureData.region;
                    var width = rect.width * scale;
                    var height = rect.height * scale;
                    if (this._textureData.rotated && frame === null) {
                        width = rect.height;
                        height = rect.width;
                    }
                    this._pivotX *= width;
                    this._pivotY *= height;
                    if (frame !== null) {
                        this._pivotX += frame.x * scale;
                        this._pivotY += frame.y * scale;
                    }
                }
                else {
                    this._pivotX = 0.0;
                    this._pivotY = 0.0;
                }
                // Update mesh bones and ffd vertices.
                if (this._meshData !== prevMeshData) {
                    if (this._meshData !== null) {
                        if (this._meshData.weight !== null) {
                            this._ffdVertices.length = this._meshData.weight.count * 2;
                            this._meshBones.length = this._meshData.weight.bones.length;
                            for (var i = 0, l = this._meshBones.length; i < l; ++i) {
                                this._meshBones[i] = this._armature.getBone(this._meshData.weight.bones[i].name);
                            }
                        }
                        else {
                            var vertexCount = this._meshData.parent.parent.intArray[this._meshData.offset + 0 /* MeshVertexCount */];
                            this._ffdVertices.length = vertexCount * 2;
                            this._meshBones.length = 0;
                        }
                        for (var i = 0, l = this._ffdVertices.length; i < l; ++i) {
                            this._ffdVertices[i] = 0.0;
                        }
                        this._meshDirty = true;
                    }
                    else {
                        this._ffdVertices.length = 0;
                        this._meshBones.length = 0;
                    }
                }
                else if (this._meshData !== null && this._textureData !== prevTextureData) {
                    this._meshDirty = true;
                }
                if (this._displayData !== null && rawDisplayData !== null && this._displayData !== rawDisplayData && this._meshData === null) {
                    rawDisplayData.transform.toMatrix(Slot._helpMatrix);
                    Slot._helpMatrix.invert();
                    Slot._helpMatrix.transformPoint(0.0, 0.0, Slot._helpPoint);
                    this._pivotX -= Slot._helpPoint.x;
                    this._pivotY -= Slot._helpPoint.y;
                    this._displayData.transform.toMatrix(Slot._helpMatrix);
                    Slot._helpMatrix.invert();
                    Slot._helpMatrix.transformPoint(0.0, 0.0, Slot._helpPoint);
                    this._pivotX += Slot._helpPoint.x;
                    this._pivotY += Slot._helpPoint.y;
                }
                // Update original transform.
                if (rawDisplayData !== null) {
                    this.origin = rawDisplayData.transform;
                }
                else if (this._displayData !== null) {
                    this.origin = this._displayData.transform;
                }
                this._displayDirty = true;
                this._transformDirty = true;
            }
        };
        /**
         * @private
         */
        Slot.prototype._updateDisplay = function () {
            var prevDisplay = this._display !== null ? this._display : this._rawDisplay;
            var prevChildArmature = this._childArmature;
            // Update display and child armature.
            if (this._displayIndex >= 0 && this._displayIndex < this._displayList.length) {
                this._display = this._displayList[this._displayIndex];
                if (this._display !== null && this._display instanceof dragonBones.Armature) {
                    this._childArmature = this._display;
                    this._display = this._childArmature.display;
                }
                else {
                    this._childArmature = null;
                }
            }
            else {
                this._display = null;
                this._childArmature = null;
            }
            // Update display.
            var currentDisplay = this._display !== null ? this._display : this._rawDisplay;
            if (currentDisplay !== prevDisplay) {
                this._onUpdateDisplay();
                this._replaceDisplay(prevDisplay);
                this._visibleDirty = true;
                this._blendModeDirty = true;
                this._colorDirty = true;
            }
            // Update frame.
            if (currentDisplay === this._rawDisplay || currentDisplay === this._meshDisplay) {
                this._updateFrame();
            }
            // Update child armature.
            if (this._childArmature !== prevChildArmature) {
                if (prevChildArmature !== null) {
                    prevChildArmature._parent = null; // Update child armature parent.
                    prevChildArmature.clock = null;
                    if (prevChildArmature.inheritAnimation) {
                        prevChildArmature.animation.reset();
                    }
                }
                if (this._childArmature !== null) {
                    this._childArmature._parent = this; // Update child armature parent.
                    this._childArmature.clock = this._armature.clock;
                    if (this._childArmature.inheritAnimation) {
                        if (this._childArmature.cacheFrameRate === 0) {
                            var cacheFrameRate = this._armature.cacheFrameRate;
                            if (cacheFrameRate !== 0) {
                                this._childArmature.cacheFrameRate = cacheFrameRate;
                            }
                        }
                        // Child armature action.
                        var actions = null;
                        if (this._displayData !== null && this._displayData.type === 1 /* Armature */) {
                            actions = this._displayData.actions;
                        }
                        else {
                            var rawDisplayData = this._displayIndex >= 0 && this._displayIndex < this._rawDisplayDatas.length ? this._rawDisplayDatas[this._displayIndex] : null;
                            if (rawDisplayData !== null && rawDisplayData.type === 1 /* Armature */) {
                                actions = rawDisplayData.actions;
                            }
                        }
                        if (actions !== null && actions.length > 0) {
                            for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
                                var action = actions_1[_i];
                                this._childArmature._bufferAction(action, false); // Make sure default action at the beginning.
                            }
                        }
                        else {
                            this._childArmature.animation.play();
                        }
                    }
                }
            }
        };
        /**
         * @private
         */
        Slot.prototype._updateGlobalTransformMatrix = function (isCache) {
            this.globalTransformMatrix.copyFrom(this._localMatrix);
            this.globalTransformMatrix.concat(this._parent.globalTransformMatrix);
            if (isCache) {
                this.global.fromMatrix(this.globalTransformMatrix);
            }
            else {
                this._globalDirty = true;
            }
        };
        /**
         * @private
         */
        Slot.prototype._isMeshBonesUpdate = function () {
            for (var _i = 0, _a = this._meshBones; _i < _a.length; _i++) {
                var bone = _a[_i];
                if (bone !== null && bone._childrenTransformDirty) {
                    return true;
                }
            }
            return false;
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setArmature = function (value) {
            if (this._armature === value) {
                return;
            }
            if (this._armature !== null) {
                this._armature._removeSlotFromSlotList(this);
            }
            this._armature = value; //
            this._onUpdateDisplay();
            if (this._armature !== null) {
                this._armature._addSlotToSlotList(this);
                this._addDisplay();
            }
            else {
                this._removeDisplay();
            }
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setDisplayIndex = function (value, isAnimation) {
            if (isAnimation === void 0) { isAnimation = false; }
            if (isAnimation) {
                if (this._animationDisplayIndex === value) {
                    return false;
                }
                this._animationDisplayIndex = value;
            }
            if (this._displayIndex === value) {
                return false;
            }
            this._displayIndex = value;
            this._displayDirty = true;
            this._updateDisplayData();
            return this._displayDirty;
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setZorder = function (value) {
            if (this._zOrder === value) {
                //return false;
            }
            this._zOrder = value;
            this._zOrderDirty = true;
            return this._zOrderDirty;
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setColor = function (value) {
            this._colorTransform.copyFrom(value);
            this._colorDirty = true;
            return this._colorDirty;
        };
        /**
         * @private
         */
        Slot.prototype._setDisplayList = function (value) {
            if (value !== null && value.length > 0) {
                if (this._displayList.length !== value.length) {
                    this._displayList.length = value.length;
                }
                for (var i = 0, l = value.length; i < l; ++i) {
                    var eachDisplay = value[i];
                    if (eachDisplay !== null && eachDisplay !== this._rawDisplay && eachDisplay !== this._meshDisplay &&
                        !(eachDisplay instanceof dragonBones.Armature) && this._displayList.indexOf(eachDisplay) < 0) {
                        this._initDisplay(eachDisplay);
                    }
                    this._displayList[i] = eachDisplay;
                }
            }
            else if (this._displayList.length > 0) {
                this._displayList.length = 0;
            }
            if (this._displayIndex >= 0 && this._displayIndex < this._displayList.length) {
                this._displayDirty = this._display !== this._displayList[this._displayIndex];
            }
            else {
                this._displayDirty = this._display !== null;
            }
            this._updateDisplayData();
            return this._displayDirty;
        };
        /**
         * @private
         */
        Slot.prototype.init = function (slotData, displayDatas, rawDisplay, meshDisplay) {
            if (this.slotData !== null) {
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
            this._displayDatas.length = this._rawDisplayDatas.length;
            for (var i = 0, l = this._displayDatas.length; i < l; ++i) {
                this._displayDatas[i] = this._rawDisplayDatas[i];
            }
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype.update = function (cacheFrameIndex) {
            if (this._displayDirty) {
                this._displayDirty = false;
                this._updateDisplay();
                if (this._transformDirty) {
                    if (this.origin !== null) {
                        this.global.copyFrom(this.origin).add(this.offset).toMatrix(this._localMatrix);
                    }
                    else {
                        this.global.copyFrom(this.offset).toMatrix(this._localMatrix);
                    }
                }
            }
            if (this._zOrderDirty) {
                this._zOrderDirty = false;
                this._updateZOrder();
            }
            if (cacheFrameIndex >= 0 && this._cachedFrameIndices !== null) {
                var cachedFrameIndex = this._cachedFrameIndices[cacheFrameIndex];
                if (cachedFrameIndex >= 0 && this._cachedFrameIndex === cachedFrameIndex) {
                    this._transformDirty = false;
                }
                else if (cachedFrameIndex >= 0) {
                    this._transformDirty = true;
                    this._cachedFrameIndex = cachedFrameIndex;
                }
                else if (this._transformDirty || this._parent._childrenTransformDirty) {
                    this._transformDirty = true;
                    this._cachedFrameIndex = -1;
                }
                else if (this._cachedFrameIndex >= 0) {
                    this._transformDirty = false;
                    this._cachedFrameIndices[cacheFrameIndex] = this._cachedFrameIndex;
                }
                else {
                    this._transformDirty = true;
                    this._cachedFrameIndex = -1;
                }
            }
            else if (this._transformDirty || this._parent._childrenTransformDirty) {
                cacheFrameIndex = -1;
                this._transformDirty = true;
                this._cachedFrameIndex = -1;
            }
            if (this._display === null) {
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
            if (this._meshData !== null && this._display === this._meshDisplay) {
                var isSkinned = this._meshData.weight !== null;
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
                    var isCache = cacheFrameIndex >= 0;
                    this._updateGlobalTransformMatrix(isCache);
                    if (isCache && this._cachedFrameIndices !== null) {
                        this._cachedFrameIndex = this._cachedFrameIndices[cacheFrameIndex] = this._armature.armatureData.setCacheFrame(this.globalTransformMatrix, this.global);
                    }
                }
                else {
                    this._armature.armatureData.getCacheFrame(this.globalTransformMatrix, this.global, this._cachedFrameIndex);
                }
                this._updateTransform(false);
            }
        };
        /**
         * @private
         */
        Slot.prototype.updateTransformAndMatrix = function () {
            if (this._transformDirty) {
                this._transformDirty = false;
                this._updateGlobalTransformMatrix(false);
            }
        };
        /**
         * 判断指定的点是否在插槽的自定义包围盒内。
         * @param x 点的水平坐标。（骨架内坐标系）
         * @param y 点的垂直坐标。（骨架内坐标系）
         * @param color 指定的包围盒颜色。 [0: 与所有包围盒进行判断, N: 仅当包围盒的颜色为 N 时才进行判断]
         * @version DragonBones 5.0
         * @language zh_CN
         */
        Slot.prototype.containsPoint = function (x, y) {
            if (this._boundingBoxData === null) {
                return false;
            }
            this.updateTransformAndMatrix();
            Slot._helpMatrix.copyFrom(this.globalTransformMatrix);
            Slot._helpMatrix.invert();
            Slot._helpMatrix.transformPoint(x, y, Slot._helpPoint);
            return this._boundingBoxData.containsPoint(Slot._helpPoint.x, Slot._helpPoint.y);
        };
        /**
         * 判断指定的线段与插槽的自定义包围盒是否相交。
         * @param xA 线段起点的水平坐标。（骨架内坐标系）
         * @param yA 线段起点的垂直坐标。（骨架内坐标系）
         * @param xB 线段终点的水平坐标。（骨架内坐标系）
         * @param yB 线段终点的垂直坐标。（骨架内坐标系）
         * @param intersectionPointA 线段从起点到终点与包围盒相交的第一个交点。（骨架内坐标系）
         * @param intersectionPointB 线段从终点到起点与包围盒相交的第一个交点。（骨架内坐标系）
         * @param normalRadians 碰撞点处包围盒切线的法线弧度。 [x: 第一个碰撞点处切线的法线弧度, y: 第二个碰撞点处切线的法线弧度]
         * @returns 相交的情况。 [-1: 不相交且线段在包围盒内, 0: 不相交, 1: 相交且有一个交点且终点在包围盒内, 2: 相交且有一个交点且起点在包围盒内, 3: 相交且有两个交点, N: 相交且有 N 个交点]
         * @version DragonBones 5.0
         * @language zh_CN
         */
        Slot.prototype.intersectsSegment = function (xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            if (this._boundingBoxData === null) {
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
            var intersectionCount = this._boundingBoxData.intersectsSegment(xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians);
            if (intersectionCount > 0) {
                if (intersectionCount === 1 || intersectionCount === 2) {
                    if (intersectionPointA !== null) {
                        this.globalTransformMatrix.transformPoint(intersectionPointA.x, intersectionPointA.y, intersectionPointA);
                        if (intersectionPointB !== null) {
                            intersectionPointB.x = intersectionPointA.x;
                            intersectionPointB.y = intersectionPointA.y;
                        }
                    }
                    else if (intersectionPointB !== null) {
                        this.globalTransformMatrix.transformPoint(intersectionPointB.x, intersectionPointB.y, intersectionPointB);
                    }
                }
                else {
                    if (intersectionPointA !== null) {
                        this.globalTransformMatrix.transformPoint(intersectionPointA.x, intersectionPointA.y, intersectionPointA);
                    }
                    if (intersectionPointB !== null) {
                        this.globalTransformMatrix.transformPoint(intersectionPointB.x, intersectionPointB.y, intersectionPointB);
                    }
                }
                if (normalRadians !== null) {
                    this.globalTransformMatrix.transformPoint(Math.cos(normalRadians.x), Math.sin(normalRadians.x), Slot._helpPoint, true);
                    normalRadians.x = Math.atan2(Slot._helpPoint.y, Slot._helpPoint.x);
                    this.globalTransformMatrix.transformPoint(Math.cos(normalRadians.y), Math.sin(normalRadians.y), Slot._helpPoint, true);
                    normalRadians.y = Math.atan2(Slot._helpPoint.y, Slot._helpPoint.x);
                }
            }
            return intersectionCount;
        };
        /**
         * 在下一帧更新显示对象的状态。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Slot.prototype.invalidUpdate = function () {
            this._displayDirty = true;
            this._transformDirty = true;
        };
        Object.defineProperty(Slot.prototype, "displayIndex", {
            /**
             * 此时显示的显示对象在显示列表中的索引。
             * @version DragonBones 4.5
             * @language zh_CN
             */
            get: function () {
                return this._displayIndex;
            },
            set: function (value) {
                if (this._setDisplayIndex(value)) {
                    this.update(-1);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "displayList", {
            /**
             * 包含显示对象或子骨架的显示列表。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._displayList.concat();
            },
            set: function (value) {
                var backupDisplayList = this._displayList.concat(); // Copy.
                var disposeDisplayList = new Array();
                if (this._setDisplayList(value)) {
                    this.update(-1);
                }
                // Release replaced displays.
                for (var _i = 0, backupDisplayList_1 = backupDisplayList; _i < backupDisplayList_1.length; _i++) {
                    var eachDisplay = backupDisplayList_1[_i];
                    if (eachDisplay !== null && eachDisplay !== this._rawDisplay && eachDisplay !== this._meshDisplay &&
                        this._displayList.indexOf(eachDisplay) < 0 &&
                        disposeDisplayList.indexOf(eachDisplay) < 0) {
                        disposeDisplayList.push(eachDisplay);
                    }
                }
                for (var _a = 0, disposeDisplayList_2 = disposeDisplayList; _a < disposeDisplayList_2.length; _a++) {
                    var eachDisplay = disposeDisplayList_2[_a];
                    if (eachDisplay instanceof dragonBones.Armature) {
                        eachDisplay.dispose();
                    }
                    else {
                        this._disposeDisplay(eachDisplay);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "boundingBoxData", {
            /**
             * @language zh_CN
             * 插槽此时的自定义包围盒数据。
             * @see dragonBones.Armature
             * @version DragonBones 3.0
             */
            get: function () {
                return this._boundingBoxData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "rawDisplay", {
            /**
             * @private
             */
            get: function () {
                return this._rawDisplay;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "meshDisplay", {
            /**
             * @private
             */
            get: function () {
                return this._meshDisplay;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "display", {
            /**
             * 此时显示的显示对象。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._display;
            },
            set: function (value) {
                if (this._display === value) {
                    return;
                }
                var displayListLength = this._displayList.length;
                if (this._displayIndex < 0 && displayListLength === 0) {
                    this._displayIndex = 0;
                }
                if (this._displayIndex < 0) {
                    return;
                }
                else {
                    var replaceDisplayList = this.displayList; // Copy.
                    if (displayListLength <= this._displayIndex) {
                        replaceDisplayList.length = this._displayIndex + 1;
                    }
                    replaceDisplayList[this._displayIndex] = value;
                    this.displayList = replaceDisplayList;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "childArmature", {
            /**
             * 此时显示的子骨架。
             * @see dragonBones.Armature
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._childArmature;
            },
            set: function (value) {
                if (this._childArmature === value) {
                    return;
                }
                this.display = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see #display
         */
        Slot.prototype.getDisplay = function () {
            return this._display;
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see #display
         */
        Slot.prototype.setDisplay = function (value) {
            this.display = value;
        };
        return Slot;
    }(dragonBones.TransformObject));
    dragonBones.Slot = Slot;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     * @internal
     */
    var Constraint = (function (_super) {
        __extends(Constraint, _super);
        function Constraint() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Constraint.prototype._onClear = function () {
            this.target = null; //
            this.bone = null; //
            this.root = null; //
        };
        Constraint._helpMatrix = new dragonBones.Matrix();
        Constraint._helpTransform = new dragonBones.Transform();
        Constraint._helpPoint = new dragonBones.Point();
        return Constraint;
    }(dragonBones.BaseObject));
    dragonBones.Constraint = Constraint;
    /**
     * @private
     * @internal
     */
    var IKConstraint = (function (_super) {
        __extends(IKConstraint, _super);
        function IKConstraint() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        IKConstraint.toString = function () {
            return "[class dragonBones.IKConstraint]";
        };
        IKConstraint.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.bendPositive = false;
            this.scaleEnabled = false;
            this.weight = 1.0;
        };
        IKConstraint.prototype._computeA = function () {
            var ikGlobal = this.target.global;
            var global = this.bone.global;
            var globalTransformMatrix = this.bone.globalTransformMatrix;
            // const boneLength = this.bone.boneData.length;
            // const x = globalTransformMatrix.a * boneLength; 
            var ikRadian = Math.atan2(ikGlobal.y - global.y, ikGlobal.x - global.x);
            if (global.scaleX < 0.0) {
                ikRadian += Math.PI;
            }
            global.rotation += (ikRadian - global.rotation) * this.weight;
            global.toMatrix(globalTransformMatrix);
        };
        IKConstraint.prototype._computeB = function () {
            var boneLength = this.bone.boneData.length;
            var parent = this.root;
            var ikGlobal = this.target.global;
            var parentGlobal = parent.global;
            var global = this.bone.global;
            var globalTransformMatrix = this.bone.globalTransformMatrix;
            var x = globalTransformMatrix.a * boneLength;
            var y = globalTransformMatrix.b * boneLength;
            var lLL = x * x + y * y;
            var lL = Math.sqrt(lLL);
            var dX = global.x - parentGlobal.x;
            var dY = global.y - parentGlobal.y;
            var lPP = dX * dX + dY * dY;
            var lP = Math.sqrt(lPP);
            var rawRadianA = Math.atan2(dY, dX);
            dX = ikGlobal.x - parentGlobal.x;
            dY = ikGlobal.y - parentGlobal.y;
            var lTT = dX * dX + dY * dY;
            var lT = Math.sqrt(lTT);
            var ikRadianA = 0.0;
            if (lL + lP <= lT || lT + lL <= lP || lT + lP <= lL) {
                ikRadianA = Math.atan2(ikGlobal.y - parentGlobal.y, ikGlobal.x - parentGlobal.x);
                if (lL + lP <= lT) {
                }
                else if (lP < lL) {
                    ikRadianA += Math.PI;
                }
            }
            else {
                var h = (lPP - lLL + lTT) / (2.0 * lTT);
                var r = Math.sqrt(lPP - h * h * lTT) / lT;
                var hX = parentGlobal.x + (dX * h);
                var hY = parentGlobal.y + (dY * h);
                var rX = -dY * r;
                var rY = dX * r;
                var isPPR = false;
                if (parent._parent !== null) {
                    var parentParentMatrix = parent._parent.globalTransformMatrix;
                    isPPR = parentParentMatrix.a * parentParentMatrix.d - parentParentMatrix.b * parentParentMatrix.c < 0.0;
                }
                if (isPPR !== this.bendPositive) {
                    global.x = hX - rX;
                    global.y = hY - rY;
                }
                else {
                    global.x = hX + rX;
                    global.y = hY + rY;
                }
                ikRadianA = Math.atan2(global.y - parentGlobal.y, global.x - parentGlobal.x);
            }
            var dR = (ikRadianA - rawRadianA) * this.weight;
            parentGlobal.rotation += dR;
            parentGlobal.toMatrix(parent.globalTransformMatrix);
            var parentRadian = rawRadianA + dR;
            global.x = parentGlobal.x + Math.cos(parentRadian) * lP;
            global.y = parentGlobal.y + Math.sin(parentRadian) * lP;
            var ikRadianB = Math.atan2(ikGlobal.y - global.y, ikGlobal.x - global.x);
            if (global.scaleX < 0.0) {
                ikRadianB += Math.PI;
            }
            dR = (ikRadianB - global.rotation) * this.weight;
            global.rotation += dR;
            global.toMatrix(globalTransformMatrix);
        };
        IKConstraint.prototype.update = function () {
            if (this.root === null) {
                this.bone.updateByConstraint();
                this._computeA();
            }
            else {
                this.root.updateByConstraint();
                this.bone.updateByConstraint();
                this._computeB();
            }
        };
        return IKConstraint;
    }(Constraint));
    dragonBones.IKConstraint = IKConstraint;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * WorldClock 提供时钟支持，为每个加入到时钟的 IAnimatable 对象更新时间。
     * @see dragonBones.IAnimateble
     * @see dragonBones.Armature
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var WorldClock = (function () {
        /**
         * 创建一个新的 WorldClock 实例。
         * 通常并不需要单独创建 WorldClock 实例，可以直接使用 WorldClock.clock 静态实例。
         * (创建更多独立的 WorldClock 实例可以更灵活的为需要更新的 IAnimateble 实例分组，用于控制不同组不同的播放速度)
         * @version DragonBones 3.0
         * @language zh_CN
         */
        function WorldClock(time) {
            if (time === void 0) { time = -1.0; }
            /**
             * 当前时间。 (以秒为单位)
             * @version DragonBones 3.0
             * @language zh_CN
             */
            this.time = 0.0;
            /**
             * 时间流逝速度，用于控制动画变速播放。 [0: 停止播放, (0~1): 慢速播放, 1: 正常播放, (1~N): 快速播放]
             * @default 1.0
             * @version DragonBones 3.0
             * @language zh_CN
             */
            this.timeScale = 1.0;
            this._animatebles = [];
            this._clock = null;
            if (time < 0.0) {
                this.time = new Date().getTime() * 0.001;
            }
            else {
                this.time = time;
            }
        }
        /**
         * 为所有的 IAnimatable 实例更新时间。
         * @param passedTime 前进的时间。 (以秒为单位，当设置为 -1 时将自动计算当前帧与上一帧的时间差)
         * @version DragonBones 3.0
         * @language zh_CN
         */
        WorldClock.prototype.advanceTime = function (passedTime) {
            if (passedTime !== passedTime) {
                passedTime = 0.0;
            }
            if (passedTime < 0.0) {
                passedTime = new Date().getTime() * 0.001 - this.time;
            }
            if (this.timeScale !== 1.0) {
                passedTime *= this.timeScale;
            }
            if (passedTime < 0.0) {
                this.time -= passedTime;
            }
            else {
                this.time += passedTime;
            }
            if (passedTime === 0.0) {
                return;
            }
            var i = 0, r = 0, l = this._animatebles.length;
            for (; i < l; ++i) {
                var animatable = this._animatebles[i];
                if (animatable !== null) {
                    if (r > 0) {
                        this._animatebles[i - r] = animatable;
                        this._animatebles[i] = null;
                    }
                    animatable.advanceTime(passedTime);
                }
                else {
                    r++;
                }
            }
            if (r > 0) {
                l = this._animatebles.length;
                for (; i < l; ++i) {
                    var animateble = this._animatebles[i];
                    if (animateble !== null) {
                        this._animatebles[i - r] = animateble;
                    }
                    else {
                        r++;
                    }
                }
                this._animatebles.length -= r;
            }
        };
        /**
         * 是否包含 IAnimatable 实例
         * @param value IAnimatable 实例。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        WorldClock.prototype.contains = function (value) {
            return this._animatebles.indexOf(value) >= 0;
        };
        /**
         * 添加 IAnimatable 实例。
         * @param value IAnimatable 实例。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        WorldClock.prototype.add = function (value) {
            if (this._animatebles.indexOf(value) < 0) {
                this._animatebles.push(value);
                value.clock = this;
            }
        };
        /**
         * 移除 IAnimatable 实例。
         * @param value IAnimatable 实例。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        WorldClock.prototype.remove = function (value) {
            var index = this._animatebles.indexOf(value);
            if (index >= 0) {
                this._animatebles[index] = null;
                value.clock = null;
            }
        };
        /**
         * 清除所有的 IAnimatable 实例。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        WorldClock.prototype.clear = function () {
            for (var _i = 0, _a = this._animatebles; _i < _a.length; _i++) {
                var animatable = _a[_i];
                if (animatable !== null) {
                    animatable.clock = null;
                }
            }
        };
        Object.defineProperty(WorldClock.prototype, "clock", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._clock;
            },
            set: function (value) {
                if (this._clock === value) {
                    return;
                }
                if (this._clock !== null) {
                    this._clock.remove(this);
                }
                this._clock = value;
                if (this._clock !== null) {
                    this._clock.add(this);
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 一个可以直接使用的全局 WorldClock 实例.
         * @version DragonBones 3.0
         * @language zh_CN
         */
        WorldClock.clock = new WorldClock();
        return WorldClock;
    }());
    dragonBones.WorldClock = WorldClock;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 动画控制器，用来播放动画数据，管理动画状态。
     * @see dragonBones.AnimationData
     * @see dragonBones.AnimationState
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var Animation = (function (_super) {
        __extends(Animation, _super);
        function Animation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._animationNames = [];
            _this._animationStates = [];
            _this._animations = {};
            _this._animationConfig = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        Animation.toString = function () {
            return "[class dragonBones.Animation]";
        };
        /**
         * @private
         */
        Animation.prototype._onClear = function () {
            for (var _i = 0, _a = this._animationStates; _i < _a.length; _i++) {
                var animationState = _a[_i];
                animationState.returnToPool();
            }
            for (var k in this._animations) {
                delete this._animations[k];
            }
            if (this._animationConfig !== null) {
                this._animationConfig.returnToPool();
            }
            this.timeScale = 1.0;
            this._animationDirty = false;
            this._timelineDirty = false;
            this._animationNames.length = 0;
            this._animationStates.length = 0;
            //this._animations.clear();
            this._armature = null; //
            this._animationConfig = null; //
            this._lastAnimationState = null;
        };
        Animation.prototype._fadeOut = function (animationConfig) {
            switch (animationConfig.fadeOutMode) {
                case 1 /* SameLayer */:
                    for (var _i = 0, _a = this._animationStates; _i < _a.length; _i++) {
                        var animationState = _a[_i];
                        if (animationState.layer === animationConfig.layer) {
                            animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                        }
                    }
                    break;
                case 2 /* SameGroup */:
                    for (var _b = 0, _c = this._animationStates; _b < _c.length; _b++) {
                        var animationState = _c[_b];
                        if (animationState.group === animationConfig.group) {
                            animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                        }
                    }
                    break;
                case 3 /* SameLayerAndGroup */:
                    for (var _d = 0, _e = this._animationStates; _d < _e.length; _d++) {
                        var animationState = _e[_d];
                        if (animationState.layer === animationConfig.layer &&
                            animationState.group === animationConfig.group) {
                            animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                        }
                    }
                    break;
                case 4 /* All */:
                    for (var _f = 0, _g = this._animationStates; _f < _g.length; _f++) {
                        var animationState = _g[_f];
                        animationState.fadeOut(animationConfig.fadeOutTime, animationConfig.pauseFadeOut);
                    }
                    break;
                case 0 /* None */:
                case 5 /* Single */:
                default:
                    break;
            }
        };
        /**
         * @internal
         * @private
         */
        Animation.prototype.init = function (armature) {
            if (this._armature !== null) {
                return;
            }
            this._armature = armature;
            this._animationConfig = dragonBones.BaseObject.borrowObject(dragonBones.AnimationConfig);
        };
        /**
         * @internal
         * @private
         */
        Animation.prototype.advanceTime = function (passedTime) {
            if (passedTime < 0.0) {
                passedTime = -passedTime;
            }
            if (this._armature.inheritAnimation && this._armature._parent !== null) {
                passedTime *= this._armature._parent._armature.animation.timeScale;
            }
            if (this.timeScale !== 1.0) {
                passedTime *= this.timeScale;
            }
            var animationStateCount = this._animationStates.length;
            if (animationStateCount === 1) {
                var animationState = this._animationStates[0];
                if (animationState._fadeState > 0 && animationState._subFadeState > 0) {
                    this._armature._dragonBones.bufferObject(animationState);
                    this._animationStates.length = 0;
                    this._lastAnimationState = null;
                }
                else {
                    var animationData = animationState.animationData;
                    var cacheFrameRate = animationData.cacheFrameRate;
                    if (this._animationDirty && cacheFrameRate > 0.0) {
                        this._animationDirty = false;
                        for (var _i = 0, _a = this._armature.getBones(); _i < _a.length; _i++) {
                            var bone = _a[_i];
                            bone._cachedFrameIndices = animationData.getBoneCachedFrameIndices(bone.name);
                        }
                        for (var _b = 0, _c = this._armature.getSlots(); _b < _c.length; _b++) {
                            var slot = _c[_b];
                            slot._cachedFrameIndices = animationData.getSlotCachedFrameIndices(slot.name);
                        }
                    }
                    if (this._timelineDirty) {
                        animationState.updateTimelines();
                    }
                    animationState.advanceTime(passedTime, cacheFrameRate);
                }
            }
            else if (animationStateCount > 1) {
                for (var i = 0, r = 0; i < animationStateCount; ++i) {
                    var animationState = this._animationStates[i];
                    if (animationState._fadeState > 0 && animationState._subFadeState > 0) {
                        r++;
                        this._armature._dragonBones.bufferObject(animationState);
                        this._animationDirty = true;
                        if (this._lastAnimationState === animationState) {
                            this._lastAnimationState = null;
                        }
                    }
                    else {
                        if (r > 0) {
                            this._animationStates[i - r] = animationState;
                        }
                        if (this._timelineDirty) {
                            animationState.updateTimelines();
                        }
                        animationState.advanceTime(passedTime, 0.0);
                    }
                    if (i === animationStateCount - 1 && r > 0) {
                        this._animationStates.length -= r;
                        if (this._lastAnimationState === null && this._animationStates.length > 0) {
                            this._lastAnimationState = this._animationStates[this._animationStates.length - 1];
                        }
                    }
                }
                this._armature._cacheFrameIndex = -1;
            }
            else {
                this._armature._cacheFrameIndex = -1;
            }
            this._timelineDirty = false;
        };
        /**
         * 清除所有动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.reset = function () {
            for (var _i = 0, _a = this._animationStates; _i < _a.length; _i++) {
                var animationState = _a[_i];
                animationState.returnToPool();
            }
            this._animationDirty = false;
            this._timelineDirty = false;
            this._animationConfig.clear();
            this._animationStates.length = 0;
            this._lastAnimationState = null;
        };
        /**
         * 暂停播放动画。
         * @param animationName 动画状态的名称，如果未设置，则暂停所有动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Animation.prototype.stop = function (animationName) {
            if (animationName === void 0) { animationName = null; }
            if (animationName !== null) {
                var animationState = this.getState(animationName);
                if (animationState !== null) {
                    animationState.stop();
                }
            }
            else {
                for (var _i = 0, _a = this._animationStates; _i < _a.length; _i++) {
                    var animationState = _a[_i];
                    animationState.stop();
                }
            }
        };
        /**
         * 通过动画配置来播放动画。
         * @param animationConfig 动画配置。
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationConfig
         * @see dragonBones.AnimationState
         * @version DragonBones 5.0
         * @beta
         * @language zh_CN
         */
        Animation.prototype.playConfig = function (animationConfig) {
            var animationName = animationConfig.animation;
            if (!(animationName in this._animations)) {
                console.warn("Non-existent animation.\n", "DragonBones name: " + this._armature.armatureData.parent.name, "Armature name: " + this._armature.name, "Animation name: " + animationName);
                return null;
            }
            var animationData = this._animations[animationName];
            if (animationConfig.fadeOutMode === 5 /* Single */) {
                for (var _i = 0, _a = this._animationStates; _i < _a.length; _i++) {
                    var animationState_1 = _a[_i];
                    if (animationState_1.animationData === animationData) {
                        return animationState_1;
                    }
                }
            }
            if (this._animationStates.length === 0) {
                animationConfig.fadeInTime = 0.0;
            }
            else if (animationConfig.fadeInTime < 0.0) {
                animationConfig.fadeInTime = animationData.fadeInTime;
            }
            if (animationConfig.fadeOutTime < 0.0) {
                animationConfig.fadeOutTime = animationConfig.fadeInTime;
            }
            if (animationConfig.timeScale <= -100.0) {
                animationConfig.timeScale = 1.0 / animationData.scale;
            }
            if (animationData.frameCount > 1) {
                if (animationConfig.position < 0.0) {
                    animationConfig.position %= animationData.duration;
                    animationConfig.position = animationData.duration - animationConfig.position;
                }
                else if (animationConfig.position === animationData.duration) {
                    animationConfig.position -= 0.000001; // Play a little time before end.
                }
                else if (animationConfig.position > animationData.duration) {
                    animationConfig.position %= animationData.duration;
                }
                if (animationConfig.duration > 0.0 && animationConfig.position + animationConfig.duration > animationData.duration) {
                    animationConfig.duration = animationData.duration - animationConfig.position;
                }
                if (animationConfig.playTimes < 0) {
                    animationConfig.playTimes = animationData.playTimes;
                }
            }
            else {
                animationConfig.playTimes = 1;
                animationConfig.position = 0.0;
                if (animationConfig.duration > 0.0) {
                    animationConfig.duration = 0.0;
                }
            }
            if (animationConfig.duration === 0.0) {
                animationConfig.duration = -1.0;
            }
            this._fadeOut(animationConfig);
            var animationState = dragonBones.BaseObject.borrowObject(dragonBones.AnimationState);
            animationState.init(this._armature, animationData, animationConfig);
            this._animationDirty = true;
            this._armature._cacheFrameIndex = -1;
            if (this._animationStates.length > 0) {
                var added = false;
                for (var i = 0, l = this._animationStates.length; i < l; ++i) {
                    if (animationState.layer >= this._animationStates[i].layer) {
                    }
                    else {
                        added = true;
                        this._animationStates.splice(i + 1, 0, animationState);
                        break;
                    }
                }
                if (!added) {
                    this._animationStates.push(animationState);
                }
            }
            else {
                this._animationStates.push(animationState);
            }
            // Child armature play same name animation.
            for (var _b = 0, _c = this._armature.getSlots(); _b < _c.length; _b++) {
                var slot = _c[_b];
                var childArmature = slot.childArmature;
                if (childArmature !== null && childArmature.inheritAnimation &&
                    childArmature.animation.hasAnimation(animationName) &&
                    childArmature.animation.getState(animationName) === null) {
                    childArmature.animation.fadeIn(animationName); //
                }
            }
            if (animationConfig.fadeInTime <= 0.0) {
                this._armature.advanceTime(0.0);
            }
            this._lastAnimationState = animationState;
            return animationState;
        };
        /**
         * 播放动画。
         * @param animationName 动画数据名称，如果未设置，则播放默认动画，或将暂停状态切换为播放状态，或重新播放上一个正在播放的动画。
         * @param playTimes 播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Animation.prototype.play = function (animationName, playTimes) {
            if (animationName === void 0) { animationName = null; }
            if (playTimes === void 0) { playTimes = -1; }
            this._animationConfig.clear();
            this._animationConfig.resetToPose = true;
            this._animationConfig.playTimes = playTimes;
            this._animationConfig.fadeInTime = 0.0;
            this._animationConfig.animation = animationName !== null ? animationName : "";
            if (animationName !== null && animationName.length > 0) {
                this.playConfig(this._animationConfig);
            }
            else if (this._lastAnimationState === null) {
                var defaultAnimation = this._armature.armatureData.defaultAnimation;
                if (defaultAnimation !== null) {
                    this._animationConfig.animation = defaultAnimation.name;
                    this.playConfig(this._animationConfig);
                }
            }
            else if (!this._lastAnimationState.isPlaying && !this._lastAnimationState.isCompleted) {
                this._lastAnimationState.play();
            }
            else {
                this._animationConfig.animation = this._lastAnimationState.name;
                this.playConfig(this._animationConfig);
            }
            return this._lastAnimationState;
        };
        /**
         * 淡入播放动画。
         * @param animationName 动画数据名称。
         * @param playTimes 播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @param fadeInTime 淡入时间。 [-1: 使用动画数据默认值, [0~N]: 淡入时间] (以秒为单位)
         * @param layer 混合图层，图层高会优先获取混合权重。
         * @param group 混合组，用于动画状态编组，方便控制淡出。
         * @param fadeOutMode 淡出模式。
         * @param resetToPose
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationFadeOutMode
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.fadeIn = function (animationName, fadeInTime, playTimes, layer, group, fadeOutMode) {
            if (fadeInTime === void 0) { fadeInTime = -1.0; }
            if (playTimes === void 0) { playTimes = -1; }
            if (layer === void 0) { layer = 0; }
            if (group === void 0) { group = null; }
            if (fadeOutMode === void 0) { fadeOutMode = 3 /* SameLayerAndGroup */; }
            this._animationConfig.clear();
            this._animationConfig.fadeOutMode = fadeOutMode;
            this._animationConfig.playTimes = playTimes;
            this._animationConfig.layer = layer;
            this._animationConfig.fadeInTime = fadeInTime;
            this._animationConfig.animation = animationName;
            this._animationConfig.group = group !== null ? group : "";
            return this.playConfig(this._animationConfig);
        };
        /**
         * 从指定时间开始播放动画。
         * @param animationName 动画数据的名称。
         * @param time 开始时间。 (以秒为单位)
         * @param playTimes 播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.gotoAndPlayByTime = function (animationName, time, playTimes) {
            if (time === void 0) { time = 0.0; }
            if (playTimes === void 0) { playTimes = -1; }
            this._animationConfig.clear();
            this._animationConfig.resetToPose = true;
            this._animationConfig.playTimes = playTimes;
            this._animationConfig.position = time;
            this._animationConfig.fadeInTime = 0.0;
            this._animationConfig.animation = animationName;
            return this.playConfig(this._animationConfig);
        };
        /**
         * 从指定帧开始播放动画。
         * @param animationName 动画数据的名称。
         * @param frame 帧。
         * @param playTimes 播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.gotoAndPlayByFrame = function (animationName, frame, playTimes) {
            if (frame === void 0) { frame = 0; }
            if (playTimes === void 0) { playTimes = -1; }
            this._animationConfig.clear();
            this._animationConfig.resetToPose = true;
            this._animationConfig.playTimes = playTimes;
            this._animationConfig.fadeInTime = 0.0;
            this._animationConfig.animation = animationName;
            var animationData = animationName in this._animations ? this._animations[animationName] : null;
            if (animationData !== null) {
                this._animationConfig.position = animationData.duration * frame / animationData.frameCount;
            }
            return this.playConfig(this._animationConfig);
        };
        /**
         * 从指定进度开始播放动画。
         * @param animationName 动画数据的名称。
         * @param progress 进度。 [0~1]
         * @param playTimes 播放次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.gotoAndPlayByProgress = function (animationName, progress, playTimes) {
            if (progress === void 0) { progress = 0.0; }
            if (playTimes === void 0) { playTimes = -1; }
            this._animationConfig.clear();
            this._animationConfig.resetToPose = true;
            this._animationConfig.playTimes = playTimes;
            this._animationConfig.fadeInTime = 0.0;
            this._animationConfig.animation = animationName;
            var animationData = animationName in this._animations ? this._animations[animationName] : null;
            if (animationData !== null) {
                this._animationConfig.position = animationData.duration * (progress > 0.0 ? progress : 0.0);
            }
            return this.playConfig(this._animationConfig);
        };
        /**
         * 将动画停止到指定的时间。
         * @param animationName 动画数据的名称。
         * @param time 时间。 (以秒为单位)
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.gotoAndStopByTime = function (animationName, time) {
            if (time === void 0) { time = 0.0; }
            var animationState = this.gotoAndPlayByTime(animationName, time, 1);
            if (animationState !== null) {
                animationState.stop();
            }
            return animationState;
        };
        /**
         * 将动画停止到指定的帧。
         * @param animationName 动画数据的名称。
         * @param frame 帧。
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.gotoAndStopByFrame = function (animationName, frame) {
            if (frame === void 0) { frame = 0; }
            var animationState = this.gotoAndPlayByFrame(animationName, frame, 1);
            if (animationState !== null) {
                animationState.stop();
            }
            return animationState;
        };
        /**
         * 将动画停止到指定的进度。
         * @param animationName 动画数据的名称。
         * @param progress 进度。 [0 ~ 1]
         * @returns 对应的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         * @language zh_CN
         */
        Animation.prototype.gotoAndStopByProgress = function (animationName, progress) {
            if (progress === void 0) { progress = 0.0; }
            var animationState = this.gotoAndPlayByProgress(animationName, progress, 1);
            if (animationState !== null) {
                animationState.stop();
            }
            return animationState;
        };
        /**
         * 获取动画状态。
         * @param animationName 动画状态的名称。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Animation.prototype.getState = function (animationName) {
            var i = this._animationStates.length;
            while (i--) {
                var animationState = this._animationStates[i];
                if (animationState.name === animationName) {
                    return animationState;
                }
            }
            return null;
        };
        /**
         * 是否包含动画数据。
         * @param animationName 动画数据的名称。
         * @see dragonBones.AnimationData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        Animation.prototype.hasAnimation = function (animationName) {
            return animationName in this._animations;
        };
        /**
         * 获取所有的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 5.1
         * @language zh_CN
         */
        Animation.prototype.getStates = function () {
            return this._animationStates;
        };
        Object.defineProperty(Animation.prototype, "isPlaying", {
            /**
             * 动画是否处于播放状态。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                for (var _i = 0, _a = this._animationStates; _i < _a.length; _i++) {
                    var animationState = _a[_i];
                    if (animationState.isPlaying) {
                        return true;
                    }
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "isCompleted", {
            /**
             * 所有动画状态是否均已播放完毕。
             * @see dragonBones.AnimationState
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                for (var _i = 0, _a = this._animationStates; _i < _a.length; _i++) {
                    var animationState = _a[_i];
                    if (!animationState.isCompleted) {
                        return false;
                    }
                }
                return this._animationStates.length > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "lastAnimationName", {
            /**
             * 上一个正在播放的动画状态名称。
             * @see #lastAnimationState
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._lastAnimationState !== null ? this._lastAnimationState.name : "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "animationNames", {
            /**
             * 所有动画数据名称。
             * @see #animations
             * @version DragonBones 4.5
             * @language zh_CN
             */
            get: function () {
                return this._animationNames;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "animations", {
            /**
             * 所有动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 4.5
             * @language zh_CN
             */
            get: function () {
                return this._animations;
            },
            set: function (value) {
                if (this._animations === value) {
                    return;
                }
                this._animationNames.length = 0;
                for (var k in this._animations) {
                    delete this._animations[k];
                }
                for (var k in value) {
                    this._animations[k] = value[k];
                    this._animationNames.push(k);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "animationConfig", {
            /**
             * 一个可以快速使用的动画配置实例。
             * @see dragonBones.AnimationConfig
             * @version DragonBones 5.0
             * @language zh_CN
             */
            get: function () {
                this._animationConfig.clear();
                return this._animationConfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "lastAnimationState", {
            /**
             * 上一个正在播放的动画状态。
             * @see dragonBones.AnimationState
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._lastAnimationState;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see #play()
         * @see #fadeIn()
         * @see #gotoAndPlayByTime()
         * @see #gotoAndPlayByFrame()
         * @see #gotoAndPlayByProgress()
         */
        Animation.prototype.gotoAndPlay = function (animationName, fadeInTime, duration, playTimes, layer, group, fadeOutMode, pauseFadeOut, pauseFadeIn) {
            if (fadeInTime === void 0) { fadeInTime = -1; }
            if (duration === void 0) { duration = -1; }
            if (playTimes === void 0) { playTimes = -1; }
            if (layer === void 0) { layer = 0; }
            if (group === void 0) { group = null; }
            if (fadeOutMode === void 0) { fadeOutMode = 3 /* SameLayerAndGroup */; }
            if (pauseFadeOut === void 0) { pauseFadeOut = true; }
            if (pauseFadeIn === void 0) { pauseFadeIn = true; }
            pauseFadeOut;
            pauseFadeIn;
            this._animationConfig.clear();
            this._animationConfig.resetToPose = true;
            this._animationConfig.fadeOutMode = fadeOutMode;
            this._animationConfig.playTimes = playTimes;
            this._animationConfig.layer = layer;
            this._animationConfig.fadeInTime = fadeInTime;
            this._animationConfig.animation = animationName;
            this._animationConfig.group = group !== null ? group : "";
            var animationData = this._animations[animationName];
            if (animationData && duration > 0.0) {
                this._animationConfig.timeScale = animationData.duration / duration;
            }
            return this.playConfig(this._animationConfig);
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see #gotoAndStopByTime()
         * @see #gotoAndStopByFrame()
         * @see #gotoAndStopByProgress()
         */
        Animation.prototype.gotoAndStop = function (animationName, time) {
            if (time === void 0) { time = 0; }
            return this.gotoAndStopByTime(animationName, time);
        };
        Object.defineProperty(Animation.prototype, "animationList", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #animationNames
             * @see #animations
             */
            get: function () {
                return this._animationNames;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "animationDataList", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #animationNames
             * @see #animations
             */
            get: function () {
                var list = [];
                for (var i = 0, l = this._animationNames.length; i < l; ++i) {
                    list.push(this._animations[this._animationNames[i]]);
                }
                return list;
            },
            enumerable: true,
            configurable: true
        });
        return Animation;
    }(dragonBones.BaseObject));
    dragonBones.Animation = Animation;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @internal
     * @private
     */
    var BonePose = (function (_super) {
        __extends(BonePose, _super);
        function BonePose() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.current = new dragonBones.Transform();
            _this.delta = new dragonBones.Transform();
            _this.result = new dragonBones.Transform();
            return _this;
        }
        BonePose.toString = function () {
            return "[class dragonBones.BonePose]";
        };
        BonePose.prototype._onClear = function () {
            this.current.identity();
            this.delta.identity();
            this.result.identity();
        };
        return BonePose;
    }(dragonBones.BaseObject));
    dragonBones.BonePose = BonePose;
    /**
     * 动画状态，播放动画时产生，可以对每个播放的动画进行更细致的控制和调节。
     * @see dragonBones.Animation
     * @see dragonBones.AnimationData
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var AnimationState = (function (_super) {
        __extends(AnimationState, _super);
        function AnimationState() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._boneMask = [];
            _this._boneTimelines = [];
            _this._slotTimelines = [];
            _this._bonePoses = {};
            /**
             * @internal
             * @private
             */
            _this._actionTimeline = null; // Initial value.
            _this._zOrderTimeline = null; // Initial value.
            return _this;
        }
        /**
         * @private
         */
        AnimationState.toString = function () {
            return "[class dragonBones.AnimationState]";
        };
        /**
         * @private
         */
        AnimationState.prototype._onClear = function () {
            for (var _i = 0, _a = this._boneTimelines; _i < _a.length; _i++) {
                var timeline = _a[_i];
                timeline.returnToPool();
            }
            for (var _b = 0, _c = this._slotTimelines; _b < _c.length; _b++) {
                var timeline = _c[_b];
                timeline.returnToPool();
            }
            for (var k in this._bonePoses) {
                this._bonePoses[k].returnToPool();
                delete this._bonePoses[k];
            }
            if (this._actionTimeline !== null) {
                this._actionTimeline.returnToPool();
            }
            if (this._zOrderTimeline !== null) {
                this._zOrderTimeline.returnToPool();
            }
            this.resetToPose = false;
            this.additiveBlending = false;
            this.displayControl = false;
            this.actionEnabled = false;
            this.layer = 0;
            this.playTimes = 1;
            this.timeScale = 1.0;
            this.weight = 1.0;
            this.autoFadeOutTime = 0.0;
            this.fadeTotalTime = 0.0;
            this.name = "";
            this.group = "";
            this.animationData = null; //
            this._timelineDirty = true;
            this._playheadState = 0;
            this._fadeState = -1;
            this._subFadeState = -1;
            this._position = 0.0;
            this._duration = 0.0;
            this._fadeTime = 0.0;
            this._time = 0.0;
            this._fadeProgress = 0.0;
            this._weightResult = 0.0;
            this._boneMask.length = 0;
            this._boneTimelines.length = 0;
            this._slotTimelines.length = 0;
            // this._bonePoses.clear();
            this._armature = null; //
            this._actionTimeline = null; //
            this._zOrderTimeline = null;
        };
        AnimationState.prototype._isDisabled = function (slot) {
            if (this.displayControl) {
                var displayController = slot.displayController;
                if (displayController === null ||
                    displayController === this.name ||
                    displayController === this.group) {
                    return false;
                }
            }
            return true;
        };
        AnimationState.prototype._advanceFadeTime = function (passedTime) {
            var isFadeOut = this._fadeState > 0;
            if (this._subFadeState < 0) {
                this._subFadeState = 0;
                var eventType = isFadeOut ? dragonBones.EventObject.FADE_OUT : dragonBones.EventObject.FADE_IN;
                if (this._armature.eventDispatcher.hasEvent(eventType)) {
                    var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                    eventObject.type = eventType;
                    eventObject.armature = this._armature;
                    eventObject.animationState = this;
                    this._armature._dragonBones.bufferEvent(eventObject);
                }
            }
            if (passedTime < 0.0) {
                passedTime = -passedTime;
            }
            this._fadeTime += passedTime;
            if (this._fadeTime >= this.fadeTotalTime) {
                this._subFadeState = 1;
                this._fadeProgress = isFadeOut ? 0.0 : 1.0;
            }
            else if (this._fadeTime > 0.0) {
                this._fadeProgress = isFadeOut ? (1.0 - this._fadeTime / this.fadeTotalTime) : (this._fadeTime / this.fadeTotalTime);
            }
            else {
                this._fadeProgress = isFadeOut ? 1.0 : 0.0;
            }
            if (this._subFadeState > 0) {
                if (!isFadeOut) {
                    this._playheadState |= 1; // x1
                    this._fadeState = 0;
                }
                var eventType = isFadeOut ? dragonBones.EventObject.FADE_OUT_COMPLETE : dragonBones.EventObject.FADE_IN_COMPLETE;
                if (this._armature.eventDispatcher.hasEvent(eventType)) {
                    var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                    eventObject.type = eventType;
                    eventObject.armature = this._armature;
                    eventObject.animationState = this;
                    this._armature._dragonBones.bufferEvent(eventObject);
                }
            }
        };
        AnimationState.prototype._blendBoneTimline = function (timeline) {
            var bone = timeline.bone;
            var bonePose = timeline.bonePose.result;
            var animationPose = bone.animationPose;
            var boneWeight = this._weightResult > 0.0 ? this._weightResult : -this._weightResult;
            if (!bone._blendDirty) {
                bone._blendDirty = true;
                bone._blendLayer = this.layer;
                bone._blendLayerWeight = boneWeight;
                bone._blendLeftWeight = 1.0;
                animationPose.x = bonePose.x * boneWeight;
                animationPose.y = bonePose.y * boneWeight;
                animationPose.rotation = bonePose.rotation * boneWeight;
                animationPose.skew = bonePose.skew * boneWeight;
                animationPose.scaleX = (bonePose.scaleX - 1.0) * boneWeight + 1.0;
                animationPose.scaleY = (bonePose.scaleY - 1.0) * boneWeight + 1.0;
            }
            else {
                boneWeight *= bone._blendLeftWeight;
                bone._blendLayerWeight += boneWeight;
                animationPose.x += bonePose.x * boneWeight;
                animationPose.y += bonePose.y * boneWeight;
                animationPose.rotation += bonePose.rotation * boneWeight;
                animationPose.skew += bonePose.skew * boneWeight;
                animationPose.scaleX += (bonePose.scaleX - 1.0) * boneWeight;
                animationPose.scaleY += (bonePose.scaleY - 1.0) * boneWeight;
            }
            if (this._fadeState !== 0 || this._subFadeState !== 0) {
                bone._transformDirty = true;
            }
        };
        /**
         * @private
         * @internal
         */
        AnimationState.prototype.init = function (armature, animationData, animationConfig) {
            if (this._armature !== null) {
                return;
            }
            this._armature = armature;
            this.animationData = animationData;
            this.resetToPose = animationConfig.resetToPose;
            this.additiveBlending = animationConfig.additiveBlending;
            this.displayControl = animationConfig.displayControl;
            this.actionEnabled = animationConfig.actionEnabled;
            this.layer = animationConfig.layer;
            this.playTimes = animationConfig.playTimes;
            this.timeScale = animationConfig.timeScale;
            this.fadeTotalTime = animationConfig.fadeInTime;
            this.autoFadeOutTime = animationConfig.autoFadeOutTime;
            this.weight = animationConfig.weight;
            this.name = animationConfig.name.length > 0 ? animationConfig.name : animationConfig.animation;
            this.group = animationConfig.group;
            if (animationConfig.pauseFadeIn) {
                this._playheadState = 2; // 10
            }
            else {
                this._playheadState = 3; // 11
            }
            if (animationConfig.duration < 0.0) {
                this._position = 0.0;
                this._duration = this.animationData.duration;
                if (animationConfig.position !== 0.0) {
                    if (this.timeScale >= 0.0) {
                        this._time = animationConfig.position;
                    }
                    else {
                        this._time = animationConfig.position - this._duration;
                    }
                }
                else {
                    this._time = 0.0;
                }
            }
            else {
                this._position = animationConfig.position;
                this._duration = animationConfig.duration;
                this._time = 0.0;
            }
            if (this.timeScale < 0.0 && this._time === 0.0) {
                this._time = -0.000001; // Turn to end.
            }
            if (this.fadeTotalTime <= 0.0) {
                this._fadeProgress = 0.999999; // Make different.
            }
            if (animationConfig.boneMask.length > 0) {
                this._boneMask.length = animationConfig.boneMask.length;
                for (var i = 0, l = this._boneMask.length; i < l; ++i) {
                    this._boneMask[i] = animationConfig.boneMask[i];
                }
            }
            this._actionTimeline = dragonBones.BaseObject.borrowObject(dragonBones.ActionTimelineState);
            this._actionTimeline.init(this._armature, this, this.animationData.actionTimeline);
            this._actionTimeline.currentTime = this._time;
            if (this._actionTimeline.currentTime < 0.0) {
                this._actionTimeline.currentTime = this._duration - this._actionTimeline.currentTime;
            }
            if (this.animationData.zOrderTimeline !== null) {
                this._zOrderTimeline = dragonBones.BaseObject.borrowObject(dragonBones.ZOrderTimelineState);
                this._zOrderTimeline.init(this._armature, this, this.animationData.zOrderTimeline);
            }
        };
        /**
         * @private
         * @internal
         */
        AnimationState.prototype.updateTimelines = function () {
            var boneTimelines = {};
            for (var _i = 0, _a = this._boneTimelines; _i < _a.length; _i++) {
                var timeline = _a[_i];
                var timelineName = timeline.bone.name;
                if (!(timelineName in boneTimelines)) {
                    boneTimelines[timelineName] = [];
                }
                boneTimelines[timelineName].push(timeline);
            }
            for (var _b = 0, _c = this._armature.getBones(); _b < _c.length; _b++) {
                var bone = _c[_b];
                var timelineName = bone.name;
                if (!this.containsBoneMask(timelineName)) {
                    continue;
                }
                var timelineDatas = this.animationData.getBoneTimelines(timelineName);
                if (timelineName in boneTimelines) {
                    delete boneTimelines[timelineName];
                }
                else {
                    var bonePose = timelineName in this._bonePoses ? this._bonePoses[timelineName] : (this._bonePoses[timelineName] = dragonBones.BaseObject.borrowObject(BonePose));
                    if (timelineDatas !== null) {
                        for (var _d = 0, timelineDatas_1 = timelineDatas; _d < timelineDatas_1.length; _d++) {
                            var timelineData = timelineDatas_1[_d];
                            switch (timelineData.type) {
                                case 10 /* BoneAll */:
                                    var timeline = dragonBones.BaseObject.borrowObject(dragonBones.BoneAllTimelineState);
                                    timeline.bone = bone;
                                    timeline.bonePose = bonePose;
                                    timeline.init(this._armature, this, timelineData);
                                    this._boneTimelines.push(timeline);
                                    break;
                                case 11 /* BoneT */:
                                case 12 /* BoneR */:
                                case 13 /* BoneS */:
                                    // TODO
                                    break;
                                case 14 /* BoneX */:
                                case 15 /* BoneY */:
                                case 16 /* BoneRotate */:
                                case 17 /* BoneSkew */:
                                case 18 /* BoneScaleX */:
                                case 19 /* BoneScaleY */:
                                    // TODO
                                    break;
                            }
                        }
                    }
                    else if (this.resetToPose) {
                        var timeline = dragonBones.BaseObject.borrowObject(dragonBones.BoneAllTimelineState);
                        timeline.bone = bone;
                        timeline.bonePose = bonePose;
                        timeline.init(this._armature, this, null);
                        this._boneTimelines.push(timeline);
                    }
                }
            }
            for (var k in boneTimelines) {
                for (var _e = 0, _f = boneTimelines[k]; _e < _f.length; _e++) {
                    var timeline = _f[_e];
                    this._boneTimelines.splice(this._boneTimelines.indexOf(timeline), 1);
                    timeline.returnToPool();
                }
            }
            var slotTimelines = {};
            var ffdFlags = [];
            for (var _g = 0, _h = this._slotTimelines; _g < _h.length; _g++) {
                var timeline = _h[_g];
                var timelineName = timeline.slot.name;
                if (!(timelineName in slotTimelines)) {
                    slotTimelines[timelineName] = [];
                }
                slotTimelines[timelineName].push(timeline);
            }
            for (var _j = 0, _k = this._armature.getSlots(); _j < _k.length; _j++) {
                var slot = _k[_j];
                var boneName = slot.parent.name;
                if (!this.containsBoneMask(boneName)) {
                    continue;
                }
                var timelineName = slot.name;
                var timelineDatas = this.animationData.getSlotTimeline(timelineName);
                if (timelineName in slotTimelines) {
                    delete slotTimelines[timelineName];
                }
                else {
                    var displayIndexFlag = false;
                    var colorFlag = false;
                    ffdFlags.length = 0;
                    if (timelineDatas !== null) {
                        for (var _l = 0, timelineDatas_2 = timelineDatas; _l < timelineDatas_2.length; _l++) {
                            var timelineData = timelineDatas_2[_l];
                            switch (timelineData.type) {
                                case 20 /* SlotDisplay */:
                                    {
                                        var timeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotDislayIndexTimelineState);
                                        timeline.slot = slot;
                                        timeline.init(this._armature, this, timelineData);
                                        this._slotTimelines.push(timeline);
                                        displayIndexFlag = true;
                                        break;
                                    }
                                case 21 /* SlotColor */:
                                    {
                                        var timeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotColorTimelineState);
                                        timeline.slot = slot;
                                        timeline.init(this._armature, this, timelineData);
                                        this._slotTimelines.push(timeline);
                                        colorFlag = true;
                                        break;
                                    }
                                case 22 /* SlotFFD */:
                                    {
                                        var timeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotFFDTimelineState);
                                        timeline.slot = slot;
                                        timeline.init(this._armature, this, timelineData);
                                        this._slotTimelines.push(timeline);
                                        ffdFlags.push(timeline.meshOffset);
                                        break;
                                    }
                            }
                        }
                    }
                    if (this.resetToPose) {
                        if (!displayIndexFlag) {
                            var timeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotDislayIndexTimelineState);
                            timeline.slot = slot;
                            timeline.init(this._armature, this, null);
                            this._slotTimelines.push(timeline);
                        }
                        if (!colorFlag) {
                            var timeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotColorTimelineState);
                            timeline.slot = slot;
                            timeline.init(this._armature, this, null);
                            this._slotTimelines.push(timeline);
                        }
                        for (var _m = 0, _o = slot._rawDisplayDatas; _m < _o.length; _m++) {
                            var displayData = _o[_m];
                            if (displayData !== null && displayData.type === 2 /* Mesh */ && ffdFlags.indexOf(displayData.offset) < 0) {
                                var timeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotFFDTimelineState);
                                timeline.slot = slot;
                                timeline.init(this._armature, this, null);
                                this._slotTimelines.push(timeline);
                            }
                        }
                    }
                }
            }
            for (var k in slotTimelines) {
                for (var _p = 0, _q = slotTimelines[k]; _p < _q.length; _p++) {
                    var timeline = _q[_p];
                    this._slotTimelines.splice(this._slotTimelines.indexOf(timeline), 1);
                    timeline.returnToPool();
                }
            }
        };
        /**
         * @private
         * @internal
         */
        AnimationState.prototype.advanceTime = function (passedTime, cacheFrameRate) {
            // Update fade time.
            if (this._fadeState !== 0 || this._subFadeState !== 0) {
                this._advanceFadeTime(passedTime);
            }
            // Update time.
            if (this._playheadState === 3) {
                if (this.timeScale !== 1.0) {
                    passedTime *= this.timeScale;
                }
                this._time += passedTime;
            }
            if (this._timelineDirty) {
                this._timelineDirty = false;
                this.updateTimelines();
            }
            if (this.weight === 0.0) {
                return;
            }
            var isCacheEnabled = this._fadeState === 0 && cacheFrameRate > 0.0;
            var isUpdateTimeline = true;
            var isUpdateBoneTimeline = true;
            var time = this._time;
            this._weightResult = this.weight * this._fadeProgress;
            this._actionTimeline.update(time); // Update main timeline.
            if (isCacheEnabled) {
                var internval = cacheFrameRate * 2.0;
                this._actionTimeline.currentTime = Math.floor(this._actionTimeline.currentTime * internval) / internval;
            }
            if (this._zOrderTimeline !== null) {
                this._zOrderTimeline.update(time);
            }
            if (isCacheEnabled) {
                var cacheFrameIndex = Math.floor(this._actionTimeline.currentTime * cacheFrameRate); // uint
                if (this._armature._cacheFrameIndex === cacheFrameIndex) {
                    isUpdateTimeline = false;
                    isUpdateBoneTimeline = false;
                }
                else {
                    this._armature._cacheFrameIndex = cacheFrameIndex;
                    if (this.animationData.cachedFrames[cacheFrameIndex]) {
                        isUpdateBoneTimeline = false;
                    }
                    else {
                        this.animationData.cachedFrames[cacheFrameIndex] = true;
                    }
                }
            }
            if (isUpdateTimeline) {
                if (isUpdateBoneTimeline) {
                    var bone = null;
                    var prevTimeline = null; //
                    for (var i = 0, l = this._boneTimelines.length; i < l; ++i) {
                        var timeline = this._boneTimelines[i];
                        if (bone !== timeline.bone) {
                            if (bone !== null) {
                                this._blendBoneTimline(prevTimeline);
                                if (bone._blendDirty) {
                                    if (bone._blendLeftWeight > 0.0) {
                                        if (bone._blendLayer !== this.layer) {
                                            if (bone._blendLayerWeight >= bone._blendLeftWeight) {
                                                bone._blendLeftWeight = 0.0;
                                                bone = null;
                                            }
                                            else {
                                                bone._blendLayer = this.layer;
                                                bone._blendLeftWeight -= bone._blendLayerWeight;
                                                bone._blendLayerWeight = 0.0;
                                            }
                                        }
                                    }
                                    else {
                                        bone = null;
                                    }
                                }
                            }
                            bone = timeline.bone;
                        }
                        if (bone !== null) {
                            timeline.update(time);
                            if (i === l - 1) {
                                this._blendBoneTimline(timeline);
                            }
                            else {
                                prevTimeline = timeline;
                            }
                        }
                    }
                }
                for (var i = 0, l = this._slotTimelines.length; i < l; ++i) {
                    var timeline = this._slotTimelines[i];
                    if (this._isDisabled(timeline.slot)) {
                        continue;
                    }
                    timeline.update(time);
                }
            }
            if (this._fadeState === 0) {
                if (this._subFadeState > 0) {
                    this._subFadeState = 0;
                }
                if (this._actionTimeline.playState > 0) {
                    if (this.autoFadeOutTime >= 0.0) {
                        this.fadeOut(this.autoFadeOutTime);
                    }
                }
            }
        };
        /**
         * 继续播放。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        AnimationState.prototype.play = function () {
            this._playheadState = 3; // 11
        };
        /**
         * 暂停播放。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        AnimationState.prototype.stop = function () {
            this._playheadState &= 1; // 0x
        };
        /**
         * 淡出动画。
         * @param fadeOutTime 淡出时间。 (以秒为单位)
         * @param pausePlayhead 淡出时是否暂停动画。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        AnimationState.prototype.fadeOut = function (fadeOutTime, pausePlayhead) {
            if (pausePlayhead === void 0) { pausePlayhead = true; }
            if (fadeOutTime < 0.0) {
                fadeOutTime = 0.0;
            }
            if (pausePlayhead) {
                this._playheadState &= 2; // x0
            }
            if (this._fadeState > 0) {
                if (fadeOutTime > this.fadeTotalTime - this._fadeTime) {
                    return;
                }
            }
            else {
                this._fadeState = 1;
                this._subFadeState = -1;
                if (fadeOutTime <= 0.0 || this._fadeProgress <= 0.0) {
                    this._fadeProgress = 0.000001; // Modify fade progress to different value.
                }
                for (var _i = 0, _a = this._boneTimelines; _i < _a.length; _i++) {
                    var timeline = _a[_i];
                    timeline.fadeOut();
                }
                for (var _b = 0, _c = this._slotTimelines; _b < _c.length; _b++) {
                    var timeline = _c[_b];
                    timeline.fadeOut();
                }
            }
            this.displayControl = false; //
            this.fadeTotalTime = this._fadeProgress > 0.000001 ? fadeOutTime / this._fadeProgress : 0.0;
            this._fadeTime = this.fadeTotalTime * (1.0 - this._fadeProgress);
        };
        /**
         * 是否包含骨骼遮罩。
         * @param name 指定的骨骼名称。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        AnimationState.prototype.containsBoneMask = function (name) {
            return this._boneMask.length === 0 || this._boneMask.indexOf(name) >= 0;
        };
        /**
         * 添加骨骼遮罩。
         * @param name 指定的骨骼名称。
         * @param recursive 是否为该骨骼的子骨骼添加遮罩。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        AnimationState.prototype.addBoneMask = function (name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var currentBone = this._armature.getBone(name);
            if (currentBone === null) {
                return;
            }
            if (this._boneMask.indexOf(name) < 0) {
                this._boneMask.push(name);
            }
            if (recursive) {
                for (var _i = 0, _a = this._armature.getBones(); _i < _a.length; _i++) {
                    var bone = _a[_i];
                    if (this._boneMask.indexOf(bone.name) < 0 && currentBone.contains(bone)) {
                        this._boneMask.push(bone.name);
                    }
                }
            }
            this._timelineDirty = true;
        };
        /**
         * 删除骨骼遮罩。
         * @param name 指定的骨骼名称。
         * @param recursive 是否删除该骨骼的子骨骼遮罩。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        AnimationState.prototype.removeBoneMask = function (name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var index = this._boneMask.indexOf(name);
            if (index >= 0) {
                this._boneMask.splice(index, 1);
            }
            if (recursive) {
                var currentBone = this._armature.getBone(name);
                if (currentBone !== null) {
                    var bones = this._armature.getBones();
                    if (this._boneMask.length > 0) {
                        for (var _i = 0, bones_1 = bones; _i < bones_1.length; _i++) {
                            var bone = bones_1[_i];
                            var index_2 = this._boneMask.indexOf(bone.name);
                            if (index_2 >= 0 && currentBone.contains(bone)) {
                                this._boneMask.splice(index_2, 1);
                            }
                        }
                    }
                    else {
                        for (var _a = 0, bones_2 = bones; _a < bones_2.length; _a++) {
                            var bone = bones_2[_a];
                            if (bone === currentBone) {
                                continue;
                            }
                            if (!currentBone.contains(bone)) {
                                this._boneMask.push(bone.name);
                            }
                        }
                    }
                }
            }
            this._timelineDirty = true;
        };
        /**
         * 删除所有骨骼遮罩。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        AnimationState.prototype.removeAllBoneMask = function () {
            this._boneMask.length = 0;
            this._timelineDirty = true;
        };
        Object.defineProperty(AnimationState.prototype, "isFadeIn", {
            /**
             * 是否正在淡入。
             * @version DragonBones 5.1
             * @language zh_CN
             */
            get: function () {
                return this._fadeState < 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "isFadeOut", {
            /**
             * 是否正在淡出。
             * @version DragonBones 5.1
             * @language zh_CN
             */
            get: function () {
                return this._fadeState > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "isFadeComplete", {
            /**
             * 是否淡入完毕。
             * @version DragonBones 5.1
             * @language zh_CN
             */
            get: function () {
                return this._fadeState === 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "isPlaying", {
            /**
             * 是否正在播放。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return (this._playheadState & 2) !== 0 && this._actionTimeline.playState <= 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "isCompleted", {
            /**
             * 是否播放完毕。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._actionTimeline.playState > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "currentPlayTimes", {
            /**
             * 当前播放次数。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._actionTimeline.currentPlayTimes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "totalTime", {
            /**
             * 总时间。 (以秒为单位)
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "currentTime", {
            /**
             * 当前播放的时间。 (以秒为单位)
             * @version DragonBones 3.0
             * @language zh_CN
             */
            get: function () {
                return this._actionTimeline.currentTime;
            },
            set: function (value) {
                var currentPlayTimes = this._actionTimeline.currentPlayTimes - (this._actionTimeline.playState > 0 ? 1 : 0);
                if (value < 0 || this._duration < value) {
                    value = (value % this._duration) + currentPlayTimes * this._duration;
                    if (value < 0) {
                        value += this._duration;
                    }
                }
                if (this.playTimes > 0 && currentPlayTimes === this.playTimes - 1 && value === this._duration) {
                    value = this._duration - 0.000001;
                }
                if (this._time === value) {
                    return;
                }
                this._time = value;
                this._actionTimeline.setCurrentTime(this._time);
                if (this._zOrderTimeline !== null) {
                    this._zOrderTimeline.playState = -1;
                }
                for (var _i = 0, _a = this._boneTimelines; _i < _a.length; _i++) {
                    var timeline = _a[_i];
                    timeline.playState = -1;
                }
                for (var _b = 0, _c = this._slotTimelines; _b < _c.length; _b++) {
                    var timeline = _c[_b];
                    timeline.playState = -1;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "clip", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #animationData
             */
            get: function () {
                return this.animationData;
            },
            enumerable: true,
            configurable: true
        });
        return AnimationState;
    }(dragonBones.BaseObject));
    dragonBones.AnimationState = AnimationState;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @internal
     * @private
     */
    var TimelineState = (function (_super) {
        __extends(TimelineState, _super);
        function TimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TimelineState.prototype._onClear = function () {
            this.playState = -1;
            this.currentPlayTimes = -1;
            this.currentTime = -1.0;
            this._tweenState = 0 /* None */;
            this._frameRate = 0;
            this._frameValueOffset = 0;
            this._frameCount = 0;
            this._frameOffset = 0;
            this._frameIndex = -1;
            this._frameRateR = 0.0;
            this._position = 0.0;
            this._duration = 0.0;
            this._timeScale = 1.0;
            this._timeOffset = 0.0;
            this._dragonBonesData = null; //
            this._animationData = null; //
            this._timelineData = null; //
            this._armature = null; //
            this._animationState = null; //
            this._actionTimeline = null; //
            this._frameArray = null; //
            this._frameIntArray = null; //
            this._frameFloatArray = null; //
            this._timelineArray = null; //
            this._frameIndices = null; //
        };
        TimelineState.prototype._setCurrentTime = function (passedTime) {
            var prevState = this.playState;
            var prevPlayTimes = this.currentPlayTimes;
            var prevTime = this.currentTime;
            if (this._actionTimeline !== null && this._frameCount <= 1) {
                this.playState = this._actionTimeline.playState >= 0 ? 1 : -1;
                this.currentPlayTimes = 1;
                this.currentTime = this._actionTimeline.currentTime;
            }
            else if (this._actionTimeline === null || this._timeScale !== 1.0 || this._timeOffset !== 0.0) {
                var playTimes = this._animationState.playTimes;
                var totalTime = playTimes * this._duration;
                passedTime *= this._timeScale;
                if (this._timeOffset !== 0.0) {
                    passedTime += this._timeOffset * this._animationData.duration;
                }
                if (playTimes > 0 && (passedTime >= totalTime || passedTime <= -totalTime)) {
                    if (this.playState <= 0 && this._animationState._playheadState === 3) {
                        this.playState = 1;
                    }
                    this.currentPlayTimes = playTimes;
                    if (passedTime < 0.0) {
                        this.currentTime = 0.0;
                    }
                    else {
                        this.currentTime = this._duration;
                    }
                }
                else {
                    if (this.playState !== 0 && this._animationState._playheadState === 3) {
                        this.playState = 0;
                    }
                    if (passedTime < 0.0) {
                        passedTime = -passedTime;
                        this.currentPlayTimes = Math.floor(passedTime / this._duration);
                        this.currentTime = this._duration - (passedTime % this._duration);
                    }
                    else {
                        this.currentPlayTimes = Math.floor(passedTime / this._duration);
                        this.currentTime = passedTime % this._duration;
                    }
                }
                this.currentTime += this._position;
            }
            else {
                this.playState = this._actionTimeline.playState;
                this.currentPlayTimes = this._actionTimeline.currentPlayTimes;
                this.currentTime = this._actionTimeline.currentTime;
            }
            if (this.currentPlayTimes === prevPlayTimes && this.currentTime === prevTime) {
                return false;
            }
            // Clear frame flag when timeline start or loopComplete.
            if ((prevState < 0 && this.playState !== prevState) ||
                (this.playState <= 0 && this.currentPlayTimes !== prevPlayTimes)) {
                this._frameIndex = -1;
            }
            return true;
        };
        TimelineState.prototype.init = function (armature, animationState, timelineData) {
            this._armature = armature;
            this._animationState = animationState;
            this._timelineData = timelineData;
            this._actionTimeline = this._animationState._actionTimeline;
            if (this === this._actionTimeline) {
                this._actionTimeline = null; //
            }
            this._frameRate = this._armature.armatureData.frameRate;
            this._frameRateR = 1.0 / this._frameRate;
            this._position = this._animationState._position;
            this._duration = this._animationState._duration;
            this._dragonBonesData = this._armature.armatureData.parent;
            this._animationData = this._animationState.animationData;
            if (this._timelineData !== null) {
                this._frameIntArray = this._dragonBonesData.frameIntArray;
                this._frameFloatArray = this._dragonBonesData.frameFloatArray;
                this._frameArray = this._dragonBonesData.frameArray;
                this._timelineArray = this._dragonBonesData.timelineArray;
                this._frameIndices = this._dragonBonesData.frameIndices;
                this._frameCount = this._timelineArray[this._timelineData.offset + 2 /* TimelineKeyFrameCount */];
                this._frameValueOffset = this._timelineArray[this._timelineData.offset + 4 /* TimelineFrameValueOffset */];
                this._timeScale = 100.0 / this._timelineArray[this._timelineData.offset + 0 /* TimelineScale */];
                this._timeOffset = this._timelineArray[this._timelineData.offset + 1 /* TimelineOffset */] * 0.01;
            }
        };
        TimelineState.prototype.fadeOut = function () { };
        TimelineState.prototype.update = function (passedTime) {
            if (this.playState <= 0 && this._setCurrentTime(passedTime)) {
                if (this._frameCount > 1) {
                    var timelineFrameIndex = Math.floor(this.currentTime * this._frameRate); // uint
                    var frameIndex = this._frameIndices[this._timelineData.frameIndicesOffset + timelineFrameIndex];
                    if (this._frameIndex !== frameIndex) {
                        this._frameIndex = frameIndex;
                        this._frameOffset = this._animationData.frameOffset + this._timelineArray[this._timelineData.offset + 5 /* TimelineFrameOffset */ + this._frameIndex];
                        this._onArriveAtFrame();
                    }
                }
                else if (this._frameIndex < 0) {
                    this._frameIndex = 0;
                    if (this._timelineData !== null) {
                        this._frameOffset = this._animationData.frameOffset + this._timelineArray[this._timelineData.offset + 5 /* TimelineFrameOffset */];
                    }
                    this._onArriveAtFrame();
                }
                if (this._tweenState !== 0 /* None */) {
                    this._onUpdateFrame();
                }
            }
        };
        return TimelineState;
    }(dragonBones.BaseObject));
    dragonBones.TimelineState = TimelineState;
    /**
     * @internal
     * @private
     */
    var TweenTimelineState = (function (_super) {
        __extends(TweenTimelineState, _super);
        function TweenTimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TweenTimelineState._getEasingValue = function (tweenType, progress, easing) {
            var value = progress;
            switch (tweenType) {
                case 3 /* QuadIn */:
                    value = Math.pow(progress, 2.0);
                    break;
                case 4 /* QuadOut */:
                    value = 1.0 - Math.pow(1.0 - progress, 2.0);
                    break;
                case 5 /* QuadInOut */:
                    value = 0.5 * (1.0 - Math.cos(progress * Math.PI));
                    break;
            }
            return (value - progress) * easing + progress;
        };
        TweenTimelineState._getEasingCurveValue = function (progress, samples, count, offset) {
            if (progress <= 0.0) {
                return 0.0;
            }
            else if (progress >= 1.0) {
                return 1.0;
            }
            var segmentCount = count + 1; // + 2 - 1
            var valueIndex = Math.floor(progress * segmentCount);
            var fromValue = valueIndex === 0 ? 0.0 : samples[offset + valueIndex - 1];
            var toValue = (valueIndex === segmentCount - 1) ? 10000.0 : samples[offset + valueIndex];
            return (fromValue + (toValue - fromValue) * (progress * segmentCount - valueIndex)) * 0.0001;
        };
        TweenTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this._tweenType = 0 /* None */;
            this._curveCount = 0;
            this._framePosition = 0.0;
            this._frameDurationR = 0.0;
            this._tweenProgress = 0.0;
            this._tweenEasing = 0.0;
        };
        TweenTimelineState.prototype._onArriveAtFrame = function () {
            if (this._frameCount > 1 &&
                (this._frameIndex !== this._frameCount - 1 ||
                    this._animationState.playTimes === 0 ||
                    this._animationState.currentPlayTimes < this._animationState.playTimes - 1)) {
                this._tweenType = this._frameArray[this._frameOffset + 1 /* FrameTweenType */]; // TODO recode ture tween type.
                this._tweenState = this._tweenType === 0 /* None */ ? 1 /* Once */ : 2 /* Always */;
                if (this._tweenType === 2 /* Curve */) {
                    this._curveCount = this._frameArray[this._frameOffset + 2 /* FrameTweenEasingOrCurveSampleCount */];
                }
                else if (this._tweenType !== 0 /* None */ && this._tweenType !== 1 /* Line */) {
                    this._tweenEasing = this._frameArray[this._frameOffset + 2 /* FrameTweenEasingOrCurveSampleCount */] * 0.01;
                }
                this._framePosition = this._frameArray[this._frameOffset] * this._frameRateR;
                if (this._frameIndex === this._frameCount - 1) {
                    this._frameDurationR = 1.0 / (this._animationData.duration - this._framePosition);
                }
                else {
                    var nextFrameOffset = this._animationData.frameOffset + this._timelineArray[this._timelineData.offset + 5 /* TimelineFrameOffset */ + this._frameIndex + 1];
                    this._frameDurationR = 1.0 / (this._frameArray[nextFrameOffset] * this._frameRateR - this._framePosition);
                }
            }
            else {
                this._tweenState = 1 /* Once */;
            }
        };
        TweenTimelineState.prototype._onUpdateFrame = function () {
            if (this._tweenState === 2 /* Always */) {
                this._tweenProgress = (this.currentTime - this._framePosition) * this._frameDurationR;
                if (this._tweenType === 2 /* Curve */) {
                    this._tweenProgress = TweenTimelineState._getEasingCurveValue(this._tweenProgress, this._frameArray, this._curveCount, this._frameOffset + 3 /* FrameCurveSamples */);
                }
                else if (this._tweenType !== 1 /* Line */) {
                    this._tweenProgress = TweenTimelineState._getEasingValue(this._tweenType, this._tweenProgress, this._tweenEasing);
                }
            }
            else {
                this._tweenProgress = 0.0;
            }
        };
        return TweenTimelineState;
    }(TimelineState));
    dragonBones.TweenTimelineState = TweenTimelineState;
    /**
     * @internal
     * @private
     */
    var BoneTimelineState = (function (_super) {
        __extends(BoneTimelineState, _super);
        function BoneTimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BoneTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.bone = null; //
            this.bonePose = null; //
        };
        return BoneTimelineState;
    }(TweenTimelineState));
    dragonBones.BoneTimelineState = BoneTimelineState;
    /**
     * @internal
     * @private
     */
    var SlotTimelineState = (function (_super) {
        __extends(SlotTimelineState, _super);
        function SlotTimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SlotTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.slot = null; //
        };
        return SlotTimelineState;
    }(TweenTimelineState));
    dragonBones.SlotTimelineState = SlotTimelineState;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @internal
     * @private
     */
    var ActionTimelineState = (function (_super) {
        __extends(ActionTimelineState, _super);
        function ActionTimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ActionTimelineState.toString = function () {
            return "[class dragonBones.ActionTimelineState]";
        };
        ActionTimelineState.prototype._onCrossFrame = function (frameIndex) {
            var eventDispatcher = this._armature.eventDispatcher;
            if (this._animationState.actionEnabled) {
                var frameOffset = this._animationData.frameOffset + this._timelineArray[this._timelineData.offset + 5 /* TimelineFrameOffset */ + frameIndex];
                var actionCount = this._frameArray[frameOffset + 1];
                var actions = this._armature.armatureData.actions;
                for (var i = 0; i < actionCount; ++i) {
                    var actionIndex = this._frameArray[frameOffset + 2 + i];
                    var action = actions[actionIndex];
                    if (action.type === 0 /* Play */) {
                        if (action.slot !== null) {
                            var slot = this._armature.getSlot(action.slot.name);
                            if (slot !== null) {
                                var childArmature = slot.childArmature;
                                if (childArmature !== null) {
                                    childArmature._bufferAction(action, true);
                                }
                            }
                        }
                        else if (action.bone !== null) {
                            for (var _i = 0, _a = this._armature.getSlots(); _i < _a.length; _i++) {
                                var slot = _a[_i];
                                var childArmature = slot.childArmature;
                                if (childArmature !== null && slot.parent.boneData === action.bone) {
                                    childArmature._bufferAction(action, true);
                                }
                            }
                        }
                        else {
                            this._armature._bufferAction(action, true);
                        }
                    }
                    else {
                        var eventType = action.type === 10 /* Frame */ ? dragonBones.EventObject.FRAME_EVENT : dragonBones.EventObject.SOUND_EVENT;
                        if (action.type === 11 /* Sound */ || eventDispatcher.hasEvent(eventType)) {
                            var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            // eventObject.time = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                            eventObject.time = this._frameArray[frameOffset] / this._frameRate;
                            eventObject.type = eventType;
                            eventObject.name = action.name;
                            eventObject.data = action.data;
                            eventObject.armature = this._armature;
                            eventObject.animationState = this._animationState;
                            if (action.bone !== null) {
                                eventObject.bone = this._armature.getBone(action.bone.name);
                            }
                            if (action.slot !== null) {
                                eventObject.slot = this._armature.getSlot(action.slot.name);
                            }
                            this._armature._dragonBones.bufferEvent(eventObject);
                        }
                    }
                }
            }
        };
        ActionTimelineState.prototype._onArriveAtFrame = function () { };
        ActionTimelineState.prototype._onUpdateFrame = function () { };
        ActionTimelineState.prototype.update = function (passedTime) {
            var prevState = this.playState;
            var prevPlayTimes = this.currentPlayTimes;
            var prevTime = this.currentTime;
            if (this.playState <= 0 && this._setCurrentTime(passedTime)) {
                var eventDispatcher = this._armature.eventDispatcher;
                if (prevState < 0) {
                    if (this.playState !== prevState) {
                        if (this._animationState.displayControl && this._animationState.resetToPose) {
                            this._armature._sortZOrder(null, 0);
                        }
                        prevPlayTimes = this.currentPlayTimes;
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.START)) {
                            var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            eventObject.type = dragonBones.EventObject.START;
                            eventObject.armature = this._armature;
                            eventObject.animationState = this._animationState;
                            this._armature._dragonBones.bufferEvent(eventObject);
                        }
                    }
                    else {
                        return;
                    }
                }
                var isReverse = this._animationState.timeScale < 0.0;
                var loopCompleteEvent = null;
                var completeEvent = null;
                if (this.currentPlayTimes !== prevPlayTimes) {
                    if (eventDispatcher.hasEvent(dragonBones.EventObject.LOOP_COMPLETE)) {
                        loopCompleteEvent = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                        loopCompleteEvent.type = dragonBones.EventObject.LOOP_COMPLETE;
                        loopCompleteEvent.armature = this._armature;
                        loopCompleteEvent.animationState = this._animationState;
                    }
                    if (this.playState > 0) {
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.COMPLETE)) {
                            completeEvent = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            completeEvent.type = dragonBones.EventObject.COMPLETE;
                            completeEvent.armature = this._armature;
                            completeEvent.animationState = this._animationState;
                        }
                    }
                }
                if (this._frameCount > 1) {
                    var timelineData = this._timelineData;
                    var timelineFrameIndex = Math.floor(this.currentTime * this._frameRate); // uint
                    var frameIndex = this._frameIndices[timelineData.frameIndicesOffset + timelineFrameIndex];
                    if (this._frameIndex !== frameIndex) {
                        var crossedFrameIndex = this._frameIndex;
                        this._frameIndex = frameIndex;
                        if (this._timelineArray !== null) {
                            this._frameOffset = this._animationData.frameOffset + this._timelineArray[timelineData.offset + 5 /* TimelineFrameOffset */ + this._frameIndex];
                            if (isReverse) {
                                if (crossedFrameIndex < 0) {
                                    var prevFrameIndex = Math.floor(prevTime * this._frameRate);
                                    crossedFrameIndex = this._frameIndices[timelineData.frameIndicesOffset + prevFrameIndex];
                                    if (this.currentPlayTimes === prevPlayTimes) {
                                        if (crossedFrameIndex === frameIndex) {
                                            crossedFrameIndex = -1;
                                        }
                                    }
                                }
                                while (crossedFrameIndex >= 0) {
                                    var frameOffset = this._animationData.frameOffset + this._timelineArray[timelineData.offset + 5 /* TimelineFrameOffset */ + crossedFrameIndex];
                                    // const framePosition = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                                    var framePosition = this._frameArray[frameOffset] / this._frameRate;
                                    if (this._position <= framePosition &&
                                        framePosition <= this._position + this._duration) {
                                        this._onCrossFrame(crossedFrameIndex);
                                    }
                                    if (loopCompleteEvent !== null && crossedFrameIndex === 0) {
                                        this._armature._dragonBones.bufferEvent(loopCompleteEvent);
                                        loopCompleteEvent = null;
                                    }
                                    if (crossedFrameIndex > 0) {
                                        crossedFrameIndex--;
                                    }
                                    else {
                                        crossedFrameIndex = this._frameCount - 1;
                                    }
                                    if (crossedFrameIndex === frameIndex) {
                                        break;
                                    }
                                }
                            }
                            else {
                                if (crossedFrameIndex < 0) {
                                    var prevFrameIndex = Math.floor(prevTime * this._frameRate);
                                    crossedFrameIndex = this._frameIndices[timelineData.frameIndicesOffset + prevFrameIndex];
                                    var frameOffset = this._animationData.frameOffset + this._timelineArray[timelineData.offset + 5 /* TimelineFrameOffset */ + crossedFrameIndex];
                                    // const framePosition = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                                    var framePosition = this._frameArray[frameOffset] / this._frameRate;
                                    if (this.currentPlayTimes === prevPlayTimes) {
                                        if (prevTime <= framePosition) {
                                            if (crossedFrameIndex > 0) {
                                                crossedFrameIndex--;
                                            }
                                            else {
                                                crossedFrameIndex = this._frameCount - 1;
                                            }
                                        }
                                        else if (crossedFrameIndex === frameIndex) {
                                            crossedFrameIndex = -1;
                                        }
                                    }
                                }
                                while (crossedFrameIndex >= 0) {
                                    if (crossedFrameIndex < this._frameCount - 1) {
                                        crossedFrameIndex++;
                                    }
                                    else {
                                        crossedFrameIndex = 0;
                                    }
                                    var frameOffset = this._animationData.frameOffset + this._timelineArray[timelineData.offset + 5 /* TimelineFrameOffset */ + crossedFrameIndex];
                                    // const framePosition = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                                    var framePosition = this._frameArray[frameOffset] / this._frameRate;
                                    if (this._position <= framePosition &&
                                        framePosition <= this._position + this._duration) {
                                        this._onCrossFrame(crossedFrameIndex);
                                    }
                                    if (loopCompleteEvent !== null && crossedFrameIndex === 0) {
                                        this._armature._dragonBones.bufferEvent(loopCompleteEvent);
                                        loopCompleteEvent = null;
                                    }
                                    if (crossedFrameIndex === frameIndex) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                else if (this._frameIndex < 0) {
                    this._frameIndex = 0;
                    if (this._timelineData !== null) {
                        this._frameOffset = this._animationData.frameOffset + this._timelineArray[this._timelineData.offset + 5 /* TimelineFrameOffset */];
                        // Arrive at frame.
                        var framePosition = this._frameArray[this._frameOffset] / this._frameRate;
                        if (this.currentPlayTimes === prevPlayTimes) {
                            if (prevTime <= framePosition) {
                                this._onCrossFrame(this._frameIndex);
                            }
                        }
                        else if (this._position <= framePosition) {
                            if (!isReverse && loopCompleteEvent !== null) {
                                this._armature._dragonBones.bufferEvent(loopCompleteEvent);
                                loopCompleteEvent = null;
                            }
                            this._onCrossFrame(this._frameIndex);
                        }
                    }
                }
                if (loopCompleteEvent !== null) {
                    this._armature._dragonBones.bufferEvent(loopCompleteEvent);
                }
                if (completeEvent !== null) {
                    this._armature._dragonBones.bufferEvent(completeEvent);
                }
            }
        };
        ActionTimelineState.prototype.setCurrentTime = function (value) {
            this._setCurrentTime(value);
            this._frameIndex = -1;
        };
        return ActionTimelineState;
    }(dragonBones.TimelineState));
    dragonBones.ActionTimelineState = ActionTimelineState;
    /**
     * @internal
     * @private
     */
    var ZOrderTimelineState = (function (_super) {
        __extends(ZOrderTimelineState, _super);
        function ZOrderTimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ZOrderTimelineState.toString = function () {
            return "[class dragonBones.ZOrderTimelineState]";
        };
        ZOrderTimelineState.prototype._onArriveAtFrame = function () {
            if (this.playState >= 0) {
                var count = this._frameArray[this._frameOffset + 1];
                if (count > 0) {
                    this._armature._sortZOrder(this._frameArray, this._frameOffset + 2);
                }
                else {
                    this._armature._sortZOrder(null, 0);
                }
            }
        };
        ZOrderTimelineState.prototype._onUpdateFrame = function () { };
        return ZOrderTimelineState;
    }(dragonBones.TimelineState));
    dragonBones.ZOrderTimelineState = ZOrderTimelineState;
    /**
     * @internal
     * @private
     */
    var BoneAllTimelineState = (function (_super) {
        __extends(BoneAllTimelineState, _super);
        function BoneAllTimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BoneAllTimelineState.toString = function () {
            return "[class dragonBones.BoneAllTimelineState]";
        };
        BoneAllTimelineState.prototype._onArriveAtFrame = function () {
            _super.prototype._onArriveAtFrame.call(this);
            if (this._timelineData !== null) {
                var frameFloatArray = this._dragonBonesData.frameFloatArray;
                var current = this.bonePose.current;
                var delta = this.bonePose.delta;
                var valueOffset = this._animationData.frameFloatOffset + this._frameValueOffset + this._frameIndex * 6; // ...(timeline value offset)|xxxxxx|xxxxxx|(Value offset)xxxxx|(Next offset)xxxxx|xxxxxx|xxxxxx|...
                current.x = frameFloatArray[valueOffset++];
                current.y = frameFloatArray[valueOffset++];
                current.rotation = frameFloatArray[valueOffset++];
                current.skew = frameFloatArray[valueOffset++];
                current.scaleX = frameFloatArray[valueOffset++];
                current.scaleY = frameFloatArray[valueOffset++];
                if (this._tweenState === 2 /* Always */) {
                    if (this._frameIndex === this._frameCount - 1) {
                        valueOffset = this._animationData.frameFloatOffset + this._frameValueOffset;
                    }
                    delta.x = frameFloatArray[valueOffset++] - current.x;
                    delta.y = frameFloatArray[valueOffset++] - current.y;
                    delta.rotation = frameFloatArray[valueOffset++] - current.rotation;
                    delta.skew = frameFloatArray[valueOffset++] - current.skew;
                    delta.scaleX = frameFloatArray[valueOffset++] - current.scaleX;
                    delta.scaleY = frameFloatArray[valueOffset++] - current.scaleY;
                }
                // else {
                //     delta.x = 0.0;
                //     delta.y = 0.0;
                //     delta.rotation = 0.0;
                //     delta.skew = 0.0;
                //     delta.scaleX = 0.0;
                //     delta.scaleY = 0.0;
                // }
            }
            else {
                var current = this.bonePose.current;
                current.x = 0.0;
                current.y = 0.0;
                current.rotation = 0.0;
                current.skew = 0.0;
                current.scaleX = 1.0;
                current.scaleY = 1.0;
            }
        };
        BoneAllTimelineState.prototype._onUpdateFrame = function () {
            _super.prototype._onUpdateFrame.call(this);
            var current = this.bonePose.current;
            var delta = this.bonePose.delta;
            var result = this.bonePose.result;
            this.bone._transformDirty = true;
            if (this._tweenState !== 2 /* Always */) {
                this._tweenState = 0 /* None */;
            }
            var scale = this._armature.armatureData.scale;
            result.x = (current.x + delta.x * this._tweenProgress) * scale;
            result.y = (current.y + delta.y * this._tweenProgress) * scale;
            result.rotation = current.rotation + delta.rotation * this._tweenProgress;
            result.skew = current.skew + delta.skew * this._tweenProgress;
            result.scaleX = current.scaleX + delta.scaleX * this._tweenProgress;
            result.scaleY = current.scaleY + delta.scaleY * this._tweenProgress;
        };
        BoneAllTimelineState.prototype.fadeOut = function () {
            var result = this.bonePose.result;
            result.rotation = dragonBones.Transform.normalizeRadian(result.rotation);
            result.skew = dragonBones.Transform.normalizeRadian(result.skew);
        };
        return BoneAllTimelineState;
    }(dragonBones.BoneTimelineState));
    dragonBones.BoneAllTimelineState = BoneAllTimelineState;
    /**
     * @internal
     * @private
     */
    var SlotDislayIndexTimelineState = (function (_super) {
        __extends(SlotDislayIndexTimelineState, _super);
        function SlotDislayIndexTimelineState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SlotDislayIndexTimelineState.toString = function () {
            return "[class dragonBones.SlotDislayIndexTimelineState]";
        };
        SlotDislayIndexTimelineState.prototype._onArriveAtFrame = function () {
            if (this.playState >= 0) {
                var displayIndex = this._timelineData !== null ? this._frameArray[this._frameOffset + 1] : this.slot.slotData.displayIndex;
                if (this.slot.displayIndex !== displayIndex) {
                    this.slot._setDisplayIndex(displayIndex, true);
                }
            }
        };
        return SlotDislayIndexTimelineState;
    }(dragonBones.SlotTimelineState));
    dragonBones.SlotDislayIndexTimelineState = SlotDislayIndexTimelineState;
    /**
     * @internal
     * @private
     */
    var SlotColorTimelineState = (function (_super) {
        __extends(SlotColorTimelineState, _super);
        function SlotColorTimelineState() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._current = [0, 0, 0, 0, 0, 0, 0, 0];
            _this._delta = [0, 0, 0, 0, 0, 0, 0, 0];
            _this._result = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            return _this;
        }
        SlotColorTimelineState.toString = function () {
            return "[class dragonBones.SlotColorTimelineState]";
        };
        SlotColorTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this._dirty = false;
        };
        SlotColorTimelineState.prototype._onArriveAtFrame = function () {
            _super.prototype._onArriveAtFrame.call(this);
            if (this._timelineData !== null) {
                var intArray = this._dragonBonesData.intArray;
                var frameIntArray = this._dragonBonesData.frameIntArray;
                var valueOffset = this._animationData.frameIntOffset + this._frameValueOffset + this._frameIndex * 1; // ...(timeline value offset)|x|x|(Value offset)|(Next offset)|x|x|...
                var colorOffset = frameIntArray[valueOffset];
                this._current[0] = intArray[colorOffset++];
                this._current[1] = intArray[colorOffset++];
                this._current[2] = intArray[colorOffset++];
                this._current[3] = intArray[colorOffset++];
                this._current[4] = intArray[colorOffset++];
                this._current[5] = intArray[colorOffset++];
                this._current[6] = intArray[colorOffset++];
                this._current[7] = intArray[colorOffset++];
                if (this._tweenState === 2 /* Always */) {
                    if (this._frameIndex === this._frameCount - 1) {
                        colorOffset = frameIntArray[this._animationData.frameIntOffset + this._frameValueOffset];
                    }
                    else {
                        colorOffset = frameIntArray[valueOffset + 1 * 1];
                    }
                    this._delta[0] = intArray[colorOffset++] - this._current[0];
                    this._delta[1] = intArray[colorOffset++] - this._current[1];
                    this._delta[2] = intArray[colorOffset++] - this._current[2];
                    this._delta[3] = intArray[colorOffset++] - this._current[3];
                    this._delta[4] = intArray[colorOffset++] - this._current[4];
                    this._delta[5] = intArray[colorOffset++] - this._current[5];
                    this._delta[6] = intArray[colorOffset++] - this._current[6];
                    this._delta[7] = intArray[colorOffset++] - this._current[7];
                }
            }
            else {
                var color = this.slot.slotData.color;
                this._current[0] = color.alphaMultiplier * 100.0;
                this._current[1] = color.redMultiplier * 100.0;
                this._current[2] = color.greenMultiplier * 100.0;
                this._current[3] = color.blueMultiplier * 100.0;
                this._current[4] = color.alphaOffset;
                this._current[5] = color.redOffset;
                this._current[6] = color.greenOffset;
                this._current[7] = color.blueOffset;
            }
        };
        SlotColorTimelineState.prototype._onUpdateFrame = function () {
            _super.prototype._onUpdateFrame.call(this);
            this._dirty = true;
            if (this._tweenState !== 2 /* Always */) {
                this._tweenState = 0 /* None */;
            }
            this._result[0] = (this._current[0] + this._delta[0] * this._tweenProgress) * 0.01;
            this._result[1] = (this._current[1] + this._delta[1] * this._tweenProgress) * 0.01;
            this._result[2] = (this._current[2] + this._delta[2] * this._tweenProgress) * 0.01;
            this._result[3] = (this._current[3] + this._delta[3] * this._tweenProgress) * 0.01;
            this._result[4] = this._current[4] + this._delta[4] * this._tweenProgress;
            this._result[5] = this._current[5] + this._delta[5] * this._tweenProgress;
            this._result[6] = this._current[6] + this._delta[6] * this._tweenProgress;
            this._result[7] = this._current[7] + this._delta[7] * this._tweenProgress;
        };
        SlotColorTimelineState.prototype.fadeOut = function () {
            this._tweenState = 0 /* None */;
            this._dirty = false;
        };
        SlotColorTimelineState.prototype.update = function (passedTime) {
            _super.prototype.update.call(this, passedTime);
            // Fade animation.
            if (this._tweenState !== 0 /* None */ || this._dirty) {
                var result = this.slot._colorTransform;
                if (this._animationState._fadeState !== 0 || this._animationState._subFadeState !== 0) {
                    if (result.alphaMultiplier !== this._result[0] ||
                        result.redMultiplier !== this._result[1] ||
                        result.greenMultiplier !== this._result[2] ||
                        result.blueMultiplier !== this._result[3] ||
                        result.alphaOffset !== this._result[4] ||
                        result.redOffset !== this._result[5] ||
                        result.greenOffset !== this._result[6] ||
                        result.blueOffset !== this._result[7]) {
                        var fadeProgress = Math.pow(this._animationState._fadeProgress, 4);
                        result.alphaMultiplier += (this._result[0] - result.alphaMultiplier) * fadeProgress;
                        result.redMultiplier += (this._result[1] - result.redMultiplier) * fadeProgress;
                        result.greenMultiplier += (this._result[2] - result.greenMultiplier) * fadeProgress;
                        result.blueMultiplier += (this._result[3] - result.blueMultiplier) * fadeProgress;
                        result.alphaOffset += (this._result[4] - result.alphaOffset) * fadeProgress;
                        result.redOffset += (this._result[5] - result.redOffset) * fadeProgress;
                        result.greenOffset += (this._result[6] - result.greenOffset) * fadeProgress;
                        result.blueOffset += (this._result[7] - result.blueOffset) * fadeProgress;
                        this.slot._colorDirty = true;
                    }
                }
                else if (this._dirty) {
                    this._dirty = false;
                    if (result.alphaMultiplier !== this._result[0] ||
                        result.redMultiplier !== this._result[1] ||
                        result.greenMultiplier !== this._result[2] ||
                        result.blueMultiplier !== this._result[3] ||
                        result.alphaOffset !== this._result[4] ||
                        result.redOffset !== this._result[5] ||
                        result.greenOffset !== this._result[6] ||
                        result.blueOffset !== this._result[7]) {
                        result.alphaMultiplier = this._result[0];
                        result.redMultiplier = this._result[1];
                        result.greenMultiplier = this._result[2];
                        result.blueMultiplier = this._result[3];
                        result.alphaOffset = this._result[4];
                        result.redOffset = this._result[5];
                        result.greenOffset = this._result[6];
                        result.blueOffset = this._result[7];
                        this.slot._colorDirty = true;
                    }
                }
            }
        };
        return SlotColorTimelineState;
    }(dragonBones.SlotTimelineState));
    dragonBones.SlotColorTimelineState = SlotColorTimelineState;
    /**
     * @internal
     * @private
     */
    var SlotFFDTimelineState = (function (_super) {
        __extends(SlotFFDTimelineState, _super);
        function SlotFFDTimelineState() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._current = [];
            _this._delta = [];
            _this._result = [];
            return _this;
        }
        SlotFFDTimelineState.toString = function () {
            return "[class dragonBones.SlotFFDTimelineState]";
        };
        SlotFFDTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.meshOffset = 0;
            this._dirty = false;
            this._frameFloatOffset = 0;
            this._valueCount = 0;
            this._ffdCount = 0;
            this._valueOffset = 0;
            this._current.length = 0;
            this._delta.length = 0;
            this._result.length = 0;
        };
        SlotFFDTimelineState.prototype._onArriveAtFrame = function () {
            _super.prototype._onArriveAtFrame.call(this);
            if (this._timelineData !== null) {
                var isTween = this._tweenState === 2 /* Always */;
                var frameFloatArray = this._dragonBonesData.frameFloatArray;
                var valueOffset = this._animationData.frameFloatOffset + this._frameValueOffset + this._frameIndex * this._valueCount;
                if (isTween) {
                    var nextValueOffset = valueOffset + this._valueCount;
                    if (this._frameIndex === this._frameCount - 1) {
                        nextValueOffset = this._animationData.frameFloatOffset + this._frameValueOffset;
                    }
                    for (var i = 0; i < this._valueCount; ++i) {
                        this._delta[i] = frameFloatArray[nextValueOffset + i] - (this._current[i] = frameFloatArray[valueOffset + i]);
                    }
                }
                else {
                    for (var i = 0; i < this._valueCount; ++i) {
                        this._current[i] = frameFloatArray[valueOffset + i];
                    }
                }
            }
            else {
                for (var i = 0; i < this._valueCount; ++i) {
                    this._current[i] = 0.0;
                }
            }
        };
        SlotFFDTimelineState.prototype._onUpdateFrame = function () {
            _super.prototype._onUpdateFrame.call(this);
            this._dirty = true;
            if (this._tweenState !== 2 /* Always */) {
                this._tweenState = 0 /* None */;
            }
            for (var i = 0; i < this._valueCount; ++i) {
                this._result[i] = this._current[i] + this._delta[i] * this._tweenProgress;
            }
        };
        SlotFFDTimelineState.prototype.init = function (armature, animationState, timelineData) {
            _super.prototype.init.call(this, armature, animationState, timelineData);
            if (this._timelineData !== null) {
                var frameIntArray = this._dragonBonesData.frameIntArray;
                var frameIntOffset = this._animationData.frameIntOffset + this._timelineArray[this._timelineData.offset + 3 /* TimelineFrameValueCount */];
                this.meshOffset = frameIntArray[frameIntOffset + 0 /* FFDTimelineMeshOffset */];
                this._ffdCount = frameIntArray[frameIntOffset + 1 /* FFDTimelineFFDCount */];
                this._valueCount = frameIntArray[frameIntOffset + 2 /* FFDTimelineValueCount */];
                this._valueOffset = frameIntArray[frameIntOffset + 3 /* FFDTimelineValueOffset */];
                this._frameFloatOffset = frameIntArray[frameIntOffset + 4 /* FFDTimelineFloatOffset */] + this._animationData.frameFloatOffset;
            }
            else {
                this._valueCount = 0;
            }
            this._current.length = this._valueCount;
            this._delta.length = this._valueCount;
            this._result.length = this._valueCount;
            for (var i = 0; i < this._valueCount; ++i) {
                this._delta[i] = 0.0;
            }
        };
        SlotFFDTimelineState.prototype.fadeOut = function () {
            this._tweenState = 0 /* None */;
            this._dirty = false;
        };
        SlotFFDTimelineState.prototype.update = function (passedTime) {
            if (this.slot._meshData === null || (this._timelineData !== null && this.slot._meshData.offset !== this.meshOffset)) {
                return;
            }
            _super.prototype.update.call(this, passedTime);
            // Fade animation.
            if (this._tweenState !== 0 /* None */ || this._dirty) {
                var result = this.slot._ffdVertices;
                if (this._timelineData !== null) {
                    var frameFloatArray = this._dragonBonesData.frameFloatArray;
                    if (this._animationState._fadeState !== 0 || this._animationState._subFadeState !== 0) {
                        var fadeProgress = Math.pow(this._animationState._fadeProgress, 2);
                        for (var i = 0; i < this._ffdCount; ++i) {
                            if (i < this._valueOffset) {
                                result[i] += (frameFloatArray[this._frameFloatOffset + i] - result[i]) * fadeProgress;
                            }
                            else if (i < this._valueOffset + this._valueCount) {
                                result[i] += (this._result[i - this._valueOffset] - result[i]) * fadeProgress;
                            }
                            else {
                                result[i] += (frameFloatArray[this._frameFloatOffset + i - this._valueCount] - result[i]) * fadeProgress;
                            }
                        }
                        this.slot._meshDirty = true;
                    }
                    else if (this._dirty) {
                        this._dirty = false;
                        for (var i = 0; i < this._ffdCount; ++i) {
                            if (i < this._valueOffset) {
                                result[i] = frameFloatArray[this._frameFloatOffset + i];
                            }
                            else if (i < this._valueOffset + this._valueCount) {
                                result[i] = this._result[i - this._valueOffset];
                            }
                            else {
                                result[i] = frameFloatArray[this._frameFloatOffset + i - this._valueCount];
                            }
                        }
                        this.slot._meshDirty = true;
                    }
                }
                else {
                    this._ffdCount = result.length; //
                    if (this._animationState._fadeState !== 0 || this._animationState._subFadeState !== 0) {
                        var fadeProgress = Math.pow(this._animationState._fadeProgress, 2);
                        for (var i = 0; i < this._ffdCount; ++i) {
                            result[i] += (0.0 - result[i]) * fadeProgress;
                        }
                        this.slot._meshDirty = true;
                    }
                    else if (this._dirty) {
                        this._dirty = false;
                        for (var i = 0; i < this._ffdCount; ++i) {
                            result[i] = 0.0;
                        }
                        this.slot._meshDirty = true;
                    }
                }
            }
        };
        return SlotFFDTimelineState;
    }(dragonBones.SlotTimelineState));
    dragonBones.SlotFFDTimelineState = SlotFFDTimelineState;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * 事件数据。
     * @version DragonBones 4.5
     * @language zh_CN
     */
    var EventObject = (function (_super) {
        __extends(EventObject, _super);
        function EventObject() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * @private
         */
        EventObject.toString = function () {
            return "[class dragonBones.EventObject]";
        };
        /**
         * @private
         */
        EventObject.prototype._onClear = function () {
            this.time = 0.0;
            this.type = "";
            this.name = "";
            this.armature = null;
            this.bone = null;
            this.slot = null;
            this.animationState = null;
            this.data = null;
        };
        /**
         * 动画开始。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.START = "start";
        /**
         * 动画循环播放一次完成。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.LOOP_COMPLETE = "loopComplete";
        /**
         * 动画播放完成。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.COMPLETE = "complete";
        /**
         * 动画淡入开始。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.FADE_IN = "fadeIn";
        /**
         * 动画淡入完成。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.FADE_IN_COMPLETE = "fadeInComplete";
        /**
         * 动画淡出开始。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.FADE_OUT = "fadeOut";
        /**
         * 动画淡出完成。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.FADE_OUT_COMPLETE = "fadeOutComplete";
        /**
         * 动画帧事件。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.FRAME_EVENT = "frameEvent";
        /**
         * 动画声音事件。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EventObject.SOUND_EVENT = "soundEvent";
        return EventObject;
    }(dragonBones.BaseObject));
    dragonBones.EventObject = EventObject;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var DataParser = (function () {
        function DataParser() {
        }
        DataParser._getArmatureType = function (value) {
            switch (value.toLowerCase()) {
                case "stage":
                    return 2 /* Stage */;
                case "armature":
                    return 0 /* Armature */;
                case "movieclip":
                    return 1 /* MovieClip */;
                default:
                    return 0 /* Armature */;
            }
        };
        DataParser._getDisplayType = function (value) {
            switch (value.toLowerCase()) {
                case "image":
                    return 0 /* Image */;
                case "mesh":
                    return 2 /* Mesh */;
                case "armature":
                    return 1 /* Armature */;
                case "boundingbox":
                    return 3 /* BoundingBox */;
                default:
                    return 0 /* Image */;
            }
        };
        DataParser._getBoundingBoxType = function (value) {
            switch (value.toLowerCase()) {
                case "rectangle":
                    return 0 /* Rectangle */;
                case "ellipse":
                    return 1 /* Ellipse */;
                case "polygon":
                    return 2 /* Polygon */;
                default:
                    return 0 /* Rectangle */;
            }
        };
        DataParser._getActionType = function (value) {
            switch (value.toLowerCase()) {
                case "play":
                    return 0 /* Play */;
                case "frame":
                    return 10 /* Frame */;
                case "sound":
                    return 11 /* Sound */;
                default:
                    return 0 /* Play */;
            }
        };
        DataParser._getBlendMode = function (value) {
            switch (value.toLowerCase()) {
                case "normal":
                    return 0 /* Normal */;
                case "add":
                    return 1 /* Add */;
                case "alpha":
                    return 2 /* Alpha */;
                case "darken":
                    return 3 /* Darken */;
                case "difference":
                    return 4 /* Difference */;
                case "erase":
                    return 5 /* Erase */;
                case "hardlight":
                    return 6 /* HardLight */;
                case "invert":
                    return 7 /* Invert */;
                case "layer":
                    return 8 /* Layer */;
                case "lighten":
                    return 9 /* Lighten */;
                case "multiply":
                    return 10 /* Multiply */;
                case "overlay":
                    return 11 /* Overlay */;
                case "screen":
                    return 12 /* Screen */;
                case "subtract":
                    return 13 /* Subtract */;
                default:
                    return 0 /* Normal */;
            }
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.BaseFactory#parseDragonBonesData()
         */
        DataParser.parseDragonBonesData = function (rawData) {
            if (rawData instanceof ArrayBuffer) {
                return dragonBones.BinaryDataParser.getInstance().parseDragonBonesData(rawData);
            }
            else {
                return dragonBones.ObjectDataParser.getInstance().parseDragonBonesData(rawData);
            }
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.BaseFactory#parsetTextureAtlasData()
         */
        DataParser.parseTextureAtlasData = function (rawData, scale) {
            if (scale === void 0) { scale = 1; }
            console.warn("已废弃，请参考 @see");
            var textureAtlasData = {};
            var subTextureList = rawData[DataParser.SUB_TEXTURE];
            for (var i = 0, len = subTextureList.length; i < len; i++) {
                var subTextureObject = subTextureList[i];
                var subTextureName = subTextureObject[DataParser.NAME];
                var subTextureRegion = new dragonBones.Rectangle();
                var subTextureFrame = null;
                subTextureRegion.x = subTextureObject[DataParser.X] / scale;
                subTextureRegion.y = subTextureObject[DataParser.Y] / scale;
                subTextureRegion.width = subTextureObject[DataParser.WIDTH] / scale;
                subTextureRegion.height = subTextureObject[DataParser.HEIGHT] / scale;
                if (DataParser.FRAME_WIDTH in subTextureObject) {
                    subTextureFrame = new dragonBones.Rectangle();
                    subTextureFrame.x = subTextureObject[DataParser.FRAME_X] / scale;
                    subTextureFrame.y = subTextureObject[DataParser.FRAME_Y] / scale;
                    subTextureFrame.width = subTextureObject[DataParser.FRAME_WIDTH] / scale;
                    subTextureFrame.height = subTextureObject[DataParser.FRAME_HEIGHT] / scale;
                }
                textureAtlasData[subTextureName] = { region: subTextureRegion, frame: subTextureFrame, rotated: false };
            }
            return textureAtlasData;
        };
        DataParser.DATA_VERSION_2_3 = "2.3";
        DataParser.DATA_VERSION_3_0 = "3.0";
        DataParser.DATA_VERSION_4_0 = "4.0";
        DataParser.DATA_VERSION_4_5 = "4.5";
        DataParser.DATA_VERSION_5_0 = "5.0";
        DataParser.DATA_VERSION = DataParser.DATA_VERSION_5_0;
        DataParser.DATA_VERSIONS = [
            DataParser.DATA_VERSION_4_0,
            DataParser.DATA_VERSION_4_5,
            DataParser.DATA_VERSION_5_0
        ];
        DataParser.TEXTURE_ATLAS = "textureAtlas";
        DataParser.SUB_TEXTURE = "SubTexture";
        DataParser.FORMAT = "format";
        DataParser.IMAGE_PATH = "imagePath";
        DataParser.WIDTH = "width";
        DataParser.HEIGHT = "height";
        DataParser.ROTATED = "rotated";
        DataParser.FRAME_X = "frameX";
        DataParser.FRAME_Y = "frameY";
        DataParser.FRAME_WIDTH = "frameWidth";
        DataParser.FRAME_HEIGHT = "frameHeight";
        DataParser.DRADON_BONES = "dragonBones";
        DataParser.USER_DATA = "userData";
        DataParser.ARMATURE = "armature";
        DataParser.BONE = "bone";
        DataParser.IK = "ik";
        DataParser.SLOT = "slot";
        DataParser.SKIN = "skin";
        DataParser.DISPLAY = "display";
        DataParser.ANIMATION = "animation";
        DataParser.Z_ORDER = "zOrder";
        DataParser.FFD = "ffd";
        DataParser.FRAME = "frame";
        DataParser.TRANSLATE_FRAME = "translateFrame";
        DataParser.ROTATE_FRAME = "rotateFrame";
        DataParser.SCALE_FRAME = "scaleFrame";
        DataParser.VISIBLE_FRAME = "visibleFrame";
        DataParser.DISPLAY_FRAME = "displayFrame";
        DataParser.COLOR_FRAME = "colorFrame";
        DataParser.DEFAULT_ACTIONS = "defaultActions";
        DataParser.ACTIONS = "actions";
        DataParser.EVENTS = "events";
        DataParser.INTS = "ints";
        DataParser.FLOATS = "floats";
        DataParser.STRINGS = "strings";
        DataParser.CANVAS = "canvas";
        DataParser.TRANSFORM = "transform";
        DataParser.PIVOT = "pivot";
        DataParser.AABB = "aabb";
        DataParser.COLOR = "color";
        DataParser.VERSION = "version";
        DataParser.COMPATIBLE_VERSION = "compatibleVersion";
        DataParser.FRAME_RATE = "frameRate";
        DataParser.TYPE = "type";
        DataParser.SUB_TYPE = "subType";
        DataParser.NAME = "name";
        DataParser.PARENT = "parent";
        DataParser.TARGET = "target";
        DataParser.SHARE = "share";
        DataParser.PATH = "path";
        DataParser.LENGTH = "length";
        DataParser.DISPLAY_INDEX = "displayIndex";
        DataParser.BLEND_MODE = "blendMode";
        DataParser.INHERIT_TRANSLATION = "inheritTranslation";
        DataParser.INHERIT_ROTATION = "inheritRotation";
        DataParser.INHERIT_SCALE = "inheritScale";
        DataParser.INHERIT_REFLECTION = "inheritReflection";
        DataParser.INHERIT_ANIMATION = "inheritAnimation";
        DataParser.INHERIT_FFD = "inheritFFD";
        DataParser.BEND_POSITIVE = "bendPositive";
        DataParser.CHAIN = "chain";
        DataParser.WEIGHT = "weight";
        DataParser.FADE_IN_TIME = "fadeInTime";
        DataParser.PLAY_TIMES = "playTimes";
        DataParser.SCALE = "scale";
        DataParser.OFFSET = "offset";
        DataParser.POSITION = "position";
        DataParser.DURATION = "duration";
        DataParser.TWEEN_TYPE = "tweenType";
        DataParser.TWEEN_EASING = "tweenEasing";
        DataParser.TWEEN_ROTATE = "tweenRotate";
        DataParser.TWEEN_SCALE = "tweenScale";
        DataParser.CURVE = "curve";
        DataParser.SOUND = "sound";
        DataParser.EVENT = "event";
        DataParser.ACTION = "action";
        DataParser.X = "x";
        DataParser.Y = "y";
        DataParser.SKEW_X = "skX";
        DataParser.SKEW_Y = "skY";
        DataParser.SCALE_X = "scX";
        DataParser.SCALE_Y = "scY";
        DataParser.VALUE = "value";
        DataParser.ROTATE = "rotate";
        DataParser.SKEW = "skew";
        DataParser.ALPHA_OFFSET = "aO";
        DataParser.RED_OFFSET = "rO";
        DataParser.GREEN_OFFSET = "gO";
        DataParser.BLUE_OFFSET = "bO";
        DataParser.ALPHA_MULTIPLIER = "aM";
        DataParser.RED_MULTIPLIER = "rM";
        DataParser.GREEN_MULTIPLIER = "gM";
        DataParser.BLUE_MULTIPLIER = "bM";
        DataParser.UVS = "uvs";
        DataParser.VERTICES = "vertices";
        DataParser.TRIANGLES = "triangles";
        DataParser.WEIGHTS = "weights";
        DataParser.SLOT_POSE = "slotPose";
        DataParser.BONE_POSE = "bonePose";
        DataParser.GOTO_AND_PLAY = "gotoAndPlay";
        DataParser.DEFAULT_NAME = "default";
        return DataParser;
    }());
    dragonBones.DataParser = DataParser;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var ObjectDataParser = (function (_super) {
        __extends(ObjectDataParser, _super);
        function ObjectDataParser() {
            /**
             * @private
             */
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._intArrayJson = [];
            _this._floatArrayJson = [];
            _this._frameIntArrayJson = [];
            _this._frameFloatArrayJson = [];
            _this._frameArrayJson = [];
            _this._timelineArrayJson = [];
            _this._rawTextureAtlasIndex = 0;
            _this._rawBones = [];
            _this._data = null; //
            _this._armature = null; //
            _this._bone = null; //
            _this._slot = null; //
            _this._skin = null; //
            _this._mesh = null; //
            _this._animation = null; //
            _this._timeline = null; //
            _this._rawTextureAtlases = null;
            _this._defalultColorOffset = -1;
            _this._prevTweenRotate = 0;
            _this._prevRotation = 0.0;
            _this._helpMatrixA = new dragonBones.Matrix();
            _this._helpMatrixB = new dragonBones.Matrix();
            _this._helpTransform = new dragonBones.Transform();
            _this._helpColorTransform = new dragonBones.ColorTransform();
            _this._helpPoint = new dragonBones.Point();
            _this._helpArray = [];
            _this._actionFrames = [];
            _this._weightSlotPose = {};
            _this._weightBonePoses = {};
            _this._weightBoneIndices = {};
            _this._cacheBones = {};
            _this._meshs = {};
            _this._slotChildActions = {};
            return _this;
        }
        ObjectDataParser._getBoolean = function (rawData, key, defaultValue) {
            if (key in rawData) {
                var value = rawData[key];
                var type = typeof value;
                if (type === "boolean") {
                    return value;
                }
                else if (type === "string") {
                    switch (value) {
                        case "0":
                        case "NaN":
                        case "":
                        case "false":
                        case "null":
                        case "undefined":
                            return false;
                        default:
                            return true;
                    }
                }
                else {
                    return !!value;
                }
            }
            return defaultValue;
        };
        /**
         * @private
         */
        ObjectDataParser._getNumber = function (rawData, key, defaultValue) {
            if (key in rawData) {
                var value = rawData[key];
                if (value === null || value === "NaN") {
                    return defaultValue;
                }
                return +value || 0;
            }
            return defaultValue;
        };
        /**
         * @private
         */
        ObjectDataParser._getString = function (rawData, key, defaultValue) {
            if (key in rawData) {
                var value = rawData[key];
                var type = typeof value;
                if (type === "string") {
                    if (dragonBones.DragonBones.webAssembly) {
                        for (var i = 0, l = value.length; i < l; ++i) {
                            if (value.charCodeAt(i) > 255) {
                                return encodeURI(value);
                            }
                        }
                    }
                    return value;
                }
                return String(value);
            }
            return defaultValue;
        };
        // private readonly _intArray: Array<number> = [];
        // private readonly _floatArray: Array<number> = [];
        // private readonly _frameIntArray: Array<number> = [];
        // private readonly _frameFloatArray: Array<number> = [];
        // private readonly _frameArray: Array<number> = [];
        // private readonly _timelineArray: Array<number> = [];
        /**
         * @private
         */
        ObjectDataParser.prototype._getCurvePoint = function (x1, y1, x2, y2, x3, y3, x4, y4, t, result) {
            var l_t = 1.0 - t;
            var powA = l_t * l_t;
            var powB = t * t;
            var kA = l_t * powA;
            var kB = 3.0 * t * powA;
            var kC = 3.0 * l_t * powB;
            var kD = t * powB;
            result.x = kA * x1 + kB * x2 + kC * x3 + kD * x4;
            result.y = kA * y1 + kB * y2 + kC * y3 + kD * y4;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._samplingEasingCurve = function (curve, samples) {
            var curveCount = curve.length;
            var stepIndex = -2;
            for (var i = 0, l = samples.length; i < l; ++i) {
                var t = (i + 1) / (l + 1);
                while ((stepIndex + 6 < curveCount ? curve[stepIndex + 6] : 1) < t) {
                    stepIndex += 6;
                }
                var isInCurve = stepIndex >= 0 && stepIndex + 6 < curveCount;
                var x1 = isInCurve ? curve[stepIndex] : 0.0;
                var y1 = isInCurve ? curve[stepIndex + 1] : 0.0;
                var x2 = curve[stepIndex + 2];
                var y2 = curve[stepIndex + 3];
                var x3 = curve[stepIndex + 4];
                var y3 = curve[stepIndex + 5];
                var x4 = isInCurve ? curve[stepIndex + 6] : 1.0;
                var y4 = isInCurve ? curve[stepIndex + 7] : 1.0;
                var lower = 0.0;
                var higher = 1.0;
                while (higher - lower > 0.0001) {
                    var percentage = (higher + lower) * 0.5;
                    this._getCurvePoint(x1, y1, x2, y2, x3, y3, x4, y4, percentage, this._helpPoint);
                    if (t - this._helpPoint.x > 0.0) {
                        lower = percentage;
                    }
                    else {
                        higher = percentage;
                    }
                }
                samples[i] = this._helpPoint.y;
            }
        };
        ObjectDataParser.prototype._sortActionFrame = function (a, b) {
            return a.frameStart > b.frameStart ? 1 : -1;
        };
        ObjectDataParser.prototype._parseActionDataInFrame = function (rawData, frameStart, bone, slot) {
            if (ObjectDataParser.EVENT in rawData) {
                this._mergeActionFrame(rawData[ObjectDataParser.EVENT], frameStart, 10 /* Frame */, bone, slot);
            }
            if (ObjectDataParser.SOUND in rawData) {
                this._mergeActionFrame(rawData[ObjectDataParser.SOUND], frameStart, 11 /* Sound */, bone, slot);
            }
            if (ObjectDataParser.ACTION in rawData) {
                this._mergeActionFrame(rawData[ObjectDataParser.ACTION], frameStart, 0 /* Play */, bone, slot);
            }
            if (ObjectDataParser.EVENTS in rawData) {
                this._mergeActionFrame(rawData[ObjectDataParser.EVENTS], frameStart, 10 /* Frame */, bone, slot);
            }
            if (ObjectDataParser.ACTIONS in rawData) {
                this._mergeActionFrame(rawData[ObjectDataParser.ACTIONS], frameStart, 0 /* Play */, bone, slot);
            }
        };
        ObjectDataParser.prototype._mergeActionFrame = function (rawData, frameStart, type, bone, slot) {
            var actionOffset = dragonBones.DragonBones.webAssembly ? this._armature.actions.size() : this._armature.actions.length;
            var actionCount = this._parseActionData(rawData, this._armature.actions, type, bone, slot);
            var frame = null;
            if (this._actionFrames.length === 0) {
                frame = new ActionFrame();
                frame.frameStart = 0;
                this._actionFrames.push(frame);
                frame = null;
            }
            for (var _i = 0, _a = this._actionFrames; _i < _a.length; _i++) {
                var eachFrame = _a[_i];
                if (eachFrame.frameStart === frameStart) {
                    frame = eachFrame;
                    break;
                }
            }
            if (frame === null) {
                frame = new ActionFrame();
                frame.frameStart = frameStart;
                this._actionFrames.push(frame);
            }
            for (var i = 0; i < actionCount; ++i) {
                frame.actions.push(actionOffset + i);
            }
        };
        ObjectDataParser.prototype._parseCacheActionFrame = function (frame) {
            var frameArray = dragonBones.DragonBones.webAssembly ? this._frameArrayJson : this._data.frameArray;
            var frameOffset = frameArray.length;
            var actionCount = frame.actions.length;
            frameArray.length += 1 + 1 + actionCount;
            frameArray[frameOffset + 0 /* FramePosition */] = frame.frameStart;
            frameArray[frameOffset + 0 /* FramePosition */ + 1] = actionCount; // Action count.
            for (var i = 0; i < actionCount; ++i) {
                frameArray[frameOffset + 0 /* FramePosition */ + 2 + i] = frame.actions[i];
            }
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseArmature = function (rawData, scale) {
            // const armature = BaseObject.borrowObject(ArmatureData);
            var armature = dragonBones.DragonBones.webAssembly ? new Module["ArmatureData"]() : dragonBones.BaseObject.borrowObject(dragonBones.ArmatureData);
            armature.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "");
            armature.frameRate = ObjectDataParser._getNumber(rawData, ObjectDataParser.FRAME_RATE, this._data.frameRate);
            armature.scale = scale;
            if (ObjectDataParser.TYPE in rawData && typeof rawData[ObjectDataParser.TYPE] === "string") {
                armature.type = ObjectDataParser._getArmatureType(rawData[ObjectDataParser.TYPE]);
            }
            else {
                armature.type = ObjectDataParser._getNumber(rawData, ObjectDataParser.TYPE, 0 /* Armature */);
            }
            if (armature.frameRate === 0) {
                armature.frameRate = 24;
            }
            this._armature = armature;
            if (ObjectDataParser.AABB in rawData) {
                var rawAABB = rawData[ObjectDataParser.AABB];
                armature.aabb.x = ObjectDataParser._getNumber(rawAABB, ObjectDataParser.X, 0.0);
                armature.aabb.y = ObjectDataParser._getNumber(rawAABB, ObjectDataParser.Y, 0.0);
                armature.aabb.width = ObjectDataParser._getNumber(rawAABB, ObjectDataParser.WIDTH, 0.0);
                armature.aabb.height = ObjectDataParser._getNumber(rawAABB, ObjectDataParser.HEIGHT, 0.0);
            }
            if (ObjectDataParser.CANVAS in rawData) {
                var rawCanvas = rawData[ObjectDataParser.CANVAS];
                var canvas = dragonBones.BaseObject.borrowObject(dragonBones.CanvasData);
                if (ObjectDataParser.COLOR in rawCanvas) {
                    ObjectDataParser._getNumber(rawCanvas, ObjectDataParser.COLOR, 0);
                    canvas.hasBackground = true;
                }
                else {
                    canvas.hasBackground = false;
                }
                canvas.color = ObjectDataParser._getNumber(rawCanvas, ObjectDataParser.COLOR, 0);
                canvas.x = ObjectDataParser._getNumber(rawCanvas, ObjectDataParser.X, 0);
                canvas.y = ObjectDataParser._getNumber(rawCanvas, ObjectDataParser.Y, 0);
                canvas.width = ObjectDataParser._getNumber(rawCanvas, ObjectDataParser.WIDTH, 0);
                canvas.height = ObjectDataParser._getNumber(rawCanvas, ObjectDataParser.HEIGHT, 0);
                armature.canvas = canvas;
            }
            if (ObjectDataParser.BONE in rawData) {
                var rawBones = rawData[ObjectDataParser.BONE];
                for (var _i = 0, rawBones_1 = rawBones; _i < rawBones_1.length; _i++) {
                    var rawBone = rawBones_1[_i];
                    var parentName = ObjectDataParser._getString(rawBone, ObjectDataParser.PARENT, "");
                    var bone = this._parseBone(rawBone);
                    if (parentName.length > 0) {
                        var parent_1 = armature.getBone(parentName);
                        if (parent_1 !== null) {
                            bone.parent = parent_1;
                        }
                        else {
                            (this._cacheBones[parentName] = this._cacheBones[parentName] || []).push(bone);
                        }
                    }
                    if (bone.name in this._cacheBones) {
                        for (var _a = 0, _b = this._cacheBones[bone.name]; _a < _b.length; _a++) {
                            var child = _b[_a];
                            child.parent = bone;
                        }
                        delete this._cacheBones[bone.name];
                    }
                    armature.addBone(bone);
                    this._rawBones.push(bone); // Raw bone sort.
                }
            }
            if (ObjectDataParser.IK in rawData) {
                var rawIKS = rawData[ObjectDataParser.IK];
                for (var _c = 0, rawIKS_1 = rawIKS; _c < rawIKS_1.length; _c++) {
                    var rawIK = rawIKS_1[_c];
                    this._parseIKConstraint(rawIK);
                }
            }
            armature.sortBones();
            if (ObjectDataParser.SLOT in rawData) {
                var rawSlots = rawData[ObjectDataParser.SLOT];
                for (var _d = 0, rawSlots_1 = rawSlots; _d < rawSlots_1.length; _d++) {
                    var rawSlot = rawSlots_1[_d];
                    armature.addSlot(this._parseSlot(rawSlot));
                }
            }
            if (ObjectDataParser.SKIN in rawData) {
                var rawSkins = rawData[ObjectDataParser.SKIN];
                for (var _e = 0, rawSkins_1 = rawSkins; _e < rawSkins_1.length; _e++) {
                    var rawSkin = rawSkins_1[_e];
                    armature.addSkin(this._parseSkin(rawSkin));
                }
            }
            if (ObjectDataParser.ANIMATION in rawData) {
                var rawAnimations = rawData[ObjectDataParser.ANIMATION];
                for (var _f = 0, rawAnimations_1 = rawAnimations; _f < rawAnimations_1.length; _f++) {
                    var rawAnimation = rawAnimations_1[_f];
                    var animation = this._parseAnimation(rawAnimation);
                    armature.addAnimation(animation);
                }
            }
            if (ObjectDataParser.DEFAULT_ACTIONS in rawData) {
                this._parseActionData(rawData[ObjectDataParser.DEFAULT_ACTIONS], armature.defaultActions, 0 /* Play */, null, null);
            }
            if (ObjectDataParser.ACTIONS in rawData) {
                this._parseActionData(rawData[ObjectDataParser.ACTIONS], armature.actions, 0 /* Play */, null, null);
            }
            // for (const action of armature.defaultActions) { // Set default animation from default action.
            for (var i = 0; i < (dragonBones.DragonBones.webAssembly ? armature.defaultActions.size() : armature.defaultActions.length); ++i) {
                var action = dragonBones.DragonBones.webAssembly ? armature.defaultActions.get(i) : armature.defaultActions[i];
                if (action.type === 0 /* Play */) {
                    var animation = armature.getAnimation(action.name);
                    if (animation !== null) {
                        armature.defaultAnimation = animation;
                    }
                    break;
                }
            }
            // Clear helper.
            this._rawBones.length = 0;
            this._armature = null;
            for (var k in this._meshs) {
                delete this._meshs[k];
            }
            for (var k in this._cacheBones) {
                delete this._cacheBones[k];
            }
            for (var k in this._slotChildActions) {
                delete this._slotChildActions[k];
            }
            for (var k in this._weightSlotPose) {
                delete this._weightSlotPose[k];
            }
            for (var k in this._weightBonePoses) {
                delete this._weightBonePoses[k];
            }
            for (var k in this._weightBoneIndices) {
                delete this._weightBoneIndices[k];
            }
            return armature;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseBone = function (rawData) {
            // const bone = BaseObject.borrowObject(BoneData);
            var bone = dragonBones.DragonBones.webAssembly ? new Module["BoneData"]() : dragonBones.BaseObject.borrowObject(dragonBones.BoneData);
            bone.inheritTranslation = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_TRANSLATION, true);
            bone.inheritRotation = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_ROTATION, true);
            bone.inheritScale = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_SCALE, true);
            bone.inheritReflection = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_REFLECTION, true);
            bone.length = ObjectDataParser._getNumber(rawData, ObjectDataParser.LENGTH, 0) * this._armature.scale;
            bone.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "");
            if (ObjectDataParser.TRANSFORM in rawData) {
                this._parseTransform(rawData[ObjectDataParser.TRANSFORM], bone.transform, this._armature.scale);
            }
            return bone;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseIKConstraint = function (rawData) {
            var bone = this._armature.getBone(ObjectDataParser._getString(rawData, (ObjectDataParser.BONE in rawData) ? ObjectDataParser.BONE : ObjectDataParser.NAME, ""));
            if (bone === null) {
                return;
            }
            var target = this._armature.getBone(ObjectDataParser._getString(rawData, ObjectDataParser.TARGET, ""));
            if (target === null) {
                return;
            }
            // const constraint = BaseObject.borrowObject(IKConstraintData);
            var constraint = dragonBones.DragonBones.webAssembly ? new Module["IKConstraintData"]() : dragonBones.BaseObject.borrowObject(dragonBones.IKConstraintData);
            constraint.bendPositive = ObjectDataParser._getBoolean(rawData, ObjectDataParser.BEND_POSITIVE, true);
            constraint.scaleEnabled = ObjectDataParser._getBoolean(rawData, ObjectDataParser.SCALE, false);
            constraint.weight = ObjectDataParser._getNumber(rawData, ObjectDataParser.WEIGHT, 1.0);
            constraint.bone = bone;
            constraint.target = target;
            var chain = ObjectDataParser._getNumber(rawData, ObjectDataParser.CHAIN, 0);
            if (chain > 0) {
                constraint.root = bone.parent;
            }
            if (dragonBones.DragonBones.webAssembly) {
                bone.constraints.push_back(constraint);
            }
            else {
                bone.constraints.push(constraint);
            }
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseSlot = function (rawData) {
            // const slot = BaseObject.borrowObject(SlotData);
            var slot = dragonBones.DragonBones.webAssembly ? new Module["SlotData"]() : dragonBones.BaseObject.borrowObject(dragonBones.SlotData);
            slot.displayIndex = ObjectDataParser._getNumber(rawData, ObjectDataParser.DISPLAY_INDEX, 0);
            slot.zOrder = dragonBones.DragonBones.webAssembly ? this._armature.sortedSlots.size() : this._armature.sortedSlots.length;
            slot.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "");
            slot.parent = this._armature.getBone(ObjectDataParser._getString(rawData, ObjectDataParser.PARENT, "")); //
            if (ObjectDataParser.BLEND_MODE in rawData && typeof rawData[ObjectDataParser.BLEND_MODE] === "string") {
                slot.blendMode = ObjectDataParser._getBlendMode(rawData[ObjectDataParser.BLEND_MODE]);
            }
            else {
                slot.blendMode = ObjectDataParser._getNumber(rawData, ObjectDataParser.BLEND_MODE, 0 /* Normal */);
            }
            if (ObjectDataParser.COLOR in rawData) {
                // slot.color = SlotData.createColor();
                slot.color = dragonBones.DragonBones.webAssembly ? Module["SlotData"].createColor() : dragonBones.SlotData.createColor();
                this._parseColorTransform(rawData[ObjectDataParser.COLOR], slot.color);
            }
            else {
                // slot.color = SlotData.DEFAULT_COLOR;
                slot.color = dragonBones.DragonBones.webAssembly ? Module["SlotData"].DEFAULT_COLOR : dragonBones.SlotData.DEFAULT_COLOR;
            }
            if (ObjectDataParser.ACTIONS in rawData) {
                var actions = this._slotChildActions[slot.name] = [];
                this._parseActionData(rawData[ObjectDataParser.ACTIONS], actions, 0 /* Play */, null, null);
            }
            return slot;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseSkin = function (rawData) {
            // const skin = BaseObject.borrowObject(SkinData);
            var skin = dragonBones.DragonBones.webAssembly ? new Module["SkinData"]() : dragonBones.BaseObject.borrowObject(dragonBones.SkinData);
            skin.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, ObjectDataParser.DEFAULT_NAME);
            if (skin.name.length === 0) {
                skin.name = ObjectDataParser.DEFAULT_NAME;
            }
            if (ObjectDataParser.SLOT in rawData) {
                this._skin = skin;
                var rawSlots = rawData[ObjectDataParser.SLOT];
                for (var _i = 0, rawSlots_2 = rawSlots; _i < rawSlots_2.length; _i++) {
                    var rawSlot = rawSlots_2[_i];
                    var slotName = ObjectDataParser._getString(rawSlot, ObjectDataParser.NAME, "");
                    var slot = this._armature.getSlot(slotName);
                    if (slot !== null) {
                        this._slot = slot;
                        if (ObjectDataParser.DISPLAY in rawSlot) {
                            var rawDisplays = rawSlot[ObjectDataParser.DISPLAY];
                            for (var _a = 0, rawDisplays_1 = rawDisplays; _a < rawDisplays_1.length; _a++) {
                                var rawDisplay = rawDisplays_1[_a];
                                skin.addDisplay(slotName, this._parseDisplay(rawDisplay));
                            }
                        }
                        this._slot = null; //
                    }
                }
                this._skin = null; //
            }
            return skin;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseDisplay = function (rawData) {
            var display = null;
            var name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "");
            var path = ObjectDataParser._getString(rawData, ObjectDataParser.PATH, "");
            var type = 0 /* Image */;
            if (ObjectDataParser.TYPE in rawData && typeof rawData[ObjectDataParser.TYPE] === "string") {
                type = ObjectDataParser._getDisplayType(rawData[ObjectDataParser.TYPE]);
            }
            else {
                type = ObjectDataParser._getNumber(rawData, ObjectDataParser.TYPE, type);
            }
            switch (type) {
                case 0 /* Image */:
                    // const imageDisplay = display = BaseObject.borrowObject(ImageDisplayData);
                    var imageDisplay = display = dragonBones.DragonBones.webAssembly ? new Module["ImageDisplayData"]() : dragonBones.BaseObject.borrowObject(dragonBones.ImageDisplayData);
                    imageDisplay.name = name;
                    imageDisplay.path = path.length > 0 ? path : name;
                    this._parsePivot(rawData, imageDisplay);
                    break;
                case 1 /* Armature */:
                    // const armatureDisplay = display = BaseObject.borrowObject(ArmatureDisplayData);
                    var armatureDisplay = display = dragonBones.DragonBones.webAssembly ? new Module["ArmatureDisplayData"]() : dragonBones.BaseObject.borrowObject(dragonBones.ArmatureDisplayData);
                    armatureDisplay.name = name;
                    armatureDisplay.path = path.length > 0 ? path : name;
                    armatureDisplay.inheritAnimation = true;
                    if (ObjectDataParser.ACTIONS in rawData) {
                        this._parseActionData(rawData[ObjectDataParser.ACTIONS], armatureDisplay.actions, 0 /* Play */, null, null);
                    }
                    else if (this._slot.name in this._slotChildActions) {
                        var displays = this._skin.getDisplays(this._slot.name);
                        if (displays === null ? this._slot.displayIndex === 0 : this._slot.displayIndex === displays.length) {
                            for (var _i = 0, _a = this._slotChildActions[this._slot.name]; _i < _a.length; _i++) {
                                var action = _a[_i];
                                if (dragonBones.DragonBones.webAssembly) {
                                    armatureDisplay.actions.push_back(action);
                                }
                                else {
                                    armatureDisplay.actions.push(action);
                                }
                            }
                            delete this._slotChildActions[this._slot.name];
                        }
                    }
                    break;
                case 2 /* Mesh */:
                    // const meshDisplay = display = BaseObject.borrowObject(MeshDisplayData);
                    var meshDisplay = display = dragonBones.DragonBones.webAssembly ? new Module["MeshDisplayData"]() : dragonBones.BaseObject.borrowObject(dragonBones.MeshDisplayData);
                    meshDisplay.name = name;
                    meshDisplay.path = path.length > 0 ? path : name;
                    meshDisplay.inheritAnimation = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_FFD, true);
                    this._parsePivot(rawData, meshDisplay);
                    var shareName = ObjectDataParser._getString(rawData, ObjectDataParser.SHARE, "");
                    if (shareName.length > 0) {
                        var shareMesh = this._meshs[shareName];
                        meshDisplay.offset = shareMesh.offset;
                        meshDisplay.weight = shareMesh.weight;
                    }
                    else {
                        this._parseMesh(rawData, meshDisplay);
                        this._meshs[meshDisplay.name] = meshDisplay;
                    }
                    break;
                case 3 /* BoundingBox */:
                    var boundingBox = this._parseBoundingBox(rawData);
                    if (boundingBox !== null) {
                        // const boundingBoxDisplay = display = BaseObject.borrowObject(BoundingBoxDisplayData);
                        var boundingBoxDisplay = display = dragonBones.DragonBones.webAssembly ? new Module["BoundingBoxDisplayData"]() : dragonBones.BaseObject.borrowObject(dragonBones.BoundingBoxDisplayData);
                        boundingBoxDisplay.name = name;
                        boundingBoxDisplay.path = path.length > 0 ? path : name;
                        boundingBoxDisplay.boundingBox = boundingBox;
                    }
                    break;
            }
            if (display !== null) {
                display.parent = this._armature;
                if (ObjectDataParser.TRANSFORM in rawData) {
                    this._parseTransform(rawData[ObjectDataParser.TRANSFORM], display.transform, this._armature.scale);
                }
            }
            return display;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parsePivot = function (rawData, display) {
            if (ObjectDataParser.PIVOT in rawData) {
                var rawPivot = rawData[ObjectDataParser.PIVOT];
                display.pivot.x = ObjectDataParser._getNumber(rawPivot, ObjectDataParser.X, 0.0);
                display.pivot.y = ObjectDataParser._getNumber(rawPivot, ObjectDataParser.Y, 0.0);
            }
            else {
                display.pivot.x = 0.5;
                display.pivot.y = 0.5;
            }
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseMesh = function (rawData, mesh) {
            var rawVertices = rawData[ObjectDataParser.VERTICES];
            var rawUVs = rawData[ObjectDataParser.UVS];
            var rawTriangles = rawData[ObjectDataParser.TRIANGLES];
            var intArray = dragonBones.DragonBones.webAssembly ? this._intArrayJson : this._data.intArray;
            var floatArray = dragonBones.DragonBones.webAssembly ? this._floatArrayJson : this._data.floatArray;
            var vertexCount = Math.floor(rawVertices.length / 2); // uint
            var triangleCount = Math.floor(rawTriangles.length / 3); // uint
            var vertexOffset = floatArray.length;
            var uvOffset = vertexOffset + vertexCount * 2;
            mesh.offset = intArray.length;
            intArray.length += 1 + 1 + 1 + 1 + triangleCount * 3;
            intArray[mesh.offset + 0 /* MeshVertexCount */] = vertexCount;
            intArray[mesh.offset + 1 /* MeshTriangleCount */] = triangleCount;
            intArray[mesh.offset + 2 /* MeshFloatOffset */] = vertexOffset;
            for (var i = 0, l = triangleCount * 3; i < l; ++i) {
                intArray[mesh.offset + 4 /* MeshVertexIndices */ + i] = rawTriangles[i];
            }
            floatArray.length += vertexCount * 2 + vertexCount * 2;
            for (var i = 0, l = vertexCount * 2; i < l; ++i) {
                floatArray[vertexOffset + i] = rawVertices[i];
                floatArray[uvOffset + i] = rawUVs[i];
            }
            if (ObjectDataParser.WEIGHTS in rawData) {
                var rawWeights = rawData[ObjectDataParser.WEIGHTS];
                var rawSlotPose = rawData[ObjectDataParser.SLOT_POSE];
                var rawBonePoses = rawData[ObjectDataParser.BONE_POSE];
                var weightBoneIndices = new Array();
                var weightBoneCount = Math.floor(rawBonePoses.length / 7); // uint
                var floatOffset = floatArray.length;
                // const weight = BaseObject.borrowObject(WeightData);
                var weight = dragonBones.DragonBones.webAssembly ? new Module["WeightData"]() : dragonBones.BaseObject.borrowObject(dragonBones.WeightData);
                weight.count = (rawWeights.length - vertexCount) / 2;
                weight.offset = intArray.length;
                weight.bones.length = weightBoneCount;
                weightBoneIndices.length = weightBoneCount;
                intArray.length += 1 + 1 + weightBoneCount + vertexCount + weight.count;
                intArray[weight.offset + 1 /* WeigthFloatOffset */] = floatOffset;
                for (var i = 0; i < weightBoneCount; ++i) {
                    var rawBoneIndex = rawBonePoses[i * 7]; // uint
                    var bone = this._rawBones[rawBoneIndex];
                    weight.bones[i] = bone;
                    weightBoneIndices[i] = rawBoneIndex;
                    if (dragonBones.DragonBones.webAssembly) {
                        for (var j = 0; j < this._armature.sortedBones.size(); j++) {
                            if (this._armature.sortedBones.get(j) === bone) {
                                intArray[weight.offset + 2 /* WeigthBoneIndices */ + i] = j;
                            }
                        }
                    }
                    else {
                        intArray[weight.offset + 2 /* WeigthBoneIndices */ + i] = this._armature.sortedBones.indexOf(bone);
                    }
                }
                floatArray.length += weight.count * 3;
                this._helpMatrixA.copyFromArray(rawSlotPose, 0);
                for (var i = 0, iW = 0, iB = weight.offset + 2 /* WeigthBoneIndices */ + weightBoneCount, iV = floatOffset; i < vertexCount; ++i) {
                    var iD = i * 2;
                    var vertexBoneCount = intArray[iB++] = rawWeights[iW++]; // uint
                    var x = floatArray[vertexOffset + iD];
                    var y = floatArray[vertexOffset + iD + 1];
                    this._helpMatrixA.transformPoint(x, y, this._helpPoint);
                    x = this._helpPoint.x;
                    y = this._helpPoint.y;
                    for (var j = 0; j < vertexBoneCount; ++j) {
                        var rawBoneIndex = rawWeights[iW++]; // uint
                        var bone = this._rawBones[rawBoneIndex];
                        this._helpMatrixB.copyFromArray(rawBonePoses, weightBoneIndices.indexOf(rawBoneIndex) * 7 + 1);
                        this._helpMatrixB.invert();
                        this._helpMatrixB.transformPoint(x, y, this._helpPoint);
                        intArray[iB++] = weight.bones.indexOf(bone);
                        floatArray[iV++] = rawWeights[iW++];
                        floatArray[iV++] = this._helpPoint.x;
                        floatArray[iV++] = this._helpPoint.y;
                    }
                }
                mesh.weight = weight;
                //
                this._weightSlotPose[mesh.name] = rawSlotPose;
                this._weightBonePoses[mesh.name] = rawBonePoses;
                this._weightBoneIndices[mesh.name] = weightBoneIndices;
            }
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseBoundingBox = function (rawData) {
            var boundingBox = null;
            var type = 0 /* Rectangle */;
            if (ObjectDataParser.SUB_TYPE in rawData && typeof rawData[ObjectDataParser.SUB_TYPE] === "string") {
                type = ObjectDataParser._getBoundingBoxType(rawData[ObjectDataParser.SUB_TYPE]);
            }
            else {
                type = ObjectDataParser._getNumber(rawData, ObjectDataParser.SUB_TYPE, type);
            }
            switch (type) {
                case 0 /* Rectangle */:
                    // boundingBox = BaseObject.borrowObject(RectangleBoundingBoxData);
                    boundingBox = dragonBones.DragonBones.webAssembly ? new Module["RectangleBoundingBoxData"]() : dragonBones.BaseObject.borrowObject(dragonBones.RectangleBoundingBoxData);
                    break;
                case 1 /* Ellipse */:
                    // boundingBox = BaseObject.borrowObject(EllipseBoundingBoxData);
                    boundingBox = dragonBones.DragonBones.webAssembly ? new Module["EllipseBoundingBoxData"]() : dragonBones.BaseObject.borrowObject(dragonBones.EllipseBoundingBoxData);
                    break;
                case 2 /* Polygon */:
                    boundingBox = this._parsePolygonBoundingBox(rawData);
                    break;
            }
            if (boundingBox !== null) {
                boundingBox.color = ObjectDataParser._getNumber(rawData, ObjectDataParser.COLOR, 0x000000);
                if (boundingBox.type === 0 /* Rectangle */ || boundingBox.type === 1 /* Ellipse */) {
                    boundingBox.width = ObjectDataParser._getNumber(rawData, ObjectDataParser.WIDTH, 0.0);
                    boundingBox.height = ObjectDataParser._getNumber(rawData, ObjectDataParser.HEIGHT, 0.0);
                }
            }
            return boundingBox;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parsePolygonBoundingBox = function (rawData) {
            var rawVertices = rawData[ObjectDataParser.VERTICES];
            var floatArray = dragonBones.DragonBones.webAssembly ? this._floatArrayJson : this._data.floatArray;
            // const polygonBoundingBox = BaseObject.borrowObject(PolygonBoundingBoxData);
            var polygonBoundingBox = dragonBones.DragonBones.webAssembly ? new Module["PolygonBoundingBoxData"]() : dragonBones.BaseObject.borrowObject(dragonBones.PolygonBoundingBoxData);
            polygonBoundingBox.offset = floatArray.length;
            polygonBoundingBox.count = rawVertices.length;
            polygonBoundingBox.vertices = floatArray;
            floatArray.length += polygonBoundingBox.count;
            for (var i = 0, l = polygonBoundingBox.count; i < l; i += 2) {
                var iN = i + 1;
                var x = rawVertices[i];
                var y = rawVertices[iN];
                floatArray[polygonBoundingBox.offset + i] = x;
                floatArray[polygonBoundingBox.offset + iN] = y;
                // AABB.
                if (i === 0) {
                    polygonBoundingBox.x = x;
                    polygonBoundingBox.y = y;
                    polygonBoundingBox.width = x;
                    polygonBoundingBox.height = y;
                }
                else {
                    if (x < polygonBoundingBox.x) {
                        polygonBoundingBox.x = x;
                    }
                    else if (x > polygonBoundingBox.width) {
                        polygonBoundingBox.width = x;
                    }
                    if (y < polygonBoundingBox.y) {
                        polygonBoundingBox.y = y;
                    }
                    else if (y > polygonBoundingBox.height) {
                        polygonBoundingBox.height = y;
                    }
                }
            }
            return polygonBoundingBox;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseAnimation = function (rawData) {
            // const animation = BaseObject.borrowObject(AnimationData);
            var animation = dragonBones.DragonBones.webAssembly ? new Module["AnimationData"]() : dragonBones.BaseObject.borrowObject(dragonBones.AnimationData);
            animation.frameCount = Math.max(ObjectDataParser._getNumber(rawData, ObjectDataParser.DURATION, 1), 1);
            animation.playTimes = ObjectDataParser._getNumber(rawData, ObjectDataParser.PLAY_TIMES, 1);
            animation.duration = animation.frameCount / this._armature.frameRate;
            animation.fadeInTime = ObjectDataParser._getNumber(rawData, ObjectDataParser.FADE_IN_TIME, 0.0);
            animation.scale = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE, 1.0);
            animation.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, ObjectDataParser.DEFAULT_NAME);
            // TDOO Check std::string length
            if (animation.name.length < 1) {
                animation.name = ObjectDataParser.DEFAULT_NAME;
            }
            if (dragonBones.DragonBones.webAssembly) {
                animation.frameIntOffset = this._frameIntArrayJson.length;
                animation.frameFloatOffset = this._frameFloatArrayJson.length;
                animation.frameOffset = this._frameArrayJson.length;
            }
            else {
                animation.frameIntOffset = this._data.frameIntArray.length;
                animation.frameFloatOffset = this._data.frameFloatArray.length;
                animation.frameOffset = this._data.frameArray.length;
            }
            this._animation = animation;
            if (ObjectDataParser.FRAME in rawData) {
                var rawFrames = rawData[ObjectDataParser.FRAME];
                var keyFrameCount = rawFrames.length;
                if (keyFrameCount > 0) {
                    for (var i = 0, frameStart = 0; i < keyFrameCount; ++i) {
                        var rawFrame = rawFrames[i];
                        this._parseActionDataInFrame(rawFrame, frameStart, null, null);
                        frameStart += ObjectDataParser._getNumber(rawFrame, ObjectDataParser.DURATION, 1);
                    }
                }
            }
            if (ObjectDataParser.Z_ORDER in rawData) {
                this._animation.zOrderTimeline = this._parseTimeline(rawData[ObjectDataParser.Z_ORDER], 1 /* ZOrder */, false, false, 0, this._parseZOrderFrame);
            }
            if (ObjectDataParser.BONE in rawData) {
                var rawTimelines = rawData[ObjectDataParser.BONE];
                for (var _i = 0, rawTimelines_1 = rawTimelines; _i < rawTimelines_1.length; _i++) {
                    var rawTimeline = rawTimelines_1[_i];
                    this._parseBoneTimeline(rawTimeline);
                }
            }
            if (ObjectDataParser.SLOT in rawData) {
                var rawTimelines = rawData[ObjectDataParser.SLOT];
                for (var _a = 0, rawTimelines_2 = rawTimelines; _a < rawTimelines_2.length; _a++) {
                    var rawTimeline = rawTimelines_2[_a];
                    this._parseSlotTimeline(rawTimeline);
                }
            }
            if (ObjectDataParser.FFD in rawData) {
                var rawTimelines = rawData[ObjectDataParser.FFD];
                for (var _b = 0, rawTimelines_3 = rawTimelines; _b < rawTimelines_3.length; _b++) {
                    var rawTimeline = rawTimelines_3[_b];
                    var slotName = ObjectDataParser._getString(rawTimeline, ObjectDataParser.SLOT, "");
                    var displayName = ObjectDataParser._getString(rawTimeline, ObjectDataParser.NAME, "");
                    var slot = this._armature.getSlot(slotName);
                    if (slot === null) {
                        continue;
                    }
                    this._slot = slot;
                    this._mesh = this._meshs[displayName];
                    var timelineFFD = this._parseTimeline(rawTimeline, 22 /* SlotFFD */, false, true, 0, this._parseSlotFFDFrame);
                    if (timelineFFD !== null) {
                        this._animation.addSlotTimeline(slot, timelineFFD);
                    }
                    this._slot = null; //
                    this._mesh = null; //
                }
            }
            if (this._actionFrames.length > 0) {
                this._actionFrames.sort(this._sortActionFrame);
                // const timeline = this._animation.actionTimeline = BaseObject.borrowObject(TimelineData);
                var timeline = this._animation.actionTimeline = dragonBones.DragonBones.webAssembly ? new Module["TimelineData"]() : dragonBones.BaseObject.borrowObject(dragonBones.TimelineData);
                var timelineArray = dragonBones.DragonBones.webAssembly ? this._timelineArrayJson : this._data.timelineArray;
                var keyFrameCount = this._actionFrames.length;
                timeline.type = 0 /* Action */;
                timeline.offset = timelineArray.length;
                timelineArray.length += 1 + 1 + 1 + 1 + 1 + keyFrameCount;
                timelineArray[timeline.offset + 0 /* TimelineScale */] = 100;
                timelineArray[timeline.offset + 1 /* TimelineOffset */] = 0;
                timelineArray[timeline.offset + 2 /* TimelineKeyFrameCount */] = keyFrameCount;
                timelineArray[timeline.offset + 3 /* TimelineFrameValueCount */] = 0;
                timelineArray[timeline.offset + 4 /* TimelineFrameValueOffset */] = 0;
                this._timeline = timeline;
                if (keyFrameCount === 1) {
                    timeline.frameIndicesOffset = -1;
                    timelineArray[timeline.offset + 5 /* TimelineFrameOffset */ + 0] = this._parseCacheActionFrame(this._actionFrames[0]) - this._animation.frameOffset;
                }
                else {
                    var totalFrameCount = this._animation.frameCount + 1; // One more frame than animation.
                    var frameIndices = this._data.frameIndices;
                    if (dragonBones.DragonBones.webAssembly) {
                        timeline.frameIndicesOffset = frameIndices.size();
                        //(frameIndices as any).resize(timeline.frameIndicesOffset + totalFrameCount);
                        for (var j = 0; j < totalFrameCount; ++j) {
                            frameIndices.push_back(0);
                        }
                    }
                    else {
                        timeline.frameIndicesOffset = frameIndices.length;
                        frameIndices.length += totalFrameCount;
                    }
                    for (var i = 0, iK = 0, frameStart = 0, frameCount = 0; i < totalFrameCount; ++i) {
                        if (frameStart + frameCount <= i && iK < keyFrameCount) {
                            var frame = this._actionFrames[iK];
                            frameStart = frame.frameStart;
                            if (iK === keyFrameCount - 1) {
                                frameCount = this._animation.frameCount - frameStart;
                            }
                            else {
                                frameCount = this._actionFrames[iK + 1].frameStart - frameStart;
                            }
                            timelineArray[timeline.offset + 5 /* TimelineFrameOffset */ + iK] = this._parseCacheActionFrame(frame) - this._animation.frameOffset;
                            iK++;
                        }
                        if (dragonBones.DragonBones.webAssembly) {
                            frameIndices.set(timeline.frameIndicesOffset + i, iK - 1);
                        }
                        else {
                            frameIndices[timeline.frameIndicesOffset + i] = iK - 1;
                        }
                    }
                }
                this._timeline = null; //
                this._actionFrames.length = 0;
            }
            this._animation = null; //
            return animation;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseTimeline = function (rawData, type, addIntOffset, addFloatOffset, frameValueCount, frameParser) {
            if (!(ObjectDataParser.FRAME in rawData)) {
                return null;
            }
            var rawFrames = rawData[ObjectDataParser.FRAME];
            var keyFrameCount = rawFrames.length;
            if (keyFrameCount === 0) {
                return null;
            }
            var timelineArray = dragonBones.DragonBones.webAssembly ? this._timelineArrayJson : this._data.timelineArray;
            var frameIntArrayLength = dragonBones.DragonBones.webAssembly ? this._frameIntArrayJson.length : this._data.frameIntArray.length;
            var frameFloatArrayLength = dragonBones.DragonBones.webAssembly ? this._frameFloatArrayJson.length : this._data.frameFloatArray.length;
            // const timeline = BaseObject.borrowObject(TimelineData);
            var timeline = dragonBones.DragonBones.webAssembly ? new Module["TimelineData"]() : dragonBones.BaseObject.borrowObject(dragonBones.TimelineData);
            timeline.type = type;
            timeline.offset = timelineArray.length;
            timelineArray.length += 1 + 1 + 1 + 1 + 1 + keyFrameCount;
            timelineArray[timeline.offset + 0 /* TimelineScale */] = Math.round(ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE, 1.0) * 100);
            timelineArray[timeline.offset + 1 /* TimelineOffset */] = Math.round(ObjectDataParser._getNumber(rawData, ObjectDataParser.OFFSET, 0.0) * 100);
            timelineArray[timeline.offset + 2 /* TimelineKeyFrameCount */] = keyFrameCount;
            timelineArray[timeline.offset + 3 /* TimelineFrameValueCount */] = frameValueCount;
            if (addIntOffset) {
                timelineArray[timeline.offset + 4 /* TimelineFrameValueOffset */] = frameIntArrayLength - this._animation.frameIntOffset;
            }
            else if (addFloatOffset) {
                timelineArray[timeline.offset + 4 /* TimelineFrameValueOffset */] = frameFloatArrayLength - this._animation.frameFloatOffset;
            }
            else {
                timelineArray[timeline.offset + 4 /* TimelineFrameValueOffset */] = 0;
            }
            this._timeline = timeline;
            if (keyFrameCount === 1) {
                timeline.frameIndicesOffset = -1;
                timelineArray[timeline.offset + 5 /* TimelineFrameOffset */ + 0] = frameParser.call(this, rawFrames[0], 0, 0) - this._animation.frameOffset;
            }
            else {
                var frameIndices = this._data.frameIndices;
                var totalFrameCount = this._animation.frameCount + 1; // One more frame than animation.
                if (dragonBones.DragonBones.webAssembly) {
                    timeline.frameIndicesOffset = frameIndices.size();
                    // frameIndices.resize( frameIndices.size() + totalFrameCount);
                    for (var j = 0; j < totalFrameCount; ++j) {
                        frameIndices.push_back(0);
                    }
                }
                else {
                    timeline.frameIndicesOffset = frameIndices.length;
                    frameIndices.length += totalFrameCount;
                }
                for (var i = 0, iK = 0, frameStart = 0, frameCount = 0; i < totalFrameCount; ++i) {
                    if (frameStart + frameCount <= i && iK < keyFrameCount) {
                        var rawFrame = rawFrames[iK];
                        frameStart = i;
                        frameCount = ObjectDataParser._getNumber(rawFrame, ObjectDataParser.DURATION, 1);
                        if (iK === keyFrameCount - 1) {
                            frameCount = this._animation.frameCount - frameStart;
                        }
                        timelineArray[timeline.offset + 5 /* TimelineFrameOffset */ + iK] = frameParser.call(this, rawFrame, frameStart, frameCount) - this._animation.frameOffset;
                        iK++;
                    }
                    if (dragonBones.DragonBones.webAssembly) {
                        frameIndices.set(timeline.frameIndicesOffset + i, iK - 1);
                    }
                    else {
                        frameIndices[timeline.frameIndicesOffset + i] = iK - 1;
                    }
                }
            }
            this._timeline = null; //
            return timeline;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseBoneTimeline = function (rawData) {
            var bone = this._armature.getBone(ObjectDataParser._getString(rawData, ObjectDataParser.NAME, ""));
            if (bone === null) {
                return;
            }
            this._bone = bone;
            this._slot = this._armature.getSlot(this._bone.name);
            var timeline = this._parseTimeline(rawData, 10 /* BoneAll */, false, true, 6, this._parseBoneFrame);
            if (timeline !== null) {
                this._animation.addBoneTimeline(bone, timeline);
            }
            this._bone = null; //
            this._slot = null; //
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseSlotTimeline = function (rawData) {
            var slot = this._armature.getSlot(ObjectDataParser._getString(rawData, ObjectDataParser.NAME, ""));
            if (slot === null) {
                return;
            }
            this._slot = slot;
            var displayIndexTimeline = this._parseTimeline(rawData, 20 /* SlotDisplay */, false, false, 0, this._parseSlotDisplayIndexFrame);
            if (displayIndexTimeline !== null) {
                this._animation.addSlotTimeline(slot, displayIndexTimeline);
            }
            var colorTimeline = this._parseTimeline(rawData, 21 /* SlotColor */, true, false, 1, this._parseSlotColorFrame);
            if (colorTimeline !== null) {
                this._animation.addSlotTimeline(slot, colorTimeline);
            }
            this._slot = null; //
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseFrame = function (rawData, frameStart, frameCount, frameArray) {
            rawData;
            frameCount;
            var frameOffset = frameArray.length;
            frameArray.length += 1;
            frameArray[frameOffset + 0 /* FramePosition */] = frameStart;
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseTweenFrame = function (rawData, frameStart, frameCount, frameArray) {
            var frameOffset = this._parseFrame(rawData, frameStart, frameCount, frameArray);
            if (frameCount > 0) {
                if (ObjectDataParser.CURVE in rawData) {
                    var sampleCount = frameCount + 1;
                    this._helpArray.length = sampleCount;
                    this._samplingEasingCurve(rawData[ObjectDataParser.CURVE], this._helpArray);
                    frameArray.length += 1 + 1 + this._helpArray.length;
                    frameArray[frameOffset + 1 /* FrameTweenType */] = 2 /* Curve */;
                    frameArray[frameOffset + 2 /* FrameTweenEasingOrCurveSampleCount */] = sampleCount;
                    for (var i = 0; i < sampleCount; ++i) {
                        frameArray[frameOffset + 3 /* FrameCurveSamples */ + i] = Math.round(this._helpArray[i] * 10000.0);
                    }
                }
                else {
                    var noTween = -2.0;
                    var tweenEasing = noTween;
                    if (ObjectDataParser.TWEEN_EASING in rawData) {
                        tweenEasing = ObjectDataParser._getNumber(rawData, ObjectDataParser.TWEEN_EASING, noTween);
                    }
                    if (tweenEasing === noTween) {
                        frameArray.length += 1;
                        frameArray[frameOffset + 1 /* FrameTweenType */] = 0 /* None */;
                    }
                    else if (tweenEasing === 0.0) {
                        frameArray.length += 1;
                        frameArray[frameOffset + 1 /* FrameTweenType */] = 1 /* Line */;
                    }
                    else if (tweenEasing < 0.0) {
                        frameArray.length += 1 + 1;
                        frameArray[frameOffset + 1 /* FrameTweenType */] = 3 /* QuadIn */;
                        frameArray[frameOffset + 2 /* FrameTweenEasingOrCurveSampleCount */] = Math.round(-tweenEasing * 100.0);
                    }
                    else if (tweenEasing <= 1.0) {
                        frameArray.length += 1 + 1;
                        frameArray[frameOffset + 1 /* FrameTweenType */] = 4 /* QuadOut */;
                        frameArray[frameOffset + 2 /* FrameTweenEasingOrCurveSampleCount */] = Math.round(tweenEasing * 100.0);
                    }
                    else {
                        frameArray.length += 1 + 1;
                        frameArray[frameOffset + 1 /* FrameTweenType */] = 5 /* QuadInOut */;
                        frameArray[frameOffset + 2 /* FrameTweenEasingOrCurveSampleCount */] = Math.round(tweenEasing * 100.0 - 100.0);
                    }
                }
            }
            else {
                frameArray.length += 1;
                frameArray[frameOffset + 1 /* FrameTweenType */] = 0 /* None */;
            }
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseZOrderFrame = function (rawData, frameStart, frameCount) {
            var frameArray = dragonBones.DragonBones.webAssembly ? this._frameArrayJson : this._data.frameArray;
            var frameOffset = this._parseFrame(rawData, frameStart, frameCount, frameArray);
            if (ObjectDataParser.Z_ORDER in rawData) {
                var rawZOrder = rawData[ObjectDataParser.Z_ORDER];
                if (rawZOrder.length > 0) {
                    var slotCount = this._armature.sortedSlots.length;
                    var unchanged = new Array(slotCount - rawZOrder.length / 2);
                    var zOrders = new Array(slotCount);
                    for (var i_1 = 0; i_1 < slotCount; ++i_1) {
                        zOrders[i_1] = -1;
                    }
                    var originalIndex = 0;
                    var unchangedIndex = 0;
                    for (var i_2 = 0, l = rawZOrder.length; i_2 < l; i_2 += 2) {
                        var slotIndex = rawZOrder[i_2];
                        var zOrderOffset = rawZOrder[i_2 + 1];
                        while (originalIndex !== slotIndex) {
                            unchanged[unchangedIndex++] = originalIndex++;
                        }
                        zOrders[originalIndex + zOrderOffset] = originalIndex++;
                    }
                    while (originalIndex < slotCount) {
                        unchanged[unchangedIndex++] = originalIndex++;
                    }
                    frameArray.length += 1 + slotCount;
                    frameArray[frameOffset + 1] = slotCount;
                    var i = slotCount;
                    while (i--) {
                        if (zOrders[i] === -1) {
                            frameArray[frameOffset + 2 + i] = unchanged[--unchangedIndex];
                        }
                        else {
                            frameArray[frameOffset + 2 + i] = zOrders[i];
                        }
                    }
                    return frameOffset;
                }
            }
            frameArray.length += 1;
            frameArray[frameOffset + 1] = 0;
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseBoneFrame = function (rawData, frameStart, frameCount) {
            var frameFloatArray = dragonBones.DragonBones.webAssembly ? this._frameFloatArrayJson : this._data.frameFloatArray;
            var frameArray = dragonBones.DragonBones.webAssembly ? this._frameArrayJson : this._data.frameArray;
            var frameOffset = this._parseTweenFrame(rawData, frameStart, frameCount, frameArray);
            this._helpTransform.identity();
            if (ObjectDataParser.TRANSFORM in rawData) {
                this._parseTransform(rawData[ObjectDataParser.TRANSFORM], this._helpTransform, 1.0);
            }
            // Modify rotation.
            var rotation = this._helpTransform.rotation;
            if (frameStart !== 0) {
                if (this._prevTweenRotate === 0) {
                    rotation = this._prevRotation + dragonBones.Transform.normalizeRadian(rotation - this._prevRotation);
                }
                else {
                    if (this._prevTweenRotate > 0 ? rotation >= this._prevRotation : rotation <= this._prevRotation) {
                        this._prevTweenRotate = this._prevTweenRotate > 0 ? this._prevTweenRotate - 1 : this._prevTweenRotate + 1;
                    }
                    rotation = this._prevRotation + rotation - this._prevRotation + dragonBones.Transform.PI_D * this._prevTweenRotate;
                }
            }
            this._prevTweenRotate = ObjectDataParser._getNumber(rawData, ObjectDataParser.TWEEN_ROTATE, 0.0);
            this._prevRotation = rotation;
            var frameFloatOffset = frameFloatArray.length;
            frameFloatArray.length += 6;
            frameFloatArray[frameFloatOffset++] = this._helpTransform.x;
            frameFloatArray[frameFloatOffset++] = this._helpTransform.y;
            frameFloatArray[frameFloatOffset++] = rotation;
            frameFloatArray[frameFloatOffset++] = this._helpTransform.skew;
            frameFloatArray[frameFloatOffset++] = this._helpTransform.scaleX;
            frameFloatArray[frameFloatOffset++] = this._helpTransform.scaleY;
            this._parseActionDataInFrame(rawData, frameStart, this._bone, this._slot);
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseSlotDisplayIndexFrame = function (rawData, frameStart, frameCount) {
            var frameArray = dragonBones.DragonBones.webAssembly ? this._frameArrayJson : this._data.frameArray;
            var frameOffset = this._parseFrame(rawData, frameStart, frameCount, frameArray);
            frameArray.length += 1;
            frameArray[frameOffset + 1] = ObjectDataParser._getNumber(rawData, ObjectDataParser.DISPLAY_INDEX, 0);
            this._parseActionDataInFrame(rawData, frameStart, this._slot.parent, this._slot);
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseSlotColorFrame = function (rawData, frameStart, frameCount) {
            var intArray = dragonBones.DragonBones.webAssembly ? this._intArrayJson : this._data.intArray;
            var frameIntArray = dragonBones.DragonBones.webAssembly ? this._frameIntArrayJson : this._data.frameIntArray;
            var frameArray = dragonBones.DragonBones.webAssembly ? this._frameArrayJson : this._data.frameArray;
            var frameOffset = this._parseTweenFrame(rawData, frameStart, frameCount, frameArray);
            var colorOffset = -1;
            if (ObjectDataParser.COLOR in rawData) {
                var rawColor = rawData[ObjectDataParser.COLOR];
                for (var k in rawColor) {
                    k;
                    this._parseColorTransform(rawColor, this._helpColorTransform);
                    colorOffset = intArray.length;
                    intArray.length += 8;
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.alphaMultiplier * 100);
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.redMultiplier * 100);
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.greenMultiplier * 100);
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.blueMultiplier * 100);
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.alphaOffset);
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.redOffset);
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.greenOffset);
                    intArray[colorOffset++] = Math.round(this._helpColorTransform.blueOffset);
                    colorOffset -= 8;
                    break;
                }
            }
            if (colorOffset < 0) {
                if (this._defalultColorOffset < 0) {
                    this._defalultColorOffset = colorOffset = intArray.length;
                    intArray.length += 8;
                    intArray[colorOffset++] = 100;
                    intArray[colorOffset++] = 100;
                    intArray[colorOffset++] = 100;
                    intArray[colorOffset++] = 100;
                    intArray[colorOffset++] = 0;
                    intArray[colorOffset++] = 0;
                    intArray[colorOffset++] = 0;
                    intArray[colorOffset++] = 0;
                }
                colorOffset = this._defalultColorOffset;
            }
            var frameIntOffset = frameIntArray.length;
            frameIntArray.length += 1;
            frameIntArray[frameIntOffset] = colorOffset;
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseSlotFFDFrame = function (rawData, frameStart, frameCount) {
            var intArray = dragonBones.DragonBones.webAssembly ? this._intArrayJson : this._data.intArray;
            var frameFloatArray = dragonBones.DragonBones.webAssembly ? this._frameFloatArrayJson : this._data.frameFloatArray;
            var frameArray = dragonBones.DragonBones.webAssembly ? this._frameArrayJson : this._data.frameArray;
            var frameFloatOffset = frameFloatArray.length;
            var frameOffset = this._parseTweenFrame(rawData, frameStart, frameCount, frameArray);
            var rawVertices = ObjectDataParser.VERTICES in rawData ? rawData[ObjectDataParser.VERTICES] : null;
            var offset = ObjectDataParser._getNumber(rawData, ObjectDataParser.OFFSET, 0); // uint
            var vertexCount = intArray[this._mesh.offset + 0 /* MeshVertexCount */];
            var x = 0.0;
            var y = 0.0;
            var iB = 0;
            var iV = 0;
            if (this._mesh.weight !== null) {
                var rawSlotPose = this._weightSlotPose[this._mesh.name];
                this._helpMatrixA.copyFromArray(rawSlotPose, 0);
                frameFloatArray.length += this._mesh.weight.count * 2;
                iB = this._mesh.weight.offset + 2 /* WeigthBoneIndices */ + this._mesh.weight.bones.length;
            }
            else {
                frameFloatArray.length += vertexCount * 2;
            }
            for (var i = 0; i < vertexCount * 2; i += 2) {
                if (rawVertices === null) {
                    x = 0.0;
                    y = 0.0;
                }
                else {
                    if (i < offset || i - offset >= rawVertices.length) {
                        x = 0.0;
                    }
                    else {
                        x = rawVertices[i - offset];
                    }
                    if (i + 1 < offset || i + 1 - offset >= rawVertices.length) {
                        y = 0.0;
                    }
                    else {
                        y = rawVertices[i + 1 - offset];
                    }
                }
                if (this._mesh.weight !== null) {
                    var rawBonePoses = this._weightBonePoses[this._mesh.name];
                    var weightBoneIndices = this._weightBoneIndices[this._mesh.name];
                    var vertexBoneCount = intArray[iB++];
                    this._helpMatrixA.transformPoint(x, y, this._helpPoint, true);
                    x = this._helpPoint.x;
                    y = this._helpPoint.y;
                    for (var j = 0; j < vertexBoneCount; ++j) {
                        var boneIndex = intArray[iB++];
                        var bone = this._mesh.weight.bones[boneIndex];
                        var rawBoneIndex = this._rawBones.indexOf(bone);
                        this._helpMatrixB.copyFromArray(rawBonePoses, weightBoneIndices.indexOf(rawBoneIndex) * 7 + 1);
                        this._helpMatrixB.invert();
                        this._helpMatrixB.transformPoint(x, y, this._helpPoint, true);
                        frameFloatArray[frameFloatOffset + iV++] = this._helpPoint.x;
                        frameFloatArray[frameFloatOffset + iV++] = this._helpPoint.y;
                    }
                }
                else {
                    frameFloatArray[frameFloatOffset + i] = x;
                    frameFloatArray[frameFloatOffset + i + 1] = y;
                }
            }
            if (frameStart === 0) {
                var frameIntArray = dragonBones.DragonBones.webAssembly ? this._frameIntArrayJson : this._data.frameIntArray;
                var timelineArray = dragonBones.DragonBones.webAssembly ? this._timelineArrayJson : this._data.timelineArray;
                var frameIntOffset = frameIntArray.length;
                frameIntArray.length += 1 + 1 + 1 + 1 + 1;
                frameIntArray[frameIntOffset + 0 /* FFDTimelineMeshOffset */] = this._mesh.offset;
                frameIntArray[frameIntOffset + 1 /* FFDTimelineFFDCount */] = frameFloatArray.length - frameFloatOffset;
                frameIntArray[frameIntOffset + 2 /* FFDTimelineValueCount */] = frameFloatArray.length - frameFloatOffset;
                frameIntArray[frameIntOffset + 3 /* FFDTimelineValueOffset */] = 0;
                frameIntArray[frameIntOffset + 4 /* FFDTimelineFloatOffset */] = frameFloatOffset;
                timelineArray[this._timeline.offset + 3 /* TimelineFrameValueCount */] = frameIntOffset - this._animation.frameIntOffset;
            }
            return frameOffset;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseActionData = function (rawData, actions, type, bone, slot) {
            var actionCount = 0;
            if (typeof rawData === "string") {
                // const action = BaseObject.borrowObject(ActionData);
                var action = dragonBones.DragonBones.webAssembly ? new Module["ActionData"]() : dragonBones.BaseObject.borrowObject(dragonBones.ActionData);
                action.type = type;
                action.name = rawData;
                action.bone = bone;
                action.slot = slot;
                dragonBones.DragonBones.webAssembly ? actions.push_back(action) : actions.push(action);
                actionCount++;
            }
            else if (rawData instanceof Array) {
                for (var _i = 0, rawData_1 = rawData; _i < rawData_1.length; _i++) {
                    var rawAction = rawData_1[_i];
                    // const action = BaseObject.borrowObject(ActionData);
                    var action = dragonBones.DragonBones.webAssembly ? new Module["ActionData"]() : dragonBones.BaseObject.borrowObject(dragonBones.ActionData);
                    if (ObjectDataParser.GOTO_AND_PLAY in rawAction) {
                        action.type = 0 /* Play */;
                        action.name = ObjectDataParser._getString(rawAction, ObjectDataParser.GOTO_AND_PLAY, "");
                    }
                    else {
                        if (ObjectDataParser.TYPE in rawAction && typeof rawAction[ObjectDataParser.TYPE] === "string") {
                            action.type = ObjectDataParser._getActionType(rawAction[ObjectDataParser.TYPE]);
                        }
                        else {
                            action.type = ObjectDataParser._getNumber(rawAction, ObjectDataParser.TYPE, type);
                        }
                        action.name = ObjectDataParser._getString(rawAction, ObjectDataParser.NAME, "");
                    }
                    if (ObjectDataParser.BONE in rawAction) {
                        var boneName = ObjectDataParser._getString(rawAction, ObjectDataParser.BONE, "");
                        action.bone = this._armature.getBone(boneName);
                    }
                    else {
                        action.bone = bone;
                    }
                    if (ObjectDataParser.SLOT in rawAction) {
                        var slotName = ObjectDataParser._getString(rawAction, ObjectDataParser.SLOT, "");
                        action.slot = this._armature.getSlot(slotName);
                    }
                    else {
                        action.slot = slot;
                    }
                    if (ObjectDataParser.INTS in rawAction) {
                        if (action.data === null) {
                            // action.data = BaseObject.borrowObject(UserData);
                            action.data = dragonBones.DragonBones.webAssembly ? new Module["UserData"]() : dragonBones.BaseObject.borrowObject(dragonBones.UserData);
                        }
                        var rawInts = rawAction[ObjectDataParser.INTS];
                        for (var _a = 0, rawInts_1 = rawInts; _a < rawInts_1.length; _a++) {
                            var rawValue = rawInts_1[_a];
                            dragonBones.DragonBones.webAssembly ? action.data.ints.push_back(rawValue) : action.data.ints.push(rawValue);
                        }
                    }
                    if (ObjectDataParser.FLOATS in rawAction) {
                        if (action.data === null) {
                            // action.data = BaseObject.borrowObject(UserData);
                            action.data = dragonBones.DragonBones.webAssembly ? new Module["UserData"]() : dragonBones.BaseObject.borrowObject(dragonBones.UserData);
                        }
                        var rawFloats = rawAction[ObjectDataParser.FLOATS];
                        for (var _b = 0, rawFloats_1 = rawFloats; _b < rawFloats_1.length; _b++) {
                            var rawValue = rawFloats_1[_b];
                            dragonBones.DragonBones.webAssembly ? action.data.floats.push_back(rawValue) : action.data.floats.push(rawValue);
                        }
                    }
                    if (ObjectDataParser.STRINGS in rawAction) {
                        if (action.data === null) {
                            // action.data = BaseObject.borrowObject(UserData);
                            action.data = dragonBones.DragonBones.webAssembly ? new Module["UserData"]() : dragonBones.BaseObject.borrowObject(dragonBones.UserData);
                        }
                        var rawStrings = rawAction[ObjectDataParser.STRINGS];
                        for (var _c = 0, rawStrings_1 = rawStrings; _c < rawStrings_1.length; _c++) {
                            var rawValue = rawStrings_1[_c];
                            dragonBones.DragonBones.webAssembly ? action.data.strings.push_back(rawValue) : action.data.strings.push(rawValue);
                        }
                    }
                    dragonBones.DragonBones.webAssembly ? actions.push_back(action) : actions.push(action);
                    actionCount++;
                }
            }
            return actionCount;
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseTransform = function (rawData, transform, scale) {
            transform.x = ObjectDataParser._getNumber(rawData, ObjectDataParser.X, 0.0) * scale;
            transform.y = ObjectDataParser._getNumber(rawData, ObjectDataParser.Y, 0.0) * scale;
            if (ObjectDataParser.ROTATE in rawData || ObjectDataParser.SKEW in rawData) {
                transform.rotation = dragonBones.Transform.normalizeRadian(ObjectDataParser._getNumber(rawData, ObjectDataParser.ROTATE, 0.0) * dragonBones.Transform.DEG_RAD);
                transform.skew = dragonBones.Transform.normalizeRadian(ObjectDataParser._getNumber(rawData, ObjectDataParser.SKEW, 0.0) * dragonBones.Transform.DEG_RAD);
            }
            else if (ObjectDataParser.SKEW_X in rawData || ObjectDataParser.SKEW_Y in rawData) {
                transform.rotation = dragonBones.Transform.normalizeRadian(ObjectDataParser._getNumber(rawData, ObjectDataParser.SKEW_Y, 0.0) * dragonBones.Transform.DEG_RAD);
                transform.skew = dragonBones.Transform.normalizeRadian(ObjectDataParser._getNumber(rawData, ObjectDataParser.SKEW_X, 0.0) * dragonBones.Transform.DEG_RAD) - transform.rotation;
            }
            transform.scaleX = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE_X, 1.0);
            transform.scaleY = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE_Y, 1.0);
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseColorTransform = function (rawData, color) {
            color.alphaMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.ALPHA_MULTIPLIER, 100) * 0.01;
            color.redMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.RED_MULTIPLIER, 100) * 0.01;
            color.greenMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.GREEN_MULTIPLIER, 100) * 0.01;
            color.blueMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.BLUE_MULTIPLIER, 100) * 0.01;
            color.alphaOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.ALPHA_OFFSET, 0);
            color.redOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.RED_OFFSET, 0);
            color.greenOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.GREEN_OFFSET, 0);
            color.blueOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.BLUE_OFFSET, 0);
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseArray = function (rawData) {
            rawData;
            if (dragonBones.DragonBones.webAssembly) {
                return;
            }
            this._data.intArray = [];
            this._data.floatArray = [];
            this._data.frameIntArray = [];
            this._data.frameFloatArray = [];
            this._data.frameArray = [];
            this._data.timelineArray = [];
        };
        /**
         * @private
         */
        ObjectDataParser.prototype._parseWASMArray = function () {
            var intArrayBuf = Module._malloc(this._intArrayJson.length * 2);
            this._intArrayBuffer = new Int16Array(Module.HEAP16.buffer, intArrayBuf, this._intArrayJson.length);
            // Module.HEAP16.set(tmpIntArray, intArrayBuf);
            for (var i1 = 0; i1 < this._intArrayJson.length; ++i1) {
                this._intArrayBuffer[i1] = this._intArrayJson[i1];
            }
            var floatArrayBuf = Module._malloc(this._floatArrayJson.length * 4);
            // Module.HEAPF32.set(this._floatArrayJson, floatArrayBuf);
            this._floatArrayBuffer = new Float32Array(Module.HEAPF32.buffer, floatArrayBuf, this._floatArrayJson.length);
            for (var i2 = 0; i2 < this._floatArrayJson.length; ++i2) {
                this._floatArrayBuffer[i2] = this._floatArrayJson[i2];
            }
            var frameIntArrayBuf = Module._malloc(this._frameIntArrayJson.length * 2);
            // Module.HEAP16.set(this._frameIntArrayJson, frameIntArrayBuf);
            this._frameIntArrayBuffer = new Int16Array(Module.HEAP16.buffer, frameIntArrayBuf, this._frameIntArrayJson.length);
            for (var i3 = 0; i3 < this._frameIntArrayJson.length; ++i3) {
                this._frameIntArrayBuffer[i3] = this._frameIntArrayJson[i3];
            }
            var frameFloatArrayBuf = Module._malloc(this._frameFloatArrayJson.length * 4);
            // Module.HEAPF32.set(this._frameFloatArrayJson, frameFloatArrayBuf);
            this._frameFloatArrayBuffer = new Float32Array(Module.HEAPF32.buffer, frameFloatArrayBuf, this._frameFloatArrayJson.length);
            for (var i4 = 0; i4 < this._frameFloatArrayJson.length; ++i4) {
                this._frameFloatArrayBuffer[i4] = this._frameFloatArrayJson[i4];
            }
            var frameArrayBuf = Module._malloc(this._frameArrayJson.length * 2);
            // Module.HEAP16.set(this._frameArrayJson, frameArrayBuf);
            this._frameArrayBuffer = new Int16Array(Module.HEAP16.buffer, frameArrayBuf, this._frameArrayJson.length);
            for (var i5 = 0; i5 < this._frameArrayJson.length; ++i5) {
                this._frameArrayBuffer[i5] = this._frameArrayJson[i5];
            }
            var timelineArrayBuf = Module._malloc(this._timelineArrayJson.length * 2);
            // Module.HEAPU16.set(this._timelineArrayJson, timelineArrayBuf);
            this._timelineArrayBuffer = new Uint16Array(Module.HEAPU16.buffer, timelineArrayBuf, this._timelineArrayJson.length);
            for (var i6 = 0; i6 < this._timelineArrayJson.length; ++i6) {
                this._timelineArrayBuffer[i6] = this._timelineArrayJson[i6];
            }
            Module['DragonBonesData'].setDragonBoneData(this._data);
            Module.ccall('set_dbData_buffer_ptr', 'number', ['number', 'number', 'number', 'number', 'number', 'number'], [intArrayBuf, floatArrayBuf, frameIntArrayBuf, frameFloatArrayBuf, frameArrayBuf, timelineArrayBuf]);
        };
        /**
         * @inheritDoc
         */
        ObjectDataParser.prototype.parseDragonBonesData = function (rawData, scale) {
            if (scale === void 0) { scale = 1; }
            console.assert(rawData !== null && rawData !== undefined);
            var version = ObjectDataParser._getString(rawData, ObjectDataParser.VERSION, "");
            var compatibleVersion = ObjectDataParser._getString(rawData, ObjectDataParser.COMPATIBLE_VERSION, "");
            if (ObjectDataParser.DATA_VERSIONS.indexOf(version) >= 0 ||
                ObjectDataParser.DATA_VERSIONS.indexOf(compatibleVersion) >= 0) {
                // const data = BaseObject.borrowObject(DragonBonesData);
                var data = dragonBones.DragonBones.webAssembly ? new Module["DragonBonesData"]() : dragonBones.BaseObject.borrowObject(dragonBones.DragonBonesData);
                data.version = version;
                data.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "");
                data.frameRate = ObjectDataParser._getNumber(rawData, ObjectDataParser.FRAME_RATE, 24);
                if (data.frameRate === 0) {
                    data.frameRate = 24;
                }
                if (ObjectDataParser.ARMATURE in rawData) {
                    this._defalultColorOffset = -1;
                    this._data = data;
                    this._parseArray(rawData);
                    var rawArmatures = rawData[ObjectDataParser.ARMATURE];
                    for (var _i = 0, rawArmatures_1 = rawArmatures; _i < rawArmatures_1.length; _i++) {
                        var rawArmature = rawArmatures_1[_i];
                        data.addArmature(this._parseArmature(rawArmature, scale));
                    }
                    if (this._intArrayJson.length > 0) {
                        this._parseWASMArray();
                    }
                    this._data = null;
                }
                this._rawTextureAtlasIndex = 0;
                if (ObjectDataParser.TEXTURE_ATLAS in rawData) {
                    this._rawTextureAtlases = rawData[ObjectDataParser.TEXTURE_ATLAS];
                }
                else {
                    this._rawTextureAtlases = null;
                }
                return data;
            }
            else {
                console.assert(false, "Nonsupport data version.");
            }
            return null;
        };
        /**
         * @inheritDoc
         */
        ObjectDataParser.prototype.parseTextureAtlasData = function (rawData, textureAtlasData, scale) {
            if (scale === void 0) { scale = 0.0; }
            console.assert(rawData !== undefined);
            if (rawData === null) {
                if (this._rawTextureAtlases === null) {
                    return false;
                }
                var rawTextureAtlas = this._rawTextureAtlases[this._rawTextureAtlasIndex++];
                this.parseTextureAtlasData(rawTextureAtlas, textureAtlasData, scale);
                if (this._rawTextureAtlasIndex >= this._rawTextureAtlases.length) {
                    this._rawTextureAtlasIndex = 0;
                    this._rawTextureAtlases = null;
                }
                return true;
            }
            // Texture format.
            textureAtlasData.width = ObjectDataParser._getNumber(rawData, ObjectDataParser.WIDTH, 0);
            textureAtlasData.height = ObjectDataParser._getNumber(rawData, ObjectDataParser.HEIGHT, 0);
            textureAtlasData.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "");
            textureAtlasData.imagePath = ObjectDataParser._getString(rawData, ObjectDataParser.IMAGE_PATH, "");
            if (scale > 0.0) {
                textureAtlasData.scale = scale;
            }
            else {
                scale = textureAtlasData.scale = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE, textureAtlasData.scale);
            }
            scale = 1.0 / scale; //
            if (ObjectDataParser.SUB_TEXTURE in rawData) {
                var rawTextures = rawData[ObjectDataParser.SUB_TEXTURE];
                for (var i = 0, l = rawTextures.length; i < l; ++i) {
                    var rawTexture = rawTextures[i];
                    var textureData = textureAtlasData.createTexture();
                    textureData.rotated = ObjectDataParser._getBoolean(rawTexture, ObjectDataParser.ROTATED, false);
                    textureData.name = ObjectDataParser._getString(rawTexture, ObjectDataParser.NAME, "");
                    textureData.region.x = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.X, 0.0) * scale;
                    textureData.region.y = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.Y, 0.0) * scale;
                    textureData.region.width = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.WIDTH, 0.0) * scale;
                    textureData.region.height = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.HEIGHT, 0.0) * scale;
                    var frameWidth = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.FRAME_WIDTH, -1.0);
                    var frameHeight = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.FRAME_HEIGHT, -1.0);
                    if (frameWidth > 0.0 && frameHeight > 0.0) {
                        textureData.frame = dragonBones.DragonBones.webAssembly ? Module["TextureData"].createRectangle() : dragonBones.TextureData.createRectangle();
                        textureData.frame.x = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.FRAME_X, 0.0) * scale;
                        textureData.frame.y = ObjectDataParser._getNumber(rawTexture, ObjectDataParser.FRAME_Y, 0.0) * scale;
                        textureData.frame.width = frameWidth * scale;
                        textureData.frame.height = frameHeight * scale;
                    }
                    textureAtlasData.addTexture(textureData);
                }
            }
            return true;
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.BaseFactory#parseDragonBonesData()
         */
        ObjectDataParser.getInstance = function () {
            if (ObjectDataParser._objectDataParserInstance === null) {
                ObjectDataParser._objectDataParserInstance = new ObjectDataParser();
            }
            return ObjectDataParser._objectDataParserInstance;
        };
        /**
         * @private
         */
        ObjectDataParser._objectDataParserInstance = null;
        return ObjectDataParser;
    }(dragonBones.DataParser));
    dragonBones.ObjectDataParser = ObjectDataParser;
    var ActionFrame = (function () {
        function ActionFrame() {
            this.frameStart = 0;
            this.actions = [];
        }
        return ActionFrame;
    }());
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var BinaryDataParser = (function (_super) {
        __extends(BinaryDataParser, _super);
        function BinaryDataParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BinaryDataParser.prototype._inRange = function (a, min, max) {
            return min <= a && a <= max;
        };
        BinaryDataParser.prototype._decodeUTF8 = function (data) {
            var EOF_byte = -1;
            var EOF_code_point = -1;
            var FATAL_POINT = 0xFFFD;
            var pos = 0;
            var result = "";
            var code_point;
            var utf8_code_point = 0;
            var utf8_bytes_needed = 0;
            var utf8_bytes_seen = 0;
            var utf8_lower_boundary = 0;
            while (data.length > pos) {
                var _byte = data[pos++];
                if (_byte === EOF_byte) {
                    if (utf8_bytes_needed !== 0) {
                        code_point = FATAL_POINT;
                    }
                    else {
                        code_point = EOF_code_point;
                    }
                }
                else {
                    if (utf8_bytes_needed === 0) {
                        if (this._inRange(_byte, 0x00, 0x7F)) {
                            code_point = _byte;
                        }
                        else {
                            if (this._inRange(_byte, 0xC2, 0xDF)) {
                                utf8_bytes_needed = 1;
                                utf8_lower_boundary = 0x80;
                                utf8_code_point = _byte - 0xC0;
                            }
                            else if (this._inRange(_byte, 0xE0, 0xEF)) {
                                utf8_bytes_needed = 2;
                                utf8_lower_boundary = 0x800;
                                utf8_code_point = _byte - 0xE0;
                            }
                            else if (this._inRange(_byte, 0xF0, 0xF4)) {
                                utf8_bytes_needed = 3;
                                utf8_lower_boundary = 0x10000;
                                utf8_code_point = _byte - 0xF0;
                            }
                            else {
                            }
                            utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                            code_point = null;
                        }
                    }
                    else if (!this._inRange(_byte, 0x80, 0xBF)) {
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        pos--;
                        code_point = _byte;
                    }
                    else {
                        utf8_bytes_seen += 1;
                        utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                        if (utf8_bytes_seen !== utf8_bytes_needed) {
                            code_point = null;
                        }
                        else {
                            var cp = utf8_code_point;
                            var lower_boundary = utf8_lower_boundary;
                            utf8_code_point = 0;
                            utf8_bytes_needed = 0;
                            utf8_bytes_seen = 0;
                            utf8_lower_boundary = 0;
                            if (this._inRange(cp, lower_boundary, 0x10FFFF) && !this._inRange(cp, 0xD800, 0xDFFF)) {
                                code_point = cp;
                            }
                            else {
                                code_point = _byte;
                            }
                        }
                    }
                }
                //Decode string
                if (code_point !== null && code_point !== EOF_code_point) {
                    if (code_point <= 0xFFFF) {
                        if (code_point > 0)
                            result += String.fromCharCode(code_point);
                    }
                    else {
                        code_point -= 0x10000;
                        result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                        result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                    }
                }
            }
            return result;
        };
        BinaryDataParser.prototype._getUTF16Key = function (value) {
            for (var i = 0, l = value.length; i < l; ++i) {
                if (value.charCodeAt(i) > 255) {
                    return encodeURI(value);
                }
            }
            return value;
        };
        BinaryDataParser.prototype._parseBinaryTimeline = function (type, offset, timelineData) {
            if (timelineData === void 0) { timelineData = null; }
            // const timeline = timelineData !== null ? timelineData : BaseObject.borrowObject(TimelineData);
            var timeline = timelineData !== null ? timelineData : (dragonBones.DragonBones.webAssembly ? new Module["TimelineData"]() : dragonBones.BaseObject.borrowObject(dragonBones.TimelineData));
            timeline.type = type;
            timeline.offset = offset;
            this._timeline = timeline;
            var keyFrameCount = this._timelineArray[timeline.offset + 2 /* TimelineKeyFrameCount */];
            if (keyFrameCount === 1) {
                timeline.frameIndicesOffset = -1;
            }
            else {
                var totalFrameCount = this._animation.frameCount + 1; // One more frame than animation.
                var frameIndices = this._data.frameIndices;
                if (dragonBones.DragonBones.webAssembly) {
                    timeline.frameIndicesOffset = frameIndices.size();
                    // (frameIndices as any).resize(timeline.frameIndicesOffset + totalFrameCount);
                    for (var j = 0; j < totalFrameCount; ++j) {
                        frameIndices.push_back(0);
                    }
                }
                else {
                    timeline.frameIndicesOffset = frameIndices.length;
                    frameIndices.length += totalFrameCount;
                }
                for (var i = 0, iK = 0, frameStart = 0, frameCount = 0; i < totalFrameCount; ++i) {
                    if (frameStart + frameCount <= i && iK < keyFrameCount) {
                        frameStart = this._frameArray[this._animation.frameOffset + this._timelineArray[timeline.offset + 5 /* TimelineFrameOffset */ + iK]];
                        if (iK === keyFrameCount - 1) {
                            frameCount = this._animation.frameCount - frameStart;
                        }
                        else {
                            frameCount = this._frameArray[this._animation.frameOffset + this._timelineArray[timeline.offset + 5 /* TimelineFrameOffset */ + iK + 1]] - frameStart;
                        }
                        iK++;
                    }
                    if (dragonBones.DragonBones.webAssembly) {
                        frameIndices.set(timeline.frameIndicesOffset + i, iK - 1);
                    }
                    else {
                        frameIndices[timeline.frameIndicesOffset + i] = iK - 1;
                    }
                }
            }
            this._timeline = null; //
            return timeline;
        };
        /**
         * @private
         */
        BinaryDataParser.prototype._parseMesh = function (rawData, mesh) {
            mesh.offset = rawData[dragonBones.ObjectDataParser.OFFSET];
            var weightOffset = this._intArray[mesh.offset + 3 /* MeshWeightOffset */];
            if (weightOffset >= 0) {
                // const weight = BaseObject.borrowObject(WeightData);
                var weight = dragonBones.DragonBones.webAssembly ? new Module["WeightData"]() : dragonBones.BaseObject.borrowObject(dragonBones.WeightData);
                var vertexCount = this._intArray[mesh.offset + 0 /* MeshVertexCount */];
                var boneCount = this._intArray[weightOffset + 0 /* WeigthBoneCount */];
                weight.offset = weightOffset;
                if (dragonBones.DragonBones.webAssembly) {
                    weight.bones.resize(boneCount, null);
                    for (var i = 0; i < boneCount; ++i) {
                        var boneIndex = this._intArray[weightOffset + 2 /* WeigthBoneIndices */ + i];
                        weight.bones.set(i, this._rawBones[boneIndex]);
                    }
                }
                else {
                    weight.bones.length = boneCount;
                    for (var i = 0; i < boneCount; ++i) {
                        var boneIndex = this._intArray[weightOffset + 2 /* WeigthBoneIndices */ + i];
                        weight.bones[i] = this._rawBones[boneIndex];
                    }
                }
                var boneIndicesOffset = weightOffset + 2 /* WeigthBoneIndices */ + boneCount;
                for (var i = 0, l = vertexCount; i < l; ++i) {
                    var vertexBoneCount = this._intArray[boneIndicesOffset++];
                    weight.count += vertexBoneCount;
                    boneIndicesOffset += vertexBoneCount;
                }
                mesh.weight = weight;
            }
        };
        /**
         * @private
         */
        BinaryDataParser.prototype._parsePolygonBoundingBox = function (rawData) {
            // const polygonBoundingBox = BaseObject.borrowObject(PolygonBoundingBoxData);
            var polygonBoundingBox = dragonBones.DragonBones.webAssembly ? new Module["PolygonBoundingBoxData"]() : dragonBones.BaseObject.borrowObject(dragonBones.PolygonBoundingBoxData);
            polygonBoundingBox.offset = rawData[dragonBones.ObjectDataParser.OFFSET];
            polygonBoundingBox.vertices = this._floatArray;
            return polygonBoundingBox;
        };
        /**
         * @private
         */
        BinaryDataParser.prototype._parseAnimation = function (rawData) {
            // const animation = BaseObject.borrowObject(AnimationData);
            var animation = dragonBones.DragonBones.webAssembly ? new Module["AnimationData"]() : dragonBones.BaseObject.borrowObject(dragonBones.AnimationData);
            animation.frameCount = Math.max(dragonBones.ObjectDataParser._getNumber(rawData, dragonBones.ObjectDataParser.DURATION, 1), 1);
            animation.playTimes = dragonBones.ObjectDataParser._getNumber(rawData, dragonBones.ObjectDataParser.PLAY_TIMES, 1);
            animation.duration = animation.frameCount / this._armature.frameRate;
            animation.fadeInTime = dragonBones.ObjectDataParser._getNumber(rawData, dragonBones.ObjectDataParser.FADE_IN_TIME, 0.0);
            animation.scale = dragonBones.ObjectDataParser._getNumber(rawData, dragonBones.ObjectDataParser.SCALE, 1.0);
            animation.name = dragonBones.ObjectDataParser._getString(rawData, dragonBones.ObjectDataParser.NAME, dragonBones.ObjectDataParser.DEFAULT_NAME);
            if (animation.name.length === 0) {
                animation.name = dragonBones.ObjectDataParser.DEFAULT_NAME;
            }
            // Offsets.
            var offsets = rawData[dragonBones.ObjectDataParser.OFFSET];
            animation.frameIntOffset = offsets[0];
            animation.frameFloatOffset = offsets[1];
            animation.frameOffset = offsets[2];
            this._animation = animation;
            if (dragonBones.ObjectDataParser.ACTION in rawData) {
                animation.actionTimeline = this._parseBinaryTimeline(0 /* Action */, rawData[dragonBones.ObjectDataParser.ACTION]);
            }
            if (dragonBones.ObjectDataParser.Z_ORDER in rawData) {
                animation.zOrderTimeline = this._parseBinaryTimeline(1 /* ZOrder */, rawData[dragonBones.ObjectDataParser.Z_ORDER]);
            }
            if (dragonBones.ObjectDataParser.BONE in rawData) {
                var rawTimeliness = rawData[dragonBones.ObjectDataParser.BONE];
                for (var k in rawTimeliness) {
                    var rawTimelines = rawTimeliness[k];
                    if (dragonBones.DragonBones.webAssembly) {
                        k = this._getUTF16Key(k);
                    }
                    var bone = this._armature.getBone(k);
                    if (bone === null) {
                        continue;
                    }
                    for (var i = 0, l = rawTimelines.length; i < l; i += 2) {
                        var timelineType = rawTimelines[i];
                        var timelineOffset = rawTimelines[i + 1];
                        var timeline = this._parseBinaryTimeline(timelineType, timelineOffset);
                        this._animation.addBoneTimeline(bone, timeline);
                    }
                }
            }
            if (dragonBones.ObjectDataParser.SLOT in rawData) {
                var rawTimeliness = rawData[dragonBones.ObjectDataParser.SLOT];
                for (var k in rawTimeliness) {
                    var rawTimelines = rawTimeliness[k];
                    if (dragonBones.DragonBones.webAssembly) {
                        k = this._getUTF16Key(k);
                    }
                    var slot = this._armature.getSlot(k);
                    if (slot === null) {
                        continue;
                    }
                    for (var i = 0, l = rawTimelines.length; i < l; i += 2) {
                        var timelineType = rawTimelines[i];
                        var timelineOffset = rawTimelines[i + 1];
                        var timeline = this._parseBinaryTimeline(timelineType, timelineOffset);
                        this._animation.addSlotTimeline(slot, timeline);
                    }
                }
            }
            this._animation = null;
            return animation;
        };
        /**
         * @private
         */
        BinaryDataParser.prototype._parseArray = function (rawData) {
            var offsets = rawData[dragonBones.ObjectDataParser.OFFSET];
            if (dragonBones.DragonBones.webAssembly) {
                var tmpIntArray = new Int16Array(this._binary, this._binaryOffset + offsets[0], offsets[1] / Int16Array.BYTES_PER_ELEMENT);
                var tmpFloatArray = new Float32Array(this._binary, this._binaryOffset + offsets[2], offsets[3] / Float32Array.BYTES_PER_ELEMENT);
                var tmpFrameIntArray = new Int16Array(this._binary, this._binaryOffset + offsets[4], offsets[5] / Int16Array.BYTES_PER_ELEMENT);
                var tmpFrameFloatArray = new Float32Array(this._binary, this._binaryOffset + offsets[6], offsets[7] / Float32Array.BYTES_PER_ELEMENT);
                var tmpFrameArray = new Int16Array(this._binary, this._binaryOffset + offsets[8], offsets[9] / Int16Array.BYTES_PER_ELEMENT);
                var tmpTimelineArray = new Uint16Array(this._binary, this._binaryOffset + offsets[10], offsets[11] / Uint16Array.BYTES_PER_ELEMENT);
                var intArrayBuf = Module._malloc(tmpIntArray.length * tmpIntArray.BYTES_PER_ELEMENT);
                var floatArrayBuf = Module._malloc(tmpFloatArray.length * tmpFloatArray.BYTES_PER_ELEMENT);
                var frameIntArrayBuf = Module._malloc(tmpFrameIntArray.length * tmpFrameIntArray.BYTES_PER_ELEMENT);
                var frameFloatArrayBuf = Module._malloc(tmpFrameFloatArray.length * tmpFrameFloatArray.BYTES_PER_ELEMENT);
                var frameArrayBuf = Module._malloc(tmpFrameArray.length * tmpFrameArray.BYTES_PER_ELEMENT);
                var timelineArrayBuf = Module._malloc(tmpTimelineArray.length * tmpTimelineArray.BYTES_PER_ELEMENT);
                this._intArray = new Int16Array(Module.HEAP16.buffer, intArrayBuf, tmpIntArray.length);
                this._floatArray = new Float32Array(Module.HEAPF32.buffer, floatArrayBuf, tmpFloatArray.length);
                this._frameIntArray = new Int16Array(Module.HEAP16.buffer, frameIntArrayBuf, tmpFrameIntArray.length);
                this._frameFloatArray = new Float32Array(Module.HEAPF32.buffer, frameFloatArrayBuf, tmpFrameFloatArray.length);
                this._frameArray = new Int16Array(Module.HEAP16.buffer, frameArrayBuf, tmpFrameArray.length);
                this._timelineArray = new Uint16Array(Module.HEAPU16.buffer, timelineArrayBuf, tmpTimelineArray.length);
                // Module.HEAP16.set(tmpIntArray, intArrayBuf);
                // Module.HEAPF32.set(tmpFloatArray, floatArrayBuf);
                // Module.HEAP16.set(tmpFrameIntArray, frameIntArrayBuf);
                // Module.HEAPF32.set(tmpFrameFloatArray, frameFloatArrayBuf);
                // Module.HEAP16.set(tmpFrameArray, frameArrayBuf);
                // Module.HEAPU16.set(tmpTimelineArray, timelineArrayBuf);
                for (var i1 = 0; i1 < tmpIntArray.length; ++i1) {
                    this._intArray[i1] = tmpIntArray[i1];
                }
                for (var i2 = 0; i2 < tmpFloatArray.length; ++i2) {
                    this._floatArray[i2] = tmpFloatArray[i2];
                }
                for (var i3 = 0; i3 < tmpFrameIntArray.length; ++i3) {
                    this._frameIntArray[i3] = tmpFrameIntArray[i3];
                }
                for (var i4 = 0; i4 < tmpFrameFloatArray.length; ++i4) {
                    this._frameFloatArray[i4] = tmpFrameFloatArray[i4];
                }
                for (var i5 = 0; i5 < tmpFrameArray.length; ++i5) {
                    this._frameArray[i5] = tmpFrameArray[i5];
                }
                for (var i6 = 0; i6 < tmpTimelineArray.length; ++i6) {
                    this._timelineArray[i6] = tmpTimelineArray[i6];
                }
                Module['DragonBonesData'].setDragonBoneData(this._data);
                Module.ccall('set_dbData_buffer_ptr', 'number', ['number', 'number', 'number', 'number', 'number', 'number'], [intArrayBuf, floatArrayBuf, frameIntArrayBuf, frameFloatArrayBuf, frameArrayBuf, timelineArrayBuf]);
            }
            else {
                this._data.intArray = this._intArray = new Int16Array(this._binary, this._binaryOffset + offsets[0], offsets[1] / Int16Array.BYTES_PER_ELEMENT);
                this._data.floatArray = this._floatArray = new Float32Array(this._binary, this._binaryOffset + offsets[2], offsets[3] / Float32Array.BYTES_PER_ELEMENT);
                this._data.frameIntArray = this._frameIntArray = new Int16Array(this._binary, this._binaryOffset + offsets[4], offsets[5] / Int16Array.BYTES_PER_ELEMENT);
                this._data.frameFloatArray = this._frameFloatArray = new Float32Array(this._binary, this._binaryOffset + offsets[6], offsets[7] / Float32Array.BYTES_PER_ELEMENT);
                this._data.frameArray = this._frameArray = new Int16Array(this._binary, this._binaryOffset + offsets[8], offsets[9] / Int16Array.BYTES_PER_ELEMENT);
                this._data.timelineArray = this._timelineArray = new Uint16Array(this._binary, this._binaryOffset + offsets[10], offsets[11] / Uint16Array.BYTES_PER_ELEMENT);
            }
        };
        /**
         * @inheritDoc
         */
        BinaryDataParser.prototype.parseDragonBonesData = function (rawData, scale) {
            if (scale === void 0) { scale = 1; }
            console.assert(rawData !== null && rawData !== undefined && rawData instanceof ArrayBuffer);
            var tag = new Uint8Array(rawData, 0, 8);
            if (tag[0] !== "D".charCodeAt(0) ||
                tag[1] !== "B".charCodeAt(0) ||
                tag[2] !== "D".charCodeAt(0) ||
                tag[3] !== "T".charCodeAt(0)) {
                console.assert(false, "Nonsupport data.");
                return null;
            }
            var headerLength = new Uint32Array(rawData, 8, 1)[0];
            var headerBytes = new Uint8Array(rawData, 8 + 4, headerLength);
            var headerString = this._decodeUTF8(headerBytes);
            var header = JSON.parse(headerString);
            this._binary = rawData;
            this._binaryOffset = 8 + 4 + headerLength;
            return _super.prototype.parseDragonBonesData.call(this, header, scale);
        };
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.BaseFactory#parseDragonBonesData()
         */
        BinaryDataParser.getInstance = function () {
            if (BinaryDataParser._binaryDataParserInstance === null) {
                BinaryDataParser._binaryDataParserInstance = new BinaryDataParser();
            }
            return BinaryDataParser._binaryDataParserInstance;
        };
        /**
         * @private
         */
        BinaryDataParser._binaryDataParserInstance = null;
        return BinaryDataParser;
    }(dragonBones.ObjectDataParser));
    dragonBones.BinaryDataParser = BinaryDataParser;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var BuildArmaturePackage = (function () {
        function BuildArmaturePackage() {
            this.dataName = "";
            this.textureAtlasName = "";
            this.skin = null;
        }
        return BuildArmaturePackage;
    }());
    dragonBones.BuildArmaturePackage = BuildArmaturePackage;
    /**
     * 创建骨架的基础工厂。 (通常只需要一个全局工厂实例)
     * @see dragonBones.DragonBonesData
     * @see dragonBones.TextureAtlasData
     * @see dragonBones.ArmatureData
     * @see dragonBones.Armature
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var BaseFactory = (function () {
        /**
         * 创建一个工厂。 (通常只需要一个全局工厂实例)
         * @param dataParser 龙骨数据解析器，如果不设置，则使用默认解析器。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        function BaseFactory(dataParser) {
            if (dataParser === void 0) { dataParser = null; }
            /**
             * 是否开启共享搜索。
             * 如果开启，创建一个骨架时，可以从多个龙骨数据中寻找骨架数据，或贴图集数据中寻找贴图数据。 (通常在有共享导出的数据时开启)
             * @see dragonBones.DragonBonesData#autoSearch
             * @see dragonBones.TextureAtlasData#autoSearch
             * @version DragonBones 4.5
             * @language zh_CN
             */
            this.autoSearch = false;
            /**
             * @private
             */
            this._dragonBonesDataMap = {};
            /**
             * @private
             */
            this._textureAtlasDataMap = {};
            /**
             * @private
             */
            this._dragonBones = null;
            /**
             * @private
             */
            this._dataParser = null;
            if (BaseFactory._objectParser === null) {
                BaseFactory._objectParser = new dragonBones.ObjectDataParser();
            }
            if (BaseFactory._binaryParser === null) {
                BaseFactory._binaryParser = new dragonBones.BinaryDataParser();
            }
            this._dataParser = dataParser !== null ? dataParser : BaseFactory._objectParser;
        }
        /**
         * @private
         */
        BaseFactory.prototype._isSupportMesh = function () {
            return true;
        };
        /**
         * @private
         */
        BaseFactory.prototype._getTextureData = function (textureAtlasName, textureName) {
            if (textureAtlasName in this._textureAtlasDataMap) {
                for (var _i = 0, _a = this._textureAtlasDataMap[textureAtlasName]; _i < _a.length; _i++) {
                    var textureAtlasData = _a[_i];
                    var textureData = textureAtlasData.getTexture(textureName);
                    if (textureData !== null) {
                        return textureData;
                    }
                }
            }
            if (this.autoSearch) {
                for (var k in this._textureAtlasDataMap) {
                    for (var _b = 0, _c = this._textureAtlasDataMap[k]; _b < _c.length; _b++) {
                        var textureAtlasData = _c[_b];
                        if (textureAtlasData.autoSearch) {
                            var textureData = textureAtlasData.getTexture(textureName);
                            if (textureData !== null) {
                                return textureData;
                            }
                        }
                    }
                }
            }
            return null;
        };
        /**
         * @private
         */
        BaseFactory.prototype._fillBuildArmaturePackage = function (dataPackage, dragonBonesName, armatureName, skinName, textureAtlasName) {
            var dragonBonesData = null;
            var armatureData = null;
            if (dragonBonesName.length > 0) {
                if (dragonBonesName in this._dragonBonesDataMap) {
                    dragonBonesData = this._dragonBonesDataMap[dragonBonesName];
                    armatureData = dragonBonesData.getArmature(armatureName);
                }
            }
            if (armatureData === null && (dragonBonesName.length === 0 || this.autoSearch)) {
                for (var k in this._dragonBonesDataMap) {
                    dragonBonesData = this._dragonBonesDataMap[k];
                    if (dragonBonesName.length === 0 || dragonBonesData.autoSearch) {
                        armatureData = dragonBonesData.getArmature(armatureName);
                        if (armatureData !== null) {
                            dragonBonesName = k;
                            break;
                        }
                    }
                }
            }
            if (armatureData !== null) {
                dataPackage.dataName = dragonBonesName;
                dataPackage.textureAtlasName = textureAtlasName;
                dataPackage.data = dragonBonesData;
                dataPackage.armature = armatureData;
                dataPackage.skin = null;
                if (skinName.length > 0) {
                    dataPackage.skin = armatureData.getSkin(skinName);
                    if (dataPackage.skin === null && this.autoSearch) {
                        for (var k in this._dragonBonesDataMap) {
                            var skinDragonBonesData = this._dragonBonesDataMap[k];
                            var skinArmatureData = skinDragonBonesData.getArmature(skinName);
                            if (skinArmatureData !== null) {
                                dataPackage.skin = skinArmatureData.defaultSkin;
                                break;
                            }
                        }
                    }
                }
                if (dataPackage.skin === null) {
                    dataPackage.skin = armatureData.defaultSkin;
                }
                return true;
            }
            return false;
        };
        /**
         * @private
         */
        BaseFactory.prototype._buildBones = function (dataPackage, armature) {
            var bones = dataPackage.armature.sortedBones;
            for (var i = 0; i < (dragonBones.DragonBones.webAssembly ? bones.size() : bones.length); ++i) {
                var boneData = dragonBones.DragonBones.webAssembly ? bones.get(i) : bones[i];
                var bone = dragonBones.DragonBones.webAssembly ? new Module["Bone"]() : dragonBones.BaseObject.borrowObject(dragonBones.Bone);
                bone.init(boneData);
                if (boneData.parent !== null) {
                    armature.addBone(bone, boneData.parent.name);
                }
                else {
                    armature.addBone(bone);
                }
                var constraints = boneData.constraints;
                for (var j = 0; j < (dragonBones.DragonBones.webAssembly ? constraints.size() : constraints.length); ++j) {
                    var constraintData = dragonBones.DragonBones.webAssembly ? constraints.get(j) : constraints[j];
                    var target = armature.getBone(constraintData.target.name);
                    if (target === null) {
                        continue;
                    }
                    // TODO more constraint type.
                    var ikConstraintData = constraintData;
                    var constraint = dragonBones.DragonBones.webAssembly ? new Module["IKConstraint"]() : dragonBones.BaseObject.borrowObject(dragonBones.IKConstraint);
                    var root = ikConstraintData.root !== null ? armature.getBone(ikConstraintData.root.name) : null;
                    constraint.target = target;
                    constraint.bone = bone;
                    constraint.root = root;
                    constraint.bendPositive = ikConstraintData.bendPositive;
                    constraint.scaleEnabled = ikConstraintData.scaleEnabled;
                    constraint.weight = ikConstraintData.weight;
                    if (root !== null) {
                        root.addConstraint(constraint);
                    }
                    else {
                        bone.addConstraint(constraint);
                    }
                }
            }
        };
        /**
         * @private
         */
        BaseFactory.prototype._buildSlots = function (dataPackage, armature) {
            var currentSkin = dataPackage.skin;
            var defaultSkin = dataPackage.armature.defaultSkin;
            if (currentSkin === null || defaultSkin === null) {
                return;
            }
            var skinSlots = {};
            for (var k in defaultSkin.displays) {
                var displays = defaultSkin.displays[k];
                skinSlots[k] = displays;
            }
            if (currentSkin !== defaultSkin) {
                for (var k in currentSkin.displays) {
                    var displays = currentSkin.displays[k];
                    skinSlots[k] = displays;
                }
            }
            for (var _i = 0, _a = dataPackage.armature.sortedSlots; _i < _a.length; _i++) {
                var slotData = _a[_i];
                if (!(slotData.name in skinSlots)) {
                    continue;
                }
                var displays = skinSlots[slotData.name];
                var slot = this._buildSlot(dataPackage, slotData, displays, armature);
                var displayList = new Array();
                for (var _b = 0, displays_1 = displays; _b < displays_1.length; _b++) {
                    var displayData = displays_1[_b];
                    if (displayData !== null) {
                        displayList.push(this._getSlotDisplay(dataPackage, displayData, null, slot));
                    }
                    else {
                        displayList.push(null);
                    }
                }
                armature.addSlot(slot, slotData.parent.name);
                slot._setDisplayList(displayList);
                slot._setDisplayIndex(slotData.displayIndex, true);
            }
        };
        /**
         * @private
         */
        BaseFactory.prototype._getSlotDisplay = function (dataPackage, displayData, rawDisplayData, slot) {
            var dataName = dataPackage !== null ? dataPackage.dataName : displayData.parent.parent.name;
            var display = null;
            switch (displayData.type) {
                case 0 /* Image */:
                    var imageDisplayData = displayData;
                    if (imageDisplayData.texture === null) {
                        imageDisplayData.texture = this._getTextureData(dataName, displayData.path);
                    }
                    else if (dataPackage !== null && dataPackage.textureAtlasName.length > 0) {
                        imageDisplayData.texture = this._getTextureData(dataPackage.textureAtlasName, displayData.path);
                    }
                    if (rawDisplayData !== null && rawDisplayData.type === 2 /* Mesh */ && this._isSupportMesh()) {
                        display = slot.meshDisplay;
                    }
                    else {
                        display = slot.rawDisplay;
                    }
                    break;
                case 2 /* Mesh */:
                    var meshDisplayData = displayData;
                    if (meshDisplayData.texture === null) {
                        meshDisplayData.texture = this._getTextureData(dataName, meshDisplayData.path);
                    }
                    else if (dataPackage !== null && dataPackage.textureAtlasName.length > 0) {
                        meshDisplayData.texture = this._getTextureData(dataPackage.textureAtlasName, meshDisplayData.path);
                    }
                    if (this._isSupportMesh()) {
                        display = slot.meshDisplay;
                    }
                    else {
                        display = slot.rawDisplay;
                    }
                    break;
                case 1 /* Armature */:
                    var armatureDisplayData = displayData;
                    var childArmature = this.buildArmature(armatureDisplayData.path, dataName, null, dataPackage !== null ? dataPackage.textureAtlasName : null);
                    if (childArmature !== null) {
                        childArmature.inheritAnimation = armatureDisplayData.inheritAnimation;
                        if (!childArmature.inheritAnimation) {
                            var actions = armatureDisplayData.actions.length > 0 ? armatureDisplayData.actions : childArmature.armatureData.defaultActions;
                            if (actions.length > 0) {
                                for (var _i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
                                    var action = actions_2[_i];
                                    childArmature._bufferAction(action, true);
                                }
                            }
                            else {
                                childArmature.animation.play();
                            }
                        }
                        armatureDisplayData.armature = childArmature.armatureData; // 
                    }
                    display = childArmature;
                    break;
            }
            return display;
        };
        /**
         * @private
         */
        BaseFactory.prototype._replaceSlotDisplay = function (dataPackage, displayData, slot, displayIndex) {
            if (displayIndex < 0) {
                displayIndex = slot.displayIndex;
            }
            if (displayIndex < 0) {
                displayIndex = 0;
            }
            var displayList = slot.displayList; // Copy.
            if (displayList.length <= displayIndex) {
                displayList.length = displayIndex + 1;
                for (var i = 0, l = displayList.length; i < l; ++i) {
                    if (!displayList[i]) {
                        displayList[i] = null;
                    }
                }
            }
            if (slot._displayDatas.length <= displayIndex) {
                slot._displayDatas.length = displayIndex + 1;
                for (var i = 0, l = slot._displayDatas.length; i < l; ++i) {
                    if (!slot._displayDatas[i]) {
                        slot._displayDatas[i] = null;
                    }
                }
            }
            slot._displayDatas[displayIndex] = displayData;
            if (displayData !== null) {
                displayList[displayIndex] = this._getSlotDisplay(dataPackage, displayData, displayIndex < slot._rawDisplayDatas.length ? slot._rawDisplayDatas[displayIndex] : null, slot);
            }
            else {
                displayList[displayIndex] = null;
            }
            slot.displayList = displayList;
        };
        /**
         * 解析并添加龙骨数据。
         * @param rawData 需要解析的原始数据。
         * @param name 为数据提供一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @returns DragonBonesData
         * @see #getDragonBonesData()
         * @see #addDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseFactory.prototype.parseDragonBonesData = function (rawData, name, scale) {
            if (name === void 0) { name = null; }
            if (scale === void 0) { scale = 1.0; }
            var dragonBonesData = null;
            if (rawData instanceof ArrayBuffer) {
                dragonBonesData = BaseFactory._binaryParser.parseDragonBonesData(rawData, scale);
            }
            else {
                dragonBonesData = this._dataParser.parseDragonBonesData(rawData, scale);
            }
            while (true) {
                var textureAtlasData = this._buildTextureAtlasData(null, null);
                if (this._dataParser.parseTextureAtlasData(null, textureAtlasData, scale)) {
                    this.addTextureAtlasData(textureAtlasData, name);
                }
                else {
                    textureAtlasData.returnToPool();
                    break;
                }
            }
            if (dragonBonesData !== null) {
                this.addDragonBonesData(dragonBonesData, name);
            }
            return dragonBonesData;
        };
        /**
         * 解析并添加贴图集数据。
         * @param rawData 需要解析的原始数据。 (JSON)
         * @param textureAtlas 贴图。
         * @param name 为数据指定一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @param scale 为贴图集设置一个缩放值。
         * @returns 贴图集数据
         * @see #getTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.TextureAtlasData
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseFactory.prototype.parseTextureAtlasData = function (rawData, textureAtlas, name, scale) {
            if (name === void 0) { name = null; }
            if (scale === void 0) { scale = 0.0; }
            var textureAtlasData = this._buildTextureAtlasData(null, null);
            this._dataParser.parseTextureAtlasData(rawData, textureAtlasData, scale);
            this._buildTextureAtlasData(textureAtlasData, textureAtlas || null);
            this.addTextureAtlasData(textureAtlasData, name);
            return textureAtlasData;
        };
        /**
         * @version DragonBones 5.1
         * @language zh_CN
         */
        BaseFactory.prototype.updateTextureAtlasData = function (name, textureAtlases) {
            var textureAtlasDatas = this.getTextureAtlasData(name);
            if (textureAtlasDatas !== null) {
                for (var i = 0, l = textureAtlasDatas.length; i < l; ++i) {
                    if (i < textureAtlases.length) {
                        this._buildTextureAtlasData(textureAtlasDatas[i], textureAtlases[i]);
                    }
                }
            }
        };
        /**
         * 获取指定名称的龙骨数据。
         * @param name 数据名称。
         * @returns DragonBonesData
         * @see #parseDragonBonesData()
         * @see #addDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        BaseFactory.prototype.getDragonBonesData = function (name) {
            return (name in this._dragonBonesDataMap) ? this._dragonBonesDataMap[name] : null;
        };
        /**
         * 添加龙骨数据。
         * @param data 龙骨数据。
         * @param name 为数据指定一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @see #parseDragonBonesData()
         * @see #getDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        BaseFactory.prototype.addDragonBonesData = function (data, name) {
            if (name === void 0) { name = null; }
            name = name !== null ? name : data.name;
            if (name in this._dragonBonesDataMap) {
                if (this._dragonBonesDataMap[name] === data) {
                    return;
                }
                console.warn("Replace data: " + name);
                this._dragonBonesDataMap[name].returnToPool();
            }
            this._dragonBonesDataMap[name] = data;
        };
        /**
         * 移除龙骨数据。
         * @param name 数据名称。
         * @param disposeData 是否释放数据。
         * @see #parseDragonBonesData()
         * @see #getDragonBonesData()
         * @see #addDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        BaseFactory.prototype.removeDragonBonesData = function (name, disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            if (name in this._dragonBonesDataMap) {
                if (disposeData) {
                    this._dragonBones.bufferObject(this._dragonBonesDataMap[name]);
                }
                delete this._dragonBonesDataMap[name];
            }
        };
        /**
         * 获取指定名称的贴图集数据列表。
         * @param name 数据名称。
         * @returns 贴图集数据列表。
         * @see #parseTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.TextureAtlasData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        BaseFactory.prototype.getTextureAtlasData = function (name) {
            return (name in this._textureAtlasDataMap) ? this._textureAtlasDataMap[name] : null;
        };
        /**
         * 添加贴图集数据。
         * @param data 贴图集数据。
         * @param name 为数据指定一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @see #parseTextureAtlasData()
         * @see #getTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.TextureAtlasData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        BaseFactory.prototype.addTextureAtlasData = function (data, name) {
            if (name === void 0) { name = null; }
            name = name !== null ? name : data.name;
            var textureAtlasList = (name in this._textureAtlasDataMap) ? this._textureAtlasDataMap[name] : (this._textureAtlasDataMap[name] = []);
            if (textureAtlasList.indexOf(data) < 0) {
                textureAtlasList.push(data);
            }
        };
        /**
         * 移除贴图集数据。
         * @param name 数据名称。
         * @param disposeData 是否释放数据。
         * @see #parseTextureAtlasData()
         * @see #getTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see dragonBones.TextureAtlasData
         * @version DragonBones 3.0
         * @language zh_CN
         */
        BaseFactory.prototype.removeTextureAtlasData = function (name, disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            if (name in this._textureAtlasDataMap) {
                var textureAtlasDataList = this._textureAtlasDataMap[name];
                if (disposeData) {
                    for (var _i = 0, textureAtlasDataList_1 = textureAtlasDataList; _i < textureAtlasDataList_1.length; _i++) {
                        var textureAtlasData = textureAtlasDataList_1[_i];
                        this._dragonBones.bufferObject(textureAtlasData);
                    }
                }
                delete this._textureAtlasDataMap[name];
            }
        };
        /**
         * 获取骨架数据。
         * @param name 骨架数据名称。
         * @param dragonBonesName 龙骨数据名称。
         * @see dragonBones.ArmatureData
         * @version DragonBones 5.1
         * @language zh_CN
         */
        BaseFactory.prototype.getArmatureData = function (name, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = ""; }
            var dataPackage = new BuildArmaturePackage();
            if (!this._fillBuildArmaturePackage(dataPackage, dragonBonesName, name, "", "")) {
                return null;
            }
            return dataPackage.armature;
        };
        /**
         * 清除所有的数据。
         * @param disposeData 是否释放数据。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseFactory.prototype.clear = function (disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            for (var k in this._dragonBonesDataMap) {
                if (disposeData) {
                    this._dragonBones.bufferObject(this._dragonBonesDataMap[k]);
                }
                delete this._dragonBonesDataMap[k];
            }
            for (var k in this._textureAtlasDataMap) {
                if (disposeData) {
                    var textureAtlasDataList = this._textureAtlasDataMap[k];
                    for (var _i = 0, textureAtlasDataList_2 = textureAtlasDataList; _i < textureAtlasDataList_2.length; _i++) {
                        var textureAtlasData = textureAtlasDataList_2[_i];
                        this._dragonBones.bufferObject(textureAtlasData);
                    }
                }
                delete this._textureAtlasDataMap[k];
            }
        };
        /**
         * 创建一个骨架。
         * @param armatureName 骨架数据名称。
         * @param dragonBonesName 龙骨数据名称，如果未设置，将检索所有的龙骨数据，当多个龙骨数据中包含同名的骨架数据时，可能无法创建出准确的骨架。
         * @param skinName 皮肤名称，如果未设置，则使用默认皮肤。
         * @param textureAtlasName 贴图集数据名称，如果未设置，则使用龙骨数据名称。
         * @returns 骨架
         * @see dragonBones.ArmatureData
         * @see dragonBones.Armature
         * @version DragonBones 3.0
         * @language zh_CN
         */
        BaseFactory.prototype.buildArmature = function (armatureName, dragonBonesName, skinName, textureAtlasName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (skinName === void 0) { skinName = null; }
            if (textureAtlasName === void 0) { textureAtlasName = null; }
            var dataPackage = new BuildArmaturePackage();
            if (!this._fillBuildArmaturePackage(dataPackage, dragonBonesName || "", armatureName, skinName || "", textureAtlasName || "")) {
                console.warn("No armature data. " + armatureName + ", " + (dragonBonesName !== null ? dragonBonesName : ""));
                return null;
            }
            var armature = this._buildArmature(dataPackage);
            this._buildBones(dataPackage, armature);
            this._buildSlots(dataPackage, armature);
            // armature.invalidUpdate(null, true); TODO
            armature.invalidUpdate("", true);
            armature.advanceTime(0.0); // Update armature pose.
            return armature;
        };
        /**
         * 用指定资源替换指定插槽的显示对象。(用 "dragonBonesName/armatureName/slotName/displayName" 的资源替换 "slot" 的显示对象)
         * @param dragonBonesName 指定的龙骨数据名称。
         * @param armatureName 指定的骨架名称。
         * @param slotName 指定的插槽名称。
         * @param displayName 指定的显示对象名称。
         * @param slot 指定的插槽实例。
         * @param displayIndex 要替换的显示对象的索引，如果未设置，则替换当前正在显示的显示对象。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseFactory.prototype.replaceSlotDisplay = function (dragonBonesName, armatureName, slotName, displayName, slot, displayIndex) {
            if (displayIndex === void 0) { displayIndex = -1; }
            var dataPackage = {};
            if (!this._fillBuildArmaturePackage(dataPackage, dragonBonesName || "", armatureName, "", "") || dataPackage.skin === null) {
                return;
            }
            var displays = dataPackage.skin.getDisplays(slotName);
            if (displays === null) {
                return;
            }
            for (var _i = 0, displays_2 = displays; _i < displays_2.length; _i++) {
                var display = displays_2[_i];
                if (display !== null && display.name === displayName) {
                    this._replaceSlotDisplay(dataPackage, display, slot, displayIndex);
                    break;
                }
            }
        };
        /**
         * 用指定资源列表替换插槽的显示对象列表。
         * @param dragonBonesName 指定的 DragonBonesData 名称。
         * @param armatureName 指定的骨架名称。
         * @param slotName 指定的插槽名称。
         * @param slot 指定的插槽实例。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseFactory.prototype.replaceSlotDisplayList = function (dragonBonesName, armatureName, slotName, slot) {
            var dataPackage = {};
            if (!this._fillBuildArmaturePackage(dataPackage, dragonBonesName || "", armatureName, "", "") || dataPackage.skin === null) {
                return;
            }
            var displays = dataPackage.skin.getDisplays(slotName);
            if (displays === null) {
                return;
            }
            var displayIndex = 0;
            for (var _i = 0, displays_3 = displays; _i < displays_3.length; _i++) {
                var displayData = displays_3[_i];
                this._replaceSlotDisplay(dataPackage, displayData, slot, displayIndex++);
            }
        };
        /**
         * 更换骨架皮肤。
         * @param armature 骨架。
         * @param skin 皮肤数据。
         * @param exclude 不需要更新的插槽。
         * @see dragonBones.Armature
         * @see dragonBones.SkinData
         * @version DragonBones 5.1
         * @language zh_CN
         */
        BaseFactory.prototype.changeSkin = function (armature, skin, exclude) {
            if (exclude === void 0) { exclude = null; }
            for (var _i = 0, _a = armature.getSlots(); _i < _a.length; _i++) {
                var slot = _a[_i];
                if (!(slot.name in skin.displays) || (exclude !== null && exclude.indexOf(slot.name) >= 0)) {
                    continue;
                }
                var displays = skin.displays[slot.name];
                var displayList = slot.displayList; // Copy.
                displayList.length = displays.length; // Modify displayList length.
                for (var i = 0, l = displays.length; i < l; ++i) {
                    var displayData = displays[i];
                    if (displayData !== null) {
                        displayList[i] = this._getSlotDisplay(null, displayData, null, slot);
                    }
                    else {
                        displayList[i] = null;
                    }
                }
                slot._rawDisplayDatas = displays;
                slot._displayDatas.length = displays.length;
                for (var i = 0, l = slot._displayDatas.length; i < l; ++i) {
                    slot._displayDatas[i] = displays[i];
                }
                slot.displayList = displayList;
            }
        };
        /**
         * 将骨架的动画替换成其他骨架的动画。 (通常这些骨架应该具有相同的骨架结构)
         * @param toArmature 指定的骨架。
         * @param fromArmatreName 其他骨架的名称。
         * @param fromSkinName 其他骨架的皮肤名称，如果未设置，则使用默认皮肤。
         * @param fromDragonBonesDataName 其他骨架属于的龙骨数据名称，如果未设置，则检索所有的龙骨数据。
         * @param replaceOriginalAnimation 是否替换原有的同名动画。
         * @returns 是否替换成功。
         * @see dragonBones.Armature
         * @see dragonBones.ArmatureData
         * @version DragonBones 4.5
         * @language zh_CN
         */
        BaseFactory.prototype.copyAnimationsToArmature = function (toArmature, fromArmatreName, fromSkinName, fromDragonBonesDataName, replaceOriginalAnimation) {
            if (fromSkinName === void 0) { fromSkinName = null; }
            if (fromDragonBonesDataName === void 0) { fromDragonBonesDataName = null; }
            if (replaceOriginalAnimation === void 0) { replaceOriginalAnimation = true; }
            var dataPackage = new BuildArmaturePackage();
            if (this._fillBuildArmaturePackage(dataPackage, fromDragonBonesDataName || "", fromArmatreName, fromSkinName || "", "")) {
                var fromArmatureData = dataPackage.armature;
                if (replaceOriginalAnimation) {
                    toArmature.animation.animations = fromArmatureData.animations;
                }
                else {
                    var animations = {};
                    for (var animationName in toArmature.animation.animations) {
                        animations[animationName] = toArmature.animation.animations[animationName];
                    }
                    for (var animationName in fromArmatureData.animations) {
                        animations[animationName] = fromArmatureData.animations[animationName];
                    }
                    toArmature.animation.animations = animations;
                }
                if (dataPackage.skin) {
                    var slots = toArmature.getSlots();
                    for (var i = 0, l = slots.length; i < l; ++i) {
                        var toSlot = slots[i];
                        var toSlotDisplayList = toSlot.displayList;
                        for (var j = 0, lJ = toSlotDisplayList.length; j < lJ; ++j) {
                            var toDisplayObject = toSlotDisplayList[j];
                            if (toDisplayObject instanceof dragonBones.Armature) {
                                var displays = dataPackage.skin.getDisplays(toSlot.name);
                                if (displays !== null && j < displays.length) {
                                    var fromDisplayData = displays[j];
                                    if (fromDisplayData !== null && fromDisplayData.type === 1 /* Armature */) {
                                        this.copyAnimationsToArmature(toDisplayObject, fromDisplayData.path, fromSkinName, fromDragonBonesDataName, replaceOriginalAnimation);
                                    }
                                }
                            }
                        }
                    }
                    return true;
                }
            }
            return false;
        };
        /**
         * @private
         */
        BaseFactory.prototype.getAllDragonBonesData = function () {
            return this._dragonBonesDataMap;
        };
        /**
         * @private
         */
        BaseFactory.prototype.getAllTextureAtlasData = function () {
            return this._textureAtlasDataMap;
        };
        /**
         * @private
         */
        BaseFactory._objectParser = null;
        /**
         * @private
         */
        BaseFactory._binaryParser = null;
        return BaseFactory;
    }());
    dragonBones.BaseFactory = BaseFactory;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * Egret 事件。
     * @version DragonBones 4.5
     * @language zh_CN
     */
    var EgretEvent = (function (_super) {
        __extends(EgretEvent, _super);
        function EgretEvent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(EgretEvent.prototype, "eventObject", {
            /**
             * 事件对象。
             * @see dragonBones.EventObject
             * @version DragonBones 4.5
             * @language zh_CN
             */
            get: function () {
                return this.data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretEvent.prototype, "armature", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #eventObject
             * @see dragonBones.EventObject#armature
             */
            get: function () {
                return this.eventObject.armature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretEvent.prototype, "bone", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #eventObject
             * @see dragonBones.EventObject#bone
             */
            get: function () {
                return this.eventObject.bone;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretEvent.prototype, "slot", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #eventObject
             * @see dragonBones.EventObject#slot
             */
            get: function () {
                return this.eventObject.slot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretEvent.prototype, "animationState", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #eventObject
             * @see dragonBones.EventObject#animationState
             */
            get: function () {
                return this.eventObject.animationState;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretEvent.prototype, "animationName", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #eventObject
             * @see dragonBones.EventObject#animationState
             */
            get: function () {
                var animationState = this.eventObject.animationState;
                return animationState !== null ? animationState.name : "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretEvent.prototype, "frameLabel", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #eventObject
             * @see dragonBones.EventObject#name
             */
            get: function () {
                return this.eventObject.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretEvent.prototype, "sound", {
            /**
             * @deprecated
             * 已废弃，请参考 @see
             * @see #eventObject
             * @see dragonBones.EventObject#name
             */
            get: function () {
                return this.eventObject.name;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.START
         */
        EgretEvent.START = dragonBones.EventObject.START;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.LOOP_COMPLETE
         */
        EgretEvent.LOOP_COMPLETE = dragonBones.EventObject.LOOP_COMPLETE;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.COMPLETE
         */
        EgretEvent.COMPLETE = dragonBones.EventObject.COMPLETE;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FADE_IN
         */
        EgretEvent.FADE_IN = dragonBones.EventObject.FADE_IN;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FADE_IN_COMPLETE
         */
        EgretEvent.FADE_IN_COMPLETE = dragonBones.EventObject.FADE_IN_COMPLETE;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FADE_OUT
         */
        EgretEvent.FADE_OUT = dragonBones.EventObject.FADE_OUT;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FADE_OUT_COMPLETE
         */
        EgretEvent.FADE_OUT_COMPLETE = dragonBones.EventObject.FADE_OUT_COMPLETE;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.SOUND_EVENT
         */
        EgretEvent.SOUND_EVENT = dragonBones.EventObject.SOUND_EVENT;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.ANIMATION_FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.BONE_FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.MOVEMENT_FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        /**
         * @deprecated
         * 已废弃，请参考 @see
         * @see dragonBones.EventObject.SOUND_EVENT
         */
        EgretEvent.SOUND = dragonBones.EventObject.SOUND_EVENT;
        return EgretEvent;
    }(egret.Event));
    dragonBones.EgretEvent = EgretEvent;
    /**
     * @inheritDoc
     */
    var EgretArmatureDisplay = (function (_super) {
        __extends(EgretArmatureDisplay, _super);
        function EgretArmatureDisplay() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._disposeProxy = false;
            _this._armature = null; //
            _this._debugDrawer = null;
            return _this;
        }
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype.init = function (armature) {
            this._armature = armature;
        };
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype.clear = function () {
            this._disposeProxy = false;
            this._armature = null;
            this._debugDrawer = null;
        };
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype.dispose = function (disposeProxy) {
            if (disposeProxy === void 0) { disposeProxy = true; }
            this._disposeProxy = disposeProxy;
            if (this._armature !== null) {
                this._armature.dispose();
                this._armature = null;
            }
        };
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype.debugUpdate = function (isEnabled) {
            isEnabled;
        };
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype._dispatchEvent = function (type, eventObject) {
            var event = egret.Event.create(EgretEvent, type);
            event.data = eventObject;
            _super.prototype.dispatchEvent.call(this, event);
            egret.Event.release(event);
        };
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype.hasEvent = function (type) {
            return this.hasEventListener(type);
        };
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype.addEvent = function (type, listener, target) {
            this.addEventListener(type, listener, target);
        };
        /**
         * @inheritDoc
         */
        EgretArmatureDisplay.prototype.removeEvent = function (type, listener, target) {
            this.removeEventListener(type, listener, target);
        };
        Object.defineProperty(EgretArmatureDisplay.prototype, "armature", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._armature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretArmatureDisplay.prototype, "animation", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._armature.animation;
            },
            enumerable: true,
            configurable: true
        });
        return EgretArmatureDisplay;
    }(egret.DisplayObjectContainer));
    dragonBones.EgretArmatureDisplay = EgretArmatureDisplay;
    function createEgretDisplay(display, type) {
        var egretDisplayWrapper = new Module["EgretDisplayWASM"](); // TODO 是否可以将 EgretDisplayWASM 改为 EgretDisplayWrapper
        var wasmId;
        if (display === null) {
            wasmId = -1;
            egretDisplayWrapper.setDisplayInfo(wasmId, type);
        }
        else if (type === 1 /* Armature */) {
            wasmId = display.getEgretArmatureId();
            egretDisplayWrapper.setDisplayInfo(wasmId, type);
            egretDisplayWrapper.setArmature(display);
        }
        else {
            wasmId = display.$waNode.id;
            egretDisplayWrapper.setDisplayInfo(wasmId, type);
        }
        egretDisplayWrapper._display = display;
        return egretDisplayWrapper;
    }
    dragonBones.createEgretDisplay = createEgretDisplay;
    function egretWASMInit() {
        /**
         * @private
         * 扩展 c++ EgretArmatureProxy。(在 js 中构造)
         */
        dragonBones.EgretArmatureProxy = Module["EgretArmatureDisplayWASM"].extend("EgretArmatureProxy", {
            __construct: function (display) {
                this.__parent.__construct.call(this);
                this._display = display;
            },
            __destruct: function () {
                this.__parent.__destruct.call(this);
                this._display = null;
            },
            clear: function () {
                if (this._display) {
                    this._display.clear();
                }
                this._display = null;
            },
            debugUpdate: function (isEnabled) {
                this._display.debugUpdate(isEnabled);
            },
            //extend c++
            _dispatchEvent: function (type, eventObject) {
                this._display._dispatchEvent(type, eventObject);
            },
            //extend c++
            hasEvent: function (type) {
                return this._display.hasEventListener(type);
            },
            dispose: function (disposeProxy) {
                // TODO lsc
                disposeProxy;
                // return this._display.dispose(disposeProxy);
            },
            addEvent: function (type, listener, target) {
                this._display.addEvent(type, listener, target);
            },
            removeEvent: function (type, listener, target) {
                this._display.removeEvent(type, listener, target);
            }
        });
        /**
         * @private
         */
        dragonBones.EgretSlot = Module["EgretSlotWASM"].extend("EgretSlotWrapper", {
            __construct: function () {
                this.__parent.__construct.call(this);
                this._rawDisplay = null;
                this._meshDisplay = null;
                this._rawDisplayWASM = null;
                this._meshDisplayWASM = null;
            },
            __destruct: function () {
                this.__parent.__destruct.call(this);
                this._rawDisplay = null;
                this._meshDisplay = null;
            },
            init: function (slotData, displayDatas, rawDisplay, meshDisplay) {
                this._rawDisplay = rawDisplay;
                this._meshDisplay = meshDisplay;
                this._rawDisplayWASM = createEgretDisplay(this._rawDisplay, 0 /* Image */);
                this._meshDisplayWASM = createEgretDisplay(this._meshDisplay, 2 /* Mesh */);
                this.__parent.init.call(this, slotData, displayDatas, this._rawDisplayWASM, this._meshDisplayWASM);
            },
            getRawDisplay: function () {
                return this._rawDisplay;
            },
            getMeshDisplay: function () {
                return this._meshDisplay;
            },
            getRawWASMDisplay: function () {
                return this._rawDisplayWASM;
            },
            getMeshWASMDisplay: function () {
                return this._meshDisplayWASM;
            },
            // extend c++ function
            getDisplay: function () {
                var displayWrapper = this.__parent.getEgretDisplay.call(this);
                if (displayWrapper !== null) {
                    return displayWrapper._display;
                }
                return null;
            },
            setDisplay: function (value) {
                if (value === this._rawDisplay || value === this._meshDisplay) {
                    return;
                }
                if (value === null || value instanceof egret.Bitmap) {
                    this.__parent.setEgretDisplay.call(this, createEgretDisplay(value, 0 /* Image */));
                }
                else if (value instanceof egret.Mesh) {
                    this.__parent.setEgretDisplay.call(this, createEgretDisplay(value, 2 /* Mesh */));
                }
                else if (value instanceof Module["EgretArmature"]) {
                    this.__parent.setChildArmature.call(this, value);
                }
            }
        });
        Object.defineProperty(dragonBones.EgretSlot.prototype, "displayList", {
            get: dragonBones.EgretSlot.prototype.getEgretDisplayList,
            set: dragonBones.EgretSlot.prototype.setEgretDisplayList,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(dragonBones.EgretSlot.prototype, "rawDisplay", {
            get: dragonBones.EgretSlot.prototype.getRawDisplay,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(dragonBones.EgretSlot.prototype, "meshDisplay", {
            get: dragonBones.EgretSlot.prototype.getMeshDisplay,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(dragonBones.EgretSlot.prototype, "display", {
            get: dragonBones.EgretSlot.prototype.getDisplay,
            set: dragonBones.EgretSlot.prototype.setDisplay,
            enumerable: true,
            configurable: true
        });
        dragonBones.EgretTextureAtlasData = Module["EgretTextureAtlasDataWASM"].extend("EgretTextureAtlasData", {
            __construct: function (rawTextures) {
                this.__parent.__construct.call(this);
                this._textureNames = [];
                this._texture = null;
                if (rawTextures) {
                    for (var _i = 0, rawTextures_1 = rawTextures; _i < rawTextures_1.length; _i++) {
                        var texture = rawTextures_1[_i];
                        this._textureNames.push(texture.name);
                    }
                }
            },
            __destruct: function () {
                this.__parent.__destruct.call(this);
                this._textureNames.length = 0;
                this._texture = null;
            }
        });
        Object.defineProperty(dragonBones.EgretTextureAtlasData.prototype, "renderTexture", {
            get: function () {
                return this._texture;
            },
            set: function (value) {
                if (this._texture === value) {
                    return;
                }
                if (value["textureId"] === null || value["textureId"] === undefined) {
                    egret.WebAssemblyNode.setValuesToBitmapData(value);
                }
                this._texture = value;
                var textures = this.textures;
                if (this._texture !== null) {
                    var bitmapData = this._texture.bitmapData;
                    var textureAtlasWidth = this.width > 0.0 ? this.width : bitmapData.width;
                    var textureAtlasHeight = this.height > 0.0 ? this.height : bitmapData.height;
                    for (var _i = 0, _a = this._textureNames; _i < _a.length; _i++) {
                        var k = _a[_i];
                        for (var i = 0, l = k.length; i < l; ++i) {
                            if (k.charCodeAt(i) > 255) {
                                k = encodeURI(k);
                                break;
                            }
                        }
                        var textureData = textures.get(k);
                        var subTextureWidth = Math.min(textureData.region.width, textureAtlasWidth - textureData.region.x); // TODO need remove
                        var subTextureHeight = Math.min(textureData.region.height, textureAtlasHeight - textureData.region.y); // TODO need remove
                        if (!textureData.renderTexture) {
                            var currTex = new egret.Texture();
                            currTex._bitmapData = bitmapData;
                            if (textureData.rotated) {
                                currTex.$initData(textureData.region.x, textureData.region.y, subTextureHeight, subTextureWidth, 0, 0, subTextureHeight, subTextureWidth, textureAtlasWidth, textureAtlasHeight);
                            }
                            else {
                                currTex.$initData(textureData.region.x, textureData.region.y, subTextureWidth, subTextureHeight, 0, 0, subTextureWidth, subTextureHeight, textureAtlasWidth, textureAtlasHeight);
                            }
                            // Egret 5.0
                            egret.WebAssemblyNode.setValuesToBitmapData(currTex);
                            textureData.setTextureId(currTex["textureId"]);
                            textureData.renderTexture = currTex;
                        }
                    }
                }
                else {
                    for (var _b = 0, _c = this._textureNames; _b < _c.length; _b++) {
                        var k = _c[_b];
                        var textureData = textures.get(k);
                        textureData.renderTexture = null;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @private
         */
        dragonBones.EgretTextureData = Module["EgretTextureDataWASM"].extend("EgretTextureData", {
            __construct: function () {
                this.__parent.__construct.call(this);
                this._renderTexture = null;
            },
            __destruct: function () {
                this.__parent.__destruct.call(this);
                this._renderTexture = null;
            }
        });
        Object.defineProperty(dragonBones.EgretTextureData.prototype, "renderTexture", {
            get: function () {
                return this._renderTexture;
            },
            set: function (value) {
                if (this._renderTexture === value) {
                    return;
                }
                this._renderTexture = value;
            },
            enumerable: true,
            configurable: true
        });
        /*
        * @private
        * 扩展 c++ WorldClock。(在 c++ 中构造)
        */
        dragonBones.WorldClock = Module["WorldClock"];
        dragonBones.WorldClock.prototype._c_contains = dragonBones.WorldClock.prototype.contains;
        dragonBones.WorldClock.prototype._c_add = dragonBones.WorldClock.prototype.add;
        dragonBones.WorldClock.prototype._c_remove = dragonBones.WorldClock.prototype.remove;
        dragonBones.WorldClock.prototype.contains = function (value) {
            if (value instanceof dragonBones.Armature) {
                return this._c_contains(value.getAnimatable());
            }
            return this._c_contains(value);
        };
        dragonBones.WorldClock.prototype.add = function (value) {
            if (value instanceof dragonBones.Armature) {
                return this._c_add(value.getAnimatable());
            }
            return this._c_add(value);
        };
        dragonBones.WorldClock.prototype.remove = function (value) {
            if (value instanceof dragonBones.Armature) {
                return this._c_remove(value.getAnimatable());
            }
            return this._c_remove(value);
        };
        /**
         * @private
         * 扩展 c++ EgretArmature。(在 js 中构造)
         */
        dragonBones.Armature = Module["EgretArmature"];
        dragonBones.Armature.prototype._c_addBone = dragonBones.Armature.prototype.addBone;
        dragonBones.Armature.prototype._c_invalidUpdate = dragonBones.Armature.prototype.invalidUpdate;
        dragonBones.Armature.prototype.addBone = function (bone, name) {
            if (name === null || name === undefined) {
                name = "";
            }
            return this._c_addBone(bone, name);
        };
        dragonBones.Armature.prototype.invalidUpdate = function (boneName, updateSlotDisplay) {
            if (boneName === void 0) { boneName = null; }
            if (updateSlotDisplay === void 0) { updateSlotDisplay = false; }
            if (boneName === null) {
                boneName = "";
            }
            return this._c_invalidUpdate(boneName, updateSlotDisplay);
        };
        dragonBones.Armature.prototype.getDisplay = function () {
            return this.proxy._display;
        };
        Object.defineProperty(dragonBones.Armature.prototype, "display", {
            get: function () {
                return this.proxy._display;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @private
         * 扩展 c++ Animation
         */
        dragonBones.Animation = Module["Animation"];
        dragonBones.Animation.prototype._c_play = dragonBones.Animation.prototype.play;
        dragonBones.Animation.prototype._c_fadeIn = dragonBones.Animation.prototype.fadeIn;
        dragonBones.Animation.prototype.play = function (animationName, playTimes) {
            if (animationName === void 0) { animationName = null; }
            if (playTimes === void 0) { playTimes = -1; }
            if (animationName === null) {
                animationName = "";
            }
            return this._c_play(animationName, playTimes);
        };
        dragonBones.Animation.prototype.fadeIn = function (animationName, fadeInTime, playTimes, layer, group, fadeOutMode) {
            if (fadeInTime === void 0) { fadeInTime = -1.0; }
            if (playTimes === void 0) { playTimes = -1; }
            if (layer === void 0) { layer = 0; }
            if (group === void 0) { group = null; }
            if (fadeOutMode === void 0) { fadeOutMode = 3 /* SameLayerAndGroup */; }
            if (animationName === null) {
                animationName = "";
            }
            if (group === null) {
                group = "";
            }
            return this._c_fadeIn(animationName, fadeInTime, playTimes, layer, group, fadeOutMode);
        };
    }
    dragonBones.egretWASMInit = egretWASMInit;
    var configTables = {
        ActionData: {
            getter: [],
            setter: ["type", "bone", "slot", "data"]
        },
        DragonBonesData: {
            getter: ["frameIndices"],
            setter: [],
            array: ["armatureNames"]
        },
        ArmatureData: {
            getter: ["defaultActions", "actions"],
            setter: ["aabb", "defaultAnimation", "defaultSkin", "parent"],
            array: ["animationNames"]
        },
        BoneData: {
            getter: ["transform", "constraints"],
            setter: ["parent"]
        },
        SlotData: {
            getter: [],
            setter: ["blendMode", "color", "parent"],
            static: ["DEFAULT_COLOR"]
        },
        ConstraintData: {
            getter: [],
            setter: ["target", "root", "bone"]
        },
        DisplayData: {
            getter: ["transform"],
            setter: ["type", "parent"]
        },
        ImageDisplayData: {
            getter: ["pivot"],
            setter: ["texture"]
        },
        ArmatureDisplayData: {
            getter: ["actions"],
            setter: [] // armature
        },
        MeshDisplayData: {
            getter: [],
            setter: ["weight"]
        },
        WeightData: {
            getter: ["bones"],
            setter: []
        },
        AnimationData: {
            getter: [],
            setter: ["actionTimeline", "zOrderTimeline", "parent"]
        },
        TimelineData: {
            getter: [],
            setter: ["type"]
        },
        AnimationConfig: {
            getter: [],
            setter: ["fadeOutMode", "fadeOutTweenType", "fadeInTweenType"]
        },
        TextureData: {
            getter: ["region"],
            setter: ["frame"]
        },
        TransformObject: {
            getter: ["globalTransformMatrix", "global", "offset", "origin"],
            setter: []
        },
        Armature: {
            getter: ["armatureData", "animation", "proxy", "eventDispatcher"],
            setter: ["clock"]
        },
        Slot: {
            getter: ["boundingBoxData"],
            setter: ["displayIndex", "childArmature"]
        },
        Constraint: {
            getter: [],
            setter: ["target", "bone", "root"]
        },
        Animation: {
            getter: ["animationConfig"],
            setter: [],
            array: ["animationNames"]
        },
        WorldClock: {
            getter: [],
            setter: ["clock"],
            static: ["clock"]
        },
        EventObject: {
            getter: ["armature", "bone", "slot", "animationState", "data"],
            setter: []
        },
        EgretArmatureDisplayWASM: {
            getter: ["armature", "animation"],
            setter: []
        },
        DragonBones: {
            getter: ["clock"],
            setter: []
        }
    };
    function descGetter(funcName, target) {
        return {
            get: target["_c_get_" + funcName],
            enumerable: true,
            configurable: true
        };
    }
    function descSetter(funcName, target) {
        return {
            get: target["_c_get_" + funcName],
            set: target["_c_set_" + funcName],
            enumerable: true,
            configurable: true
        };
    }
    function descArrayGetter(funcName, target) {
        target;
        return {
            get: function () {
                var array = this["_js_" + funcName];
                if (!array) {
                    array = [];
                    var vector = this["_c_get_" + funcName]();
                    for (var i = 0, l = vector.size(); i < l; ++i) {
                        array[i] = vector.get(i);
                    }
                }
                return array;
            },
            enumerable: true,
            configurable: true
        };
    }
    function registerGetterSetter() {
        for (var fieldKey in configTables) {
            var getterClass = Module[fieldKey];
            var getterClassProto = Module[fieldKey].prototype;
            var getterArray = configTables[fieldKey].getter;
            var setterArray = configTables[fieldKey].setter;
            var staticArray = configTables[fieldKey].static;
            var arrayArray = configTables[fieldKey].array;
            if (getterArray) {
                for (var _i = 0, getterArray_1 = getterArray; _i < getterArray_1.length; _i++) {
                    var fieldName = getterArray_1[_i];
                    Object.defineProperty(getterClassProto, fieldName, descGetter(fieldName, getterClassProto));
                }
            }
            if (setterArray) {
                for (var _a = 0, setterArray_1 = setterArray; _a < setterArray_1.length; _a++) {
                    var fieldName = setterArray_1[_a];
                    Object.defineProperty(getterClassProto, fieldName, descSetter(fieldName, getterClassProto));
                }
            }
            if (staticArray) {
                for (var _b = 0, staticArray_1 = staticArray; _b < staticArray_1.length; _b++) {
                    var fieldName = staticArray_1[_b];
                    Object.defineProperty(getterClass, fieldName, descSetter(fieldName, getterClass));
                }
            }
            if (arrayArray) {
                for (var _c = 0, arrayArray_1 = arrayArray; _c < arrayArray_1.length; _c++) {
                    var fieldName = arrayArray_1[_c];
                    Object.defineProperty(getterClassProto, fieldName, descArrayGetter(fieldName, getterClass));
                }
            }
        }
    }
    dragonBones.registerGetterSetter = registerGetterSetter;
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * Egret 工厂。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    var EgretFactory = (function (_super) {
        __extends(EgretFactory, _super);
        /**
         * @inheritDoc
         */
        function EgretFactory() {
            var _this = _super.call(this) || this;
            /**
             * @private
             */
            _this._rawTextures = null;
            if (EgretFactory._dragonBones === null) {
                dragonBones.DragonBones.webAssembly = true;
                var eventDisplay = new dragonBones.EgretArmatureDisplay();
                EgretFactory._eventManager = eventDisplay;
                EgretFactory._dragonBones = new Module["DragonBones"]();
                EgretFactory._dragonBones.clock.time = egret.getTimer() * 0.001;
                egret.startTick(EgretFactory._clockHandler, EgretFactory);
            }
            return _this;
        }
        EgretFactory._clockHandler = function (time) {
            var dbcore = EgretFactory._dragonBones;
            //
            var objects = dbcore.getObjects();
            for (var i = 0, l = objects.size(); i < l; ++i) {
                objects.get(i).returnToPool();
            }
            objects.resize(0, null);
            //
            time *= 0.001;
            var passedTime = time - EgretFactory._time;
            dbcore.clock.advanceTime(passedTime);
            EgretFactory._time = time;
            //
            var events = dbcore.getEvents();
            for (var i = 0, l = events.size(); i < l; ++i) {
                var eventObject = events.get(i);
                var armature = eventObject.armature;
                var type = eventObject.type;
                if (armature === null || armature.display === null || armature.display === undefined) {
                    console.log("armature display error!");
                }
                armature.display._dispatchEvent(type, eventObject);
                if (type === dragonBones.EventObject.SOUND_EVENT) {
                    EgretFactory._eventManager._dispatchEvent(eventObject.type, eventObject);
                }
                eventObject.returnToPool();
            }
            events.resize(0, null);
            return false;
        };
        Object.defineProperty(EgretFactory, "clock", {
            /**
             * 一个可以直接使用的全局 WorldClock 实例.
             * @version DragonBones 5.0
             * @language zh_CN
             */
            get: function () {
                return EgretFactory._dragonBones.clock;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EgretFactory, "factory", {
            /**
             * 一个可以直接使用的全局工厂实例。
             * @version DragonBones 4.7
             * @language zh_CN
             */
            get: function () {
                if (EgretFactory._factory === null) {
                    dragonBones.registerGetterSetter();
                    dragonBones.egretWASMInit();
                    EgretFactory._factory = new EgretFactory();
                }
                return EgretFactory._factory;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @private
         */
        EgretFactory.prototype._isSupportMesh = function () {
            if (egret.Capabilities.renderMode === "webgl" || egret.Capabilities.runtimeType === egret.RuntimeType.NATIVE) {
                return true;
            }
            console.warn("Canvas can not support mesh, please change renderMode to webgl.");
            return false;
        };
        /**
         * @private
         */
        EgretFactory.prototype._buildTextureAtlasData = function (textureAtlasData, textureAtlas) {
            if (textureAtlasData !== null) {
                if (textureAtlas["textureId"] === null) {
                    egret.WebAssemblyNode.setValuesToBitmapData(textureAtlas);
                }
                textureAtlasData.renderTexture = textureAtlas;
            }
            else {
                textureAtlasData = new dragonBones.EgretTextureAtlasData(this._rawTextures);
            }
            return textureAtlasData;
        };
        /**
         * @private
         */
        EgretFactory.prototype._buildArmature = function (dataPackage) {
            var armature = new Module['EgretArmature']();
            var armatureDisplay = new dragonBones.EgretArmatureDisplay();
            var armatureProxy = new dragonBones.EgretArmatureProxy(armatureDisplay);
            var displayID = armatureDisplay.$waNode.id;
            armature.init(dataPackage.armature, armatureProxy, displayID, EgretFactory._dragonBones);
            armatureDisplay.init(armature);
            return armature;
        };
        /**
         * @private
         */
        EgretFactory.prototype._buildSlots = function (dataPackage, armature) {
            var currentSkin = dataPackage.skin;
            var defaultSkin = dataPackage.armature.defaultSkin;
            if (currentSkin === null || defaultSkin === null) {
                return;
            }
            var currentSkinSlotNames = currentSkin.getSkinSlotNames();
            var defaultSkinSlotNames = defaultSkin.getSkinSlotNames();
            var skinSlots = {};
            // for (let k in defaultSkin.displays) {
            for (var i = 0, l = defaultSkinSlotNames.size(); i < l; ++i) {
                var slotName = defaultSkinSlotNames.get(i);
                var displays = defaultSkin.getDisplays(slotName);
                if (displays !== null) {
                    skinSlots[slotName] = displays;
                }
            }
            if (currentSkin !== defaultSkin) {
                // for (let k in currentSkin.displays) {
                for (var i = 0, l = currentSkinSlotNames.size(); i < l; ++i) {
                    var slotName = currentSkinSlotNames.get(i);
                    var displays = currentSkin.getDisplays(slotName);
                    if (displays !== null) {
                        skinSlots[slotName] = displays;
                    }
                }
            }
            // for (const slotData of dataPackage.armature.sortedSlots) {
            var slots = dataPackage.armature.sortedSlots;
            for (var i = 0, l = slots.size(); i < l; ++i) {
                var slotData = slots.get(i);
                if (!(slotData.name in skinSlots)) {
                    continue;
                }
                var displays = skinSlots[slotData.name];
                var slot = this._buildSlot(dataPackage, slotData, displays, armature);
                var displayList = new Module["EgretSlotDisplayVector"]();
                for (var i_3 = 0, l_1 = displays.size(); i_3 < l_1; ++i_3) {
                    var displayData = displays.get(i_3);
                    if (displayData !== null) {
                        var display = this._getSlotDisplay(dataPackage, displayData, null, slot);
                        if (display === null) {
                            var displayWrapper = dragonBones.createEgretDisplay(display, 0 /* Image */);
                            displayList.push_back(displayWrapper);
                        }
                        else if (display.getDisplayType() === 1 /* Armature */) {
                            var displayWrapper = dragonBones.createEgretDisplay(display, 1 /* Armature */);
                            displayList.push_back(displayWrapper);
                        }
                        else {
                            displayList.push_back(display);
                        }
                    }
                    else {
                        var displayWrapper = dragonBones.createEgretDisplay(null, 0 /* Image */);
                        displayList.push_back(displayWrapper);
                    }
                }
                armature.addSlot(slot, slotData.parent.name);
                slot._setEgretDisplayList(displayList);
                slot._setDisplayIndex(slotData.displayIndex, true);
            }
        };
        /**
         * @private
         */
        EgretFactory.prototype._buildSlot = function (dataPackage, slotData, displays, armature) {
            dataPackage;
            armature;
            var slot = new dragonBones.EgretSlot();
            slot.init(slotData, displays, new egret.Bitmap(), new egret.Mesh());
            return slot;
        };
        /**
         * @private
         */
        EgretFactory.prototype.parseTextureAtlasData = function (rawData, textureAtlas, name, scale) {
            if (name === void 0) { name = null; }
            if (scale === void 0) { scale = 0.0; }
            this._rawTextures = rawData ? rawData.SubTexture : null;
            return _super.prototype.parseTextureAtlasData.call(this, rawData, textureAtlas, name, scale);
        };
        /**
         * 创建一个指定名称的骨架。
         * @param armatureName 骨架名称。
         * @param dragonBonesName 龙骨数据名称，如果未设置，将检索所有的龙骨数据，如果多个数据中包含同名的骨架数据，可能无法创建出准确的骨架。
         * @param skinName 皮肤名称，如果未设置，则使用默认皮肤。
         * @param textureAtlasName 贴图集数据名称，如果未设置，则使用龙骨数据。
         * @returns 骨架的显示容器。
         * @see dragonBones.EgretArmatureDisplay
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EgretFactory.prototype.buildArmatureDisplay = function (armatureName, dragonBonesName, skinName, textureAtlasName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (skinName === void 0) { skinName = null; }
            if (textureAtlasName === void 0) { textureAtlasName = null; }
            var armature = this.buildArmature(armatureName, dragonBonesName, skinName, textureAtlasName);
            if (armature !== null) {
                EgretFactory.clock.add(armature);
                return armature.display;
            }
            return null;
        };
        /**
         * 获取带有指定贴图的显示对象。
         * @param textureName 指定的贴图名称。
         * @param textureAtlasName 指定的贴图集数据名称，如果未设置，将检索所有的贴图集数据。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        EgretFactory.prototype.getTextureDisplay = function (textureName, textureAtlasName) {
            if (textureAtlasName === void 0) { textureAtlasName = null; }
            var textureData = this._getTextureData(textureAtlasName !== null ? textureAtlasName : "", textureName);
            if (textureData !== null && textureData.texture === null) {
                return new egret.Bitmap(textureData.texture);
            }
            return null;
        };
        /*
         * @private
         */
        EgretFactory.prototype._getSlotDisplay = function (dataPackage, displayData, rawDisplayData, slot) {
            var dataName = dataPackage !== null ? dataPackage.dataName : displayData.parent.parent.name;
            var display = null;
            switch (displayData.type) {
                case 0 /* Image */:
                    var imageDisplayData = displayData;
                    if (imageDisplayData.texture === null) {
                        imageDisplayData.texture = this._getTextureData(dataName, displayData.path);
                    }
                    else if (dataPackage !== null && dataPackage.textureAtlasName.length > 0) {
                        imageDisplayData.texture = this._getTextureData(dataPackage.textureAtlasName, displayData.path);
                    }
                    if (rawDisplayData !== null && rawDisplayData.type === 2 /* Mesh */ && this._isSupportMesh()) {
                        display = slot.getMeshWASMDisplay();
                    }
                    else {
                        display = slot.getRawWASMDisplay();
                    }
                    break;
                case 2 /* Mesh */:
                    var meshDisplayData = displayData;
                    if (meshDisplayData.texture === null) {
                        meshDisplayData.texture = this._getTextureData(dataName, meshDisplayData.path);
                    }
                    else if (dataPackage !== null && dataPackage.textureAtlasName.length > 0) {
                        meshDisplayData.texture = this._getTextureData(dataPackage.textureAtlasName, meshDisplayData.path);
                    }
                    if (this._isSupportMesh()) {
                        display = slot.getMeshWASMDisplay();
                    }
                    else {
                        display = slot.getRawWASMDisplay();
                    }
                    break;
                case 1 /* Armature */:
                    var armatureDisplayData = displayData;
                    var childArmature = this.buildArmature(armatureDisplayData.path, dataName, null, dataPackage !== null ? dataPackage.textureAtlasName : null);
                    if (childArmature !== null) {
                        childArmature.inheritAnimation = armatureDisplayData.inheritAnimation;
                        if (!childArmature.inheritAnimation) {
                            var actions = armatureDisplayData.actions.length > 0 ? armatureDisplayData.actions : childArmature.armatureData.defaultActions;
                            if (actions.length > 0) {
                                for (var _i = 0, actions_3 = actions; _i < actions_3.length; _i++) {
                                    var action = actions_3[_i];
                                    childArmature.animation.fadeIn(action.name); // TODO action should be do after advanceTime.
                                }
                            }
                            else {
                                childArmature.animation.play();
                            }
                        }
                        armatureDisplayData.armature = childArmature.armatureData; // 
                    }
                    display = childArmature;
                    break;
            }
            return display;
        };
        /**
         * public
         */
        EgretFactory.prototype.changeSkin = function (armature, skin, exclude) {
            if (exclude === void 0) { exclude = null; }
            // for (const slot of armature.getSlots()) {
            var slots = armature.getSlots();
            for (var i = 0, l = slots.size(); i < l; ++i) {
                var slot = slots.get(i);
                if ((exclude !== null && exclude.indexOf(slot.name) >= 0)) {
                    continue;
                }
                var displays = skin.displays.get(slot.name);
                if (displays === null || displays === undefined) {
                    continue;
                }
                var displayList = slot.getEgretDisplayList(); // Copy.
                if (displayList === null || displayList === undefined) {
                    console.log("Slot does not has displayList" + slot.name);
                    continue;
                }
                var datalen = displays.size();
                displayList.resize(datalen, null); // Modify displayList length.
                for (var i_4 = 0, l_2 = displays.size(); i_4 < l_2; ++i_4) {
                    var currData = displays.get(i_4);
                    var currSlot = this._getSlotDisplay(null, currData, null, slot);
                    if (currSlot.getDisplayType() == 1 /* Armature */) {
                        var displayWrapper = dragonBones.createEgretDisplay(currSlot, 1 /* Armature */);
                        displayList.set(i_4, displayWrapper);
                    }
                    else {
                        displayList.set(i_4, currSlot);
                    }
                }
                slot.switchDisplayData(displays);
                //TODO
                // slot.displayList = displayList;
                slot.setEgretDisplayList(displayList);
            }
        };
        /**
         * 用指定资源替换指定插槽的显示对象。(用 "dragonBonesName/armatureName/slotName/displayName" 的资源替换 "slot" 的显示对象)
         * @param dragonBonesName 指定的龙骨数据名称。
         * @param armatureName 指定的骨架名称。
         * @param slotName 指定的插槽名称。
         * @param displayName 指定的显示对象名称。
         * @param slot 指定的插槽实例。
         * @param displayIndex 要替换的显示对象的索引，如果未设置，则替换当前正在显示的显示对象。
         * @version DragonBones 4.5
         * @language zh_CN
         */
        EgretFactory.prototype.replaceSlotDisplay = function (dragonBonesName, armatureName, slotName, displayName, slot, displayIndex) {
            if (displayIndex === void 0) { displayIndex = -1; }
            var dataPackage = {};
            if (!this._fillBuildArmaturePackage(dataPackage, dragonBonesName || "", armatureName, "", "") || dataPackage.skin === null) {
                return;
            }
            var displays = dataPackage.skin.getDisplays(slotName);
            if (displays === null) {
                return;
            }
            // for (const display of displays) {
            for (var i = 0, l = displays.size(); i < l; ++i) {
                var display = displays.get(i);
                if (display !== null && display.name === displayName) {
                    this._replaceSlotDisplay(dataPackage, display, slot, displayIndex);
                    break;
                }
            }
        };
        /**
         * @private
         */
        EgretFactory.prototype._replaceSlotDisplay = function (dataPackage, displayData, slot, displayIndex) {
            if (displayIndex < 0) {
                displayIndex = slot.displayIndex;
            }
            if (displayIndex < 0) {
                displayIndex = 0;
            }
            var displayList = slot.getEgretDisplayList(); // Copy.
            if (displayList.size() <= displayIndex) {
                displayList.resize(displayIndex + 1, null);
            }
            slot.replaceDisplayData(displayData, displayIndex);
            if (displayData !== null) {
                displayList[displayIndex] = this._getSlotDisplay(dataPackage, displayData, null, slot);
            }
            else {
                displayList[displayIndex] = null;
            }
            slot.setEgretDisplayList(displayList);
        };
        Object.defineProperty(EgretFactory.prototype, "soundEventManager", {
            /**
             * 获取全局声音事件管理器。
             * @version DragonBones 4.5
             * @language zh_CN
             */
            get: function () {
                return EgretFactory._eventManager;
            },
            enumerable: true,
            configurable: true
        });
        EgretFactory._time = 0;
        EgretFactory._dragonBones = null;
        EgretFactory._factory = null;
        return EgretFactory;
    }(dragonBones.BaseFactory));
    dragonBones.EgretFactory = EgretFactory;
})(dragonBones || (dragonBones = {}));
