package com.dragonbones.util.buffer;

import com.dragonbones.util.CharArray;

public class Uint16Array extends CharArray implements ArrayBufferView {
    static public final int BYTES_PER_ELEMENT = 2;
    private final ArrayBuffer buffer;
    private final int offset;
    private final int count;
    private final int byteOffset;

    public Uint16Array(ArrayBuffer buffer, int offset, int count) {
        super(false);
        this.buffer = buffer;
        this.offset = offset;
        this.count = count;
        this.byteOffset = offset * BYTES_PER_ELEMENT;
    }

    @Override
    public int getLength() {
        return count;
    }

    @Override
    public void setLength(int length) {
    }

    public int get(int index) {
        return buffer.getU16(byteOffset + index * BYTES_PER_ELEMENT);
    }

    @Override
    public void set(int index, int value) {
        buffer.setU16(byteOffset + index * BYTES_PER_ELEMENT, value);
    }
}
