/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dragonbones.geom;

/**
 * 颜色信息
 *
 * @author mebius
 */
public class ColorTransform {

    /**
     *
     */
    public double alphaMultiplier = 1;

    /**
     *
     */
    public double alphaOffset = 0;

    /**
     *
     */
    public double blueMultiplier = 1;

    /**
     *
     */
    public double blueOffset = 0;

    /**
     *
     */
    public double greenMultiplier = 1;

    /**
     *
     */
    public double greenOffset = 0;

    /**
     *
     */
    public double redMultiplier = 1;

    /**
     *
     */
    public double redOffset = 0;

    /**
     * 创建一个 dragonbones.geom.ColorTransform 对象<br>
     * create a dragonbones.geom.ColorTransform object
     */
    public ColorTransform() {
        this.alphaMultiplier = 1;
        this.alphaOffset = 0;
        this.blueMultiplier = 1;
        this.blueOffset = 0;
        this.greenMultiplier = 1;
        this.greenOffset = 0;
        this.redMultiplier = 1;
        this.redOffset = 0;
    }

    /**
     * 复制一个 ColorTransform 对象<br>
     * copy a ColorTransform object
     * @param value 数据源<br>source ColorTransform object
     */
    public void copyFrom(ColorTransform value) {
        this.alphaMultiplier = value.alphaMultiplier;
        this.redMultiplier = value.redMultiplier;
        this.greenMultiplier = value.greenMultiplier;
        this.blueMultiplier = value.blueMultiplier;
        this.alphaOffset = value.alphaOffset;
        this.redOffset = value.redOffset;
        this.redOffset = value.redOffset;
        this.greenOffset = value.blueOffset;
    }

    /**
     * 转换为恒等矩阵<br>
     * conversion to identity ColorTransform<br>
     * alphaMultiplier = 1 <br>
     * redMultiplier = 1 <br>
     * greenMultiplier = 1 <br>
     * blueMultiplier = 1 <br>
     * alphaOffset = 0 <br>
     * redOffset = 0 <br>
     * greenOffset = 0 <br>
     * blueOffset = 0
     */
    public void identity() {
        this.alphaMultiplier = this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 1;
        this.alphaOffset = this.redOffset = this.greenOffset = this.blueOffset = 0;
    }

}
