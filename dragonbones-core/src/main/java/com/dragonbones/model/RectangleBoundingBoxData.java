package com.dragonbones.model;

import com.dragonbones.core.BoundingBoxType;
import com.dragonbones.geom.Point;
import org.jetbrains.annotations.Nullable;

/**
 * 矩形边界框。
 *
 * @version DragonBones 5.1
 * @language zh_CN
 */
public class RectangleBoundingBoxData extends BoundingBoxData {
    /**
     * Compute the bit code for a point (x, y) using the clip rectangle
     */
    private static int _computeOutCode(float x, float y, float xMin, float yMin, float xMax, float yMax) {
        int code = OutCode.InSide.v;  // initialised as being inside of [[clip window]]

        if (x < xMin) {             // to the left of clip window
            code |= OutCode.Left.v;
        } else if (x > xMax) {        // to the right of clip window
            code |= OutCode.Right.v;
        }

        if (y < yMin) {             // below the clip window
            code |= OutCode.Top.v;
        } else if (y > yMax) {        // above the clip window
            code |= OutCode.Bottom.v;
        }

        return code;
    }

    public static int rectangleIntersectsSegment(
            float xA, float yA, float xB, float yB,
            float xMin, float yMin, float xMax, float yMax
    ) {
        return rectangleIntersectsSegment(xA, yA, xB, yB, xMin, yMin, xMax, yMax, null, null, null);
    }

    /**
     * @private
     */
    public static int rectangleIntersectsSegment(
            float xA, float yA, float xB, float yB,
            float xMin, float yMin, float xMax, float yMax,
            @Nullable Point intersectionPointA,
            @Nullable Point intersectionPointB,
            @Nullable Point normalRadians
    ) {
        boolean inSideA = xA > xMin && xA < xMax && yA > yMin && yA < yMax;
        boolean inSideB = xB > xMin && xB < xMax && yB > yMin && yB < yMax;

        if (inSideA && inSideB) {
            return -1;
        }

        int intersectionCount = 0;
        int outcode0 = RectangleBoundingBoxData._computeOutCode(xA, yA, xMin, yMin, xMax, yMax);
        int outcode1 = RectangleBoundingBoxData._computeOutCode(xB, yB, xMin, yMin, xMax, yMax);

        while (true) {
            if ((outcode0 | outcode1) == 0) { // Bitwise OR is 0. Trivially accept and get out of loop
                intersectionCount = 2;
                break;
            } else if ((outcode0 & outcode1) != 0) { // Bitwise AND is not 0. Trivially reject and get out of loop
                break;
            }

            // failed both tests, so calculate the line segment to clip
            // from an outside point to an intersection with clip edge
            float x = 0f;
            float y = 0f;
            float normalRadian = 0f;

            // At least one endpoint is outside the clip rectangle; pick it.
            final int outcodeOut = outcode0 != 0 ? outcode0 : outcode1;

            // Now find the intersection point;
            if ((outcodeOut & OutCode.Top.v) != 0) {             // point is above the clip rectangle
                x = xA + (xB - xA) * (yMin - yA) / (yB - yA);
                y = yMin;

                if (normalRadians != null) {
                    normalRadian = (float) (-Math.PI * 0.5);
                }
            } else if ((outcodeOut & OutCode.Bottom.v) != 0) {     // point is below the clip rectangle
                x = xA + (xB - xA) * (yMax - yA) / (yB - yA);
                y = yMax;

                if (normalRadians != null) {
                    normalRadian = (float) (Math.PI * 0.5);
                }
            } else if ((outcodeOut & OutCode.Right.v) != 0) {      // point is to the right of clip rectangle
                y = yA + (yB - yA) * (xMax - xA) / (xB - xA);
                x = xMax;

                if (normalRadians != null) {
                    normalRadian = 0;
                }
            } else if ((outcodeOut & OutCode.Left.v) != 0) {       // point is to the left of clip rectangle
                y = yA + (yB - yA) * (xMin - xA) / (xB - xA);
                x = xMin;

                if (normalRadians != null) {
                    normalRadian = (float) Math.PI;
                }
            }

            // Now we move outside point to intersection point to clip
            // and get ready for next pass.
            if (outcodeOut == outcode0) {
                xA = x;
                yA = y;
                outcode0 = RectangleBoundingBoxData._computeOutCode(xA, yA, xMin, yMin, xMax, yMax);

                if (normalRadians != null) {
                    normalRadians.x = normalRadian;
                }
            } else {
                xB = x;
                yB = y;
                outcode1 = RectangleBoundingBoxData._computeOutCode(xB, yB, xMin, yMin, xMax, yMax);

                if (normalRadians != null) {
                    normalRadians.y = normalRadian;
                }
            }
        }

        if (intersectionCount != 0) {
            if (inSideA) {
                intersectionCount = 2; // 10

                if (intersectionPointA != null) {
                    intersectionPointA.x = xB;
                    intersectionPointA.y = yB;
                }

                if (intersectionPointB != null) {
                    intersectionPointB.x = xB;
                    intersectionPointB.y = xB;
                }

                if (normalRadians != null) {
                    normalRadians.x = (float) (normalRadians.y + Math.PI);
                }
            } else if (inSideB) {
                intersectionCount = 1; // 01

                if (intersectionPointA != null) {
                    intersectionPointA.x = xA;
                    intersectionPointA.y = yA;
                }

                if (intersectionPointB != null) {
                    intersectionPointB.x = xA;
                    intersectionPointB.y = yA;
                }

                if (normalRadians != null) {
                    normalRadians.y = (float) (normalRadians.x + Math.PI);
                }
            } else {
                intersectionCount = 3; // 11
                if (intersectionPointA != null) {
                    intersectionPointA.x = xA;
                    intersectionPointA.y = yA;
                }

                if (intersectionPointB != null) {
                    intersectionPointB.x = xB;
                    intersectionPointB.y = yB;
                }
            }
        }

        return intersectionCount;
    }

    /**
     * @private
     */
    protected void _onClear() {
        super._onClear();

        this.type = BoundingBoxType.Rectangle;
    }

    /**
     * @inherDoc
     */
    public boolean containsPoint(float pX, float pY) {
        final float widthH = (float) (this.width * 0.5);
        if (pX >= -widthH && pX <= widthH) {
            final float heightH = (float) (this.height * 0.5);
            if (pY >= -heightH && pY <= heightH) {
                return true;
            }
        }

        return false;
    }

    public int intersectsSegment(
            float xA, float yA, float xB, float yB
    ) {
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
    ) {
        final float widthH = (float) (this.width * 0.5);
        final float heightH = (float) (this.height * 0.5);
        final int intersectionCount = RectangleBoundingBoxData.rectangleIntersectsSegment(
                xA, yA, xB, yB,
                -widthH, -heightH, widthH, heightH,
                intersectionPointA, intersectionPointB, normalRadians
        );

        return intersectionCount;
    }
}
