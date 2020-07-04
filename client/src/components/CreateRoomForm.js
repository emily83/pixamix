import React, {useState, useContext} from 'react'
import { GlobalContext } from '../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';
import Cookies from 'js-cookie';

export const CreateRoomForm = () => {

    // If there is a name saved in a cookie, use this as default name
    const initName = Cookies.get('name') ? Cookies.get('name') : '';

    const [name, setName] = useState(initName);

    const { addRoom, error, setError } = useContext(GlobalContext);

    const onSubmit = async e => {
        e.preventDefault();
        if (name === '') {
            setError('Please enter your name');
            return false;
        }
        setError(null);
        //makeHost();
        trackPromise(
            addRoom(name)
        );
    }

    return (
        <form className="start-game" onSubmit={onSubmit}>
            <div className="error">{ error }</div>
            <div className="form-control">
                <label htmlFor="name">Enter your name</label>
                <input 
                    type="text" 
                    autoFocus = {name === ''}
                    className="nameInput"
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <button className="btn largeBtn">Create Room</button>
        </form>
    )
}
