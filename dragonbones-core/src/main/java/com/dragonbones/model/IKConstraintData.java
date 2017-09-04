package com.dragonbones.model;

/**
 * @private
 */
public class IKConstraintData extends ConstraintData {
    public boolean bendPositive;
    public boolean scaleEnabled;
    public float weight;

    protected void _onClear() {
        super._onClear();

        this.bendPositive = false;
        this.scaleEnabled = false;
        this.weight = 1f;
    }
}
