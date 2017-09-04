namespace dragonBones {
    /**
     * 2D 变换。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    export class Transform {
        /**
         * @private
         */
        public static readonly PI_D: number = Math.PI * 2.0;
        /**
         * @private
         */
        public static readonly PI_H: number = Math.PI / 2.0;
        /**
         * @private
         */
        public static readonly PI_Q: number = Math.PI / 4.0;
        /**
         * @private
         */
        public static readonly RAD_DEG: number = 180.0 / Math.PI;
        /**
         * @private
         */
        public static readonly DEG_RAD: number = Math.PI / 180.0;
        /**
         * @private
         */
        public static normalizeRadian(value: number): number {
            value = (value + Math.PI) % (Math.PI * 2.0);
            value += value > 0.0 ? -Math.PI : Math.PI;

            return value;
        }

        public constructor(
            /**
             * 水平位移。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            public x: number = 0.0,
            /**
             * 垂直位移。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            public y: number = 0.0,
            /**
             * 倾斜。 (以弧度为单位)
             * @version DragonBones 3.0
             * @language zh_CN
             */
            public skew: number = 0.0,
            /**
             * 旋转。 (以弧度为单位)
             * @version DragonBones 3.0
             * @language zh_CN
             */
            public rotation: number = 0.0,
            /**
             * 水平缩放。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            public scaleX: number = 1.0,
            /**
             * 垂直缩放。
             * @version DragonBones 3.0
             * @language zh_CN
             */
            public scaleY: number = 1.0
        ) {
        }
        /**
         * @private
         */
        public toString(): string {
            return "[object dragonBones.Transform] x:" + this.x + " y:" + this.y + " skewX:" + this.skew * 180.0 / Math.PI + " skewY:" + this.rotation * 180.0 / Math.PI + " scaleX:" + this.scaleX + " scaleY:" + this.scaleY;
        }
        /**
         * @private
         */
        public copyFrom(value: Transform): Transform {
            this.x = value.x;
            this.y = value.y;
            this.skew = value.skew;
            this.rotation = value.rotation;
            this.scaleX = value.scaleX;
            this.scaleY = value.scaleY;

            return this;
        }
        /**
         * @private
         */
        public identity(): Transform {
            this.x = this.y = 0.0;
            this.skew = this.rotation = 0.0;
            this.scaleX = this.scaleY = 1.0;

            return this;
        }
        /**
         * @private
         */
        public add(value: Transform): Transform {
            this.x += value.x;
            this.y += value.y;
            this.skew += value.skew;
            this.rotation += value.rotation;
            this.scaleX *= value.scaleX;
            this.scaleY *= value.scaleY;

            return this;
        }
        /**
         * @private
         */
        public minus(value: Transform): Transform {
            this.x -= value.x;
            this.y -= value.y;
            this.skew -= value.skew;
            this.rotation -= value.rotation;
            this.scaleX /= value.scaleX;
            this.scaleY /= value.scaleY;

            return this;
        }
        /**
         * 矩阵转换为变换。
         * @param matrix 矩阵。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        public fromMatrix(matrix: Matrix): Transform {
            const backupScaleX = this.scaleX, backupScaleY = this.scaleY;
            const PI_Q = Transform.PI_Q;

            this.x = matrix.tx;
            this.y = matrix.ty;
            this.rotation = Math.atan(matrix.b / matrix.a);
            let skewX = Math.atan(-matrix.c / matrix.d);

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
        }
        /**
         * 转换为矩阵。
         * @param matrix 矩阵。
         * @version DragonBones 3.0
         * @language zh_CN
         */
        public toMatrix(matrix: Matrix): Transform {
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
        }
    }
}