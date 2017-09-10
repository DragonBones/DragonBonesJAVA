package com.dragonbones.libgdx;

import com.dragonbones.animation.Animation;
import com.dragonbones.armature.Armature;
import com.dragonbones.armature.Bone;
import com.dragonbones.armature.IArmatureProxy;
import com.dragonbones.armature.Slot;
import com.dragonbones.event.EventObject;
import com.dragonbones.event.EventStringType;
import com.dragonbones.event.IEventDispatcher;
import com.dragonbones.libgdx.compat.*;
import com.dragonbones.model.BoundingBoxData;
import com.dragonbones.model.PolygonBoundingBoxData;
import com.dragonbones.util.FloatArray;

import java.util.function.Consumer;

/**
 * @inheritDoc
 */
class GdxArmatureDisplay extends EgretDisplayObjectContainer implements IArmatureProxy, IEventDispatcher {
    private boolean _disposeProxy = false;
    private Armature _armature = null; //
    private EgretSprite _debugDrawer = null;

    /**
     * @inheritDoc
     */
    public void init(Armature armature) {
        this._armature = armature;
    }

    /**
     * @inheritDoc
     */
    public void clear() {
        this._disposeProxy = false;
        this._armature = null;
        this._debugDrawer = null;
    }

    /**
     * @inheritDoc
     */
    public void dispose(boolean disposeProxy) {
        this._disposeProxy = disposeProxy;

        if (this._armature != null) {
            this._armature.dispose();
            this._armature = null;
        }
    }

    public void dispose() {
        dispose(true);
    }

    /**
     * @inheritDoc
     */
    public void debugUpdate(boolean isEnabled) {
        if (isEnabled) {
            if (this._debugDrawer == null) {
                this._debugDrawer = new EgretSprite();
            }

            this.addChild(this._debugDrawer);
            this._debugDrawer.getGraphics().clear();

            for (Bone bone : this._armature.getBones()) {
                float boneLength = bone.boneData.length;
                float startX = bone.globalTransformMatrix.tx;
                float startY = bone.globalTransformMatrix.ty;
                float endX = startX + bone.globalTransformMatrix.a * boneLength;
                float endY = startY + bone.globalTransformMatrix.b * boneLength;

                this._debugDrawer.getGraphics().lineStyle(2.0, 0x00FFFF, 0.7);
                this._debugDrawer.getGraphics().moveTo(startX, startY);
                this._debugDrawer.getGraphics().lineTo(endX, endY);
                this._debugDrawer.getGraphics().lineStyle(0.0, 0, 0);
                this._debugDrawer.getGraphics().beginFill(0x00FFFF, 0.7);
                this._debugDrawer.getGraphics().drawCircle(startX, startY, 3.0);
                this._debugDrawer.getGraphics().endFill();
            }

            for (Slot slot : this._armature.getSlots()) {
                BoundingBoxData boundingBoxData = slot.getBoundingBoxData();

                if (boundingBoxData != null) {
                    EgretShape child = (EgretShape) this._debugDrawer.getChildByName(slot.name);
                    if (child == null) {
                        child = new EgretShape();
                        child.name = slot.name;
                        this._debugDrawer.addChild(child);
                    }

                    child.getGraphics().clear();
                    child.getGraphics().beginFill((boundingBoxData.color != 0) ? boundingBoxData.color : 0xFF00FF, 0.3);

                    switch (boundingBoxData.type) {
                        case Rectangle:
                            child.getGraphics().drawRect(-boundingBoxData.width * 0.5, -boundingBoxData.height * 0.5, boundingBoxData.width, boundingBoxData.height);
                            break;

                        case Ellipse:
                            child.getGraphics().drawEllipse(-boundingBoxData.width * 0.5, -boundingBoxData.height * 0.5, boundingBoxData.width, boundingBoxData.height);
                            break;

                        case Polygon:
                            PolygonBoundingBoxData polygon = (PolygonBoundingBoxData) boundingBoxData;
                            FloatArray vertices = polygon.vertices;
                            for (int j = 0; j < polygon.count; j += 2) {
                                if (j == 0) {
                                    child.getGraphics().moveTo(vertices.get(polygon.offset + j), vertices.get(polygon.offset + j + 1));
                                } else {
                                    child.getGraphics().lineTo(vertices.get(polygon.offset + j), vertices.get(polygon.offset + j + 1));
                                }
                            }
                            break;

                        default:
                            break;
                    }

                    child.getGraphics().endFill();
                    slot.updateTransformAndMatrix();
                    slot.updateGlobalTransform();
                    child.$setMatrix(slot.globalTransformMatrix, true);
                } else {
                    EgretDisplayObject child = this._debugDrawer.getChildByName(slot.name);
                    if (child != null) {
                        this._debugDrawer.removeChild(child);
                    }
                }
            }
        } else if (this._debugDrawer != null && this._debugDrawer.getParent() == this) {
            this.removeChild(this._debugDrawer);
        }
    }

    /**
     * @inheritDoc
     */
    public void _dispatchEvent(EventStringType type, EventObject eventObject) {
        EgretEvent event = EgretEvent.create(EgretEvent.class, type);
        event.data = eventObject;
        super.dispatchEvent(event);
        EgretEvent.release(event);
    }

    /**
     * @inheritDoc
     */
    public boolean hasEvent(EventStringType type) {
        return this.hasEventListener(type);
    }

    /**
     * @inheritDoc
     */
    //public void addEvent(EventStringType type, Consumer<EgretEvent> listener, Object target) {
    public void addEvent(EventStringType type, Consumer<Object> listener, Object target) {
        this.addEventListener(type, (Consumer<EgretEvent>)(Object)listener, target);
    }

    /**
     * @inheritDoc
     */
    //public void removeEvent(EventStringType type, Consumer<EgretEvent> listener, Object target) {
    public void removeEvent(EventStringType type, Consumer<Object> listener, Object target) {
        this.removeEventListener(type, (Consumer<EgretEvent>)(Object)listener, target);
    }

    /**
     * @inheritDoc
     */
    public Armature getArmature() {
        return this._armature;
    }

    /**
     * @inheritDoc
     */
    public Animation getAnimation() {
        return this._armature.getAnimation();
    }

    /**
     * @see Armature#clock
     * @see GdxFactory#getClock()
     * @see Animation#timeScale
     * @see Animation#stop()
     * @deprecated 已废弃，请参考 @see
     */
    public void advanceTimeBySelf(boolean on) {
        if (on) {
            this._armature.setClock(GdxFactory.getClock());
        } else {
            this._armature.setClock(null);
        }
    }
}