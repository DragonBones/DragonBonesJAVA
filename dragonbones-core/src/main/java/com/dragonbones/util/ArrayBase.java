package com.dragonbones.util;

import org.jetbrains.annotations.NotNull;

import java.util.Comparator;
import java.util.Iterator;
import java.util.Objects;

public abstract class ArrayBase<T> implements Iterable<T> {
    abstract public int getLength();

    abstract public void setLength(int length);

    abstract public T getObject(int index);

    abstract public void setObject(int index, T value);

    abstract public ArrayBase<T> create(int count);

    final public int length() {
        return getLength();
    }

    final public int size() {
        return getLength();
    }

    final public void clear() {
        setLength(0);
    }

    final public void incrementLength(int delta) {
        setLength(getLength() + delta);
    }

    // @TODO: Optimize this!
    public int indexOf(T value) {
        return indexOfObject(value);
    }

    public int indexOfObject(T value) {
        for (int n = 0; n < length(); n++) {
            if (Objects.equals(getObject(n), value)) {
                return n;
            }
        }
        return -1;
    }

    public void pushObject(T value) {
        incrementLength(1);
        setObject(getLength() - 1, value);
    }

    public T popObject() {
        T out = getObject(getLength() - 1);
        incrementLength(-1);
        return out;
    }

    public void unshiftObject(T item) {
        setLength(getLength() + 1);
        for (int n = 1; n < getLength(); n++) {
            setObject(n - 1, getObject(n));
        }
        setObject(0, item);
    }

    @NotNull
    @Override
    public Iterator<T> iterator() {
        final int[] pos = {0};
        return new Iterator<T>() {
            @Override
            public boolean hasNext() {
                return pos[0] < getLength();
            }

            @Override
            public T next() {
                return getObject(pos[0]++);
            }
        };
    }

    static private Object[] EMPTY_ARRAY = new Object[0];

    public void splice(int index, int removeCount, T... addItems) {
        ArrayBase<T> ref = copy();
        if (addItems == null) addItems = (T[]) EMPTY_ARRAY;
        setLength(getLength() - removeCount + addItems.length);
        for (int n = 0; n < index; n++) {
            this.setObject(n, ref.getObject(n));
        }
        for (int n = 0; n < addItems.length; n++) {
            this.setObject(index + n, addItems[n]);
        }
        for (int n = 0; n < ref.length() - removeCount; n++) {
            this.setObject(index + addItems.length + n, ref.getObject(index + removeCount + n));
        }
    }

    public ArrayBase<T> copy() {
        return slice();
    }

    public ArrayBase<T> slice() {
        return slice(0, getLength());
    }

    public ArrayBase<T> slice(int start) {
        return slice(start, getLength());
    }

    public ArrayBase<T> slice(int start, int end) {
        int count = end - start;
        ArrayBase<T> out = create(count);
        for (int n = 0; n < count; n++) {
            out.setObject(n, this.getObject(start + n));
        }
        return out;
    }

    public ArrayBase<T> concat(T... items) {
        ArrayBase<T> out = create(this.length() + items.length);
        for (int n = 0; n < this.length(); n++) {
            out.setObject(n, this.getObject(n));
        }
        for (int n = 0; n < items.length; n++) {
            out.setObject(this.length() + n, items[n]);
        }
        return out;
    }

    public void sort(Comparator<T> comparator) {
        sort(comparator, 0, getLength());
    }

    abstract public void sort(Comparator<T> comparator, int start, int end);
}
