import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";

function Profile() {

    let { id } = useParams()
    let navigate = useNavigate()
    const [username, setUsername] = useState("")
    const { authState } = useContext(AuthContext);

    useEffect(() => {
        axios.get(`http://localhost:3001/auth/basicinfo/${id}`).then((response) => {
            setUsername(response.data.username)
        })
        //set the username and displayname of the user choosed
    }, [])
    

    return (
        <div className='profilePageContainer'>
            <div className='basicInfo'>
                <h1>Username: {username}</h1>
                {authState.username === username && (
                    <button onClick={() => {
                        navigate("/changepassword")
                    }}>Change My Password</button>
                )}
            </div>
        </div>
    )
}

export default Profile