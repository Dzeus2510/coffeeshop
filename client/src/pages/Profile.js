import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";

function Profile() {

    let { id } = useParams()
    let navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [listOfCafes, setListOfCafes] = useState([])
    const { authState } = useContext(AuthContext);

    useEffect(() => {
        axios.get(`http://localhost:3001/auth/basicinfo/${id}`).then((response) => {
            setUsername(response.data.username)
        })
        //set the username and displayname of the user choosed

        // axios.get(`http://localhost:3001/posts/byuserId/${id}`).then((response) => {
        //     setListOfCafes(response.data)
        // })
    }, [])
    //get list of posts made by the user

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
            {/* <div className='listOfPosts'>
                {listOfPosts.map((value, key) => {
                    return (
                        <div className="post"  >
                            <div className="title">{value.title}</div>
                            <div className="body" onClick={() => { navigate(`/post/${value.id}`) }}>{value.postText}</div>
                            <div className="footer">
                                <div className="like">{value.Likes.length}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div></div> */}
        </div>
    )
}

export default Profile