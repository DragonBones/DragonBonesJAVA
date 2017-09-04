package com.dragonbones.geom;

/**
 * @private
 */
public class ColorTransform {
    public float alphaMultiplier, redMultiplier, greenMultiplier, blueMultiplier;
    public int alphaOffset, redOffset, greenOffset, blueOffset;

    /*
    public ColorTransform(
        float alphaMultiplier = 1f, float redMultiplier = 1f, float greenMultiplier = 1f, float blueMultiplier = 1f,
        int alphaOffset = 0, int redOffset = 0, int greenOffset = 0, int blueOffset = 0
    ) {
    }
    */

    public ColorTransform() {
        this(1, 1, 1, 1, 0, 0, 0, 0);
    }

    public ColorTransform(
            float alphaMultiplier, float redMultiplier, float greenMultiplier, float blueMultiplier,
            int alphaOffset, int redOffset, int greenOffset, int blueOffset
    ) {
        this.alphaMultiplier = alphaMultiplier;
        this.redMultiplier = redMultiplier;
        this.greenMultiplier = greenMultiplier;
        this.blueMultiplier = blueMultiplier;
        this.alphaOffset = alphaOffset;
        this.redOffset = redOffset;
        this.greenOffset = greenOffset;
        this.blueOffset = blueOffset;
    }

    public void copyFrom(ColorTransform value) {
        this.alphaMultiplier = value.alphaMultiplier;
        this.redMultiplier = value.redMultiplier;
        this.greenMultiplier = value.greenMultiplier;
        this.blueMultiplier = value.blueMultiplier;
        this.alphaOffset = value.alphaOffset;
        this.redOffset = value.redOffset;
        this.greenOffset = value.greenOffset;
        this.blueOffset = value.blueOffset;
    }

    public void identity() {
        this.alphaMultiplier = this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 1f;
        this.alphaOffset = this.redOffset = this.greenOffset = this.blueOffset = 0;
    }
}
