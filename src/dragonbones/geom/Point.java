package dragonbones.geom;

/**
 * 坐标点
 * @author mebius
 */
public class Point {
    
    /**
     * x轴坐标
     */
    public double x;

    /**
     * y轴坐标
     */
    public double y;
    
    /**
     * 创建一个 dragonbones.geom.Point 对象
     * @param x x轴坐标
     * @param y y轴坐标
     */
    public Point(double x, double y)
    {
	this.x = x;
	this.y = y;
    }
    /**
     * 返回字符串形式
     * @return 当前 dragonbones.geom.Point 对象字符串形式内容
     */
    public String toString()
    {
	return "[Point (x=" + this.x + " y=" + this.y + ")]";
    }
}
