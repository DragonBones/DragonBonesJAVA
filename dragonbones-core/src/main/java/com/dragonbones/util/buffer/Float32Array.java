package com.dragonbones.util.buffer;

import com.dragonbones.util.FloatArray;

public class Float32Array extends FloatArray {
    static public final int BYTES_PER_ELEMENT = 4;
    private final ArrayBuffer buffer;
    private final int offset;
    private final int count;
    private final int byteOffset;

    public Float32Array(ArrayBuffer buffer, int offset, int count) {
        super(false);
        this.buffer = buffer;
        this.offset = offset;
        this.count = count;
        this.byteOffset = offset * BYTES_PER_ELEMENT;
    }

    public float get(int index) {
        return buffer.getF32(byteOffset + index * BYTES_PER_ELEMENT);
    }

    public void set(int index, float value) {
        buffer.setF32(byteOffset + index * BYTES_PER_ELEMENT, value);
    }
}
