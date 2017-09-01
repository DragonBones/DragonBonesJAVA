package com.dragonbones.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;

public class StreamUtil {
    static public byte[] readAll(InputStream s) {
        byte[] temp = new byte[1024];
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        try {
            while (true) {
                int read = s.read(temp, 0, temp.length);
                if (read <= 0) break;
                os.write(temp, 0, read);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return os.toByteArray();
    }

    static public String getResourceString(String path, Charset charset) {
        try {
            return new String(getResourceBytes(path), charset.name());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    static public byte[] getResourceBytes(String path) {
        InputStream s = ClassLoader.getSystemClassLoader().getResourceAsStream(path);
        try {
            return readAll(s);
        } finally {
            try {
                s.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
