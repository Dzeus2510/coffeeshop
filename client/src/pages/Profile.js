import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";

function Profile() {

    let { id } = useParams()
    let navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [listOfCafe, setListOfCafe] = useState([]);
    const { authState } = useContext(AuthContext);


    useEffect(() => {
        axios.get(`http://localhost:3001/auth/basicinfo/${id}`).then((response) => {
            setUsername(response.data.basicInfo.username);
            setListOfCafe(response.data.listOfCafe)
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
            <div className="postDisplay">
                {listOfCafe.map((value, key) => {
                    return (
                        <div className="post">
                            <div className="title">{value.name}</div>
                            <div className="body" onClick={() => { navigate(`/cafe/${value.id}`) }}>
                                {value.address}<br></br>
                                Owner: {(value.UserId) ? (value.User.username) : "none"}<br></br>
                                <img src={value.image === 'No Img xD' ? "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg" : (value.image)} alt={value.name} width={200} height={180}></img>
                            </div>
                            <div className="footer">
                                <a href={(value.website === 'No Website') ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : value.website} target="_blank">
                                    {(value.website === 'No Website') ? "None Web" : "Website"}
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default Profile