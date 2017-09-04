package com.dragonbones.model;

import com.dragonbones.core.BoundingBoxType;
import com.dragonbones.geom.Point;
import com.dragonbones.util.FloatArray;
import org.jetbrains.annotations.Nullable;

/**
 * 多边形边界框。
 *
 * @version DragonBones 5.1
 * @language zh_CN
 */
public class PolygonBoundingBoxData extends BoundingBoxData {
    public static int polygonIntersectsSegment(
            float xA, float yA, float xB, float yB,
            FloatArray vertices, int offset, int count
    ) {
        return polygonIntersectsSegment(xA, yA, xB, yB, vertices, offset, count, null, null, null);
    }

    /**
     * @private
     */
    public static int polygonIntersectsSegment(
            float xA, float yA, float xB, float yB,
            FloatArray vertices, int offset, int count,
            @Nullable Point intersectionPointA,
            @Nullable Point intersectionPointB,
            @Nullable Point normalRadians
    ) {
        if (xA == xB) {
            xA = xB + 0.000001f;
        }

        if (yA == yB) {
            yA = yB + 0.000001f;
        }

        final float dXAB = xA - xB;
        final float dYAB = yA - yB;
        final float llAB = xA * yB - yA * xB;
        int intersectionCount = 0;
        float xC = vertices.get(offset + count - 2);
        float yC = vertices.get(offset + count - 1);
        float dMin = 0f;
        float dMax = 0f;
        float xMin = 0f;
        float yMin = 0f;
        float xMax = 0f;
        float yMax = 0f;

        for (int i = 0; i < count; i += 2) {
            float xD = vertices.get(offset + i);
            float yD = vertices.get(offset + i + 1);

            if (xC == xD) {
                xC = xD + 0.0001f;
            }

            if (yC == yD) {
                yC = yD + 0.0001f;
            }

            float dXCD = xC - xD;
            float dYCD = yC - yD;
            float llCD = xC * yD - yC * xD;
            float ll = dXAB * dYCD - dYAB * dXCD;
            float x = (llAB * dXCD - dXAB * llCD) / ll;

            if (((x >= xC && x <= xD) || (x >= xD && x <= xC)) && (dXAB == 0f || (x >= xA && x <= xB) || (x >= xB && x <= xA))) {
                float y = (llAB * dYCD - dYAB * llCD) / ll;
                if (((y >= yC && y <= yD) || (y >= yD && y <= yC)) && (dYAB == 0f || (y >= yA && y <= yB) || (y >= yB && y <= yA))) {
                    if (intersectionPointB != null) {
                        float d = x - xA;
                        if (d < 0f) {
                            d = -d;
                        }

                        if (intersectionCount == 0) {
                            dMin = d;
                            dMax = d;
                            xMin = x;
                            yMin = y;
                            xMax = x;
                            yMax = y;

                            if (normalRadians != null) {
                                normalRadians.x = (float) (Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5f);
                                normalRadians.y = normalRadians.x;
                            }
                        } else {
                            if (d < dMin) {
                                dMin = d;
                                xMin = x;
                                yMin = y;

                                if (normalRadians != null) {
                                    normalRadians.x = (float) (Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5f);
                                }
                            }

                            if (d > dMax) {
                                dMax = d;
                                xMax = x;
                                yMax = y;

                                if (normalRadians != null) {
                                    normalRadians.y = (float) (Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5f);
                                }
                            }
                        }

                        intersectionCount++;
                    } else {
                        xMin = x;
                        yMin = y;
                        xMax = x;
                        yMax = y;
                        intersectionCount++;

                        if (normalRadians != null) {
                            normalRadians.x = (float) (Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5f);
                            normalRadians.y = normalRadians.x;
                        }
                        break;
                    }
                }
            }

            xC = xD;
            yC = yD;
        }

        if (intersectionCount == 1) {
            if (intersectionPointA != null) {
                intersectionPointA.x = xMin;
                intersectionPointA.y = yMin;
            }

            if (intersectionPointB != null) {
                intersectionPointB.x = xMin;
                intersectionPointB.y = yMin;
            }

            if (normalRadians != null) {
                normalRadians.y = (float) (normalRadians.x + Math.PI);
            }
        } else if (intersectionCount > 1) {
            intersectionCount++;

            if (intersectionPointA != null) {
                intersectionPointA.x = xMin;
                intersectionPointA.y = yMin;
            }

            if (intersectionPointB != null) {
                intersectionPointB.x = xMax;
                intersectionPointB.y = yMax;
            }
        }

        return intersectionCount;
    }

    /**
     * @private
     */
    public int count;
    /**
     * @private
     */
    public int offset; // FloatArray.
    /**
     * @private
     */
    public float x;
    /**
     * @private
     */
    public float y;
    /**
     * 多边形顶点。
     *
     * @version DragonBones 5.1
     * @language zh_CN
     */
    public FloatArray vertices; // FloatArray.
    /**
     * @private
     */
    @Nullable
    public WeightData weight = null; // Initial value.

    /**
     * @private
     */
    protected void _onClear()

    {
        super._onClear();

        if (this.weight != null) {
            this.weight.returnToPool();
        }

        this.type = BoundingBoxType.Polygon;
        this.count = 0;
        this.offset = 0;
        this.x = 0f;
        this.y = 0f;
        this.vertices = null; //
        this.weight = null;
    }

    /**
     * @inherDoc
     */
    public boolean containsPoint(float pX, float pY)

    {
        boolean isInSide = false;
        if (pX >= this.x && pX <= this.width && pY >= this.y && pY <= this.height) {
            for (int i = 0, l = this.count, iP = l - 2; i < l; i += 2) {
                float yA = this.vertices.get(this.offset + iP + 1);
                float yB = this.vertices.get(this.offset + i + 1);
                if ((yB < pY && yA >= pY) || (yA < pY && yB >= pY)) {
                    float xA = this.vertices.get(this.offset + iP);
                    float xB = this.vertices.get(this.offset + i);
                    if ((pY - yB) * (xA - xB) / (yA - yB) + xB < pX) {
                        isInSide = !isInSide;
                    }
                }

                iP = i;
            }
        }

        return isInSide;
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
    ) {
        int intersectionCount = 0;
        if (RectangleBoundingBoxData.rectangleIntersectsSegment(xA, yA, xB, yB, this.x, this.y, this.width, this.height, null, null, null) != 0) {
            intersectionCount = PolygonBoundingBoxData.polygonIntersectsSegment(
                    xA, yA, xB, yB,
                    this.vertices, this.offset, this.count,
                    intersectionPointA, intersectionPointB, normalRadians
            );
        }

        return intersectionCount;
    }
}
