package dragonbones.events;

/**
 *
 * @author mebius
 */
public interface IEventDispatcher {
    
    void _onClear();
    void _dispatchEvent( EventObject eventObject );
    boolean hasEvent( String type);
    
    void addEvent( String type, IEventListener listner );
    
    void removeEvent( String type, IEventListener listner );
    
}
