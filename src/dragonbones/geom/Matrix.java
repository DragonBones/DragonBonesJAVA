package dragonbones.geom;

/**
 * 2D 矩阵<br>
 * 2D Matrix
 *
 * @author mebius
 */
public class Matrix {

    /**
     *
     */
    public double a;

    /**
     *
     */
    public double b;

    /**
     *
     */
    public double c;

    /**
     *
     */
    public double d;

    /**
     *
     */
    public double tx;

    /**
     *
     */
    public double ty;

    /**
     * 创建一个 dragonbones.geom.Matrix 对象.<br>
     * create a dragonbones.geom.Matrix object.
     */
    public Matrix() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;
    }

    /**
     * 复制矩阵<br>
     * copy a matrix object
     *
     * @param m 需要复制的矩阵<br>source matrix object
     */
    public void copyFrom(Matrix m) {
        this.tx = m.tx;
        this.ty = m.ty;
        this.a = m.a;
        this.b = m.b;
        this.c = m.c;
        this.d = m.d;
    }

    /**
     * 转换为恒等矩阵<br>
     * conversion to identity matrix
     */
    public void identity() {
        this.a = this.d = 1;
        this.b = this.c = 0;
        this.tx = this.ty = 0;
    }

    /**
     * 将当前矩阵与另一个矩阵相乘.<br>
     * multiply a matrix
     *
     * @param m 需要相乘的矩阵<br>other matrix object
     */
    public void concat(Matrix m) {
        double ma = m.a;
        double mb = m.b;
        double mc = m.c;
        double md = m.d;
        double tx1 = this.tx;
        double ty1 = this.ty;

        if (ma != 1 || mb != 0 || mc != 0 || md != 1) {
            double a1 = this.a;
            double b1 = this.b;
            double c1 = this.c;
            double d1 = this.d;

            this.a = a1 * ma + b1 * mc;
            this.b = a1 * mb + b1 * md;
            this.c = c1 * ma + d1 * mc;
            this.d = c1 * mb + d1 * md;
        }

        this.tx = tx1 * ma + ty1 * mc + m.tx;
        this.ty = tx1 * mb + ty1 * md + m.ty;
    }

    /**
     * 转换为逆矩阵<br>
     * inverse matrix
     */
    public void invert() {
        double a1 = this.a;
        double b1 = this.b;
        double c1 = this.c;
        double d1 = this.d;
        double tx1 = this.tx;
        double n = a1 * d1 - b1 * c1;

        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = (c1 * this.ty - d1 * tx1) / n;
        this.ty = -(a1 * this.ty - b1 * tx1) / n;
    }

    /**
     * 将矩阵转换应用于指定点<br>
     * change matrix object with a point
     *
     * @param x 横坐标
     * @param y 纵坐标
     * @param rel_x 应用转换之后的横坐标
     * @param rel_y 应用转换之后的纵坐标
     * @param delta delta 是否忽略 tx，ty 对坐标的转换
     */
    public void transformPoint(double x, double y, double rel_x, double rel_y, boolean delta) {
        rel_x = this.a * x + this.c * y;
        rel_y = this.b * x + this.d * y;
        if (!delta) {
            rel_x += this.tx;
            rel_y += this.ty;
        }
    }

}
