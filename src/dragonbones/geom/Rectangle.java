package dragonbones.geom;

/**
 * 矩形区域
 *
 * @author mebius
 */
public class Rectangle {

    /**
     * x轴坐标
     */
    public double x;

    /**
     * y轴坐标
     */
    public double y;

    /**
     * 宽度
     */
    public double width;

    /**
     * 高度
     */
    public double height;

    /**
     * 创建一个 dragonbones.geom.Rectangle 对象<br>
     * create a dragonbones.geom.Rectangle object.
     *
     * @param x
     * @param y
     * @param width
     * @param height
     */
    public Rectangle(double x, double y, double width, double height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * 复制一个 dragonbones.geom.Rectangle 对象<br>
     * copy a dragonbones.geom.Rectangle object.
     * @param value source dragonbones.geom.Rectangle object
     */
    public void copyFrom(Rectangle value) {
        this.x = value.x;
        this.y = value.y;
        this.width = value.width;
        this.height = value.height;
    }

    /**
     * 清除数据,将所有数据设置为0<br>
     * clear all data, set x,y,width,height to 0.
     */
    public void clear() {
        this.x = this.y = 0;
        this.width = this.height = 0;
    }
}
