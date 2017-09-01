package com.dragonbones.util.buffer;

import com.dragonbones.util.ShortArray;

public class Int16Array extends ShortArray implements ArrayBufferView {
    static public final int BYTES_PER_ELEMENT = 2;
    private final ArrayBuffer buffer;
    private final int offset;
    private final int count;
    private final int byteOffset;

    public Int16Array(ArrayBuffer buffer, int offset, int count) {
        super(false);
        this.buffer = buffer;
        this.offset = offset;
        this.count = count;
        this.byteOffset = offset * BYTES_PER_ELEMENT;
    }

    public int get(int index) {
        return buffer.getS16(byteOffset + index * BYTES_PER_ELEMENT);
    }

    @Override
    public void set(int i, int v) {
        buffer.setS16(byteOffset + i * BYTES_PER_ELEMENT, v);
    }
}
