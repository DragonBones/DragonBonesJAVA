package com.dragonbones.geom;

import com.dragonbones.util.FloatArray;

/**
 * 2D 矩阵。
 *
 * @version DragonBones 3.0
 * @language zh_CN
 */
public class Matrix {
    public float a, b, c, d, tx, ty;

    public Matrix() {
        this(1, 0, 0, 1, 0, 0);
    }

    public Matrix(float a, float b, float c, float d, float tx, float ty) {
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
    public String toString() {
        return "[object dragonBones.Matrix] a:" + this.a + " b:" + this.b + " c:" + this.c + " d:" + this.d + " tx:" + this.tx + " ty:" + this.ty;
    }

    /**
     * @private
     */
    public Matrix copyFrom(Matrix value) {
        this.a = value.a;
        this.b = value.b;
        this.c = value.c;
        this.d = value.d;
        this.tx = value.tx;
        this.ty = value.ty;

        return this;
    }

    /**
     * @param value
     * @private
     */
    public Matrix copyFromArray(FloatArray value) {
        return copyFromArray(value, 0);
    }

    /**
     * @private
     */
    public Matrix copyFromArray(FloatArray value, int offset) {
        this.a = value.get(offset);
        this.b = value.get(offset + 1);
        this.c = value.get(offset + 2);
        this.d = value.get(offset + 3);
        this.tx = value.get(offset + 4);
        this.ty = value.get(offset + 5);

        return this;
    }

    /**
     * 转换为单位矩阵。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Matrix identity() {
        this.a = this.d = 1f;
        this.b = this.c = 0f;
        this.tx = this.ty = 0f;

        return this;
    }

    /**
     * 将当前矩阵与另一个矩阵相乘。
     *
     * @param value 需要相乘的矩阵。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Matrix concat(Matrix value) {
        float aA = this.a * value.a;
        float bA = 0f;
        float cA = 0f;
        float dA = this.d * value.d;
        float txA = this.tx * value.a + value.tx;
        float tyA = this.ty * value.d + value.ty;

        if (this.b != 0f || this.c != 0f) {
            aA += this.b * value.c;
            bA += this.b * value.d;
            cA += this.c * value.a;
            dA += this.c * value.b;
        }

        if (value.b != 0f || value.c != 0f) {
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
    }

    /**
     * 转换为逆矩阵。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public Matrix invert() {
        float aA = this.a;
        float bA = this.b;
        float cA = this.c;
        float dA = this.d;
        final float txA = this.tx;
        final float tyA = this.ty;

        if (bA == 0f && cA == 0f) {
            this.b = this.c = 0f;
            if (aA == 0f || dA == 0f) {
                this.a = this.b = this.tx = this.ty = 0f;
            } else {
                aA = this.a = 1f / aA;
                dA = this.d = 1f / dA;
                this.tx = -aA * txA;
                this.ty = -dA * tyA;
            }

            return this;
        }

        float determinant = aA * dA - bA * cA;
        if (determinant == 0f) {
            this.a = this.d = 1f;
            this.b = this.c = 0f;
            this.tx = this.ty = 0f;

            return this;
        }

        determinant = 1f / determinant;
        float k = this.a = dA * determinant;
        bA = this.b = -bA * determinant;
        cA = this.c = -cA * determinant;
        dA = this.d = aA * determinant;
        this.tx = -(k * txA + cA * tyA);
        this.ty = -(bA * txA + dA * tyA);

        return this;
    }

    /**
     * 将矩阵转换应用于指定点。
     *
     * @param x      横坐标。
     * @param y      纵坐标。
     * @param result 应用转换之后的坐标。
     * @params delta 是否忽略 tx，ty 对坐标的转换。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void transformPoint(float x, float y, Point result) {
        transformPoint(x, y, result, false);
    }

    /**
     * 将矩阵转换应用于指定点。
     *
     * @param x      横坐标。
     * @param y      纵坐标。
     * @param result 应用转换之后的坐标。
     * @params delta 是否忽略 tx，ty 对坐标的转换。
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public void transformPoint(float x, float y, Point result, boolean delta) {
        result.x = this.a * x + this.c * y;
        result.y = this.b * x + this.d * y;

        if (!delta) {
            result.x += this.tx;
            result.y += this.ty;
        }
    }
}
