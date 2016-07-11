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
        System.out.println(result);
        //assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of copyFrom method, of class Transform.
     */
    @Test
    public void testCopyFrom() {
        System.out.println("copyFrom");
        Transform value = new Transform();
        value.setRotation(99);
        Transform instance = new Transform();
        Transform expResult = instance;
        Transform result = instance.copyFrom(value);
        System.out.println(instance.toString());
        if(instance.getRotation()!=99)
        {
            assertEquals(expResult, result);
        }
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of clone method, of class Transform.
     */
    @Test
    public void testClone() {
        System.out.println("clone");
        Transform instance = new Transform();
        Transform expResult = instance;
        instance.scaleX = 6;
        instance.skewY = 7;
        Transform result = instance.clone();
        if(result.scaleX!=6||result.skewY!=7)
        {
            assertEquals(expResult, result);
        }
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of identity method, of class Transform.
     */
    @Test
    public void testIdentity() {
        System.out.println("identity");
        Transform instance = new Transform();
        Transform expResult = instance;
        Transform result = instance.identity();
        if(instance.x!=0||instance.y!=0||instance.skewX!=0||instance.skewY!=0||instance.scaleX!=1||instance.scaleY!=1)
        {
            assertEquals(expResult, result);
        }
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of add method, of class Transform.
     */
    @Test
    public void testAdd() {
        System.out.println("add");
        Transform value = new Transform();
        value.x = 78;
        value.y = 99;
        value.scaleX = 4;
        value.scaleY = 8;
        value.skewX = 44;
        value.skewY = 11;
        Transform instance = new Transform();
        Transform expResult = instance;
        Transform result = instance.add(value);
        if(result.x!=78||result.y!=99||result.scaleX!=4||result.scaleY!=8||result.skewX!=44||result.skewY!=11)
        {
            assertEquals(expResult, result);
        }
        
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of minus method, of class Transform.
     */
    @Test
    public void testMinus() {
        System.out.println("minus");
        Transform value = new Transform();
        value.x = 78;
        value.y = 99;
        value.scaleX = 4;
        value.scaleY = 8;
        value.skewX = 44;
        value.skewY = 11;
        Transform instance = new Transform();
        Transform expResult = instance;
        Transform result = instance.minus(value);
        if(result.x!=-78||result.y!=-99||result.scaleX!=-4||result.scaleY!=-8||result.skewX!=-44||result.skewY!=-11)
        {
            assertEquals(expResult, result);
        }
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of fromMatrix method, of class Transform.
     */
    @Test
    public void testFromMatrix() {
        //TODO
        System.out.println("fromMatrix");
        Matrix matrix = new Matrix();
        Transform instance = new Transform();
        Transform expResult = null;
        Transform result = instance.fromMatrix(matrix);
        //assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of toMatrix method, of class Transform.
     */
    @Test
    public void testToMatrix() {
        //TODO
        System.out.println("toMatrix");
        Matrix matrix = new Matrix();
        Transform instance = new Transform();
        instance.toMatrix(matrix);
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of getRotation method, of class Transform.
     */
    @Test
    public void testGetRotation() {
        //TODO
        System.out.println("getRotation");
        Transform instance = new Transform();
        double expResult = 0.0;
        double result = instance.getRotation();
        //assertEquals(expResult, result, 0.0);
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of setRotation method, of class Transform.
     */
    @Test
    public void testSetRotation() {
        //TODO
        System.out.println("setRotation");
        double value = 0.0;
        Transform instance = new Transform();
        instance.setRotation(value);
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of normalizeRadian method, of class Transform.
     */
    @Test
    public void testNormalizeRadian() {
        System.out.println("normalizeRadian");
        double value = 4;
        double expResult = 0.0;
        double result = Transform.normalizeRadian(value);
        System.out.println(result);
        //assertEquals(expResult, result, 0.0);
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }
    
}
