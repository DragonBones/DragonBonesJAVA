/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dragonbones.geom;

/**
 * Transform
 *
 * @author mebius
 */
public class Transform {

    public double x;
    public double y;
    public double skewX;
    public double skewY;
    public double scaleX;
    public double scaleY;

    public Transform() {
        this.x = 0;
        this.y = 0;
        this.skewX = 0;
        this.skewY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
    }

    public String toString() {
        return "[object dragonBones.Transform] x:" + this.x + " y:" + this.y + " skewX:" + this.skewX * 180 / Math.PI + " skewY:" + this.skewY * 180 / Math.PI + " scaleX:" + this.scaleX + " scaleY:" + this.scaleY;
    }

    public Transform copyFrom(Transform value) {
        this.x = value.x;
        this.y = value.y;
        this.skewX = value.skewX;
        this.skewY = value.skewY;
        this.scaleX = value.scaleX;
        this.scaleY = value.scaleY;

        return this;
    }

    public Transform clone() {
        Transform value = new Transform();
        value.copyFrom(this);

        return value;
    }

    public Transform identity() {
        this.x = this.y = this.skewX = this.skewY = 0;
        this.scaleX = this.scaleY = 1;

        return this;
    }

    public Transform add(Transform value) {
        this.x += value.x;
        this.y += value.y;
        this.skewX += value.skewX;
        this.skewY += value.skewY;
        this.scaleX *= value.scaleX;
        this.scaleY *= value.scaleY;

        return this;
    }

    public Transform minus(Transform value) {
        this.x -= value.x;
        this.y -= value.y;
        this.skewX = Transform.normalizeRadian(this.skewX - value.skewX);
        this.skewY = Transform.normalizeRadian(this.skewY - value.skewY);
        this.scaleX /= value.scaleX;
        this.scaleY /= value.scaleY;

        return this;
    }

    public Transform fromMatrix(Matrix matrix) {
        double PI_Q = Math.PI * 0.25;

        double backupScaleX = this.scaleX, backupScaleY = this.scaleY;

        this.x = matrix.tx;
        this.y = matrix.ty;

        this.skewX = Math.atan(-matrix.c / matrix.d);
        this.skewY = Math.atan(matrix.b / matrix.a);
        if (this.skewX != this.skewX) {
            this.skewX = 0;
        }
        if (this.skewY != this.skewY) {
            this.skewY = 0;
        }

        this.scaleY = (this.skewX > -PI_Q && this.skewX < PI_Q) ? matrix.d / Math.cos(this.skewX) : -matrix.c / Math.sin(this.skewX);
        this.scaleX = (this.skewY > -PI_Q && this.skewY < PI_Q) ? matrix.a / Math.cos(this.skewY) : matrix.b / Math.sin(this.skewY);

        if (backupScaleX >= 0 && this.scaleX < 0) {
            this.scaleX = -this.scaleX;
            this.skewY = this.skewY - Math.PI;
        }

        if (backupScaleY >= 0 && this.scaleY < 0) {
            this.scaleY = -this.scaleY;
            this.skewX = this.skewX - Math.PI;
        }

        return this;
    }

    public void toMatrix(Matrix matrix) {
        matrix.a = this.scaleX * Math.cos(this.skewY);
        matrix.b = this.scaleX * Math.sin(this.skewY);
        matrix.c = -this.scaleY * Math.sin(this.skewX);
        matrix.d = this.scaleY * Math.cos(this.skewX);
        matrix.tx = this.x;
        matrix.ty = this.y;
    }

    public double getRotation() {
        return this.skewY;
    }

    public void setRotation(double value) {
        double dValue = value - this.skewY;
        this.skewX += dValue;
        this.skewY += dValue;
    }

    /**
     * normalize radian value<br>
     *
     * @param value
     * @return
     */
    public static double normalizeRadian(double value) {
        value = (value + Math.PI) % (Math.PI * 2);
        value += value > 0 ? -Math.PI : Math.PI;

        return value;
    }
}
