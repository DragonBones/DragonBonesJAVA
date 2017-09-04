package com.dragonbones.geom;

/**
 * 2D 变换。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 */
public class Transform {
    /**
     * @private
     */
    public static final float PI_D = (float) (Math.PI * 2.0);
    /**
     * @private
     */
    public static final float PI_H = (float) (Math.PI / 2.0);
    /**
     * @private
     */
    public static final float PI_Q = (float) (Math.PI / 4.0);
    /**
     * @private
     */
    public static final float RAD_DEG = (float) (180.0 / Math.PI);
    /**
     * @private
     */
    public static final float DEG_RAD = (float) (Math.PI / 180.0);

    /**
     * @private
     */
    public static float normalizeRadian(float value) {
        value = (float) ((value + Math.PI) % (Math.PI * 2.0));
        value += value > 0f ? -Math.PI : Math.PI;

        return value;
    }

    /**
     * 水平位移。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float x;
    /**
     * 垂直位移。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float y;
    /**
     * 倾斜。 (以弧度为单位)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float skew;
    /**
     * 旋转。 (以弧度为单位)
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float rotation;
    /**
     * 水平缩放。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float scaleX;
    /**
     * 垂直缩放。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public float scaleY;

    public Transform() {
        this(0, 0, 0, 0, 1, 1);
    }

    public Transform(float x, float y, float skew, float rotation, float scaleX, float scaleY) {
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
    public String toString() {
        return "[object dragonBones.Transform] x:" + this.x + " y:" + this.y + " skewX:" + this.skew * 180.0 / Math.PI + " skewY:" + this.rotation * 180.0 / Math.PI + " scaleX:" + this.scaleX + " scaleY:" + this.scaleY;
    }

    /**
     * @private
     */
    public Transform copyFrom(Transform value) {
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
    public Transform identity() {
        this.x = this.y = 0f;
        this.skew = this.rotation = 0f;
        this.scaleX = this.scaleY = 1f;

        return this;
    }

    /**
     * @private
     */
    public Transform add(Transform value) {
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
    public Transform minus(Transform value) {
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
     *
     * @param matrix 矩阵。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Transform fromMatrix(Matrix matrix) {
        final float backupScaleX = this.scaleX, backupScaleY = this.scaleY;
        final float PI_Q = Transform.PI_Q;

        this.x = matrix.tx;
        this.y = matrix.ty;
        this.rotation = (float) Math.atan(matrix.b / matrix.a);
        float skewX = (float) Math.atan(-matrix.c / matrix.d);

        this.scaleX = (float) ((this.rotation > -PI_Q && this.rotation < PI_Q) ? matrix.a / Math.cos(this.rotation) : matrix.b / Math.sin(this.rotation));
        this.scaleY = (float) ((skewX > -PI_Q && skewX < PI_Q) ? matrix.d / Math.cos(skewX) : -matrix.c / Math.sin(skewX));

        if (backupScaleX >= 0f && this.scaleX < 0f) {
            this.scaleX = -this.scaleX;
            this.rotation = (float) (this.rotation - Math.PI);
        }

        if (backupScaleY >= 0f && this.scaleY < 0f) {
            this.scaleY = -this.scaleY;
            skewX = (float) (skewX - Math.PI);
        }

        this.skew = skewX - this.rotation;

        return this;
    }

    /**
     * 转换为矩阵。
     *
     * @param matrix 矩阵。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Transform toMatrix(Matrix matrix) {
        if (this.skew != 0f || this.rotation != 0f) {
            matrix.a = (float) Math.cos(this.rotation);
            matrix.b = (float) Math.sin(this.rotation);

            if (this.skew == 0f) {
                matrix.c = -matrix.b;
                matrix.d = matrix.a;
            } else {
                matrix.c = (float) -Math.sin(this.skew + this.rotation);
                matrix.d = (float) Math.cos(this.skew + this.rotation);
            }

            if (this.scaleX != 1f) {
                matrix.a *= this.scaleX;
                matrix.b *= this.scaleX;
            }

            if (this.scaleY != 1f) {
                matrix.c *= this.scaleY;
                matrix.d *= this.scaleY;
            }
        } else {
            matrix.a = this.scaleX;
            matrix.b = 0f;
            matrix.c = 0f;
            matrix.d = this.scaleY;
        }

        matrix.tx = this.x;
        matrix.ty = this.y;

        return this;
    }
}
