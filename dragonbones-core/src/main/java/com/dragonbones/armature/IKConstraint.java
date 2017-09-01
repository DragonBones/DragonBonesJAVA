package com.dragonbones.armature;

import com.dragonbones.geom.Matrix;
import com.dragonbones.geom.Transform;

/**
 * @private
 * @internal
 */
public class IKConstraint extends Constraint {
    public boolean bendPositive;
    public boolean scaleEnabled; // TODO
    public float weight;

    protected void _onClear() {
        super._onClear();

        this.bendPositive = false;
        this.scaleEnabled = false;
        this.weight = 1f;
    }

    private void _computeA() {
        Transform ikGlobal = this.target.global;
        Transform global = this.bone.global;
        Matrix globalTransformMatrix = this.bone.globalTransformMatrix;
        // const boneLength = this.bone.boneData.length;
        // const x = globalTransformMatrix.a * boneLength;

        float ikRadian = (float) Math.atan2(ikGlobal.y - global.y, ikGlobal.x - global.x);
        if (global.scaleX < 0f) {
            ikRadian += Math.PI;
        }

        global.rotation += (ikRadian - global.rotation) * this.weight;
        global.toMatrix(globalTransformMatrix);
    }

    private void _computeB() {
        float boneLength = this.bone.boneData.length;
        Bone parent = this.root;
        Transform ikGlobal = this.target.global;
        Transform parentGlobal = parent.global;
        Transform global = this.bone.global;
        Matrix globalTransformMatrix = this.bone.globalTransformMatrix;

        float x = globalTransformMatrix.a * boneLength;
        float y = globalTransformMatrix.b * boneLength;

        float lLL = x * x + y * y;
        float lL = (float) Math.sqrt(lLL);

        float dX = global.x - parentGlobal.x;
        float dY = global.y - parentGlobal.y;
        float lPP = dX * dX + dY * dY;
        float lP = (float) Math.sqrt(lPP);
        float rawRadianA = (float) Math.atan2(dY, dX);

        dX = ikGlobal.x - parentGlobal.x;
        dY = ikGlobal.y - parentGlobal.y;
        float lTT = dX * dX + dY * dY;
        float lT = (float) Math.sqrt(lTT);

        float ikRadianA = 0f;
        if (lL + lP <= lT || lT + lL <= lP || lT + lP <= lL) {
            ikRadianA = (float) Math.atan2(ikGlobal.y - parentGlobal.y, ikGlobal.x - parentGlobal.x);
            if (lL + lP <= lT) {
            } else if (lP < lL) {
                ikRadianA += Math.PI;
            }
        } else {
            float h = (float) ((lPP - lLL + lTT) / (2.0 * lTT));
            float r = (float) (Math.sqrt(lPP - h * h * lTT) / lT);
            float hX = parentGlobal.x + (dX * h);
            float hY = parentGlobal.y + (dY * h);
            float rX = -dY * r;
            float rY = dX * r;

            boolean isPPR = false;
            if (parent._parent != null) {
                Matrix parentParentMatrix = parent._parent.globalTransformMatrix;
                isPPR = parentParentMatrix.a * parentParentMatrix.d - parentParentMatrix.b * parentParentMatrix.c < 0f;
            }

            if (isPPR != this.bendPositive) {
                global.x = hX - rX;
                global.y = hY - rY;
            } else {
                global.x = hX + rX;
                global.y = hY + rY;
            }

            ikRadianA = (float) Math.atan2(global.y - parentGlobal.y, global.x - parentGlobal.x);
        }

        float dR = (ikRadianA - rawRadianA) * this.weight;
        parentGlobal.rotation += dR;
        parentGlobal.toMatrix(parent.globalTransformMatrix);

        float parentRadian = rawRadianA + dR;
        global.x = (float) (parentGlobal.x + Math.cos(parentRadian) * lP);
        global.y = (float) (parentGlobal.y + Math.sin(parentRadian) * lP);

        float ikRadianB = (float) Math.atan2(ikGlobal.y - global.y, ikGlobal.x - global.x);
        if (global.scaleX < 0f) {
            ikRadianB += Math.PI;
        }

        dR = (ikRadianB - global.rotation) * this.weight;
        global.rotation += dR;
        global.toMatrix(globalTransformMatrix);
    }

    public void update() {
        if (this.root == null) {
            this.bone.updateByConstraint();
            this._computeA();
        } else {
            this.root.updateByConstraint();
            this.bone.updateByConstraint();
            this._computeB();
        }
    }
}
