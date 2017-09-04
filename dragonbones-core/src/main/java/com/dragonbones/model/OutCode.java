package com.dragonbones.model;

/**
 * Cohen–Sutherland algorithm https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm
 * ----------------------
 * | 0101 | 0100 | 0110 |
 * ----------------------
 * | 0001 | 0000 | 0010 |
 * ----------------------
 * | 1001 | 1000 | 1010 |
 * ----------------------
 */
public enum OutCode {
    InSide(0), // 0000
    Left(1),   // 0001
    Right(2),  // 0010
    Top(4),    // 0100
    Bottom(8);  // 1000

    public final int v;

    OutCode(int v) {
        this.v = v;
    }
}
