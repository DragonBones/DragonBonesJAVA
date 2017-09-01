package com.dragonbones.model;

import com.dragonbones.core.BoundingBoxType;
import com.dragonbones.geom.Point;
import org.jetbrains.annotations.Nullable;

/**
 * 椭圆边界框。
 *
 * @version DragonBones 5.1
 * @language zh_CN
 */
public class EllipseBoundingBoxData extends BoundingBoxData {
    public static int ellipseIntersectsSegment(
            float xA, float yA, float xB, float yB,
            float xC, float yC, float widthH, float heightH
    ) {
        return ellipseIntersectsSegment(xA, yA, xB, yB, xC, yC, widthH, heightH, null, null, null);
    }

    /**
     * @private
     */
    public static int ellipseIntersectsSegment(
            float xA, float yA, float xB, float yB,
            float xC, float yC, float widthH, float heightH,
            @Nullable Point intersectionPointA,
            @Nullable Point intersectionPointB,
            @Nullable Point normalRadians
    ) {
        float d = widthH / heightH;
        float dd = d * d;

        yA *= d;
        yB *= d;

        float dX = xB - xA;
        float dY = yB - yA;
        float lAB = (float) Math.sqrt(dX * dX + dY * dY);
        float xD = dX / lAB;
        float yD = dY / lAB;
        float a = (xC - xA) * xD + (yC - yA) * yD;
        float aa = a * a;
        float ee = xA * xA + yA * yA;
        float rr = widthH * widthH;
        float dR = rr - ee + aa;
        int intersectionCount = 0;

        if (dR >= 0f) {
            float dT = (float) Math.sqrt(dR);
            float sA = a - dT;
            float sB = a + dT;
            float inSideA = sA < 0f ? -1 : (sA <= lAB ? 0 : 1);
            float inSideB = sB < 0f ? -1 : (sB <= lAB ? 0 : 1);
            float sideAB = inSideA * inSideB;

            if (sideAB < 0) {
                return -1;
            } else if (sideAB == 0) {
                if (inSideA == -1) {
                    intersectionCount = 2; // 10
                    xB = xA + sB * xD;
                    yB = (yA + sB * yD) / d;

                    if (intersectionPointA != null) {
                        intersectionPointA.x = xB;
                        intersectionPointA.y = yB;
                    }

                    if (intersectionPointB != null) {
                        intersectionPointB.x = xB;
                        intersectionPointB.y = yB;
                    }

                    if (normalRadians != null) {
                        normalRadians.x = (float) Math.atan2(yB / rr * dd, xB / rr);
                        normalRadians.y = (float) (normalRadians.x + Math.PI);
                    }
                } else if (inSideB == 1) {
                    intersectionCount = 1; // 01
                    xA = xA + sA * xD;
                    yA = (yA + sA * yD) / d;

                    if (intersectionPointA != null) {
                        intersectionPointA.x = xA;
                        intersectionPointA.y = yA;
                    }

                    if (intersectionPointB != null) {
                        intersectionPointB.x = xA;
                        intersectionPointB.y = yA;
                    }

                    if (normalRadians != null) {
                        normalRadians.x = (float) Math.atan2(yA / rr * dd, xA / rr);
                        normalRadians.y = (float) (normalRadians.x + Math.PI);
                    }
                } else {
                    intersectionCount = 3; // 11

                    if (intersectionPointA != null) {
                        intersectionPointA.x = xA + sA * xD;
                        intersectionPointA.y = (yA + sA * yD) / d;

                        if (normalRadians != null) {
                            normalRadians.x = (float) Math.atan2(intersectionPointA.y / rr * dd, intersectionPointA.x / rr);
                        }
                    }

                    if (intersectionPointB != null) {
                        intersectionPointB.x = xA + sB * xD;
                        intersectionPointB.y = (yA + sB * yD) / d;

                        if (normalRadians != null) {
                            normalRadians.y = (float) Math.atan2(intersectionPointB.y / rr * dd, intersectionPointB.x / rr);
                        }
                    }
                }
            }
        }

        return intersectionCount;
    }

    /**
     * @private
     */
    protected void _onClear()

    {
        super._onClear();

        this.type = BoundingBoxType.Ellipse;
    }

    /**
     * @inherDoc
     */
    public boolean containsPoint(float pX, float pY)

    {
        float widthH = (float) (this.width * 0.5);
        if (pX >= -widthH && pX <= widthH) {
            float heightH = (float) (this.height * 0.5);
            if (pY >= -heightH && pY <= heightH) {
                pY *= widthH / heightH;
                return Math.sqrt(pX * pX + pY * pY) <= widthH;
            }
        }

        return false;
    }

    public int intersectsSegment(float xA, float yA, float xB, float yB) {
        return intersectsSegment(xA, yA, xB, yB, null, null, null);
    }


    /**
     * @inherDoc
     */
    public int intersectsSegment(
            float xA, float yA, float xB, float yB,
            @Nullable Point intersectionPointA,
            @Nullable Point intersectionPointB,
            @Nullable Point normalRadians
    )

    {
        return EllipseBoundingBoxData.ellipseIntersectsSegment(
                xA, yA, xB, yB,
                0f, 0f, this.width * 0.5f, this.height * 0.5f,
                intersectionPointA, intersectionPointB, normalRadians
        );
    }
}
