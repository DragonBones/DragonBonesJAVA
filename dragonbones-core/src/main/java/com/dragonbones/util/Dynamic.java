package com.dragonbones.util;

import java.util.List;
import java.util.Map;
import java.util.Objects;

// @TODO: Implement using reflection getter methods, or fields
public class Dynamic {
    static public Object get(Object rawData, String key) {
        return get(rawData, key, null);
    }

    static public Object get(Object rawData, String key, Object defaultValue) {
        Object out = defaultValue;
        try {
            if (rawData instanceof Map) {
                out = ((Map) rawData).get(key);
                if (out != null) return out;
            } else if (rawData instanceof List) {
                out = ((List) rawData).get(Integer.parseInt(key));
                if (out != null) return out;
            } else if (rawData instanceof ArrayBase) {
                out = ((ArrayBase) rawData).getObject(Integer.parseInt(key));
                if (out != null) return out;
            }
        } catch (Throwable e) {
        }
        return out;
    }

    static public boolean in(Object rawData, String key) {
        return get(rawData, key, null) != null;
    }

    static public IntArray getIntArray(Object rawData, String key) {
        Object obj = get(rawData, key);
        if (obj instanceof IntArray) {
            return (IntArray) obj;
        } else if (obj instanceof Iterable) {
            IntArray out = new IntArray();
            for (Object o : (Iterable<Object>) obj) out.push(castInt(o, 0));
            return out;
        } else {
            return null;
        }
    }

    static public FloatArray getFloatArray(Object rawData, String key) {
        Object obj = get(rawData, key);
        if (obj instanceof FloatArray) {
            return (FloatArray) obj;
        } else if (obj instanceof Iterable) {
            FloatArray out = new FloatArray();
            for (Object o : (Iterable<Object>) obj) out.push(castFloat(o, 0f));
            return out;
        } else {
            return null;
        }
    }

    static public <T> Array<T> getArray(Object rawData, String key) {
        return castArray(get(rawData, key));
    }

    static public boolean getBool(Object rawData, String key) {
        return getBool(rawData, key, false);
    }

    static public boolean getBool(Object rawData, String key, boolean defaultValue) {
        return castBool(get(rawData, key), defaultValue);
    }

    static public int getInt(Object rawData, String key) {
        return getInt(rawData, key, 0);
    }

    static public int getInt(Object rawData, String key, int defaultValue) {
        return (int) getDouble(rawData, key, defaultValue);
    }

    static public float getFloat(Object rawData, String key) {
        return getFloat(rawData, key, 0f);
    }

    static public float getFloat(Object rawData, String key, float defaultValue) {
        return (float) getDouble(rawData, key, defaultValue);
    }

    static public double getDouble(Object rawData, String key) {
        return getDouble(rawData, key, 0.0);
    }

    static public double getDouble(Object rawData, String key, double defaultValue) {
        return castDouble(get(rawData, key), defaultValue);
    }

    static public String getString(Object rawData, String key) {
        return getString(rawData, key, null);
    }

    static public String getString(Object rawData, String key, String defaultValue) {
        Object out = get(rawData, key);
        if (out == null) return defaultValue;
        return Objects.toString(out);
    }

    static public <T> Array<T> castArray(Object obj) {
        try {
            if (obj instanceof Array) {
                return (Array<T>) obj;
            } else if (obj instanceof Iterable) {
                Array<T> out = new Array<>();
                for (T o : (Iterable<T>) obj) out.push(o);
                return out;
            } else {
                return null;
            }
        } catch (Throwable e) {
            return null;
        }
    }

    static public int castInt(Object obj, int defaultValue) {
        return (int) castDouble(obj, defaultValue);
    }

    static public float castFloat(Object obj, float defaultValue) {
        return (float) castDouble(obj, defaultValue);
    }

    static public boolean castBool(Object obj, boolean defaultValue) {
        if (Objects.equals(obj, "true")) return true;
        if (Objects.equals(obj, "false")) return false;
        return ((int) castDouble(obj, defaultValue ? 1 : 0)) != 0;
    }

    static public double castDouble(Object obj, double defaultValue) {
        try {
            if (obj == null) return defaultValue;
            if (obj instanceof Number) {
                return ((Number) obj).doubleValue();
            }
            if (obj instanceof Boolean) {
                return ((Boolean) obj) ? 1 : 0;
            }
            return Double.parseDouble(Objects.toString(obj));
        } catch (Throwable e) {
            return defaultValue;
        }
    }
}
