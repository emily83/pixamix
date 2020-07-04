import React, { useState, useContext, useRef } from 'react'
import { GlobalContext } from '../context/GlobalState';
import { trackPromise } from 'react-promise-tracker';
import Cookies from 'js-cookie';

export const JoinRoomForm = () => {

    const nameInputRef = useRef();
    const codeInputRef = useRef();

    // If there is a name saved in a cookie, use this as default name
    const initName = Cookies.get('name') ? Cookies.get('name') : '';

    // If there is a code in the URL, use this as default room code
    const link = document.location.href.split('/');
    let initCode = '';
    if (link[3].length === 4) {
      initCode = link[3].toUpperCase();
    }

    const [name, setName] = useState(initName);
    const [code, setCode] = useState(initCode);

    const { joinRoom, error, setError } = useContext(GlobalContext);

    const onSubmit = async e => {
        e.preventDefault();
        submitForm();  
    }

    const onKeyDown = async e => {
        if (e.which===13) {
            e.target.blur();
            submitForm();  
        }
    }
    
    function submitForm() {
        if (name === '') {
            setError('Please enter your name');
            if (nameInputRef.current) {
                nameInputRef.current.focus();
            }           
            return false;
        }
        if (code === '') {
            setError('Please enter room code');
            if (codeInputRef.current) {
                codeInputRef.current.focus();
            }  
            return false;
        }
        setError(null);     
        
        trackPromise(
            joinRoom(name, code)
        );
    }

    return (
        <form className="start-game" onSubmit={onSubmit}>
            <div className="error">{ error }</div>
            <div className="form-control">
                <label htmlFor="name">Enter your name</label>
                <input 
                    type="text"
                    ref={nameInputRef}
                    autoFocus = {name === ''}
                    className="nameInput"
                    value={name}                 
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="form-control">
                <label htmlFor="code">Enter room code</label>
                <input 
                    type="text" 
                    ref={codeInputRef}
                    autoFocus = {name !== '' && code === ''}
                    className="roomInput"
                    maxLength="4"
                    value={code} 
                    onKeyDown={onKeyDown}  
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
            </div>
            <button className="btn largeBtn">Join Room</button>
        </form>
    )
}
