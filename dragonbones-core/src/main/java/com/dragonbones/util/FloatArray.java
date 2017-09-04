package com.dragonbones.util;

import java.util.Arrays;
import java.util.Comparator;

public class FloatArray extends NumberArray<Float> {
    static private final float[] EMPTY = new float[0];
    private int length;
    private float[] data;

    protected FloatArray(boolean none) {
    }

    public FloatArray() {
        this(EMPTY, 0);
    }

    public FloatArray(int length) {
        this(new float[length], length);
    }

    public FloatArray(float[] data) {
        this(data, data.length);
    }

    public FloatArray(float[] data, int length) {
        this.data = data;
        this.length = length;
    }

    private void ensureCapacity(int minLength) {
        if (data.length < minLength) {
            data = Arrays.copyOf(data, Math.max(16, Math.max(minLength, data.length * 3)));
        }
    }

    public float get(int index) {
        return data[index];
    }

    public void set(int index, float value) {
        data[index] = value;
    }

    @Override
    public Float getObject(int index) {
        return get(index);
    }

    @Override
    public void setObject(int index, Float value) {
        set(index, value);
    }

    @Override
    public ArrayBase<Float> create(int count) {
        return new FloatArray(count);
    }

    public void push(float value) {
        int pos = getLength();
        setLength(pos + 1);
        data[pos] = value;
    }

    @Override
    public int getLength() {
        return length;
    }

    @Override
    public void setLength(int length) {
        this.length = length;
        ensureCapacity(length);
    }

    public FloatArray copy() {
        FloatArray out = new FloatArray();
        out.length = length;
        out.data = Arrays.copyOf(data, data.length);
        return out;
    }

    public void sort(int start, int end) {
        Arrays.sort(data, start, end);
    }

    @Override
    public void sort(Comparator<Float> comparator, int start, int end) {
        throw new RuntimeException("Not implemented");
    }
}
