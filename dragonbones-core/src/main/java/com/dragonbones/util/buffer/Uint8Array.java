package com.dragonbones.util.buffer;

public class Uint8Array implements ArrayBufferView {
    static public final int BYTES_PER_ELEMENT = 1;
    private final ArrayBuffer buffer;
    private final int offset;
    private final int count;
    private final int byteOffset;

    public Uint8Array(ArrayBuffer buffer, int offset, int count) {
        this.buffer = buffer;
        this.offset = offset;
        this.byteOffset = offset;
        this.count = count;
    }

    public int length() {
        return count;
    }

    public int get(int index) {
        return buffer.getU8(byteOffset + index);
    }
}
