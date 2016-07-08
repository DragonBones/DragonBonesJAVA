/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dragonbones.geom;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author mebius
 */
public class TransformTest {
    
    public TransformTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    /**
     * Test of toString method, of class Transform.
     */
    @Test
    public void testToString() {
        System.out.println("toString");
        Transform instance = new Transform();
        String expResult = "";
        String result = instance.toString();
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of copyFrom method, of class Transform.
     */
    @Test
    public void testCopyFrom() {
        System.out.println("copyFrom");
        Transform value = null;
        Transform instance = new Transform();
        Transform expResult = null;
        Transform result = instance.copyFrom(value);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of clone method, of class Transform.
     */
    @Test
    public void testClone() {
        System.out.println("clone");
        Transform instance = new Transform();
        Transform expResult = null;
        Transform result = instance.clone();
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of identity method, of class Transform.
     */
    @Test
    public void testIdentity() {
        System.out.println("identity");
        Transform instance = new Transform();
        Transform expResult = null;
        Transform result = instance.identity();
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of add method, of class Transform.
     */
    @Test
    public void testAdd() {
        System.out.println("add");
        Transform value = null;
        Transform instance = new Transform();
        Transform expResult = null;
        Transform result = instance.add(value);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of minus method, of class Transform.
     */
    @Test
    public void testMinus() {
        System.out.println("minus");
        Transform value = null;
        Transform instance = new Transform();
        Transform expResult = null;
        Transform result = instance.minus(value);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of fromMatrix method, of class Transform.
     */
    @Test
    public void testFromMatrix() {
        System.out.println("fromMatrix");
        Matrix matrix = null;
        Transform instance = new Transform();
        Transform expResult = null;
        Transform result = instance.fromMatrix(matrix);
        assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of toMatrix method, of class Transform.
     */
    @Test
    public void testToMatrix() {
        System.out.println("toMatrix");
        Matrix matrix = null;
        Transform instance = new Transform();
        instance.toMatrix(matrix);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of getRotation method, of class Transform.
     */
    @Test
    public void testGetRotation() {
        System.out.println("getRotation");
        Transform instance = new Transform();
        double expResult = 0.0;
        double result = instance.getRotation();
        assertEquals(expResult, result, 0.0);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of setRotation method, of class Transform.
     */
    @Test
    public void testSetRotation() {
        System.out.println("setRotation");
        double value = 0.0;
        Transform instance = new Transform();
        instance.setRotation(value);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }

    /**
     * Test of normalizeRadian method, of class Transform.
     */
    @Test
    public void testNormalizeRadian() {
        System.out.println("normalizeRadian");
        double value = 0.0;
        double expResult = 0.0;
        double result = Transform.normalizeRadian(value);
        assertEquals(expResult, result, 0.0);
        // TODO review the generated test code and remove the default call to fail.
        fail("The test case is a prototype.");
    }
    
}
